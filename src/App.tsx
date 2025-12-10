import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import RecuperacaoSenha from './pages/RecuperacaoSenha';
import VerificarEmail from './pages/VerificarEmail';
import MeusAnuncios from './pages/MeusAnuncios';
import Perfil from './pages/Perfil';
import Anunciar from './pages/Anunciar';
import { isAuthenticated } from './utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<MainLayout><Login /></MainLayout>} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/recuperacao-senha" element={<MainLayout><RecuperacaoSenha /></MainLayout>} />
        <Route path="/verificar-email" element={<VerificarEmail />} />
        
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <MeusAnuncios />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/perfil" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Perfil />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/anunciar" 
          element={
            <ProtectedRoute>
              <MainLayout>
                <Anunciar />
              </MainLayout>
            </ProtectedRoute>
          } 
        />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
