const API_BASE_URL = 'http://localhost:8080'

export type RegisterVendorPayload = {
  nome: string
  email: string
  senha: string
  cpfCnpj: string  
  telefone: string
  data_nascimento: string  // Alterado para corresponder ao banco de dados
  cep: string  // O banco aceita varchar(9)
  estado: string
  cidade: string
  rua: string
  numero: number
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
    const response = await fetch(`${API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
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

