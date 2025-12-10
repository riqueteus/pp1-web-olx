const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

export type RegisterVendorPayload = {
  nome: string
  email: string
  senha: string
  cpfCnpj: string  
  telefone: string
  dataNascimento?: string
  cep: string
  logradouro: string
  numero: string
  cidade?: string
  uf?: string
  bairro?: string
  complemento?: string
  isMei?: boolean
}

export type LoginPayload = {
  email: string
  senha: string
}

export type AuthResponse = {
  token: string
  nomeUsuario: string
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
  try {
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';
      
      try {
        const errorData = await response.json();
        
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        switch (response.status) {
          case 400:
            errorMessage = 'Requisição inválida. Verifique os dados informados.';
            break;
          case 401:
          case 403:
            errorMessage = 'E-mail ou senha incorretos. Verifique suas credenciais.';
            break;
          case 404:
            errorMessage = 'Recurso não encontrado.';
            break;
          case 500:
            errorMessage = 'Erro interno do servidor. Tente novamente mais tarde.';
            break;
          default:
            errorMessage = `Erro ${response.status}: ${response.statusText}`;
        }
      }
      
      const error = new Error(errorMessage) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
}

export async function registerVendor(data: RegisterVendorPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/register/vendedor', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function login(data: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export type UserData = {
  id?: number
  nome: string
  email: string
  telefone?: string
  cpfCnpj?: string
  dataNascimento?: string
  isMei?: boolean
  cep?: string
  logradouro?: string
  numero?: string
  cidade?: string
  uf?: string
  estado?: string
  bairro?: string
  complemento?: string
  endereco?: {
    cep?: string
    logradouro?: string
    numero?: number
    cidade?: string
    estado?: string
    bairro?: string
    complemento?: string
  }
}

export type UpdateUserPayload = {
  nome?: string
  telefone?: string
  dataNascimento?: string
  cep?: string
  logradouro?: string
  numero?: string
  bairro?: string
  cidade?: string
  uf?: string
  complemento?: string
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

export async function getCurrentUser(): Promise<UserData> {
  const data = await request<any>('/api/usuarios/me', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  const endereco = data.endereco || {};
  
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    cpfCnpj: data.cpfCnpj || data.cpf_cnpj,
    dataNascimento: data.dataNascimento || data.data_nascimento,
    isMei: data.isMei !== undefined ? data.isMei : (data.is_mei !== undefined ? data.is_mei : undefined),
    cep: endereco.cep || data.cep,
    logradouro: endereco.logradouro || data.logradouro,
    numero: (endereco.numero !== undefined && endereco.numero !== null) ? String(endereco.numero) : ((data.numero !== undefined && data.numero !== null) ? String(data.numero) : undefined),
    cidade: endereco.cidade || data.cidade,
    uf: endereco.estado || data.uf || data.estado,
    estado: endereco.estado || data.uf || data.estado,
    bairro: endereco.bairro || data.bairro,
    complemento: endereco.complemento || data.complemento,
  };
}

export async function updateCurrentUser(data: UpdateUserPayload): Promise<UserData> {
  const payload: any = {
    nome: data.nome,
    telefone: data.telefone,
    dataNascimento: data.dataNascimento,
    cep: data.cep,
    logradouro: data.logradouro,
    numero: data.numero,
    bairro: data.bairro,
    cidade: data.cidade,
    uf: data.uf,
    complemento: data.complemento,
  };
  
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === null || payload[key] === '') {
      delete payload[key];
    }
  });
  
  await request<any>('/api/usuarios/me', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  
  return getCurrentUser();
}

export async function solicitarRedefinicaoSenha(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/esqueci-senha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao solicitar redefinição de senha.';
    try {
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (contentType && contentType.includes('application/json') && text.trim()) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
      } else if (text) {
        errorMessage = text;
      } else {
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
}

export async function redefinirSenha(token: string, novaSenha: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/resetar-senha`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, novaSenha }),
  });

  if (!response.ok) {
    let errorMessage = 'Erro ao redefinir senha.';
    try {
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      if (contentType && contentType.includes('application/json') && text.trim()) {
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (e) {
          errorMessage = text || errorMessage;
        }
      } else if (text) {
        errorMessage = text;
      } else {
        errorMessage = `Erro ${response.status}: ${response.statusText}`;
      }
    } catch (e) {
      errorMessage = `Erro ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }
}

export async function verifyEmail(codigo: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify?codigo=${encodeURIComponent(codigo)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (response.ok) {
      const contentType = response.headers.get('content-type');
      
      if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
        return { message: 'Sua conta foi ativada com sucesso!' };
      }
      
      try {
        const data = await response.json();
        return data.message ? data : { message: 'Sua conta foi ativada com sucesso!' };
      } catch (e) {
        return { message: 'Sua conta foi ativada com sucesso!' };
      }
    }

    let errorMessage = 'Erro ao verificar email. O código pode estar inválido ou expirado.';
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      if (response.status === 404) {
        errorMessage = 'Código de verificação não encontrado.';
      } else if (response.status === 400) {
        errorMessage = 'Código de verificação inválido.';
      }
    }
    
    throw new Error(errorMessage);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
}

