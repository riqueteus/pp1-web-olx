// jest.setup.js
import '@testing-library/jest-dom';

// Configurações adicionais podem ser adicionadas aqui
// Por exemplo, mocks globais ou configurações de ambiente

// Mock do import.meta.env para Jest - deve ser definido antes de qualquer import
// Usando Object.defineProperty para garantir que funcione em todos os contextos
const mockImportMeta = {
  env: {
    VITE_API_URL: 'http://localhost:3000',
  },
};

// Mock para globalThis (ES2020+)
if (typeof globalThis !== 'undefined') {
  Object.defineProperty(globalThis, 'import', {
    value: { meta: mockImportMeta },
    writable: true,
    configurable: true,
  });
}

// Mock para global (Node.js)
if (typeof global !== 'undefined') {
  Object.defineProperty(global, 'import', {
    value: { meta: mockImportMeta },
    writable: true,
    configurable: true,
  });
}

// Mock para window (browser)
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'import', {
    value: { meta: mockImportMeta },
    writable: true,
    configurable: true,
  });
}

// Exemplo de mock para o localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

global.localStorage = localStorageMock;

// Mock do URL.createObjectURL e URL.revokeObjectURL
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();

// Define process.env.VITE_API_URL para os testes (o Babel transforma import.meta.env em process.env)
process.env.VITE_API_URL = 'http://localhost:3000';
