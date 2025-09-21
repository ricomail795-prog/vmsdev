import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Shield, AlertTriangle } from 'lucide-react';

interface SafetyRecord {
  id: number;
  vessel_id: number;
  incident_type: string;
  description: string;
  incident_date: string;
  severity: string;
  status: string;
  corrective_actions?: string;
}

const Safety: React.FC = () => {
  const [records, setRecords] = useState<SafetyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSafetyRecords = async () => {
      try {
        const safetyData = await apiClient.getSafetyRecords();
        setRecords(safetyData);
      } catch (error) {
        console.error('Failed to fetch safety records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSafetyRecords();
  }, []);

  if (loading) {
    return <div className="text-center">Loading safety records...</div>;
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'closed':
        return 'bg-green-100 text-green-800';
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Safety</h1>
          <p className="text-gray-600">Monitor and manage safety incidents and records</p>
        </div>
      </div>

      {records.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No safety records found</h3>
            <p className="text-gray-500 text-center">
              Safety incidents and records will appear here when reported.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {records.map((record) => (
            <Card key={record.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-orange-500" />
                    {record.incident_type}
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Badge className={getSeverityColor(record.severity)}>
                      {record.severity}
                    </Badge>
                    <Badge className={getStatusColor(record.status)}>
                      {record.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-gray-600">{record.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Vessel ID:</span>
                    <p className="text-gray-600">{record.vessel_id}</p>
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>
                    <p className="text-gray-600">
                      {new Date(record.incident_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {record.corrective_actions && (
                  <div className="text-sm">
                    <span className="font-medium">Corrective Actions:</span>
                    <p className="text-gray-600 mt-1">{record.corrective_actions}</p>
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

export default Safety;
