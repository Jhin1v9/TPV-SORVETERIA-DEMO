import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('🚀 Onboarding - Primeiro Acesso', () => {
  test.beforeEach(async ({ page }) => {
    // Limpar localStorage para simular primeiro acesso
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);
  });

  test('deve mostrar tela de boas-vindas no primeiro acesso', async ({ page }) => {
    const welcomeTitle = page.locator('text=Heladería Tropicale');
    await expect(welcomeTitle).toBeVisible({ timeout: 5000 });

    const startBtn = page.locator('text=COMENZAR');
    await expect(startBtn).toBeVisible();

    // Skip button deve existir
    const skipBtn = page.locator('text=Skip');
    await expect(skipBtn).toBeVisible();
  });

  test('deve navegar do welcome para registro ao clicar COMENZAR', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);

    // Deve mostrar tela de registro
    const registerTitle = page.locator('text=Crear cuenta');
    await expect(registerTitle).toBeVisible({ timeout: 5000 });

    // Campos de nome e telefone devem existir
    const nameInput = page.locator('input[placeholder*="nombre" i]');
    const phoneInput = page.locator('input[type="tel"]');
    await expect(nameInput).toBeVisible();
    await expect(phoneInput).toBeVisible();
  });

  test('deve permitir registro rapido com nome e telefone', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);

    await page.fill('input[type="text"]', 'Cliente Teste');
    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.click('text=ENTRAR');
    await page.waitForTimeout(1000);

    // Deve ir para tela de alergia
    const allergyTitle = page.locator('text=Alergias alimentarias');
    await expect(allergyTitle).toBeVisible({ timeout: 5000 });
  });

  test('deve exigir nome no registro', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);

    // Tentar enviar sem nome
    await page.click('text=ENTRAR');
    await page.waitForTimeout(300);

    // Deve mostrar erro
    const errorMsg = page.locator('text=Campo obligatorio');
    await expect(errorMsg).toBeVisible();
  });

  test('deve permitir pular onboarding e ir direto pro app', async ({ page }) => {
    await page.click('text=Skip');
    await page.waitForTimeout(800);

    // Deve mostrar o app normal (cardápio)
    await expect(page.locator('text=Carta')).toBeVisible({ timeout: 5000 });
  });

  test('deve persistir que onboarding foi completado no localStorage', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.fill('input[type="text"]', 'Teste');
    await page.click('text=ENTRAR');
    await page.waitForTimeout(1000);

    // Pular alergia
    await page.click('text=ninguna alergia');
    await page.waitForTimeout(200);
    await page.click('text=Continuar');
    await page.waitForTimeout(800);
    // Pular tutorial
    await page.click('text=Omitir tutorial');
    await page.waitForTimeout(500);

    const completed = await page.evaluate(() => localStorage.getItem('tpv-onboarding-completed'));
    expect(completed).toBe('true');
  });
});

test.describe('🤧 Onboarding - Alergias', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { localStorage.clear(); sessionStorage.clear(); });
    await page.goto(BASE_URL);
    await page.waitForTimeout(600);
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.fill('input[type="text"]', 'Teste');
    await page.click('text=ENTRAR');
    await page.waitForTimeout(1000);
  });

  test('deve mostrar 14 alergenos para selecionar', async ({ page }) => {
    // Clicar em "Sim, tengo alergias" para revelar os checkboxes
    await page.click('text=tengo alergias');
    await page.waitForTimeout(300);

    const checkboxes = page.locator('input[type="checkbox"]');
    // Deve ter pelo menos 14 checkboxes de alergenos
    const count = await checkboxes.count();
    expect(count).toBeGreaterThanOrEqual(14);
  });

  test('deve permitir selecionar alergenos e salvar no perfil', async ({ page }) => {
    // Clicar em "Sim, tengo alergias"
    await page.click('text=tengo alergias');
    await page.waitForTimeout(200);

    // Selecionar Gluten e Leche
    await page.locator('label:has-text("Gluten")').click();
    await page.locator('label:has-text("Leche")').click();
    await page.waitForTimeout(200);

    await page.click('text=Continuar');
    await page.waitForTimeout(500);

    // Verificar se perfil foi salvo com alergias
    const perfil = await page.evaluate(() => {
      const raw = localStorage.getItem('tpv-sorveteria-storage');
      return raw ? JSON.parse(raw).state.perfilUsuario : null;
    });

    expect(perfil).toBeTruthy();
    expect(perfil.temAlergias).toBe(true);
    expect(perfil.alergias).toContain('gluten');
    expect(perfil.alergias).toContain('leite');
  });

  test('deve permitir marcar "nao tenho alergias"', async ({ page }) => {
    await page.click('text=ninguna alergia');
    await page.waitForTimeout(200);

    await page.click('text=Continuar');
    await page.waitForTimeout(500);

    const perfil = await page.evaluate(() => {
      const raw = localStorage.getItem('tpv-sorveteria-storage');
      return raw ? JSON.parse(raw).state.perfilUsuario : null;
    });

    expect(perfil.temAlergias).toBe(false);
    expect(perfil.alergias).toHaveLength(0);
  });
});
