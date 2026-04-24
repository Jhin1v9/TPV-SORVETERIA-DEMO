async (page) => {
  const sql = \$escaped\;
  await page.evaluate((sqlContent) => { const editors = window.monaco?.editor?.getEditors?.() || []; if (editors.length > 0) { editors[0].setValue(sqlContent); } }, sql);
  await new Promise(r => setTimeout(r, 500));
  await page.evaluate(() => { const buttons = Array.from(document.querySelectorAll('button')); const runBtn = buttons.find(b => b.textContent?.trim()?.includes('Run')); if (runBtn) runBtn.click(); });
  return { done: true };
}