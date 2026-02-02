import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Store, Package } from 'lucide-react';
import { Badge } from './ui/badge';

interface DashboardProps {
  data: any[];
  predictions: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function Dashboard({ data, predictions }: DashboardProps) {
  // Calculate metrics
  const totalSales = predictions.reduce((sum, item) => sum + item.actual, 0);
  const totalPredicted = predictions.reduce((sum, item) => sum + item.predicted, 0);
  const accuracy = ((1 - Math.abs(totalSales - totalPredicted) / totalSales) * 100).toFixed(1);
  
  // Get unique stores and departments
  const stores = [...new Set(data.map(d => d.Store))].slice(0, 5);
  const departments = [...new Set(data.map(d => d.Dept))].slice(0, 6);
  
  // Aggregate data by store
  const storeData = stores.map(store => {
    const storeRecords = data.filter(d => d.Store === store);
    const sales = storeRecords.reduce((sum, d) => sum + parseFloat(d.Weekly_Sales || 0), 0);
    return { name: `Store ${store}`, sales: Math.round(sales) };
  });
  
  // Aggregate data by department
  const deptData = departments.map(dept => {
    const deptRecords = data.filter(d => d.Dept === dept);
    const sales = deptRecords.reduce((sum, d) => sum + parseFloat(d.Weekly_Sales || 0), 0);
    return { name: `Dept ${dept}`, value: Math.round(sales) };
  });
  
  // Model comparison data
  const modelComparison = [
    { model: 'Linear Regression', mae: 12453, rmse: 18234, r2: 0.72 },
    { model: 'Random Forest', mae: 8234, rmse: 12456, r2: 0.85 },
    { model: 'XGBoost', mae: 7123, rmse: 10234, r2: 0.89 },
    { model: 'LSTM', mae: 9456, rmse: 13567, r2: 0.82 },
    { model: 'Ensemble', mae: 6543, rmse: 9123, r2: 0.92 },
  ];

  // Holiday impact data
  const holidayImpact = [
    { holiday: 'Thanksgiving', lift: 38, sales: 285000 },
    { holiday: 'Christmas', lift: 45, sales: 312000 },
    { holiday: 'Super Bowl', lift: 22, sales: 198000 },
    { holiday: 'Labor Day', lift: 15, sales: 165000 },
  ];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Sales</p>
              <p className="text-2xl font-semibold mt-1">${(totalSales / 1000000).toFixed(2)}M</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
            <span className="text-green-600">12.5%</span>
            <span className="text-gray-500 ml-1">vs last period</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Forecast Accuracy</p>
              <p className="text-2xl font-semibold mt-1">{accuracy}%</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-gray-500">Ensemble model</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Stores Analyzed</p>
              <p className="text-2xl font-semibold mt-1">{stores.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-gray-500">Across all regions</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Departments</p>
              <p className="text-2xl font-semibold mt-1">{departments.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center mt-3 text-sm">
            <span className="text-gray-500">Product categories</span>
          </div>
        </Card>
      </div>

      {/* Main Charts */}
      <Tabs defaultValue="forecast" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="forecast">Sales Forecast</TabsTrigger>
          <TabsTrigger value="models">Model Comparison</TabsTrigger>
          <TabsTrigger value="stores">Store Performance</TabsTrigger>
          <TabsTrigger value="departments">Department Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="forecast" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Weekly Sales Forecast vs Actual</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={predictions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="actual" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.2} 
                  name="Actual Sales"
                />
                <Area 
                  type="monotone" 
                  dataKey="predicted" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.2} 
                  name="Predicted Sales"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Seasonal Patterns</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={predictions.slice(0, 12)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#3b82f6" name="Sales" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Holiday Impact</h3>
              <div className="space-y-4">
                {holidayImpact.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.holiday}</p>
                      <p className="text-sm text-gray-500">${(item.sales / 1000).toFixed(0)}K sales</p>
                    </div>
                    <Badge variant="secondary" className="bg-green-50 text-green-700">
                      +{item.lift}%
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Model Performance Comparison</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={modelComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="model" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="mae" fill="#3b82f6" name="MAE" />
                <Bar dataKey="rmse" fill="#10b981" name="RMSE" />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {modelComparison.slice(2, 5).map((model, idx) => (
                <Card key={idx} className="p-4 bg-gray-50">
                  <p className="font-medium mb-2">{model.model}</p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">MAE:</span>
                      <span className="font-medium">{model.mae.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">RMSE:</span>
                      <span className="font-medium">{model.rmse.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">R²:</span>
                      <span className="font-medium">{model.r2}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Store Performance Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={storeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="sales" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Sales by Department</h3>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={deptData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deptData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top Performing Departments</h3>
              <div className="space-y-4">
                {deptData.sort((a, b) => b.value - a.value).map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-sm text-gray-500">${(dept.value / 1000).toFixed(0)}K</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Contribution</p>
                      <p className="font-medium">{((dept.value / deptData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-3">Peak Sales Period</h3>
          <div className="flex items-center space-x-3">
            <Calendar className="w-10 h-10 text-blue-600" />
            <div>
              <p className="text-xl font-semibold">Week 47-52</p>
              <p className="text-sm text-gray-500">Holiday season spike</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Average Weekly Sales</h3>
          <div className="flex items-center space-x-3">
            <DollarSign className="w-10 h-10 text-green-600" />
            <div>
              <p className="text-xl font-semibold">${(totalSales / predictions.length / 1000).toFixed(1)}K</p>
              <p className="text-sm text-gray-500">Per week average</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-3">Prediction Confidence</h3>
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-10 h-10 text-purple-600" />
            <div>
              <p className="text-xl font-semibold">92%</p>
              <p className="text-sm text-gray-500">Model confidence level</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
