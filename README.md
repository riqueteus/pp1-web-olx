# OLX Clone - Plataforma de Anúncios

Aplicação web similar ao OLX, desenvolvida com React e TypeScript.

## 📋 Sobre o Projeto

Plataforma de marketplace onde usuários podem criar anúncios de produtos, gerenciar seus próprios anúncios. O sistema inclui autenticação completa, gerenciamento de produtos por categoria e upload de imagens.

## 🚀 Tecnologias

- **React 19** + **TypeScript** - Interface e tipagem
- **Vite** - Build tool e dev server
- **React Router** - Roteamento
- **TailwindCSS** - Estilização
- **Jest** + **Testing Library** - Testes unitários
- **Lucide React** - Ícones

## ✨ Funcionalidades

### Autenticação
- Cadastro de vendedores com validação de dados
- Login e logout
- Recuperação de senha
- Verificação de email
- Rotas protegidas

### Gerenciamento de Anúncios
- Criar novos anúncios com imagem
- Editar anúncios existentes
- Listar meus anúncios (publicados, vendidos, inativos)
- Marcar produtos como vendidos
- Inativar produtos
- Categorias: Celulares, Eletrodomésticos, Casa/Decoração, Moda
- Características específicas por categoria (ex: marca, modelo, cor)

### Perfil
- Visualizar e editar dados pessoais
- Gerenciar endereço

## 📁 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis (Header, Footer, UI)
├── pages/            # Páginas da aplicação
├── services/          # Serviços de API (auth, produtos)
├── layouts/          # Layouts da aplicação
├── utils/            # Utilitários
└── types/            # Definições de tipos TypeScript
```

## 🛠️ Instalação e Uso

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn

### Configuração

1. Clone o repositório:
```bash
git clone <url-do-repositorio>
cd pp1-web-olx
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_API_URL=https://sua-api-url.com
```

4. Execute o projeto em desenvolvimento:
```bash
npm run dev
```

5. Build para produção:
```bash
npm run build
```

6. Execute os testes:
```bash
npm test
```

## 📝 Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build de produção
- `npm run lint` - Executa o linter
- `npm test` - Executa os testes
- `npm run test:watch` - Executa testes em modo watch

## 🔐 Rotas

- `/login` - Página de login
- `/cadastro` - Página de registro
- `/recuperacao-senha` - Recuperação de senha
- `/redefinir-senha` - Redefinição de senha
- `/verificar-email` - Verificação de email
- `/` - Meus anúncios (protegida)
- `/anunciar` - Criar/editar anúncio (protegida)
- `/perfil` - Perfil do usuário (protegida)

## 🧪 Testes

O projeto utiliza Jest e React Testing Library para testes unitários. Os testes estão organizados em pastas `__tests__` junto aos componentes e páginas correspondentes.

## 📦 Dependências Principais

- `react` / `react-dom` - Biblioteca React
- `react-router-dom` - Roteamento
- `lucide-react` - Ícones
- `tailwindcss` - Framework CSS

## 🔄 Integração com API

A aplicação consome uma API REST externa configurada através da variável de ambiente `VITE_API_URL`. Os serviços de comunicação com a API estão em `src/services/`:

- `auth.ts` - Autenticação e gerenciamento de usuários
- `produtos.ts` - CRUD de produtos/anúncios

## 📄 Licença

Este projeto é parte de um trabalho acadêmico.
