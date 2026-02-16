import React from "react";
import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2 className="logo">VaultBank</h2>

      <ul className="menu">
        <li className="active">Admin Dashboard</li>
        <li>Users</li>
        <li>Transactions</li>
        <li>Reports</li>
        <li>Settings</li>
      </ul>

      <button className="logout-btn">Logout</button>
    </div>
  );
}

export default Sidebar;
