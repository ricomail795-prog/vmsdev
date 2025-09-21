import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Ship, Wrench, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface DashboardData {
  total_vessels: number;
  active_vessels: number;
  pending_maintenance: number;
  open_safety_issues: number;
  recent_vessels: any[];
  recent_maintenance: any[];
  recent_safety: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const dashboardData = await apiClient.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-center">Loading dashboard...</div>;
  }

  if (!data) {
    return <div className="text-center text-red-500">Failed to load dashboard data</div>;
  }

  const stats = [
    {
      title: 'Total Vessels',
      value: data.total_vessels,
      icon: Ship,
      color: 'text-blue-600',
    },
    {
      title: 'Active Vessels',
      value: data.active_vessels,
      icon: Ship,
      color: 'text-green-600',
    },
    {
      title: 'Pending Maintenance',
      value: data.pending_maintenance,
      icon: Wrench,
      color: 'text-orange-600',
    },
    {
      title: 'Safety Issues',
      value: data.open_safety_issues,
      icon: Shield,
      color: 'text-red-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome to your vessel management system, {user?.first_name || 'User'}
          {user?.role && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Vessels</CardTitle>
            <CardDescription>Latest vessel information</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recent_vessels.length > 0 ? (
              <div className="space-y-2">
                {data.recent_vessels.map((vessel) => (
                  <div key={vessel.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{vessel.name}</p>
                      <p className="text-sm text-gray-500">{vessel.vessel_type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      vessel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {vessel.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No vessels found</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Maintenance</CardTitle>
            <CardDescription>Latest maintenance activities</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recent_maintenance.length > 0 ? (
              <div className="space-y-2">
                {data.recent_maintenance.map((maintenance) => (
                  <div key={maintenance.id} className="flex justify-between items-center p-2 border rounded">
                    <div>
                      <p className="font-medium">{maintenance.title}</p>
                      <p className="text-sm text-gray-500">{maintenance.maintenance_type}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      maintenance.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
                      maintenance.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {maintenance.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No maintenance records found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
