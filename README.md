
  # Weekly Sales Forecasting App

  End-to-end Walmart weekly sales forecasting with a FastAPI backend and a Vite React frontend.

  ## Prerequisites

  - Python 3.10+ (recommended)
  - Node.js 18+

  ## Setup

  1. Create a virtual environment and install backend dependencies:
     - `cd backend`
     - `python -m venv venv`
     - `venv\\Scripts\\activate`
     - `pip install -r requirements.txt`

  2. Install frontend dependencies:
     - `cd ..\\frontend`
     - `npm i`

  3. Copy env template and adjust if needed:
     - `copy ..\\.env.example ..\\.env`

  ## Run

  1. Start backend:
     - `cd backend`
     - `venv\\Scripts\\activate`
     - `uvicorn app:app --reload`

  2. Start frontend:
     - `cd ..\\frontend`
     - `npm run dev`

  ## Environment Variables

  - `DATA_PATH`: CSV path for residual/scatter endpoints
  - `LOG_LEVEL`: Logging level (e.g., INFO)
  - `CORS_ORIGINS`: Comma-separated list of allowed frontend origins
  - `VITE_API_URL`: Backend base URL for the frontend

  ## Notes

  - Upload `backend/data/train_Walmart_ML2.csv` (or your own CSV) from the UI.
  - The `/train` endpoint trains ARIMA and returns a 12-week forecast.

  ## Repo Cleanup Checklist

  - Ensure `node_modules/` is removed from git tracking and ignored.
  - Ensure `backend/venv/` (or any venv) is removed from git tracking and ignored.
  - Remove `__pycache__/` artifacts from git tracking if they were ever committed.
  - Verify `.env` files are not tracked and only `.env.example` is committed.
  - Confirm no large datasets are committed unless intended.
  
