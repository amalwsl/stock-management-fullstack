import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Vehicle } from '../types';
import { vehicleTypes } from '../consts';

const GestionVehicules: React.FC = () => {
  const [montrerModalAjout, setMontrerModalAjout] = useState(false);
  const [vehiculeEnEdition, setVehiculeEnEdition] = useState<Vehicle | null>(null);

  const queryClient = useQueryClient();

  const { data: vehicules = [], isLoading, isError, error } = useQuery({
    queryKey: ['vehicules'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:5000/api/vehicles');
      return data;
    },
  });

  const mutationSuppression = useMutation({
    mutationFn: (id: string) => axios.delete(`http://localhost:5000/api/vehicles/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicules'] });
    },
  });

  if (isLoading) return <div>Chargement des véhicules...</div>;
  if (isError) return <div>Erreur : {error instanceof Error ? error.message : 'Une erreur est survenue'}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Véhicules</h2>
        <button
          onClick={() => setMontrerModalAjout(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus size={20} />
          <span>Ajouter un Véhicule</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(vehicules?.vehicles) && vehicules.vehicles.map((vehicule: Vehicle) => (
          <div
            key={vehicule._id}
            className="bg-white rounded-lg shadow-sm p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{vehicule.name}</h3>
                <p className="text-gray-500">{vehicule.type}</p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setVehiculeEnEdition(vehicule)}
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Edit size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
                      mutationSuppression.mutate(vehicule._id);
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
                <span className="text-gray-500">Modèle :</span>
                <span>{vehicule.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Année :</span>
                <span>{vehicule.year}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {(montrerModalAjout || vehiculeEnEdition) && (
        <ModalVehicule
          vehicule={vehiculeEnEdition}
          onClose={() => {
            setMontrerModalAjout(false);
            setVehiculeEnEdition(null);
          }}
          onSave={() => {
            setMontrerModalAjout(false);
            setVehiculeEnEdition(null);
            queryClient.invalidateQueries({ queryKey: ['vehicules'] });
          }}
        />
      )}
    </div>
  );
};

interface PropsModalVehicule {
  vehicule: Vehicle | null;
  onClose: () => void;
  onSave: () => void;
}

const ModalVehicule: React.FC<PropsModalVehicule> = ({ vehicule, onClose, onSave }) => {
  const [formData, setFormData] = useState(
    vehicule || {
      type: '',
      name: '',
      model: '',
      year: new Date().getFullYear(),
    }
  );

  const mutation = useMutation({
    mutationFn: (data: Partial<Vehicle>) =>
      vehicule
        ? axios.put(`http://localhost:5000/api/vehicles/${vehicule._id}`, data)
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
          {vehicule ? 'Modifier le Véhicule' : 'Ajouter un Nouveau Véhicule'}
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
            <label className="block text-sm font-medium text-gray-700">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Modèle</label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Année</label>
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
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {vehicule ? 'Mettre à Jour le Véhicule' : 'Ajouter le Véhicule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GestionVehicules;
