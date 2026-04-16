import React from 'react';

const Dashboard = () => {
return (
<div className="min-h-screen bg-[#05070A] text-white p-10">
<h1 className="text-4xl font-black text-blue-500 italic">DASHBOARD</h1>
<p className="mt-4 text-gray-400">Bienvenida al Panel Principal.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
            <div className="bg-[#0D1117] p-6 rounded-2xl border border-gray-800 border-l-4 border-l-blue-500 shadow-xl">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Torneos</h3>
                <p className="text-3xl font-black mt-2">12</p>
            </div>
            <div className="bg-[#0D1117] p-6 rounded-2xl border border-gray-800 border-l-4 border-l-cyan-500 shadow-xl">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Usuarios</h3>
                <p className="text-3xl font-black mt-2">154</p>
            </div>
            <div className="bg-[#0D1117] p-6 rounded-2xl border border-gray-800 border-l-4 border-l-purple-500 shadow-xl">
                <h3 className="text-gray-400 text-sm font-bold uppercase">Disciplinas</h3>
                <p className="text-3xl font-black mt-2">8</p>
            </div>
        </div>
    </div>
);
};

export default Dashboard;