// Mock para o módulo de autenticação
export const clearAuthData = jest.fn();

export const getAuthData = jest.fn(() => ({
  id: '1',
  name: 'Usuário Teste',
  email: 'teste@example.com'
}));

export const saveAuthData = jest.fn();

export const isAuthenticated = jest.fn(() => true);
