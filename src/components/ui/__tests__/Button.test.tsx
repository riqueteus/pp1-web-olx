import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';
import '@testing-library/jest-dom';

describe('Button Component', () => {
  // Teste 1: Renderiza o texto do botão
  it('deve exibir o texto do botão', () => {
    render(<Button>Clique aqui</Button>);
    expect(screen.getByText('Clique aqui')).toBeInTheDocument();
  });

  // Teste 2: Botão está desabilitado quando disabled é true
  it('deve estar desabilitado quando disabled for true', () => {
    render(<Button disabled>Botão</Button>);
    expect(screen.getByText('Botão')).toBeDisabled();
  });

  // Teste 3: Chama onClick quando clicado
  it('deve chamar onClick ao ser clicado', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Clique</Button>);
    
    await user.click(screen.getByText('Clique'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // Teste 4: Aplica variante primary por padrão
  it('deve aplicar variante primary por padrão', () => {
    const { container } = render(<Button>Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-gray-900');
  });

  // Teste 5: Aplica variante secondary quando especificada
  it('deve aplicar variante secondary quando especificada', () => {
    const { container } = render(<Button variant="secondary">Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-white');
  });

  // Teste 6: Aplica classe w-full quando isFullWidth é true
  it('deve aplicar largura total quando isFullWidth for true', () => {
    const { container } = render(<Button isFullWidth>Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('w-full');
  });
});



