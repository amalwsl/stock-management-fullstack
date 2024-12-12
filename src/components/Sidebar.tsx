import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Package,
  Car,
  Users,
  History,
  Settings,
  ClipboardList, // Import the new icon
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/stock', icon: Package, label: 'Gestion du stock' },
    { to: '/consultations', icon: ClipboardList, label: 'Gestion des consultations' }, // Updated icon
    { to: '/vehicles', icon: Car, label: 'Véhicules' },
    ...(isAdmin ? [
      { to: '/users', icon: Users, label: 'Gestion des utilisateurs' },
      { to: '/history', icon: History, label: 'Historique' }
    ] : []),
    { to: '/settings', icon: Settings, label: 'Paramètres' }
  ];

  return (
    <div className="side-bar bg-gray-800 text-white w-72 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform -translate-x-full md:relative md:translate-x-0 transition duration-200 ease-in-out">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
