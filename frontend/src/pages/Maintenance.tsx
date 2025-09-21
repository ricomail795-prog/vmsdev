import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Wrench, Calendar } from 'lucide-react';

interface MaintenanceRecord {
  id: number;
  vessel_id: number;
  title: string;
  description: string;
  maintenance_type: string;
  scheduled_date: string;
  completed_date?: string;
  status: string;
  cost?: number;
}

const Maintenance: React.FC = () => {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceRecords = async () => {
      try {
        const maintenanceData = await apiClient.getMaintenanceRecords();
        setRecords(maintenanceData);
      } catch (error) {
        console.error('Failed to fetch maintenance records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceRecords();
  }, []);

  if (loading) {
    return <div className="text-center">Loading maintenance records...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance</h1>
          <p className="text-gray-600">Track and manage vessel maintenance activities</p>
        </div>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Wrench className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No maintenance records found</h3>
            <p className="text-gray-500 text-center">
              Start tracking maintenance activities for your vessels.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{record.title}</CardTitle>
                  <Badge className={getStatusColor(record.status)}>
                    {record.status.replace('_', ' ')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600">{record.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="text-gray-600">{record.maintenance_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Vessel ID:</span>
                    <p className="text-gray-600">{record.vessel_id}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Scheduled:</span>
                    <span className="text-gray-600">
                      {new Date(record.scheduled_date).toLocaleDateString()}
                    </span>
                  </div>
                  {record.completed_date && (
                    <div className="flex items-center space-x-1">
                      <span className="font-medium">Completed:</span>
                      <span className="text-gray-600">
                        {new Date(record.completed_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {record.cost && (
                  <div className="text-sm">
                    <span className="font-medium">Cost:</span>
                    <span className="text-gray-600 ml-1">
                      ${record.cost.toLocaleString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Maintenance;
