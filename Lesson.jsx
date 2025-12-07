import React from "react";
import { useParams } from "react-router-dom";

const Lesson = () => {
  const { id } = useParams();
  return (
    <div>
      <header style={{ background:"#003c7a", color:"#fff", padding:15 }}>درس {id}</header>
      <div style={{ padding:20 }}>
        <h3>فایل‌های درسی</h3>
        <ul>
          <li><a href="#">کتاب PDF</a></li>
        </ul>
        <h3>تکالیف</h3>
        <ul>
          <li>تکلیف شماره ۱</li>
        </ul>
        <h3>کلاس آنلاین</h3>
        <a href="#" style={{ display:"inline-block", padding:12, background:"#0077cc", color:"#fff", borderRadius:8 }}>پیوستن به جلسه</a>
      </div>
    </div>
  );
};

export default Lesson;
