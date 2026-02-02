import pandas as pd
def run_eda(path):
    df = pd.read_csv(path)
    df['date'] = pd.to_datetime(df['date'])

    summary = {
        "rows": df.shape[0],
        "stores": df['Store'].nunique(),
        "departments": df['Dept'].nunique(),
        "date_range": [str(df['date'].min()), str(df['date'].max())],
        "avg_sales": df['weekly_sales'].mean()
    }
    return summary