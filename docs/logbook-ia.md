# Logbook IA — Budget Tracker

**Estudante:** Júlio Araújo
**Unidade Curricular:** Arquitetura e Design de Software
**Data:** Fevereiro 2026

---

## 1. System Prompt

A "system prompt" utilizada para orientar a IA encontra-se no ficheiro `CLAUDE.md` na raiz do projeto. Este ficheiro foi criado antes de iniciar a implementação e define:

- **Papel da IA**: Expert Senior Software Engineer especializado em full-stack JavaScript
- **Contexto**: Aplicação de gestão de finanças pessoais com React, Node.js, Express, SQLite, Drizzle ORM
- **Arquitetura**: Layered architecture (Routes → Services → Repositories), component-based frontend
- **Stack tecnológica**: React 18+ com shadcn/ui, Express.js, SQLite com Drizzle ORM, Recharts, Docker
- **Padrões de código**: ES6+, const por defeito, nomes descritivos, async/await, Zod para validação
- **Anti-patterns documentados**: acesso direto à BD nas rotas, falta de error handling, mistura de lógica de negócio com acesso a dados, falta de loading states no React, URLs hardcoded
- **Schema da BD**: Duas tabelas (categories, transactions) com definições Drizzle completas
- **API endpoints**: Tabela completa de todos os endpoints REST previstos
- **Docker**: Configurações de Dockerfile e compose.yml
- **Checklist de qualidade**: Critérios para backend, frontend, base de dados

O conteúdo integral do ficheiro `CLAUDE.md` (1130 linhas) está disponível no repositório.

---

## 2. Diálogo com a IA

### Sessão: Planeamento e Definição de Tarefas

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 1

> Pretendo que implementes o budget tracker, de acordo com o pretendido no documento @docs/arquitetura.pdf , segue as regras do @CLAUDE.md.
>
> Antes disso:
> 1. Inicializa o git
> 2. Cria um plano (tasks.md) com as múltiplas tarefas necessárias, para implementar de forma faseada.

**Resposta da IA:**

A IA leu o documento de arquitetura (PDF, 9 páginas) e o ficheiro CLAUDE.md. Verificou que o workspace estava vazio (apenas CLAUDE.md existia). Criou um plano de implementação com 8 fases:

- Phase 1: Project Setup and Git Initialization
- Phase 2: Database Layer (Schema + Migrations + Connection)
- Phase 3: Backend — Repository Layer
- Phase 4: Backend — Service Layer (Business Logic)
- Phase 5: Backend — API Routes, Middleware, and Entry Point
- Phase 6: Frontend — Project Setup and Core Components
- Phase 7: Frontend — Feature Components and Charts
- Phase 8: Docker and Final Polish

Incluiu também um diagrama de arquitetura em Mermaid mostrando as relações entre componentes frontend, backend e data layer.

---

### Prompt 2

> Em cada fase, divide em pequenas tarefas, para eu referenciar em outros chats.
>
> Exemplo:
>
> 1.1 Criar git ignore
> 1.2 Criar Readme.md
>
> Não te esqueças de criar já um tasks.md com este plano e as tarefas divididas

**Resposta da IA:**

A IA subdividiu cada fase em tarefas granulares numeradas (ex: 1.1, 1.2, ... 8.6), totalizando 43 sub-tarefas. As tarefas foram escritas em português. Exemplos:

- 1.1 Inicializar repositório git
- 1.2 Criar .gitignore
- 2.2 Criar schema Drizzle
- 3.1 Criar categoryRepository.js
- 7.1 Criar Dashboard.jsx

---

### Prompt 3

> A fase 0, devia ser o ficheiro tasks.md

**Resposta da IA:**

A IA adicionou uma Phase 0 (Planning) com uma única tarefa:
- 0.1 Criar tasks.md na raiz do projeto com o plano completo e todas as tarefas numeradas

Removeu o tasks.md da Phase 1 (que antes era 1.8) e reajustou a numeração.

---

### Prompt 4

> Para a API, adiciona uma spec openapi que documente todos os endpoints.

**Resposta da IA:**

