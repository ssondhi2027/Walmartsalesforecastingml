import pandas as pd
import numpy as np


def exponential_smoothing(series, alpha=0.2):
    result = [series.iloc[0]]
    for n in range(1, len(series)):
        result.append(alpha * series.iloc[n] + (1 - alpha) * result[n - 1])
    return result


def get_residuals(df, store, dept, alpha=0.2):
    # filter store & dept
    df = df[(df["Store"] == store) & (df["Dept"] == dept)].copy()
    df = df.sort_values("Date")

    # naive prediction: previous week's sales
    df["Predicted"] = (
        df.groupby(["Store", "Dept"])["Weekly_Sales"]
          .shift(1)
          .ffill()
          .fillna(0)
    )

    # residuals
    df["residual"] = df["Weekly_Sales"] - df["Predicted"]

    # train / validation split
    split = int(len(df) * 0.8)
    train = df.iloc[:split]
    valid = df.iloc[split:]

    # smoothing
    smoothed_train = exponential_smoothing(train["residual"], alpha)

    last_smoothed = smoothed_train[-1]
    forecast_input = pd.concat(
        [pd.Series([last_smoothed]), valid["residual"]]
    )
    smoothed_forecast = exponential_smoothing(forecast_input, alpha)[1:]

    return {
        "trainResiduals": [
            {"date": d.strftime("%Y-%m-%d"), "value": float(v)}
            for d, v in zip(train["Date"], train["residual"])
        ],
        "validResiduals": [
            {"date": d.strftime("%Y-%m-%d"), "value": float(v)}
            for d, v in zip(valid["Date"], valid["residual"])
        ],
        "smoothedTrain": [
            {"date": d.strftime("%Y-%m-%d"), "value": float(v)}
            for d, v in zip(train["Date"], smoothed_train)
        ],
        "smoothedForecast": [
            {"date": d.strftime("%Y-%m-%d"), "value": float(v)}
            for d, v in zip(valid["Date"], smoothed_forecast)
        ],
    }
