import React, { useState, useEffect } from 'react';
import { apiClient } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Ship, Plus, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Vessel {
  id: number;
  name: string;
  imo_number?: string;
  vessel_type: string;
  flag_state: string;
  gross_tonnage?: number;
  length?: number;
  beam?: number;
  year_built?: number;
  is_active: boolean;
}

const Vessels: React.FC = () => {
  const { isAdmin, isCrew } = useAuth();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVessel, setNewVessel] = useState({
    name: '',
    imo_number: '',
    vessel_type: '',
    flag_state: '',
    gross_tonnage: '',
    length: '',
    beam: '',
    year_built: ''
  });

  const fetchVessels = async () => {
    try {
      const vesselData = await apiClient.getVessels();
      setVessels(vesselData);
    } catch (error) {
      console.error('Failed to fetch vessels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, []);

  const handleAddVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const vesselData = {
        ...newVessel,
        gross_tonnage: newVessel.gross_tonnage ? parseFloat(newVessel.gross_tonnage) : undefined,
        length: newVessel.length ? parseFloat(newVessel.length) : undefined,
        beam: newVessel.beam ? parseFloat(newVessel.beam) : undefined,
        year_built: newVessel.year_built ? parseInt(newVessel.year_built) : undefined,
      };
      await apiClient.createVessel(vesselData);
      setShowAddForm(false);
      setNewVessel({
        name: '',
        imo_number: '',
        vessel_type: '',
        flag_state: '',
        gross_tonnage: '',
        length: '',
        beam: '',
        year_built: ''
      });
      fetchVessels();
    } catch (error) {
      console.error('Failed to create vessel:', error);
    }
  };

  const handleAssignToVessel = async (vesselId: number) => {
    try {
      await apiClient.createCrewAssignment({
        vessel_id: vesselId,
        position: 'Crew Member',
        start_date: new Date().toISOString().split('T')[0],
        is_active: true
      });
      alert('Successfully assigned to vessel!');
    } catch (error) {
      console.error('Failed to assign to vessel:', error);
      alert('Failed to assign to vessel');
    }
  };

  if (loading) {
    return <div className="text-center">Loading vessels...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vessels</h1>
          <p className="text-gray-600">
            {isAdmin() ? 'Manage your fleet of vessels' : 'View available vessels and assignments'}
          </p>
        </div>
        {isAdmin() && (
          <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Vessel
          </Button>
        )}
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Vessel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddVessel} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Vessel Name *</label>
                  <input
                    type="text"
                    required
                    value={newVessel.name}
                    onChange={(e) => setNewVessel({...newVessel, name: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">IMO Number</label>
                  <input
                    type="text"
                    value={newVessel.imo_number}
                    onChange={(e) => setNewVessel({...newVessel, imo_number: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Vessel Type *</label>
                  <input
                    type="text"
                    required
                    value={newVessel.vessel_type}
                    onChange={(e) => setNewVessel({...newVessel, vessel_type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Flag State *</label>
                  <input
                    type="text"
                    required
                    value={newVessel.flag_state}
                    onChange={(e) => setNewVessel({...newVessel, flag_state: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Gross Tonnage</label>
                  <input
                    type="number"
                    value={newVessel.gross_tonnage}
                    onChange={(e) => setNewVessel({...newVessel, gross_tonnage: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Length (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVessel.length}
                    onChange={(e) => setNewVessel({...newVessel, length: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Beam (m)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newVessel.beam}
                    onChange={(e) => setNewVessel({...newVessel, beam: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year Built</label>
                  <input
                    type="number"
                    value={newVessel.year_built}
                    onChange={(e) => setNewVessel({...newVessel, year_built: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Vessel</Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {vessels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Ship className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No vessels found</h3>
            <p className="text-gray-500 text-center">
              Get started by adding your first vessel to the fleet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vessels.map((vessel) => (
            <Card key={vessel.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{vessel.name}</CardTitle>
                  <Badge variant={vessel.is_active ? 'default' : 'secondary'}>
                    {vessel.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="text-gray-600">{vessel.vessel_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Flag:</span>
                    <p className="text-gray-600">{vessel.flag_state}</p>
                  </div>
                  {vessel.imo_number && (
                    <div>
                      <span className="font-medium">IMO:</span>
                      <p className="text-gray-600">{vessel.imo_number}</p>
                    </div>
                  )}
                  {vessel.year_built && (
                    <div>
                      <span className="font-medium">Built:</span>
                      <p className="text-gray-600">{vessel.year_built}</p>
                    </div>
                  )}
                  {vessel.gross_tonnage && (
                    <div>
                      <span className="font-medium">GT:</span>
                      <p className="text-gray-600">{vessel.gross_tonnage.toLocaleString()}</p>
                    </div>
                  )}
                  {vessel.length && (
                    <div>
                      <span className="font-medium">Length:</span>
                      <p className="text-gray-600">{vessel.length}m</p>
                    </div>
                  )}
                </div>
                {isCrew() && (
                  <div className="pt-2 border-t">
                    <Button 
                      onClick={() => handleAssignToVessel(vessel.id)}
                      className="w-full flex items-center gap-2"
                      size="sm"
                    >
                      <UserCheck className="h-4 w-4" />
                      Assign to This Vessel
                    </Button>
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

export default Vessels;
