import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function completarOnboarding(page: any) {
  await page.goto(BASE_URL);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await page.waitForTimeout(600);

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
}

test.describe('📱 Cliente PWA - Fluxo Completo', () => {
  test.beforeEach(async ({ page }) => {
    await completarOnboarding(page);
  });

  test('deve adicionar produto ao carrinho e fazer pedido', async ({ page }) => {
    // 1. Adicionar produto ao carrinho
    await page.click('text=Añadir');
    await page.waitForTimeout(600);

    // Drawer deve estar aberto com item
    await expect(page.locator('text=Tu pedido')).toBeVisible();
    await expect(page.locator('text=Pedir ahora')).toBeVisible();

    // 2. Ir para pagamento
    await page.click('text=Pedir ahora');
    await page.waitForTimeout(400);

    await expect(page.locator('text=Elige cómo quieres pagar')).toBeVisible();

    // 3. Pagar al recoger
    await page.click('text=Pagar al recoger');
    await page.waitForTimeout(400);
    await page.click('text=Pagar ahora');
    await page.waitForTimeout(3000);

    // 4. Confirmação
    await expect(page.locator('text=Pedido confirmado')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Seguir mi pedido')).toBeVisible();

    // 5. Ir para pedidos
    await page.click('text=Seguir mi pedido');
    await page.waitForTimeout(500);

    await expect(page.getByRole('heading', { name: 'Mis pedidos' })).toBeVisible();
  });

  test('deve persistir perfil e alergias após reload', async ({ page }) => {
    const perfil = await page.evaluate(() => {
      const raw = localStorage.getItem('tpv-sorveteria-storage');
      return raw ? JSON.parse(raw).state.perfilUsuario : null;
    });

    expect(perfil).toBeTruthy();
    expect(perfil.nome).toBe('Maria');
    expect(perfil.telefone.replace(/\D/g, '')).toBe('34612345678');
    expect(perfil.temAlergias).toBe(false);

    await page.reload();
    await page.waitForTimeout(800);

    // Após reload, deve ir direto pro app (onboarding já completado)
    await expect(page.locator('text=Carta')).toBeVisible({ timeout: 5000 });
  });
});