A IA adicionou a tarefa 5.9 ao plano:
- **5.9** Create `docs/openapi.yaml` — OpenAPI 3.0 specification documenting all API endpoints (transactions, categories, recurring, dashboard), request/response schemas, and error responses

---

### Prompt 5

> No final de cada task, só podes dar como completa depois de implementar unit tests, e verificar que os testes passam. Se eu aprovar, faz commit de acordo com o standard dos Conventional Commits.

**Resposta da IA:**

A IA atualizou o plano significativamente:

1. Adicionou uma secção "Commit and Testing Rules" no topo do plano
2. Adicionou Jest como dev dependency no backend (Phase 1.4)
3. Criou sub-tarefas de teste (sufixo "t") para fases de implementação:
   - 3.1t, 3.2t — Repository unit tests
   - 4.1t, 4.2t, 4.3t — Service unit tests
   - 5.4t, 5.5t, 5.6t — Route integration tests
   - 7.1t, 7.3t, 7.4t, 7.5t, 7.6t — Frontend component tests
4. Especificou mensagens de commit Conventional Commits para cada tarefa (ex: `feat: add category repository with unit tests`)
5. Indicou que backend tests usam in-memory SQLite

---

### Sessão: Implementação Phase 1 — Project Setup

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 6

> Implementa a phase 1 do @tasks.md.

**Resposta da IA:**

A IA implementou a Phase 1 completa do plano (tasks 1.1–1.7) e marcou-as como concluídas no `tasks.md`.

- **1.1** — Inicializou o repositório Git (`git init`).
- **1.2** — Criou `.gitignore` (node_modules, .env, data/, dist/, *.db, IDE, OS, logs, coverage).
- **1.3** — Criou a estrutura de pastas: `backend/src/` com config, db/migrations, routes, services, repositories, middleware, utils; `frontend/src/` (via Vite).
- **1.4** — Inicializou o backend com `package.json` em modo ES modules; instalou express, better-sqlite3, drizzle-orm, drizzle-kit, zod, dotenv, cors; definiu scripts dev, start, db:generate, db:migrate, db:seed.
- **1.5** — Inicializou o frontend com template Vite + React 19.
- **1.6** — Instalou dependências do frontend: Tailwind CSS v4 com plugin @tailwindcss/vite, shadcn/ui (init com new-york, lucide, variáveis CSS, alias @/), recharts e lucide-react; criou `jsconfig.json` com alias e `components.json` para shadcn.
- **1.7** — Criou `backend/.env` (PORT, DATABASE_PATH, CORS_ORIGIN, NODE_ENV), `frontend/.env` (VITE_API_URL) e `README.md` na raiz com descrição do projeto, instruções de setup, estrutura e referência da API.

---

### Sessão: Implementação Phase 2 + Bugfix

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 7

> Implementa a phase 2 do @tasks.md. Assim que terminares, cada tarefa, edita o documeto fazendo check.

**Resposta da IA:**

A IA explorou o estado atual do projeto (Phase 0 e 1 já completas, `backend/src/` ainda não existia) e implementou todas as 6 sub-tarefas da Phase 2:

- **2.1** — `backend/src/config/index.js`: configuração centralizada (port, databasePath, corsOrigin, nodeEnv) com dotenv
- **2.2** — `backend/src/db/schema.js`: schema Drizzle com tabelas `categories` (id, name, type) e `transactions` (id, type, amount, description, date, categoryId FK, recurringGroupId, createdAt)
- **2.3** — `backend/src/config/database.js`: conexão better-sqlite3 com WAL mode e instância Drizzle exportada
- **2.4** — `backend/drizzle.config.js`: configuração drizzle-kit apontando para o schema e SQLite
- **2.5** — Gerou migração `0000_robust_doctor_doom.sql` (CREATE TABLE categories + transactions com FK) e aplicou-a com sucesso
- **2.6** — `backend/src/db/seed.js`: script idempotente que insere 15 categorias default (8 expense, 3 income, 4 investment)

Verificou o funcionamento completo: base de dados criada, 15 categorias inseridas, seed idempotente (segunda execução não duplica dados). Criou 4 commits seguindo Conventional Commits:
1. `feat: add centralized backend configuration`
2. `feat: add database schema and Drizzle connection`
3. `feat: add Drizzle migration config and run initial migration`
4. `feat: add database seed with default categories`

