const fs = require('fs');

const cities = ['madrid'];

async function fetchHTML(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Accept-Language': 'es-ES,es;q=0.9'
    }
  });

  return await res.text();
}

function extractDeals(html, city) {

  const deals = [];

  // regex para bloques de ofertas
  const regex = /<a[^>]+href="(\/deals\/[^"]+)"[^>]*>(.*?)<\/a>/gs;

  let match;

  while ((match = regex.exec(html)) !== null) {

    const link = 'https://www.groupon.es' + match[1];

    // limpiar texto
    const text = match[2]
      .replace(/<[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (text.length > 20) {
      deals.push({
        title: text,
        link,
        city
      });
    }
  }

  return deals;
}

(async () => {

  let allDeals = [];

  for (const city of cities) {

    console.log(`Fetching ${city}...`);

    const url = `https://www.groupon.es/browse/${city}`;

    try {
      const html = await fetchHTML(url);
      const deals = extractDeals(html, city);

      console.log(`Encontrados: ${deals.length}`);

      allDeals.push(...deals);

    } catch (err) {
      console.log(`Error en ${city}:`, err.message);
    }
  }

  // deduplicar
  const unique = Object.values(
    allDeals.reduce((acc, d) => {
      acc[d.link] = d;
      return acc;
    }, {})
  );

  fs.writeFileSync('deals.json', JSON.stringify(unique, null, 2));

  console.log("✅ JSON generado:", unique.length);

})();
