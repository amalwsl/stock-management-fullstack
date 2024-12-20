/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Printer } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { vehicleTypes } from '../consts';
import { Consultation } from '../types';

const stateArray = ["Pièce", "Turbo terminé"];
const remarqueArray = ["Réparé", "Non Réparé"];
const tabs = ['Tous', 'Pièces', 'Turbos Terminés'];

const handleHistory = async (payload:any,onSuccess?:()=>void,onFinally?:()=>void ) => {
    
  try {
    const response = await fetch('http://localhost:5000/api/stockHistory/consultation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Échec de la soumission de l\'historique');
    }

    const result = await response.json();
    console.log('Historique soumis avec succès:', result);

    onSuccess?.()
    alert('Historique soumis avec succès.');
  } catch (error) {
    console.error('Erreur lors de la soumission de l\'historique:', error);
    alert(`Erreur lors de la soumission de l'historique: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
  } finally {
    onFinally?.()
  }
};

const queryFns = {
  fetchconsultations: async (): Promise<Consultation[]> => {
    const response = await fetch('http://localhost:5000/api/consultations');
    if (!response.ok) {
      throw new Error('Échec de la récupération des consultations');
    }
    return response.json();
  },
};

const mutationFns = {
  deleteConsultation: async (consultation: Consultation): Promise<Consultation | undefined> => {
    const id=consultation._id 
    const ok = window.confirm("Êtes-vous sûr de vouloir supprimer cette pièce ?");
    if (!ok) return undefined;
    const response = await fetch(`http://localhost:5000/api/consultations/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Échec de la suppression de la consultation');
    }
    return consultation;
  },

  addOrUpdateConsultation: async (consultationData: Consultation): Promise<Consultation> => {
    console.log("consultation data ",consultationData)
    const id = consultationData._id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:5000/api/consultations/${id}` : 'http://localhost:5000/api/consultations/';
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(consultationData),
    });

    if (!response.ok) {
      throw new Error('Échec de la soumission de la consultation');
    }
    return response.json();
  },
};

const mutationKeys = {
  deleteConsultation: ['deleteConsultation'],
  addOrUpdateConsultation: ['addOrUpdateConsultation'],
};

export default function ConsulationManagement() {
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(tabs[0]);


  const handleTabChange = (tab: string) => setActiveTab(tab);

  const { data: consultations = [], isLoading, isError, error } = useQuery(
    { queryKey: ['consultations'], queryFn: queryFns.fetchconsultations }
  );

  const mutationDelete = useMutation({
    mutationFn: mutationFns.deleteConsultation,
    mutationKey: mutationKeys.deleteConsultation,
    onSuccess: (id) => {
      queryClient.setQueryData(['consultations'], (oldconsultations: Consultation[]) =>
        oldconsultations.filter((consultation) => consultation._id !== id?._id)
      );
      handleHistory({
        consultationId: id?._id,
        userId: user?._id,
        notes :"suppression de la pièce",
        date: new Date().toISOString(),
        type: "delete"
      })
      window.alert("Consultation supprimée avec succès !");
    },
    onError: (error) => {
      window.alert("Une erreur est survenue lors de la suppression de la consultation.");
    },
  });

  const mutationAdd = useMutation({
    mutationFn: mutationFns.addOrUpdateConsultation,
    mutationKey: mutationKeys.addOrUpdateConsultation,
    onSuccess: (consultation) => {
      queryClient.invalidateQueries('consultations');
      setIsAddModalOpen(false);
      setSelectedConsultation(null);
      handleHistory({
        consultationId:consultation?._id ,
        userId: user?._id,
        notes:"ajout de la consultation",
        date: new Date().toISOString(),
        type: "add"
      })
      window.alert("Consultation ajoutée  succès !");
    },
    onError: () => {
      window.alert("Une erreur est survenue lors de la soumission de la consultation.");
    },
  });

  const mutationUpdate = useMutation({
    mutationFn: mutationFns.addOrUpdateConsultation,
    mutationKey: mutationKeys.addOrUpdateConsultation,
    onSuccess: (consultation) => {
      queryClient.invalidateQueries('consultations');
      setIsAddModalOpen(false);
      setSelectedConsultation(null);
      handleHistory({
        consultationId:consultation?._id ,
        userId: user?._id,
        notes:"mise à jour de la consultation",
        date: new Date().toISOString(),
        type: "update" 
      })
      window.alert("Consultation mise à jour avec succès !");
    },
    onError: () => {
      window.alert("Une erreur est survenue lors de la soumission de la consultation.");
    },
  });

  const filteredconsultations = consultations.filter(part =>
    part.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.referenceOrg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.turboType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part?._id?.includes(searchTerm)
  );

  const finalconsultations = activeTab == "Tous" ? filteredconsultations : activeTab == "Pièces" ? filteredconsultations.filter((part) => part.state == "Pièce") : filteredconsultations.filter((part) => part.state == "Turbo terminé");

  if (isLoading) return <div>Chargement des consultations...</div>;
  if (isError) return <div>Erreur : {error instanceof Error ? error.message : 'Quelque chose a mal tourné'}</div>;

  const columns = [
    {
      header: 'Réception',
      accessorKey: 'receptionDate',
    },
    {
      header: 'Sortie',
      accessorKey: 'issueDate',
    },
    {
      header: 'Référence',
      accessorKey: 'reference',
    },
    {
      header: 'Type de véhicule',
      accessorKey: 'vehicleType',
    },
    {
      header: 'Modèle du Turbo',
      accessorKey: 'model',
    },
    {
      header: 'Type du Turbo',
      accessorKey: 'turboType',
    },
    {
      header: 'Statut',
      cell: ({ row }: any) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.original.state === "Pièce"
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}
        >
          {row.original.state}
        </span>
      ),
    },
    {
      header: 'Remarque',
      cell: ({ row }: any) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.original.isFixed === "Réparé"
              ? 'bg-green-100 text-green-800'
              : 'bg-orange-100 text-orange-800'
          }`}
        >
          {row.original.isFixed}
        </span>
      ),
    },
    ...(user?.role === "admin" ? [{
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedConsultation(row.original)}
            className="p-1 text-blue-600 hover:text-blue-800"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => mutationDelete.mutate(row.original)}
            className="p-1 text-red-600 hover:text-red-800"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    }] : []),
  ];

 
  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const consultationData: Consultation = {
      _id: selectedConsultation?._id || undefined, // Ensure _id is valid
      reference: formData.get('reference') as string,
      referenceOrg: formData.get('referenceOrg') as string,
      size: formData.get('size') as string || '', // Optional, if size is needed
      image: formData.get('image') as string || '', // Optional, if image is needed
      createdAt: selectedConsultation?.createdAt || new Date().toISOString(), // Keep original createdAt if editing
      updatedBy: user?._id ? user?._id.toString() : null, // If needed, pass a valid ObjectId, or null if not required
      vehicleType: formData.get('vehicleType') as string || '', // Optional, if type is needed
      turboType: formData.get('turboType') as string || '', // Optional, if type is needed
      model: formData.get('turboModel') as string,
      description: formData.get('description') as string || '', // Optional, if description is needed
      state: formData.get('state') as "Pièce" | "Turbo terminé",
      receptionDate: formData.get('receptionDate') as string,
      issueDate: formData.get('issueDate') as string,
      isFixed: formData.get('isFixed') as string
    };
    if (selectedConsultation?._id){
      mutationUpdate.mutate(consultationData);

    }else{
      mutationAdd.mutate(consultationData);
    }
    };



    const handlePrint = () => {
      window.print();
    };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des consultations</h1>

        <div className='flex gap-4 print:hidden ' >
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" onClick={handlePrint}>
        <Printer className="w-4 h-4 mr-2" />  
        Imprimer
        </button>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une consultation
        </button>
        </div>
      </div>

      <div className="mt-4">
      <input
        type="text"
        placeholder="Rechercher par Réf, Modèle, Type..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full p-2 border rounded-md"
      />
    </div>

    <div className="flex gap-4 border-b">
    {tabs.map((tab) => (
      <button
        key={tab}
        className={`py-2 px-4 ${
          activeTab === tab ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
        }`}
        onClick={() => handleTabChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>


    <DataTable data={finalconsultations} columns={columns} />

      <Modal
        isOpen={isAddModalOpen || (!!selectedConsultation) }
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedConsultation(null);
        }}
        title={selectedConsultation ? 'Modifier la consultation' : 'Ajouter une nouvelle consultation'}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
        <div className='w-full flex gap-4 justify-between' >
        <div className='w-1/2' >
            <label className="block text-sm font-medium text-gray-700">
              Récéption <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="receptionDate"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.receptionDate || ''}
              required
            />
          </div>

          <div className='w-1/2' >
          <label className="block text-sm font-medium text-gray-700">
              Sortie <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="issueDate"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.issueDate || ''}
              required
            />
          </div>

          
        
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Référence <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="reference"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.reference || ''}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Référence Originale <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="referenceOrg"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.referenceOrg || ''}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Type de véhicule <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleType"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.vehicleType|| ''}
              required
            >
              <option value="">Sélectionner un type</option>
              {vehicleTypes.map((type, index) => (
                <option key={index} value={type}> {type}</option>
              ))}
            </select>
          </div>
          <div>
          <label className="block text-sm font-medium text-gray-700">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="state"
            className="mt-1 block w-full rounded-md"
            defaultValue={selectedConsultation?.state|| ''}
            required
          >
            <option value="">Sélectionner un status</option>
            {stateArray.map((type, index) => (
              <option key={index} value={type}> {type}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Remarque <span className="text-red-500">*</span>
          </label>
          <select
            name="isFixed"
            className="mt-1 block w-full rounded-md"
            defaultValue={selectedConsultation?.isFixed|| ''}
            required
          >
            <option value="">Sélectionner une remarque</option>
            {remarqueArray.map((type, index) => (
              <option key={index} value={type}> {type}</option>
            ))}
          </select>
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Modèle du Turbo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="turboModel"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.model || ''}
              required
            />
          </div>
          <div>
          <label className="block text-sm font-medium text-gray-700">
            Type du Turbo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="turboType"
            className="mt-1 block w-full rounded-md"
            defaultValue={selectedConsultation?.turboType || ''}
            required
          />
        </div>
          
          {/* Optional fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Taille</label>
            <input
              type="text"
              name="size"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.size || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              name="image"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.image || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedConsultation?.description || ''}
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {selectedConsultation ? 'Modifier la consultation' : 'Ajouter la consultation'}
          </button>
        </form>
      </Modal>
      
    </div>
  );
}