---

### Prompt 8

> O ficheiro `database.js` tenta criar uma Database instance em `./data/budget.db`,mas o diretorio `./data/` não existe. A lib `better-sqlite3` não cria os diretorios e vai lançar uma exceção "unable to open database file".

**Resposta da IA:**

A IA confirmou o bug reproduzindo o erro: `Cannot open database because the directory does not exist`. Corrigiu adicionando `fs.mkdirSync(path.dirname(...), { recursive: true })` em dois ficheiros:

- **`backend/src/config/database.js`** — garante que o diretório existe antes de o app ou seed script abrirem a BD
- **`backend/drizzle.config.js`** — garante que o diretório existe antes de `drizzle-kit migrate` tentar conectar

Testou com `rm -rf data && npx drizzle-kit migrate && node src/db/seed.js` — tudo funcional a partir de estado limpo.

---

### Sessão: Implementação Phase 3 — Repository Layer

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 9

> Implementa a phase 3 do @tasks.md. Assim que terminares, cada tarefa, edita o documeto fazendo check.

**Resposta da IA:**

A IA explorou o estado do backend (Phase 2 completa: schema, migrations, seed, config) e implementou a Phase 3 completa — a camada de repositórios com testes unitários.

**Infraestrutura de testes criada:**
- `backend/jest.config.js` — configuração Jest para ES modules
- `backend/src/__tests__/helpers/testDb.js` — helper que cria uma base de dados SQLite in-memory com o schema completo, para evitar poluir a BD de desenvolvimento

**Task 3.1 — categoryRepository.js:**
- Factory pattern (`createCategoryRepository(db)`) para injeção de dependências nos testes, mais instância default exportada para uso em produção
- Operações CRUD completas: `findAll` (ordenado por nome), `findById`, `create`, `update`, `delete`
- **15 testes unitários** cobrindo todos os métodos, incluindo edge cases (ID inexistente, update persistido, delete sem afetar outros registos)

**Task 3.2 — transactionRepository.js:**
- Mesmo factory pattern para testabilidade
- CRUD com filtros opcionais: `type`, `categoryId`, `startDate`, `endDate` (combinação de múltiplos filtros suportada)
- Resultados ordenados por data descendente
- Operações de grupos recorrentes: `findByGroupId`, `deleteByGroupId` (com `fromDate` opcional para cancelar apenas ocorrências futuras), `updateFutureByGroupId`
- Método adicional `existsByCategoryId` — para a Phase 4 poder impedir a eliminação de categorias em uso
- **32 testes unitários** cobrindo CRUD, filtros individuais e combinados, date ranges, operações de grupos recorrentes, e edge cases

**Resultado:** 47 testes, todos a passar. Criou 2 commits:
1. `feat: add category repository with unit tests`
2. `feat: add transaction repository with unit tests`

---

### Sessão: Implementação Phase 4 — Service Layer

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 10

> Implementa a phase 4 do @tasks.md. Assim que terminares, cada tarefa, edita o documeto fazendo check.
>

**Resposta da IA:**

A IA explorou o estado do backend (Phase 3 completa: repositórios com testes) e implementou a Phase 4 completa — a camada de serviços (business logic) com testes unitários.

**Módulo de erros criado** (`backend/src/errors.js`):
- `AppError` — classe base para erros operacionais com HTTP status code
- `NotFoundError` (404) — recurso não encontrado
- `ValidationError` (400) — violação de regras de negócio

**Task 4.1 — categoryService.js:**
- Mesmo factory pattern (`createCategoryService({ categoryRepo, transactionRepo })`) para injeção de dependências
- CRUD delegando ao repositório com verificações de existência (`getById`, `update`, `delete` lançam `NotFoundError` se o ID não existe)
- Regra de negócio principal: `delete` impede eliminação de categorias com transações associadas (lança `ValidationError`)
- **14 testes unitários** cobrindo CRUD, proteção contra eliminação de categorias em uso, e edge cases

