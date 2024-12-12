/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Plus, Edit, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import { DataTable } from '../components/DataTable';
import { Modal } from '../components/Modal';
import { Part } from '../types';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { vehicleTypes } from '../consts';

const stateArray = ["Pièce", "Turbo terminé"];
const tabs = ['Tous', 'Pièces', 'Turbos Terminés'];


const handleHistory = async (payload:any,onSuccess?:()=>void,onFinally?:()=>void ) => {
    
  try {
    const response = await fetch('http://localhost:5000/api/stockHistory/stock', {
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





// Constants for query and mutation functions
const queryFns = {
  fetchParts: async (): Promise<Part[]> => {
    const response = await fetch('http://localhost:5000/api/parts');
    if (!response.ok) {
      throw new Error('Échec du chargement des pièces');
    }
    return response.json();
  },
};

const mutationFns = {
  deletePart: async (part:Part): Promise<Part | undefined> => {
    const id=part._id ??""
    const ok = window.confirm("Êtes-vous sûr de vouloir supprimer cette pièce ?");
    if (!ok) return undefined;
    const response = await fetch(`http://localhost:5000/api/parts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Échec de la suppression de la pièce');
    }
    return part;
  },

  addOrUpdatePart: async (partData: Part): Promise<Part> => {
    const id = partData._id;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `http://localhost:5000/api/parts/${id}` : 'http://localhost:5000/api/parts/';
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(partData),
    });

    if (!response.ok) {
      throw new Error('Échec de la soumission de la pièce');
    }
    return response.json();
  },
};

const mutationKeys = {
  deletePart: ['deletePart'],
  addOrUpdatePart: ['addOrUpdatePart'],
};

export default function StockManagement() {
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  const [history, setHistory] = useState<{ quantity: number, notes: string, date: string }[]>([]);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(""); // Modal for adding history : "" for model closed , "input" for inputting and "output" for outputting

  const handleTabChange = (tab: string) => setActiveTab(tab);

  // Use query with queryKey and queryFn from constants
  const { data: parts = [], isLoading, isError, error } = useQuery(
    { queryKey: ['parts'], queryFn: queryFns.fetchParts, staleTime: 60000, refetchOnWindowFocus: false }
  );

  // Use mutation for deleting part with mutationFn and mutationKey from constants
  const mutationDelete = useMutation({
    mutationFn: mutationFns.deletePart,
    mutationKey: mutationKeys.deletePart,
    onSuccess: (id) => {
      queryClient.setQueryData(['parts'], (oldParts: Part[]) =>{
        oldParts.filter((part) => part._id !== id?._id)
      });
      handleHistory({
        partId: id?._id,
        userId: user?._id,
        quantity:id?.quantity,
        notes :"suppression de la pièce",
        date: new Date().toISOString(),
        type: "delete"
      })
      alert('La pièce a été supprimée avec succès.');
    },
    onError: (error) => {
      alert(`Erreur lors de la suppression de la pièce : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });

  // Use mutation for adding or updating part with mutationFn and mutationKey from constants
  const mutationUpdate = useMutation({
    mutationFn: mutationFns.addOrUpdatePart,
    mutationKey: mutationKeys.addOrUpdatePart,
    onSuccess: (id) => {
      queryClient.invalidateQueries('parts');
      setIsAddModalOpen(false);
      setSelectedPart(null);
      handleHistory({
        partId:id._id ,
        userId: user?._id,
        quantity:id.quantity,
        notes:"mise à jour de la pièce",
        date: new Date().toISOString(),
        type: "update" 
      })
      alert('La pièce a été mise à jour avec succès.');
    },
    onError: (error) => {
      alert(`Erreur lors de la mise à jour de la pièce : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });

  
  // Use mutation for adding or updating part with mutationFn and mutationKey from constants
  const mutationAdd = useMutation({
    mutationFn: mutationFns.addOrUpdatePart,
    mutationKey: mutationKeys.addOrUpdatePart,
    onSuccess: (id) => {
      queryClient.invalidateQueries('parts');
      setIsAddModalOpen(false);
      setSelectedPart(null);
      handleHistory({
        partId:id._id ,
        userId: user?._id,
        quantity:id.quantity,
        notes:"ajout de la pièce",
        date: new Date().toISOString(),
        type: "add"
      })
      alert('La pièce a été ajoutée avec succès.');
    },
    onError: (error) => {
      alert(`Erreur lors de l'ajout de la pièce : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  });

  const filteredParts = parts.filter(part => 
    part.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.referenceOrg.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.turboType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.vehicleType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part?._id?.includes(searchTerm)
  );

  const finalParts = activeTab === "Tous" ? filteredParts : activeTab === "Pièces" ? filteredParts.filter((part) => part.state === "Pièce") : filteredParts.filter((part) => part.state === "Turbo terminé");

  if (isLoading) return <div>Chargement des pièces...</div>;
  if (isError) return <div>Erreur: {error instanceof Error ? error.message : 'Quelque chose s\'est mal passé'}</div>;

  const columns = [
    {
      header: 'Image',
      cell: ({ row }: any) => (
        <div className="flex gap-2 w-10 max-h-12">
          <img src={row.original.image} />
        </div>
      ),
    },
    {
      header: 'Référence',
      accessorKey: 'reference',
    },
    {
      header: 'Référence originale',
      accessorKey: 'referenceOrg',
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
      header: 'Status',
      cell: ({ row }: any) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            row.original.state === "Pièce"
              ? 'bg-purple-100 text-purple-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {row.original.state}
        </span>
      ),
    },
    {
      header: 'Quantité',
      accessorKey: 'quantity',
    },
    {
      header: 'Actions',
      cell: ({ row }: any) => {
        return (
          <div className="flex gap-2">
            {user?.role === "admin" && <button
              onClick={() => setSelectedPart(row.original)}
              className="p-1 text-blue-600 hover:text-blue-800"
            >
              <Edit className="w-4 h-4" />
            </button>}
            {user?.role === "admin" && <button
              onClick={() => mutationDelete.mutate(row.original)}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <Trash2 className="w-4 h-4" />
            </button>}
            <button
              onClick={() => {
                setSelectedPart(row.original);
                setIsHistoryModalOpen("input");
              }}
              className="p-1 text-green-600 hover:text-green-800"
            >
              <TrendingDown className="w-4 h-4 mr-1" />
            </button>
            <button
              onClick={() => {
                setSelectedPart(row.original);
                setIsHistoryModalOpen("output");
              }}
              className="p-1 text-red-600 hover:text-red-800"
            >
              <TrendingUp className="w-4 h-4 mr-1 " />
            </button>
          </div>
        );
      },
    },
  ];

  

  const handleHistorySubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!selectedPart || !isHistoryModalOpen) {
      window.alert("Aucune pièce sélectionnée pour soumettre l'historique.");
      return;
    }

    const payload = {
      partId: selectedPart._id,
      userId: user?._id,
      quantity,
      notes,
      date: new Date().toISOString(),
      type: isHistoryModalOpen
    };

    handleHistory(payload,()=>{
      queryClient.invalidateQueries(['parts']);
      setHistory([...history, payload]);
      setIsHistoryModalOpen(""); // Close modal after saving
      setSelectedPart(null);
    },()=>{
      setNotes("");
      setQuantity(0);
    })
  };

  const handleFormSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const partData: Part = {
      _id: selectedPart?._id || undefined,
      reference: formData.get('reference') as string,
      referenceOrg: formData.get('referenceOrg') as string,
      quantity: parseInt(formData.get('quantity') as string, 10),
      size: formData.get('size') as string || '',
      image: formData.get('image') as string || '',
      createdAt: selectedPart?.createdAt || new Date().toISOString(),
      updatedBy: user?._id ? user?._id.toString() : null,
      vehicleType: formData.get('vehicleType') as string || '',
      turboType: formData.get('turboType') as string || '',
      model: formData.get('turboModel') as string,
      description: formData.get('description') as string || '',
      state: formData.get('state') as "Pièce" | "Turbo terminé",
    };

    try {
      if (selectedPart?._id){
        mutationUpdate.mutate(partData);

      }else{
        mutationAdd.mutate(partData);
      }
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      alert(`Erreur lors de la soumission de la pièce : ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des stocks</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une pièce
        </button>
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


    <DataTable data={finalParts} columns={columns} />

      <Modal
        isOpen={isAddModalOpen || (!!selectedPart&&!isHistoryModalOpen) }
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedPart(null);
        }}
        title={selectedPart ? 'Modifier la pièce' : 'Ajouter une nouvelle pièce'}
      >
        <form className="space-y-4" onSubmit={handleFormSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Référence <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="reference"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedPart?.reference || ''}
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
              defaultValue={selectedPart?.referenceOrg || ''}
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
              defaultValue={selectedPart?.vehicleType|| ''}
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
            defaultValue={selectedPart?.state|| ''}
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
              Modèle du Turbo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="turboModel"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedPart?.model || ''}
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
            defaultValue={selectedPart?.turboType || ''}
            required
          />
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Quantité <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedPart?.quantity || ''}
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
              defaultValue={selectedPart?.size || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="text"
              name="image"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedPart?.image || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <input
              type="text"
              name="description"
              className="mt-1 block w-full rounded-md"
              defaultValue={selectedPart?.description || ''}
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {selectedPart ? 'Modifier la pièce' : 'Ajouter la pièce'}
          </button>
        </form>
      </Modal>
       {/* History Modal */}
       <Modal
       isOpen={isHistoryModalOpen!=""}
       onClose={() => (setIsHistoryModalOpen(""),setSelectedPart(null))}
       title={isHistoryModalOpen=="input" ? "Ajouter au Stock":"Retirer du Stock"}
     >
       <form className="space-y-4" onSubmit={handleHistorySubmit}>
         <input
           type="number"
           value={quantity}
           onChange={(e) => setQuantity(Number(e.target.value))}
           placeholder="Quantité"
           className="w-full p-2 border rounded-md"
         />
         <textarea
           value={notes}
           onChange={(e) => setNotes(e.target.value)}
           placeholder="Ajouter une note"
           className="w-full p-2 border rounded-md"
         />
         <button
           type="submit"
           className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg"
           >
           {isHistoryModalOpen=="input" ? "Ajouter":"Retirer"}
         </button>
       </form>
     </Modal>
    </div>
  );
}
