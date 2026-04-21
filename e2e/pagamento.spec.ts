import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

async function completarOnboarding(page: any) {
  await page.goto(BASE_URL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForTimeout(600);

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

  // Pular tutorial
  await page.click('text=Omitir tutorial');
  await page.waitForTimeout(800);
}

test.describe('💳 Fluxo de Pagamento', () => {
  test.beforeEach(async ({ page }) => {
    await completarOnboarding(page);
  });

  test('deve abrir modal de pagamento ao clicar Pedir no drawer', async ({ page }) => {
    // Adicionar produto ao carrinho
    await page.click('text=Añadir');
    await page.waitForTimeout(600);

    // Drawer deve estar aberto
    await expect(page.locator('text=Tu pedido')).toBeVisible();

    // Clicar em Pedir
    await page.click('text=Pedir ahora');
    await page.waitForTimeout(400);

    // Modal de pagamento deve aparecer
    await expect(page.locator('text=Elige cómo quieres pagar')).toBeVisible();
    await expect(page.getByRole('button', { name: /Tarjeta/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Bizum/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Pagar al recoger/i })).toBeVisible();
  });

  test('deve pagar con tarjeta y mostrar confirmación', async ({ page }) => {
    // Adicionar produto
    await page.click('text=Añadir');
    await page.waitForTimeout(600);

    // Pedir
    await page.click('text=Pedir ahora');
    await page.waitForTimeout(400);

    // Selecionar tarjeta (já selecionado por padrão)
    // Preencher dados
    await page.fill('input[placeholder*="4242"]', '4242 4242 4242 4242');
    await page.fill('input[placeholder*="MARÍA"]', 'TEST USER');
    await page.fill('input[placeholder*="12/28"]', '12/28');
    await page.fill('input[placeholder*="123"]', '123');

    // Clicar em Pagar
    await page.click('text=Pagar ahora');
    await page.waitForTimeout(500);

    // Deve mostrar tela de processamento
    await expect(page.locator('text=Conectando con TPV...')).toBeVisible({ timeout: 5000 });

    // Aguardar processamento + confirmação
    await page.waitForTimeout(3500);

    // Deve mostrar confirmação
    await expect(page.locator('text=Pedido confirmado')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/#[0-9]+/')).toBeVisible();
  });

  test('deve pagar con Bizum y mostrar confirmación', async ({ page }) => {
    // Adicionar produto
    await page.click('text=Añadir');
    await page.waitForTimeout(600);

    // Pedir
    await page.click('text=Pedir ahora');
    await page.waitForTimeout(400);

    // Selecionar Bizum
    await page.click('text=Bizum');
    await page.waitForTimeout(200);

    // Preencher telefone
    await page.fill('input[placeholder*="612"]', '612345678');

    // Clicar em Pagar
    await page.click('text=Pagar ahora');
    await page.waitForTimeout(500);

    // Aguardar processamento
    await page.waitForTimeout(3500);

    // Confirmação
    await expect(page.locator('text=Pedido confirmado')).toBeVisible({ timeout: 5000 });
  });

  test('deve pagar al recoger y mostrar confirmación', async ({ page }) => {
    // Adicionar produto
    await page.click('text=Añadir');
    await page.waitForTimeout(600);

    // Pedir
    await page.click('text=Pedir ahora');
    await page.waitForTimeout(400);

    // Selecionar Efectivo
    await page.click('text=Pagar al recoger');
    await page.waitForTimeout(200);

    // Clicar em Pagar
    await page.click('text=Pagar ahora');
    await page.waitForTimeout(500);

    // Aguardar processamento
    await page.waitForTimeout(3500);

    // Confirmação
    await expect(page.locator('text=Pedido confirmado')).toBeVisible({ timeout: 5000 });

    // Deve mostrar QR
    await expect(page.locator('text=Muestra en el mostrador')).toBeVisible();
  });

  test('deve validar campos de tarjeta vacíos', async ({ page }) => {
    // Adicionar produto
    await page.click('text=Añadir');
    await page.waitForTimeout(600);

    // Pedir
    await page.click('text=Pedir ahora');
    await page.waitForTimeout(400);

    // Clicar em Pagar sem preencher nada
    await page.click('text=Pagar ahora');
    await page.waitForTimeout(200);

    // Deve mostrar erros
    await expect(page.locator('text=Número incompleto')).toBeVisible();
    await expect(page.locator('text=Nombre requerido')).toBeVisible();
  });

  test('deve permitir cerrar modal de pago', async ({ page }) => {
    // Adicionar produto
    await page.click('text=Añadir');
    await page.waitForTimeout(600);

    // Pedir
    await page.click('text=Pedir ahora');
    await page.waitForTimeout(400);

    // Fechar modal via backdrop click
    await page.click('.fixed.inset-0.z-50.bg-black\\/60');
    await page.waitForTimeout(400);

    // Drawer ainda deve estar visível
    await expect(page.locator('text=Tu pedido')).toBeVisible();
  });
});
