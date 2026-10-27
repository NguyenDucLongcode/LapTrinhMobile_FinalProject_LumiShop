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

// ── Ghi dữ liệu trở lại file JSON (pretty-print) ─────────────────────────
function writeJSON(filename, data) {
  const filePath = path.join(__dirname, 'data', filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
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

// ── Middleware ghi lại file JSON sau mỗi thao tác thay đổi dữ liệu ──────────
server.use((req, res, next) => {
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    res.on('finish', () => {
      // Chỉ ghi khi server trả về thành công (2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resource = req.path.split('/')[1]; // courses | assignments | users
        if (['courses', 'assignments', 'users'].includes(resource)) {
          try {
            const data = router.db.get(resource).value();
            writeJSON(`${resource}.json`, data);
            console.log(`  ✅ Đã ghi dữ liệu vào data/${resource}.json`);
          } catch (err) {
            console.error(`  ❌ Lỗi ghi file data/${resource}.json:`, err.message);
          }
        }
      }
    });
  }
  next();
});

server.use(router);

// ── Khởi chạy ───────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`\n  🚀 Study Planner API đang chạy tại http://localhost:${PORT}`);
  console.log(`  📚 Endpoints:`);
  console.log(`     GET    /courses`);
  console.log(`     GET    /assignments`);
  console.log(`     GET    /users`);
  console.log(`     POST   /assignments`);
  console.log(`     PUT    /assignments/:id`);
  console.log(`     PATCH  /assignments/:id`);
  console.log(`     DELETE /assignments/:id`);
  console.log(`  💾 Dữ liệu được tự động ghi vào file JSON sau mỗi thao tác thay đổi.\n`);
});
