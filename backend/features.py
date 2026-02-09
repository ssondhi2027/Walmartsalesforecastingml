import pandas as pd
import numpy as np

def create_features(df):
    df["Date"] = pd.to_datetime(df["Date"])
    df = df.sort_values(by=["Store", "Dept", "Date"])
    
    # Remove negative sales for log transformation
    df = df[df["Weekly_Sales"] > 0].copy()

    # Time Features
    df["year"] = df["Date"].dt.year
    df["month"] = df["Date"].dt.month
    df["week"] = df["Date"].dt.isocalendar().week.astype(int)
    df["day"] = df["Date"].dt.day

    # Log-transformed Lag features (Crucial for 100% match)
    for lag in [1, 2, 3, 52]:
        df[f"lag_{lag}"] = df.groupby(["Store", "Dept"])["Weekly_Sales"].shift(lag)
        df[f"lag_{lag}"] = np.log1p(df[f"lag_{lag}"])

    if "IsHoliday" in df.columns:
        df["IsHoliday"] = df["IsHoliday"].astype(int)

    df["Weekly_Sales_log"] = np.log1p(df["Weekly_Sales"])
    return df.dropna()

def calculate_store_stats(df):
    store_stats = df.groupby("Store")["Weekly_Sales"].sum().reset_index()
    top_stores = store_stats.sort_values("Weekly_Sales", ascending=False).head(5)
    return [{"name": f"Store {int(r['Store'])}", "sales": round(r['Weekly_Sales'])} for _, r in top_stores.iterrows()]

def calculate_dept_stats(df):
    dept_stats = df.groupby("Dept")["Weekly_Sales"].sum().reset_index()
    top_depts = dept_stats.sort_values("Weekly_Sales", ascending=False).head(6)
    return [{"name": f"Dept {int(r['Dept'])}", "value": round(r['Weekly_Sales'])} for _, r in top_depts.iterrows()]