**Task 4.2 — transactionService.js:**
- CRUD com validação de categoria (verifica que `categoryId` existe antes de criar/atualizar)
- `generateOccurrences(base, frequency, count)` — gera cópias com datas calculadas usando aritmética UTC-safe (mensal/semanal/anual), evitando problemas de timezone
- `createRecurring(data)` — cria 12 ocorrências ligadas por um `recurringGroupId` partilhado
- `getRecurringGroups()` — retorna informação resumida de cada grupo recorrente (contagem, tipo, montante, primeira/última data)
- `cancelRecurring(groupId, fromDate)` — cancela subscrição (elimina ocorrências futuras)
- `updateRecurring(groupId, fromDate, data)` — atualiza ocorrências futuras em lote
- **35 testes unitários** cobrindo CRUD, geração de ocorrências (mensal/semanal/anual), ciclo de vida de recorrências, validação de categorias, e edge cases

**Task 4.3 — dashboardService.js:**
- `getSummary(filters)` retorna dados agregados:
  - **totals** — soma por tipo (income, expense, investment)
  - **balance** — income − expense − investment
  - **categoryBreakdown** — despesas agrupadas por nome de categoria, ordenadas por montante descendente
  - **monthlyEvolution** — income/expense/investment por mês (YYYY-MM), ordenado ascendente
  - **recentTransactions** — 5 transações mais recentes com nomes de categorias
- Aceita filtros opcionais (startDate, endDate, type, categoryId)
- **17 testes unitários** cobrindo estado vazio, totais, balanço negativo, breakdowns, evolução mensal, transações recentes com/sem categoria, e filtros

### Prompt 11

> Parece existir um desfasamento entre UTC e hora local na função generateOccurrences. Corrige e segue com os testes unitários.
>

**Resposta da IA:**

A IA identificou e corrigiu um bug de timezone na função `generateOccurrences` do `transactionService.js`.

**Problema identificado:**
- A função usava `new Date(string)` para criar a data base, que é interpretada como UTC
- Depois aplicava `setMonth()`, `setDate()` e `setFullYear()`, que operam na hora **local** do sistema
- Esta mistura de UTC e hora local causava desfasamento nas datas geradas.
- Corrigido para usar `Date.UTC()` com métodos `setUTCMonth`/`setUTCDate`/`setUTCFullYear`.

**Resultado:** 113 testes totais (66 novos + 47 existentes), todos a passar.

---

### Sessão: Implementação Phase 5 — API Routes, Middleware e Entry Point

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 12

> Implementa a phase 5 do @tasks.md. Assim que terminares, cada tarefa, edita o documeto fazendo check.

**Resposta da IA:**

A IA explorou o estado do backend (Phases 2–4 completas: schema, repositórios, serviços, erros) e implementou a Phase 5 completa — rotas API, middleware e entry point Express.

**Task 5.1 — middleware/errorHandler.js:**
- Middleware global de tratamento de erros para Express
- Trata erros Zod (400), erros de parse JSON (400), erros operacionais `AppError` (status dinâmico) e erros inesperados (500)
- Suprime logs em ambiente de teste (`NODE_ENV=test`)

**Task 5.2 — middleware/validation.js:**
- 4 middlewares de validação Zod:
  - `validateTransaction` — type, amount, description, date, categoryId
  - `validateRecurringTransaction` — estende transaction com frequency
  - `validateCategory` — name, type
  - `validateUpdateRecurring` — fromDate + campos opcionais de atualização
- Factory genérica `validate(schema)` que parseia `req.body` e passa erros ao error handler

**Task 5.3 — utils/dateUtils.js:**
- Funções utilitárias de data: `today()`, `firstDayOfMonth()`, `lastDayOfMonth()`, `isValidDate()`, `addMonths()`, `parseDate()`

**Task 5.4 — routes/categories.js:**
- Endpoints `GET`, `POST /api/categories` e `PUT`, `DELETE /api/categories/:id`
- Factory pattern (`createCategoryRouter(service)`) para injeção de dependências nos testes
- **10 testes de integração** (CRUD completo, validação de input, proteção contra eliminação de categorias em uso)

