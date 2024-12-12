import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const navigate = useNavigate(); // Hook de navigation

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (user) {
    navigate("/");  // Redirige vers la page d'accueil si l'utilisateur est déjà authentifié
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await login(email, password); // Connecte l'utilisateur et met à jour l'état du contexte
      console.log("la réponse est => ",response)
     if (response.ok) navigate("/");  // Redirige vers la page d'accueil après une connexion réussie
    } catch (err) {
      setLoginError('Email ou mot de passe invalide');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <LogIn className="mx-auto h-12 w-12 text-blue-500" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Connectez-vous à votre compte</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginError && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">{loginError}</div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Adresse e-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Se connecter
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
