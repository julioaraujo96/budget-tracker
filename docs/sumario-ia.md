# Sumário IA — Budget Tracker

**Estudante:** Júlio Araújo
**Unidade Curricular:** Arquitetura e Design de Software
**Data:** Fevereiro 2026

---

## 1. Sistemas de IA Utilizados

Claude: utilizado para planeamento da arquitetura, geração de código backend e frontend, criação de testes unitários.

---

## 2. System Prompt (CLAUDE.md)

A system prompt foi definida no ficheiro `CLAUDE.md` na raiz do projeto. Este ficheiro é carregado automaticamente pelo Claude Code em cada sessão, garantindo que todas as interações com a IA seguem as mesmas convenções. De seguida, resumo as secções mais importantes e justifico as escolhas feitas.

### Role e Objective

Defini o papel da IA como "Expert Senior Software Engineer" especializado em fullstack JavaScript. Ao atribuir um "role" ao modelo, a IA tende a produzir código mais estruturado, com melhor tratamento de erros e a seguir boas práticas de forma mais consistente do que quando recebe instruções genéricas.

Incluí também uma descrição do contexto do projeto para que possa sempre ser referenciado em cada iteração, para que a IA pudesse tomar decisões coerentes sem que eu tivesse de repetir o contexto em cada prompt.

### Arquitetura em Camadas (Routes, Services, Repositories)

Assim garanto que a IA segue um padrão de arquitetura limpo e não começa a colocar toda a lógica diretamente nos handlers das rotas, misturando preocupações. Ao fornecer a estrutura com exemplos concretos, cada ficheiro gerado seguiu automaticamente a separação de responsabilidades, o que facilitou os testes unitários e a manutenção do código.

### Anti-patterns

Incluí uma secção dedicada a anti-patterns com exemplos lado a lado do que fazer e não fazer. Isto serve como regras standard para a IA seguir explicitamente o que fazer e o que não fazer. Os anti-patterns cobrem:

- Acesso direto à BD nas rotas (sem camada de serviço)
- Ausência de tratamento de erros (sem try/catch)
- Lógica de negócio no repositório
- Componentes React sem estados de loading/error
- URLs de API hardcoded

**Porquê?** LLMs aprendem por padrão estatístico e, sem restrições, reproduzem padrões comuns encontrados em tutoriais simplificados. Os anti-patterns funcionam como "negative prompting" — reduzem a probabilidade de a IA gerar código com esses problemas, seguindo boas práticas e colocando a codebase consistente.

### Drizzle ORM

Ao incluir o schema Drizzle completo no CLAUDE.md, a IA gerou queries consistentes com a estrutura da BD sem inventar colunas ou tabelas inexistentes.

### Padrões de Código (ES6+, const, async/await)

Especifiquei padrões de código com exemplos concretos para garantir consistência em todo o código:

- **ES6+** (arrow functions, destructuring, template literals), código mais conciso e moderno
- **`const` por defeito, `let` apenas quando necessário**, reduz mutabilidade acidental, por vezes a IA ainda tende a utilizar var
- **`async/await` em vez de callbacks ou `.then()`** — torna o código assíncrono mais legível, especialmente em chain de operações.

**Porquê?** Sem estas especificações, a IA pode misturar estilos (ora `function`, ora arrow function. ora `var`, ora `const`) o que resulta numa codebase inconsistente. Ao fixar o estilo, todo o código gerado tem uma prática consistente.

### Validação com Zod e Error Handling

Defini schemas de validação com Zod e classes de erro customizadas (`AppError`, `NotFoundError`, `ValidationError`) para que a IA gerasse código com:

- Validação de input na fronteira da API (middleware)
- Erros descritivos com status codes HTTP apropriados
- Um error handler global que centraliza o tratamento de exceções

Isto evitou que a IA gerasse endpoints sem qualquer validação ou que devolvessem sempre status 500 em caso de erro.

### Configuração e Docker

Incluí exemplos de configuração (`.env`, `database.js`, `compose.yml`) para que a IA evitasse o hardcoding de valores como portas, caminhos da BD. Isto garantiu que o projeto fosse configurável desde o início, sem necessidade de refactoring posterior.

---

## 3. Sumário das Prompts Utilizadas

### Planeamento

