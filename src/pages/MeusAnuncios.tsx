import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAuthData } from '../utils/auth';

type TabType = 'published' | 'sold' | 'deleted';

export default function MeusAnuncios() {
  const [activeTab, setActiveTab] = useState<TabType>('published');
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    // Fetch user data
    const fetchUserData = async () => {
      try {
        const data = await getAuthData();
        if (data) {
          setUserData(data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('published')}
                className={`${
                  activeTab === 'published'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Publicados
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`${
                  activeTab === 'sold'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Vendidos
              </button>
              <button
                onClick={() => setActiveTab('deleted')}
                className={`${
                  activeTab === 'deleted'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm`}
              >
                Excluídos
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Meus Anúncios</h1>
              {userData && (
                <div className="text-sm text-gray-600">
                  Logado como: <span className="font-medium">{userData.name || userData.email}</span>
                </div>
              )}
            </div>
            
            {activeTab === 'published' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Você ainda não tem anúncios publicados.</p>
                <Link
                  to="/anunciar"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600"
                >
                  Anunciar agora
                </Link>
              </div>
            )}

            {activeTab === 'sold' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum anúncio vendido.</p>
              </div>
            )}

            {activeTab === 'deleted' && (
              <div className="text-center py-12">
                <p className="text-gray-500">Nenhum anúncio excluído.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
