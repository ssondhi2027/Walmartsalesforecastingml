/// <reference types="vite/client" />

export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";



/**
 * Fetch evaluation metrics from ML backend
 */
// export async function fetchMetrics() {
//   const res = await fetch(`${API_URL}/train`);

//   if (!res.ok) {
//     throw new Error("Failed to fetch ML metrics");
//   }

//   return res.json();
// }

// export async function fetchMetrics(data = {}) {
//   const res = await fetch(`${API_URL}/train`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify(data), // send request body if needed
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch ML metrics");
//   }

//   return res.json();
// }


/**
 * (Future) Send uploaded CSV data for prediction
//  */
// export async function fetchPredictions(data: any[]) {
//   const res = await fetch(`${API_URL}/forecast`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify(data)
//   });

//   if (!res.ok) {
//     throw new Error("Failed to fetch predictions");
//   }

//   return res.json();
// }

// export async function fetchMetrics() {
//   const res = await fetch(`${API_URL}/train`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json" },
//     body: JSON.stringify({}), // empty body to satisfy backend
//   });

//   if (!res.ok) throw new Error("Failed to fetch ML metrics");
//   return res.json();
// }

export type TrainOptions = {
  scope: "overall" | "store" | "department";
  storeId?: number;
  deptId?: number;
  horizon?: number;
};

export async function trainModel(file: File, options: TrainOptions) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("scope", options.scope);
  formData.append("horizon", String(options.horizon ?? 12));
  if (options.storeId !== undefined) {
    formData.append("store_id", String(options.storeId));
  }
  if (options.deptId !== undefined) {
    formData.append("dept_id", String(options.deptId));
  }

  const response = await fetch(`${API_URL}/train`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let details = "Training failed";
    try {
      const text = await response.text();
      if (text) details = text;
    } catch {
      // ignore
    }
    throw new Error(details);
  }

  return response.json();
}

export async function fetchTrainResults() {
  const response = await fetch(`${API_URL}/train`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Training failed");
  }

  return response.json();
}
