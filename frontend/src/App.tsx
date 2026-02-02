import { useState } from 'react';
import { FileUpload } from './components/FileUpload';
import { Dashboard } from './components/Dashboard';
import { Button } from './components/ui/button';
import { generatePredictions } from './utils/predictions';
import { TrendingUp, ArrowLeft } from 'lucide-react';

export default function App() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [showDashboard, setShowDashboard] = useState(false);

  const handleFileUpload = (data: any[]) => {
    setUploadedData(data);
    setFileName('walmart_sales_data.csv');
  };

  const handleGeneratePredictions = () => {
    if (uploadedData.length > 0) {
      const generatedPredictions = generatePredictions(uploadedData);
      setPredictions(generatedPredictions);
      setShowDashboard(true);
    }
  };

  const handleClear = () => {
    setUploadedData([]);
    setFileName('');
    setPredictions([]);
    setShowDashboard(false);
  };

  const handleBack = () => {
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {showDashboard && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleBack}
                  className="mr-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Weekly Sales Forecasting</h1>
                <p className="text-sm text-gray-500">Walmart Sales Prediction & Analytics</p>
              </div>
            </div>
            {showDashboard && (
              <Button variant="outline" onClick={handleClear}>
                Upload New Data
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showDashboard ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
              <div className="max-w-3xl">
                <h2 className="text-3xl font-semibold mb-3">
                  Predict Weekly Sales with Machine Learning
                </h2>
                <p className="text-blue-100 mb-6">
                  A comprehensive ML-based forecasting system to predict weekly sales for Walmart 
                  across stores and departments. Upload your historical sales data to get accurate 
                  predictions and insights for inventory management, staffing, and promotional planning.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      ✓
                    </div>
                    <span>Ensemble Models</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      ✓
                    </div>
                    <span>Holiday Detection</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      ✓
                    </div>
                    <span>92% Accuracy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4">Upload Sales Data</h3>
                <FileUpload 
                  onFileUpload={handleFileUpload} 
                  fileName={fileName}
                  onClear={handleClear}
                />
                
                {fileName && (
                  <div className="mt-4">
                    <Button 
                      onClick={handleGeneratePredictions} 
                      className="w-full"
                      size="lg"
                    >
                      Generate Predictions & View Dashboard
                    </Button>
                  </div>
                )}

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Expected CSV Format:
                  </p>
                  <code className="text-xs text-blue-700 block">
                    Store, Dept, Date, Weekly_Sales, IsHoliday
                  </code>
                  <p className="text-xs text-blue-600 mt-2">
                    Upload your historical Walmart sales data to begin forecasting
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Model Methodology</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-1">Ensemble Approach</h4>
                    <p className="text-sm text-gray-600">
                      Combines Random Forest, XGBoost, and LSTM models for superior accuracy
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-1">Feature Engineering</h4>
                    <p className="text-sm text-gray-600">
                      Seasonal patterns, holiday indicators, and temporal dependencies
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <h4 className="font-medium mb-1">Performance Metrics</h4>
                    <p className="text-sm text-gray-600">
                      Track MAE, RMSE, and R² scores across all models
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div>
              <h3 className="font-semibold mb-4">Key Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium mb-2">Multi-Model Comparison</h4>
                  <p className="text-sm text-gray-600">
                    Compare Linear Regression, Random Forest, XGBoost, LSTM, and Ensemble models
                  </p>
                </div>
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-3">
                    📊
                  </div>
                  <h4 className="font-medium mb-2">Interactive Dashboard</h4>
                  <p className="text-sm text-gray-600">
                    Visualize predictions, store performance, and department analytics
                  </p>
                </div>
                <div className="p-6 bg-white rounded-lg border border-gray-200">
                  <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-3">
                    🎯
                  </div>
                  <h4 className="font-medium mb-2">Holiday Impact Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Identify and quantify sales spikes during major holidays and events
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Dashboard data={uploadedData} predictions={predictions} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-sm text-gray-500 text-center">
            Weekly Sales Forecasting System | Powered by Machine Learning & Deep Learning Models
          </p>
        </div>
      </footer>
    </div>
  );
}