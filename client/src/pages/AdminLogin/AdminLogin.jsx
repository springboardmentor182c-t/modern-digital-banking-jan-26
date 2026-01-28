import React, { useState } from "react";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("Email:", email);
    console.log("Password:", password);

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();
      console.log("Backend response:", data);

      if (response.ok) {
        alert("Login successful");
      } else {
        alert("Login failed");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
    }
  };

  return (
    <div>
      <h1>Admin Login</h1>

      <label>Email</label>
      <br />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <br /><br />

      <label>Password</label>
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default AdminLogin;
