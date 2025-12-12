import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VerificarEmail from '../VerificarEmail';
import '@testing-library/jest-dom';
import * as authService from '../../services/auth';

// Mock do react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => {
    const params = new URLSearchParams();
    return [params, jest.fn()];
  },
}));

// Mock do serviço de autenticação
jest.mock('../../services/auth', () => ({
  verifyEmail: jest.fn(),
}));

describe('VerificarEmail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  it('deve renderizar o logo', () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    expect(screen.getByAltText('OLX')).toBeInTheDocument();
  });

  it('deve exibir loading inicialmente', () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    (authService.verifyEmail as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Promise que nunca resolve
    );

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    expect(screen.getByText(/Verificando sua conta/i)).toBeInTheDocument();
  });

  it('deve exibir sucesso quando código é válido', async () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    (authService.verifyEmail as jest.Mock).mockResolvedValue({
      message: 'Sua conta foi ativada com sucesso!',
    });

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Conta Ativada/i)).toBeInTheDocument();
      expect(screen.getByText(/Sua conta foi ativada com sucesso/i)).toBeInTheDocument();
      expect(screen.getByText(/Ir para Login/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando código não é fornecido', async () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams(''),
      jest.fn(),
    ]);

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro na Verificação/i)).toBeInTheDocument();
      expect(screen.getByText(/Código de verificação não encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando verificação falha', async () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    (authService.verifyEmail as jest.Mock).mockRejectedValue(
      new Error('Código inválido ou expirado')
    );

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro na Verificação/i)).toBeInTheDocument();
      expect(screen.getByText(/Código inválido ou expirado/i)).toBeInTheDocument();
    });
  });

  it('deve navegar para login ao clicar em "Ir para Login" no sucesso', async () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    (authService.verifyEmail as jest.Mock).mockResolvedValue({
      message: 'Sua conta foi ativada com sucesso!',
    });

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Ir para Login/i)).toBeInTheDocument();
    });

    const loginButton = screen.getByText(/Ir para Login/i);
    loginButton.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('deve navegar para login ao clicar em "Ir para Login" no erro', async () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    (authService.verifyEmail as jest.Mock).mockRejectedValue(
      new Error('Código inválido')
    );

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      const loginButtons = screen.getAllByText(/Ir para Login/i);
      expect(loginButtons.length).toBeGreaterThan(0);
    });

    const loginButtons = screen.getAllByText(/Ir para Login/i);
    loginButtons[0].click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('deve navegar para cadastro ao clicar em "Fazer Cadastro" no erro', async () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    (authService.verifyEmail as jest.Mock).mockRejectedValue(
      new Error('Código inválido')
    );

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Fazer Cadastro/i)).toBeInTheDocument();
    });

    const cadastroButton = screen.getByText(/Fazer Cadastro/i);
    cadastroButton.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/cadastro');
    });
  });

  it('deve exibir mensagem de erro genérica quando erro não é Error', async () => {
    const { useSearchParams } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?codigo=123'),
      jest.fn(),
    ]);

    (authService.verifyEmail as jest.Mock).mockRejectedValue('Erro desconhecido');

    render(
      <MemoryRouter>
        <VerificarEmail />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro na Verificação/i)).toBeInTheDocument();
      expect(screen.getByText(/Erro ao verificar email. Tente novamente mais tarde/i)).toBeInTheDocument();
    });
  });
});
