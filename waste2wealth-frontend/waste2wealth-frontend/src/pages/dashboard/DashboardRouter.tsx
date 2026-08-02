import { useAuth } from '@/context/AuthContext';
import GeneratorDashboard from './GeneratorDashboard';
import BuyerDashboard from './BuyerDashboard';
import AdminOverview from '../admin/AdminOverview';

export default function DashboardRouter() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <AdminOverview />;
  if (user?.role === 'buyer') return <BuyerDashboard />;
  return <GeneratorDashboard />;
}
