// jest.setup.js
import '@testing-library/jest-dom';

// Configurações adicionais podem ser adicionadas aqui
// Por exemplo, mocks globais ou configurações de ambiente

// Exemplo de mock para o localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;
