import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [nationalId, setNationalId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // TODO: اتصال به backend و احراز هویت
    if (nationalId && password) {
      navigate("/dashboard");
    }
  };

  return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"100vh" }}>
      <div style={{ padding:30, background:"#fff", borderRadius:10, boxShadow:"0 0 10px #ccc" }}>
        <h2>ورود به مدرسه هفتم ۳</h2>
        <input type="text" placeholder="کد ملی" value={nationalId} onChange={e => setNationalId(e.target.value)} />
        <input type="password" placeholder="رمز عبور" value={password} onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin}>ورود</button>
      </div>
    </div>
  );
};

export default Login;
