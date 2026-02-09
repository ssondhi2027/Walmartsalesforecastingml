import numpy as np
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

def evaluate(y_true, y_pred, log_target=True):
    # Convert log predictions back to actual dollars for the UI
    if log_target:
        y_true = np.expm1(y_true)
        y_pred = np.expm1(y_pred)
    
    # Ensure no negative sales (impossible in reality)
    y_pred = np.maximum(y_pred, 0)

    return {
        "mae": round(float(mean_absolute_error(y_true, y_pred)), 2),
        "rmse": round(float(np.sqrt(mean_squared_error(y_true, y_pred))), 2),
        "r2": round(float(r2_score(y_true, y_pred)), 3)
    }