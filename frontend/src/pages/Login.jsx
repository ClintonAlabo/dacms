import React from 'react';
import axios from 'axios';

export default function Login({ onAuth, onSwitch }){
  const [email,setEmail]=React.useState('');
  const [password,setPassword]=React.useState('');
  async function submit(e){
    e.preventDefault();
    try{
      const res = await axios.post('/api/auth/login', { email, password });
      onAuth(res.data.token);
    }catch(err){
      alert(err.response?.data?.error || 'Login failed');
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-cyan-300">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Welcome Back!</h2>
        <form onSubmit={submit} className="space-y-4">
          <input className="w-full border-b py-2" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
          <input className="w-full border-b py-2" placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
          <button className="mt-4 w-full py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-400 text-white">Log in</button>
        </form>
        <p className="mt-4 text-sm">Don't have an account? <button onClick={()=>onSwitch && onSwitch('register')} className="text-blue-600">Create one</button></p>
      </div>
    </div>
  );
}