- Pedi à IA para implementar o budget tracker de acordo com o documento de arquitetura (PDF) e as regras do CLAUDE.md, começando por inicializar o git e criar um plano faseado (`tasks.md`)
- Solicitei divisão de cada fase em sub-tarefas granulares numeradas (ex: 1.1, 1.2) para facilitar referência entre sessões
- Pedi para adicionar a criação do `tasks.md` como Phase 0
- Solicitei adição de uma spec OpenAPI para documentar todos os endpoints da API
- Defini a regra de que cada tarefa só pode ser marcada como completa após implementar e verificar testes unitários, com commits seguindo Conventional Commits como standard

### Phase 0 — Planning

- **0.1** Criação do ficheiro `tasks.md` na raiz do projeto com o plano completo e todas as tarefas numeradas, para referência entre chats e entrega

### Phase 1 — Project Setup and Git Initialization

- **1.1** Inicialização do repositório git (`git init`)
- **1.2** Criação do `.gitignore` (node_modules, .env, data/, dist/, *.db)
- **1.3** Criação da estrutura de pastas (`backend/src/`, `frontend/src/`)
- **1.4** Inicialização do `backend/package.json` e instalação de dependências (express, better-sqlite3, drizzle-orm, drizzle-kit, zod, dotenv, cors) e dev deps (Jest)
- **1.5** Inicialização do frontend com template Vite + React
- **1.6** Instalação de dependências do frontend (shadcn/ui, recharts, tailwindcss, lucide-react)
- **1.7** Criação dos ficheiros `.env` para backend e frontend e `README.md` na raiz

### Database Layer — Phase 2

- Pedi implementação da Phase 2 completa: configuração centralizada, schema Drizzle, conexão BD, migração e seed de categorias default
- Identifiquei um bug onde `better-sqlite3` não cria diretórios automaticamente, pedi à IA para corrigir.

### Repository Layer — Phase 3

- Pedi implementação da Phase 3 completa: repositórios de categorias e transações com factory pattern para injeção de dependências, incluindo infraestrutura de testes com BD in-memory

### Service Layer — Phase 4

- Pedi implementação da Phase 4 completa: serviços de categorias, transações e dashboard com lógica de negócio, classes de erro customizadas
- Identifiquei um bug de timezone na função `generateOccurrences` (mistura de UTC e hora local) e pedi correção

### API Routes e Middleware — Phase 5

- Pedi implementação da Phase 5 completa: middlewares de validação Zod e error handling, rotas Express para todos os endpoints, entry point com CORS e seed automático
- Reportei que ao fazer `docker compose up` as migrações não eram aplicadas, pedi para correr migração automática no startup do servidor

### Frontend Setup — Phase 6

- Pedi implementação da Phase 6 completa: componentes shadcn/ui, API client, custom hooks, formatters, App shell com navegação por tabs e ErrorBoundary
- Pedi para adicionar `cursor: pointer` em hover de botões, por ser prática comum de usabilidade
- Reportei que transações recorrentes futuras apareciam na UI antes da data prevista, pedi para filtrar por data atual

### Frontend Features e Charts — Phase 7

- Pedi implementação da Phase 7 completa: Dashboard com cartões de resumo e gráficos (pie chart e bar chart com Recharts), formulário de transações, lista com filtros, gestão de categorias, e 57 testes frontend com Vitest
- Reportei que transações futuras continuavam a aparecer apesar do fix anterior.
- Identifiquei que o endpoint de dashboard não aplicava filtro de data, inflacionando totais e mostrando transações futuras
- Pedi clamping de datas no servidor para que a API nunca devolva transações futuras, independentemente dos filtros enviados pelo cliente
- Pedi substituição dos `window.confirm`/`alert` nativos por um componente modal estilizado (`ConfirmDialog`), por quebrar o design da UI.

### Docker e Final Polish — Phase 8

- Pedi implementação da Phase 8 completa: Dockerfiles (backend Node Alpine, frontend multi-stage com Nginx), compose.yml com volume persistente, .dockerignore, atualização do README, e verificação final.

---

## 4. Crítica ao Output da IA

### 4.1 O que foi útil

- **Scaffolding rápido do projeto** - a IA gerou a estrutura completa a partir de um único documento de arquitetura, poupando horas de setup manual.
- **Consistência arquitetural** — ao longo de todas as fases, o código gerado respeitou a separação Routes/Services/Repositories sem desvios, graças à system prompt bem definida.
- **Conventional Commits** — cada commit seguiu o formato especificado (`feat:`, `fix:`, `chore:`, `ci:`, `docs:`), resultando num histórico git limpo e legível
- **Código consistente** — o código gerado usou consistentemente ES6+, async/await, destructuring e padrões React modernos (hooks, functional components), sem misturar estilos, seguindo as regras defenidas na system prompt.

