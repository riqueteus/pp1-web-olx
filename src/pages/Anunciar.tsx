import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuthData } from '../utils/auth';

type FormData = {
  title: string;
  description: string;
  price: string;
  category: string;
  condition: 'new' | 'used' | 'semi-new';
};

export default function Anunciar() {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: 'used',
  });
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const categories = [
    'Eletrônicos',
    'Celulares',
    'Informática',
    'Casa',
    'Esporte',
    'Moda',
    'Veículos',
    'Imóveis',
    'Outros'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      
      // Check if adding these files would exceed 10 images
      if (images.length + files.length > 10) {
        setError('Você pode adicionar no máximo 10 imagens');
        return;
      }
      
      // Create preview URLs
      const newPreviewUrls = files.map(file => URL.createObjectURL(file));
      
      setImages(prev => [...prev, ...files]);
      setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      const newUrls = [...prev];
      URL.revokeObjectURL(newUrls[index]);
      newUrls.splice(index, 1);
      return newUrls;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!formData.title.trim() || !formData.description.trim() || !formData.price) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    
    if (images.length === 0) {
      setError('Adicione pelo menos uma imagem do produto');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const userData = getAuthData();
      if (!userData) {
        throw new Error('Usuário não autenticado');
      }
      
      // In a real app, you would upload the images to a storage service
      // and then send the form data along with the image URLs to your backend
      const formDataToSend = new FormData();
      
      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });
      
      // Append images
      images.forEach((image, index) => {
        formDataToSend.append(`image${index}`, image);
      });
      
      // Example API call (commented out as we don't have a real endpoint)
      // const response = await fetch('/api/ads', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      //   },
      //   body: formDataToSend
      // });
      
      // if (!response.ok) {
      //   throw new Error('Erro ao publicar anúncio');
      // }
      
      // For demo purposes, we'll just log the form data and navigate to the home page
      console.log('Form data to submit:', {
        ...formData,
        images: images.map(img => img.name)
      });
      
      // Show success message and redirect to home
      alert('Anúncio publicado com sucesso!');
      navigate('/');
      
    } catch (error) {
      console.error('Erro ao publicar anúncio:', error);
      setError('Ocorreu um erro ao publicar o anúncio. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Criar Anúncio</h1>
            <p className="mt-1 text-sm text-gray-600">Preencha os detalhes do seu anúncio</p>
          </div>

          <div className="px-6 py-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Title */}
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

                {/* Category */}
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
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
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
                        value="semi-new"
                        checked={formData.condition === 'semi-new'}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300"
                      />
                      <span className="ml-2 text-sm text-gray-700">Semi-novo</span>
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

                {/* Price */}
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

                {/* Description */}
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

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fotos <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-500 mb-2">
                    Adicione até 10 fotos. A primeira foto será a foto de capa.
                  </p>
                  
                  {/* Image preview grid */}
                  {previewUrls.length > 0 && (
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
                      {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={url}
                            alt={`Preview ${index + 1}`}
                            className="h-32 w-full object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Remover imagem"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* File input */}
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
                            multiple
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
                      Publicando...
                    </>
                  ) : 'Publicar anúncio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
