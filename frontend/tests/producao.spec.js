const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────────
//   npm start   →  sobe postgres + api + nginx (frontend na :8080)
//   npm test    →  executa esta suite via npx playwright test
// ─────────────────────────────────────────────────────────────────

test.describe('Sistema de Registro de Produção de Teares Circulares', () => {


  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  
    await page.waitForSelector('table');
  });

 
  test('deve exibir o título correto na aba do navegador', async ({ page }) => {
    await expect(page).toHaveTitle(/Registro de Produção/i);
  });


  test('deve exibir o cabeçalho principal da página', async ({ page }) => {
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Registro de Produção');
  });

 
  test('deve exibir o formulário com todos os campos', async ({ page }) => {
    await expect(page.locator('#data_producao')).toBeVisible();
    await expect(page.locator('#numero_tear')).toBeVisible();
    await expect(page.locator('#codigo_produto')).toBeVisible();
    await expect(page.locator('#turno')).toBeVisible();
    await expect(page.locator('#qualidade')).toBeVisible();
    await expect(page.locator('#quilos')).toBeVisible();
    await expect(page.locator('#pecas')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('deve exibir os cabeçalhos corretos na tabela', async ({ page }) => {
    const headers = page.locator('table thead th');
    await expect(headers.nth(0)).toContainText('ID');
    await expect(headers.nth(1)).toContainText('Data');
    await expect(headers.nth(2)).toContainText('Tear');
    await expect(headers.nth(3)).toContainText('Produto');
    await expect(headers.nth(4)).toContainText('Turno');
    await expect(headers.nth(5)).toContainText('Qualidade');
    await expect(headers.nth(6)).toContainText('Kg');
    await expect(headers.nth(7)).toContainText('Peças');
    await expect(headers.nth(8)).toContainText('Ações');
  });

 
  test('deve carregar e exibir registros da API na tabela', async ({ page }) => {

    await page.waitForSelector('#tbody tr');
    const rows = page.locator('#tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });


  test('deve ter as opções 1, 2 e 3 no select de turno', async ({ page }) => {
    const opcoes = await page.locator('#turno option').allTextContents();
    expect(opcoes).toContain('1');
    expect(opcoes).toContain('2');
    expect(opcoes).toContain('3');
  });


  test('deve ter as opções 1, 2 e 3 no select de qualidade', async ({ page }) => {
    const opcoes = await page.locator('#qualidade option').allTextContents();
    expect(opcoes).toContain('1');
    expect(opcoes).toContain('2');
    expect(opcoes).toContain('3');
  });

  test('deve exibir mensagem de sucesso ao cadastrar um registro', async ({ page }) => {
    await page.fill('#data_producao', '2026-04-25');
    await page.fill('#numero_tear', 'T-PW-01');
    await page.fill('#codigo_produto', 'MAL-PW-01');
    await page.selectOption('#turno', '1');
    await page.selectOption('#qualidade', '1');
    await page.fill('#quilos', '8.5');
    await page.fill('#pecas', '275');

    await page.click('button[type="submit"]');

    const mensagem = page.locator('#mensagem');
    await expect(mensagem).toBeVisible();
    await expect(mensagem).toContainText('salvo com sucesso');
    await expect(mensagem).toHaveClass(/sucesso/);
  });

 
  test('deve exibir o novo registro na tabela após cadastro', async ({ page }) => {
    const tearId = 'T-PW-02';

    await page.fill('#data_producao', '2026-04-26');
    await page.fill('#numero_tear', tearId);
    await page.fill('#codigo_produto', 'MAL-PW-02');
    await page.selectOption('#turno', '2');
    await page.selectOption('#qualidade', '2');
    await page.fill('#quilos', '6.0');
    await page.fill('#pecas', '180');

    await page.click('button[type="submit"]');

   
    await expect(page.locator('#mensagem')).toBeVisible();


    await expect(page.locator('#tbody')).toContainText(tearId, { timeout: 10000 });
  });

 
  test('deve limpar os campos do formulário após o cadastro', async ({ page }) => {
    await page.fill('#data_producao', '2026-04-27');
    await page.fill('#numero_tear', 'T-CLEAR');
    await page.fill('#codigo_produto', 'MAL-CLEAR');
    await page.fill('#quilos', '5.0');
    await page.fill('#pecas', '120');

    await page.click('button[type="submit"]');

    await expect(page.locator('#mensagem')).toBeVisible();

    await expect(page.locator('#numero_tear')).toHaveValue('');
    await expect(page.locator('#codigo_produto')).toHaveValue('');
    await expect(page.locator('#quilos')).toHaveValue('');
    await expect(page.locator('#pecas')).toHaveValue('');
  });

 
  test('deve preencher o formulário com os dados do registro ao clicar em editar', async ({ page }) => {
    await page.waitForSelector('#tbody tr');

    const primeiraLinha = page.locator('#tbody tr').first();
    const idTexto = await primeiraLinha.locator('td').first().textContent();

    await primeiraLinha.locator('.editar').click();


    const idField = await page.locator('#id').inputValue();
    expect(idField.trim()).toBe(idTexto.trim());

    
    await expect(page.locator('#numero_tear')).not.toHaveValue('');
    await expect(page.locator('#codigo_produto')).not.toHaveValue('');
  });

  
  test('deve atualizar um registro e exibir mensagem de sucesso', async ({ page }) => {
   
    await page.fill('#data_producao', '2026-04-28');
    await page.fill('#numero_tear', 'T-EDIT-SRC');
    await page.fill('#codigo_produto', 'MAL-EDIT');
    await page.selectOption('#turno', '1');
    await page.selectOption('#qualidade', '1');
    await page.fill('#quilos', '4.0');
    await page.fill('#pecas', '90');
    await page.click('button[type="submit"]');
    await expect(page.locator('#mensagem')).toBeVisible();

   
    await expect(page.locator('#tbody')).toContainText('T-EDIT-SRC', { timeout: 10000 });
    const linha = page.locator('#tbody tr', { hasText: 'T-EDIT-SRC' }).first();
    await linha.locator('.editar').click();

  
    await page.fill('#numero_tear', 'T-EDIT-DST');
    await page.click('button[type="submit"]');

    const mensagem = page.locator('#mensagem');
    await expect(mensagem).toBeVisible();
    await expect(mensagem).toContainText('atualizado com sucesso');
    await expect(mensagem).toHaveClass(/sucesso/);
  });


  test('deve excluir um registro após confirmar o diálogo', async ({ page }) => {
   
    await page.fill('#data_producao', '2026-04-29');
    await page.fill('#numero_tear', 'T-DEL-01');
    await page.fill('#codigo_produto', 'MAL-DEL');
    await page.selectOption('#turno', '3');
    await page.selectOption('#qualidade', '3');
    await page.fill('#quilos', '2.5');
    await page.fill('#pecas', '50');
    await page.click('button[type="submit"]');
    await expect(page.locator('#mensagem')).toBeVisible();

    await expect(page.locator('#tbody')).toContainText('T-DEL-01', { timeout: 10000 });
    const linha = page.locator('#tbody tr', { hasText: 'T-DEL-01' }).first();


    page.once('dialog', dialog => dialog.accept());
    await linha.locator('.excluir').click();

   
    const mensagem = page.locator('#mensagem');
    await expect(mensagem).toBeVisible();
    await expect(mensagem).toContainText('excluído com sucesso');
    await expect(mensagem).toHaveClass(/sucesso/);
  });


  test('não deve excluir o registro ao cancelar o diálogo de confirmação', async ({ page }) => {
    await page.waitForSelector('#tbody tr');
    const totalAntes = await page.locator('#tbody tr').count();

   
    page.once('dialog', dialog => dialog.dismiss());
    await page.locator('#tbody .excluir').first().click();

  
    await page.waitForTimeout(800);
    const totalDepois = await page.locator('#tbody tr').count();

  
    expect(totalDepois).toBe(totalAntes);
  });


  test('deve exibir botões de editar e excluir em cada linha da tabela', async ({ page }) => {
    await page.waitForSelector('#tbody tr');
    const primeiraLinha = page.locator('#tbody tr').first();
    await expect(primeiraLinha.locator('.editar')).toBeVisible();
    await expect(primeiraLinha.locator('.excluir')).toBeVisible();
  });

});