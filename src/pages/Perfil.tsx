import { useState, useEffect } from 'react';
import { getCurrentUser, updateCurrentUser, type UserData } from '../services/auth';

export default function Perfil() {
  const [userData, setUserData] = useState<UserData>({ nome: '', email: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Função para buscar dados do usuário
  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const data = await getCurrentUser();
      setUserData(data);
      setError('');
    } catch (error) {
      setError('Erro ao carregar dados do perfil. Tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar dados do usuário ao carregar
  useEffect(() => {
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
    setSuccess('');
    
    if (!userData.nome) {
      setError('Nome é obrigatório');
      return;
    }

    try {
      setIsSaving(true);
      
      // Prepara dados para atualização
      const updateData: any = {
        nome: userData.nome,
        telefone: userData.telefone,
        cep: userData.cep,
        logradouro: userData.logradouro,
        numero: userData.numero,
        bairro: userData.bairro,
        cidade: userData.cidade,
        uf: userData.uf || userData.estado,  // Usa 'uf' se disponível, senão 'estado'
        complemento: userData.complemento,
      };

      // Adiciona dataNascimento se existir (converte para formato dd/MM/yyyy que o backend espera)
      if (userData.dataNascimento && userData.dataNascimento.trim()) {
        const dateValue = userData.dataNascimento.trim();
        // Converte para o formato que o backend espera (dd/MM/yyyy)
        updateData.dataNascimento = parseDateForBackend(dateValue);
      }

      await updateCurrentUser(updateData);
      
      // Recarrega dados do servidor para garantir que está mostrando os dados atualizados
      const refreshedData = await getCurrentUser();
      setUserData(refreshedData);
      
      setIsEditing(false);
      setSuccess('Perfil atualizado com sucesso!');
      
      // Limpa mensagem de sucesso após 3 segundos
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      if (error instanceof Error) {
        setError(error.message || 'Erro ao atualizar perfil. Tente novamente mais tarde.');
      } else {
        setError('Erro ao atualizar perfil. Tente novamente mais tarde.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Formatar data para exibição (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
    }
  };

  // Converter data de YYYY-MM-DD para dd/MM/yyyy (formato do backend)
  const parseDateForBackend = (dateString: string): string => {
    if (!dateString) return '';
    try {
      // Se já está no formato dd/MM/yyyy, retorna como está
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        return dateString;
      }
      // Se está no formato YYYY-MM-DD, converte para dd/MM/yyyy
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
      }
    } catch {
      // Se não conseguir fazer parse, retorna como está
    }
    return dateString;
  };

  // Formatar data para input (YYYY-MM-DD -> DD/MM/YYYY)
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch {
      return dateString;
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

            {success && (
              <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Nome */}
                <div>
                  <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nome"
                      id="nome"
                      value={userData.nome || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      required
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.nome || 'Não informado'}</p>
                  )}
                </div>

                {/* Email - Somente leitura */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    E-mail
                  </label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-md">
                    {userData.email}
                  </p>
                </div>

                {/* CPF/CNPJ - Somente leitura */}
                <div>
                  <label htmlFor="cpfCnpj" className="block text-sm font-medium text-gray-700">
                    CPF/CNPJ
                  </label>
                  <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-md">
                    {userData.cpfCnpj || 'Não informado'}
                  </p>
                </div>

                {/* Telefone */}
                <div>
                  <label htmlFor="telefone" className="block text-sm font-medium text-gray-700">
                    Telefone
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="telefone"
                      id="telefone"
                      value={userData.telefone || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                      placeholder="(00) 00000-0000"
                    />
                  ) : (
                    <p className="mt-1 text-gray-900">{userData.telefone || 'Não informado'}</p>
                  )}
                </div>

                {/* Data de Nascimento - Editável (mostra se for pessoa física) */}
                {userData.cpfCnpj && userData.cpfCnpj.replace(/\D/g, '').length === 11 && (
                  <div>
                    <label htmlFor="dataNascimento" className="block text-sm font-medium text-gray-700">
                      Data de Nascimento
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="dataNascimento"
                        id="dataNascimento"
                        value={userData.dataNascimento ? formatDateForInput(userData.dataNascimento) : ''}
                        onChange={(e) => {
                          // Formata enquanto digita (DD/MM/YYYY)
                          const value = e.target.value.replace(/\D/g, '');
                          let formatted = value;
                          if (value.length > 2) {
                            formatted = value.slice(0, 2) + '/' + value.slice(2);
                          }
                          if (value.length > 4) {
                            formatted = value.slice(0, 2) + '/' + value.slice(2, 4) + '/' + value.slice(4, 8);
                          }
                          setUserData(prev => ({
                            ...prev,
                            dataNascimento: formatted
                          }));
                        }}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        placeholder="DD/MM/AAAA"
                        maxLength={10}
                      />
                    ) : (
                      <p className="mt-1 text-gray-900">{userData.dataNascimento ? formatDate(userData.dataNascimento) : 'Não informado'}</p>
                    )}
                  </div>
                )}

                {/* Is MEI - Somente leitura */}
                {userData.isMei !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Conta
                    </label>
                    <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded-md">
                      {userData.isMei ? 'Sim' : 'Não'}
                    </p>
                  </div>
                )}

                {/* Endereço */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* CEP */}
                    <div>
                      <label htmlFor="cep" className="block text-sm font-medium text-gray-700">
                        CEP
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="cep"
                          id="cep"
                          value={userData.cep || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                          placeholder="00000000"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{userData.cep || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Logradouro */}
                    <div className="md:col-span-2">
                      <label htmlFor="logradouro" className="block text-sm font-medium text-gray-700">
                        Logradouro (Rua)
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="logradouro"
                          id="logradouro"
                          value={userData.logradouro || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{userData.logradouro || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Número */}
                    <div>
                      <label htmlFor="numero" className="block text-sm font-medium text-gray-700">
                        Número
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="numero"
                          id="numero"
                          value={userData.numero || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{userData.numero || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Complemento */}
                    <div>
                      <label htmlFor="complemento" className="block text-sm font-medium text-gray-700">
                        Complemento
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="complemento"
                          id="complemento"
                          value={userData.complemento || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{userData.complemento || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Bairro */}
                    <div>
                      <label htmlFor="bairro" className="block text-sm font-medium text-gray-700">
                        Bairro
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="bairro"
                          id="bairro"
                          value={userData.bairro || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{userData.bairro || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Cidade */}
                    <div>
                      <label htmlFor="cidade" className="block text-sm font-medium text-gray-700">
                        Cidade
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="cidade"
                          id="cidade"
                          value={userData.cidade || ''}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{userData.cidade || 'Não informado'}</p>
                      )}
                    </div>

                    {/* Estado (UF) */}
                    <div>
                      <label htmlFor="uf" className="block text-sm font-medium text-gray-700">
                        Estado (UF)
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="uf"
                          id="uf"
                          value={userData.uf || userData.estado || ''}
                          onChange={(e) => {
                            setUserData(prev => ({
                              ...prev,
                              uf: e.target.value.toUpperCase(),
                              estado: e.target.value.toUpperCase()  // Mantém sincronizado
                            }));
                          }}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                          placeholder="Ex: SP"
                          maxLength={2}
                        />
                      ) : (
                        <p className="mt-1 text-gray-900">{userData.uf || userData.estado || 'Não informado'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex space-x-3">
                {isEditing ? (
                  <>
                    <button
                      type="button"
                      onClick={async () => {
                        setIsEditing(false);
                        setError('');
                        setSuccess('');
                        // Recarrega dados do servidor ao cancelar para descartar alterações
                        try {
                          const refreshedData = await getCurrentUser();
                          setUserData(refreshedData);
                        } catch (error) {
                          console.error('Erro ao recarregar dados:', error);
                        }
                      }}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                      disabled={isSaving}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex justify-center rounded-md border border-transparent bg-orange-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSaving ? 'Salvando...' : 'Salvar alterações'}
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
