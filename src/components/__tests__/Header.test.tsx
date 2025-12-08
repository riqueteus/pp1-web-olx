import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Header from '../Header';
import '@testing-library/jest-dom';

// Mock do useNavigate para verificar navegação
const mockNavigate = jest.fn();

// Mock do módulo de autenticação
jest.mock('../../utils/auth', () => ({
  clearAuthData: jest.fn(),
}));

// Mock do react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({ pathname: '/' }),
}));

// Importa o mock após a definição
import * as auth from '../../utils/auth';

describe('Header Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    jest.clearAllMocks();
  });

  // Teste 1: Verifica o que é exibido no Header
  it('deve exibir os botões de navegação quando o usuário está logado', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Meus Anúncios')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Anunciar')).toBeInTheDocument();
    expect(screen.getByText('Sair')).toBeInTheDocument();
  });

  // Teste 2: Botão "Meus Anúncios" navega para a página inicial
  it('deve navegar para a página inicial ao clicar em "Meus Anúncios"', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText('Meus Anúncios'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Teste 3: Botão "Perfil" navega para a página de perfil
  it('deve navegar para a página de perfil ao clicar em "Perfil"', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText('Perfil'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/perfil');
  });

  // Teste 4: Botão "Anunciar" navega para a página de anunciar
  it('deve navegar para a página de anunciar ao clicar em "Anunciar"', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText('Anunciar'));
    
    expect(mockNavigate).toHaveBeenCalledWith('/anunciar');
  });

  // Teste 5: Botão "Sair" abre o modal de confirmação
  it('deve abrir o modal de confirmação ao clicar em "Sair"', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    fireEvent.click(screen.getByText('Sair'));
    
    expect(screen.getByText('Tem certeza que deseja sair da sua conta?')).toBeInTheDocument();
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  // Teste 6: Confirmar logout limpa os dados e navega para login
  it('deve fazer logout e navegar para login ao confirmar no modal', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Abre o modal
    fireEvent.click(screen.getByText('Sair'));
    
    // Confirma o logout (botão "Sair" dentro do modal)
    const confirmButton = screen.getAllByText('Sair').find(button => 
      button.className.includes('bg-orange-500')
    );
    
    fireEvent.click(confirmButton!);
    
    // Verifica se limpa os dados e navega para login
    expect(auth.clearAuthData).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });

  // Teste 7: Cancelar fecha o modal sem fazer logout
  it('deve fechar o modal sem fazer logout ao clicar em "Cancelar"', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    
    // Abre o modal
    fireEvent.click(screen.getByText('Sair'));
    expect(screen.getByText('Tem certeza que deseja sair da sua conta?')).toBeInTheDocument();
    
    // Cancela
    fireEvent.click(screen.getByText('Cancelar'));
    
    // Verifica que o modal foi fechado e logout não foi chamado
    expect(screen.queryByText('Tem certeza que deseja sair da sua conta?')).not.toBeInTheDocument();
    expect(auth.clearAuthData).not.toHaveBeenCalled();
  });
});