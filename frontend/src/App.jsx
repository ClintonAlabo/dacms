import React from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import ProjectDetails from './pages/ProjectDetails';

export default function App(){
  const [token, setToken] = React.useState(null);
  const [page, setPage] = React.useState('login');
  if (!token && page === 'login') return <Login onAuth={(t)=>{ setToken(t); setPage('dashboard'); }} onSwitch={(p)=>setPage(p)} />;
  if (page === 'register') return <Register />;
  if (page === 'project') return <ProjectDetails projectId={1} token={token} />;
  return <Dashboard token={token} />;
}
