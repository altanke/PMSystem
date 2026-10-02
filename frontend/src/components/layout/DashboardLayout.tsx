import React from 'react';
import TopNavbar from './TopNavbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
            <TopNavbar />
            <main className="flex-1 overflow-y-auto w-full">
                {children}
            </main>
        </div>
    );
};

export default DashboardLayout;
