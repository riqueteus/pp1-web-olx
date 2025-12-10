import { useState, useRef, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createProduto, updateProduto, uploadProdutoImagem, getProdutoById, type CategoriaProduto, type CondicaoProduto } from '../services/produtos';
import { getCurrentUser } from '../services/auth';

type FormData = {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: 'new' | 'used' | 'semi-new';
  caracteristica1: string;
  caracteristica2: string;
  caracteristica3: string;
};

export default function Anunciar() {
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditMode = !!editId;

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'used',
    caracteristica1: '',
    caracteristica2: '',
    caracteristica3: '',
  });
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(isEditMode);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const categoriaMap: Record<string, CategoriaProduto> = {
    'Celulares': 'CELULAR_TELEFONIA',
    'Eletrodomésticos': 'ELETRODOMESTICOS',
    'Casa': 'CASA_DECORACAO_UTENSILIOS',
    'Moda': 'MODA',
  };

  const categories = [
    { value: 'Celulares', label: 'Celular e Telefonia' },
    { value: 'Eletrodomésticos', label: 'Eletrodomésticos' },
    { value: 'Casa', label: 'Casa, Decoração e Utensílios' },
    { value: 'Moda', label: 'Moda' },
  ];

  const caracteristicasPorCategoria: Record<string, { label1: string; label2: string; label3: string }> = {
    'Celulares': {
      label1: 'Marca',
      label2: 'Modelo',
      label3: 'Capacidade de Armazenamento'
    },
    'Eletrodomésticos': {
      label1: 'Marca',
      label2: 'Modelo',
      label3: 'Voltagem'
    },
    'Casa': {
      label1: 'Material',
      label2: 'Dimensões',
      label3: 'Cor'
    },
    'Moda': {
      label1: 'Tamanho',
      label2: 'Marca',
      label3: 'Cor'
    }
  };

  const categoriaReverseMap: Record<CategoriaProduto, string> = {
    'CELULAR_TELEFONIA': 'Celulares',
    'ELETRODOMESTICOS': 'Eletrodomésticos',
    'CASA_DECORACAO_UTENSILIOS': 'Casa',
    'MODA': 'Moda',
  };

  useEffect(() => {
    const loadProductData = async () => {
      if (!isEditMode || !editId) return;

      try {
        setLoading(true);
        const produto = await getProdutoById(Number(editId));

        const categoriaFrontend = categoriaReverseMap[produto.categoriaProduto] || '';
        
        const newFormData: FormData = {
          title: produto.nome || '',
          description: produto.descricao || '',
          price: produto.preco ? produto.preco.toFixed(2).replace('.', ',') : '',
          category: categoriaFrontend,
          condition: produto.condicao === 'NOVO' ? 'new' : 'used',
          caracteristica1: '',
          caracteristica2: '',
          caracteristica3: '',
        };

        if (produto.caracteristicas && categoriaFrontend) {
          const categoriaLabels = caracteristicasPorCategoria[categoriaFrontend];
          if (categoriaLabels) {
            const caracteristicas = produto.caracteristicas as Record<string, string>;
            newFormData.caracteristica1 = caracteristicas[categoriaLabels.label1] || '';
            newFormData.caracteristica2 = caracteristicas[categoriaLabels.label2] || '';
            newFormData.caracteristica3 = caracteristicas[categoriaLabels.label3] || '';
          }
        }

        setFormData(newFormData);

        if (produto.imagem) {
          const imageUrl = `http://localhost:8080/api/produtos/imagens/${encodeURIComponent(produto.imagem)}`;
          setPreviewUrl(imageUrl);
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        setError('Erro ao carregar dados do produto. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [isEditMode, editId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const newPreviewUrl = URL.createObjectURL(file);
      
      setImage(file);
      setPreviewUrl(newPreviewUrl);
      setError('');
    }
  };

  const removeImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (!formData.category) {
      setError('Selecione uma categoria');
      return;
    }
    
    if (!isEditMode && !image) {
      setError('Adicione uma imagem do produto');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const precoStr = formData.price.replace(/[^\d,.]/g, '').replace(',', '.');
      const preco = parseFloat(precoStr);
      if (isNaN(preco) || preco <= 0) {
        throw new Error('Preço inválido. Informe um valor maior que zero.');
      }

      const condicao: CondicaoProduto = formData.condition === 'new' ? 'NOVO' : 'USADO';

      const categoriaProduto = categoriaMap[formData.category];
      if (!categoriaProduto) {
        throw new Error('Categoria inválida');
      }

      const caracteristicas: Record<string, string> = {};
      const categoriaLabels = caracteristicasPorCategoria[formData.category];
      
      if (categoriaLabels) {
        if (formData.caracteristica1.trim()) {
          caracteristicas[categoriaLabels.label1] = formData.caracteristica1.trim();
        }
        if (formData.caracteristica2.trim()) {
          caracteristicas[categoriaLabels.label2] = formData.caracteristica2.trim();
        }
        if (formData.caracteristica3.trim()) {
          caracteristicas[categoriaLabels.label3] = formData.caracteristica3.trim();
        }
      }

      if (isEditMode && editId) {
        await updateProduto(Number(editId), {
          nome: formData.title.trim(),
          descricao: formData.description.trim(),
          condicao,
          preco,
          categoriaProduto,
          caracteristicas: Object.keys(caracteristicas).length > 0 ? caracteristicas : undefined,
        });

        if (image) {
          await uploadProdutoImagem(Number(editId), image);
        }
      } else {
        const userData = await getCurrentUser();
        if (!userData || !userData.id) {
          throw new Error('Usuário não autenticado');
        }

        const produto = await createProduto(userData.id, {
          nome: formData.title.trim(),
          descricao: formData.description.trim(),
          condicao,
          preco,
          categoriaProduto,
          caracteristicas: Object.keys(caracteristicas).length > 0 ? caracteristicas : undefined,
        });

        if (image) {
          await uploadProdutoImagem(produto.id!, image);
        }
      }

      navigate('/meus-anuncios');
      
    } catch (error) {
      console.error(`Erro ao ${isEditMode ? 'atualizar' : 'publicar'} anúncio:`, error);
      if (error instanceof Error) {
        setError(error.message || `Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'publicar'} o anúncio. Tente novamente.`);
      } else {
        setError(`Ocorreu um erro ao ${isEditMode ? 'atualizar' : 'publicar'} o anúncio. Tente novamente.`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Editar Anúncio' : 'Criar Anúncio'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {isEditMode ? 'Atualize os detalhes do seu anúncio' : 'Preencha os detalhes do seu anúncio'}
            </p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Carregando dados do produto...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Título do anúncio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    placeholder="Ex: iPhone 12 128GB Azul"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Categoria <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Estado do produto <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-2 space-x-4 flex">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="condition"
                        value="new"
                        checked={formData.condition === 'new'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Novo</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        name="condition"
                        value="used"
                        checked={formData.condition === 'used'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Usado</span>
                    </label>
                  </div>
                </div>

                <div className="w-1/3">
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                    Preço <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                      type="text"
                      name="price"
                      id="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="focus:ring-orange-500 focus:border-orange-500 block w-full pl-9 pr-12 sm:text-sm border-gray-300 rounded-md"
                      placeholder="0,00"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Descrição <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="description"
                      name="description"
                      rows={6}
                      className="shadow-sm focus:ring-orange-500 focus:border-orange-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                      placeholder="Descreva detalhadamente o seu produto..."
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Inclua detalhes como especificações técnicas, estado de conservação, motivo da venda, etc.
                  </p>
                </div>

                {formData.category && caracteristicasPorCategoria[formData.category] && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Características do Produto</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="caracteristica1" className="block text-sm font-medium text-gray-700">
                          {caracteristicasPorCategoria[formData.category].label1}
                        </label>
                        <input
                          type="text"
                          id="caracteristica1"
                          name="caracteristica1"
                          value={formData.caracteristica1}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                          placeholder={`Ex: ${caracteristicasPorCategoria[formData.category].label1}`}
                        />
                      </div>
                      <div>
                        <label htmlFor="caracteristica2" className="block text-sm font-medium text-gray-700">
                          {caracteristicasPorCategoria[formData.category].label2}
                        </label>
                        <input
                          type="text"
                          id="caracteristica2"
                          name="caracteristica2"
                          value={formData.caracteristica2}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                          placeholder={`Ex: ${caracteristicasPorCategoria[formData.category].label2}`}
                        />
                      </div>
                      <div>
                        <label htmlFor="caracteristica3" className="block text-sm font-medium text-gray-700">
                          {caracteristicasPorCategoria[formData.category].label3}
                        </label>
                        <input
                          type="text"
                          id="caracteristica3"
                          name="caracteristica3"
                          value={formData.caracteristica3}
                          onChange={handleInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                          placeholder={`Ex: ${caracteristicasPorCategoria[formData.category].label3}`}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Foto {!isEditMode && <span className="text-red-500">*</span>}
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    {isEditMode 
                      ? 'Adicione uma nova foto. A foto existente será substituída.'
                      : 'Adicione uma foto do produto.'}
                  </p>
                  
                  {previewUrl && (
                    <div className="mt-2 mb-4 relative inline-block">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-48 w-auto object-cover rounded-md"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                        title="Remover imagem"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-orange-600 hover:text-orange-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500"
                        >
                          <span>Enviar arquivos</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF até 10MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 mr-3"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Atualizando...' : 'Publicando...'}
                    </>
                  ) : (isEditMode ? 'Atualizar anúncio' : 'Publicar anúncio')}
                </button>
              </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
