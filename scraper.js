const fs = require('fs');

const cities = ['madrid'];

async function getDeals(city) {

  const url = `https://www.groupon.es/occasions/api/v2/browse?locale=es_ES&division=${city}&offset=0&limit=24`;

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0',
      'Accept': 'application/json'
    }
  });

  const data = await res.json();

  return data.deals.map(d => ({
    title: d.title,
    price: d.price?.formattedAmount,
    image: d.grid4ImageUrl,
    link: `https://www.groupon.es/deals/${d.dealUrl}`,
    city
  }));
}

(async () => {

  let allDeals = [];

  for (const city of cities) {
    try {
      console.log(`Fetching ${city}...`);
      const deals = await getDeals(city);
      console.log(`Encontrados: ${deals.length}`);
      allDeals.push(...deals);
    } catch (err) {
      console.log(`Error en ${city}:`, err.message);
    }
  }

  fs.writeFileSync('deals.json', JSON.stringify(allDeals, null, 2));

  console.log("✅ JSON generado");

})();
