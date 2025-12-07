// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_FILE = path.join(__dirname, 'database.json');
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOAD_DIR = path.join(PUBLIC_DIR, 'uploads');

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR);
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const name = Date.now() + '_' + file.originalname.replace(/\s+/g, '_');
    cb(null, name);
  }
});
const upload = multer({ storage });

// Initialize DB if not exists
if (!fs.existsSync(DB_FILE)) {
  const initial = {
    users: {
      students: [
        "امیر احمدی","محمد رضایی","علی کریمی","رضا موسوی","حسین قاسمی","سینا کاظمی","مهرداد صادقی","امید سلیمانی","نوید احمدی","آرش حسینی","شایان یوسفی","پارسا نوری","امیرحسین محمدی","کیان توسلی","مهدی طاهری","علی رضا زاده","سجاد کریمی","آرمان صادقی","احمد توسلی","امیرحسین جلیل جمشیدی"
      ],
      teachers: [
        "آقای محمودی","آقای حسینی","آقای کریمی","آقای موسوی","آقای قاسمی","آقای کاظمی","آقای صادقی","آقای سلیمانی","آقای احمدی","آقای حسینی_2","آقای یوسفی","آقای نوری","آقای محمدی","آقای طاهری"
      ],
      managers: [ "modir_kol", "modir_madrese", "nazem1", "nazem_motaleat" ],
      passwords: {}
    },
    books: {
      "علوم":"https://example.com/books/science.pdf",
      "ریاضی":"https://example.com/books/math.pdf",
      "فارسی":"https://example.com/books/farsi.pdf",
      "نگارش":"https://example.com/books/negahesh.pdf",
      "تفکر و سبک زندگی":"https://example.com/books/tafakor.pdf",
      "کار و فناوری":"https://example.com/books/karfanavari.pdf",
      "قرآن":"https://example.com/books/quran.pdf",
      "دینی":"https://example.com/books/dini.pdf",
      "عربی":"https://example.com/books/arabic.pdf",
      "English student book":"https://example.com/books/english_student.pdf",
      "English workbook":"https://example.com/books/english_workbook.pdf",
      "مطالعات اجتماعی":"https://example.com/books/social.pdf",
      "هنر":"https://example.com/books/art.pdf"
    },
    sessions: {},        // { lessonName: true/false }
    assignments: [],     // { id, student, teacher, lesson, fileUrl, fileName, time }
    feedbacks: [],       // { id, teacher, student, lesson, text, time }
    notifications: []    // { id, to, text, lesson?, teacher?, student?, time, read:false }
  };

  // default passwords = username for all users (students, teachers, managers)
  [...initial.users.students, ...initial.users.teachers, ...initial.users.managers].forEach(u => {
    initial.users.passwords[u] = u;
  });

  // ensure manager/nazem roles also in teachers if needed
  // We'll treat managers as having teacher capabilities as requested:
  initial.users.teachers.push(...initial.users.managers.filter(m => !initial.users.teachers.includes(m)));

  fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
}

