# Planejamento SST-DocPro

## 1. Diagnóstico do Projeto
O sistema é um web app corporativo (SaaS) voltado para a Segurança e Saúde do Trabalho (SST). O objetivo é substituir o controle de produção de documentos (como PGR, LTCAT, PCMSO) feito por planilhas Excel por uma plataforma web moderna, com banco de dados (inicialmente simulado via localStorage/Zustand), dashboards interativos, geração automática de checklists, acompanhamento de prazos e cálculo automático de progresso.

## 2. Arquitetura Proposta
- **Frontend**: React + TypeScript (Vite).
- **Roteamento**: React Router DOM.
- **Gerenciamento de Estado/Banco Temporário**: Zustand com persistência em `localStorage`. A store atuará como "Repository", permitindo futura substituição por requisições HTTP (Node/Express/Prisma).
- **UI/Estilos**: Tailwind CSS + Shadcn UI (Radix UI) para componentes acessíveis e rápidos.
- **Ícones**: Lucide React.
- **Gráficos**: Recharts.
- **Validação de Formulários**: Zod + React Hook Form (opcional, ou estado controlado simples).
- **Identidade Visual**: Tema premium e corporativo (Tons de verde corporativo, grafite, branco).

## 3. Estrutura de Pastas
```
src/
├── assets/          # Logo, fontes
├── components/      # Componentes de UI
│   ├── ui/          # Componentes Shadcn (Buttons, Inputs, Badges, etc.)
│   └── shared/      # Layout, Sidebar, Header, PageContainer
├── config/          # Variáveis globais, definição do tema
├── lib/             # Utils (cn, formatações de data/CNPJ)
├── pages/           # Telas (Dashboard, Companies, Documents, Production, etc.)
├── router/          # Configurações de rotas
├── store/           # Zustand stores (dados do sistema persistidos)
└── types/           # Interfaces TypeScript (Modelos de dados)
```

## 4. Modelo de Dados
Modelos principais a serem implementados em `src/types/index.ts`:
- `Company`
- `DocumentType`
- `ChecklistTemplate`
- `ProductionDocument`
- `ProductionChecklistItem`

## 5. Lista de Telas
1. **Dashboard (`/`)**: Visão gerencial, métricas, atalhos, gráficos.
2. **Empresas (`/companies`)**: Listagem, cadastro e edição.
3. **Tipos de Documentos (`/documents`)**: Configuração dos documentos padrão.
4. **Modelos de Checklist (`/checklists`)**: Edição dos itens padrão de cada documento.
5. **Produção Documental (`/production`)**: Controle das produções em andamento e concluídas.
6. **Detalhe da Produção (`/production/:id`)**: Tela principal de trabalho, onde o usuário visualiza dados do processo, interage com o checklist, insere notas e acompanha o avanço.
7. **Configurações (`/settings`)**: Edição de opções auxiliares (responsáveis, prioridades).

## 6. Plano de Implementação
**Fase 1: Setup e Core**
- Configurar paleta de cores no Tailwind (identidade visual SST).
- Criar layouts base (Sidebar responsiva, Topbar).
- Criar tipos (interfaces) TypeScript e dados mock (seed data).

**Fase 2: Estado e Mock DB**
- Configurar Zustand com os dados iniciais solicitados (Empresas, Documentos e Checklists base).

**Fase 3: Telas de Cadastro (Cadastros Básicos)**
- Implementar lista e formulários para Empresas e Tipos de Documento.

**Fase 4: Motor de Checklist e Produção**
- Implementar a listagem de produção.
- Criar a funcionalidade de "Novo Documento", que clona o template do checklist.
- Criar a tela de detalhes do documento com lógica de progressão simples/ponderada e status dos itens (Pendente, OK, Não Aplicável).

**Fase 5: Dashboard e Finalização**
- Desenvolver o dashboard gerencial com Recharts.
- Aplicar refinamentos visuais, animações suaves e alertas.

## 7. Critérios de Teste
- [ ] Cadastro, edição e inativação de empresa funciona.
- [ ] É possível criar e configurar um novo tipo de documento.
- [ ] Checklist padrão é devidamente clonado ao iniciar uma nova produção.
- [ ] Alterar status de "Pendente" para "Não Aplicável" afeta a base de cálculo.
- [ ] Alterar status para "OK" avança a barra de progresso.
- [ ] Atingir 100% libera a marcação como Concluído.
- [ ] O Dashboard reflete em tempo real os documentos atrasados, em andamento e concluídos.
- [ ] Todos os dados permanecem salvos após fechar a aba.

## 8. Checklist de Validação Final
- [ ] Sistema apresenta aparência Premium, limpa e alinhada à área corporativa de SST.
- [ ] Layout é responsivo (Mobile e Desktop).
- [ ] Código está estruturado, preparado para receber backend (Prisma/API) no futuro.
- [ ] Seed inicial (PENA FLORESTAL, PGR, LTCAT, etc.) foi carregado com sucesso.
