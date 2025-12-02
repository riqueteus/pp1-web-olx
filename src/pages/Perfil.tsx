import { useState, useEffect } from 'react';
import { getAuthData, saveAuthData } from '../utils/auth';

type UserData = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

export default function Perfil() {
  const [userData, setUserData] = useState<UserData>({ name: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getAuthData();
        if (data) {
          setUserData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            address: data.address || ''
          });
        }
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setError('Erro ao carregar dados do perfil. Tente novamente mais tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!userData.name || !userData.email) {
      setError('Nome e e-mail são obrigatórios');
      return;
    }

    try {
      // Here you would typically make an API call to update the user data
      // For now, we'll just update the local storage
      const token = localStorage.getItem('authToken');
      if (token) {
        saveAuthData(token, userData);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      setError('Erro ao atualizar perfil. Tente novamente mais tarde.');
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Meu Perfil</h1>
            <p className="mt-1 text-sm text-gray-600">Gerencie suas informações pessoais</p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={userData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      required
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      id="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      required
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      value={userData.phone || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="(00) 00000-0000"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.phone || 'Não informado'}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Endereço
                  </label>
                  {isEditing ? (
                    <textarea
                      name="address"
                      id="address"
                      rows={3}
                      value={userData.address || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="Rua, número, bairro, cidade - Estado"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900 whitespace-pre-line">
                      {userData.address || 'Não informado'}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      Salvar alterações
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                  >
                    Editar perfil
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
