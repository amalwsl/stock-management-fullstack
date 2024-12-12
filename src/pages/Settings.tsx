/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Save } from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    motDePasseActuel: '',
    nouveauMotDePasse: '',
    confirmerMotDePasse: '',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const mutation = useMutation({
    mutationFn: (data: typeof formData) =>
      axios.put('http://localhost:5000/api/users/'+user?._id, data),
    onSuccess: () => {
      setMessage({ type: 'success', text: 'Mot de passe mis à jour avec succès' });
      setFormData({
        motDePasseActuel: '',
        nouveauMotDePasse: '',
        confirmerMotDePasse: '',
      });
    },
    onError: (error: any) => {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Échec de la mise à jour du mot de passe',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.nouveauMotDePasse !== formData.confirmerMotDePasse) {
      setMessage({ type: 'error', text: 'Les nouveaux mots de passe ne correspondent pas' });
      return;
    }
    mutation.mutate(formData);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Paramètres</h2>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Informations du compte</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
            <input
              type="text"
              value={user?.username}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rôle</label>
            <input
              type="text"
              value={user?.role}
              disabled
              className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Changer le mot de passe</h3>
        {message && (
          <div
            className={`p-4 rounded-md mb-4 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={formData.motDePasseActuel}
              onChange={(e) =>
                setFormData({ ...formData, motDePasseActuel: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={formData.nouveauMotDePasse}
              onChange={(e) =>
                setFormData({ ...formData, nouveauMotDePasse: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={formData.confirmerMotDePasse}
              onChange={(e) =>
                setFormData({ ...formData, confirmerMotDePasse: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            <Save size={20} />
            <span>Mettre à jour le mot de passe</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
