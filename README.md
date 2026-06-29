# 🏭 Sistema de Registro de Produção de Teares Circulares

API RESTful com testes automatizados para gestão de registros de produção de teares circulares industriais.

> **Contexto:** aplicação desenvolvida para substituir o processo manual de anotação em planilha, permitindo inserção, consulta, edição e exclusão de registros de produção via interface web.

---

## 👥 Equipe e Divisão de Responsabilidades

| Pessoa | Responsabilidade |
|--------|-----------------|
| **Júlia** | Front-end — `index.html`, `style.css`, `app.js` |
| **Miguel** | Testes de front-end — Playwright |
| **Felipe** | API — rotas, controllers, services, repository |
| **Lucas** | Testes unitários (Jest) + testes de integração (Supertest) |
| **Klaus** | Testes de carga e estresse — Grafana K6 |
| **Mirella** | Documentação — `swagger.yaml` + Swagger UI + teste de contrato (dredd) |
| **Pedro** | Infraestrutura — `docker-compose.yml`, `Dockerfile`, script SQL, `start.js`, `stop.js`, `test.js`, `setup.js` |

---

## 🗓️ Ordem de Execução

A ordem abaixo deve ser respeitada pois cada etapa depende da anterior.

```
Etapa 1 — Pedro
  └── Sobe a infraestrutura: docker-compose, Dockerfile, PostgreSQL e script SQL
        ↓
Etapa 2 — Felipe
  └── Implementa a API (rotas, controllers, services, repository)
        ↓
Etapa 3 — Júlia + Mirella (em paralelo)
  ├── Júlia: constrói o front-end conectado à API
  └── Mirella: documenta os endpoints no swagger.yaml + configura Swagger UI
        ↓
Etapa 4 — Lucas + Klaus + Miguel + Mirella (em paralelo)
  ├── Lucas: testes unitários Jest + testes de integração Supertest
  ├── Klaus: scripts de carga e estresse K6
  ├── Miguel: testes Playwright do front-end
  └── Mirella: teste de contrato com dredd
        ↓
Etapa 5 — Pedro
  └── Integra tudo: valida docker compose up, implementa start.js e test.js,
      garante que npm run setup + npm run start + npm run test funcionam do zero
```

---

## 🗂️ Estrutura do Projeto

```
textile-production-api/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── ProducaoController.js
│   │   ├── services/
│   │   │   └── ProducaoService.js
│   │   ├── repositories/
│   │   │   └── ProducaoRepository.js
│   │   ├── routes/
│   │   │   └── ProducaoRoute.js
│   │   ├── db/
│   │   │   └── ConexaoDB.js
│   │   └── app.js
│   ├── tests/
│   │   ├── unit/
│   │   │   └── producao.service.test.js
│   │   └── integration/
│   │       └── producao.integration.test.js
│   ├── swagger.yaml
│   ├── init.sql
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── index.html
│   ├── style.css
│   ├── app.js
│   ├── playwright.config.js
│   └── tests/
│       └── producao.spec.js
│
├── k6/
│   ├── load-test.js        ← teste de carga
│   └── stress-test.js      ← teste de estresse
│
├── nginx/
│   └── nginx.conf
│
├── docker-compose.yml
├── dredd-hooks.js          ← hooks do teste de contrato
├── package.json            ← scripts npm da raiz
├── setup.js                ← instala todas as dependências
├── start.js                ← sobe o ambiente Docker
├── stop.js                 ← derruba o ambiente Docker
└── test.js                 ← roda todos os testes em sequência
```

---

## 🗃️ Modelo de Dados

