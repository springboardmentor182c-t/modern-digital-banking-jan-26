import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <input
        type="text"
        placeholder="Search transactions, accounts..."
        className="search"
      />

      <div className="profile">
        <span>John Doe</span>
        <div className="avatar">JD</div>
      </div>
    </div>
  );
}

export default Navbar;
