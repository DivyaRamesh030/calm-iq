FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN python -m pip install --upgrade pip && python -m pip install --no-cache-dir -r ./requirements.txt

COPY . .

# Train model at build time if not already present
RUN python -c "import os; os.makedirs('ml', exist_ok=True)"
RUN python ../ml/train_model.py 2>/dev/null || python -c "print('Model training skipped – rule-based fallback will be used')"

EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
