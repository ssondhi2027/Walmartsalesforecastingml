from fastapi import FastAPI
import pandas as pd
from features import create_features
from model import train_model
from metrics import evaluate


app = FastAPI()
@app.post("/eda")
def eda():
    from eda import run_eda
    summary = run_eda('data/train_Walmart_ML2.csv')

@app.post("/train")
def train():
    df = pd.read_csv('data/train_Walmart_ML2.csv')
    df = create_features(df)

    model, x_test, y_test = train_model(df)
    predictions = model.predict(x_test)

    return evaluate(y_test, predictions)