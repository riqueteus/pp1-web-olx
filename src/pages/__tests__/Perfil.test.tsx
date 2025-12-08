import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Perfil from '../Perfil';
import '@testing-library/jest-dom';
import * as auth from '../../utils/auth';

// Mock do módulo de autenticação
jest.mock('../../utils/auth', () => ({
  getAuthData: jest.fn(),
  saveAuthData: jest.fn(),
}));

describe('Perfil Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o título da página', async () => {
    (auth.getAuthData as jest.Mock).mockResolvedValue({
      name: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Meu Perfil')).toBeInTheDocument();
    });
  });

  it('deve exibir os dados do usuário quando carregados', async () => {
    const mockUserData = {
      name: 'Maria Santos',
      email: 'maria@example.com',
      phone: '(11) 99999-9999',
      address: 'Rua Teste, 123',
    };

    (auth.getAuthData as jest.Mock).mockResolvedValue(mockUserData);

    render(<Perfil />);

    await waitFor(() => {
      // Verifica se os dados são exibidos (modo visualização)
      expect(screen.getByText('Maria Santos')).toBeInTheDocument();
      expect(screen.getByText('maria@example.com')).toBeInTheDocument();
    });
  });

  it('deve permitir editar o perfil ao clicar no botão Editar', async () => {
    (auth.getAuthData as jest.Mock).mockResolvedValue({
      name: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    // Verifica se os campos de input aparecem
    expect(screen.getByLabelText('Nome Completo')).toBeInTheDocument();
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
    expect(screen.getByText('Salvar alterações')).toBeInTheDocument();
  });

  it('deve cancelar a edição ao clicar em Cancelar', async () => {
    (auth.getAuthData as jest.Mock).mockResolvedValue({
      name: 'João Silva',
      email: 'joao@example.com',
    });

    render(<Perfil />);

    await waitFor(() => {
      expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    });

    // Clica em Editar
    const editButton = screen.getByText('Editar perfil');
    fireEvent.click(editButton);

    // Clica em Cancelar
    const cancelButton = screen.getByText('Cancelar');
    fireEvent.click(cancelButton);

    // Verifica se voltou ao modo de visualização
    expect(screen.getByText('Editar perfil')).toBeInTheDocument();
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
  });
});

