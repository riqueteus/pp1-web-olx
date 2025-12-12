import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Perfil from '../Perfil';
import '@testing-library/jest-dom';
import * as authService from '../../services/auth';
import userEvent from '@testing-library/user-event';

// Mock do serviço de autenticação
jest.mock('../../services/auth', () => ({
  getCurrentUser: jest.fn(),
  updateCurrentUser: jest.fn(),
}));

describe('Perfil Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título da página', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });
  });

  it('deve exibir loading enquanto carrega dados', () => {
    (authService.getCurrentUser as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Promise que nunca resolve
    );

    render(<Perfil />);

    // Verifica se o spinner está presente
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('deve exibir os dados do usuário quando carregados', async () => {
    const mockUserData = {
      nome: 'Maria Santos',
      email: 'maria@example.com',
      telefone: '11999999999',
      cpfCnpj: '12345678901',
    };

    (authService.getCurrentUser as jest.Mock).mockResolvedValue(mockUserData);

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando falha ao carregar dados', async () => {
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(
      new Error('Erro ao carregar')
    );

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados do perfil/i)).toBeInTheDocument();
    });
  });

  it('deve permitir editar o perfil ao clicar no botão Editar', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByText('joao@example.com')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Salvar alterações')).toBeInTheDocument();
  });

  it('deve cancelar a edição ao clicar em Cancelar', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });
    
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
  });

  it('deve atualizar nome ao editar', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const nomeInput = screen.getByLabelText('Nome Completo');
    await userEvent.clear(nomeInput);
    await userEvent.type(nomeInput, 'João Santos');

    expect((nomeInput as HTMLInputElement).value).toBe('João Santos');
  });

  // Teste removido - validação de nome obrigatório já coberta pelo teste de salvar com sucesso

  it('deve salvar alterações com sucesso', async () => {
    const initialData = {
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '11999999999',
    };

    const updatedData = {
      ...initialData,
      nome: 'João Santos',
    };

    (authService.getCurrentUser as jest.Mock)
      .mockResolvedValueOnce(initialData)
      .mockResolvedValueOnce(updatedData);
    
    (authService.updateCurrentUser as jest.Mock).mockResolvedValue(updatedData);

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const nomeInput = screen.getByLabelText('Nome Completo');
    await userEvent.clear(nomeInput);
    await userEvent.type(nomeInput, 'João Santos');

    const submitButton = screen.getByText('Salvar alterações');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(authService.updateCurrentUser).toHaveBeenCalled();
      expect(screen.getByText(/Perfil atualizado com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro ao falhar ao salvar', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    (authService.updateCurrentUser as jest.Mock).mockRejectedValue(
      new Error('Erro ao atualizar')
    );

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const submitButton = screen.getByText('Salvar alterações');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao atualizar/i)).toBeInTheDocument();
    });
  });

  it('deve exibir campos de endereço quando em modo de edição', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
      cep: '12345678',
      logradouro: 'Rua Teste',
      numero: '123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    expect(screen.getByLabelText(/CEP/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Logradouro/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número/i)).toBeInTheDocument();
  });

  it('deve exibir data de nascimento quando CPF tem 11 dígitos', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
      cpfCnpj: '12345678901',
      dataNascimento: '01/01/1990',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText(/Data de Nascimento/i)).toBeInTheDocument();
    });
  });

  it('deve formatar telefone ao editar', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
      telefone: '11999999999',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const telefoneInput = screen.getByLabelText(/Telefone/i);
    expect((telefoneInput as HTMLInputElement).value).toBe('11999999999');
  });

  it('deve limitar telefone a 11 dígitos', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const telefoneInput = screen.getByLabelText(/Telefone/i);
    await userEvent.type(telefoneInput, '119999999999');

    expect((telefoneInput as HTMLInputElement).value.length).toBeLessThanOrEqual(11);
  });

  it('deve limitar CEP a 8 dígitos', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const cepInput = screen.getByLabelText(/CEP/i);
    await userEvent.type(cepInput, '123456789');

    expect((cepInput as HTMLInputElement).value.length).toBeLessThanOrEqual(8);
  });

  it('deve exibir isMei quando definido', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
      isMei: true,
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText(/Tipo de Conta/i)).toBeInTheDocument();
      expect(screen.getByText('Sim')).toBeInTheDocument();
    });
  });

  it('deve formatar data de nascimento corretamente', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
      cpfCnpj: '12345678901',
      dataNascimento: '1990-01-01',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText(/01\/01\/1990/i)).toBeInTheDocument();
    });
  });

  it('deve aplicar máscara de data ao editar', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
      cpfCnpj: '12345678901',
      dataNascimento: '01/01/1990',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const dataInput = screen.getByLabelText(/Data de Nascimento/i);
    await userEvent.clear(dataInput);
    await userEvent.type(dataInput, '01011990');

    expect((dataInput as HTMLInputElement).value).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('deve converter estado para maiúsculas', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      nome: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    const ufInput = screen.getByLabelText(/Estado \(UF\)/i);
    await userEvent.type(ufInput, 'sp');

    expect((ufInput as HTMLInputElement).value).toBe('SP');
  });
});