**Tabela:** `producoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | Identificador único |
| `data_producao` | TIMESTAMP | Data e hora do registro |
| `numero_tear` | VARCHAR(20) | Identificador do tear (ex: "T-042") |
| `codigo_produto` | VARCHAR(30) | Código do produto (ex: "MAL-001") |
| `turno` | INTEGER | Turno de trabalho: 1, 2 ou 3 |
| `qualidade` | INTEGER | Classificação: 1 (Alta), 2 (Média) ou 3 (Baixa) |
| `quilos` | DECIMAL(10,2) | Volume produzido em kg |
| `pecas` | INTEGER | Quantidade de peças produzidas |
| `created_at` | TIMESTAMP | Data de inserção do registro |

---

## 🚀 Como Rodar

### Pré-requisitos

- Node.js v18 ou superior
- Docker instalado e **rodando**

### 1. Instalar dependências

Na raiz do projeto, execute **uma única vez**:

```bash
npm run setup
```

O script `setup.js` faz automaticamente:
1. Verifica a versão do Node.js
2. Instala as dependências da API (`api/node_modules`)
3. Instala as dependências do frontend (`frontend/node_modules`)
4. Verifica e instala o Dredd globalmente se não estiver instalado
5. Verifica se o Docker está instalado e rodando
6. Verifica se o K6 está disponível (opcional)

### 2. Subir o ambiente

```bash
npm start
```

O script `start.js` faz automaticamente:
1. Verifica Docker e Docker Compose
2. Derruba containers anteriores se existirem
3. Faz build e sobe os 3 containers
4. Aguarda PostgreSQL e API responderem antes de liberar

Ao final, os serviços estarão disponíveis em:
- Front-end: `http://localhost:8080`
- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- PostgreSQL: `localhost:5432`

### 3. Rodar todos os testes

```bash
npm test
```

O script `test.js` executa todas as suites em sequência, exibindo a saída real de cada uma no terminal. Ao final mostra um resumo:

```
============================================
  Resultado final
============================================

  Jest unitário              ✅ OK
  Supertest integração       ✅ OK
  Dredd contrato             ✅ OK
  K6 carga                   ✅ OK
  K6 estresse                ✅ OK
  Playwright                 ✅ OK

  ✅ Todos os testes passaram!
============================================
```

> ⚠️ Requer que o ambiente esteja no ar (`npm start`) antes de rodar.

### 3.1 Rodar cada suite separadamente

| Suite | Comando | Precisa do ambiente? |
|---|---|---|
| Jest unitário | `cd api && npm test -- --testPathPattern=unit` | Não (banco mockado) |
| Supertest integração | `cd api && npm test -- --testPathPattern=integration` | Sim |
| Dredd contrato | `cd api && dredd swagger.yaml http://localhost:3000/api --hookfiles=../dredd-hooks.js` | Sim |
| K6 carga | `k6 run k6/load-test.js` | Sim |
| K6 estresse | `k6 run k6/stress-test.js` | Sim |
| Playwright | `cd frontend && npx playwright test` | Sim |
| Playwright (com browser visível) | `cd frontend && npx playwright test --headed` | Sim |

### 4. Gerar relatório de cobertura de testes

```bash
cd api && npm run coverage
```

Gera um relatório HTML em `coverage/index.html` mostrando quais linhas do código são cobertas pelos testes unitários.

### Derrubar o ambiente

```bash
npm stop
```

---

## 🔌 Endpoints da API

Base URL: `http://localhost:3000/api`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/producoes?page=1&limit=10&turno=1` | Listagem paginada |
| GET | `/producoes/:id` | Busca por ID |
| POST | `/producoes` | Cria registro |
| PUT | `/producoes/:id` | Atualiza registro |
| DELETE | `/producoes/:id` | Remove registro |

### GET /producoes
**Resposta 200:**
```json
{
  "meta": {
    "pagina_atual": 1,
    "limite_por_pagina": 10,
    "total_registros": 10,
    "total_paginas": 1
  },
  "data": [
    {
      "id": 1,
      "data_producao": "2026-04-20T06:15:22.000Z",
      "numero_tear": "T-001",
      "codigo_produto": "MAL-001",
      "turno": 1,
      "qualidade": 1,
      "quilos": "8.50",
      "pecas": 275,
      "created_at": "2026-04-20T06:15:22.000Z"
    }
  ]
}
```

### POST /producoes
**Body:**
```json
{
  "data_producao": "2026-04-20",
  "numero_tear": "T-042",
  "codigo_produto": "MAL-001",
  "turno": 1,
  "qualidade": 1,
  "quilos": 8.5,
  "pecas": 270
}
```
**Resposta 201:** registro criado.
**Resposta 400:** campo obrigatório ausente ou valor inválido.

### PUT /producoes/:id
**Body:** mesmos campos do POST.
**Resposta 200:** registro atualizado.
**Resposta 404:** registro não encontrado.

### DELETE /producoes/:id
**Resposta 200:**
```json
{ "message": "Registro com ID 1 removido com sucesso." }
```
**Resposta 404:** registro não encontrado.

---

## 📄 Documentação OpenAPI e Teste de Contrato — Mirella

**Arquivo:** `api/swagger.yaml`
**Interface:** `http://localhost:3000/docs`

