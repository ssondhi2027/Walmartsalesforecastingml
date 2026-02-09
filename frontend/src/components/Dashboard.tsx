import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { Badge } from "./ui/badge";
import { HolidayImpact } from "./types";
import { API_URL } from "../utils/forecastService";

interface DashboardProps {
  metrics: any[];
  predictions: any[];
  arimaMetrics: { mae: number; rmse: number; r2: number } | null;
  forecastHistory: { date: string; actual: number }[];
  forecast: { date: string; forecast: number }[];
  storeData: any[];
  deptData: any[];
  holidayImpact: HolidayImpact[];
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

type PieData = {
  name: string;
  value: number;
};

export function Dashboard({
  metrics,
  predictions,
  arimaMetrics,
  forecastHistory,
  forecast,
  storeData,
  deptData,
  holidayImpact,
}: DashboardProps) {
  void predictions;
  /* ================= RESIDUALS ================= */
  const [residualData, setResidualData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/residuals?store=1&dept=1&alpha=0.2`)
      .then(res => res.json())
      .then(data => {
        const merged: Record<string, any> = {};

        const merge = (arr: any[], key: string) => {
          arr.forEach(d => {
            if (!merged[d.date]) merged[d.date] = { date: d.date };
            merged[d.date][key] = d.value;
          });
        };

        merge(data.trainResiduals, "trainResiduals");
        merge(data.validResiduals, "validResiduals");
        merge(data.smoothedTrain, "smoothedTrain");
        merge(data.smoothedForecast, "smoothedForecast");

        setResidualData(Object.values(merged));
      })
      .catch(console.error);
  }, []);

  /* ================= SCATTER ================= */
  const [scatterData, setScatterData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/scatter?store=1&dept=1`)
      .then(res => res.json())
      .then(json => setScatterData(json.points))
      .catch(console.error);
  }, []);

  /* ================= WEEKLY SALES PER STORE ================= */
  const [storeWeeklyStats, setStoreWeeklyStats] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/weekly-sales-per-store`)
      .then(res => res.json())
      .then(setStoreWeeklyStats)
      .catch(console.error);
  }, []);

  /* ================= DEPARTMENTS (TOP 10 PIE) ================= */
  const [deptSalesData, setDeptSalesData] = useState<PieData[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/weekly-sales-per-dept`)
      .then(res => res.json())
      .then((data: any[]) => {
        const top10 = data
          .sort((a, b) => b.total_sales - a.total_sales)
          .slice(0, 10)
          .map(d => ({
            name: `Dept ${d.Dept}`,
            value: d.total_sales,
          }));

        setDeptSalesData(top10);
      })
      .catch(console.error);
  }, []);

  /* ================= MODELS ================= */
  const modelComparison = metrics.map(m => ({
    model: m.model,
    mae: Number(m.mae),
    rmse: Number(m.rmse),
    r2: Number(m.r2),
  }));

  const maxVal =
    scatterData.length > 0
      ? Math.max(...scatterData.map(d => d.actual))
      : 0;

  const forecastSeries = [
    ...forecastHistory.map(d => ({
      date: d.date,
      actual: d.actual,
      forecast: null,
    })),
    ...forecast.map(d => ({
      date: d.date,
      actual: null,
      forecast: d.forecast,
    })),
  ];

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <Tabs defaultValue="forecast">
        <TabsList>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          <TabsTrigger value="residuals">Residuals</TabsTrigger>
          <TabsTrigger value="scatter">Actual vs Predicted</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="stores">Stores</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        {/* ================= FORECAST ================= */}
        <TabsContent value="forecast">
          <Card className="p-6">
            {forecastSeries.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={380}>
                  <LineChart data={forecastSeries}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line dataKey="actual" stroke="#3b82f6" dot={false} />
                    <Line
                      dataKey="forecast"
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
                {arimaMetrics && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    ARIMA Metrics — MAE: {arimaMetrics.mae}, RMSE: {arimaMetrics.rmse}, R2: {arimaMetrics.r2}
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No forecast data available.
              </p>
            )}
          </Card>
        </TabsContent>

        {/* ================= RESIDUALS ================= */}
        <TabsContent value="residuals">
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={420}>
              <LineChart data={residualData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line dataKey="trainResiduals" stroke="#000" dot={false} />
                <Line dataKey="validResiduals" stroke="#f59e0b" strokeDasharray="5 5" dot={false} />
                <Line dataKey="smoothedTrain" stroke="#3b82f6" strokeWidth={3} dot={false} />
                <Line dataKey="smoothedForecast" stroke="#ef4444" strokeDasharray="3 3" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ================= SCATTER ================= */}
        <TabsContent value="scatter">
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={420}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" dataKey="actual" />
                <YAxis type="number" dataKey="predicted" />
                <Tooltip />
                <ReferenceLine
                  stroke="red"
                  strokeDasharray="5 5"
                  segment={[
                    { x: 0, y: 0 },
                    { x: maxVal, y: maxVal },
                  ]}
                />
                <Scatter data={scatterData} fill="#3b82f6" />
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ================= STORES ================= */}
        <TabsContent value="stores">
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={storeWeeklyStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Store" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avg_sales" fill="#3b82f6" />
                <Bar dataKey="max_sales" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ================= MODELS ================= */}
        <TabsContent value="models">
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={modelComparison}>
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mae" fill={COLORS[0]} />
                <Bar dataKey="rmse" fill={COLORS[1]} />
                <Bar dataKey="r2" fill={COLORS[2]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* ================= DEPARTMENTS PIE ================= */}
        <TabsContent value="departments">
          <Card className="p-6">
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={deptSalesData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {deptSalesData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ================= HOLIDAYS ================= */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Holiday Impact</h3>
        {holidayImpact.length > 0 ? (
          holidayImpact.map(h => (
            <div key={h.holiday} className="flex justify-between mb-2">
              <span>{h.holiday}</span>
              <Badge className={h.lift >= 0 ? "text-green-600" : "text-red-600"}>
                {h.lift > 0 ? "+" : ""}
                {h.lift}%
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No holiday data available
          </p>
        )}
      </Card>
    </div>
  );
}
