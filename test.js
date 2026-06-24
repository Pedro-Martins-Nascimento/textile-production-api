const { execSync } = require('child_process')
const path = require('path')

const RED    = '\x1b[31m'
const GREEN  = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE   = '\x1b[34m'
const RESET  = '\x1b[0m'

const results = []

function runSuite(label, cmd, cwd = '.') {
  process.stdout.write(`${BLUE}[${results.length + 1}/${TOTAL}]${RESET} ${label}`)
  try {
    const output = execSync(cmd, {
      cwd: path.resolve(cwd),
      encoding: 'utf8',
      stdio: 'pipe'
    })
    const passed = parsePassedCount(label, output)
    results.push({ label, status: 'OK', passed, failed: 0, output })
    console.log(` ${GREEN}✅ ${passed}${RESET}`)
  } catch (err) {
    const output = (err.stdout || '') + (err.stderr || '')
    const { passed, failed, reason } = parseFailedCount(label, output)
    results.push({ label, status: 'FALHOU', passed, failed, reason, output })
    console.log(` ${RED}❌ ${passed} passaram, ${failed} falharam${RESET}`)
    if (reason) console.log(`   ${RED}→ FALHOU: ${reason}${RESET}`)
  }
}

function parsePassedCount(label, output) {
  // Jest
  if (label.includes('Jest') || label.includes('Supertest')) {
    const m = output.match(/(\d+) passed/)
    return m ? `${m[1]} passaram` : 'OK'
  }
  // Playwright
  if (label.includes('Playwright')) {
    const m = output.match(/(\d+) passed/)
    return m ? `${m[1]} passaram` : 'OK'
  }
  // K6
  if (label.includes('K6')) {
    const dur  = output.match(/http_req_duration.*p\(95\)=([^\s]+)/)
    const fail = output.match(/http_req_failed.*([0-9.]+)%/)
    const reqs = output.match(/http_reqs.*?(\d+)\s+\d+/)
    const p95  = dur  ? `p95: ${dur[1]}`    : ''
    const err  = fail ? `erros: ${fail[1]}%` : ''
    const rps  = reqs ? `reqs: ${reqs[1]}/s` : ''
    return [p95, err, rps].filter(Boolean).join(' | ') || 'OK'
  }
  // Dredd
  if (label.includes('dredd') || label.includes('contrato')) {
    const m = output.match(/(\d+) passing/)
    return m ? `${m[1]} endpoints validados` : 'OK'
  }
  return 'OK'
}

function parseFailedCount(label, output) {
  if (label.includes('Jest') || label.includes('Supertest') || label.includes('Playwright')) {
    const passed = (output.match(/(\d+) passed/)  || [])[1] || '0'
    const failed = (output.match(/(\d+) failed/)  || [])[1] || '?'
    const reason = (output.match(/● (.+)/)        || [])[1] || ''
    return { passed, failed, reason }
  }
  return { passed: '0', failed: '?', reason: output.split('\n').find(l => l.includes('FAIL') || l.includes('error')) || '' }
}

function printSummary() {
  console.log('')
  console.log('============================================')
  console.log('  Resultado final')
  console.log('============================================')
  console.log('')
  console.log(`  ${'Suite'.padEnd(26)} ${'Status'.padEnd(10)} ${'Passou'.padEnd(8)} Falhou`)
  console.log('  ' + '─'.repeat(56))

  let totalFailed = 0
  for (const r of results) {
    const status = r.status === 'OK'
      ? `${GREEN}✅ OK${RESET}`
      : `${RED}❌ FALHOU${RESET}`
    const passed = r.status === 'OK' ? (r.passed || '-') : String(r.passed)
    const failed = r.status === 'OK' ? '0' : String(r.failed)
    if (r.status !== 'OK') totalFailed++
    console.log(`  ${r.label.padEnd(26)} ${status.padEnd(18)} ${passed.padEnd(8)} ${failed}`)
  }

  console.log('  ' + '─'.repeat(56))
  console.log('')

  if (totalFailed === 0) {
    console.log(`  ${GREEN}✅ Todos os testes passaram!${RESET}`)
  } else {
    console.log(`  ${RED}❌ ${totalFailed} suite(s) com falha. Verifique os erros acima.${RESET}`)
  }
  console.log('============================================')
  console.log('')

  process.exit(totalFailed > 0 ? 1 : 0)
}

// ─────────────────────────────────────────
//  Verifica K6 instalado
// ─────────────────────────────────────────
function checkK6() {
  try {
    execSync('k6 version', { stdio: 'pipe' })
    return true
  } catch {
    return false
  }
}

// ─────────────────────────────────────────
//  Execução
// ─────────────────────────────────────────
const k6Available = checkK6()
const TOTAL = k6Available ? 6 : 5

console.log('')
console.log('============================================')
console.log('  🧪 Executando todos os testes')
console.log('============================================')
console.log('')

if (!k6Available) {
  console.log(`${YELLOW}[AVISO]${RESET} K6 não encontrado. Pulando testes de carga e estresse.`)
  console.log(`        Instale em: https://k6.io/docs/get-started/installation/`)
  console.log('')
}

// 1. Jest unitário
runSuite(
  'Jest unitário          ',
  'npm test -- --testPathPattern=unit',
  './api'
)

// 2. Supertest integração
runSuite(
  'Supertest integração   ',
  'npm test -- --testPathPattern=integration',
  './api'
)

// 3. Dredd contrato
runSuite(
  'Dredd contrato         ',
  'dredd swagger.yaml http://localhost:3000/api',
  './api'
)

// 4 e 5. K6 (se disponível)
if (k6Available) {
  runSuite(
    'K6 carga               ',
    'k6 run load-test.js',
    './k6'
  )
  runSuite(
    'K6 estresse            ',
    'k6 run stress-test.js',
    './k6'
  )
}

// 6. Playwright
runSuite(
  'Playwright             ',
  'npx playwright test',
  './frontend'
)

printSummary()
