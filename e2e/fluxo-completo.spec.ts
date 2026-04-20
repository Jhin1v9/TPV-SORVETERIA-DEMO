import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://tpv-sorveteria-demo.vercel.app/';

async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/screenshots/${name}.png`, fullPage: false });
}

// ======================= TESTE: KIOSK =======================
test.describe('🖥️ Kiosk - Fluxo Completo', () => {
  test('deve navegar do idioma até confirmação de pedido', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(500);
    await takeScreenshot(page, '01-selector');

    // 1. Selecionar Kiosk
    await page.click('text=Kiosk');
    await page.waitForTimeout(800);
    await takeScreenshot(page, '02-kiosk-hola');

    // 2. Selecionar idioma (PT)
    // NOTE: PT está no index 3 (ca=0, es=1, en=2, pt=3)
    const ptDot = page.locator('.rounded-full').nth(3);
    await ptDot.click();
    await page.waitForTimeout(500);
    await page.click('button:has-text("Olá!")');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '03-kiosk-categorias');

    // 3. Escolher categoria
    await page.click('text=Vaso 500ml');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '04-kiosk-sabores');

    // 4. Escolher 2 sabores
    await page.click('text=Chocolate Negro');
    await page.click('text=Vainilla Madagascar');
    await page.waitForTimeout(300);
    await page.click('text=Continuar');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '05-kiosk-toppings');

    // BUG CHECK: Verificar se "cobertura" aparece repetido
    const toppingsText = await page.locator('text=/cobertura/i').count();
    console.log(`🔍 Toppings com "cobertura": ${toppingsText}`);

    // 5. Selecionar topping
    await page.click('text=Chocolate Negro Derretido');
    await page.waitForTimeout(300);
    await page.click('text=Continuar');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '06-kiosk-carrinho');

    // 6. Verificar carrinho
    const carrinhoItems = await page.locator('.bg-white.rounded-2xl').count();
    console.log(`🛒 Itens no carrinho: ${carrinhoItems}`);
    expect(carrinhoItems).toBeGreaterThan(0);

    // 7. Pagamento
    await page.click('text=Pagar');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '07-kiosk-pagamento');

    await page.click('text=Dinheiro');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '08-kiosk-confirmacao');

    const orderNumber = await page.locator('text=/#[0-9]+/').first().textContent();
    console.log(`✅ Pedido Kiosk: ${orderNumber}`);
  });
});

// ======================= TESTE: CLIENTE PWA =======================
test.describe('📱 Cliente PWA - Fluxo Completo', () => {
  test('deve adicionar produto ao carrinho e fazer pedido', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(500);

    // 1. Selecionar Cliente
    await page.click('text=Cliente');
    await page.waitForTimeout(800);
    await takeScreenshot(page, '09-cliente-cardapio');

    // 2. Adicionar produto ao carrinho
    const primeiroProduto = page.locator('text=Adicionar').first();
    await primeiroProduto.click();
    await page.waitForTimeout(800);
    await takeScreenshot(page, '10-cliente-carrinho-drawer');

    // BUG CHECK: Verificar o que foi adicionado ao carrinho
    const carrinhoText = await page.locator('.bg-gray-50.rounded-2xl').first().textContent();
    console.log(`🛒 Item no carrinho: ${carrinhoText}`);

    // Fechar drawer
    await page.click('button:has([d="M6 18L18 6M6 6l12 12"])');
    await page.waitForTimeout(300);

    // 3. Ir para aba carrinho
    await page.click('text=Carrinho');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '11-cliente-carrinho-page');

    const carrinhoCount = await page.locator('.bg-white.rounded-2xl').count();
    console.log(`📦 Itens na página de carrinho: ${carrinhoCount}`);

    // 4. Tentar fazer pedido
    const pedirBtn = page.locator('text=Pedir agora');
    if (await pedirBtn.isVisible().catch(() => false)) {
      await pedirBtn.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, '12-cliente-pedido-feito');
    }
  });
});

// ======================= TESTE: COCINA KDS =======================
test.describe('👨‍🍳 Cocina KDS', () => {
  test('deve mostrar pedidos em tempo real', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(500);

    await page.click('text=Cocina');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '13-kds-inicial');

    // Verificar se há cards de pedido ou estado vazio
    const hasOrders = await page.locator('text=Sin pedidos activos').isVisible().catch(() => false);
    if (hasOrders) {
      console.log('📭 KDS: Sem pedidos ativos');
    } else {
      const orderCards = await page.locator('.rounded-2xl').count();
      console.log(`📋 KDS: ${orderCards} cards visíveis`);
    }
  });
});

// ======================= TESTE: ADMIN =======================
test.describe('⚙️ Admin Dashboard', () => {
  test('deve fazer login e mostrar analytics', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForTimeout(500);

    await page.click('text=Admin');
    await page.waitForTimeout(800);
    await takeScreenshot(page, '14-admin-login');

    // Login
    await page.fill('input[type="email"]', 'admin@sorveteria.com');
    await page.fill('input[type="password"]', '123456');
    await page.click('text=Entrar');
    await page.waitForTimeout(1000);
    await takeScreenshot(page, '15-admin-dashboard');

    // Navegar para pedidos
    await page.click('text=Pedidos');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '16-admin-pedidos');

    // Navegar para estoque
    await page.click('text=Stock');
    await page.waitForTimeout(500);
    await takeScreenshot(page, '17-admin-estoque');
  });
});
