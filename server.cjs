/**
 * JSON Server backend: mỗi resource = 1 file trong data/*.json.
 * POST / PUT / PATCH / DELETE được ghi thẳng vào file tương ứng.
 */
const fs = require('fs');
const path = require('path');
const jsonServer = require('json-server');

const PORT = 3000;
const dataDir = path.join(__dirname, 'data');
const collections = ['categories', 'products', 'users', 'vouchers', 'orders', 'carts'];

function readDb() {
  const db = {};
  for (const name of collections) {
    const filePath = path.join(dataDir, `${name}.json`);
    db[name] = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  }
  return db;
}

function writeDb(db) {
  for (const name of collections) {
    const filePath = path.join(dataDir, `${name}.json`);
    fs.writeFileSync(filePath, `${JSON.stringify(db[name], null, 2)}\n`, 'utf8');
  }
}

const server = jsonServer.create();
const router = jsonServer.router(readDb());
const middlewares = jsonServer.defaults();

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        writeDb(router.db.getState());
      }
    });
  }
  next();
});

server.use(router);

server.listen(PORT, () => {
  console.log(`LumiShop JSON Server: http://localhost:${PORT}`);
  console.log(`Database folder: ${dataDir}`);
  collections.forEach((name) => console.log(`  /${name}  ->  data/${name}.json`));
});
