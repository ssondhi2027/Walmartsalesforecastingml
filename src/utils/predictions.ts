// Generate mock predictions based on uploaded data
export function generatePredictions(data: any[]): any[] {
  // Parse and aggregate data by week
  const weeklyData = new Map<string, number>();
  
  data.forEach(record => {
    const date = record.Date || '';
    const sales = parseFloat(record.Weekly_Sales || '0');
    
    if (date && sales) {
      const existing = weeklyData.get(date) || 0;
      weeklyData.set(date, existing + sales);
    }
  });
  
  // Convert to array and sort
  const sortedData = Array.from(weeklyData.entries())
    .map(([date, sales]) => ({ date, sales }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 52); // Take up to 52 weeks
  
  // Generate predictions with realistic variance
  const predictions = sortedData.map((item, index) => {
    // Add some realistic prediction variance
    const baseVariance = item.sales * 0.05; // 5% base variance
    const seasonalFactor = Math.sin((index / 52) * 2 * Math.PI) * 0.1; // Seasonal pattern
    const trend = index * 500; // Slight upward trend
    
    const predicted = item.sales + 
      (Math.random() - 0.5) * baseVariance + 
      item.sales * seasonalFactor + 
      trend;
    
    return {
      week: `W${index + 1}`,
      date: item.date,
      actual: Math.round(item.sales),
      predicted: Math.round(predicted),
      error: Math.round(Math.abs(item.sales - predicted))
    };
  });
  
  return predictions;
}

// Calculate metrics
export function calculateMetrics(predictions: any[]) {
  const mae = predictions.reduce((sum, p) => sum + p.error, 0) / predictions.length;
  const mse = predictions.reduce((sum, p) => sum + Math.pow(p.error, 2), 0) / predictions.length;
  const rmse = Math.sqrt(mse);
  
  const actualMean = predictions.reduce((sum, p) => sum + p.actual, 0) / predictions.length;
  const totalSS = predictions.reduce((sum, p) => sum + Math.pow(p.actual - actualMean, 2), 0);
  const residualSS = predictions.reduce((sum, p) => sum + Math.pow(p.error, 2), 0);
  const r2 = 1 - (residualSS / totalSS);
  
  return {
    mae: Math.round(mae),
    rmse: Math.round(rmse),
    r2: r2.toFixed(3)
  };
}
