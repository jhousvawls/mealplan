import React from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-gray-50 min-h-screen font-sans text-gray-900 flex">
      <Sidebar />
      <main className="flex-1 ml-20 md:ml-64 mb-16 md:mb-0 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default Layout;
