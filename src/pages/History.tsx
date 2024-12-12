/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {  ArrowUpCircle, ArrowDownCircle, Edit, Trash2, PlusCircle, HelpCircle } from 'lucide-react';

const History: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('Stock');

  const { data: stockHistory } = useQuery({
    queryKey: ['stockHistory'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:5000/api/stockHistory/stock');
      return data;
    },
  });

  const { data: consultationHistory } = useQuery({
    queryKey: ['consultationHistory'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:5000/api/stockHistory/consultations');
      return data;
    },
  });

  const history = activeTab === 'Stock' ? stockHistory : consultationHistory

  const filteredHistory = history?.filter((item: any) => {
    const searchLower = search.toLowerCase();
    const finalItem = activeTab === 'Stock' ? item.partId : item.consultationId

    const matchesType = (item.type === 'input' ? 'entrée' : 'sortie').includes(searchLower);
    const matchesUser =
      typeof item.userId === 'object'
        ? item.userId?.username.toLowerCase().includes(searchLower)
        : item.userId.toLowerCase().includes(searchLower);
    const matchesPart =
      typeof finalItem === 'object'
        ? finalItem?.reference.toLowerCase().includes(searchLower)
        : finalItem?.toLowerCase().includes(searchLower);

       
    return matchesType || matchesUser || matchesPart  ;
  });

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Historique</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => handleTabChange('Stock')}
          className={`px-6 py-2 text-sm font-medium ${
            activeTab === 'Stock' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          }`}
        >
          Stock
        </button>
        <button
          onClick={() => handleTabChange('Consultations')}
          className={`px-6 py-2 text-sm font-medium ${
            activeTab === 'Consultations' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'
          }`}
        >
          Consultations
        </button>
      </div>

      {/* Search Filter */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par type, utilisateur ou pièce"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 w-full"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {activeTab === 'Stock' ? <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th> : <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réception
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sortie
                </th>
               
              </>}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pièce
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                {activeTab === 'Stock' ? (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantité
                    </th>
                   
                  </>
                ) : (
                  
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarque
                    </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory?.map((item: any) => {
                const finalItem = activeTab === 'Stock' ? item.partId : item.consultationId

                return(
                <tr key={item._id}>
                 {activeTab === 'Stock' ?  <td className="px-6 py-4 whitespace-nowrap">{item.updatedAt.slice(0, 10)}</td> : 
                  <> <td className="px-6 py-4 whitespace-nowrap">
                  {finalItem.receptionDate ? finalItem.receptionDate : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {finalItem.issueDate ? finalItem.issueDate : '-'}
                </td></>}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {typeof item.userId === 'object' ? item.userId?.username : item.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {typeof finalItem === 'object' ? finalItem?.reference : finalItem}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                  <span
                  className={`inline-flex items-center ${
                    item.type === 'input' ? 'text-green-600' : 
                    item.type === 'output' ? 'text-red-600' : 
                    item.type === 'update' ? 'text-blue-600' : 
                    item.type === 'delete' ? 'text-gray-600' : 
                    item.type === 'add' ? 'text-yellow-600' : 
                    'text-gray-500' // Default color for unknown type
                  }`}
                >
                    {
                      item.type === 'input' ? (
                        <ArrowUpCircle className="w-4 h-4 mr-1" />
                      ) : item.type === 'output' ? (
                        <ArrowDownCircle className="w-4 h-4 mr-1" />
                      ) : item.type === 'update' ? (
                        <Edit className="w-4 h-4 mr-1" />
                      ) : item.type === 'delete' ? (
                        <Trash2 className="w-4 h-4 mr-1" />
                      ) : item.type === 'add' ? (
                        <PlusCircle className="w-4 h-4 mr-1" />
                      ) : (
                        <HelpCircle className="w-4 h-4 mr-1" /> // Default icon for unknown type
                      )
                    }
                    
                      {
                        item.type === 'input' ? 'Entrée' :
                        item.type === 'output' ? 'Sortie' :
                        item.type === 'update' ? 'Mise à jour' :
                        item.type === 'delete' ? 'Suppression' :
                        item.type === 'add' ? 'Ajout' :
                        'Type inconnu'  // Default case for unknown type
                      }
                      
                    </span>
                  </td>
                  {activeTab === 'Stock' ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center ${
                          item.type === 'input' ? 'text-green-600' : 
                          item.type === 'output' ? 'text-red-600' : 
                          item.type === 'update' ? 'text-blue-600' : 
                          item.type === 'delete' ? 'text-gray-600' : 
                          item.type === 'add' ? 'text-yellow-600' : 
                          'text-gray-500' // Default color for unknown type
                        }`}
                      >
                          {item.type === 'input' || item.type === 'add'  ? '+':item.type === 'update'? " " : '-'}
                          {item.quantity}
                        </span>
                      </td>
                     
                    </>
                  ) : (
                    <>
                     
                      <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          finalItem.isFixed === "Réparé"
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                      {finalItem.isFixed? finalItem.isFixed: '-'}
                      </span>
                       
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {typeof item.notes === 'object' ? JSON.stringify(item.notes) : item.notes}
                </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default History;
