# calm-IQ

calm-IQ is a full-stack stress monitoring and prediction app. Users can register, log lifestyle data, receive a stress score and level, and view trends over time.

## Live Links

- Backend: https://calm-iq.onrender.com
- API Docs: https://calm-iq.onrender.com/docs
- Frontend: https://calm-iq.vercel.app

## Tech Stack

- Frontend: React, Vite, Axios
- Backend: FastAPI, Uvicorn, SQLAlchemy
- Database: PostgreSQL
- Deployment: Render for backend, Vercel for frontend
- ML: Scikit-learn-based stress prediction with a rule-based fallback in production

## Project Structure

- `backend/` - FastAPI application, database models, routes, services
- `frontend/` - React application UI
- `ml/` - Dataset, training script, and trained model artifact
- `docker-compose.yml` - Local multi-service setup

## Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL

### Backend Setup

1. Open a terminal in the repo root.
2. Create and activate a virtual environment.
3. Install backend dependencies.
4. Set environment variables.
5. Start the FastAPI server.

Example:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
$env:DATABASE_URL="postgresql://postgres:postgres@localhost:5432/calmiq"
$env:CORS_ORIGINS="http://localhost:3000,http://localhost:5173"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Open a terminal in the `frontend/` folder.
2. Install dependencies.
3. Configure the API base URL.
4. Start the Vite dev server.

Example:

```powershell
cd frontend
npm install
$env:VITE_API_BASE_URL="http://localhost:8000/api"
npm run dev
```

### Docker Setup

You can also run the app with Docker Compose:

```powershell
docker compose up --build
```

## Environment Variables

### Backend

- `DATABASE_URL` - PostgreSQL connection string
- `CORS_ORIGINS` - Comma-separated allowed frontend origins

### Frontend

- `VITE_API_BASE_URL` - Backend API base URL, for example `https://calm-iq.onrender.com/api`

## API Details

### Base URL

- Local: `http://localhost:8000`
- Production: `https://calm-iq.onrender.com`

### Docs

- Swagger UI: `/docs`
- OpenAPI schema: `/openapi.json`

### Main Endpoints

#### Users

- `POST /api/users/` - Create a user (register)
- `POST /api/users/login` - Login with email and password
- `GET /api/users/` - List users
- `GET /api/users/{user_id}` - Get user by ID
- `GET /api/users/by-email/{email}` - Get user by email

#### Stress

- `POST /api/stress/predict` - Predict stress and save a log
- `GET /api/stress/user/{user_id}` - Get logs for a user
- `GET /api/stress/user/{user_id}/trend` - Get trend data
- `GET /api/stress/user/{user_id}/stats` - Get summary stats
- `DELETE /api/stress/{log_id}` - Delete a log

### Sample Request: Create User

```json
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "Demo@123",
  "age": 22,
  "occupation": "Student"
}
```

### Sample Request: Login

```json
{
  "email": "demo@example.com",
  "password": "Demo@123"
}
```

### Sample Request: Predict Stress

```json
{
  "user_id": 1,
  "inputs": {
    "sleep_duration": 6.5,
    "work_hours": 9,
    "mood_level": 2,
    "screen_time": 7,
    "physical_activity": 20,
    "heart_rate": 84,
    "spo2": 98
  }
}
```

## ML Model Explanation

The stress prediction pipeline uses these input features:

- Sleep duration
- Work hours
- Mood level
- Screen time
- Physical activity
- Heart rate
- SpO2

The prediction output contains:

- Stress score
- Stress level: Low, Medium, or High
- Summary
- Factors
- Recommendations

### Models Tried and Performance

The following regression models were evaluated in `ml/train_model.py`:

| Model | R2 Score | MSE |
|---|---:|---:|
| Linear Regression | 0.5802 | 57.9697 |
| Decision Tree Regressor | 0.5497 | 62.1722 |
| Random Forest Regressor | 0.5641 | 60.1943 |
| Gradient Boosting Regressor | 0.5865 | 57.0993 |
| SVR | 0.5860 | 57.1588 |
| KNN Regressor | 0.5097 | 67.6990 |

### Final Model Used

- Selected model: **Gradient Boosting Regressor**
- Selection criteria: highest R2 score from the evaluated models
- Saved artifact: `ml/stress_model.pkl`


## System Architecture

1. The user interacts with the React frontend hosted on Vercel.
2. The frontend sends requests to the FastAPI backend hosted on Render.
3. The backend validates requests, stores users and logs in PostgreSQL, and generates predictions.
4. The backend returns stress results, summaries, factors, and recommendations to the frontend.

### Architecture Flow

```text
User -> Vercel Frontend -> Render FastAPI Backend -> PostgreSQL Database
                                |
                                +-> Stress prediction service
```

## Test Data

### Test User

- Email: `demo@example.com`
- Password: `Demo@123`

### Test Flow

1. Create a user with the sample request above.
2. Login with the sample login request above.
3. Use the returned `user_id` for stress prediction.
4. Fetch logs with `GET /api/stress/user/{user_id}`.
5. Check trend and stats endpoints.

