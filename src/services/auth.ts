const API_BASE_URL = 'http://localhost:8080'

export type RegisterVendorPayload = {
  nome: string
  email: string
  senha: string
  cpfCnpj: string  
  telefone: string
  dataNascimento?: string  // Opcional: obrigatório apenas para PF, formato dd/MM/yyyy
  cep: string
  logradouro: string
  numero: string  // Backend espera String
  cidade?: string
  uf?: string  // Backend espera 'uf', não 'estado'
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
    // Se headers já foram passados, usa eles, senão cria headers básicos
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
      
      // Tenta obter a mensagem de erro do corpo da resposta
      try {
        const errorData = await response.json();
        
        // Se a resposta contiver uma mensagem de erro, use-a
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {
        // Se não conseguir fazer parse do JSON, usa o status code para determinar a mensagem
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
      
      // Cria um objeto de erro personalizado com a mensagem e o status
      const error = new Error(errorMessage) as Error & { status?: number };
      error.status = response.status;
      throw error;
    }

    return response.json();
  } catch (error) {
    // Se já for um erro que lançamos, apenas propaga
    if (error instanceof Error) {
      throw error;
    }
    // Se for outro tipo de erro (ex: rede), lança com mensagem genérica
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

// Tipo para dados do usuário retornados pela API
// O backend retorna endereço como campos no nível raiz (como no cadastro)
export type UserData = {
  id?: number
  nome: string
  email: string
  telefone?: string
  cpfCnpj?: string
  dataNascimento?: string
  isMei?: boolean
  // Campos de endereço no nível raiz (como o backend espera/recebe)
  cep?: string
  logradouro?: string
  numero?: number
  cidade?: string
  estado?: string
  bairro?: string
  complemento?: string
  // Mantém compatibilidade com objeto aninhado (caso backend retorne assim)
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

// Tipo para atualização de usuário
// Baseado no Swagger: apenas nome, telefone e cep podem ser alterados
export type UpdateUserPayload = {
  nome?: string
  telefone?: string
  cep?: string
}

// Função auxiliar para adicionar token de autenticação
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
}

// Buscar dados do usuário logado
export async function getCurrentUser(): Promise<UserData> {
  const data = await request<any>('/api/usuarios/me', {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  // Extrai endereço se vier como objeto aninhado
  const endereco = data.endereco || {};
  
  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    telefone: data.telefone,
    cpfCnpj: data.cpfCnpj || data.cpf_cnpj,
    dataNascimento: data.dataNascimento || data.data_nascimento,
    isMei: data.isMei !== undefined ? data.isMei : (data.is_mei !== undefined ? data.is_mei : undefined),
    // Campos de endereço: pega do objeto endereco se existir, senão do nível raiz
    cep: endereco.cep || data.cep,
    logradouro: endereco.logradouro || data.logradouro,
    numero: (endereco.numero !== undefined && endereco.numero !== null) ? endereco.numero : ((data.numero !== undefined && data.numero !== null) ? data.numero : undefined),
    cidade: endereco.cidade || data.cidade,
    estado: endereco.estado || data.estado,
    bairro: endereco.bairro || data.bairro,
    complemento: endereco.complemento || data.complemento,
  };
}

// Atualizar dados do usuário logado
// Baseado no Swagger: apenas nome, telefone e cep podem ser alterados
export async function updateCurrentUser(data: UpdateUserPayload): Promise<UserData> {
  const payload: any = {
    nome: data.nome,
    telefone: data.telefone,
    cep: data.cep,
  };
  
  // Remove campos undefined/null
  Object.keys(payload).forEach(key => {
    if (payload[key] === undefined || payload[key] === null) {
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

export async function verifyEmail(codigo: string): Promise<{ message: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify?codigo=${encodeURIComponent(codigo)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Se a resposta for bem-sucedida (200-299)
    if (response.ok) {
      // Verifica se tem conteúdo e se é JSON
      const contentType = response.headers.get('content-type');
      
      // Se não tem conteúdo (204 No Content) ou se a conta foi ativada, considera sucesso
      if (response.status === 204 || !contentType || !contentType.includes('application/json')) {
        return { message: 'Sua conta foi ativada com sucesso!' };
      }
      
      // Tenta fazer parse do JSON
      try {
        const data = await response.json();
        return data.message ? data : { message: 'Sua conta foi ativada com sucesso!' };
      } catch (e) {
        // Se não conseguir fazer parse, mas status é OK, considera sucesso
        return { message: 'Sua conta foi ativada com sucesso!' };
      }
    }

    // Se não for OK, tenta obter mensagem de erro
    let errorMessage = 'Erro ao verificar email. O código pode estar inválido ou expirado.';
    
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.error) {
        errorMessage = errorData.error;
      }
    } catch (e) {
      // Se não conseguir fazer parse, usa mensagem padrão baseada no status
      if (response.status === 404) {
        errorMessage = 'Código de verificação não encontrado.';
      } else if (response.status === 400) {
        errorMessage = 'Código de verificação inválido.';
      }
    }
    
    throw new Error(errorMessage);
  } catch (error) {
    // Se já for um erro que lançamos, apenas propaga
    if (error instanceof Error) {
      throw error;
    }
    // Se for outro tipo de erro (ex: rede), lança com mensagem genérica
    throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
  }
}

