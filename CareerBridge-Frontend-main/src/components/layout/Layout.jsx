import React from 'react';
import Navbar from './Navbar';

export const Layout = ({ children, user, setUser }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar user={user} setUser={setUser} />
      <main className="flex-1 min-h-[calc(100vh-73px)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;
