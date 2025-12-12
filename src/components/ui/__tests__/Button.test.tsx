import { render, screen } from '@testing-library/react';
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

  // Teste 7: Aplica variante ghost quando especificada
  it('deve aplicar variante ghost quando especificada', () => {
    const { container } = render(<Button variant="ghost">Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-transparent');
  });

  // Teste 8: Aplica tamanho sm quando especificado
  it('deve aplicar tamanho sm quando especificado', () => {
    const { container } = render(<Button size="sm">Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-3');
    expect(button).toHaveClass('py-1.5');
  });

  // Teste 9: Aplica tamanho lg quando especificado
  it('deve aplicar tamanho lg quando especificado', () => {
    const { container } = render(<Button size="lg">Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-5');
    expect(button).toHaveClass('py-3');
  });

  // Teste 10: Aplica tamanho md por padrão
  it('deve aplicar tamanho md por padrão', () => {
    const { container } = render(<Button>Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('px-4');
    expect(button).toHaveClass('py-2');
  });

  // Teste 11: Aplica className customizada
  it('deve aplicar className customizada', () => {
    const { container } = render(<Button className="custom-class">Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('custom-class');
  });

  // Teste 12: Não chama onClick quando desabilitado
  it('não deve chamar onClick quando desabilitado', async () => {
    const handleClick = jest.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick} disabled>Clique</Button>);
    
    await user.click(screen.getByText('Clique'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  // Teste 13: Aplica classes de disabled quando desabilitado
  it('deve aplicar classes de disabled quando desabilitado', () => {
    const { container } = render(<Button disabled>Botão</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('disabled:opacity-60');
    expect(button).toHaveClass('disabled:cursor-not-allowed');
  });

  // Teste 14: Passa outras props HTML para o botão
  it('deve passar outras props HTML para o botão', () => {
    const { container } = render(<Button type="submit" aria-label="Enviar">Enviar</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('aria-label', 'Enviar');
  });
});



