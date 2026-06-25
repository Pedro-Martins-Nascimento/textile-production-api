const { execSync } = require('child_process')
const path = require('path')

const RED    = '\x1b[31m'
const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE   = '\x1b[34m'
const RESET  = '\x1b[0m'

const results = []

function runSuite(label, cmd, cwd = '.') {
  console.log('')
  console.log(`${BLUE}${'─'.repeat(44)}${RESET}`)
  console.log(`${BLUE}▸ [${results.length + 1}/${TOTAL}] ${label.trim()}${RESET}`)
  console.log(`${BLUE}${'─'.repeat(44)}${RESET}`)
  try {
    execSync(cmd, {
      cwd: path.resolve(cwd),
      encoding: 'utf8',
      stdio: 'inherit'
    })
    results.push({ label, status: 'OK' })
    console.log(`\n${GREEN}✅ ${label.trim()} — passou${RESET}`)
  } catch {
    results.push({ label, status: 'FALHOU' })
    console.log(`\n${RED}❌ ${label.trim()} — falhou${RESET}`)
  }
}

function printSummary() {
  console.log('')
  console.log('============================================')
  console.log('  Resultado final')
  console.log('============================================')
  console.log('')

  let totalFailed = 0
  for (const r of results) {
    const status = r.status === 'OK'
      ? `${GREEN}✅ OK${RESET}`
      : `${RED}❌ FALHOU${RESET}`
    if (r.status !== 'OK') totalFailed++
    console.log(`  ${r.label.padEnd(26)} ${status}`)
  }

  console.log('')
  if (totalFailed === 0) {
    console.log(`  ${GREEN}✅ Todos os testes passaram!${RESET}`)
  } else {
    console.log(`  ${RED}❌ ${totalFailed} suite(s) com falha.${RESET}`)
  }
  console.log('============================================')
  console.log('')

  process.exit(totalFailed > 0 ? 1 : 0)
}

function checkK6() {
  try {
    execSync('k6 version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

const k6Available = checkK6()
const TOTAL = k6Available ? 6 : 5

console.log('')
console.log('============================================')
console.log('  🧪 Executando todos os testes')
console.log('============================================')

if (!k6Available) {
  console.log('')
  console.log(`${YELLOW}[AVISO]${RESET} K6 não encontrado. Pulando testes de carga e estresse.`)
  console.log(`        Instale em: https://k6.io/docs/get-started/installation/`)
}

runSuite('Jest unitário          ', 'npm test -- --testPathPattern=unit',        './api')
runSuite('Supertest integração   ', 'npm test -- --testPathPattern=integration',  './api')
runSuite('Dredd contrato         ', 'dredd swagger.yaml http://localhost:3000/api --hookfiles=../dredd-hooks.js', './api')

if (k6Available) {
  runSuite('K6 carga               ', 'k6 run load-test.js',   './k6')
  runSuite('K6 estresse            ', 'k6 run stress-test.js', './k6')
}

runSuite('Playwright             ', 'npx playwright test', './frontend')

printSummary()
