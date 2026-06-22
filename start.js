const { execSync, spawnSync } = require('child_process')
const http = require('http')
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

function waitForUrl(url, label, retries = 20, delay = 3000) {
  return new Promise((resolve) => {
    let attempts = 0
    const check = () => {
      attempts++
      http.get(url, (res) => {
        if (res.statusCode < 500) {
          resolve(true)
        } else {
          retry()
        }
      }).on('error', retry)
    }
    const retry = () => {
      if (attempts >= retries) { resolve(false); return }
      log(`Aguardando ${label}... tentativa ${attempts}/${retries}`)
      setTimeout(check, delay)
    }
    check()
  })
}

async function main() {
  console.log('')
  console.log('============================================')
  console.log('  🏭 Sistema de Produção de Teares')
  console.log('============================================')
  console.log('')

  // ─────────────────────────────────────
  // 1. Docker instalado?
  // ─────────────────────────────────────
  log('Verificando Docker...')
  const dockerVersion = run('docker --version', true)
  if (!dockerVersion) {
    error('Docker não encontrado. Instale em: https://docs.docker.com/get-docker/')
  }
  ok(`Docker: ${dockerVersion.trim()}`)

  // ─────────────────────────────────────
  // 2. Docker rodando?
  // ─────────────────────────────────────
  log('Verificando se o Docker está rodando...')
  if (!run('docker info', true)) {
    error('Docker não está rodando. Inicie o Docker Desktop e tente novamente.')
  }
  ok('Docker está rodando.')

  // ─────────────────────────────────────
  // 3. Docker Compose disponível?
  // ─────────────────────────────────────
  log('Verificando Docker Compose...')
  let composeCmd = null
  if (run('docker compose version', true)) {
    composeCmd = 'docker compose'
  } else if (run('docker-compose --version', true)) {
    composeCmd = 'docker-compose'
  } else {
    error('Docker Compose não encontrado. Instale em: https://docs.docker.com/compose/install/')
  }
  ok(`Docker Compose disponível.`)

  // ─────────────────────────────────────
  // 4. docker-compose.yml existe?
  // ─────────────────────────────────────
  log('Verificando docker-compose.yml...')
  if (!fs.existsSync('docker-compose.yml')) {
    error('docker-compose.yml não encontrado. Execute este script na raiz do projeto.')
  }
  ok('docker-compose.yml encontrado.')

  // ─────────────────────────────────────
  // 5. Derruba containers antigos se existirem
  // ─────────────────────────────────────
  log('Verificando containers existentes...')
  const running = run(`${composeCmd} ps -q`, true)
  if (running && running.trim().length > 0) {
    warn('Containers encontrados. Derrubando para garantir ambiente limpo...')
    run(`${composeCmd} down`)
    ok('Containers removidos.')
  }

  // ─────────────────────────────────────
  // 6. Baixa imagens necessárias
  // ─────────────────────────────────────
  log('Baixando imagens do Docker Hub (se necessário)...')
  run(`${composeCmd} pull postgres frontend`)
  ok('Imagens verificadas.')

  // ─────────────────────────────────────
  // 7. Build e sobe todos os containers
  // ─────────────────────────────────────
  log('Fazendo build e subindo containers...')
  try {
    execSync(`${composeCmd} up --build -d`, { stdio: 'inherit', encoding: 'utf8' })
    ok('Containers iniciados.')
  } catch {
    error('Falha ao subir os containers. Execute: docker compose logs')
  }

  // ─────────────────────────────────────
  // 8. Aguarda PostgreSQL ficar saudável
  // ─────────────────────────────────────
  log('Aguardando PostgreSQL ficar pronto...')
  let pgOk = false
  for (let i = 1; i <= 15; i++) {
    const result = run('docker exec producao-postgres pg_isready -U postgres', true)
    if (result && result.includes('accepting connections')) {
      pgOk = true
      break
    }
    log(`Aguardando PostgreSQL... tentativa ${i}/15`)
    await new Promise(r => setTimeout(r, 2000))
  }
  if (pgOk) {
    ok('PostgreSQL está pronto.')
  } else {
    warn('PostgreSQL demorou para responder. Verifique: docker compose logs postgres')
  }

  // ─────────────────────────────────────
  // 9. Aguarda API responder
  // ─────────────────────────────────────
  log('Aguardando API iniciar...')
  const apiOk = await waitForUrl('http://localhost:3000/api/producoes', 'API')
  if (apiOk) {
    ok('API está respondendo.')
  } else {
    warn('API demorou para responder. Verifique: docker compose logs api')
  }

  // ─────────────────────────────────────
  // 10. Aguarda frontend responder
  // ─────────────────────────────────────
  log('Aguardando frontend iniciar...')
  const frontOk = await waitForUrl('http://localhost:8080', 'Frontend')
  if (frontOk) {
    ok('Frontend está respondendo.')
  } else {
    warn('Frontend demorou para responder. Verifique: docker compose logs frontend')
  }

  // ─────────────────────────────────────
  // 11. Status final dos containers
  // ─────────────────────────────────────
  console.log('')
  log('Status dos containers:')
  run(`${composeCmd} ps`)

  // ─────────────────────────────────────
  // 12. Resultado
  // ─────────────────────────────────────
  console.log('')
  console.log('============================================')
  if (apiOk && frontOk && pgOk) {
    ok('Ambiente no ar e saudável!')
  } else {
    warn('Ambiente subiu com avisos. Verifique os logs acima.')
  }
  console.log('')
  console.log(`  🖥️  Front-end:  ${GREEN}http://localhost:8080${RESET}`)
  console.log(`  🔌  API:        ${GREEN}http://localhost:3000${RESET}`)
  console.log(`  📄  Swagger:    ${GREEN}http://localhost:3000/docs${RESET}`)
  console.log(`  🗃️   PostgreSQL: ${GREEN}localhost:5432${RESET}`)
  console.log('')
  console.log(`  Ver logs:        ${YELLOW}docker compose logs -f${RESET}`)
  console.log(`  Rodar testes:    ${YELLOW}npm run test${RESET}`)
  console.log(`  Derrubar tudo:   ${YELLOW}docker compose down${RESET}`)
  console.log('============================================')
  console.log('')
}

main()