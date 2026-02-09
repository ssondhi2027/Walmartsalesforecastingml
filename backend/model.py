from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
import xgboost as xgb
from metrics import evaluate
import numpy as np
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.neural_network import MLPRegressor
from statsmodels.tsa.statespace.sarimax import SARIMAX
from typing import Optional, Tuple

def train_models(df):
    # Prepare data
    feature_cols = [c for c in df.columns if c not in ["Weekly_Sales", "Weekly_Sales_log", "Date"]]
    X = df[feature_cols]
    y = df["Weekly_Sales_log"]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, shuffle=False)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)


    
    # 1. Random Forest
    rf = RandomForestRegressor(n_estimators=20, max_depth=10, n_jobs=-1).fit(X_train_scaled, y_train)

    # 3. DNN (Deep Neural Network)
    dnn = MLPRegressor(hidden_layer_sizes=(128, 64, 32), max_iter=500).fit(X_train_scaled, y_train)

    # Create one dictionary for all results
    results = {
        "Random Forest": evaluate(y_test, rf.predict(X_test_scaled)),
        "DNN": evaluate(y_test, dnn.predict(X_test_scaled))
    }

    # Prepare forecast data for the UI chart
    best_preds = dnn.predict(X_test_scaled)
    forecast_df = pd.DataFrame({
        "week": df.loc[X_test.index, "week"],
        "actual": np.expm1(y_test),
        "predicted": np.expm1(best_preds)
    })

    # Fix: Returns exactly 2 objects
    return results, forecast_df


def _aggregate_series(
    df: pd.DataFrame,
    scope: str,
    store_id: Optional[int],
    dept_id: Optional[int],
) -> pd.Series:
    df = df.copy()
    df["Date"] = pd.to_datetime(df["Date"])

    if scope == "store":
        df = df[df["Store"] == store_id]
    elif scope == "department":
        df = df[df["Dept"] == dept_id]

    series = (
        df.groupby("Date")["Weekly_Sales"]
        .sum()
        .sort_index()
        .asfreq("W-FRI")
    )

    # Fill missing weeks with zeros to keep the frequency stable
    series = series.fillna(0.0)
    return series


def _fit_arima(series: pd.Series) -> SARIMAX:
    n = len(series)

    # Data-aware seasonal choice: require enough history and clear yearly seasonality signal.
    seasonal_lag = 52
    seasonal_min_points = 156  # 3 years of weekly data
    seasonal_strength = 0.0
    if n >= seasonal_lag * 2:
        seasonal_strength = float(series.autocorr(lag=seasonal_lag) or 0.0)

    use_seasonal = n >= seasonal_min_points and seasonal_strength >= 0.3

    if use_seasonal:
        return SARIMAX(
            series,
            order=(1, 1, 1),
            seasonal_order=(1, 1, 1, seasonal_lag),
            enforce_stationarity=False,
            enforce_invertibility=False,
        ).fit(disp=False)

    return SARIMAX(
        series,
        order=(1, 1, 1),
        enforce_stationarity=False,
        enforce_invertibility=False,
    ).fit(disp=False)


def train_arima_forecast(
    df: pd.DataFrame,
    scope: str,
    store_id: Optional[int],
    dept_id: Optional[int],
    horizon: int = 12,
) -> Tuple[Optional[dict], pd.DataFrame, pd.DataFrame]:
    series = _aggregate_series(df, scope, store_id, dept_id)

    if len(series) < max(20, horizon + 5):
        raise ValueError("Not enough data to train ARIMA model.")

    metrics = None
    if len(series) >= horizon * 3:
        train = series.iloc[:-horizon]
        test = series.iloc[-horizon:]
        model = _fit_arima(train)
        preds = model.forecast(steps=horizon)
        preds = preds.clip(lower=0.0)
        metrics = evaluate(test.values, preds.values, log_target=False)
    else:
        model = _fit_arima(series)

    forecast = model.forecast(steps=horizon).clip(lower=0.0)

    history = series.tail(52).reset_index()
    history.columns = ["date", "actual"]

    forecast_df = forecast.reset_index()
    forecast_df.columns = ["date", "forecast"]

    return metrics, history, forecast_df
