import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardOrganizador from './pages/DashboardOrganizador';
import DashboardArbitro from './pages/DashboardArbitro';
import DashboardParticipante from './pages/DashboardParticipante';

// Protege rutas: si no hay token redirige al login
const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    return token ? children : <Navigate to="/" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* Rutas protegidas por rol */}
                <Route path="/dashboard-admin" element={<PrivateRoute><DashboardAdmin /></PrivateRoute>} />
                <Route path="/dashboard-organizador" element={<PrivateRoute><DashboardOrganizador /></PrivateRoute>} />
                <Route path="/dashboard-arbitro" element={<PrivateRoute><DashboardArbitro /></PrivateRoute>} />
                <Route path="/dashboard-participante" element={<PrivateRoute><DashboardParticipante /></PrivateRoute>} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