O arquivo documenta todos os endpoints, parâmetros, bodies e respostas seguindo o padrão OpenAPI 3.0.

### Teste de Contrato — dredd

Valida automaticamente que as respostas reais da API batem com o que está documentado no `swagger.yaml`.

**Como rodar manualmente:**
```bash
cd api
dredd swagger.yaml http://localhost:3000/api --hookfiles=../dredd-hooks.js
```

O arquivo `dredd-hooks.js` (na raiz) cria registros dinamicamente antes dos testes que precisam de um ID válido, garantindo que GET/PUT/DELETE por ID funcionem sem depender de dados fixos no banco.

> ⚠️ Depende da API no ar.

---

## 🖥️ Front-end — Júlia

Interface acessível em `http://localhost:8080`.

**Funcionalidades a implementar:**
- Tabela paginada com todos os registros
- Filtro por turno
- Botão "Novo Registro" abre formulário de criação
- Botão "Editar" em cada linha abre formulário preenchido
- Botão "Excluir" remove o registro com confirmação

**Arquivos:**
- `frontend/index.html` — estrutura da página
- `frontend/style.css` — estilização
- `frontend/app.js` — chamadas `fetch` à API, renderização da tabela, lógica do formulário

> A API é acessível pelo frontend via `/api/producoes` (mesmo host, nginx faz o proxy).

---

## 🧪 Testes Unitários e de Integração — Lucas

### Testes Unitários — `api/tests/unit/producao.service.test.js`

Testa a camada service com repositório **mockado** via `jest.mock()`, isolando a lógica de negócio do banco.

**Como rodar:**
```bash
cd api && npm test -- --testPathPattern=unit
```

### Testes de Integração — `api/tests/integration/producao.integration.test.js`

Testa os endpoints reais contra a API rodando no Docker. Valida o fluxo completo: requisição → controller → service → repository → banco → resposta.

**Como rodar:**
```bash
cd api && npm test -- --testPathPattern=integration
```

> ⚠️ Depende da API no ar (`npm start`).

---

## 📊 Testes de Carga e Estresse — Klaus

**Instalação do K6:** https://k6.io/docs/get-started/installation/

### Teste de Carga — `k6/load-test.js`

Simula o uso normal do sistema.

```bash
k6 run k6/load-test.js
```

- 15 VUs constantes por 30 segundos
- Threshold: p95 < 500ms, erros < 1%

### Teste de Estresse — `k6/stress-test.js`

Aumenta usuários progressivamente até encontrar o limite.

```bash
k6 run k6/stress-test.js
```

- Stages: 10 → 50 → 100 VUs
- Threshold: p95 < 1000ms, erros < 5%

> ⚠️ Depende da API no ar.

---

## 🎭 Testes de Front-end — Miguel

**Arquivo:** `frontend/tests/producao.spec.js`

**Como rodar:**
```bash
cd frontend
npx playwright install
npx playwright test
```

O professor exige **5 fluxos obrigatórios**, um para cada endpoint da API. Cada teste deve abrir o navegador, interagir com a interface e verificar o resultado visualmente.

### Fluxo 1 — Listagem (GET paginado)
Valida o endpoint `GET /api/producoes`.

```
1. Abre http://localhost:8080
2. Verifica que a tabela de registros está visível na página
3. Verifica que há pelo menos 1 linha de registro na tabela
4. Verifica que as colunas esperadas estão presentes (tear, produto, turno, etc.)
```

### Fluxo 2 — Consulta por ID (GET by ID)
Valida o endpoint `GET /api/producoes/:id`.

