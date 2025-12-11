import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { listProdutosUsuario, inativarProduto, markAsSold, type Produto, type StatusProduto } from '../services/produtos';

// Função lazy para obter a URL da API (só valida quando usar)
const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error('VITE_API_URL não está configurada. Configure a variável de ambiente na Vercel.')
  }
  return url.replace(/\/+$/, '')
}

type TabType = 'published' | 'sold' | 'inactive';

function ProductImage({ images, productName }: { images: string[]; productName: string }) {
  const imageUrl = images && images.length > 0 ? images[0] : null;

  if (!imageUrl) {
    return (
      <div className="w-full h-96 bg-gray-200 flex items-center justify-center">
        <span className="text-gray-400">Sem imagem</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-auto bg-gray-100 rounded-lg overflow-hidden">
      <img
        src={imageUrl}
        alt={productName}
        className="w-full h-auto object-cover"
        onError={(e) => {
          const img = e.currentTarget as HTMLImageElement;
          const src = img.src;
          
          try {
            const url = new URL(src);
            const pathParts = url.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            
            if (!src.includes('%')) {
              const encodedFileName = encodeURIComponent(fileName);
              const newUrl = `${url.origin}${url.pathname.substring(0, url.pathname.lastIndexOf('/'))}/${encodedFileName}`;
              
              if (!img.dataset.retried) {
                img.dataset.retried = 'true';
                img.src = newUrl;
                return;
              }
            }
          } catch (err) {
            console.error('Erro ao processar URL:', err);
          }
          
          img.style.display = 'none';
          const placeholder = img.nextElementSibling as HTMLElement;
          if (placeholder) {
            placeholder.style.display = 'flex';
          }
        }}
      />
      <div className="w-full h-full bg-gray-200 items-center justify-center hidden">
        <span className="text-gray-400">Erro ao carregar imagem</span>
      </div>
    </div>
  );
}

export default function MeusAnuncios() {
  const [activeTab, setActiveTab] = useState<TabType>('published');
  const [userData, setUserData] = useState<any>(null);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [showInativarModal, setShowInativarModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | null>(null);

  const getImageUrl = (imagem?: string): string | null => {
    if (!imagem) return null;
    
    if (imagem.startsWith('http://') || imagem.startsWith('https://')) {
      return imagem;
    }
    
    if (imagem.startsWith('/')) {
      return `${getApiBaseUrl()}${imagem}`;
    }
    
    return `${getApiBaseUrl()}/api/produtos/imagens/${imagem}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        const user = await getCurrentUser();
        if (!user || !user.id) {
          throw new Error('Usuário não autenticado');
        }
        
        setUserData(user);
        
        const produtosList = await listProdutosUsuario(user.id);
        setProdutos(produtosList);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro ao carregar seus anúncios');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getFilteredProdutos = () => {
    if (activeTab === 'published') {
      return produtos.filter(p => p.status === 'ATIVO');
    } else if (activeTab === 'sold') {
      return produtos.filter(p => p.status === 'VENDIDO');
    } else {
      return produtos.filter(p => p.status === 'INATIVO');
    }
  };

  const handleInativarClick = (produtoId: number) => {
    setSelectedProdutoId(produtoId);
    setShowInativarModal(true);
  };

  const handleInativar = async () => {
    if (!selectedProdutoId) return;

    try {
      await inativarProduto(selectedProdutoId);
      // Atualiza o status do produto localmente para INATIVO
      const updatedProdutos = produtos.map(p => 
        p.id === selectedProdutoId ? { ...p, status: 'INATIVO' as StatusProduto } : p
      );
      setProdutos(updatedProdutos);
      setShowInativarModal(false);
      setSelectedProdutoId(null);
    } catch (err) {
      console.error('Erro ao deixar produto como inativo:', err);
      if (err instanceof Error) {
        alert(`Erro ao deixar anúncio como inativo: ${err.message}`);
      } else {
        alert('Erro ao deixar anúncio como inativo. Tente novamente.');
      }
      setShowInativarModal(false);
      setSelectedProdutoId(null);
    }
  };

  const handleMarkAsSoldClick = (produtoId: number) => {
    setSelectedProdutoId(produtoId);
    setShowSoldModal(true);
  };

  const handleMarkAsSold = async () => {
    if (!selectedProdutoId) return;

    try {
      await markAsSold(selectedProdutoId);
      const updatedProdutos = produtos.map(p => 
        p.id === selectedProdutoId ? { ...p, status: 'VENDIDO' as StatusProduto } : p
      );
      setProdutos(updatedProdutos);
      setShowSoldModal(false);
      setSelectedProdutoId(null);
    } catch (err) {
      console.error('Erro ao marcar como vendido:', err);
      alert('Erro ao marcar anúncio como vendido. Tente novamente.');
      setShowSoldModal(false);
      setSelectedProdutoId(null);
    }
  };

  const handleEdit = (produtoId: number) => {
    navigate(`/anunciar?edit=${produtoId}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const getCategoriaLabel = (categoria: string) => {
    const labels: Record<string, string> = {
      'CELULAR_TELEFONIA': 'Celular e Telefonia',
      'ELETRODOMESTICOS': 'Eletrodomésticos',
      'CASA_DECORACAO_UTENSILIOS': 'Casa, Decoração e Utensílios',
      'MODA': 'Moda',
    };
    return labels[categoria] || categoria;
  };

  const getCondicaoLabel = (condicao: string) => {
    const labels: Record<string, string> = {
      'NOVO': 'Novo',
      'USADO': 'Usado',
    };
    return labels[condicao] || condicao;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getProductImages = (produto: Produto): string[] => {
    const images: string[] = [];
    
    if (produto.imagem) {
      const imageUrl = getImageUrl(produto.imagem);
      if (imageUrl) {
        images.push(imageUrl);
      }
    }
    
    return images;
  };

  const filteredProdutos = getFilteredProdutos();

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('published')}
                className={`${
                  activeTab === 'published'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm cursor-pointer`}
              >
                Publicados
              </button>
              <button
                onClick={() => setActiveTab('sold')}
                className={`${
                  activeTab === 'sold'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm cursor-pointer`}
              >
                Vendidos
              </button>
              <button
                onClick={() => setActiveTab('inactive')}
                className={`${
                  activeTab === 'inactive'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm cursor-pointer`}
              >
                Inativos
              </button>
            </nav>
          </div>

          <div className="px-6 py-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Meus Anúncios</h1>
              {userData && (
                <div className="text-sm text-gray-600">
                  Logado como: <span className="font-medium">{userData.nome || userData.email}</span>
                </div>
              )}
            </div>

            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Carregando...</p>
              </div>
            ) : (
              <>
                {activeTab === 'published' && (
                  <>
                    {filteredProdutos.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Você ainda não tem anúncios publicados.</p>
                        <Link
                          to="/anunciar"
                          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-500 hover:bg-orange-600"
                        >
                          Anunciar agora
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredProdutos.map((produto) => {
                          const images = getProductImages(produto);
                          const caracteristicas = produto.caracteristicas || {};
                          
                          return (
                            <div key={produto.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300">
                              <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-[40%] shrink-0">
                                  <ProductImage images={images} productName={produto.nome} />
                                </div>
                                
                                <div className="w-full md:w-[60%] p-5 flex flex-col">
                                  <div className="mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{produto.nome}</h3>
                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {getCategoriaLabel(produto.categoriaProduto)}
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {getCondicaoLabel(produto.condicao)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="mb-3">
                                    <p className="text-3xl font-bold text-orange-600">{formatPrice(produto.preco)}</p>
                                  </div>

                                  {Object.keys(caracteristicas).length > 0 && (
                                    <div className="mb-3 pb-3 border-b border-gray-200">
                                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Características</p>
                                      <div className="space-y-1">
                                        {Object.entries(caracteristicas).map(([key, value]) => (
                                          <div key={key} className="text-sm">
                                            <span className="text-gray-600 font-medium">{key}:</span>{' '}
                                            <span className="text-gray-900">{String(value)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {produto.descricao && (
                                    <div className="mb-3 flex-1">
                                      <p className="text-sm text-gray-600 line-clamp-4">{produto.descricao}</p>
                                    </div>
                                  )}

                                  {produto.dataPublicacao && (
                                    <div className="mb-3 text-xs text-gray-500">
                                      Publicado em: {formatDate(produto.dataPublicacao)}
                                    </div>
                                  )}

                                  <div className="flex gap-2 mt-auto pt-4 justify-center">
                                    <button
                                      onClick={() => handleEdit(produto.id!)}
                                      className="px-6 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-700 rounded-md transition-colors cursor-pointer"
                                    >
                                      Editar
                                    </button>
                                    <button
                                      onClick={() => handleMarkAsSoldClick(produto.id!)}
                                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-800 rounded-md transition-colors cursor-pointer"
                                    >
                                      Marcar como vendido
                                    </button>
                                    <button
                                      onClick={() => handleInativarClick(produto.id!)}
                                      className="px-6 py-2 text-sm font-medium text-white bg-red-400 hover:bg-red-800 rounded-md transition-colors cursor-pointer"
                                    >
                                      Deixar como inativo
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'sold' && (
                  <>
                    {filteredProdutos.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum anúncio vendido.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredProdutos.map((produto) => {
                          const images = getProductImages(produto);
                          const caracteristicas = produto.caracteristicas || {};
                          
                          return (
                            <div key={produto.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden opacity-75">
                              <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-[40%] shrink-0">
                                  <ProductImage images={images} productName={produto.nome} />
                                </div>
                                
                                <div className="w-full md:w-[60%] p-5 flex flex-col">
                                  <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="text-xl font-bold text-gray-900">{produto.nome}</h3>
                                      <span className="px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">Vendido</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {getCategoriaLabel(produto.categoriaProduto)}
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {getCondicaoLabel(produto.condicao)}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-3xl font-bold text-orange-600 mb-3">{formatPrice(produto.preco)}</p>
                                  {Object.keys(caracteristicas).length > 0 && (
                                    <div className="mb-3 pb-3 border-b border-gray-200">
                                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Características</p>
                                      <div className="space-y-1">
                                        {Object.entries(caracteristicas).map(([key, value]) => (
                                          <div key={key} className="text-sm">
                                            <span className="text-gray-600 font-medium">{key}:</span>{' '}
                                            <span className="text-gray-900">{String(value)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {produto.descricao && (
                                    <div className="mb-3 flex-1">
                                      <p className="text-sm text-gray-600 line-clamp-4">{produto.descricao}</p>
                                    </div>
                                  )}
                                  {produto.dataPublicacao && (
                                    <div className="text-xs text-gray-500 mb-3">Publicado em: {formatDate(produto.dataPublicacao)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'inactive' && (
                  <>
                    {filteredProdutos.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum anúncio inativo.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredProdutos.map((produto) => {
                          const images = getProductImages(produto);
                          const caracteristicas = produto.caracteristicas || {};
                          
                          return (
                            <div key={produto.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden opacity-50">
                              <div className="flex flex-col md:flex-row">
                                <div className="w-full md:w-[40%] shrink-0">
                                  <ProductImage images={images} productName={produto.nome} />
                                </div>
                                
                                <div className="w-full md:w-[60%] p-5 flex flex-col">
                                  <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="text-xl font-bold text-gray-900">{produto.nome}</h3>
                                      <span className="px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">Inativo</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap mb-3">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        {getCategoriaLabel(produto.categoriaProduto)}
                                      </span>
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                        {getCondicaoLabel(produto.condicao)}
                                      </span>
                                    </div>
                                  </div>
                                  <p className="text-3xl font-bold text-orange-600 mb-3">{formatPrice(produto.preco)}</p>
                                  {Object.keys(caracteristicas).length > 0 && (
                                    <div className="mb-3 pb-3 border-b border-gray-200">
                                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Características</p>
                                      <div className="space-y-1">
                                        {Object.entries(caracteristicas).map(([key, value]) => (
                                          <div key={key} className="text-sm">
                                            <span className="text-gray-600 font-medium">{key}:</span>{' '}
                                            <span className="text-gray-900">{String(value)}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {produto.descricao && (
                                    <div className="mb-3 flex-1">
                                      <p className="text-sm text-gray-600 line-clamp-4">{produto.descricao}</p>
                                    </div>
                                  )}
                                  {produto.dataPublicacao && (
                                    <div className="text-xs text-gray-500 mb-3">Publicado em: {formatDate(produto.dataPublicacao)}</div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {showInativarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Deixar anúncio como inativo</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja deixar este anúncio como inativo? Ele será movido para a aba de inativos.</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowInativarModal(false);
                  setSelectedProdutoId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleInativar}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Deixar como inativo
              </button>
            </div>
          </div>
        </div>
      )}

      {showSoldModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Marcar como vendido</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja marcar este anúncio como vendido? Ele será movido para a aba de vendidos.</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSoldModal(false);
                  setSelectedProdutoId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleMarkAsSold}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Marcar como vendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
