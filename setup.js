const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const RED    = '\x1b[31m'
const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE   = '\x1b[34m'
const RESET  = '\x1b[0m'

const ok   = (msg) => console.log(`${GREEN}  [OK]${RESET}     ${msg}`)
const info = (msg) => console.log(`${BLUE}  [INFO]${RESET}   ${msg}`)
const warn = (msg) => console.log(`${YELLOW}  [AVISO]${RESET}  ${msg}`)
const erro = (msg) => console.log(`${RED}  [ERRO]${RESET}   ${msg}`)

function run(cmd, silent = true, cwd = '.') {
  try {
    return execSync(cmd, { stdio: silent ? 'pipe' : 'inherit', encoding: 'utf8', cwd: path.resolve(cwd) })
  } catch {
    return null
  }
}

function check(cmd) {
  return run(cmd) !== null
}

function step(titulo) {
  console.log(`\n${BLUE}▸ ${titulo}${RESET}`)
}

console.log('')
console.log('============================================')
console.log('  🔧 Setup — Textile Production API')
console.log('  Verificando e instalando dependências...')
console.log('============================================')

// ── 1. Node.js ─────────────────────────────────────────────────────────────
step('Node.js')
const nodeVersion = run('node --version')
if (!nodeVersion) {
  erro('Node.js não encontrado. Instale em: https://nodejs.org')
  process.exit(1)
}
const major = parseInt(nodeVersion.trim().replace('v', '').split('.')[0])
if (major < 18) {
  warn(`Node.js ${nodeVersion.trim()} detectado. Recomendado: v18 ou superior.`)
} else {
  ok(`Node.js ${nodeVersion.trim()}`)
}

// ── 2. npm install na api/ ─────────────────────────────────────────────────
step('Dependências da API (Jest, Supertest, nodemon...)')
if (!fs.existsSync(path.resolve('api/node_modules'))) {
  info('Instalando... (pode demorar alguns segundos)')
  run('npm install', false, './api')
  if (!fs.existsSync(path.resolve('api/node_modules'))) {
    erro('Falha ao instalar dependências da API.')
    process.exit(1)
  }
} else {
  ok('node_modules já instalado em api/')
}
// verifica Jest
if (check('npx --prefix api jest --version')) {
  const v = run('npx --prefix api jest --version')
  ok(`Jest ${v ? v.trim() : ''}`)
} else {
  erro('Jest não encontrado após instalação. Verifique api/package.json.')
}

// ── 3. npm install no frontend/ ────────────────────────────────────────────
step('Dependências do Frontend (Playwright...)')
if (!fs.existsSync(path.resolve('frontend/node_modules'))) {
  info('Instalando dependências do frontend...')
  run('npm install', false, './frontend')
  if (!fs.existsSync(path.resolve('frontend/node_modules'))) {
    erro('Falha ao instalar dependências do frontend.')
    process.exit(1)
  }
} else {
  ok('node_modules já instalado em frontend/')
}

// ── 4. Browsers do Playwright ──────────────────────────────────────────────
step('Browsers do Playwright (Chromium, Firefox, WebKit)')
info('Instalando browsers... (pode demorar alguns minutos na primeira vez)')
try {
  execSync('npx playwright install', { stdio: 'inherit', encoding: 'utf8', cwd: path.resolve('./frontend') })
  ok('Browsers do Playwright instalados.')
} catch {
  warn('Não foi possível instalar os browsers automaticamente.')
  warn('Instale manualmente: cd frontend && npx playwright install')
}

// ── 6. Swagger ─────────────────────────────────────────────────────────────
step('Swagger UI')
if (fs.existsSync(path.resolve('api/node_modules/swagger-ui-express'))) {
  ok('swagger-ui-express instalado. Docs disponíveis em: http://localhost:3000/docs')
} else {
  erro('swagger-ui-express não encontrado. Verifique se o npm install da API foi bem sucedido.')
}

// ── 7. Dredd ───────────────────────────────────────────────────────────────
step('Dredd (testes de contrato)')
if (check('dredd --version')) {
  const v = run('dredd --version')
  ok(`Dredd ${v ? v.trim().split('\n')[0] : ''}`)
} else {
  info('Dredd não encontrado. Instalando globalmente...')
  const result = run('npm install -g dredd', false)
  if (check('dredd --version')) {
    ok('Dredd instalado com sucesso.')
  } else {
    warn('Não foi possível instalar o Dredd automaticamente.')
    warn('Instale manualmente: npm install -g dredd')
  }
}

// ── 8. Docker ──────────────────────────────────────────────────────────────
step('Docker')
if (!check('docker --version')) {
  erro('Docker não encontrado. Instale em: https://docs.docker.com/get-docker/')
  warn('O Docker é obrigatório para subir a API e o banco de dados.')
} else {
  const v = run('docker --version')
  ok(`${v ? v.trim() : 'Docker instalado'}`)

  if (!check('docker info')) {
    warn('Docker está instalado mas não está rodando. Inicie o Docker Desktop.')
  } else {
    ok('Docker está rodando.')
  }
}

// ── 9. K6 (opcional) ───────────────────────────────────────────────────────
step('K6 (testes de carga — opcional)')
if (check('k6 version')) {
  const v = run('k6 version')
  ok(`${v ? v.trim().split('\n')[0] : 'K6 instalado'}`)
} else {
  warn('K6 não encontrado. Os testes de carga serão pulados.')
  warn('Para instalar: https://k6.io/docs/get-started/installation/')
}

// ── Resumo ─────────────────────────────────────────────────────────────────
console.log('')
console.log('============================================')
console.log('  ✅ Setup concluído!')
console.log('')
console.log(`  Para subir o ambiente:   ${YELLOW}npm start${RESET}`)
console.log(`  Para rodar os testes:    ${YELLOW}npm test${RESET}`)
console.log('============================================')
console.log('')
