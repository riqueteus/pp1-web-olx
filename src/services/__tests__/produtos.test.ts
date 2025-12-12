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

import * as produtosService from '../produtos';

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

describe('Produtos Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue('mock-token');
    (global.fetch as jest.Mock).mockClear();
  });

  describe('createProduto', () => {
    it('deve criar produto com sucesso', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Produto Teste',
        descricao: 'Descrição teste',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduto,
      });

      const payload = {
        nome: 'Produto Teste',
        descricao: 'Descrição teste',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA' as const,
        condicao: 'NOVO' as const,
      };

      const result = await produtosService.createProduto(1, payload);

      expect(result).toEqual(mockProduto);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/produtos/usuario/1'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
          body: JSON.stringify(payload),
        })
      );
    });

    it('deve lançar erro quando criação falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Dados inválidos' }),
      });

      const payload = {
        nome: '',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA' as const,
        condicao: 'NOVO' as const,
      };

      await expect(produtosService.createProduto(1, payload)).rejects.toThrow('Dados inválidos');
    });
  });

  describe('uploadProdutoImagem', () => {
    it('deve fazer upload de imagem com sucesso', async () => {
      const mockResponse = {
        imagem: 'imagem.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const result = await produtosService.uploadProdutoImagem(1, file);

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/produtos/1/imagem'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-token',
          }),
        })
      );
    });

    it('deve lançar erro quando upload falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 413,
        statusText: 'Payload Too Large',
        json: async () => ({ message: 'Arquivo muito grande' }),
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await expect(produtosService.uploadProdutoImagem(1, file)).rejects.toThrow('Arquivo muito grande');
    });
  });

  describe('listProdutosUsuario', () => {
    it('deve listar produtos do usuário com sucesso', async () => {
      const mockProdutos = [
        {
          id: 1,
          nome: 'Produto 1',
          preco: 100,
          categoriaProduto: 'CELULAR_TELEFONIA',
          condicao: 'NOVO',
          status: 'ATIVO',
        },
        {
          id: 2,
          nome: 'Produto 2',
          preco: 200,
          categoriaProduto: 'ELETRODOMESTICOS',
          condicao: 'USADO',
          status: 'ATIVO',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProdutos,
      });

      const result = await produtosService.listProdutosUsuario(1);

      expect(result).toEqual(mockProdutos);
      expect(result).toHaveLength(2);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/produtos/usuario/1'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('deve lançar erro quando listagem falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Usuário não encontrado' }),
      });

      await expect(produtosService.listProdutosUsuario(999)).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('getProdutoById', () => {
    it('deve buscar produto por ID com sucesso', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Produto Teste',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockProduto,
      });

      const result = await produtosService.getProdutoById(1);

      expect(result).toEqual(mockProduto);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/produtos/1'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('deve lançar erro quando produto não é encontrado', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Produto não encontrado' }),
      });

      await expect(produtosService.getProdutoById(999)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('updateProduto', () => {
    it('deve atualizar produto com sucesso e retornar JSON', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Produto Atualizado',
        preco: 150,
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'application/json',
          },
          text: async () => JSON.stringify(mockProduto),
        });

      const payload = {
        nome: 'Produto Atualizado',
        preco: 150,
      };

      const result = await produtosService.updateProduto(1, payload);

      expect(result).toEqual(mockProduto);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/produtos/1'),
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(payload),
        })
      );
    });

    it('deve buscar produto após atualização quando resposta não tem JSON', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Produto Atualizado',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProduto,
        });

      const result = await produtosService.updateProduto(1, { nome: 'Produto Atualizado' });

      expect(result).toEqual(mockProduto);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro quando atualização falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ message: 'Dados inválidos' }),
      });

      await expect(produtosService.updateProduto(1, { nome: '' })).rejects.toThrow('Dados inválidos');
    });
  });

  describe('inativarProduto', () => {
    it('deve inativar produto com sucesso', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
      });

      await produtosService.inativarProduto(1);

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/produtos/1/inativo'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('deve lançar erro quando inativação falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Produto não encontrado' }),
      });

      await expect(produtosService.inativarProduto(999)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('markAsSold', () => {
    it('deve marcar produto como vendido com sucesso e retornar JSON', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Produto',
        status: 'VENDIDO',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => 'application/json',
          },
          text: async () => JSON.stringify(mockProduto),
        });

      const result = await produtosService.markAsSold(1);

      expect(result).toEqual(mockProduto);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/produtos/1/vendido'),
        expect.objectContaining({
          method: 'PUT',
        })
      );
    });

    it('deve buscar produto após marcar como vendido quando resposta não tem JSON', async () => {
      const mockProduto = {
        id: 1,
        status: 'VENDIDO',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          headers: {
            get: () => null,
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProduto,
        });

      const result = await produtosService.markAsSold(1);

      expect(result).toEqual(mockProduto);
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('deve lançar erro quando marcação falha', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ message: 'Produto não encontrado' }),
      });

      await expect(produtosService.markAsSold(999)).rejects.toThrow('Produto não encontrado');
    });
  });

  describe('getAuthHeaders', () => {
    it('deve incluir token quando disponível', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await produtosService.listProdutosUsuario(1);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers).toHaveProperty('Authorization', 'Bearer test-token');
    });

    it('deve funcionar sem token', async () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });

      await produtosService.listProdutosUsuario(1);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers).not.toHaveProperty('Authorization');
    });
  });

  describe('getMultipartHeaders', () => {
    it('deve incluir token no upload de imagem', async () => {
      localStorageMock.getItem.mockReturnValue('test-token');
      
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ imagem: 'test.jpg' }),
      });

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      await produtosService.uploadProdutoImagem(1, file);

      const callArgs = (global.fetch as jest.Mock).mock.calls[0];
      expect(callArgs[1].headers).toHaveProperty('Authorization', 'Bearer test-token');
      expect(callArgs[1].headers).not.toHaveProperty('Content-Type');
    });
  });

  describe('tratamento de erros', () => {
    it('deve tratar erro quando resposta não é JSON', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => {
          throw new Error('Not JSON');
        },
      });

      await expect(produtosService.createProduto(1, {
        nome: 'Teste',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
      })).rejects.toThrow('Erro 500: Internal Server Error');
    });

    it('deve tratar erro quando resposta tem error ao invés de message', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Erro genérico' }),
      });

      await expect(produtosService.createProduto(1, {
        nome: 'Teste',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
      })).rejects.toThrow('Erro genérico');
    });
  });
});
