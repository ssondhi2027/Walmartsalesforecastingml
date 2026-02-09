// ---------------------------------
import { useState } from "react";
import { FileUpload } from "./components/FileUpload";
import { Dashboard } from "./components/Dashboard";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { TrendingUp, ArrowLeft } from "lucide-react";
import { trainModel } from "./utils/forecastService";

export default function App() {
  const [uploadedData, setUploadedData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");

  const [metrics, setMetrics] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);

  const [storeData, setStoreData] = useState<any[]>([]);
  const [deptData, setDeptData] = useState<any[]>([]);
  const [holidayImpact, setHolidayImpact] = useState<any[]>([]);
  const [forecastHistory, setForecastHistory] = useState<any[]>([]);
  const [forecast, setForecast] = useState<any[]>([]);
  const [arimaMetrics, setArimaMetrics] = useState<any | null>(null);

  const [showDashboard, setShowDashboard] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [scope, setScope] = useState<"overall" | "store" | "department">(
    "overall"
  );
  const [storeId, setStoreId] = useState("");
  const [deptId, setDeptId] = useState("");

  const handleFileUpload = (data: any[], file: File) => {
    setUploadedData(data);
    setFile(file);
    setFileName(file.name);
  };

  const handleGeneratePredictions = async () => {
    if (!file) return;

    try {
      setLoading(true);
      setError(null);

      if (scope === "store" && !storeId) {
        setError("Please enter a store id.");
        setLoading(false);
        return;
      }
      if (scope === "department" && !deptId) {
        setError("Please enter a department id.");
        setLoading(false);
        return;
      }

      const result = await trainModel(file, {
        scope,
        storeId: scope === "store" ? Number(storeId) : undefined,
        deptId: scope === "department" ? Number(deptId) : undefined,
        horizon: 12,
      });

      setMetrics(result.metrics || []);
      setPredictions(result.predictions || []);
      setStoreData(result.storeData || []);
      setDeptData(result.deptData || []);
      setHolidayImpact(result.holidayImpact || []);
      setForecastHistory(result.forecastHistory || []);
      setForecast(result.forecast || []);
      setArimaMetrics(result.arimaMetrics || null);

      setShowDashboard(true);
    } catch (error) {
      console.error("Training failed:", error);
      if (error instanceof Error && error.message) {
        setError(error.message);
      } else {
        setError("Training failed. Please check the backend logs.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setUploadedData([]);
    setFile(null);
    setFileName("");
    setPredictions([]);
    setMetrics([]);
    setForecastHistory([]);
    setForecast([]);
    setArimaMetrics(null);
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {showDashboard && (
              <Button variant="ghost" onClick={() => setShowDashboard(false)}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-white" />
            </div>
            <h1 className="text-2xl font-semibold">
              Weekly Sales Forecasting
            </h1>
          </div>

          {showDashboard && (
            <Button variant="outline" onClick={handleClear}>
              Upload New Data
            </Button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {!showDashboard ? (
          <>
            <FileUpload
              onFileUpload={handleFileUpload}
              fileName={fileName}
              onClear={handleClear}
            />

            <Card className="mt-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Forecast Scope</Label>
                  <Select
                    value={scope}
                    onValueChange={(value: string) =>
                      setScope(value as "overall" | "store" | "department")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select scope" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="overall">Overall</SelectItem>
                      <SelectItem value="store">By Store</SelectItem>
                      <SelectItem value="department">By Department</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Store Id</Label>
                  <Input
                    value={storeId}
                    onChange={(e) => setStoreId(e.target.value)}
                    placeholder="e.g., 1"
                    disabled={scope !== "store"}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Department Id</Label>
                  <Input
                    value={deptId}
                    onChange={(e) => setDeptId(e.target.value)}
                    placeholder="e.g., 1"
                    disabled={scope !== "department"}
                  />
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3">
                Forecast horizon is fixed at 12 weeks.
              </p>
            </Card>

            {error && (
              <p className="text-sm text-red-600 mt-3">{error}</p>
            )}

            {fileName && (
              <Button
                onClick={handleGeneratePredictions}
                className="mt-4 w-full"
                size="lg"
                disabled={loading}
              >
                {loading
                  ? "Training model..."
                  : "Generate Predictions & View Dashboard"}
              </Button>
            )}
          </>
        ) : (
          <Dashboard
              metrics={metrics}
              predictions={predictions}
              arimaMetrics={arimaMetrics}
              forecastHistory={forecastHistory}
              forecast={forecast}
              storeData={storeData}
              deptData={deptData}
              holidayImpact={holidayImpact}
          />
        )}
      </main>
    </div>
  );
}
