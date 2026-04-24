import os

with open('supabase/migrations/essential_functions.sql', 'r', encoding='utf-8') as f:
    sql = f.read()

# Escape for JS template literal: backslashes and backticks
sql_escaped = sql.replace('\\', '\\\\').replace('`', '\\`')

js = f'''async (page) => {{
  const sql = `{sql_escaped}`;
  await page.evaluate((sqlContent) => {{
    const editors = window.monaco?.editor?.getEditors?.() || [];
    if (editors.length > 0) {{
      editors[0].setValue(sqlContent);
    }}
  }}, sql);
  await page.waitForTimeout(1000);
  await page.evaluate(() => {{
    const buttons = Array.from(document.querySelectorAll("button"));
    const runBtn = buttons.find(b => b.textContent?.trim()?.includes("Run"));
    if (runBtn) runBtn.click();
  }});
  return {{ sqlLength: sql.length }};
}}
'''

with open('supabase/migrations/run_essential_sql.js', 'w', encoding='utf-8') as f:
    f.write(js)

print(f'JS file created: {len(js)} chars')
