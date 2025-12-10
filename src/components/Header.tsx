import { Link, useNavigate, useLocation } from 'react-router-dom';
import olxLogo from '../assets/olx-logo.png';
import { clearAuthData } from '../utils/auth';
import { useState } from 'react';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = ['/', '/perfil', '/anunciar'].includes(location.pathname);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login', { replace: true });
  };

  const confirmLogout = () => {
    setShowLogoutModal(true);
  };

  return (
    <>
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <Link to="/">
                <img className="h-14 w-auto" src={olxLogo} alt="OLX" />
              </Link>
            </div>

            {isLoggedIn && (
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className={`${location.pathname === '/'
                      ? 'bg-orange-500'
                      : 'bg-purple-900 hover:bg-purple-800'
                    } px-4 py-2 rounded-md text-sm font-medium text-white cursor-pointer transition-colors duration-200`}
                >
                  Meus Anúncios
                </button>

                <button
                  onClick={() => navigate('/perfil')}
                  className={`${location.pathname === '/perfil'
                      ? 'bg-orange-500'
                      : 'bg-purple-900 hover:bg-purple-800'
                    } px-4 py-2 rounded-md text-sm font-medium text-white cursor-pointer transition-colors duration-200`}
                >
                  Perfil
                </button>

                <button
                  onClick={() => navigate('/anunciar')}
                  className={`${location.pathname === '/anunciar'
                      ? 'bg-orange-500'
                      : 'bg-purple-900 hover:bg-purple-800'
                    } px-4 py-2 rounded-md text-sm font-medium text-white cursor-pointer transition-colors duration-200`}
                >
                  Anunciar
                </button>

                <button
                  onClick={confirmLogout}
                  className="bg-purple-900 hover:bg-purple-800 px-4 py-2 rounded-md text-sm font-medium text-white cursor-pointer transition-colors duration-200"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Sair da conta</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja sair da sua conta?</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                  handleLogout();
                }}
                className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;