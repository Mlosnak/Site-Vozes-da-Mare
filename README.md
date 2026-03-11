# Vozes da Maré Web App

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Platform-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

Aplicação web editorial com área pública e painel administrativo, construída para publicação de conteúdos, organização por categorias/autores e acompanhamento de métricas de visualização. O projeto demonstra desenvolvimento full stack orientado a produto, com foco em experiência do usuário e operação de conteúdo.

<img width="1854" height="937" alt="Screenshot_1" src="https://github.com/user-attachments/assets/049cc3bd-bf05-436a-ac23-f2afcf42b063" />

## Visão Geral

- Portal público com páginas de conteúdo, busca e navegação por categoria/autor.
- Painel administrativo para gestão de artigos, categorias, banners, autores e destaques.
- Integração com Supabase para dados e autenticação de operações no painel.
- UI moderna com componentes reutilizáveis, tema e responsividade.
- Estrutura modular para escalar novas funcionalidades editoriais.

## Funcionalidades Principais

- **Conteúdo editorial**: textos/notícias com slug, capa, autor e categorização.
- **Descoberta**: busca por termos e filtros por categorias/autores.
- **Gestão administrativa**: CRUD completo de conteúdo e ativos visuais.
- **Mídia**: upload e recorte de imagem para banners e avatares.
- **Métricas**: rastreamento de visualizações por artigo, categoria e autor.

## Arquitetura do Sistema

```
React + Vite (Frontend)
   │
   ├── Pages (rotas públicas e admin)
   ├── Components (UI e domínio)
   ├── Hooks/Lib (regras reutilizáveis)
   ▼
Supabase (DB + API + storage)
```

### Rotas relevantes

- `/` início
- `/textos`, `/noticias`, `/sobre-nos`, `/partido`, `/contato`, `/filie-se`
- `/artigo/:slug`, `/autor/:slug`, `/autores`, `/categoria/:slug`, `/busca`
- `/gatewayhorsemint/login` e `/gatewayhorsemint` (admin)

## Stack Técnica

- React 18 + TypeScript
- Vite 5
- Tailwind CSS + Radix UI + shadcn/ui
- TanStack Query
- Supabase JS
- React Router

## Instalação e Configuração

### Pré-requisitos

- Node.js 18+
- npm 9+

### Passos

```bash
git clone <url-do-repositorio>
cd "site nathan"
npm install
cp .env.example .env
```

Configure as variáveis no `.env`:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=...
VITE_JWT_SECRET=...
```

### Ambiente de desenvolvimento

```bash
npm run dev
```

### Build de produção

```bash
npm run build
npm run preview
```

## Exemplos de Uso Prático

- Publicar um artigo no painel admin e validar exibição automática na home.
- Criar categoria, associar artigos e validar rota dinâmica `/categoria/:slug`.
- Ajustar banner com recorte para campanha e confirmar impacto visual no destaque.
- Monitorar visualizações para apoiar decisões editoriais baseadas em dados.

## Competências Evidenciadas para Portfólio

- Construção de SPA moderna com roteamento e estados assíncronos.
- Organização de arquitetura frontend escalável por domínio.
- Integração com backend BaaS, incluindo modelagem e consumo de dados.
- Aplicação de UX/UI em produto real com foco em usabilidade e performance.
- Resolução de problemas de conteúdo dinâmico e operação administrativa.

## Scripts Disponíveis

- `npm run dev`: inicia servidor local
- `npm run build`: gera build de produção
- `npm run build:dev`: gera build em modo desenvolvimento
- `npm run lint`: análise estática de código
- `npm run preview`: serve build localmente

## Contribuição

1. Crie uma branch: `feature/minha-mudanca`
2. Execute validações: `npm run lint` e `npm run build`
3. Abra Pull Request com motivação, escopo e evidências de teste

## Estatísticas do Repositório

Após publicar no GitHub, substitua `<owner>` e `<repo>`:

```md
![GitHub Repo stars](https://img.shields.io/github/stars/<owner>/<repo>?style=social)
![GitHub forks](https://img.shields.io/github/forks/<owner>/<repo>?style=social)
![GitHub last commit](https://img.shields.io/github/last-commit/<owner>/<repo>)
```
>>>>>>> f3731ff (First Commit Auth system)
