import React from 'react';

const navItems = [
    { label: 'Dashboard', icon: '⊞', key: 'dashboard' },
    { label: 'Accounts', icon: '🏦', key: 'accounts' },
    { label: 'Transactions', icon: '↔', key: 'transactions' },
    { label: 'Budgets', icon: '◎', key: 'budgets' },
    { label: 'Bills & Reminders', icon: '📋', key: 'bills' },
    { label: 'Rewards', icon: '★', key: 'rewards' },
    { label: 'Insights & Alerts', icon: '↗', key: 'insights' },
];

function Sidebar({ active = 'dashboard' }) {
    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-icon">S</div>
                <span className="sidebar-logo-text">SmartBank</span>
            </div>

            {/* User */}
            <div className="sidebar-user">
                <div className="sidebar-avatar">H</div>
                <div className="sidebar-user-info">
                    <div className="sidebar-user-name">Heera</div>
                    <div className="sidebar-user-email">heera@example.com</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                {navItems.map(item => (
                    <div
                        key={item.key}
                        className={`sidebar-nav-item${active === item.key ? ' active' : ''}`}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </nav>

            {/* Bottom */}
            <div className="sidebar-bottom">
                <div className="sidebar-nav-item">
                    <span>⚙</span>
                    <span>Settings</span>
                </div>
                <div className="sidebar-nav-item sidebar-logout">
                    <span>↩</span>
                    <span>Logout</span>
                </div>
            </div>
        </aside>
    );
}

export default Sidebar;
