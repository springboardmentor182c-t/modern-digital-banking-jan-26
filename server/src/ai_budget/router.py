from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from src.database import get_db
from src.auth.router import get_current_user
from src.auth.models import User
from src.ai_budget.schemas import (
    GenerateBudgetRequest,
    AIBudgetResponse,
    BudgetRecommendation,
    PredictionAlert
)
from src.budgets.schemas import BudgetResponse
from src.ai_budget.service import (
    generate_budget_recommendations,
    save_ai_budgets,
    create_prediction_alerts
)

router = APIRouter()


@router.post("/generate-budget", response_model=AIBudgetResponse)
async def generate_budget(
    request: GenerateBudgetRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Analyze the authenticated user's transaction history and generate
    AI-driven budget recommendations for each spending category.

    If request.save is True, recommendations are persisted as Budget records
    with is_ai_generated=True.
    """
    # Generate recommendations from transaction analysis
    result = await generate_budget_recommendations(db, current_user.id)

    # Optionally persist as budget records
    if request.save and result["recommendations"]:
        now = datetime.now()
        await save_ai_budgets(
            db, current_user.id,
            result["recommendations"],
            month=now.month,
            year=now.year
        )

    # Create alerts for categories where predicted spend exceeds budget
    if result["alerts"]:
        await create_prediction_alerts(db, current_user.id, result["alerts"])

    return result


@router.post("/accept-budget", response_model=BudgetResponse)
async def accept_budget_recommendation(
    recommendation: BudgetRecommendation,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Persist a single AI recommendation as the authenticated user's budget.
    Existing budgets for the same category/month are updated.
    """
    now = datetime.now()
    saved = await save_ai_budgets(
        db,
        current_user.id,
        [recommendation.model_dump()],
        month=now.month,
        year=now.year
    )

    if not saved:
        raise HTTPException(status_code=400, detail="No recommendation was saved")

    return saved[0]


@router.get("/budget-recommendation/{user_id}", response_model=AIBudgetResponse)
async def get_budget_recommendation(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get AI budget recommendations for a specific user.
    Users can only access their own recommendations.
    """
    # Security: users can only fetch their own recommendations
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    result = await generate_budget_recommendations(db, user_id)
    return result
