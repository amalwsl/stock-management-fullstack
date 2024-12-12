/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
 
} from 'recharts';
import { Package, TrendingUp, TrendingDown, AlertCircle, ClipboardList, } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorMessage = await response.text();
    console.error(`Erreur lors de la récupération de ${url}:`, response.status, response.statusText, errorMessage);
    throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  const { data: stockStats = {} } = useQuery({
    queryKey: ['stockStats'],
    queryFn: () => fetcher('http://localhost:5000/api/parts/stats'),
  });

  const { data: lowStockParts = [] } = useQuery({
    queryKey: ['lowStockParts'],
    queryFn: () => fetcher('http://localhost:5000/api/parts/lowStock'),
  });


  const { data: recentStockActivity = [] } = useQuery({
    queryKey: ['recentStockActivity'],
    queryFn: () => fetcher('http://localhost:5000/api/stockHistory/recent/stock'),
  });

  const { data: recentConsultationActivity = [] } = useQuery({
    queryKey: ['recentConsultationsActivity'],
    queryFn: () => fetcher('http://localhost:5000/api/stockHistory/recent/consultation'),
  });


  
  const { data: stockMovement = [] } = useQuery({
    queryKey: ['stockMovement'],
    queryFn: () => fetcher('http://localhost:5000/api/stockHistory/movement/stock'),
  });

  const { data: consultationsMovement = [] } = useQuery({
    queryKey: ['consultationsMovement'],
    queryFn: () => fetcher('http://localhost:5000/api/stockHistory/movement/consultation'),
  });


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <StatCard
          title="Total des Pièces"
          value={stockStats.totalParts || 0}
          icon={Package}
        />
        <StatCard
          title="Total des Consultation"
          value={stockStats.totalConsultation || 0}
          icon={ClipboardList} 

          />
        <StatCard
          title="Articles en Stock Faible"
          value={lowStockParts.length || 0}
          icon={AlertCircle}
        />
        <StatCard
          title="Pièces Ajoutées (30j)"
          value={stockStats.partsAdded30d || 0}
          icon={TrendingUp}
        />
        <StatCard
          title="Pièces Utilisées (30j)"
          value={stockStats.partsUsed30d || 0}
          icon={TrendingDown}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Mouvement des Stocks par Type de Véhicule</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockMovement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="input.piece" fill="#0088FE" name="Entrée Pièce" />
                <Bar dataKey="input.finished" fill="#00C49F" name="Entrée Turbo" />
                <Bar dataKey="output.piece" fill="#FFBB28" name="Sortie Pièce" />
                <Bar dataKey="output.finished" fill="#FF8042" name="Sortie Turbo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Mouvement des Consultations par Type de Véhicule</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consultationsMovement}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="input.piece" fill="#0088FE" name="Entrée Pièce" />
                <Bar dataKey="input.finished" fill="#00C49F" name="Entrée Turbo" />
                <Bar dataKey="output.piece" fill="#FFBB28" name="Sortie Pièce" />
                <Bar dataKey="output.finished" fill="#FF8042" name="Sortie Turbo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
      {/* Low Stock Parts Chart */}

        <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Articles avec Stock {"<"} 10</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lowStockParts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reference" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" name="quantité" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
            

     {user?.role=="admin"&& <div className='flex flex-col gap-6' >
     
      {/* Recent stock Activity */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Activité Récente des stocks</h3>
          <div className="space-y-4">
            {recentStockActivity?.map((activity: any) => (
              <div
                key={activity._id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <span
                    className={`p-2 rounded-full ${
                      activity.type === 'input'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {activity.type === 'input' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  </span>
                  <div>
                    <p className="font-medium">{activity.partId?.reference} ({activity.partId?.vehicleType}) </p>
                    <p className="text-sm text-gray-500">
                      {activity.type === 'input' ? 'Ajouté' : 'Retiré'} par {activity.userId?.username}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">
                    {activity.type === 'input' ? '+' : '-'}
                    {activity.quantity}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

       {/* Recent consultation Activity */}
       <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">Activité Récente des consultations</h3>
        <div className="space-y-4">
          {recentConsultationActivity?.map((activity: any) => (
            <div
              key={activity._id}
              className="flex items-center justify-between py-3 border-b last:border-0"
            >
              <div className="flex items-center space-x-4">
                <span
                  className={`p-2 rounded-full ${
                    activity.type === 'input'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {activity.type === 'input' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </span>
                <div>
                  <p className="font-medium">{activity.consultationId?.reference}  ({activity.consultationId?.vehicleType}) </p>
                  <p className="text-sm text-gray-500">
                    {activity.type === 'input' ? 'Ajouté' : 'Retiré'} par {activity.userId?.username}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {activity.consultationId.isFixed}
                </p>
                <p className="text-sm text-gray-500">
                  {activity.consultationId.receptionDate} - {activity.consultationId.issueDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

     </div> 
}
     
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.FC<{ className?: string }>;

}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
 
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-between">
      <div className="flex items-center space-x-4">
        <Icon className="w-8 h-8 text-blue-500" />
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-xl font-semibold">{value}</p>
        </div>
      </div>
     
    </div>
  );
};

export default Dashboard;
