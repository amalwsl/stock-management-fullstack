import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Vehicle } from '../types';
import { vehicleTypes } from '../consts';

const VehicleManagement: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const queryClient = useQueryClient();

  const { data: vehicles=[],isLoading,isError,error } = useQuery({
    queryKey: ['vehicles'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:5000/api/vehicles');
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`http://localhost:5000/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  if (isLoading) return <div>Loading parts...</div>;
  if (isError) return <div>Error: {error instanceof Error ? error.message : 'Something went wrong'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Vehicle Management</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Add Vehicle</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.isArray(vehicles?.vehicles) && vehicles.vehicles.map((vehicle: Vehicle) => (
        <div
            key={vehicle._id}
            className="bg-white rounded-lg shadow-sm p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{vehicle.name}</h3>
                <p className="text-gray-500">{vehicle.type}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingVehicle(vehicle)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this vehicle?')) {
                      deleteMutation.mutate(vehicle._id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Model:</span>
                <span>{vehicle.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Year:</span>
                <span>{vehicle.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(showAddModal || editingVehicle) && (
        <VehicleModal
          vehicle={editingVehicle}
          onClose={() => {
            setShowAddModal(false);
            setEditingVehicle(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingVehicle(null);
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
          }}
        />
      )}
    </div>
  );
};

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSave: () => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({ vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    vehicle || {
      type: '',
      name: '',
      model: '',
      year: new Date().getFullYear(),
    }
  );

  const mutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) =>
      vehicle
        ? axios.put(`http://localhost:5000/api/vehicles/${vehicle._id}`, data)
        : axios.post('http://localhost:5000/api/vehicles', data),
    onSuccess: () => {
      onSave();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">
          {vehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
            <option value="">Sélectionner un type</option>
            {vehicleTypes.map((type, index) => (
              <option key={index} value={type}> {type}</option>
            ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Year</label>
            <input
              type="number"
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-md text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {vehicle ? 'Update Vehicle' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleManagement;