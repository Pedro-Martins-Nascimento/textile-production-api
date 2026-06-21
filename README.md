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
| **Klaus** | Testes de carga e estresse — Grafana K6 |
| **Lucas** | Testes unitários (Jest) + testes de integração (Supertest) |
| **Mirella** | Documentação — `swagger.yaml` + Swagger UI + teste de contrato (dredd) |
| **Pedro** | Infraestrutura — `docker-compose.yml`, `Dockerfile`, script SQL, `start.js`, `test.js` |

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
Etapa 4 — Klaus + Lucas + Miguel + Mirella (em paralelo)
  ├── Klaus: scripts de carga e estresse K6 
  ├── Lucas: testes unitários Jest + testes de integração Supertest
  ├── Miguel: testes Playwright do front-end
  └── Mirella: teste de contrato com dredd
        ↓
Etapa 5 — Pedro
  └── Integra tudo: valida docker compose up, implementa start.js e test.js,
      garante que npm run start e npm run test funcionam do zero
```

---

## 🗂️ Estrutura do Projeto

```
projeto-producao/
├── api/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── producao.controller.js
│   │   ├── services/
│   │   │   └── producao.service.js
│   │   ├── repositories/
│   │   │   └── producao.repository.js
│   │   ├── routes/
│   │   │   └── producao.routes.js
│   │   ├── middleware/
│   │   │   └── validation.js
│   │   └── app.js
│   ├── tests/
│   │   ├── unit/
│   │   │   └── producao.service.test.js
│   │   └── integration/
│   │       └── producao.integration.test.js
│   ├── swagger.yaml
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
├── docker-compose.yml
├── package.json        ← scripts npm
├── start.js            ← script de inicialização
├── stop.js             ← script que derruba tudo
└── test.js             ← script que roda todos os testes
```

---

## 🗃️ Modelo de Dados

**Tabela:** `producoes`

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL PRIMARY KEY | Identificador único |
| `data_producao` | DATE | Data do registro |
| `numero_tear` | VARCHAR | Identificador do tear (ex: "T-042") |
| `codigo_produto` | VARCHAR | Código do produto (ex: "MAL-001") |
| `turno` | INTEGER | Turno de trabalho: 1, 2 ou 3 |
| `qualidade` | VARCHAR | Classificação: "A", "B" ou "C" |
| `quilos` | DECIMAL | Volume produzido em kg |
| `pecas` | INTEGER | Quantidade de peças produzidas |
| `created_at` | TIMESTAMP | Data de inserção do registro |

**SQL de criação:**

```sql
CREATE TABLE producoes (
  id SERIAL PRIMARY KEY,
  data_producao DATE NOT NULL,
  numero_tear VARCHAR(20) NOT NULL,
  codigo_produto VARCHAR(30) NOT NULL,
  turno INTEGER NOT NULL CHECK (turno IN (1, 2, 3)),
  qualidade VARCHAR(1) NOT NULL CHECK (qualidade IN ('A', 'B', 'C')),
  quilos DECIMAL(10, 2) NOT NULL,
  pecas INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🚀 Como Rodar

### Pré-requisitos

- Node.js instalado (qualquer versão recente)
- Docker instalado e **rodando**

### Subir tudo

Na raiz do projeto, execute:

```bash
npm run start
```

O script `start.js` faz automaticamente:
1. Verifica se o Docker está instalado
2. Verifica se o Docker está rodando
3. Verifica se o Docker Compose está disponível
4. Verifica se as imagens já existem — se sim sobe sem rebuild, se não faz build
5. Se os containers já estiverem rodando, derruba e sobe novamente
6. Aguarda a API responder antes de liberar

Ao final, os serviços estarão disponíveis em:
- Front-end: `http://localhost:8080`
- API: `http://localhost:3000`
- Swagger UI: `http://localhost:3000/docs`
- PostgreSQL: `localhost:5432`

### Rodar todos os testes

```bash
npm run test
```

O script `test.js` executa todos os testes em sequência e exibe um resumo comparativo no terminal ao final:

```
============================================
  🧪 Executando todos os testes
============================================

[1/6] Testes unitários (Jest)................. ✅ 9/9 passaram
[2/6] Testes de integração (Supertest)........ ✅ 6/6 passaram
[3/6] Teste de contrato (dredd)............... ✅ 5/5 endpoints validados
[4/6] Teste de carga K6....................... ✅ p95: 120ms | erros: 0.0% | reqs: 48/s
[5/6] Teste de estresse K6................... ✅ p95: 340ms | erros: 0.2% | reqs: 210/s
[6/6] Testes de front-end (Playwright)........ ✅ 5/5 passaram

============================================
  Resultado final
============================================

  Suite                  Status    Passou  Falhou
  ─────────────────────────────────────────────
  Jest unitário          ✅ OK      9       0
  Supertest integração   ✅ OK      6       0
  Dredd contrato         ✅ OK      5       0
  K6 carga               ✅ OK      -       -
  K6 estresse            ✅ OK      -       -
  Playwright             ✅ OK      5       0
  ─────────────────────────────────────────────
  Total                             30      0

  ✅ Todos os testes passaram!
============================================
```

Se algum teste falhar, aparece em vermelho com o motivo:

```
[1/5] Testes unitários (Jest)................. ❌ 8/9 passaram
  → FALHOU: findById deve retornar 404 quando ID não existe
```

> ⚠️ Requer que o ambiente esteja no ar (`npm run start`) antes de rodar.

### Derrubar

```bash
npm run stop
```

O script `stop.js` verifica se há containers rodando e derruba tudo limpo. Se não houver nada rodando, avisa sem dar erro.

### Ver logs

```bash
docker compose logs -f
```
(`api/.env`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=producao
PORT=3001
```

---

## 🔌 Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/producoes?page=1&limit=10&turno=1` | Listagem paginada |
| GET | `/api/producoes/:id` | Busca por ID |
| POST | `/api/producoes` | Cria registro |
| PUT | `/api/producoes/:id` | Atualiza registro |
| DELETE | `/api/producoes/:id` | Remove registro |

### GET /producoes
**Resposta 200:**
```json
{
  "data": [
    {
      "id": 1,
      "data_producao": "2026-04-20",
      "numero_tear": "T-042",
      "codigo_produto": "MAL-001",
      "turno": 1,
      "qualidade": "A",
      "quilos": 8.5,
      "pecas": 270,
      "created_at": "2026-04-20T10:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 10,
  "total": 6226
}
```

### GET /producoes/:id
**Resposta 200:** registro encontrado.
**Resposta 404:**
```json
{ "error": "Registro não encontrado" }
```

### POST /producoes
**Body:**
```json
{
  "data_producao": "2026-04-20",
  "numero_tear": "T-042",
  "codigo_produto": "MAL-001",
  "turno": 1,
  "qualidade": "A",
  "quilos": 8.5,
  "pecas": 270
}
```
**Resposta 201:** registro criado.
**Resposta 400:**
```json
{ "error": "Campo 'quilos' é obrigatório" }
```

### PUT /producoes/:id
**Body:** mesmos campos do POST.
**Resposta 200:** registro atualizado.
**Resposta 404:** registro não encontrado.

### DELETE /producoes/:id
**Resposta 200:**
```json
{ "message": "Registro removido com sucesso" }
```
**Resposta 404:** registro não encontrado.

---

## 📄 Documentação OpenAPI e Teste de Contrato — Mirella

**Arquivo:** `api/swagger.yaml`
**Interface:** `http://localhost:3000/docs`

O arquivo documenta todos os endpoints, parâmetros, bodies e respostas seguindo o padrão OpenAPI 3.0. Deve ser escrito após a API estar implementada pelo Felipe.

---

### Teste de Contrato — dredd

Valida automaticamente que as respostas reais da API batem exatamente com o que está documentado no `swagger.yaml`. Se o Felipe mudar um campo e esquecer de atualizar a doc, o teste pega.

**Instalação:**
```bash
npm install -g dredd
```

**Como rodar:**
```bash
dredd api/swagger.yaml http://localhost:3000
```

**O que valida:**
- Todos os 5 endpoints respondem com o status code documentado
- A estrutura do JSON retornado bate com o schema do swagger
- Campos obrigatórios estão presentes nas respostas

> ⚠️ Depende da API no ar e do swagger.yaml completo.

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
- `index.html` — estrutura da página, tabela e formulário modal
- `style.css` — estilização geral
- `app.js` — chamadas `fetch` à API, renderização da tabela, lógica do formulário

> ⚠️ Depende da API do Felipe estar no ar para funcionar.

---

## 🧪 Testes Unitários e de Integração — Klaus

### Testes Unitários — `api/tests/unit/producao.service.test.js`

Testa a camada service com repositório **mockado** via `jest.fn()`, isolando a lógica de negócio do banco.

**Como rodar:**
```bash
cd api
npm test
```

**Casos a implementar:**

| Caso | Descrição |
|------|-----------|
| `listAll` — sucesso | Retorna objeto com `data`, `page`, `limit` e `total` |
| `findById` — sucesso | Retorna o registro correto |
| `findById` — não encontrado | Lança erro 404 |
| `create` — sucesso | Retorna registro criado com id |
| `create` — campo faltando | Lança erro 400 |
| `update` — sucesso | Retorna registro atualizado |
| `update` — não encontrado | Lança erro 404 |
| `delete` — sucesso | Retorna mensagem de sucesso |
| `delete` — não encontrado | Lança erro 404 |

---

### Testes de Integração — `api/tests/integration/producao.integration.test.js`

Testa os endpoints reais contra o banco PostgreSQL rodando. Valida o fluxo completo: requisição → controller → service → repository → banco → resposta. Usa **Supertest**.

**Casos a implementar:**

| Caso | Descrição |
|------|-----------|
| `GET /producoes` | Retorna lista paginada com status 200 |
| `GET /producoes/:id` | Retorna registro existente com status 200 |
| `GET /producoes/:id` inexistente | Retorna status 404 |
| `POST /producoes` | Cria registro e retorna status 201 |
| `PUT /producoes/:id` | Atualiza registro e retorna status 200 |
| `DELETE /producoes/:id` | Remove registro e retorna status 200 |

> ⚠️ Depende da API do Felipe implementada e do banco no ar.

---

## 📊 Testes de Carga e Estresse — Lucas

**Instalação do K6:** https://k6.io/docs/get-started/installation/

**Fluxo testado por VU (ambos os scripts):**
1. `GET /producoes?page=1&limit=10`
2. `GET /producoes/1`
3. `POST /producoes` com dados fictícios de produção
4. `PUT /producoes/{id}` no registro criado
5. `DELETE /producoes/{id}` no registro criado

**Métricas a apresentar:**
- `http_req_duration` — tempo de resposta (p95)
- `http_req_failed` — taxa de erros
- `http_reqs` — requisições por segundo

---

### Teste de Carga — `k6/load-test.js`
Simula o uso normal do sistema por operadores de produção.

**Como rodar:**
```bash
k6 run k6/load-test.js
```

**Configuração:**
- 15 VUs constantes por 30 segundos

**Thresholds:**
- p95 abaixo de 500ms
- taxa de erro abaixo de 1%

**Responde:** "A API aguenta o uso diário normal?"

---

### Teste de Estresse — `k6/stress-test.js`
Aumenta os usuários progressivamente até encontrar o limite da aplicação.

**Como rodar:**
```bash
k6 run k6/stress-test.js
```

**Configuração:**
```js
stages: [
  { duration: '10s', target: 10  }, // aquece
  { duration: '20s', target: 50  }, // carga normal
  { duration: '20s', target: 100 }, // estresse
  { duration: '10s', target: 0   }, // resfria
]
```

**Thresholds:**
- p95 abaixo de 1000ms
- taxa de erro abaixo de 5%

**Responde:** "Qual o limite máximo antes da API degradar?"

> ⚠️ Depende da API do Felipe estar no ar.

---

## 🎭 Testes de Front-end — Miguel

**Arquivo:** `frontend/tests/producao.spec.js`

**Como rodar:**
```bash
cd frontend
npx playwright install
npx playwright test
```

**Fluxos a implementar:**

| Teste | Descrição |
|-------|-----------|
| Listagem | Abre o sistema e verifica que a tabela renderiza os registros de produção |
| Consulta | Clica em um registro e verifica que os detalhes daquela produção abrem corretamente |
| Criação | Operador preenche o formulário com tear, turno, quilos e peças — registro aparece na tabela |
| Edição | Supervisor clica em editar, corrige o valor de quilos, salva e verifica o valor atualizado |
| Exclusão | Supervisor remove um registro duplicado, confirma o modal e verifica que desaparece |

> ⚠️ Depende do front-end da Júlia estar pronto e da API no ar.

---

## 🐳 Infraestrutura — Pedro

**Arquivos:** `docker-compose.yml`, `api/Dockerfile`, `api/init.sql`

**Containers:**

| Container | Tecnologia | Porta |
|-----------|-----------|-------|
| `api` | Node.js + Express | 3000 |
| `postgres` | PostgreSQL | 5432 |
| `frontend` | nginx | 8080 |

**Responsabilidades:**
- `docker-compose.yml` orquestrando os 3 containers
- `Dockerfile` da API com build do Node.js
- `init.sql` com o script de criação da tabela `producoes`
- Configuração do nginx para servir o front-end estático
- Garantir que `docker compose up --build` sobe tudo sem erro ao final

---

## ✅ Checklist de Entrega

### Pedro
- [ ] `docker-compose.yml` com os 3 containers
- [ ] `Dockerfile` da API
- [ ] `init.sql` com criação da tabela
- [ ] `package.json` na raiz com scripts `start`, `stop` e `test`
- [ ] `start.js` com verificações de Docker e subida dos containers
- [ ] `stop.js` que derruba todos os containers limpo
- [ ] `test.js` que roda todos os testes em sequência com resumo comparativo no terminal
- [ ] `npm run start` sobe tudo sem erro
- [ ] `npm run stop` derruba tudo sem erro
- [ ] `npm run test` executa todos os testes e exibe resultado final

### Felipe
- [ ] GET /producoes com paginação funcionando
- [ ] GET /producoes/:id com 404
- [ ] POST /producoes com validação
- [ ] PUT /producoes/:id com 404
- [ ] DELETE /producoes/:id com 404

### Júlia
- [ ] Tabela renderizando registros da API
- [ ] Formulário de criação funcionando
- [ ] Formulário de edição funcionando
- [ ] Exclusão com confirmação funcionando
- [ ] Filtro por turno funcionando

### Mirella
- [ ] Todos os 5 endpoints documentados no `swagger.yaml`
- [ ] Swagger UI acessível em `/docs`
- [ ] Bodies, parâmetros e respostas documentados
- [ ] dredd instalado e configurado
- [ ] `dredd api/swagger.yaml http://localhost:3000` passa sem erro

### Klaus
- [ ] 9 casos de teste unitário Jest implementados
- [ ] Repositório mockado com `jest.fn()`
- [ ] 6 casos de teste de integração Supertest implementados
- [ ] `npm test` passa todos os casos sem erro

### Lucas
- [ ] `load-test.js` percorre os 5 endpoints com 15 VUs por 30s
- [ ] `stress-test.js` com stages crescendo até 100 VUs
- [ ] Thresholds definidos em ambos os scripts
- [ ] `k6 run` exibe métricas corretamente nos dois scripts

### Miguel
- [ ] 5 fluxos Playwright implementados
- [ ] `npx playwright test` passa sem erro
