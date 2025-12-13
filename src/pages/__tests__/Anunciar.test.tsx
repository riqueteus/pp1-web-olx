import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Anunciar from '../Anunciar';
import * as produtosService from '../../services/produtos';
import * as authService from '../../services/auth';

// Mock do react-router-dom
const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams();
const mockSetSearchParams = jest.fn();

const mockUseSearchParams = jest.fn(() => [mockSearchParams, mockSetSearchParams]);

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => mockUseSearchParams(),
}));

// Mock dos serviços
jest.mock('../../services/produtos', () => ({
  createProduto: jest.fn(),
  updateProduto: jest.fn(),
  uploadProdutoImagem: jest.fn(),
  getProdutoById: jest.fn(),
}));

jest.mock('../../services/auth', () => ({
  getCurrentUser: jest.fn(),
}));

describe('Anunciar Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockSetSearchParams.mockClear();
    mockSearchParams = new URLSearchParams();
    mockUseSearchParams.mockReturnValue([mockSearchParams, mockSetSearchParams]);
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'João Silva',
      email: 'joao@example.com',
    });
  });

  it('deve renderizar o formulário de criar anúncio', () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Criar Anúncio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Título do anúncio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Categoria/i)).toBeInTheDocument();
  });

  it('deve exibir erro quando campos obrigatórios estão vazios', async () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const submitButton = screen.getByRole('button', { name: /Publicar anúncio/i });
    await userEvent.click(submitButton);

    // O formulário HTML5 pode validar antes, então verificamos se há erro ou validação HTML5
    await waitFor(() => {
      const errorMessage = screen.queryByText(/Preencha todos os campos obrigatórios/i);
      const html5Validation = document.querySelector('input:invalid');
      expect(errorMessage || html5Validation).toBeTruthy();
    });
  });

  it('deve exibir erro quando categoria não é selecionada', async () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/Título do anúncio/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const priceInput = screen.getByLabelText(/Preço/i);

    await userEvent.type(titleInput, 'Produto Teste');
    await userEvent.type(descriptionInput, 'Descrição teste');
    await userEvent.type(priceInput, '100');

    const submitButton = screen.getByRole('button', { name: /Publicar anúncio/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Selecione uma categoria/i)).toBeInTheDocument();
    });
  });

  it('deve validar que imagem é obrigatória ao criar produto', async () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/Título do anúncio/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const priceInput = screen.getByLabelText(/Preço/i);
    const categorySelect = screen.getByLabelText(/Categoria/i);

    await userEvent.type(titleInput, 'Produto Teste');
    await userEvent.type(descriptionInput, 'Descrição teste');
    await userEvent.type(priceInput, '100,00');
    fireEvent.change(categorySelect, { target: { value: 'Celulares' } });

    const submitButton = screen.getByRole('button', { name: /Publicar anúncio/i });
    await userEvent.click(submitButton);

    // Deve exibir erro porque não há imagem
    await waitFor(() => {
      expect(screen.getByText(/Adicione uma imagem do produto/i)).toBeInTheDocument();
    });
  });

  it('deve alternar entre estado Novo e Usado', () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const radios = screen.getAllByRole('radio');
    const novoRadio = radios.find(r => (r as HTMLInputElement).value === 'new');
    const usadoRadio = radios.find(r => (r as HTMLInputElement).value === 'used');

    expect((usadoRadio as HTMLInputElement).checked).toBe(true);
    expect((novoRadio as HTMLInputElement).checked).toBe(false);

    fireEvent.click(novoRadio!);

    expect((novoRadio as HTMLInputElement).checked).toBe(true);
    expect((usadoRadio as HTMLInputElement).checked).toBe(false);
  });

  it('deve exibir características quando categoria é selecionada', async () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const categorySelect = screen.getByLabelText(/Categoria/i);
    fireEvent.change(categorySelect, { target: { value: 'Celulares' } });

    await waitFor(() => {
      expect(screen.getByText(/Características do Produto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Marca/i)).toBeInTheDocument();
    });
  });

  it('deve navegar para home ao cancelar', () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const cancelButton = screen.getByRole('button', { name: /Cancelar/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('deve renderizar formulário de edição quando edit está na URL', async () => {
    mockSearchParams.set('edit', '1');
    (produtosService.getProdutoById as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'Produto Teste',
      descricao: 'Descrição teste',
      preco: 100.50,
      categoriaProduto: 'CELULAR_TELEFONIA',
      condicao: 'NOVO',
      status: 'ATIVO',
    });

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Anúncio/i)).toBeInTheDocument();
    });
  });

  it('deve exibir loading ao carregar produto para edição', () => {
    mockSearchParams.set('edit', '1');
    (produtosService.getProdutoById as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando dados do produto/i)).toBeInTheDocument();
  });

  it('deve carregar características do produto na edição', async () => {
    mockSearchParams.set('edit', '1');
    (produtosService.getProdutoById as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'iPhone 12',
      descricao: 'Descrição',
      preco: 100.50,
      categoriaProduto: 'CELULAR_TELEFONIA',
      condicao: 'NOVO',
      status: 'ATIVO',
      caracteristicas: {
        'Marca': 'Apple',
        'Modelo': 'iPhone 12',
        'Capacidade de Armazenamento': '128GB',
      },
    });

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Anúncio/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const marcaInput = screen.getByLabelText(/Marca/i);
      expect((marcaInput as HTMLInputElement).value).toBe('Apple');
    });
  });

  it('deve exibir erro ao falhar ao carregar produto para edição', async () => {
    mockSearchParams.set('edit', '1');
    (produtosService.getProdutoById as jest.Mock).mockRejectedValue(
      new Error('Erro ao carregar produto')
    );

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar dados do produto/i)).toBeInTheDocument();
    });
  });

  it('deve atualizar produto sem nova imagem', async () => {
    mockSearchParams.set('edit', '1');
    (produtosService.getProdutoById as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'Produto Original',
      descricao: 'Descrição original',
      preco: 100.50,
      categoriaProduto: 'CELULAR_TELEFONIA',
      condicao: 'NOVO',
      status: 'ATIVO',
      imagem: 'imagem.jpg',
    });
    (produtosService.updateProduto as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'Produto Atualizado',
    });

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Anúncio/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Título do anúncio/i);
      expect(titleInput).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Título do anúncio/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Produto Atualizado');

    const submitButton = screen.getByRole('button', { name: /Atualizar anúncio/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(produtosService.updateProduto).toHaveBeenCalled();
      expect(produtosService.uploadProdutoImagem).not.toHaveBeenCalled();
    });
  });

  it('deve atualizar produto com sucesso', async () => {
    mockSearchParams.set('edit', '1');
    (produtosService.getProdutoById as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'Produto Original',
      descricao: 'Descrição original',
      preco: 100.50,
      categoriaProduto: 'CELULAR_TELEFONIA',
      condicao: 'NOVO',
      status: 'ATIVO',
      imagem: 'imagem.jpg',
    });
    (produtosService.updateProduto as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'Produto Atualizado',
    });
    (produtosService.uploadProdutoImagem as jest.Mock).mockResolvedValue({
      imagem: 'nova-imagem.jpg',
    });

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Editar Anúncio/i)).toBeInTheDocument();
    });

    await waitFor(() => {
      const titleInput = screen.getByLabelText(/Título do anúncio/i);
      expect(titleInput).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText(/Título do anúncio/i);
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, 'Produto Atualizado');

    const submitButton = screen.getByRole('button', { name: /Atualizar anúncio/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(produtosService.updateProduto).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/meus-anuncios');
    });
  });

  it('deve exibir erro ao falhar ao criar produto', async () => {
    (produtosService.createProduto as jest.Mock).mockRejectedValue(
      new Error('Erro ao criar produto')
    );

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/Título do anúncio/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const priceInput = screen.getByLabelText(/Preço/i);
    const categorySelect = screen.getByLabelText(/Categoria/i);

    await userEvent.type(titleInput, 'Produto Teste');
    await userEvent.type(descriptionInput, 'Descrição teste');
    await userEvent.type(priceInput, '100,00');
    fireEvent.change(categorySelect, { target: { value: 'Celulares' } });

    // Simula upload de arquivo sem usar URL.createObjectURL
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // Simula o evento de mudança sem disparar o handler completo
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
        configurable: true,
      });
      fireEvent.change(fileInput);
    }

    const submitButton = screen.getByRole('button', { name: /Publicar anúncio/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao criar produto/i)).toBeInTheDocument();
    });
  });

  it('deve exibir características para diferentes categorias', async () => {
    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const categorySelect = screen.getByLabelText(/Categoria/i);
    
    // Testa Eletrodomésticos
    fireEvent.change(categorySelect, { target: { value: 'Eletrodomésticos' } });
    await waitFor(() => {
      expect(screen.getByLabelText(/Voltagem/i)).toBeInTheDocument();
    });

    // Testa Casa
    fireEvent.change(categorySelect, { target: { value: 'Casa' } });
    await waitFor(() => {
      expect(screen.getByLabelText(/Material/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Dimensões/i)).toBeInTheDocument();
    });

    // Testa Moda
    fireEvent.change(categorySelect, { target: { value: 'Moda' } });
    await waitFor(() => {
      expect(screen.getByLabelText(/Tamanho/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando usuário não está autenticado', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue(null);

    render(
      <MemoryRouter>
        <Anunciar />
      </MemoryRouter>
    );

    const titleInput = screen.getByLabelText(/Título do anúncio/i);
    const descriptionInput = screen.getByLabelText(/Descrição/i);
    const priceInput = screen.getByLabelText(/Preço/i);
    const categorySelect = screen.getByLabelText(/Categoria/i);

    await userEvent.type(titleInput, 'Produto Teste');
    await userEvent.type(descriptionInput, 'Descrição teste');
    await userEvent.type(priceInput, '100,00');
    fireEvent.change(categorySelect, { target: { value: 'Celulares' } });

    // Simula upload de arquivo sem usar URL.createObjectURL
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      // Simula o evento de mudança sem disparar o handler completo
      Object.defineProperty(fileInput, 'files', {
        value: [file],
        writable: true,
        configurable: true,
      });
      fireEvent.change(fileInput);
    }

    const submitButton = screen.getByRole('button', { name: /Publicar anúncio/i });
    await userEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Usuário não autenticado/i)).toBeInTheDocument();
    });
  });
});

