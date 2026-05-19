"""
AI Budget Generation Service
=============================
Core engine for analyzing transaction history and producing intelligent,
category-wise budget recommendations. All logic is deterministic and
explainable — no heavy ML frameworks required.

Key algorithms:
  - Weighted moving average for trend-aware spending estimation
  - Simple linear regression for next-month prediction
  - Z-score anomaly detection to filter spending spikes
  - Rule-based essential/discretionary classification
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from collections import defaultdict
import math

from src.transactions.models import Transaction, TransactionType
from src.accounts.models import Account
from src.budgets.models import Budget
from src.analytics.models import Alert, AlertType

# ---------------------------------------------------------------------------
# Category classification
# ---------------------------------------------------------------------------
ESSENTIAL_CATEGORIES = {
    "bills & utilities", "health", "transportation", "rent",
    "insurance", "groceries", "education", "medical"
}

def _is_essential(category: str) -> bool:
    """Check if a category is essential (needs generous buffer)."""
    return category.lower() in ESSENTIAL_CATEGORIES


# ---------------------------------------------------------------------------
# Data fetching
# ---------------------------------------------------------------------------
async def fetch_historical_transactions(
    db: AsyncSession,
    user_id: int,
    months_back: int = 6
) -> list:
    """
    Fetch all debit transactions for a user from the last `months_back` months.
    Returns raw Transaction objects joined through the user's accounts.
    """
    cutoff_date = datetime.now() - timedelta(days=months_back * 30)

    result = await db.execute(
        select(Transaction)
        .join(Account)
        .filter(
            Account.user_id == user_id,
            Transaction.txn_type == TransactionType.debit,
            Transaction.txn_date >= cutoff_date
        )
        .order_by(Transaction.txn_date)
    )
    return result.scalars().all()


async def fetch_credit_transactions(
    db: AsyncSession,
    user_id: int,
    months_back: int = 6
) -> list:
    """
    Fetch credit (income) transactions to estimate monthly income.
    """
    cutoff_date = datetime.now() - timedelta(days=months_back * 30)

    result = await db.execute(
        select(Transaction)
        .join(Account)
        .filter(
            Account.user_id == user_id,
            Transaction.txn_type == TransactionType.credit,
            Transaction.txn_date >= cutoff_date
        )
    )
    return result.scalars().all()


async def fetch_existing_budgets(
    db: AsyncSession,
    user_id: int,
    month: int,
    year: int
) -> dict:
    """
    Get existing user budgets for a given month/year as {category: Budget}.
    """
    result = await db.execute(
        select(Budget).filter(
            Budget.user_id == user_id,
            Budget.month == month,
            Budget.year == year
        )
    )
    budgets = result.scalars().all()
    return {b.category: b for b in budgets}


# ---------------------------------------------------------------------------
# Statistical computations
# ---------------------------------------------------------------------------
def group_by_category_and_month(transactions: list) -> dict:
    """
    Group transactions into: { category: { (year, month): total_amount } }
    """
    grouped = defaultdict(lambda: defaultdict(float))
    for txn in transactions:
        cat = txn.category or "Uncategorized"
        key = (txn.txn_date.year, txn.txn_date.month)
        grouped[cat][key] += float(txn.amount)
    return grouped


def compute_category_stats(category_monthly: dict) -> dict:
    """
    For a single category's monthly data { (year, month): amount },
    compute: average, standard deviation, trend direction, and monthly values.

    Returns dict with keys: avg, std, trend, monthly_values, num_months
    """
    if not category_monthly:
        return {"avg": 0, "std": 0, "trend": "stable", "monthly_values": [], "num_months": 0}

    # Sort by (year, month) to get chronological order
    sorted_months = sorted(category_monthly.keys())
    values = [category_monthly[m] for m in sorted_months]
    n = len(values)

    # Average
    avg = sum(values) / n

    # Standard deviation
    if n > 1:
        variance = sum((v - avg) ** 2 for v in values) / (n - 1)
        std = math.sqrt(variance)
    else:
        std = 0.0

    # Trend: slope of linear fit over time indices [0, 1, 2, ...]
    trend = "stable"
    if n >= 2:
        slope = _linear_slope(list(range(n)), values)
        # Consider it increasing/decreasing only if slope > 5% of avg
        threshold = avg * 0.05 if avg > 0 else 10
        if slope > threshold:
            trend = "increasing"
        elif slope < -threshold:
            trend = "decreasing"

    return {
        "avg": round(avg, 2),
        "std": round(std, 2),
        "trend": trend,
        "monthly_values": values,
        "num_months": n
    }


def detect_anomalies(values: list, threshold: float = 2.0) -> list:
    """
    Z-score based anomaly detection.
    Returns indices of values that are > threshold standard deviations above mean.
    """
    if len(values) < 3:
        return []

    avg = sum(values) / len(values)
    std = math.sqrt(sum((v - avg) ** 2 for v in values) / (len(values) - 1))

    if std == 0:
        return []

    anomalies = []
    for i, v in enumerate(values):
        z_score = (v - avg) / std
        if z_score > threshold:
            anomalies.append(i)

    return anomalies


def predict_next_month(values: list) -> float:
    """
    Predict next month's spend.
    - If >= 3 data points: linear regression extrapolation
    - Otherwise: weighted moving average (recent months weighted 2x)
    """
    if not values:
        return 0.0

    if len(values) >= 3:
        # Linear regression: predict value at index len(values)
        x = list(range(len(values)))
        slope = _linear_slope(x, values)
        intercept = sum(values) / len(values) - slope * sum(x) / len(x)
        prediction = slope * len(values) + intercept
        # Don't predict negative spend
        return max(round(prediction, 2), 0.0)
    else:
        # Weighted moving average — recent months count double
        weights = list(range(1, len(values) + 1))  # [1, 2] or [1]
        weighted_sum = sum(v * w for v, w in zip(values, weights))
        total_weight = sum(weights)
        return max(round(weighted_sum / total_weight, 2), 0.0)


def _linear_slope(x: list, y: list) -> float:
    """
    Compute slope of best-fit line using least squares.
    slope = (n*Σxy - Σx*Σy) / (n*Σx² - (Σx)²)
    """
    n = len(x)
    if n < 2:
        return 0.0

    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_x2 = sum(xi ** 2 for xi in x)

    denominator = n * sum_x2 - sum_x ** 2
    if denominator == 0:
        return 0.0

    return (n * sum_xy - sum_x * sum_y) / denominator


def compute_confidence(num_months: int, std: float, avg: float) -> float:
    """
    Produce a confidence score (0–1) for the recommendation.

    Factors:
      - More months of data → higher confidence (max at 6+)
      - Lower coefficient of variation (std/avg) → higher confidence
    """
    # Data volume factor: 0.5 at 1 month, 1.0 at 6+ months
    data_factor = min(num_months / 6.0, 1.0)

    # Stability factor: high variance = low confidence
    if avg > 0:
        cv = std / avg  # coefficient of variation
        stability_factor = max(1.0 - cv, 0.1)  # floor at 0.1
    else:
        stability_factor = 0.5

    # Weighted combination
    confidence = 0.6 * data_factor + 0.4 * stability_factor
    return round(min(max(confidence, 0.1), 1.0), 2)


def generate_reasoning(
    category: str,
    avg: float,
    std: float,
    trend: str,
    num_months: int,
    is_essential: bool,
    anomaly_count: int,
    predicted: float,
    recommended: float
) -> str:
    """
    Generate a short, human-readable explanation for the UI tooltip.
    """
    parts = []

    # Data basis
    parts.append(f"Based on {num_months} month{'s' if num_months > 1 else ''} of data")

    # Average
    parts.append(f"avg ₹{avg:,.0f}/mo")

    # Trend
    if trend == "increasing":
        parts.append("spending is trending up")
    elif trend == "decreasing":
        parts.append("spending is trending down")
    else:
        parts.append("spending is stable")

    # Category type
    if is_essential:
        parts.append("15% buffer added for essential category")
    else:
        parts.append("tighter limit for discretionary spending")

    # Anomalies
    if anomaly_count > 0:
        parts.append(f"{anomaly_count} spending spike{'s' if anomaly_count > 1 else ''} excluded")

    reasoning = ". ".join(parts) + "."
    return reasoning


# ---------------------------------------------------------------------------
# Main orchestrator
# ---------------------------------------------------------------------------
async def generate_budget_recommendations(
    db: AsyncSession,
    user_id: int
) -> dict:
    """
    Main entry point: analyze transaction history and produce budget recommendations.

    Returns a dict matching the AIBudgetResponse schema.
    """
    now = datetime.now()
    target_month = now.month
    target_year = now.year

    # 1. Fetch data
    debit_txns = await fetch_historical_transactions(db, user_id, months_back=6)
    credit_txns = await fetch_credit_transactions(db, user_id, months_back=6)
    existing_budgets = await fetch_existing_budgets(db, user_id, target_month, target_year)

    # 2. Estimate monthly income from credit transactions
    if credit_txns:
        total_credits = sum(float(t.amount) for t in credit_txns)
        # Count distinct months in credit transactions
        credit_months = set()
        for t in credit_txns:
            credit_months.add((t.txn_date.year, t.txn_date.month))
        estimated_income = total_credits / max(len(credit_months), 1)
    else:
        estimated_income = 0.0

    # 3. Group debit transactions by category and month
    category_monthly = group_by_category_and_month(debit_txns)

    # 4. Generate per-category recommendations
    recommendations = []
    total_recommended = 0.0
    alerts = []

    for category, monthly_data in category_monthly.items():
        stats = compute_category_stats(monthly_data)
        avg = stats["avg"]
        std = stats["std"]
        trend = stats["trend"]
        values = stats["monthly_values"]
        num_months = stats["num_months"]

        is_essential = _is_essential(category)

        # Detect anomalies and compute clean average (excluding spikes)
        anomaly_indices = detect_anomalies(values)
        if anomaly_indices:
            clean_values = [v for i, v in enumerate(values) if i not in anomaly_indices]
            if clean_values:
                clean_avg = sum(clean_values) / len(clean_values)
            else:
                clean_avg = avg
        else:
            clean_avg = avg

        # Predict next month's spend
        predicted_spend = predict_next_month(values)

        # Generate budget recommendation
        # Essential categories get a higher buffer, discretionary gets tighter control
        if is_essential:
            # Base = clean_avg + (std * 0.5), then add 15% buffer
            base = clean_avg + (std * 0.5)
            recommended_limit = base * 1.15
        else:
            # Base = clean_avg + (std * 0.2), then add 5% buffer
            base = clean_avg + (std * 0.2)
            recommended_limit = base * 1.05

        # If spending is increasing, bump up the recommendation slightly
        if trend == "increasing":
            recommended_limit = max(recommended_limit, predicted_spend * 1.1)

        recommended_limit = round(recommended_limit, 2)

        # Confidence score
        confidence = compute_confidence(num_months, std, avg)

        # Current budget for comparison
        current_budget = None
        if category in existing_budgets:
            current_budget = float(existing_budgets[category].limit_amount)

        # Reasoning
        reasoning = generate_reasoning(
            category, avg, std, trend, num_months, is_essential,
            len(anomaly_indices), predicted_spend, recommended_limit
        )

        recommendations.append({
            "category": category,
            "recommended_limit": recommended_limit,
            "confidence": confidence,
            "reasoning": reasoning,
            "current_budget": current_budget,
            "predicted_spend": round(predicted_spend, 2),
            "trend": trend,
            "avg_monthly_spend": round(avg, 2),
            "is_essential": is_essential
        })

        total_recommended += recommended_limit

        # Check for overspend alerts: predicted spend > existing budget
        if current_budget and predicted_spend > current_budget:
            alerts.append({
                "category": category,
                "predicted_spend": round(predicted_spend, 2),
                "budget_limit": current_budget,
                "message": f"Predicted {category} spend (₹{predicted_spend:,.0f}) exceeds your budget (₹{current_budget:,.0f})"
            })

    # 5. Add an alert if total recommendations exceed estimated income
    if estimated_income > 0 and total_recommended > estimated_income:
        alerts.append({
            "category": "Overall Budget",
            "predicted_spend": total_recommended,
            "budget_limit": estimated_income,
            "message": f"Danger: Your total recommended budget (₹{total_recommended:,.0f}) exceeds your estimated monthly income (₹{estimated_income:,.0f}). Consider reducing discretionary spending."
        })

    # Sort recommendations by spend (highest first) for UI prominence
    recommendations.sort(key=lambda r: r["recommended_limit"], reverse=True)

    return {
        "recommendations": recommendations,
        "total_recommended": total_recommended,
        "estimated_income": round(estimated_income, 2),
        "alerts": alerts
    }


async def save_ai_budgets(
    db: AsyncSession,
    user_id: int,
    recommendations: list,
    month: int,
    year: int
) -> list:
    """
    Persist AI recommendations as Budget records.
    Updates existing budgets or creates new ones with is_ai_generated=True.
    """
    saved = []
    for rec in recommendations:
        # Check if budget already exists for this category/month/year
        result = await db.execute(
            select(Budget).filter(
                Budget.user_id == user_id,
                Budget.category == rec["category"],
                Budget.month == month,
                Budget.year == year
            )
        )
        existing = result.scalars().first()

        if existing:
            existing.limit_amount = rec["recommended_limit"]
            existing.is_ai_generated = True
            existing.confidence_score = rec["confidence"]
            saved.append(existing)
        else:
            new_budget = Budget(
                user_id=user_id,
                month=month,
                year=year,
                category=rec["category"],
                limit_amount=rec["recommended_limit"],
                spent_amount=0.0,
                is_ai_generated=True,
                confidence_score=rec["confidence"]
            )
            db.add(new_budget)
            saved.append(new_budget)

    await db.commit()
    return saved


async def create_prediction_alerts(
    db: AsyncSession,
    user_id: int,
    alerts_data: list
) -> None:
    """
    Create Alert records for categories where predicted spend > budget.
    Hooks into the existing Alerts module.
    """
    for alert_data in alerts_data:
        new_alert = Alert(
            user_id=user_id,
            type=AlertType.budget_prediction,
            message=alert_data["message"],
            is_read=False
        )
        db.add(new_alert)

    if alerts_data:
        await db.commit()
