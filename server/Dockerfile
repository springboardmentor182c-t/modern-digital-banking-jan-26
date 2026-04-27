FROM python:3.10-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Copy requirements
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY . .

CMD python wait_for_db.py && alembic upgrade head && python create_admin.py && python seed_data_v2.py && uvicorn src.main:app --host 0.0.0.0 --port 8000
