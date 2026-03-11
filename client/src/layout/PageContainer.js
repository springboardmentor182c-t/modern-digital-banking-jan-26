import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

function PageContainer({ children, activePage }) {
    return (
        <div className="app-shell">
            <Sidebar active={activePage} />
            <div className="main-area">
                <Navbar />
                <main className="page-content">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default PageContainer;
