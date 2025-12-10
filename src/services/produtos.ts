// Normaliza a URL removendo barra no final (lazy - só valida quando usar)
const getApiBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error('VITE_API_URL não está configurada. Configure a variável de ambiente na Vercel.')
  }
  return url.replace(/\/+$/, '') // Remove barras no final
}

export type CondicaoProduto = 'NOVO' | 'USADO'
export type StatusProduto = 'ATIVO' | 'VENDIDO' | 'INATIVO'
export type CategoriaProduto = 'CELULAR_TELEFONIA' | 'ELETRODOMESTICOS' | 'CASA_DECORACAO_UTENSILIOS' | 'MODA'

export type Produto = {
  id?: number
  nome: string
  descricao?: string
  condicao: CondicaoProduto
  preco: number
  dataPublicacao?: string
  status: StatusProduto
  categoriaProduto: CategoriaProduto
  caracteristicas?: any
  imagem?: string
  vendedor?: {
    id: number
    nome: string
  }
}

export type CreateProdutoPayload = {
  nome: string
  descricao?: string
  condicao: CondicaoProduto
  preco: number
  categoriaProduto: CategoriaProduto
  caracteristicas?: any
}

export type UpdateProdutoPayload = {
  nome?: string
  descricao?: string
  condicao?: CondicaoProduto
  preco?: number
  categoriaProduto?: CategoriaProduto
  caracteristicas?: any
  status?: StatusProduto
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

function getMultipartHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function createProduto(usuarioId: number, data: CreateProdutoPayload): Promise<Produto> {
  const response = await fetch(`${getApiBaseUrl()}/api/produtos/usuario/${usuarioId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao criar produto.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function uploadProdutoImagem(produtoId: number, imagem: File): Promise<{ imagem: string }> {
  const formData = new FormData();
  formData.append('imagem', imagem);

  const response = await fetch(`${getApiBaseUrl()}/api/produtos/${produtoId}/imagem`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData,
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao fazer upload da imagem.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function listProdutosUsuario(usuarioId: number): Promise<Produto[]> {
  const response = await fetch(`${getApiBaseUrl()}/api/produtos/usuario/${usuarioId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao listar produtos.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getProdutoById(produtoId: number): Promise<Produto> {
  const response = await fetch(`${getApiBaseUrl()}/api/produtos/${produtoId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao buscar produto.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function updateProduto(produtoId: number, data: UpdateProdutoPayload): Promise<Produto> {
  const response = await fetch(`${getApiBaseUrl()}/api/produtos/${produtoId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao atualizar produto.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (text.trim()) {
      return JSON.parse(text);
    }
  }
  
  return getProdutoById(produtoId);
}

export async function deleteProduto(produtoId: number): Promise<Produto> {
  const response = await fetch(`${getApiBaseUrl()}/api/produtos/${produtoId}/inativo`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao deixar produto como inativo.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (text.trim()) {
      return JSON.parse(text);
    }
  }
  
  return getProdutoById(produtoId);
}

export async function markAsSold(produtoId: number): Promise<Produto> {
  const response = await fetch(`${getApiBaseUrl()}/api/produtos/${produtoId}/vendido`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao marcar produto como vendido.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const text = await response.text();
    if (text.trim()) {
      return JSON.parse(text);
    }
  }
  
  return getProdutoById(produtoId);
}

