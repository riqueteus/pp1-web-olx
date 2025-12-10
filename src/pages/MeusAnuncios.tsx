import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../services/auth';
import { listProdutosUsuario, deleteProduto, markAsSold, type Produto, type StatusProduto } from '../services/produtos';

type TabType = 'published' | 'sold' | 'deleted';

// Componente de Exibição de Imagem
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
          console.error(`❌ Erro ao carregar imagem do produto: ${src}`);
          
          // Tentar diferentes formatos de URL
          try {
            const url = new URL(src);
            const pathParts = url.pathname.split('/');
            const fileName = pathParts[pathParts.length - 1];
            
            // Se não tem encode, tenta com encode
            if (!src.includes('%')) {
              const encodedFileName = encodeURIComponent(fileName);
              const newUrl = `${url.origin}${url.pathname.substring(0, url.pathname.lastIndexOf('/'))}/${encodedFileName}`;
              console.log(`🔄 Tentando novamente com encode: ${newUrl}`);
              
              // Prevenir loop infinito - só tenta uma vez
              if (!img.dataset.retried) {
                img.dataset.retried = 'true';
                img.src = newUrl;
                return;
              }
            }
          } catch (err) {
            console.error('Erro ao processar URL:', err);
          }
          
          // Se já tentou ou não conseguiu, mostra placeholder
          console.error(`❌ Não foi possível carregar a imagem após tentativas`);
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | null>(null);

  // Função para construir URL da imagem
  // Tenta diferentes formatos para compatibilidade com o backend
  const getImageUrl = (imagem?: string): string | null => {
    if (!imagem) return null;
    
    // Se já é uma URL completa, retorna como está
    if (imagem.startsWith('http://') || imagem.startsWith('https://')) {
      return imagem;
    }
    
    // Se é um caminho relativo começando com /, usa diretamente
    if (imagem.startsWith('/')) {
      return `http://localhost:8080${imagem}`;
    }
    
    // Se o backend retorna apenas o nome do arquivo (sem /), usa o endpoint de imagens
    // O Spring Boot PathVariable pode tratar espaços automaticamente, mas vamos tentar sem encode primeiro
    // O onError vai tentar com encode se necessário
    return `http://localhost:8080/api/produtos/imagens/${imagem}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Buscar dados do usuário logado
        const user = await getCurrentUser();
        if (!user || !user.id) {
          throw new Error('Usuário não autenticado');
        }
        
        setUserData(user);
        
        // Buscar produtos do usuário
        const produtosList = await listProdutosUsuario(user.id);
        console.log('=== DEBUG: Produtos retornados do backend ===');
        console.log('Total de produtos:', produtosList.length);
        console.log('Produtos completos:', JSON.stringify(produtosList, null, 2));
        
        // Log detalhado para cada produto
        produtosList.forEach((produto, index) => {
          console.log(`\n--- Produto ${index + 1} ---`);
          console.log(`ID: ${produto.id}`);
          console.log(`Nome: ${produto.nome}`);
          console.log(`Campo imagem (raw):`, produto.imagem);
          console.log(`Tipo do campo imagem:`, typeof produto.imagem);
          
          if (produto.imagem) {
            const imageUrl = getImageUrl(produto.imagem);
            console.log(`URL construída: "${imageUrl}"`);
            
            // Testar se a URL está acessível
            if (imageUrl) {
              fetch(imageUrl, { method: 'HEAD' })
                .then(response => {
                  console.log(`Status da imagem: ${response.status} ${response.statusText}`);
                  if (!response.ok) {
                    console.error(`❌ ERRO: Imagem não encontrada em: ${imageUrl}`);
                  } else {
                    console.log(`✅ Imagem encontrada: ${imageUrl}`);
                  }
                })
                .catch(err => {
                  console.error(`❌ ERRO ao verificar imagem:`, err);
                });
            }
          } else {
            console.warn('⚠️ Campo imagem está vazio/null/undefined');
          }
        });
        
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

  // Filtrar produtos por status baseado na aba ativa
  const getFilteredProdutos = () => {
    if (activeTab === 'published') {
      return produtos.filter(p => p.status === 'ATIVO');
    } else if (activeTab === 'sold') {
      return produtos.filter(p => p.status === 'VENDIDO');
    } else {
      // deleted - produtos inativos
      return produtos.filter(p => p.status === 'INATIVO');
    }
  };

  const handleDeleteClick = (produtoId: number) => {
    setSelectedProdutoId(produtoId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedProdutoId) return;

    try {
      await deleteProduto(selectedProdutoId);
      // Atualizar status para INATIVO (soft delete)
      const updatedProdutos = produtos.map(p => 
        p.id === selectedProdutoId ? { ...p, status: 'INATIVO' as StatusProduto } : p
      );
      setProdutos(updatedProdutos);
      setShowDeleteModal(false);
      setSelectedProdutoId(null);
    } catch (err) {
      console.error('Erro ao excluir produto:', err);
      alert('Erro ao excluir anúncio. Tente novamente.');
      setShowDeleteModal(false);
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
      // Atualizar status para VENDIDO
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
    // Redirecionar para página de edição (você pode criar essa página depois)
    // Por enquanto, vamos apenas navegar para a página de anunciar com o ID
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

  // Função para obter array de imagens (suporta múltiplas imagens no futuro)
  const getProductImages = (produto: Produto): string[] => {
    const images: string[] = [];
    
    // Se o campo imagem for uma string única
    if (produto.imagem) {
      const imageUrl = getImageUrl(produto.imagem);
      if (imageUrl) {
        images.push(imageUrl);
      }
    }
    
    // Se no futuro o backend retornar um array de imagens, adicionar aqui
    // if (Array.isArray(produto.imagens)) {
    //   produto.imagens.forEach(img => {
    //     const url = getImageUrl(img);
    //     if (url) images.push(url);
    //   });
    // }
    
    return images;
  };

  const filteredProdutos = getFilteredProdutos();

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
                onClick={() => setActiveTab('deleted')}
                className={`${
                  activeTab === 'deleted'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm cursor-pointer`}
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
                                {/* Imagem do Produto - 40% */}
                                <div className="w-full md:w-[40%] shrink-0">
                                  <ProductImage images={images} productName={produto.nome} />
                                </div>
                                
                                {/* Conteúdo do Card - 60% */}
                                <div className="w-full md:w-[60%] p-5 flex flex-col">
                                  {/* Título e Status */}
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

                                  {/* Preço */}
                                  <div className="mb-3">
                                    <p className="text-3xl font-bold text-orange-600">{formatPrice(produto.preco)}</p>
                                  </div>

                                  {/* Características */}
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

                                  {/* Descrição */}
                                  {produto.descricao && (
                                    <div className="mb-3 flex-1">
                                      <p className="text-sm text-gray-600 line-clamp-4">{produto.descricao}</p>
                                    </div>
                                  )}

                                  {/* Data de Publicação */}
                                  {produto.dataPublicacao && (
                                    <div className="mb-3 text-xs text-gray-500">
                                      Publicado em: {formatDate(produto.dataPublicacao)}
                                    </div>
                                  )}

                                  {/* Ações - Centralizadas */}
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
                                      onClick={() => handleDeleteClick(produto.id!)}
                                      className="px-6 py-2 text-sm font-medium text-white bg-red-400 hover:bg-red-800 rounded-md transition-colors cursor-pointer"
                                    >
                                      Excluir
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
                                {/* Imagem do Produto - 40% */}
                                <div className="w-full md:w-[40%] shrink-0">
                                  <ProductImage images={images} productName={produto.nome} />
                                </div>
                                
                                {/* Conteúdo do Card - 60% */}
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

                {activeTab === 'deleted' && (
                  <>
                    {filteredProdutos.length === 0 ? (
                      <div className="text-center py-12">
                        <p className="text-gray-500">Nenhum anúncio excluído.</p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {filteredProdutos.map((produto) => {
                          const images = getProductImages(produto);
                          const caracteristicas = produto.caracteristicas || {};
                          
                          return (
                            <div key={produto.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden opacity-50">
                              <div className="flex flex-col md:flex-row">
                                {/* Imagem do Produto - 40% */}
                                <div className="w-full md:w-[40%] shrink-0">
                                  <ProductImage images={images} productName={produto.nome} />
                                </div>
                                
                                {/* Conteúdo do Card - 60% */}
                                <div className="w-full md:w-[60%] p-5 flex flex-col">
                                  <div className="mb-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <h3 className="text-xl font-bold text-gray-900">{produto.nome}</h3>
                                      <span className="px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">Excluído</span>
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

      {/* Modal de Confirmação - Excluir */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Excluir anúncio</h3>
            <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este anúncio? Esta ação não pode ser desfeita.</p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProdutoId(null);
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação - Marcar como Vendido */}
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
