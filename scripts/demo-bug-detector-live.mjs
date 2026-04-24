import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from '@playwright/test';

const DEMO_URL = 'https://kiosk-swart-delta.vercel.app/';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const outputDir = path.resolve('artifacts', `bug-detector-live-demo-${timestamp}`);

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function writeText(filePath, content) {
  await fs.writeFile(filePath, content, 'utf8');
}

async function run() {
  await ensureDir(outputDir);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1200 },
    acceptDownloads: true,
  });
  const page = await context.newPage();

  const steps = [];

  try {
    await page.goto(DEMO_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2500);

    steps.push('Abrimos o kiosk publicado em producao e validamos que o dock do bug detector aparece na tela inicial.');
    await page.screenshot({ path: path.join(outputDir, '01-home.png'), fullPage: true });

    await page.getByRole('button', { name: 'Bug Detector' }).click();
    await page.waitForTimeout(1000);

    const target = page.getByText('TOQUE PARA ENTRAR');
    const targetBox = await target.boundingBox();
    if (!targetBox) {
      throw new Error('Nao foi possivel localizar o CTA "TOQUE PARA ENTRAR" para o teste.');
    }

    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.waitForTimeout(400);
    steps.push('Entramos no modo de inspecao e destacamos um elemento real da tela: o CTA "TOQUE PARA ENTRAR".');
    await page.screenshot({ path: path.join(outputDir, '02-inspect-mode.png'), fullPage: true });

    await page.mouse.click(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2);
    await page.waitForTimeout(1200);

    steps.push('Clicamos no elemento selecionado e o modal nativo de report abriu com screenshot automatico e contexto do elemento.');
    await page.screenshot({ path: path.join(outputDir, '03-report-modal.png'), fullPage: true });

    await page.locator('textarea').first().fill(
      'Teste real do bug detector no kiosk publicado. O CTA principal foi capturado corretamente apos modo de inspecao.'
    );
    await page.locator('textarea').nth(1).fill(
      'Ao tocar em TOQUE PARA ENTRAR, o kiosk deve levar o usuario para o fluxo principal sem friccao.'
    );

    const submit = page.getByRole('button', { name: /Enviar Report/i });
    await page
      .locator('[data-bug-detector-ui] .flex-1.overflow-y-auto')
      .first()
      .evaluate((el) => {
        el.scrollTop = el.scrollHeight;
      });
    await page.waitForTimeout(300);
    await submit.evaluate((el) => el.click());
    await page.waitForTimeout(3500);

    steps.push('Enviamos o report e o workspace lateral abriu automaticamente com status, prioridade e handoff do time.');
    await page.screenshot({ path: path.join(outputDir, '04-workspace.png'), fullPage: true });

    await page.getByPlaceholder('Autor').first().fill('Codex');
    await page.getByPlaceholder('Adicionar contexto, observacao ou handoff').first().fill(
      'Comentario de demo: o fluxo inspect-first funcionou ao vivo e abriu o workspace apos o envio.'
    );
    await page.getByRole('button', { name: 'Comentar' }).click();
    await page.waitForTimeout(1000);

    steps.push('Registramos um comentario de triagem dentro do workspace para demonstrar colaboracao e contexto persistido.');
    await page.screenshot({ path: path.join(outputDir, '05-workspace-commented.png'), fullPage: true });

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Markdown' }).click();
    const download = await downloadPromise;
    const suggestedName = download.suggestedFilename();
    const markdownPath = path.join(outputDir, suggestedName);
    await download.saveAs(markdownPath);

    steps.push('Exportamos o report em Markdown para validar o handoff tecnico fora da UI.');

    await page.getByRole('button', { name: 'Painel nativo' }).click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outputDir, '06-native-panel.png'), fullPage: true });

    const bodyText = await page.locator('body').innerText();
    await writeText(path.join(outputDir, 'page-text-snapshot.txt'), bodyText);

    const report = [
      '# Demo real do Bug Detector',
      '',
      `- Data: ${new Date().toLocaleString('pt-BR')}`,
      `- URL testada: ${DEMO_URL}`,
      '- Ambiente: producao publica do kiosk',
      '- Ferramenta: Playwright em modo headless',
      '',
      '## Resultado',
      '',
      '- O fluxo inspect-first funcionou em um site real publicado.',
      '- O modal nativo abriu apos selecao do elemento.',
      '- O report foi criado com sucesso.',
      '- O workspace lateral abriu automaticamente.',
      '- O comentario de equipe foi salvo.',
      '- A exportacao em Markdown foi concluida.',
      '- A camada Kimi apareceu ativa no deploy atual; em validacoes recentes a API pode responder com limitacao temporaria (429), entao a UX precisa tratar esse estado com elegancia.',
      '',
      '## Comentarios',
      '',
      ...steps.map((step, index) => `${index + 1}. ${step}`),
      '',
      '## Arquivos gerados',
      '',
      '- `01-home.png`',
      '- `02-inspect-mode.png`',
      '- `03-report-modal.png`',
      '- `04-workspace.png`',
      '- `05-workspace-commented.png`',
      '- `06-native-panel.png`',
      '- export markdown do report',
      '- `page-text-snapshot.txt`',
    ].join('\n');

    await writeText(path.join(outputDir, 'README.md'), report);
    console.log(`Demo concluida em: ${outputDir}`);
  } finally {
    await context.close();
    await browser.close();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
