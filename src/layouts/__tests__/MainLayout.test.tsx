import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import MainLayout from '../MainLayout';
import '@testing-library/jest-dom';

// Mock do Header
jest.mock('../../components/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header</div>;
  };
});

// Mock do Footer
jest.mock('../../components/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer</div>;
  };
});

describe('MainLayout Component', () => {
  // Teste 1: Renderiza o Header
  it('deve renderizar o Header', () => {
    render(
      <MemoryRouter>
        <MainLayout>Conteúdo</MainLayout>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  // Teste 2: Renderiza o conteúdo (children)
  it('deve renderizar o conteúdo fornecido', () => {
    render(
      <MemoryRouter>
        <MainLayout>Conteúdo da página</MainLayout>
      </MemoryRouter>
    );
    
    expect(screen.getByText('Conteúdo da página')).toBeInTheDocument();
  });

  // Teste 3: Renderiza o Footer
  it('deve renderizar o Footer', () => {
    render(
      <MemoryRouter>
        <MainLayout>Conteúdo</MainLayout>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  // Teste 4: Renderiza Header, conteúdo e Footer juntos
  it('deve renderizar Header, conteúdo e Footer juntos', () => {
    render(
      <MemoryRouter>
        <MainLayout>
          <div>Página de teste</div>
        </MainLayout>
      </MemoryRouter>
    );
    
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Página de teste')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });
});



