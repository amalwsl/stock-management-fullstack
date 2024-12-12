import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StockManagement from './pages/StockManagement';
import VehicleManagement from './pages/VehicleManagement';
import UserManagement from './pages/UserManagement';
import History from './pages/History';
import Settings from './pages/Settings';
import ConsulationManagement from './pages/ConsultationManagement';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/stock" element={<StockManagement />} />
              <Route path="/consultations" element={<ConsulationManagement />} />
              <Route path="/vehicles" element={<VehicleManagement />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;