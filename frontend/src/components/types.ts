export interface Metric {
  model: string;
  mae: number;
  rmse: number;
  r2: number;
}

/**
 * Prediction for a single date
 * - actual: present only for historical data
 * - predicted: always present
 */
export interface Prediction {
  date: string;        // ISO date string from backend (YYYY-MM-DD)
  actual?: number | null;
  predicted: number;
}

export interface StoreData {
  name: string;        // e.g. "Store 1"
  sales: number;      // total sales
}

export interface DeptData {
  name: string;        // e.g. "Dept 5"
  value: number;       // total sales
}

export interface HolidayImpact {
  holiday: string;     // e.g. "Thanksgiving"
  lift: number;        // percentage uplift
  sales: number;       // average holiday sales
}
