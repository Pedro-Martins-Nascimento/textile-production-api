const hooks = require('hooks');

let idCriado = null;

// Normaliza content-type
hooks.beforeEachValidation((transaction) => {
  const contentType = transaction.real.headers['content-type'];
  if (contentType && contentType.includes('application/json')) {
    transaction.real.headers['content-type'] = 'application/json';
  }
});

hooks.beforeAll((transactions, done) => {
  transactions.forEach(t => hooks.log('TRANSACAO: ' + t.name));
  done();
});

hooks.beforeEach((transaction, done) => {
  const name = transaction.name || '';

  // POST 400: manda body vazio para forçar erro de validação
  if (name.includes('Criar novo registro') && name.includes('400')) {
    transaction.request.body = '{}';
    return done();
  }

  // PUT 400: manda body vazio para forçar erro de validação
  if (name.includes('Atualizar registro') && name.includes('400')) {
    transaction.request.body = '{}';
    transaction.fullPath = `/producoes/1`;
    transaction.request.uri = `/producoes/1`;
    return done();
  }

  // Para transações com /{id} que precisam de um ID real (sucesso)
  if (transaction.request.uri === '/producoes/1' && !name.includes('404')) {
    const http = require('http');
    const body = JSON.stringify({
      data_producao: '2026-01-15',
      numero_tear: 'T-DREDD',
      codigo_produto: 'MAL-001',
      turno: 1,
      qualidade: 1,
      quilos: 8.5,
      pecas: 270
    });
    const req = http.request({
      host: 'localhost', port: 3000, path: '/producoes', method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        idCriado = JSON.parse(data).id;
        transaction.fullPath = `/producoes/${idCriado}`;
        transaction.request.uri = `/producoes/${idCriado}`;
        hooks.log(`Usando ID criado: ${idCriado}`);
        done();
      });
    });
    req.on('error', done);
    req.write(body);
    req.end();
  } else if (transaction.request.uri === '/producoes/1' && name.includes('404')) {
    transaction.fullPath = `/producoes/999999`;
    transaction.request.uri = `/producoes/999999`;
    done();
  } else {
    done();
  }
});