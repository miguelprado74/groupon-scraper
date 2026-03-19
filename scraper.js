const { chromium } = require('playwright');
const fs = require('fs');

(async () => {

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  await page.goto('https://www.groupon.es/browse/madrid', {
    waitUntil: 'domcontentloaded',
    timeout: 60000
  });

  // esperar carga real
  await page.waitForTimeout(10000);

  // forzar scroll
  for (let i = 0; i < 6; i++) {
    await page.mouse.wheel(0, 2000);
    await page.waitForTimeout(2000);
  }

  const deals = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a')).map(a => ({
      title: a.innerText.trim(),
      link: a.href
    })).filter(d => d.link.includes('/deals/') && d.title.length > 10);
  });

  fs.writeFileSync('deals.json', JSON.stringify(deals, null, 2));

  console.log("Deals:", deals.length);

  await browser.close();

})();
