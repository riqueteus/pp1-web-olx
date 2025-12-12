// Mock do import.meta.env - deve estar antes do import
// O jest.setup.js já faz isso, mas garantimos aqui também
if (typeof globalThis.import === 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: {
      meta: {
        env: {
          VITE_API_URL: 'http://localhost:3000',
        },
      },
    },
    writable: true,
    configurable: true,
  });
}

import * as authService from '../auth';

// Mock do fetch global
global.fetch = jest.fn();

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (global.fetch as jest.Mock).mockClear();
  });

  describe('registerVendor', () => {
    it('deve registrar vendedor com sucesso', async () => {
      const mockResponse = {
        token: 'mock-token',
        nomeUsuario: 'João Silva',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const payload = {
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'Senha123!',
        cpfCnpj: '12345678901',
        telefone: '11999999999',
        cep: '12345678',
        logradouro: 'Rua Teste',
        numero: '123',
      };

      const result = await authService.registerVendor(payload);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/register/vendedor'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });

    it('deve lançar erro quando registro falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Email já cadastrado' }),
      });

      const payload = {
        nome: 'João Silva',
        email: 'joao@example.com',
        senha: 'Senha123!',
        cpfCnpj: '12345678901',
        telefone: '11999999999',
        cep: '12345678',
        logradouro: 'Rua Teste',
        numero: '123',
      };

      await expect(authService.registerVendor(payload)).rejects.toThrow('Email já cadastrado');
    });
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockResponse = {
        token: 'mock-token',
        nomeUsuario: 'João Silva',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const payload = {
        email: 'joao@example.com',
        senha: 'Senha123!',
      };

      const result = await authService.login(payload);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/login'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(payload),
        })
      );
    });

    it('deve lançar erro quando login falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ message: 'E-mail ou senha incorretos' }),
      });

      const payload = {
        email: 'joao@example.com',
        senha: 'SenhaErrada',
      };

      await expect(authService.login(payload)).rejects.toThrow('E-mail ou senha incorretos');
    });
  });

  describe('getCurrentUser', () => {
    it('deve retornar dados do usuário atual', async () => {
      const mockUserData = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '11999999999',
        cpfCnpj: '12345678901',
        endereco: {
          cep: '12345678',
          logradouro: 'Rua Teste',
          numero: 123,
          cidade: 'São Paulo',
          estado: 'SP',
        },
      };

      localStorageMock.getItem.mockReturnValue('mock-token');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      });

      const result = await authService.getCurrentUser();

      expect(result).toEqual({
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '11999999999',
        cpfCnpj: '12345678901',
        cep: '12345678',
        logradouro: 'Rua Teste',
        numero: '123',
        cidade: 'São Paulo',
        uf: 'SP',
        estado: 'SP',
      });
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/usuarios/me'),
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('deve funcionar sem token de autenticação', async () => {
      const mockUserData = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
      };

      localStorageMock.getItem.mockReturnValue(null);
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      });

      const result = await authService.getCurrentUser();

      expect(result.nome).toBe('João Silva');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('deve tratar dados com cpf_cnpj ao invés de cpfCnpj', async () => {
      const mockUserData = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        cpf_cnpj: '12345678901',
        data_nascimento: '1990-01-01',
        is_mei: true,
      };

      localStorageMock.getItem.mockReturnValue('mock-token');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      });

      const result = await authService.getCurrentUser();

      expect(result.cpfCnpj).toBe('12345678901');
      expect(result.dataNascimento).toBe('1990-01-01');
      expect(result.isMei).toBe(true);
    });

    it('deve tratar dados sem endereco', async () => {
      const mockUserData = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        cep: '12345678',
        logradouro: 'Rua Teste',
        numero: 123,
      };

      localStorageMock.getItem.mockReturnValue('mock-token');
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockUserData,
      });

      const result = await authService.getCurrentUser();

      expect(result.cep).toBe('12345678');
      expect(result.logradouro).toBe('Rua Teste');
      expect(result.numero).toBe('123');
    });
  });

  describe('updateCurrentUser', () => {
    it('deve atualizar dados do usuário', async () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 1,
            nome: 'João Atualizado',
            email: 'joao@example.com',
          }),
        });

      const payload = {
        nome: 'João Atualizado',
        telefone: '11988888888',
      };

      const result = await authService.updateCurrentUser(payload);

      expect(result.nome).toBe('João Atualizado');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/usuarios/me'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      );
    });

    it('deve remover campos vazios do payload', async () => {
      localStorageMock.getItem.mockReturnValue('mock-token');
      
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 1,
            nome: 'João',
            email: 'joao@example.com',
          }),
        });

      const payload = {
        nome: 'João',
        telefone: '',
        cidade: undefined,
      };

      await authService.updateCurrentUser(payload);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      const body = JSON.parse(callArgs[1].body);
      
      expect(body).not.toHaveProperty('telefone');
      expect(body).not.toHaveProperty('cidade');
      expect(body).toHaveProperty('nome');
    });
  });

  describe('solicitarRedefinicaoSenha', () => {
    it('deve solicitar redefinição de senha com sucesso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await authService.solicitarRedefinicaoSenha('joao@example.com');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/esqueci-senha'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ email: 'joao@example.com' }),
        })
      );
    });

    it('deve lançar erro quando solicitação falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        headers: {
          get: () => 'application/json',
        },
        text: async () => JSON.stringify({ message: 'Email não encontrado' }),
      });

      await expect(authService.solicitarRedefinicaoSenha('inexistente@example.com')).rejects.toThrow('Email não encontrado');
    });

    it('deve tratar erro quando resposta não é JSON', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: () => 'text/plain',
        },
        text: async () => 'Erro interno',
      });

      await expect(authService.solicitarRedefinicaoSenha('test@example.com')).rejects.toThrow('Erro interno');
    });

    it('deve tratar erro de timeout', async () => {
      const abortError = new Error('A requisição demorou muito para responder');
      abortError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(authService.solicitarRedefinicaoSenha('test@example.com')).rejects.toThrow('A requisição demorou muito para responder');
    });

    it('deve tratar erro de rede', async () => {
      const networkError = new Error('Failed to fetch');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(authService.solicitarRedefinicaoSenha('test@example.com')).rejects.toThrow('Erro de conexão');
    });

    it('deve tratar erro quando JSON.parse falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: {
          get: () => 'application/json',
        },
        text: async () => 'invalid json{',
      });

      await expect(authService.solicitarRedefinicaoSenha('test@example.com')).rejects.toThrow('invalid json{');
    });
  });

  describe('redefinirSenha', () => {
    it('deve redefinir senha com sucesso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await authService.redefinirSenha('token123', 'NovaSenha123!');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/resetar-senha'),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ token: 'token123', novaSenha: 'NovaSenha123!' }),
        })
      );
    });

    it('deve lançar erro quando redefinição falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        headers: {
          get: () => 'application/json',
        },
        text: async () => JSON.stringify({ message: 'Token inválido' }),
      });

      await expect(authService.redefinirSenha('token-invalido', 'NovaSenha123!')).rejects.toThrow('Token inválido');
    });

    it('deve tratar erro quando resposta não é JSON', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        headers: {
          get: () => 'text/plain',
        },
        text: async () => 'Erro interno',
      });

      await expect(authService.redefinirSenha('token', 'senha')).rejects.toThrow('Erro interno');
    });

    it('deve tratar erro de timeout', async () => {
      const abortError = new Error('A requisição demorou muito para responder');
      abortError.name = 'AbortError';
      (global.fetch as jest.Mock).mockRejectedValueOnce(abortError);

      await expect(authService.redefinirSenha('token', 'senha')).rejects.toThrow('A requisição demorou muito para responder');
    });

    it('deve tratar erro de rede', async () => {
      const networkError = new Error('NetworkError');
      (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

      await expect(authService.redefinirSenha('token', 'senha')).rejects.toThrow('Erro de conexão');
    });
  });

  describe('verifyEmail', () => {
    it('deve verificar email com sucesso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({ message: 'Email verificado com sucesso' }),
      });

      const result = await authService.verifyEmail('codigo123');

      expect(result.message).toBe('Email verificado com sucesso');
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/auth/verify?codigo=codigo123'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('deve retornar mensagem padrão quando resposta é 204', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
        headers: {
          get: () => null,
        },
      });

      const result = await authService.verifyEmail('codigo123');

      expect(result.message).toBe('Sua conta foi ativada com sucesso!');
    });

    it('deve retornar mensagem padrão quando JSON está vazio', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: async () => {
          throw new Error('Empty');
        },
      });

      const result = await authService.verifyEmail('codigo123');

      expect(result.message).toBe('Sua conta foi ativada com sucesso!');
    });

    it('deve retornar mensagem padrão quando data não tem message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: () => 'application/json',
        },
        json: async () => ({}),
      });

      const result = await authService.verifyEmail('codigo123');

      expect(result.message).toBe('Sua conta foi ativada com sucesso!');
    });

    it('deve lançar erro quando código é inválido', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Código não encontrado' }),
      });

      await expect(authService.verifyEmail('codigo-invalido')).rejects.toThrow('Código não encontrado');
    });

    it('deve lançar erro quando código retorna error ao invés de message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Código inválido' }),
      });

      await expect(authService.verifyEmail('codigo-invalido')).rejects.toThrow('Código inválido');
    });

    it('deve tratar erro quando JSON.parse falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      await expect(authService.verifyEmail('codigo-invalido')).rejects.toThrow('Código de verificação não encontrado');
    });
  });

  describe('request helper', () => {
    it('deve tratar erro de conexão genérico', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce('Erro desconhecido');

      await expect(authService.login({ email: 'test@example.com', senha: '123' })).rejects.toThrow('Erro de conexão');
    });

    it('deve tratar diferentes códigos de status HTTP', async () => {
      const statusCodes = [400, 401, 403, 404, 500];
      
      for (const status of statusCodes) {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
          ok: false,
          status,
          statusText: 'Error',
          json: async () => {
            throw new Error('Not JSON');
          },
        });

        await expect(authService.login({ email: 'test@example.com', senha: '123' })).rejects.toThrow();
      }
    });

    it('deve tratar erro quando resposta tem error ao invés de message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Erro genérico' }),
      });

      await expect(authService.login({ email: 'test@example.com', senha: '123' })).rejects.toThrow('Erro genérico');
    });

    it('deve normalizar URL corretamente', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ token: 'test', nomeUsuario: 'Test' }),
      });

      await authService.login({ email: 'test@example.com', senha: '123' });

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[0]).toContain('/api/auth/login');
    });
  });
});
