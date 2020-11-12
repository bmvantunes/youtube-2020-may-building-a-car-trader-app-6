import { openDB } from './src/openDB';

async function setup() {
  const db = await openDB();

  await db.migrate({ force: true });

  const faq = await db.all('SELECT * FROM FAQ ORDER BY createDate DESC');
  console.log('ALL faq', JSON.stringify(faq, null, 2));

  const cars = await db.all('SELECT * FROM Car');
  console.log('ALL CARS', JSON.stringify(cars, null, 2));
}

setup();
