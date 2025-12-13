import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import MeusAnuncios from '../MeusAnuncios';
import * as produtosService from '../../services/produtos';
import * as authService from '../../services/auth';

// Mock do react-router-dom
const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock dos serviços
jest.mock('../../services/produtos', () => ({
  listProdutosUsuario: jest.fn(),
  inativarProduto: jest.fn(),
  markAsSold: jest.fn(),
}));

jest.mock('../../services/auth', () => ({
  getCurrentUser: jest.fn(),
}));

// Mock do window.alert
global.alert = jest.fn();

describe('MeusAnuncios Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 1,
      nome: 'João Silva',
      email: 'joao@example.com',
    });
  });

  it('deve renderizar o título da página', async () => {
    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Meus Anúncios/i)).toBeInTheDocument();
    });
  });

  it('deve exibir loading enquanto carrega dados', () => {
    (produtosService.listProdutosUsuario as jest.Mock).mockImplementation(
      () => new Promise(() => {})
    );

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('deve exibir tabs de navegação', async () => {
    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Publicados/i)).toBeInTheDocument();
      expect(screen.getByText(/Vendidos/i)).toBeInTheDocument();
      expect(screen.getByText(/Inativos/i)).toBeInTheDocument();
    });
  });

  it('deve alternar entre tabs', async () => {
    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Publicados/i)).toBeInTheDocument();
    });

    const vendidosTab = screen.getByText(/Vendidos/i);
    fireEvent.click(vendidosTab);

    await waitFor(() => {
      expect(screen.getByText(/Nenhum anúncio vendido/i)).toBeInTheDocument();
    });
  });

  it('deve exibir lista de produtos publicados', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição 1',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });
  });

  it('deve exibir mensagem quando não há produtos publicados', async () => {
    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Você ainda não tem anúncios publicados/i)).toBeInTheDocument();
    });
  });

  it('deve abrir modal ao clicar em "Deixar como inativo"', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const inativarButton = screen.getByText(/Deixar como inativo/i);
    fireEvent.click(inativarButton);

    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja deixar este anúncio como inativo/i)).toBeInTheDocument();
    });
  });

  it('deve inativar produto ao confirmar', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);
    (produtosService.inativarProduto as jest.Mock).mockResolvedValue(undefined);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const inativarButton = screen.getByText(/Deixar como inativo/i);
    fireEvent.click(inativarButton);

    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja deixar este anúncio como inativo/i)).toBeInTheDocument();
    });

    // Encontra o botão de confirmação no modal (não o botão que abre o modal)
    const allButtons = screen.getAllByText(/Deixar como inativo/i);
    const confirmButton = allButtons.find(
      btn => {
        const button = btn.closest('button');
        const parent = button?.closest('.bg-white.p-6'); // Garante que está no modal
        return button && parent && button.textContent?.trim() === 'Deixar como inativo';
      }
    );
    
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    await waitFor(() => {
      expect(produtosService.inativarProduto).toHaveBeenCalledWith(1);
    });
  });

  it('deve abrir modal ao clicar em "Marcar como vendido"', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const vendidoButton = screen.getByText(/Marcar como vendido/i);
    fireEvent.click(vendidoButton);

    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja marcar este anúncio como vendido/i)).toBeInTheDocument();
    });
  });

  it('deve marcar produto como vendido ao confirmar', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);
    (produtosService.markAsSold as jest.Mock).mockResolvedValue({
      id: 1,
      status: 'VENDIDO',
    });

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const vendidoButton = screen.getByText(/Marcar como vendido/i);
    fireEvent.click(vendidoButton);

    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja marcar este anúncio como vendido/i)).toBeInTheDocument();
    });

    // Encontra o botão de confirmação no modal (não o botão que abre o modal)
    const confirmButton = Array.from(screen.getAllByText(/Marcar como vendido/i)).find(
      btn => {
        const button = btn.closest('button');
        return button && button.textContent?.trim() === 'Marcar como vendido' && 
               button.closest('.bg-white.p-6'); // Garante que está no modal
      }
    );
    
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    await waitFor(() => {
      expect(produtosService.markAsSold).toHaveBeenCalledWith(1);
    });
  });

  it('deve navegar para edição ao clicar em Editar', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const editButton = screen.getByText(/Editar/i);
    fireEvent.click(editButton);

    expect(mockNavigate).toHaveBeenCalledWith('/anunciar?edit=1');
  });

  it('deve fechar modal ao cancelar', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const inativarButton = screen.getByText(/Deixar como inativo/i);
    fireEvent.click(inativarButton);

    await waitFor(() => {
      const cancelButton = screen.getByText(/Cancelar/i);
      fireEvent.click(cancelButton);
    });

    await waitFor(() => {
      expect(screen.queryByText(/Tem certeza/i)).not.toBeInTheDocument();
    });
  });

  it('deve exibir erro ao falhar ao carregar dados', async () => {
    (produtosService.listProdutosUsuario as jest.Mock).mockRejectedValue(
      new Error('Erro ao carregar')
    );

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar/i)).toBeInTheDocument();
    });
  });

  it('deve exibir nome do usuário logado', async () => {
    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/João Silva/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro quando usuário não está autenticado', async () => {
    (authService.getCurrentUser as jest.Mock).mockRejectedValue(
      new Error('Usuário não autenticado')
    );

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Usuário não autenticado/i)).toBeInTheDocument();
    });
  });

  it('deve exibir produtos vendidos na aba vendidos', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto Vendido',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'VENDIDO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Publicados/i)).toBeInTheDocument();
    });

    const vendidosTab = screen.getByText(/Vendidos/i);
    fireEvent.click(vendidosTab);

    await waitFor(() => {
      expect(screen.getByText('Produto Vendido')).toBeInTheDocument();
    });
  });

  it('deve exibir produtos inativos na aba inativos', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto Inativo',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'INATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Publicados/i)).toBeInTheDocument();
    });

    const inativosTab = screen.getByText(/Inativos/i);
    fireEvent.click(inativosTab);

    await waitFor(() => {
      expect(screen.getByText('Produto Inativo')).toBeInTheDocument();
    });
  });

  it('deve exibir características do produto', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
        caracteristicas: {
          'Marca': 'Apple',
          'Modelo': 'iPhone 12',
          'Capacidade de Armazenamento': '128GB',
        },
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
      expect(screen.getByText(/Marca:/i)).toBeInTheDocument();
      expect(screen.getByText(/Apple/i)).toBeInTheDocument();
    });
  });

  it('deve exibir data de publicação quando disponível', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
        dataPublicacao: '2024-01-15T10:00:00Z',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Publicado em:/i)).toBeInTheDocument();
    });
  });

  it('deve exibir erro ao falhar ao inativar produto', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);
    (produtosService.inativarProduto as jest.Mock).mockRejectedValue(
      new Error('Erro ao inativar')
    );

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const inativarButton = screen.getByText(/Deixar como inativo/i);
    fireEvent.click(inativarButton);

    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja deixar este anúncio como inativo/i)).toBeInTheDocument();
    });

    const allButtons = screen.getAllByText(/Deixar como inativo/i);
    const confirmButton = allButtons.find(
      btn => {
        const button = btn.closest('button');
        const parent = button?.closest('.bg-white.p-6');
        return button && parent && button.textContent?.trim() === 'Deixar como inativo';
      }
    );
    
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });

  it('deve exibir erro ao falhar ao marcar como vendido', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'CELULAR_TELEFONIA',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);
    (produtosService.markAsSold as jest.Mock).mockRejectedValue(
      new Error('Erro ao marcar como vendido')
    );

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
    });

    const vendidoButton = screen.getByText(/Marcar como vendido/i);
    fireEvent.click(vendidoButton);

    await waitFor(() => {
      expect(screen.getByText(/Tem certeza que deseja marcar este anúncio como vendido/i)).toBeInTheDocument();
    });

    const confirmButton = Array.from(screen.getAllByText(/Marcar como vendido/i)).find(
      btn => {
        const button = btn.closest('button');
        return button && button.textContent?.trim() === 'Marcar como vendido' && 
               button.closest('.bg-white.p-6');
      }
    );
    
    if (confirmButton) {
      fireEvent.click(confirmButton);
    }

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalled();
    });
  });

  it('deve exibir email quando nome não está disponível', async () => {
    (authService.getCurrentUser as jest.Mock).mockResolvedValue({
      id: 1,
      email: 'joao@example.com',
    });
    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/joao@example.com/i)).toBeInTheDocument();
    });
  });

  it('deve exibir produtos com diferentes categorias', async () => {
    const mockProdutos = [
      {
        id: 1,
        nome: 'Produto 1',
        descricao: 'Descrição',
        preco: 100,
        categoriaProduto: 'ELETRODOMESTICOS',
        condicao: 'USADO',
        status: 'ATIVO',
      },
      {
        id: 2,
        nome: 'Produto 2',
        descricao: 'Descrição',
        preco: 200,
        categoriaProduto: 'CASA_DECORACAO_UTENSILIOS',
        condicao: 'NOVO',
        status: 'ATIVO',
      },
      {
        id: 3,
        nome: 'Produto 3',
        descricao: 'Descrição',
        preco: 300,
        categoriaProduto: 'MODA',
        condicao: 'USADO',
        status: 'ATIVO',
      },
    ];

    (produtosService.listProdutosUsuario as jest.Mock).mockResolvedValue(mockProdutos);

    render(
      <MemoryRouter>
        <MeusAnuncios />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Produto 1')).toBeInTheDocument();
      expect(screen.getByText('Produto 2')).toBeInTheDocument();
      expect(screen.getByText('Produto 3')).toBeInTheDocument();
      expect(screen.getByText(/Eletrodomésticos/i)).toBeInTheDocument();
      expect(screen.getByText(/Casa, Decoração e Utensílios/i)).toBeInTheDocument();
      expect(screen.getByText(/Moda/i)).toBeInTheDocument();
    });
  });
});
