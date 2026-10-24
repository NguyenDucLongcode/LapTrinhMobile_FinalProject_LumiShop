// server.cjs
// JSON Server cho Study Planner App — đọc/ghi dữ liệu JSON
// Chạy: node server.cjs  (mặc định port 3000)

const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

const server = jsonServer.create();
const middlewares = jsonServer.defaults({ noCors: false });

// ── Đọc dữ liệu ban đầu từ các file JSON ──────────────────────────────────
function loadJSON(filename) {
  const filePath = path.join(__dirname, 'data', filename);
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

const db = {
  courses: loadJSON('courses.json'),
  assignments: loadJSON('assignments.json'),
  users: loadJSON('users.json'),
};

const router = jsonServer.router(db);

// ── Middleware ───────────────────────────────────────────────────────────────
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Log mỗi request
server.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

server.use(router);

// ── Khởi chạy ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  🚀 Study Planner API đang chạy tại http://localhost:${PORT}`);
  console.log(`  📚 Endpoints:`);
  console.log(`     GET  /courses`);
  console.log(`     GET  /assignments`);
  console.log(`     GET  /users`);
  console.log(`     POST /assignments`);
  console.log(`     PUT  /assignments/:id`);
  console.log(`     DELETE /assignments/:id\n`);
});
