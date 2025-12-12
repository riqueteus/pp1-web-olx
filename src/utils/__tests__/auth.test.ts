import * as authUtils from '../auth';

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock do console.error para evitar logs nos testes
const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Auth Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    consoleErrorSpy.mockClear();
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('getAuthData', () => {
    it('deve retornar dados do usuário quando token e userData existem', () => {
      const mockUserData = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
      };

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(JSON.stringify(mockUserData));

      const result = authUtils.getAuthData();

      expect(result).toEqual(mockUserData);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('userData');
    });

    it('deve retornar null quando token não existe', () => {
      localStorageMock.getItem
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(JSON.stringify({ id: 1 }));

      const result = authUtils.getAuthData();

      expect(result).toBeNull();
    });

    it('deve retornar null quando userData não existe', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(null);

      const result = authUtils.getAuthData();

      expect(result).toBeNull();
    });

    it('deve retornar null quando ambos token e userData não existem', () => {
      localStorageMock.getItem
        .mockReturnValueOnce(null)
        .mockReturnValueOnce(null);

      const result = authUtils.getAuthData();

      expect(result).toBeNull();
    });

    it('deve retornar null quando JSON.parse falha', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce('invalid-json{');

      const result = authUtils.getAuthData();

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('saveAuthData', () => {
    it('deve salvar token e userData com sucesso', () => {
      const token = 'mock-token';
      const userData = {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
      };

      const result = authUtils.saveAuthData(token, userData);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('authToken', token);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('userData', JSON.stringify(userData));
      expect(localStorageMock.setItem).toHaveBeenCalledWith('tokenExpiry', expect.any(String));
    });

    it('deve definir tokenExpiry para 24 horas no futuro', () => {
      const token = 'mock-token';
      const userData = { id: 1 };

      authUtils.saveAuthData(token, userData);

      const expiryCall = localStorageMock.setItem.mock.calls.find(
        call => call[0] === 'tokenExpiry'
      );
      expect(expiryCall).toBeDefined();
      
      const expiryDate = new Date(expiryCall![1]);
      const now = new Date();
      const hoursDiff = (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      expect(hoursDiff).toBeGreaterThan(23);
      expect(hoursDiff).toBeLessThan(25);
    });

    it('deve retornar false quando setItem falha', () => {
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = authUtils.saveAuthData('token', { id: 1 });

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('clearAuthData', () => {
    it('deve remover todos os dados de autenticação', () => {
      const result = authUtils.clearAuthData();

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('authToken');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('userData');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('tokenExpiry');
    });

    it('deve retornar false quando removeItem falha', () => {
      localStorageMock.removeItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = authUtils.clearAuthData();

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando token existe e é válido', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(futureDate.toISOString());

      const result = authUtils.isAuthenticated();

      expect(result).toBe(true);
    });

    it('deve retornar false quando token não existe', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authUtils.isAuthenticated();

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('deve retornar false quando token existe mas está expirado', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(pastDate.toISOString());

      const result = authUtils.isAuthenticated();

      expect(result).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('deve retornar true quando token existe mas não há expiryDate', () => {
      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(null);

      const result = authUtils.isAuthenticated();

      expect(result).toBe(true);
    });

    it('deve limpar dados quando token está expirado', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      localStorageMock.getItem
        .mockReturnValueOnce('mock-token')
        .mockReturnValueOnce(pastDate.toISOString());

      const result = authUtils.isAuthenticated();

      expect(result).toBe(false);
      // clearAuthData é chamado, verificamos que removeItem foi chamado
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });

    it('deve limpar dados quando token não existe', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const result = authUtils.isAuthenticated();

      expect(result).toBe(false);
      // clearAuthData é chamado, verificamos que removeItem foi chamado
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });
});
