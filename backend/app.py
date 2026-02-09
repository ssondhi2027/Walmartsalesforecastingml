import logging
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from residuals import get_residuals
import pandas as pd
import os
from typing import Optional

from features import (
    create_features,
    calculate_store_stats,
    calculate_dept_stats
)
from model import train_models, train_arima_forecast
from eda import run_eda

# ------------------------------------------------------------------------------
# App setup
# ------------------------------------------------------------------------------
app = FastAPI(title="Walmart Sales Forecasting API")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.getenv("DATA_PATH", os.path.join(BASE_DIR, "data", "train_Walmart_ML2.csv"))

logging.basicConfig(level=os.getenv("LOG_LEVEL", "INFO"))
logger = logging.getLogger("walmart-forecasting")


def _parse_origins() -> list[str]:
    env_origins = os.getenv("CORS_ORIGINS")
    if env_origins:
        return [o.strip() for o in env_origins.split(",") if o.strip()]
    return [
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
    ]


def _validate_columns(df: pd.DataFrame) -> None:
    required = {"Store", "Dept", "Date", "Weekly_Sales"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(
            status_code=400,
            detail=f"Missing required columns: {', '.join(sorted(missing))}",
        )


def _normalize_scope(scope: str) -> str:
    scope = scope.strip().lower()
    if scope in {"overall", "all"}:
        return "overall"
    if scope in {"store", "stores"}:
        return "store"
    if scope in {"dept", "department", "departments"}:
        return "department"
    raise HTTPException(status_code=400, detail="Invalid scope. Use overall, store, or department.")

# ------------------------------------------------------------------------------
# CORS (Vite frontend)
# ------------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=_parse_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Health check (optional but useful)
# ------------------------------------------------------------------------------
@app.get("/")
def health_check():
    return {"status": "API is running"}

# ------------------------------------------------------------------------------
# EDA endpoint
# ------------------------------------------------------------------------------
@app.post("/eda")
def eda():
    return run_eda()

# ------------------------------------------------------------------------------
# TRAIN endpoint (triggered by frontend)
# ------------------------------------------------------------------------------

@app.post("/train")
async def train(
    file: UploadFile = File(...),
    scope: str = Form("overall"),
    store_id: Optional[int] = Form(None),
    dept_id: Optional[int] = Form(None),
    horizon: int = Form(12),
):
    """
    Receives CSV from frontend, trains models, returns dashboard payload
    """

    if horizon < 1 or horizon > 52:
        raise HTTPException(status_code=400, detail="Horizon must be between 1 and 52.")

    scope = _normalize_scope(scope)

    try:
        df_raw = pd.read_csv(file.file)
    except Exception as exc:
        logger.exception("Failed to read CSV.")
        raise HTTPException(status_code=400, detail="Invalid CSV file.") from exc

    _validate_columns(df_raw)

    if scope == "store" and store_id is None:
        raise HTTPException(status_code=400, detail="store_id is required for store scope.")
    if scope == "department" and dept_id is None:
        raise HTTPException(status_code=400, detail="dept_id is required for department scope.")

    if scope == "store" and store_id not in set(df_raw["Store"].unique()):
        raise HTTPException(status_code=404, detail="store_id not found in data.")
    if scope == "department" and dept_id not in set(df_raw["Dept"].unique()):
        raise HTTPException(status_code=404, detail="dept_id not found in data.")

    if len(df_raw) > 150_000:
        df_sampled = df_raw.sample(n=150_000, random_state=42)
    else:
        df_sampled = df_raw

    processed_df = create_features(df_sampled)

    results, forecast_df = train_models(processed_df)

    try:
        arima_metrics, history_df, arima_forecast_df = train_arima_forecast(
            df_raw,
            scope=scope,
            store_id=store_id,
            dept_id=dept_id,
            horizon=horizon,
        )
    except ValueError as exc:
        logger.warning("ARIMA training failed: %s", exc)
        arima_metrics, history_df, arima_forecast_df = None, pd.DataFrame(), pd.DataFrame()

    def calculate_holiday_impact(df):
        if "IsHoliday" not in df.columns:
            return []

        holiday_sales = df[df["IsHoliday"] == 1]["Weekly_Sales"].mean()
        normal_sales = df[df["IsHoliday"] == 0]["Weekly_Sales"].mean()
        if normal_sales == 0:
            lift = 0
        else:
            lift = round(((holiday_sales - normal_sales) / normal_sales) * 100, 2)
        return [{
            "holiday": "Holiday weeks",
            "lift": lift,
            "sales": round(holiday_sales),
        }]

    return {
        "status": "success",
        "metrics": [
            {"model": name, **metrics}
            for name, metrics in results.items()
        ],
        "arimaMetrics": arima_metrics,
        "forecastScope": scope,
        "forecastHistory": history_df.to_dict(orient="records"),
        "forecast": arima_forecast_df.to_dict(orient="records"),
        "predictions": (
            forecast_df
            .groupby("week", as_index=False)
            .agg({"actual": "mean", "predicted": "mean"})
            .tail(50)
            .to_dict(orient="records")
        ),
        "storeData": calculate_store_stats(df_raw),
        "deptData": calculate_dept_stats(df_raw),
        "holidayImpact": calculate_holiday_impact(processed_df),
    }

# ------------------------------------------------------------------------------
# RESIDUALS endpoint
# ------------------------------------------------------------------------------

@app.get("/residuals")
def residuals(
    store: int,
    dept: int,
    alpha: float = 0.2
):
    df = pd.read_csv(DATA_PATH)

    # make sure Date is datetime
    df["Date"] = pd.to_datetime(df["Date"])

    # ⚠️ assumes model predictions already exist
    # if not, replace with trained predictions
    if "Predicted" not in df.columns:
        df["Predicted"] = df["Weekly_Sales"]  # temporary fallback

    return get_residuals(df, store, dept, alpha)

# ------------------------------------------------------------------------------
# Run Scatter
# ------------------------------------------------------------------------------
@app.get("/scatter")
def scatter_data(store: int, dept: int):
    df = pd.read_csv(DATA_PATH)
    df["Date"] = pd.to_datetime(df["Date"])

    # naive prediction (same logic as residuals)
    df["Predicted"] = (
        df.groupby(["Store", "Dept"])["Weekly_Sales"]
        .shift(1)
        .ffill()
        .fillna(0)
    )

    df = df[(df["Store"] == store) & (df["Dept"] == dept)]

    return {
        "points": [
            {
                "actual": float(a),
                "predicted": float(p)
            }
            for a, p in zip(df["Weekly_Sales"], df["Predicted"])
        ]
    }

@app.get("/weekly-sales-per-store")
def weekly_sales_per_store():
    df = pd.read_csv(DATA_PATH)
    grouped = (
        df.groupby("Store")["Weekly_Sales"]
        .agg(
            avg_sales="mean",
            min_sales="min",
            max_sales="max",
            total_sales="sum"
        )
        .reset_index()
    )

    return grouped.round(2).to_dict(orient="records")

@app.get("/weekly-sales-per-dept")
def weekly_sales_per_dept():
    df = pd.read_csv(DATA_PATH)
    grouped = (
        df.groupby("Dept")["Weekly_Sales"]
        .agg(
            avg_sales="mean",
            min_sales="min",
            max_sales="max",
            total_sales="sum"
        )
        .reset_index()
    )

    return grouped.round(2).to_dict(orient="records")

# ------------------------------------------------------------------------------
# Run locally
# ------------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
