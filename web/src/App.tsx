import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import EquipmentPage from './pages/Equipment';
import WorkCentersPage from './pages/WorkCenters';
import MaintenanceKanban from './pages/MaintenanceKanban';
import MaintenanceCalendar from './pages/MaintenanceCalendar';
import RequestsPage from './pages/Requests';
import Login from './pages/Login';
import Register from './pages/Register';
import TeamsPage from './pages/Teams';
import RequestDetailPage from './pages/RequestDetail';
import EquipmentDetailPage from './pages/EquipmentDetail';
import CategoriesPage from './pages/Categories'; // Import CategoriesPage
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout><Outlet /></Layout>}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/equipment" element={<EquipmentPage />} />
              <Route path="/equipment/new" element={<EquipmentDetailPage />} />
              <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
              <Route path="/work-centers" element={<WorkCentersPage />} />
              <Route path="/requests" element={<RequestsPage />} />
              <Route path="/requests/new" element={<RequestDetailPage isNew={true} />} />
              <Route path="/requests/:id" element={<RequestDetailPage />} />
              <Route path="/kanban" element={<MaintenanceKanban />} />
              <Route path="/calendar" element={<MaintenanceCalendar />} />
              <Route path="/teams" element={<TeamsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
