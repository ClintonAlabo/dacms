import React from 'react';
export default function Dashboard(){ 
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gradient-to-b from-indigo-700 to-cyan-400 text-white p-6">
        <h1 className="text-3xl font-serif">DACMS</h1>
        <nav className="mt-8 space-y-3">
          <div>Dashboard Overview</div>
          <div>User Management</div>
          <div>Committee Management</div>
          <div>Budget & Resource Oversight</div>
          <div>Project Monitoring</div>
        </nav>
      </aside>
      <main className="flex-1 p-8 bg-gray-50">
        <h2 className="text-3xl font-bold text-blue-600">DACMS Admin Dashboard</h2>
        <section className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">Total Registered Users<br/><strong>20</strong></div>
          <div className="bg-white p-4 rounded shadow">Active Committees<br/><strong>2</strong></div>
          <div className="bg-white p-4 rounded shadow">Pending Approval<br/><strong>6</strong></div>
          <div className="bg-white p-4 rounded shadow">Ongoing Projects<br/><strong>1</strong></div>
        </section>
        <section className="mt-6 bg-white p-4 rounded shadow">
          <h3 className="text-xl font-bold text-indigo-500">Projects</h3>
          <table className="w-full mt-4">
            <thead><tr><th>Project</th><th>Status</th><th>Committee</th><th>Start Date</th></tr></thead>
            <tbody>
              <tr><td>Project A</td><td className="text-green-600">Completed</td><td>Committee C</td><td>2025-09-23</td></tr>
              <tr><td>Project B</td><td className="text-yellow-600">Disputed</td><td>Committee D</td><td>2025-09-28</td></tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
