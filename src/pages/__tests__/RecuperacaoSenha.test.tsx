import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import RecuperacaoSenha from '../RecuperacaoSenha';
import '@testing-library/jest-dom';
import * as authService from '../../services/auth';

// Mock do serviço de autenticação
jest.mock('../../services/auth', () => ({
  solicitarRedefinicaoSenha: jest.fn(),
}));

describe('RecuperacaoSenha Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o formulário de recuperação', () => {
    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    expect(screen.getByText(/Esqueceu sua senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/E-mail/i)).toBeInTheDocument();
    expect(screen.getByText(/Receber instruções por e-mail/i)).toBeInTheDocument();
  });

  it('deve exibir erro quando email está vazio ao submeter', async () => {
    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    fireEvent.blur(emailInput);
    const submitButton = screen.getByText(/Receber instruções por e-mail/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.queryByText(/Campo obrigatório/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando email é inválido', async () => {
    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/Informe um e-mail válido/i)).toBeInTheDocument();
    });
  });

  it('deve solicitar redefinição de senha com sucesso', async () => {
    (authService.solicitarRedefinicaoSenha as jest.Mock).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByText(/Receber instruções por e-mail/i);

    await userEvent.type(emailInput, 'teste@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.solicitarRedefinicaoSenha).toHaveBeenCalledWith('teste@example.com');
      expect(screen.getByText(/E-mail enviado com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem de sucesso após envio', async () => {
    (authService.solicitarRedefinicaoSenha as jest.Mock).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByText(/Receber instruções por e-mail/i);

    await userEvent.type(emailInput, 'teste@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/E-mail enviado com sucesso/i)).toBeInTheDocument();
      expect(screen.getByText(/Verifique sua caixa de entrada/i)).toBeInTheDocument();
      expect(screen.getByText(/Voltar para o login/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando solicitação falha', async () => {
    (authService.solicitarRedefinicaoSenha as jest.Mock).mockRejectedValue(
      new Error('E-mail não encontrado')
    );

    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByText(/Receber instruções por e-mail/i);

    await userEvent.type(emailInput, 'teste@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/E-mail não encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro genérico quando erro não é Error', async () => {
    (authService.solicitarRedefinicaoSenha as jest.Mock).mockRejectedValue('Erro desconhecido');

    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByText(/Receber instruções por e-mail/i);

    await userEvent.type(emailInput, 'teste@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao solicitar redefinição de senha/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão durante loading', async () => {
    (authService.solicitarRedefinicaoSenha as jest.Mock).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
    );

    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByText(/Receber instruções por e-mail/i);

    await userEvent.type(emailInput, 'teste@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Enviando/i)).toBeInTheDocument();
    });
  });

  it('deve desabilitar botão quando email está vazio', () => {
    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const submitButton = screen.getByText(/Receber instruções por e-mail/i);
    expect(submitButton).toBeDisabled();
  });

  it('deve desabilitar botão quando email é inválido', async () => {
    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    await userEvent.type(emailInput, 'email-invalido');
    fireEvent.blur(emailInput);

    const submitButton = screen.getByText(/Receber instruções por e-mail/i);
    expect(submitButton).toBeDisabled();
  });

  it('deve exibir link para login', () => {
    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    expect(screen.getByText(/Voltar para/i)).toBeInTheDocument();
    expect(screen.getByText(/Entrar/i)).toBeInTheDocument();
  });

  it('deve limpar mensagem de erro ao digitar', async () => {
    (authService.solicitarRedefinicaoSenha as jest.Mock).mockRejectedValue(
      new Error('Erro ao enviar')
    );

    render(
      <MemoryRouter>
        <RecuperacaoSenha />
      </MemoryRouter>
    );

    const emailInput = screen.getByLabelText(/E-mail/i);
    const submitButton = screen.getByText(/Receber instruções por e-mail/i);

    await userEvent.type(emailInput, 'teste@example.com');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao enviar/i)).toBeInTheDocument();
    });

    await userEvent.type(emailInput, 'x');

    await waitFor(() => {
      expect(screen.queryByText(/Erro ao enviar/i)).not.toBeInTheDocument();
    });
  });
});

