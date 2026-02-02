from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split

def train_model(df):
    x = df.drop(columns=['weekly_sales', 'date'])
    y = df['weekly_sales']

    x_train, x_test, y_train, y_test = train_test_split(x, y, shuffle=False, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(x_train, y_train)
    return model, x_test, y_test