**Task 5.5 — routes/transactions.js:**
- CRUD completo `/api/transactions` + endpoints recorrentes (`GET/POST/DELETE/PATCH /api/transactions/recurring`)
- Rotas `/recurring` registadas antes de `/:id` para evitar conflito de parâmetros em Express 5
- **18 testes de integração** (criação, filtros, ciclo de vida de recorrências, edge cases)

**Task 5.6 — routes/dashboard.js:**
- Endpoint `GET /api/dashboard` com filtros opcionais (type, categoryId, startDate, endDate)
- **6 testes de integração** (totais, balanço, breakdown por categoria, evolução mensal, transações recentes, filtro por date range)

**Task 5.7 — routes/index.js:**
- `createApiRouter()` factory que monta todos os sub-routers sob `/api`

**Task 5.8 — index.js (entry point Express):**
- Configuração de CORS, JSON body parser, rotas API e error handler global
- Seed automático de categorias default ao arrancar (idempotente)

**Infraestrutura de testes:**
- Instalou `supertest` como dev dependency
- Criou `__tests__/helpers/testApp.js` — factory que cria uma app Express isolada com BD SQLite in-memory, serviços e repositórios de teste

**Resultado:** 154 testes totais (34 novos de integração + 120 existentes), todos a passar.

---

### Prompt 13

> Ao fazer docker compose up, as migrações não são aplicadas. Adiciona migração automática no startup, para que já inicie com dados populados.

**Resposta da IA:**

A IA adicionou execução automática de migrações Drizzle ao arranque do servidor em `index.js`:
- Importou `migrate` de `drizzle-orm/better-sqlite3/migrator`
- Criou função `runMigrations()` que resolve o caminho das migrações relativo a `__dirname` (via `import.meta.url`)
- Migrações executam sincronamente (better-sqlite3) antes do seed e do `app.listen()`
- Se as migrações falharem, o processo termina com `process.exit(1)`

Sequência de arranque: **Migrations → Seed → Listen**

Todos os 154 testes continuam a passar.

---

### Sessão: Implementação Phase 6 — Frontend Setup e Melhorias UX

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 14

> Implementa a phase 6 do @tasks.md. Assim que terminares, cada tarefa, edita o documeto fazendo check.

**Resposta da IA:**

A IA explorou o estado do projeto (backend completo, frontend com template Vite default) e implementou a Phase 6 completa — setup do frontend e componentes core.

**Tasks 6.1–6.2** — Já estavam feitas de fases anteriores (proxy Vite configurado em `vite.config.js`, Tailwind CSS v4 via CSS, `components.json` e `lib/utils.js` configurados).

**Task 6.3 — Instalação de componentes shadcn/ui:**
- Instalou 10 componentes via CLI: Button, Card, Input, Select, Dialog, Table, Badge, Tabs, Label, Separator

**Task 6.4 — `frontend/src/services/api.js`:**
- Fetch wrapper centralizado com parsing JSON, tratamento de erros e suporte a respostas 204
- Cobre todos os endpoints: transactions CRUD, recurring transactions, categories CRUD, dashboard

**Task 6.5 — `frontend/src/hooks/useTransactions.js`:**
- Hook com lista reativa de transações, operações CRUD, gestão de filtros, estados de loading/error
- Suporte para criação de transações recorrentes

**Task 6.6 — `frontend/src/hooks/useCategories.js`:**
- Hook com lista reativa de categorias, operações CRUD, estados de loading/error

**Task 6.7 — `frontend/src/utils/formatters.js`:**
- Formatação de moeda EUR (`Intl.NumberFormat`), datas localizadas, helpers para inputs de data, labels de tipo

**Task 6.8 — `frontend/src/App.jsx` + `ErrorBoundary.jsx`:**
- Substituiu template Vite default por layout Budget Tracker: header, navegação por tabs (Dashboard, Transactions, Categories) com shadcn/ui Tabs e ícones lucide-react
- Componente `ErrorBoundary` para tratamento gracioso de erros com UI de fallback

**Resultado:** Build limpo, sem erros de linter. Criou 5 commits:
1. `chore: configure Vite proxy, Tailwind CSS, and shadcn/ui components`
2. `feat: add API client service`
3. `feat: add useTransactions and useCategories custom hooks`
4. `feat: add currency and date formatters`
5. `feat: add App shell with tab navigation and ErrorBoundary`

