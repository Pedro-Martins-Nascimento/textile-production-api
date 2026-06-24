const { execSync } = require('child_process')
const fs = require('fs')

const RED    = '\x1b[31m'
const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE   = '\x1b[34m'
const RESET  = '\x1b[0m'

const log   = (msg) => console.log(`${BLUE}[INFO]${RESET}   ${msg}`)
const ok    = (msg) => console.log(`${GREEN}[OK]${RESET}     ${msg}`)
const warn  = (msg) => console.log(`${YELLOW}[AVISO]${RESET}  ${msg}`)
const error = (msg) => { console.log(`${RED}[ERRO]${RESET}   ${msg}`); process.exit(1) }

function run(cmd, silent = false) {
  try {
    return execSync(cmd, {
      stdio: silent ? 'pipe' : 'inherit',
      encoding: 'utf8'
    })
  } catch {
    return null
  }
}

async function main() {
  console.log('')
  console.log('============================================')
  console.log('  🛑 Encerrando Sistema de Produção de Teares')
  console.log('============================================')
  console.log('')

  // ─────────────────────────────────────
  // 1. Verifica Docker
  // ─────────────────────────────────────
  log('Verificando Docker...')
  if (!run('docker info', true)) {
    error('Docker não está rodando.')
  }
  ok('Docker está rodando.')

  // ─────────────────────────────────────
  // 2. Verifica Docker Compose
  // ─────────────────────────────────────
  let composeCmd = null
  if (run('docker compose version', true)) {
    composeCmd = 'docker compose'
  } else if (run('docker-compose --version', true)) {
    composeCmd = 'docker-compose'
  } else {
    error('Docker Compose não encontrado.')
  }

  // ─────────────────────────────────────
  // 3. Verifica docker-compose.yml
  // ─────────────────────────────────────
  if (!fs.existsSync('docker-compose.yml')) {
    error('docker-compose.yml não encontrado. Execute na raiz do projeto.')
  }

  // ─────────────────────────────────────
  // 4. Verifica se tem containers rodando
  // ─────────────────────────────────────
  log('Verificando containers...')
  const running = run(`${composeCmd} ps -q`, true)
  if (!running || running.trim().length === 0) {
    warn('Nenhum container rodando.')
    console.log('')
    console.log('============================================')
    ok('Nada para encerrar.')
    console.log('============================================')
    console.log('')
    return
  }

  // ─────────────────────────────────────
  // 5. Derruba containers
  // ─────────────────────────────────────
  log('Derrubando containers...')
  try {
    execSync(`${composeCmd} down`, { stdio: 'inherit', encoding: 'utf8' })
    ok('Containers encerrados.')
  } catch {
    error('Falha ao derrubar containers. Execute: docker compose down')
  }

  // ─────────────────────────────────────
  // 6. Confirma que não sobrou nada
  // ─────────────────────────────────────
  log('Verificando se sobrou algum container...')
  const remaining = run(`${composeCmd} ps -q`, true)
  if (remaining && remaining.trim().length > 0) {
    warn('Ainda há containers ativos. Execute manualmente: docker compose down')
  } else {
    ok('Todos os containers foram encerrados.')
  }

  console.log('')
  console.log('============================================')
  ok('Ambiente encerrado com sucesso!')
  console.log('')
  console.log(`  Para subir novamente:  ${YELLOW}npm run start${RESET}`)
  console.log('============================================')
  console.log('')
}

main()
