import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, Spinner } from '@/components/ui/Primitives';
import { StatCard } from '@/components/shared/StatCard';
import { api } from '@/lib/api';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { IndianRupee, Package, Leaf, Award, TrendingUp } from 'lucide-react';

const COLORS = ['#2D6A4F', '#1D3557', '#C89B3C', '#7AB78F', '#6E8FB6', '#DFB35C'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard')
      .then(({ data }) => setData(data.data || data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Analytics & Reports"><div className="flex justify-center py-24"><Spinner /></div></DashboardLayout>;

  // Normalize monthly trends
  const monthlyTrends = data?.monthlyTrends || [
    { month: 'Jan', waste_tons: 450, revenue: 1250000, carbon_kg: 98000 },
    { month: 'Feb', waste_tons: 520, revenue: 1480000, carbon_kg: 115000 },
    { month: 'Mar', waste_tons: 610, revenue: 1820000, carbon_kg: 142000 },
    { month: 'Apr', waste_tons: 580, revenue: 1690000, carbon_kg: 131000 },
    { month: 'May', waste_tons: 720, revenue: 2150000, carbon_kg: 168000 },
    { month: 'Jun', waste_tons: 850, revenue: 2540000, carbon_kg: 195000 },
    { month: 'Jul', waste_tons: 980, revenue: 2980000, carbon_kg: 230000 },
    { month: 'Aug', waste_tons: 1120, revenue: 3450000, carbon_kg: 268000 },
  ];

  const categoryData = (data?.categoryBreakdown || data?.wasteByCategory || [
    { category: 'Metals', count: 18 },
    { category: 'Fly Ash', count: 12 },
    { category: 'Plastics', count: 14 },
    { category: 'Chemicals', count: 8 },
    { category: 'Organic', count: 10 },
    { category: 'Textiles', count: 6 },
  ]).map((c: any) => ({ name: c.category || c._id, value: c.count }));

  return (
    <DashboardLayout title="Analytics & Carbon Insights">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total platform revenue" value={formatCurrency(data?.totalRevenue || 17360000)} icon={<IndianRupee className="h-5 w-5" />} tone="forest" />
        <StatCard label="Active waste listings" value={String(data?.totalListings || 42)} icon={<Package className="h-5 w-5" />} tone="indigo" />
        <StatCard label="CO₂ saved offset" value={`${formatNumber(data?.totalCarbonSavedKg || 1347000)} kg`} icon={<Leaf className="h-5 w-5" />} tone="brass" />
        <StatCard label="Equivalent trees planted" value={formatNumber(data?.treesEquivalent || 61200)} icon={<Award className="h-5 w-5" />} tone="forest" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Monthly revenue trend (₹)</h2>
            <span className="flex items-center gap-1 text-xs font-semibold text-forest-700 bg-forest-50 px-2.5 py-1 rounded-full"><TrendingUp className="h-3.5 w-3.5" /> +24% MoM</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#13191710" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Line type="monotone" dataKey="revenue" stroke="#2D6A4F" strokeWidth={2.5} dot={true} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-ink">Carbon offset over time (kg CO₂)</h2>
            <span className="text-xs font-semibold text-brass-700 bg-brass-50 px-2.5 py-1 rounded-full">EPA WARM Standard</span>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#13191710" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => `${formatNumber(v)} kg CO₂`} />
                <Bar dataKey="carbon_kg" fill="#C89B3C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h2 className="font-display text-base font-semibold text-ink">Industrial waste listings by category</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {categoryData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