---

### Prompt 15

> É prática comum, quando um button é hovered, muda o cursor para cursor:pointer;

**Resposta da IA:**

A IA adicionou uma regra CSS global no `@layer base` do `frontend/src/index.css`:
- `button, [role="button"] { cursor: pointer; }` — aplica-se a todos os `<button>` e elementos com `role="button"` (cobre componentes shadcn/ui baseados em Radix)

---

### Prompt 16

> The recurring transactions are being created but they shouldn't show up in the UI, before the date they are meant to be shown. Meaning, if i set a monthly subscription, starting from now on. I shouldn't be watching 12 transactions, only 1 today, and the other 12 shown as months go by.

**Resposta da IA:**

A IA identificou que o `TransactionList` chamava `useTransactions()` sem filtros, mostrando todas as 12 ocorrências futuras. Corrigiu:

- **`TransactionList.jsx`** — passou `{ endDate: today() }` como filtro default ao `useTransactions`, para mostrar apenas transações até à data atual
- O utilizador pode ajustar manualmente o filtro "To" para ver transações futuras

Rebuilded o container Docker para aplicar a correção.

---

### Prompt 17

> Deleting a transaction or a category, shows a browser alert instead of a modal. Replace it, as this looks unprofessional, and it breaks the UI design.

**Resposta da IA:**

A IA criou um componente reutilizável `ConfirmDialog` e substituiu todos os `window.confirm` e `alert` nativos:

**Novo componente — `frontend/src/components/ConfirmDialog.jsx`:**
- Modal estilizado com ícone de aviso, título, descrição, botões Cancel/Delete
- Spinner de loading durante a ação de eliminação
- Props configuráveis: title, description, confirmLabel, confirmVariant, loading

**TransactionList.jsx:**
- Clicar no ícone de lixo abre o `ConfirmDialog` em vez de `window.confirm`
- Estado `confirmDeleteId` controla qual transação está pendente de confirmação

**CategoryManager.jsx:**
- Mesmo padrão de substituição de `window.confirm`
- Erros de eliminação (ex: categoria com transações associadas) mostrados inline no dialog em vez de `alert`

---

### Sessão: Implementação Phase 7 — Frontend Feature Components and Charts

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 18

> Implementa a phase 7 do @tasks.md. Assim que terminares, cada tarefa, edita o documeto fazendo check.

**Resposta da IA:**

A IA explorou o estado atual do frontend (Phase 6 completa: App shell com placeholders, hooks, API client, shadcn/ui components, formatters) e o backend (API endpoints e shapes de resposta) para implementar a Phase 7 completa — componentes de funcionalidade e gráficos.

**Task 7.2 — `Charts/ExpensesPieChart.jsx`:**
- Gráfico donut (Recharts) mostrando distribuição de despesas por categoria
- Paleta de 10 cores acessíveis baseadas nos tokens do tema (chart-1 a chart-5 + extras)
- Tooltip customizado com nome da categoria e montante formatado em EUR
- Legenda inferior com nomes das categorias
- Estado vazio quando não há dados

**Task 7.3 — `Charts/MonthlyBarChart.jsx`:**
- Gráfico de barras agrupadas (Recharts) com evolução mensal de income vs expense vs investment
- Barras com cores semânticas: verde (income), vermelho (expense), azul (investment)
- Eixo X com meses formatados ("Feb 26"), eixo Y com valores em milhares ("3k")
- Tooltip customizado e legenda inferior
- Estado vazio quando não há dados

**Task 7.1 — `Dashboard.jsx`:**
- 4 cartões de resumo (Income, Expenses, Investments, Balance) com ícones lucide-react e cores semânticas
- Integração dos dois gráficos (pie chart + bar chart) lado a lado em grid responsivo
- Lista de transações recentes com ícone de tipo, descrição, data, categoria, badge de tipo e montante com cor
- Busca dados agregados do endpoint `/api/dashboard`
- Estados de loading (spinner), erro e vazio

