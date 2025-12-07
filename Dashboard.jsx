import React from "react";
import { useNavigate } from "react-router-dom";

const subjects = [
  "عربی", "ریاضی", "فارسی", "مطالعات اجتماعی", "دینی",
  "قرآن", "کار و فناوری", "تفکر", "زیست", "فیزیک", "شیمی", "هنر"
];

const Dashboard = () => {
  const navigate = useNavigate();
  return (
    <div>
      <header style={{ background:"#004aad", color:"#fff", padding:15 }}>سلام دانش‌آموز عزیز 👋</header>
      <div style={{ padding:20 }}>
        <h3>درس‌های پایه هفتم</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:15 }}>
          {subjects.map((s, i) => (
            <div key={i} onClick={()=>navigate(`/lesson/${i+1}`)}
              style={{ padding:20, background:"#fff", borderRadius:10, boxShadow:"0 0 5px #bbb", textAlign:"center", cursor:"pointer" }}>
              {s}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
