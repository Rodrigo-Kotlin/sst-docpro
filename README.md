# SST DocPro

Plataforma web para gestão de produção de documentos de **Segurança e Saúde do Trabalho** (PGR, LTCAT, PCMSO, AET, LIP e correlatos). Substitui o controle feito em planilhas por um fluxo único de cadastro de empresas, configuração de templates de checklist, acompanhamento de produções com cálculo automático de progresso e dashboards gerenciais.

> Estado atual: **MVP client-side** com persistência em `localStorage`. A camada de store já está isolada para troca por API REST/Prisma sem refatoração estrutural.

---

## Stack

- **React 19** + **TypeScript** (Vite 8)
- **Zustand** (com `persist` middleware) — estado e "repository"
- **React Router DOM 7** — roteamento
- **Tailwind CSS 3** + componentes próprios
- **Radix UI** — `Dialog`, `AlertDialog`, `Popover`, `Tooltip`, etc.
- **Recharts** — gráficos do dashboard
- **Zod** — instalado, ainda não usado nos formulários
- **date-fns** — datas em PT-BR
- **lucide-react** — ícones
- **Vitest** + **Testing Library** — testes unitários

---

## Pré-requisitos

- Node.js 20+ e npm

## Instalação

```bash
npm install
```

## Scripts

| Comando             | Descrição                                  |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Inicia o servidor de desenvolvimento       |
| `npm run build`     | Type-check + build de produção             |
| `npm run preview`   | Serve o build de produção localmente       |
| `npm run lint`      | Roda ESLint                                |
| `npm test`          | Roda a suíte de testes (one-shot)          |
| `npm run test:watch`| Roda os testes em modo watch               |

---

## Deploy (Cloudflare Pages)

O app é um **PWA estático** (Vite + `vite-plugin-pwa`) e está pronto para rodar no **Cloudflare Pages** sem necessidade de Workers/Functions — a persistência continua sendo feita pelo Supabase (REST + Realtime), chamado direto pelo browser.

### Arquivos de configuração

- `.nvmrc` — fixa **Node 20**, mesma versão usada em CI e no Pages.
- `public/_redirects` — fallback de SPA: qualquer rota desconhecida devolve `/index.html` com `200` (necessário para o React Router).
- `public/_headers` — cache correto para PWA:
  - `/sw.js` e `/workbox-*.js` → `Cache-Control: max-age=0, must-revalidate` (evita que clientes fiquem com SW antigo).
  - `/manifest.webmanifest` → `Content-Type: application/manifest+json` + no-cache.
  - `/assets/*` → `max-age=31536000, immutable` (assets com hash do Vite).
  - `/*` → headers de segurança padrão.

> Obs.: este projeto **não usa `wrangler.toml`** quando o deploy é via Git. Toda a configuração de build fica no dashboard do Pages — ter um `wrangler.toml` no repo faz o Pages tentar `wrangler deploy` (modo Workers) em vez de seguir o flow normal de Pages.

### Passo a passo (dashboard)

1. Suba o repositório para o GitHub/GitLab.
2. Em **Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git**, selecione o repo.
3. Configure o build:
   - **Framework preset**: *Vite* (ou *None*)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node version**: `20` (detectado via `.nvmrc`)
4. Em **Settings → Environment variables**, adicione (ambientes *Production* e *Preview*):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. O domínio padrão será `<projeto>.pages.dev`. Pode anexar um domínio custom em **Custom domains**.

### Passo a passo (CLI / Wrangler)

```bash
npm i -g wrangler
wrangler login
wrangler pages deploy dist --project-name sst-docpro
```

Para builds locais + deploy:

```bash
npm run build
wrangler pages deploy dist --project-name sst-docpro
```

### Atualizações do Service Worker

Sempre que houver mudança no `vite.config.ts` (config do PWA) ou nos assets globados, o nome do `sw.js` muda automaticamente (via Workbox). Como o `_headers` força `must-revalidate`, o browser baixa o SW novo na próxima visita; o componente `UpdatePrompt` cuida de avisar o usuário para recarregar.

### Supabase no Cloudflare

Nenhuma alteração é necessária no Supabase. O `VITE_SUPABASE_URL`/`ANON_KEY` são embutidos no build pelo Vite e o browser fala direto com o Supabase via HTTPS — o Cloudflare só serve os arquivos estáticos do PWA.

---

## Estrutura