**Task 7.5 — `TransactionForm.jsx`:**
- Formulário em Dialog para criar e editar transações
- Campos: Type (select), Amount, Description, Date, Category (select filtrado por tipo selecionado)
- Toggle "Recurring transaction" (apenas em criação) com selector de frequência (weekly/monthly/annual)
- Validação client-side (montante positivo, data obrigatória)
- Botões dinâmicos: "Create" / "Create Recurring" / "Update" conforme contexto

**Task 7.4 — `TransactionList.jsx`:**
- Tabela de transações com colunas: Date, Type (badge colorido), Description, Category, Amount (com cor e sinal), Actions
- Barra de filtros: tipo, categoria, data inicial, data final
- Botões Refresh e "New Transaction"
- Ações inline: editar (abre TransactionForm) e eliminar (com confirmação)
- Contagem de resultados e estado vazio com CTA
- Integração com `useTransactions` e `useCategories` hooks

**Task 7.6 — `CategoryManager.jsx`:**
- Interface CRUD completa para categorias
- Categorias agrupadas por tipo (expense/income/investment) em cards separados com badge colorido
- Contagem por grupo (ex: "3 categories")
- Dialog para criar/editar com campos Name e Type
- Eliminação com confirmação e tratamento de erro (categorias com transações associadas)

**Atualização do `App.jsx`:**
- Substituiu os 3 componentes placeholder (`DashboardPlaceholder`, `TransactionsPlaceholder`, `CategoriesPlaceholder`) pelos componentes reais (`Dashboard`, `TransactionList`, `CategoryManager`)

**Infraestrutura de testes frontend:**
- Instalou Vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event, jsdom
- Configurou Vitest no `vite.config.js` (environment jsdom, globals, setup file)
- Criou `src/test/setup.js` com mocks de ResizeObserver, window.confirm e window.alert

**Testes unitários (57 testes, todos a passar):**
- `Charts.test.jsx` — 8 testes (estados vazios, renderização com dados, props default)
- `Dashboard.test.jsx` — 8 testes (loading, erro, cartões de resumo, gráficos, transações recentes, badges)
- `TransactionForm.test.jsx` — 13 testes (criação, edição, recurring, validação, cancelar, campos pré-preenchidos)
- `TransactionList.test.jsx` — 14 testes (loading, erro, vazio, renderização, filtros, CRUD, refresh)
- `CategoryManager.test.jsx` — 14 testes (loading, erro, vazio, agrupamento por tipo, CRUD, dialog, eliminação falhada)

**Resultado:** Build limpo, 57 testes a passar. Criou 7 commits:
1. `chore: add Vitest test infrastructure for frontend`
2. `feat: add ExpensesPieChart and MonthlyBarChart with tests`
3. `feat: add Dashboard component with summary cards and tests`
4. `feat: add TransactionForm dialog with tests`
5. `feat: add TransactionList with filters and tests`
6. `feat: add CategoryManager component with tests`
7. `feat: wire up feature components in App and update tasks`

---

### Sessão: Correções — Transações futuras e clamping de datas (Phase 7)

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 19

> Future transactions still show in the UI, that should not be appearing since it didnt arrive the month yet ( they are created, 12 recurrently but shouldnt be shown). I think you said you fixed it, but the change not reflecting in the UI

**Resposta da IA:**

A IA confirmou que o fix (`endDate: today()` no `TransactionList`) já estava no código e no container. O backend com `endDate=2026-02-14` devolvia apenas 2 transações. O problema era **cache do browser**: o `index.html` não tinha headers de no-cache, pelo que o browser continuava a servir um bundle JS antigo. A IA adicionou em `frontend/nginx.conf` headers `Cache-Control: no-cache, no-store, must-revalidate` e `Pragma: no-cache` para o `location /`, e fez rebuild completo com `--no-cache`. Recomendou hard refresh (Cmd+Shift+R) para ver o fix.

---

### Prompt 20

> [JSON do dashboard com totals 14400, monthlyEvolution até 2027-01, recentTransactions futuras] It's coming on the request, and it's shown in the UI in the recent transactions, the problem is the filter is not working server side.

**Resposta da IA:**

