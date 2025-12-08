import { render, screen, fireEvent } from '@testing-library/react';
import Card from '../Card';
import '@testing-library/jest-dom';

describe('Card Component', () => {
  // Teste 1: Renderiza o conteúdo do card
  it('deve renderizar o conteúdo do card', () => {
    render(<Card>Conteúdo do card</Card>);
    expect(screen.getByText('Conteúdo do card')).toBeInTheDocument();
  });

  // Teste 2: Exibe o header quando fornecido
  it('deve exibir o header quando fornecido', () => {
    render(<Card header="Título do Card">Conteúdo</Card>);
    expect(screen.getByText('Título do Card')).toBeInTheDocument();
  });

  // Teste 3: Exibe o footer quando fornecido
  it('deve exibir o footer quando fornecido', () => {
    render(<Card footer="Rodapé do Card">Conteúdo</Card>);
    expect(screen.getByText('Rodapé do Card')).toBeInTheDocument();
  });

  // Teste 4: Chama onClick ao clicar no card
  it('deve chamar onClick ao clicar no card', () => {
    const handleClick = jest.fn();
    render(<Card onClick={handleClick}>Conteúdo</Card>);
    
    const card = screen.getByText('Conteúdo').closest('article');
    fireEvent.click(card!);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Teste 5: Renderiza card completo com header, conteúdo e footer
  it('deve renderizar card completo com header, conteúdo e footer', () => {
    render(
      <Card header="Header" footer="Footer">
        Conteúdo
      </Card>
    );
    
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });
});