```
sst-docpro/
├── public/
│   ├── _headers         # Cache e security headers (Cloudflare Pages)
│   ├── _redirects       # SPA fallback → /index.html
│   ├── pwa-*.png        # Ícones do PWA
│   └── ...
├── supabase/
│   ├── schema.sql       # DDL das tabelas
│   └── policies.sql     # RLS policies
├── src/
│   ├── assets/          # Imagens estáticas
│   ├── components/
│   │   ├── shared/      # Layout, Sidebar, Header, MobileSidebar, SyncProvider
│   │   └── ui/          # Modal, ConfirmDialog (Radix wrappers)
│   ├── lib/
│   │   ├── calculations.ts  # Lógica pura de progresso, atraso, prazos
│   │   ├── seed.ts          # Dados iniciais (PENA FLORESTAL, PGR, etc.)
│   │   ├── supabase.ts      # Cliente Supabase (REST)
│   │   ├── supabase-sync.ts # Hydrate + realtime + seed
│   │   └── utils.ts         # cn, formatadores, STATUS_CONFIG
│   ├── pages/           # Telas roteadas
│   ├── store/           # Zustand stores (1 por domínio)
│   └── types/           # Interfaces TypeScript
├── vite.config.ts       # PWA + React
└── .nvmrc               # Node 20
```

---

## Arquitetura

- **Estado global via Zustand** com `persist` middleware: cada store (empresa, documento, produção, configuração) tem sua própria chave no `localStorage` e é hidratado automaticamente no boot.
- **`initializeStorage()`** em `src/lib/storage.ts` semeia os dados iniciais (empresa PENA FLORESTAL, 19 tipos de documento, templates de checklist para PGR/LTCAT/PCMSO/LIP/AET, 8 produções exemplo) na primeira execução.
- **`lib/calculations.ts`** concentra toda a regra de negócio pura (cálculo de progresso, atraso, prazo, faixa de estágio) — totalmente coberta por testes.
- **Componentes `<Modal>` e `<ConfirmDialog>`** encapsulam Radix Dialog/AlertDialog, trazendo focus trap, ESC, ARIA e animações para os fluxos de formulário e confirmação.

### Modelo de dados

Ver `src/types/index.ts`. Entidades principais:

- `Company` — cliente/filial
- `DocumentType` — tipo de documento SST (PGR, LTCAT, …)
- `ChecklistTemplate` — etapa padrão de um tipo de documento
- `ProductionDocument` — produção em andamento ou concluída
- `ProductionChecklistItem` — item clonado do template para uma produção
- `AppSettings` — responsáveis, categorias, periodicidades

### Transições de status (produção)

```
not_started ──┐
pending_info ─┤─→ in_progress ─→ in_review ─→ completed
waiting_client ┘                              cancelled (terminal)
```

- Ao chegar a **100%**, produção vai para `in_review` (não concluída automaticamente).
- Voltar a responder itens após `pending_info`/`waiting_client` retorna para `in_progress`.
- `cancelled` é terminal: itens podem ser marcados mas o status não muda.

---

## Funcionalidades

- **Dashboard**: KPIs (em produção, concluídos, atrasados, progresso médio, empresas ativas), pizza por status, top documentos.
- **Empresas**: CRUD com busca, ativação/inativação, CNPJ/telefone formatados.
- **Documentos padrão**: CRUD com sigla, categoria, periodicidade, responsável padrão.
- **Modelos de checklist**: lista lateral por documento, etapas agrupadas com peso, obrigatório e observações.
- **Produção documental**: lista filtrável, criação de processo (clona template), acompanhamento por checklist com status `Pendente / OK / N/A`.
- **Detalhe da produção**: cabeçalho com empresa/documento/prazo, progresso ponderado ao vivo, notas por item, mudança de status manual.
- **Configurações**: responsáveis, categorias e periodicidades (CRUD).

---

## Roadmap

### Curto prazo
- [ ] Substituir `confirm()`/Modais legados remanescentes (se houver)
- [ ] Remover CSS morto (`.modal-overlay`, etc.) em `index.css`
- [ ] Migrar validações para **Zod** (já instalado)
- [ ] Adicionar histórico/auditoria por produção
- [ ] Exportar produção para PDF/Excel
- [ ] Notificações reais no sino do header
- [ ] Corrigir `lucide-react@1.17.0` (versão inexistente) para a versão real

### Médio prazo
- [ ] **Backend HTTP** (Node/Express ou NestJS + Prisma + Postgres) substituindo o `persist` por chamadas REST. Os stores já estão isolados; basta trocar as mutações por chamadas à API.
- [ ] Autenticação e multi-tenant
- [ ] Paginação nas tabelas
- [ ] Drag-and-drop para reordenar itens de checklist (a action `reorderTemplates` já existe)

### Longo prazo
- [ ] Assinatura digital de documentos emitidos
- [ ] Integração com eSocial / MTE
- [ ] App mobile (React Native ou PWA)

---

## Testes

Cobertura atual: `src/lib/calculations.test.ts` (17 testes) + `src/store/useProductionStore.test.ts` (9 testes).

```bash
npm test
```

Para incluir mais suítes, siga o padrão `*.test.ts(x)` ao lado do código testado.

---

## Licença

Proprietário. Todos os direitos reservados.