A IA identificou que o endpoint **dashboard** (`GET /api/dashboard`) não aplicava filtro de data: devolvia todas as transações, incluindo futuras, inflacionando totais, gráfico mensal e “recent transactions”. Corrigiu em três pontos: (1) **backend** `routes/dashboard.js` — passa a definir `endDate` por defeito como hoje quando não enviado; (2) **backend** `routes/transactions.js` — mesmo critério para consistência; (3) **frontend** `Dashboard.jsx` — passa a chamar `api.getDashboard({ endDate: today() })`. Rebuild confirmou: dashboard e lista de transações passam a mostrar apenas dados até à data atual.

---

### Prompt 21

> By rule, you shouldn't be able to filter expenses that didn't happen yet. Today is 14/02, and if i filter from tomorrow until 2027. The recurring transactions show again. From and to, should max at the current day. To do this correctly i think we can make this server side, you can make the api, just return the transactions till the current date.

**Resposta da IA:**

A IA aplicou **clamping de datas no servidor**: em `routes/transactions.js` e `routes/dashboard.js`, tanto `startDate` como `endDate` passam a ser limitados à data atual. Se o cliente enviar `endDate=2027-01-14`, o servidor usa hoje; se enviar `startDate` no futuro, o parâmetro é ignorado. Comparação com `<= today` para permitir “hoje” como válido. Assim, a API nunca devolve transações futuras, independentemente dos valores enviados nos filtros. Rebuild e testes com curl confirmaram o comportamento (ex.: pedido com startDate=tomorrow e endDate=2027 devolve apenas transações até hoje).

---

### Sessão: Implementação Phase 8 — Docker e Final Polish

**Data:** 14 de Fevereiro de 2026
**Ferramenta:** Claude

---

### Prompt 22

> Implementa a phase 8 do @tasks.md.

**Resposta da IA:**

A IA explorou o estado completo do projeto (Phases 1–7 finalizadas, nenhum ficheiro Docker existente) e implementou a Phase 8 completa — Docker, documentação final e release.

**Task 8.1 — `backend/Dockerfile`:**
- Imagem base Node 20 Alpine
- Instala apenas dependências de produção (`npm ci --omit=dev`)
- Cria diretório `/app/data` para a base de dados SQLite
- Expõe porta 3001

**Task 8.2 — `frontend/Dockerfile`:**
- Build multi-stage: Stage 1 (Node 20 Alpine) executa `npm run build` com Vite; Stage 2 (Nginx Alpine) serve os ficheiros estáticos de `dist/`
- Imagem de produção leve (apenas Nginx + assets compilados)

**Task 8.3 — `frontend/nginx.conf`:**
- Proxy de pedidos `/api/` para o serviço backend (`backend:3001`) via Docker networking
- SPA routing com `try_files $uri $uri/ /index.html` para suportar navegação client-side
- Cache de assets estáticos (JS, CSS, imagens, fontes) com expiração de 1 ano e header `immutable`

**Task 8.4 — `compose.yml`:**
- Serviços `backend` e `frontend` com `restart: unless-stopped`
- Volume nomeado `budget-data` para persistir a base de dados SQLite entre restarts
- Frontend exposto na porta 5173, backend na porta 3001
- Variáveis de ambiente de produção configuradas

**Ficheiros auxiliares criados:**
- `backend/.dockerignore` e `frontend/.dockerignore` — excluem `node_modules`, `.env`, `coverage`, etc. para imagens mais leves

**Task 8.5 — Atualização do `README.md`:**
- Adicionou "Quick Start" com duas opções: Docker (recomendado) e desenvolvimento local
- Secção de testes (backend + frontend)
- Diagrama de arquitetura (Cliente → Express → SQLite)
- Referência completa de endpoints da API
- Instruções para parar serviços e resetar dados (`docker compose down -v`)

**Task 8.6 — Verificação final e release:**
- Executou todos os testes: **211 testes a passar** (154 backend + 57 frontend)
- Atualizou `tasks.md` marcando todas as tarefas 8.1–8.6 como completas
- Criou 3 commits seguindo Conventional Commits:
  1. `ci: add Docker and Docker Compose configuration`
  2. `docs: update README with full setup instructions`
  3. `chore: final review and v1.0.0 tag`
- Criou tag anotada `v1.0.0` com mensagem "v1.0.0 — Initial release of Budget Tracker"

---

