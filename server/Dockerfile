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

# Run database migrations (will wait for DB in docker-compose)
# Using CMD instead of RUN so it executes at runtime and can access the DB network
CMD alembic upgrade head && python create_admin.py && python seed_data_v2.py && uvicorn src.main:app --host 0.0.0.0 --port 8000