```
1. Abre http://localhost:8080
2. Clica em um registro específico da tabela (ou navega para a URL com o ID)
3. Verifica que os detalhes daquele registro aparecem corretamente
4. Verifica que o ID exibido bate com o registro selecionado
```

### Fluxo 3 — Criação (POST)
Valida o endpoint `POST /api/producoes`.

```
1. Abre http://localhost:8080
2. Clica no botão de novo registro
3. Preenche todos os campos do formulário:
   - Data de produção (uma data passada)
   - Número do tear (ex: "T-TESTE")
   - Código do produto (ex: "MAL-001")
   - Turno (1, 2 ou 3)
   - Qualidade (1, 2 ou 3)
   - Quilos (ex: 10.5)
   - Peças (ex: 100)
4. Clica em salvar
5. Verifica que o registro criado aparece na tabela
```

### Fluxo 4 — Atualização (PUT)
Valida o endpoint `PUT /api/producoes/:id`.

```
1. Abre http://localhost:8080
2. Localiza um registro na tabela
3. Clica no botão de editar daquele registro
4. Altera um campo (ex: muda o número de peças)
5. Salva as alterações
6. Verifica que o valor atualizado aparece na tabela
```

### Fluxo 5 — Exclusão (DELETE)
Valida o endpoint `DELETE /api/producoes/:id`.

```
1. Abre http://localhost:8080
2. Localiza um registro na tabela e anota o ID
3. Clica no botão de excluir daquele registro
4. Confirma a exclusão
5. Verifica que o registro não aparece mais na tabela
```

> ⚠️ Depende do front-end da Júlia estar pronto e da API no ar (`npm start`).
> Os testes devem rodar contra `http://localhost:8080` — configure a `baseURL` no `playwright.config.js`.

---

## 🐳 Infraestrutura — Pedro

**Containers:**

| Container | Tecnologia | Porta |
|-----------|-----------|-------|
| `producao-api` | Node.js 20 + Express | 3000 |
| `producao-postgres` | PostgreSQL 16 | 5432 |
| `producao-frontend` | nginx | 8080 |

---

## ✅ Checklist de Entrega

### Pedro
- [x] `docker-compose.yml` com os 3 containers
- [x] `Dockerfile` da API
- [x] `init.sql` com criação da tabela e dados de seed
- [x] `nginx/nginx.conf` com proxy para a API
- [x] `package.json` na raiz com scripts `setup`, `start`, `stop` e `test`
- [x] `setup.js` — instala todas as dependências automaticamente
- [x] `start.js` com verificações de Docker e subida dos containers
- [x] `stop.js` que derruba todos os containers
- [x] `test.js` que roda todos os testes em sequência com resumo no terminal
- [x] `npm run setup` instala tudo sem erro
- [x] `npm start` sobe tudo sem erro
- [x] `npm stop` derruba tudo sem erro
- [x] `npm test` executa todos os testes e exibe resultado final

### Felipe
- [x] GET /api/producoes com paginação e filtro por turno
- [x] GET /api/producoes/:id com 404
- [x] POST /api/producoes com validação de campos e regras de negócio
- [x] PUT /api/producoes/:id com 404
- [x] DELETE /api/producoes/:id com 404

### Júlia
- [x] Tabela renderizando registros da API
- [x] Formulário de criação funcionando
- [x] Formulário de edição funcionando
- [x] Exclusão com confirmação funcionando
- [ ] Filtro por turno funcionando

### Mirella
- [x] Todos os endpoints documentados no `swagger.yaml`
- [x] Swagger UI acessível em `http://localhost:3000/docs`
- [x] Bodies, parâmetros e respostas documentados
- [x] `dredd-hooks.js` configurado com criação dinâmica de IDs
- [x] Teste de contrato passa com 10/10 endpoints validados

### Lucas
- [x] Testes unitários Jest implementados (service mockado)
- [x] Testes de integração Supertest implementados (6 casos)
- [x] `npm test` passa todos os casos sem erro

### Klaus
- [x] `load-test.js` com 15 VUs por 30s
- [x] `stress-test.js` com stages crescendo até 100 VUs
- [x] Thresholds definidos em ambos os scripts

### Miguel
- [x] Fluxos Playwright implementados
- [x] `npx playwright test` passa sem erro