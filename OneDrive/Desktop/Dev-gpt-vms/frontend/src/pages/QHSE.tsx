import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Settings } from 'lucide-react';

const QHSE: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QHSE</h1>
          <p className="text-gray-600">Quality, Health, Safety & Environment management</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Settings className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">QHSE Module</h3>
          <p className="text-gray-500 text-center mb-4">
            This module will help you manage quality, health, safety, and environmental compliance.
          </p>
          <p className="text-sm text-gray-400">
            Coming soon - QHSE management functionality will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QHSE;