### 4.2 O que era tendencioso, limitado ou errado

- **Bug do diretório inexistente** — a IA não previu que `better-sqlite3` não cria diretórios automaticamente. O código de `database.js` assumia que `./data/` já existia, causando crash ao arrancar num ambiente limpo. Tive de identificar o problema e pedir a correção explicitamente.
Isto talvez pudesse ter sido resolvido, utilizando um MCP como o context7 e indicar a IA para verificar a documentação oficial da lib.
- **Bug de timezone** — a função `generateOccurrences` misturava `new Date(string)` (interpretado como UTC) com `setMonth()`/`setDate()` (que operam em hora local). Este é um erro subtil que a IA não detetou sozinha, produziu código que parecia correto mas gerava datas erradas dependendo do fuso horário do sistema.
- **Transações futuras visíveis** - este foi o problema mais persistente. A IA "corrigiu" o bug três vezes antes de resolver completamente: primeiro filtrou no frontend, depois descobriu-se que era cache do nginx, depois que o endpoint de dashboard não filtrava, e finalmente foi necessário impor clamping server-side. Isto mostra que a IA tende a aplicar fixes superficiais sem considerar todos os caminhos que os dados percorrem, ou considerar todos os edge cases.
Enquanto a codebase fica maior, é importante delinear bem os componentes envolvidos para a realização da tarefa (Até se pode pedir a propia IA para investigar primeiro) e até mesmo pedir-lhe para demorar mais tempo no reasoning (certas keywords como ultrathink no claude, fazem com que o modelo leve mais tempo a investigar)
- **Migrações não automáticas**  — a IA não previu que as migrações não estavam a correr. Sem esta correção, o container arrancava com uma BD vazia.

### 4.3 O que só funcionava parcialmente

- **Filtro de transações futuras** — como descrito acima, o primeiro fix (filtro `endDate` no frontend) só cobria a lista de transações, não o dashboard nem pedidos com filtros manuais. Foram necessárias 4 iterações para chegar a uma solução completa (clamping server-side em todos os endpoints)
- **Cache do browser após rebuild** — mesmo após corrigir o código e rebuild do container Docker, o browser continuava a servir o bundle antigo porque o nginx não tinha headers de no-cache para o `index.html`. A IA só identificou este problema quando confrontada com evidência de que o fix já estava no código mas não se refletia na UI

---

## 5. Reflexão Pessoal

O aspeto mais valioso deste processo foi a velocidade de prototipagem. A IA permitiu passar de um documento de arquitetura para uma aplicação funcional com 211 testes em poucas sessões de trabalho. Tarefas repetitivas como scaffolding de CRUD, configuração de testes e criação de Dockerfiles, que normalmente consomem tempo sem exigir decisões criativas, foram delegadas com sucesso.

No entanto, a experiência mostrou claramente que a IA não substitui o pensamento critico do programador. Os bugs mais importantes foram todos identificados por mim durante a revisão ou teste manual. A IA produziu código que parecia correto mas falhava em pequenos edge cases. Isto reforça a importância de nunca aceitar output de IA sem verificação. Assim que sai de algo que não está suficientemente balizado na system prompt, que não cobre certo edge case ou na medida em que a codebase vai crescendo, é preciso ter em atenção que a IA chega a 90% do resultado mas existe um detalhe ou outro que precisa de ser refinado ou até ser necessário voltar atrás ou fazer mais iterações nos prompts.

A IA foi mais valiosa em tarefas estruturais e repetitivas: criar repositórios com operações CRUD, gerar testes para cobrir variantes de input, configurar Docker e Nginx. Foi menos fiável em tarefas que exigem raciocínio sobre estado e fluxo de dados, como garantir que transações futuras nunca aparecem na UI, que requeriu compreender o percurso dos dados desde a BD até ao browser.

Aqui talvez pudesse ajudar um MCP para a IA interagir com o browser mas mesmo assim era preciso que ela tivesse identificado o fluxo entre backend e frontend.

Uma lição importante foi o valor de uma system prompt bem estruturada. O investimento inicial em criar o CLAUDE.md com exemplos concretos, anti-patterns e schema da BD pagou-se ao longo de todo o projeto: cada sessão começava com contexto completo, sem necessidade de repetir decisões. Numa próxima vez, incluiria também regras sobre tratamento de datas e timezones, que se revelou ser uma fonte recorrente de problemas.
