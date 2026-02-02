import pandas as pd

def create_features(df):
    df['date'] = pd.to_datetime(df['date']),
    df['year'] = df['date'].dt.year
    df['month'] = df['date'].dt.month
    df['week'] = df['date'].dt.isocalendar().week

    df = df.sort_values('date')

    # Lag features
    df['lag_1'] = df['weekly_sales'].shift(1)
    df['lag_4'] = df['weekly_sales'].shift(4)

    # Rolling  features
    df['rolling_mean_4'] = df['weekly_sales'].rolling(4).mean()
    df['rolling_std_4'] = df['weekly_sales'].rolling(4).std()

    df = df.dropna()

