import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '../Input';
import '@testing-library/jest-dom';

describe('Input Component', () => {
  // Teste 1: Renderiza o input sem label
  it('deve renderizar o input sem label', () => {
    render(<Input />);
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  // Teste 2: Exibe o label quando fornecido
  it('deve exibir o label quando fornecido', () => {
    render(<Input label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  // Teste 3: Exibe mensagem de erro quando há erro
  it('deve exibir mensagem de erro quando error for fornecido', () => {
    render(<Input error="Campo obrigatório" />);
    expect(screen.getByText('Campo obrigatório')).toBeInTheDocument();
  });

  // Teste 4: Exibe texto de ajuda quando helperText é fornecido
  it('deve exibir texto de ajuda quando helperText for fornecido', () => {
    render(<Input helperText="Digite seu email" />);
    expect(screen.getByText('Digite seu email')).toBeInTheDocument();
  });

  // Teste 5: Permite digitar no input
  it('deve permitir digitar no input', async () => {
    const user = userEvent.setup();
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    await user.type(input, 'teste@email.com');
    
    expect(input).toHaveValue('teste@email.com');
  });

  // Teste 6: Exibe botão de toggle de senha quando showPasswordToggle é true
  it('deve exibir botão de toggle quando showPasswordToggle for true', () => {
    render(<Input type="password" showPasswordToggle />);
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toBeInTheDocument();
  });

  // Teste 7: Chama onTogglePassword ao clicar no toggle
  it('deve chamar onTogglePassword ao clicar no toggle', () => {
    const handleToggle = jest.fn();
    render(<Input type="password" showPasswordToggle onTogglePassword={handleToggle} />);
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    expect(handleToggle).toHaveBeenCalledTimes(1);
  });
});



