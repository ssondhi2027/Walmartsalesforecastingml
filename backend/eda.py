import pandas as pd
import os

def run_eda():
    BASE_DIR = os.path.dirname(__file__)
    data_path = os.path.join(BASE_DIR, "data", "train_Walmart_ML2.csv")

    df = pd.read_csv(data_path)

    # Correct column usage
    df["Date"] = pd.to_datetime(df["Date"])

    summary = {
        "rows": int(df.shape[0]),
        "stores": int(df["Store"].nunique()),
        "departments": int(df["Dept"].nunique()),
        "date_range": [
            str(df["Date"].min()),
            str(df["Date"].max())
        ],
        "avg_sales": float(df["Weekly_Sales"].mean()),
        "holiday_weeks": int(df["IsHoliday"].sum())
    }

    return summary
