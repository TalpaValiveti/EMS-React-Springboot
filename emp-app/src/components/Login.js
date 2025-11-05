import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8080/api/login", {
        username: username.trim(),
        password: password.trim(),
      });

      if (res.data.error) {
        setMessage(res.data.error);
        return;
      }

      const role = res.data.role;
      const empid = res.data.empid;

      if (role === "Admin") navigate("/admin");
      else if (role === "HR") navigate("/hr");
      else if (role === "Employee") navigate(`/employee/${empid}`);
      else setMessage("Role not allowed to access dashboard");
    } catch (err) {
      console.error(err);
      setMessage("Login failed. Check credentials.");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontFamily: "Arial, sans-serif", backgroundColor: "#f0f2f5" }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: "#fff", padding: "40px", borderRadius: "8px", boxShadow: "0 4px 8px rgba(0,0,0,0.1)", width: "300px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>Login</h2>
        <input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "5px", border: "1px solid #ccc" }} />
        <input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "10px", marginBottom: "20px", borderRadius: "5px", border: "1px solid #ccc" }} />
        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#1976d2", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" }}>Login</button>
        {message && <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>{message}</p>}
      </form>
    </div>
  );
}

export default Login;