function readDB(){ return JSON.parse(fs.readFileSync(DB_FILE,'utf8')); }
function writeDB(db){ fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8'); }

// helpers
function now(){ return new Date().toLocaleString(); }
function genId(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }

/* ------------------ ROUTES ------------------ */

// health
app.get('/api/health', (req,res)=> res.json({ ok:true }));

// login: { name, pass } -> { success:true, role: 'student'|'teacher'|'manager' }
app.post('/api/login', (req,res) => {
  const { name, pass } = req.body;
  if(!name || !pass) return res.json({ error: 'نام و رمز لازم است' });
  const db = readDB();
  if(!db.users.passwords[name]) return res.json({ error: 'کاربر یافت نشد' });
  if(db.users.passwords[name] !== pass) return res.json({ error: 'رمز اشتباه است' });
  let role = 'student';
  if(db.users.managers.includes(name)) role = 'manager';
  else if(db.users.teachers.includes(name)) role = 'teacher';
  res.json({ success:true, role });
});

// change password: { user, newPassword }
app.post('/api/change-password', (req,res) => {
  const { user, newPassword } = req.body;
  if(!user || !newPassword) return res.json({ error: 'پارامتر ناقص' });
  const db = readDB();
  if(!db.users.passwords[user]) return res.json({ error: 'کاربر وجود ندارد' });
  db.users.passwords[user] = newPassword;
  writeDB(db);
  res.json({ ok:true });
});

// upload file
app.post('/api/upload', upload.single('file'), (req,res) => {
  if(!req.file) return res.json({ ok:false });
  const fileUrl = `/uploads/${req.file.filename}`;
  res.json({ ok:true, fileUrl, fileName: req.file.originalname });
});

// books
app.get('/api/books', (req,res) => {
  const db = readDB();
  res.json(db.books);
});

// start class: { teacher, lesson } -> notifies students with message format (1)
app.post('/api/start-class', (req,res) => {
  const { teacher, lesson } = req.body;
  if(!teacher || !lesson) return res.json({ error:'پارامتر ناقص' });
  const db = readDB();
  db.sessions[lesson] = true;

  // notification to all students
  const text = `دانش‌آموز عزیز — ${teacher} — درس ${lesson} را شروع کرد. لطفاً به جلسه بپیوندید.`;
  db.notifications.unshift({ id: genId(), to: 'students', text, lesson, teacher, time: now(), read:false });

  writeDB(db);
  res.json({ ok:true });
});

// end class: { teacher, lesson } -> notifies students with message format (2)
app.post('/api/end-class', (req,res) => {
  const { teacher, lesson } = req.body;
  if(!teacher || !lesson) return res.json({ error:'پارامتر ناقص' });
  const db = readDB();
  db.sessions[lesson] = false;

  const text = `دانش‌آموز عزیز — ${teacher} — درس ${lesson} را تمام کرد.`;
  db.notifications.unshift({ id: genId(), to: 'students', text, lesson, teacher, time: now(), read:false });

  writeDB(db);
  res.json({ ok:true });
});

// teacher broadcasts assignment to students: { teacher, lesson, text, fileUrl?, fileName? }
// notification format (3) to students
app.post('/api/teacher-broadcast', (req,res) => {
  const { teacher, lesson, text, fileUrl, fileName } = req.body;
  if(!teacher || !lesson) return res.json({ error:'پارامتر ناقص' });
  const db = readDB();
  // store as a broadcast-like assignment (student empty)
  const entry = { id: genId(), student:'', teacher, lesson, fileUrl: fileUrl||null, fileName: fileName||null, text: text||'', time: now() };
  db.assignments.push(entry);

  const notifText = `معلم ${teacher} برای درس ${lesson} تکلیف ارسال کرد. لطفاً تکلیف را مشاهده کرده و انجام دهید.`;
  db.notifications.unshift({ id: genId(), to: 'students', text: notifText, lesson, teacher, time: now(), read:false });

  writeDB(db);
  res.json({ ok:true });
});

// student sends assignment to teacher: { student, teacher, lesson, fileUrl, fileName }
// notification to the specific teacher (teacher message 1)
app.post('/api/send-assignment', (req,res) => {
  const { student, teacher, lesson, fileUrl, fileName } = req.body;
  if(!student || !teacher || !lesson) return res.json({ error:'پارامتر ناقص' });
  const db = readDB();
  const entry = { id: genId(), student, teacher, lesson, fileUrl: fileUrl||null, fileName: fileName||null, time: now() };
  db.assignments.push(entry);

  // notify teacher
  const ttext = `معلم عزیز — ${teacher} — ${student} برای درس ${lesson} تکلیف ارسال کرده است. لطفاً تکلیف دانش‌آموز را مشاهده کنید.`;
  db.notifications.unshift({ id: genId(), to: teacher, text: ttext, lesson, teacher, student, time: now(), read:false });

  writeDB(db);
  res.json({ ok:true });
});

// teacher sends feedback to a student: { teacher, student, lesson, text }
// notification to that student using format (4)
app.post('/api/send-feedback', (req,res) => {
  const { teacher, student, lesson, text } = req.body;
  if(!teacher || !student || !lesson || !text) return res.json({ error:'پارامتر ناقص' });
  const db = readDB();
  const entry = { id: genId(), teacher, student, lesson, text, time: now() };
  db.feedbacks.push(entry);

  // notify student
  const st = `معلم ${teacher} برای درس ${lesson} شما بازخوردی ارسال کرده، لطفاً بازخورد معلم را مشاهده کنید.`;
  db.notifications.unshift({ id: genId(), to: student, text: st, lesson, teacher, student, time: now(), read:false });

  writeDB(db);
  res.json({ ok:true });
});

// get assignments (with optional filters)
app.get('/api/assignments', (req,res) => {
  const db = readDB();
  const { teacher, lesson, student } = req.query;
  let out = db.assignments.slice().reverse();
  if(teacher) out = out.filter(a => a.teacher === teacher);
  if(lesson) out = out.filter(a => a.lesson === lesson);
  if(student) out = out.filter(a => a.student === student);
  res.json(out);
});

// get feedbacks filtered
app.get('/api/feedbacks', (req,res) => {
  const db = readDB();
  const { teacher, student, lesson } = req.query;
  let out = db.feedbacks.slice().reverse();
  if(teacher) out = out.filter(f => f.teacher===teacher);
  if(student) out = out.filter(f => f.student===student);
  if(lesson) out = out.filter(f => f.lesson===lesson);
  res.json(out);
});

// notifications for user (all notifications relevant)
// returns list with read flag
app.get('/api/notifications/:name', (req,res) => {
  const name = req.params.name;
  const db = readDB();
  const out = db.notifications.filter(n => n.to === 'students' || n.to === name);
  res.json(out);
});

// mark a single notification as read: { id, user }
app.post('/api/notifications/mark-read', (req,res) => {
  const { id, user } = req.body;
  if(!id || !user) return res.json({ error:'پارامتر ناقص' });
  const db = readDB();
  const idx = db.notifications.findIndex(n => n.id === id);
  if(idx !== -1) { db.notifications[idx].read = true; writeDB(db); }
  res.json({ ok:true });
});

// mark all notifications for a user as read
app.post('/api/notifications/mark-all-read', (req,res) => {
  const { user } = req.body;
  if(!user) return res.json({ error:'پارامتر ناقص' });
  const db = readDB();
  db.notifications.forEach(n => { if(n.to === 'students' || n.to === user) n.read = true; });
  writeDB(db);
  res.json({ ok:true });
});

// delete dynamic DB contents (keep users/passwords/books)
app.post('/api/delete-database', (req,res) => {
  const db = readDB();
  const keep = {
    users: db.users,
    books: db.books,
    sessions: {},
    assignments: [],
    feedbacks: [],
    notifications: []
  };
  writeDB(keep);
  res.json({ ok:true });
});

// state endpoint for polling
app.get('/api/state', (req,res) => {
  const db = readDB();
  res.json({
    sessions: db.sessions,
    assignments: db.assignments,
    feedbacks: db.feedbacks,
    notifications: db.notifications,
    books: db.books
  });
});

// serve uploads and public
app.use('/uploads', express.static(UPLOAD_DIR));
app.use('/', express.static(PUBLIC_DIR));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
