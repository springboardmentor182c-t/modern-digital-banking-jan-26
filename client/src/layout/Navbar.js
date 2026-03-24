import React from 'react';

function Navbar({ title = 'Dashboard' }) {
    return (
        <header className="navbar">
            <span className="navbar-title">{title}</span>
            <div className="navbar-right">
                {/* Search */}
                <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input type="text" placeholder="Search transactions..." />
                </div>

                {/* Notification bell */}
                <button className="notif-btn">
                    🔔
                    <span className="notif-badge">2</span>
                </button>

                {/* User avatar */}
                <div className="user-avatar">H</div>
            </div>
        </header>
    );
}

export default Navbar;
