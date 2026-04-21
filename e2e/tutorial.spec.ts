import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('🎯 Tutorial Interativo - 6 Passos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForTimeout(500);

    // Completar onboarding rapido
    await page.click('text=COMENZAR');
    await page.waitForTimeout(400);
    await page.fill('input[type="text"]', 'Teste');
    await page.fill('input[type="tel"]', '+34 612 345 678');
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(1500);
    await page.locator('button:has-text("Empaquetado para viaje")').click();
    await page.waitForTimeout(800);
    await page.click('text=ninguna alergia');
    await page.waitForTimeout(200);
    await page.click('text=Continuar');
    await page.waitForTimeout(800);
  });

  test('deve mostrar tutorial com 6 passos', async ({ page }) => {
    // Progress bar deve estar visivel
    const progressBar = page.locator('.h-1.bg-white\\/10');
    await expect(progressBar).toBeVisible();

    // Titulo do primeiro passo
    const step1Title = page.locator('text=Este es tu menú digital');
    await expect(step1Title).toBeVisible({ timeout: 5000 });
  });

  test('deve navegar pelos 6 passos com Next', async ({ page }) => {
    const steps = [
      'Este es tu menú digital',
      'Personaliza tu pedido',
      'Revisa tu carrito',
      'Paga desde el móvil',
      'Sigue tu pedido en tiempo real',
      'Listo! Ven a recogerlo',
    ];

    for (let i = 0; i < steps.length; i++) {
      const title = page.locator(`text=${steps[i]}`);
      await expect(title).toBeVisible({ timeout: 5000 });

      // Verificar progresso
      const progressText = page.locator(`text=Paso ${i + 1} / 6`);
      await expect(progressText).toBeVisible();

      if (i < steps.length - 1) {
        await page.click('text=Siguiente');
      } else {
        await page.click('text=Comenzar');
      }
      await page.waitForTimeout(400);
    }

    // Ao finalizar, o tutorial deve desaparecer e mostrar o app
    await page.waitForTimeout(1000);
    const appContent = page.locator('text=Sabadell Nord');
    await expect(appContent).toBeVisible({ timeout: 5000 });
  });

  test('deve permitir voltar para passo anterior', async ({ page }) => {
    await page.click('text=Siguiente');
    await page.waitForTimeout(400);

    // Estamos no passo 2
    await expect(page.locator('text=Personaliza tu pedido')).toBeVisible();

    // Voltar
    await page.click('text=Atrás');
    await page.waitForTimeout(800);

    // Deve estar no passo 1
    await expect(page.locator('text=Este es tu menú digital')).toBeVisible();
  });

  test('deve permitir pular tutorial a qualquer momento', async ({ page }) => {
    await page.click('text=Omitir tutorial');
    await page.waitForTimeout(800);

    // Deve mostrar o app
    const appContent = page.locator('text=Sabadell Nord');
    await expect(appContent).toBeVisible({ timeout: 5000 });

    // localStorage deve estar marcado como completo
    const completed = await page.evaluate(() => localStorage.getItem('tpv-onboarding-completed'));
    expect(completed).toBe('true');
  });

  test('passo 5 deve mostrar animacao de status do pedido', async ({ page }) => {
    // Avancar ate o passo 5
    for (let i = 0; i < 4; i++) {
      await page.click('text=Siguiente');
      await page.waitForTimeout(800);
    }

    await expect(page.locator('text=Sigue tu pedido en tiempo real')).toBeVisible();

    // Deve mostrar os 3 status
    await expect(page.locator('text=/Recibido|Rebut|Recebido|Received/i').first()).toBeVisible();
    await expect(page.locator('text=/Preparando|Preparant|Preparando|Preparing/i').first()).toBeVisible();
    await expect(page.locator('text=/Listo!|Pront!|Llest!/i').first()).toBeVisible();

    // Aguardar animacao (status mudam automaticamente)
    await page.waitForTimeout(4000);
  });

  test('ultimo passo deve mostrar confetti ao finalizar', async ({ page }) => {
    // Avancar ate o passo 6
    for (let i = 0; i < 5; i++) {
      await page.click('text=Siguiente');
      await page.waitForTimeout(800);
    }

    await expect(page.locator('text=/Listo! Ven a recogerlo/i')).toBeVisible();

    // Clicar em Comenzar para ativar confetti
    await page.click('text=/Comenzar|Começar|Començar|Start/i');
    await page.waitForTimeout(1200);

    // Confetti deve aparecer (divs coloridas animadas) ou o app principal deve aparecer
    const appVisible = await page.locator('text=Sabadell Nord').isVisible().catch(() => false);
    const confettiVisible = await page.locator('div[style*="backgroundColor"]').first().isVisible().catch(() => false);
    expect(appVisible || confettiVisible).toBe(true);
  });
});
