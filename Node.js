// server.js
import { createServer } from 'node:http';
const server = createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello World!\n');
});
// starts a simple http server locally on port 3000
server.listen(3000, '127.0.0.1', () => {
  console.log('Listening on 127.0.0.1:3000');
});
// run with `node server.mj
const TEACHERS = ["آقای محمودی","آقای حسینی","آقای کریمی","آقای موسوی","آقای قاسمی","آقای کاظمی","آقای صادقی","آقای سلیمانی","آقای احمدی","آقای حسینی_2","آقای یوسفی","آقای نوری","آقای محمدی","آقای طاهری"];
const STUDENTS = ["امیر احمدی","محمد رضایی","علی کریمی","رضا موسوی","حسین قاسمی","سینا کاظمی","مهرداد صادقی","امید سلیمانی","نوید احمدی","آرش حسینی","شایان یوسفی","پارسا نوری","امیرحسین محمدی","کیان توسلی","مهدی طاهری","علی رضا زاده","سجاد کریمی","آرمان صادقی","احمد توسلی","امیرحسین جلیل جمشیدی"];

const MEETING_URL = "https://meet.jit.si/OurSchoolClassRoom"; // لینک ثابت همه درس‌ها

// شروع جلسه توسط معلم
app.post('/start-meeting', (req,res)=>{
    const {name} = req.body;
    if(!TEACHERS.includes(name)){
        return res.status(403).json({error:"فقط معلم‌ها می‌توانند جلسه را شروع کنند"});
    }
    res.json({meetingUrl: MEETING_URL, role: "moderator", name});
});

// ورود دانش‌آموز
app.post('/join-meeting', (req,res)=>{
    const {name} = req.body;
    if(!STUDENTS.includes(name)){
        return res.status(403).json({error:"فقط دانش‌آموزان می‌توانند وارد شوند"});
    }
    res.json({meetingUrl: MEETING_URL, role: "participant", name});
});

app.listen(3000, ()=>console.log("Server running on port 3000"));
