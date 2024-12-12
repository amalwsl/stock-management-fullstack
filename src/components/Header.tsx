import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate=useNavigate()


  const handleLogout=():void=>{
    logout()
    navigate("/login")
  }

  return (
    <header className="bg-white shadow-sm">
      <div className="w-full  px-6  py-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">CRM de gestion des stocks</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-gray-500" />
              <span className="text-sm text-gray-700">{user?.username}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {user?.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;