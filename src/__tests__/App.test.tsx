import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';
import '@testing-library/jest-dom';

// Mock do módulo de autenticação
jest.mock('../utils/auth', () => ({
  isAuthenticated: jest.fn(() => false),
}));

// Mock do BrowserRouter para usar MemoryRouter nos testes
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    BrowserRouter: ({ children }: { children: React.ReactNode }) => {
      return <>{children}</>;
    },
  };
});

// Mock dos componentes de página para simplificar os testes
jest.mock('../pages/Login', () => {
  return function MockLogin() {
    return <div data-testid="login-page">Página de Login</div>;
  };
});

jest.mock('../pages/Register', () => {
  return function MockRegister() {
    return <div data-testid="register-page">Página de Cadastro</div>;
  };
});

jest.mock('../pages/RecuperacaoSenha', () => {
  return function MockRecuperacaoSenha() {
    return <div data-testid="recuperacao-page">Página de Recuperação</div>;
  };
});

jest.mock('../pages/MeusAnuncios', () => {
  return function MockMeusAnuncios() {
    return <div data-testid="meus-anuncios-page">Página Meus Anúncios</div>;
  };
});

jest.mock('../pages/Perfil', () => {
  return function MockPerfil() {
    return <div data-testid="perfil-page">Página de Perfil</div>;
  };
});

jest.mock('../pages/Anunciar', () => {
  return function MockAnunciar() {
    return <div data-testid="anunciar-page">Página de Anunciar</div>;
  };
});

jest.mock('../layouts/MainLayout', () => {
  return function MockMainLayout({ children }: { children: React.ReactNode }) {
    return <div>{children}</div>;
  };
});

// Importa o mock após a definição
import * as auth from '../utils/auth';

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Teste 1: Rota pública de login é acessível
  it('deve exibir a página de login ao acessar /login', () => {
    render(
      <MemoryRouter initialEntries={['/login']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  // Teste 2: Rota pública de cadastro é acessível
  it('deve exibir a página de cadastro ao acessar /cadastro', () => {
    render(
      <MemoryRouter initialEntries={['/cadastro']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('register-page')).toBeInTheDocument();
  });

  // Teste 3: Rota pública de recuperação de senha é acessível
  it('deve exibir a página de recuperação ao acessar /recuperacao-senha', () => {
    render(
      <MemoryRouter initialEntries={['/recuperacao-senha']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('recuperacao-page')).toBeInTheDocument();
  });

  // Teste 4: Rota protegida redireciona para login quando não autenticado
  it('deve redirecionar para login ao acessar rota protegida sem autenticação', () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('meus-anuncios-page')).not.toBeInTheDocument();
  });

  // Teste 5: Rota protegida /perfil redireciona para login quando não autenticado
  it('deve redirecionar para login ao acessar /perfil sem autenticação', () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(false);

    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('perfil-page')).not.toBeInTheDocument();
  });

  // Teste 6: Rota protegida é acessível quando autenticado
  it('deve exibir a página protegida quando o usuário está autenticado', () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('meus-anuncios-page')).toBeInTheDocument();
    expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
  });

  // Teste 7: Rota protegida /perfil é acessível quando autenticado
  it('deve exibir a página de perfil quando o usuário está autenticado', () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/perfil']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('perfil-page')).toBeInTheDocument();
  });

  // Teste 8: Rota protegida /anunciar é acessível quando autenticado
  it('deve exibir a página de anunciar quando o usuário está autenticado', () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/anunciar']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('anunciar-page')).toBeInTheDocument();
  });

  // Teste 9: Rota desconhecida redireciona para home
  it('deve redirecionar para home ao acessar rota desconhecida', () => {
    (auth.isAuthenticated as jest.Mock).mockReturnValue(true);

    render(
      <MemoryRouter initialEntries={['/rota-inexistente']}>
        <App />
      </MemoryRouter>
    );

    expect(screen.getByTestId('meus-anuncios-page')).toBeInTheDocument();
  });
});

