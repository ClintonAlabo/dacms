import React from 'react';
import axios from 'axios';

export default function Register(){ 
  const [form,setForm]=React.useState({});
  const [step,setStep]=React.useState('form');
  const [userId,setUserId]=React.useState(null);
  const onChange=(k,v)=>setForm({...form,[k]:v});
  async function submit(e){ 
    e.preventDefault();
    try{ 
      const res = await axios.post('/api/auth/register', form);
      setUserId(res.data.user.id);
      setStep('otp');
    } catch(err){ alert(err.response?.data?.error || 'Error'); }
  }
  async function verify(e){
    e.preventDefault();
    try{
      const { data } = await axios.post('/api/auth/verify-otp', { user_id: userId, code: form.code });
      alert('Verified, you are logged in');
      // store token - for demo we'll just show token in alert
      console.log('token', data.token);
    }catch(err){ alert(err.response?.data?.error || 'OTP verify failed'); }
  }
  if (step === 'otp') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-cyan-300">
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
          <form onSubmit={verify} className="space-y-4">
            <input className="w-full border-b py-2" placeholder="6-digit code" value={form.code||''} onChange={e=>onChange('code', e.target.value)} />
            <button className="mt-4 w-full py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-400 text-white">Verify</button>
          </form>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-600 to-cyan-300">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-4 text-center">DACMS Registration form</h2>
        <form onSubmit={submit} className="space-y-3">
          <input placeholder="Full Name" onChange={e=>onChange('full_name', e.target.value)} className="w-full border-b py-2"/>
          <div className="flex gap-2">
            <input placeholder="Gender" onChange={e=>onChange('gender', e.target.value)} className="flex-1 border-b py-2"/>
            <input placeholder="Date of Birth (YYYY-MM-DD)" onChange={e=>onChange('dob', e.target.value)} className="flex-1 border-b py-2"/>
          </div>
          <input placeholder="Government ID Number" onChange={e=>onChange('gov_id', e.target.value)} className="w-full border-b py-2"/>
          <input placeholder="Email" onChange={e=>onChange('email', e.target.value)} className="w-full border-b py-2"/>
          <input placeholder="Password" type="password" onChange={e=>onChange('password', e.target.value)} className="w-full border-b py-2"/>
          <div className="text-right"><button className="px-4 py-2 rounded bg-gradient-to-r from-indigo-500 to-purple-400 text-white">Next</button></div>
        </form>
      </div>
    </div>
  );
}
