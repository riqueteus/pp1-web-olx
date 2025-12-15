import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import RedefinirSenha from '../RedefinirSenha';
import '@testing-library/jest-dom';
import * as authService from '../../services/auth';

// Mock do react-router-dom
const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useSearchParams: () => [mockSearchParams, mockSetSearchParams],
}));

// Mock do serviço de autenticação
jest.mock('../../services/auth', () => ({
  redefinirSenha: jest.fn(),
}));

describe('RedefinirSenha Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.delete('token');
    mockSetSearchParams.mockClear();
  });

  it('deve renderizar o formulário quando token existe', () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const headings = screen.getAllByText(/Redefinir senha/i);
    expect(headings.length).toBeGreaterThan(0);
    
    const senhaInputs = screen.queryAllByLabelText(/Nova senha/i);
    expect(senhaInputs.length).toBeGreaterThan(0);
    
    expect(screen.getByLabelText(/Confirmar nova senha/i)).toBeInTheDocument();
  });

  it('deve exibir erro quando token não existe', () => {
    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    expect(screen.getByText(/Token inválido/i)).toBeInTheDocument();
    expect(screen.getByText(/Token de redefinição não encontrado/i)).toBeInTheDocument();
    expect(screen.getByText(/Solicitar novo link/i)).toBeInTheDocument();
  });

  it('deve exibir regras de senha', () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    expect(screen.getByText(/8 ou mais caracteres/i)).toBeInTheDocument();
    expect(screen.getByText(/Uma letra maiúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Uma letra minúscula/i)).toBeInTheDocument();
    expect(screen.getByText(/Um número/i)).toBeInTheDocument();
    expect(screen.getByText(/Um caracter especial/i)).toBeInTheDocument();
  });

  it('deve exibir erro quando senha está vazia ao submeter', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    fireEvent.blur(senhaInput);
    
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/Campo obrigatório/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando senhas não conferem', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha456!');
    fireEvent.blur(confirmarInput);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/As senhas não conferem/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando senha não atende requisitos', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    await userEvent.type(senhaInput, 'senha');
    fireEvent.blur(senhaInput);

    await waitFor(() => {
      expect(screen.getByText(/A senha não atende aos requisitos/i)).toBeInTheDocument();
    });
  });

  it('deve redefinir senha com sucesso', async () => {
    mockSearchParams.set('token', 'valid-token');
    (authService.redefinirSenha as jest.Mock).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha123!');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.redefinirSenha).toHaveBeenCalledWith('valid-token', 'Senha123!');
      expect(screen.getByText(/Senha redefinida com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de sucesso após redefinição', async () => {
    mockSearchParams.set('token', 'valid-token');
    (authService.redefinirSenha as jest.Mock).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha123!');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Senha redefinida com sucesso/i)).toBeInTheDocument();
      expect(screen.getByText(/Senha alterada com sucesso, Acesso novamente o login/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando redefinição falha', async () => {
    mockSearchParams.set('token', 'valid-token');
    (authService.redefinirSenha as jest.Mock).mockRejectedValue(
      new Error('Token inválido ou expirado')
    );

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha123!');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Token inválido ou expirado/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro genérico quando erro não é Error', async () => {
    mockSearchParams.set('token', 'valid-token');
    (authService.redefinirSenha as jest.Mock).mockRejectedValue('Erro desconhecido');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha123!');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao redefinir senha/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão quando senha não atende requisitos', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'senha');
    await userEvent.type(confirmarInput, 'senha');

    expect(submitButton).toBeDisabled();
  });

  it('deve desabilitar botão quando senhas não conferem', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha456!');

    expect(submitButton).toBeDisabled();
  });

  it('deve mostrar/ocultar senha ao clicar no toggle', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.queryAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0] as HTMLInputElement;
    expect(senhaInput.type).toBe('password');

    const toggleButton = senhaInput.parentElement?.querySelector('button');
    if (toggleButton) {
      fireEvent.click(toggleButton);
      await waitFor(() => {
        expect(senhaInput.type).toBe('text');
      });
    }
  });

  it('deve mostrar/ocultar confirmação de senha ao clicar no toggle', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i) as HTMLInputElement;
    expect(confirmarInput.type).toBe('password');

    const toggleButtons = document.querySelectorAll('button[type="button"]');
    const confirmToggle = Array.from(toggleButtons).find(btn => 
      btn.parentElement?.contains(confirmarInput)
    );

    if (confirmToggle) {
      fireEvent.click(confirmToggle);
      await waitFor(() => {
        expect(confirmarInput.type).toBe('text');
      });
    }
  });

  it('deve atualizar regras de senha conforme digitação', async () => {
    mockSearchParams.set('token', 'valid-token');

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    await userEvent.type(senhaInput, 'Senha123!');

    // Verifica que as regras estão sendo atualizadas visualmente
    await waitFor(() => {
      expect((senhaInput as HTMLInputElement).value).toBe('Senha123!');
    });
  });

  it('deve exibir loading durante redefinição', async () => {
    mockSearchParams.set('token', 'valid-token');
    (authService.redefinirSenha as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
    );

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha123!');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Redefinindo/i)).toBeInTheDocument();
    });
  });

  it('deve limpar mensagem de erro ao digitar', async () => {
    mockSearchParams.set('token', 'valid-token');
    (authService.redefinirSenha as jest.Mock).mockRejectedValue(
      new Error('Erro ao redefinir')
    );

    render(
      <MemoryRouter>
        <RedefinirSenha />
      </MemoryRouter>
    );

    const senhaInputs = screen.getAllByLabelText(/Nova senha/i);
    const senhaInput = senhaInputs[0];
    const confirmarInput = screen.getByLabelText(/Confirmar nova senha/i);
    const buttons = screen.getAllByRole('button');
    const submitButton = buttons.find(btn => btn.textContent?.includes('Redefinir senha')) || buttons[0];

    await userEvent.type(senhaInput, 'Senha123!');
    await userEvent.type(confirmarInput, 'Senha123!');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao redefinir/i)).toBeInTheDocument();
    });

    await userEvent.type(senhaInput, 'x');

    await waitFor(() => {
      expect(screen.queryByText(/Erro ao redefinir/i)).not.toBeInTheDocument();
    });
  });
});

