import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPanelPage from './pages/AdminPanelPage';
import RisksPage from './pages/RisksPage';
import ResourcesPage from './pages/ResourcesPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectDetailsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPanelPage />} />
        <Route path="/risks" element={<RisksPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
