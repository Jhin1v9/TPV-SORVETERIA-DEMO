import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// Helper: limpa tudo e vai para a tela de auth
test.describe('🚀 Onboarding - Primeiro Acesso', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForTimeout(600);
  });

  test('deve mostrar tela de boas-vindas no primeiro acesso', async ({ page }) => {
    const welcomeTitle = page.locator('text=Heladería Tropicale');
    await expect(welcomeTitle).toBeVisible({ timeout: 5000 });

    const startBtn = page.locator('text=COMENZAR');
    await expect(startBtn).toBeVisible();

    const skipBtn = page.locator('text=Skip');
    await expect(skipBtn).toBeVisible();
  });

  test('deve navegar do welcome para registro ao clicar COMENZAR', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);

    // Deve mostrar tela de registro (modo padrão)
    await expect(page.getByRole('heading', { name: 'Crear cuenta' })).toBeVisible({ timeout: 5000 });

    // Toggle de login deve existir
    await expect(page.locator('text=Entrar')).toBeVisible();

    // Campos de nome e telefone devem existir
    await expect(page.getByPlaceholder('Tu nombre')).toBeVisible();
    await expect(page.getByPlaceholder('+34 612 345 678')).toBeVisible();
  });

  test('deve permitir registro rapido com nome e telefone', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);

    await page.fill('input[type="text"]', 'Cliente Teste');
    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Deve ir para tela de preferência de consumo
    await expect(page.getByRole('heading', { name: /Dónde lo disfrutarás/i })).toBeVisible({ timeout: 5000 });
    await page.click('text=Para llevar');
    await page.waitForTimeout(400);

    // Deve ir para tela de alergia
    await expect(page.locator('text=Alergias alimentarias')).toBeVisible({ timeout: 5000 });
  });

  test('deve exigir nome no registro', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);

    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(300);

    // Deve mostrar erro de nome obrigatório
    await expect(page.locator('text=Campo obligatorio')).toBeVisible();
  });

  test('deve exigir telefone valido no registro', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);

    await page.fill('input[type="text"]', 'Teste');
    await page.fill('input[type="tel"]', '123');
    await page.locator('button[type="submit"]').last().click();
    await page.waitForTimeout(300);

    await expect(page.locator('text=/inválido|9 dígitos/i')).toBeVisible();
  });

  test('deve permitir login com telefone existente', async ({ page }) => {
    // Primeiro registra
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.fill('input[type="text"]', 'Maria');
    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    // Pular consumo
    await page.locator('button:has-text("Empaquetado para viaje")').click();
    await page.waitForTimeout(800);
    // Pular alergia
    await page.click('text=ninguna alergia');
    await page.waitForTimeout(200);
    await page.click('text=Continuar');
    await page.waitForTimeout(800);
    // Pular tutorial
    await page.click('text=Omitir tutorial');
    await page.waitForTimeout(500);

    // Fazer logout
    await page.click('text=⚙️');
    await page.waitForTimeout(300);
    await page.click('text=Cerrar sesión');
    await page.waitForTimeout(800);

    // Limpar onboarding completed para mostrar tela de welcome novamente
    await page.evaluate(() => {
      localStorage.removeItem('tpv-onboarding-completed');
      localStorage.removeItem('tpv-sorveteria-storage');
    });
    await page.reload();
    await page.waitForTimeout(600);

    // Agora fazer login
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.click('text=Entrar'); // toggle para login
    await page.waitForTimeout(200);
    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);

    // Deve ir para consumo e depois alergia (perfil já existe)
    await expect(page.getByRole('heading', { name: /Dónde lo disfrutarás/i })).toBeVisible({ timeout: 5000 });
    await page.click('text=Para llevar');
    await page.waitForTimeout(400);
    await expect(page.locator('text=Alergias alimentarias')).toBeVisible({ timeout: 5000 });
  });

  test('deve mostrar erro ao logar com telefone inexistente', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.click('text=Entrar'); // toggle para login
    await page.waitForTimeout(200);
    await page.fill('input[type="tel"]', '+34 999 999 999');
    await page.locator('button[type="submit"]').last().click();
    await page.waitForTimeout(800);

    await expect(page.locator('text=/no encontrado|no trobat|não encontrado|not found/i')).toBeVisible();
  });

  test('deve permitir pular onboarding e ir direto pro app', async ({ page }) => {
    await page.click('text=Skip');
    await page.waitForTimeout(800);

    await expect(page.locator('text=Carta')).toBeVisible({ timeout: 5000 });
  });

  test('deve reconhecer usuario retornante e oferecer continuar', async ({ page }) => {
    // Primeiro registra
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.fill('input[type="text"]', 'Maria');
    await page.fill('input[type="tel"]', '34612345678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Empaquetado para viaje")').click();
    await page.waitForTimeout(800);
    await page.click('text=ninguna alergia');
    await page.waitForTimeout(200);
    await page.click('text=Continuar');
    await page.waitForTimeout(800);
    await page.click('text=Omitir tutorial');
    await page.waitForTimeout(800);

    // Agora simula retorno: limpa apenas o flag de onboarding, mantém o perfil
    await page.evaluate(() => {
      localStorage.removeItem('tpv-onboarding-completed');
    });
    await page.reload();
    await page.waitForTimeout(600);

    // Deve mostrar tela de retornante
    await expect(page.locator('text=Hola de nuevo,')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h1:has-text("Maria")')).toBeVisible();
    await expect(page.locator('text=Continuar como Maria')).toBeVisible();

    // Clicar em continuar
    await page.click('text=Continuar como Maria');
    await page.waitForTimeout(800);

    // Deve ir direto pro app
    await expect(page.locator('text=Carta')).toBeVisible({ timeout: 5000 });
  });

  test('deve persistir que onboarding foi completado no localStorage', async ({ page }) => {
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.fill('input[type="text"]', 'Teste');
    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Empaquetado para viaje")').click();
    await page.waitForTimeout(1500);
    await page.click('text=ninguna alergia');
    await page.waitForTimeout(200);
    await page.click('text=Continuar');
    await page.waitForTimeout(800);
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
    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    // Passar pelo passo de consumo
    await page.locator('button:has-text("Empaquetado para viaje")').click();
    await page.waitForTimeout(800);
  });

  test('deve mostrar 8 alergenos de sorveteria para selecionar', async ({ page }) => {
    await page.click('text=tengo alergias');
    await page.waitForTimeout(300);

    const nomesAlergenos = ['Gluten', 'Leche', 'Huevos', 'Frutos secos', 'Cacahuete', 'Soja', 'Sésamo', 'Sulfitos'];
    for (const nome of nomesAlergenos) {
      await expect(page.locator(`text=${nome}`).first()).toBeVisible();
    }
  });

  test('deve permitir selecionar alergenos e salvar no perfil', async ({ page }) => {
    await page.click('text=tengo alergias');
    await page.waitForTimeout(200);

    await page.locator('label:has-text("Gluten")').click();
    await page.locator('label:has-text("Leche")').click();
    await page.waitForTimeout(200);

    await page.click('text=Continuar');
    await page.waitForTimeout(500);

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
