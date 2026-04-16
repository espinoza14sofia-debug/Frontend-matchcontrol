import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3000';
const getUser = () => { try { return JSON.parse(localStorage.getItem('usuario')) || {}; } catch { return {}; } };
const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    'admin-sofi': 'mcsofi',
});

const Badge = ({ estado }) => {
    const map = {
        'Borrador': 'bg-[#E8E4E1] text-[#5F2119]',
        'Inscripciones': 'bg-[#D7C1A8]/40 text-[#7C2220]',
        'En Curso': 'bg-[#7C2220]/10 text-[#7C2220] font-semibold',
        'Finalizado': 'bg-[#E8E4E1] text-[#A28C75]',
        'Cancelado': 'bg-[#5F2119]/10 text-[#5F2119]',
        'Pendiente': 'bg-[#D7C1A8]/50 text-[#7C2220]',
        'Aprobado': 'bg-[#7C2220]/10 text-[#7C2220]',
        'Rechazado': 'bg-[#5F2119]/10 text-[#5F2119]',
        'Admin': 'bg-[#5F2119] text-[#F4F1EE]',
        'Organizador': 'bg-[#7C2220]/20 text-[#5F2119]',
        'Arbitro': 'bg-[#D7C1A8]/60 text-[#5F2119]',
        'Participante': 'bg-[#E8E4E1] text-[#A28C75]',
        'Activo': 'bg-[#7C2220]/10 text-[#7C2220]',
        'Inactivo': 'bg-[#5F2119]/10 text-[#5F2119]',
    };
    return (
        <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${map[estado] || 'bg-[#E8E4E1] text-[#A28C75]'}`}>
            {estado}
        </span>
    );
};

const Sidebar = ({ activo, setActivo, usuario, onLogout }) => {
    const items = [
        { id: 'dashboard', label: 'Inicio', icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
        { id: 'usuarios', label: 'Usuarios', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
        { id: 'solicitudes', label: 'Solicitudes de Rol', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
        { id: 'organizaciones', label: 'Organizaciones', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
        { id: 'auditoria', label: 'Auditoría', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
    ];
    const iniciales = (n) => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
    return (
        <aside className="w-56 bg-[#5F2119] flex flex-col min-h-screen shrink-0">
            <div className="px-6 py-8 border-b border-[#7C2220]">
                <h1 className="text-xl font-bold text-[#F4F1EE]">
                    Match<span className="text-[#D7C1A8]">Control</span>
                </h1>
                <div className="flex items-center gap-3 mt-5">
                    <div className="w-9 h-9 rounded-full bg-[#7C2220] flex items-center justify-center text-xs font-bold text-[#D7C1A8] shrink-0">
                        {iniciales(usuario?.nickname || usuario?.nombreCompleto)}
                    </div>
                    <div>
                        <p className="text-[#F4F1EE] text-sm font-semibold leading-none">{usuario?.nickname || 'Admin'}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F1EE]/10 text-[#D7C1A8] uppercase tracking-widest">
                            Admin
                        </span>
                    </div>
                </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActivo(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left
                            ${activo === item.id
                                ? 'bg-[#7C2220] text-[#F4F1EE]'
                                : 'text-[#D7C1A8]/60 hover:bg-[#7C2220]/40 hover:text-[#F4F1EE]'
                            }`}
                    >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon} />
                        </svg>
                        {item.label}
                    </button>
                ))}
            </nav>
            <button
                onClick={onLogout}
                className="flex items-center gap-3 mx-3 mb-4 px-4 py-3 rounded-xl text-sm text-[#D7C1A8]/40 hover:bg-[#7C2220]/30 hover:text-[#D7C1A8] transition-all"
            >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
                Cerrar sesión
            </button>
        </aside>
    );
};

const MetricCard = ({ label, value, sub, accent }) => (
    <div className={`rounded-2xl p-6 border ${accent ? 'bg-[#5F2119] border-[#7C2220]' : 'bg-white border-[#E8E4E1]'}`}>
        <p className={`text-[11px] uppercase tracking-widest font-semibold mb-3 ${accent ? 'text-[#D7C1A8]/60' : 'text-[#A28C75]'}`}>{label}</p>
        <p className={`text-4xl font-bold ${accent ? 'text-[#F4F1EE]' : 'text-[#5F2119]'}`}>{value ?? '—'}</p>
        {sub && <p className={`text-xs mt-2 ${accent ? 'text-[#D7C1A8]/50' : 'text-[#A28C75]'}`}>{sub}</p>}
    </div>
);

const VistaDashboard = () => {
    const [torneos, setTorneos] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [sanciones, setSanciones] = useState([]);
    const [auditoria, setAuditoria] = useState([]);

    useEffect(() => {
        fetch(`${API}/torneo`, { headers: getHeaders() }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
        fetch(`${API}/solicitudes/pendientes`, { headers: getHeaders() }).then(r => r.json()).then(d => setSolicitudes(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
        fetch(`${API}/sanciones`, { headers: getHeaders() }).then(r => r.json()).then(d => setSanciones(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
        fetch(`${API}/auditoria`, { headers: getHeaders() }).then(r => r.json()).then(d => setAuditoria(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    }, []);

    const activos = torneos.filter(t => t.Estado === 'En Curso' || t.Estado === 'Inscripciones');

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Panel de administración</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Visión general del sistema MatchControl</p>
            </div>

            <div className="grid grid-cols-4 gap-4 mb-8">
                <MetricCard label="Torneos activos" value={activos.length} sub="En curso e inscripciones" accent />
                <MetricCard label="Total torneos" value={torneos.length} sub="En el sistema" />
                <MetricCard label="Solicitudes pendientes" value={solicitudes.length} sub="Esperando revisión" />
                <MetricCard label="Sanciones" value={sanciones.length} sub="Registradas" />
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#F4F1EE]">
                        <h3 className="text-sm font-bold text-[#5F2119] uppercase tracking-widest">Torneos recientes</h3>
                    </div>
                    <div className="divide-y divide-[#F4F1EE]">
                        {torneos.length === 0 && <p className="px-6 py-8 text-sm text-[#A28C75] text-center">Sin torneos registrados</p>}
                        {torneos.slice(0, 5).map(t => (
                            <div key={t.Id_Torneo} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-[#5F2119] truncate max-w-[160px]">{t.Nombre}</p>
                                    <p className="text-xs text-[#A28C75] mt-0.5">{t.Formato}</p>
                                </div>
                                <Badge estado={t.Estado} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#F4F1EE]">
                        <h3 className="text-sm font-bold text-[#5F2119] uppercase tracking-widest">Actividad reciente</h3>
                    </div>
                    <div className="divide-y divide-[#F4F1EE]">
                        {auditoria.length === 0 && <p className="px-6 py-8 text-sm text-[#A28C75] text-center">Sin registros de auditoría</p>}
                        {auditoria.slice(0, 5).map(a => (
                            <div key={a.Id_Auditoria} className="px-6 py-4 flex items-start gap-4">
                                <div className="w-7 h-7 rounded-lg bg-[#F4F1EE] flex items-center justify-center shrink-0 mt-0.5">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="2"><path d="M12 6v6l4 2" /><circle cx="12" cy="12" r="10" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[#5F2119]">
                                        {a.Accion} <span className="font-normal text-[#A28C75]">en {a.Tabla}</span>
                                    </p>
                                    {a.Valores_Nuevos && <p className="text-xs text-[#A28C75] mt-0.5 truncate">{a.Valores_Nuevos}</p>}
                                    <p className="text-[11px] text-[#D7C1A8] mt-1">
                                        {a.Fecha ? new Date(a.Fecha).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const VistaSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);

    const cargar = () => {
        fetch(`${API}/solicitudes/pendientes`, { headers: getHeaders() })
            .then(r => r.json()).then(d => setSolicitudes(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    };
    useEffect(() => { cargar(); }, []);

    const decidir = async (id, estado) => {
        await fetch(`${API}/solicitudes/decidir/${id}`, {
            method: 'PATCH', headers: getHeaders(),
            body: JSON.stringify({ estado }),
        }).catch(() => { });
        cargar();
    };

    const iniciales = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Solicitudes de rol</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Aprueba o rechaza cambios de rol solicitados</p>
            </div>

            {solicitudes.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E4E1] p-16 text-center">
                    <div className="w-14 h-14 bg-[#F4F1EE] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="1.5"><path d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 1.946-.806 3.42 3.42 0 0 1 4.438 0 3.42 3.42 0 0 0 1.946.806 3.42 3.42 0 0 1 3.138 3.138 3.42 3.42 0 0 0 .806 1.946 3.42 3.42 0 0 1 0 4.438 3.42 3.42 0 0 0-.806 1.946 3.42 3.42 0 0 1-3.138 3.138 3.42 3.42 0 0 0-1.946.806 3.42 3.42 0 0 1-4.438 0 3.42 3.42 0 0 0-1.946-.806 3.42 3.42 0 0 1-3.138-3.138 3.42 3.42 0 0 0-.806-1.946 3.42 3.42 0 0 1 0-4.438 3.42 3.42 0 0 0 .806-1.946 3.42 3.42 0 0 1 3.138-3.138z" /></svg>
                    </div>
                    <p className="text-base font-bold text-[#5F2119]">Todo al día</p>
                    <p className="text-sm text-[#A28C75] mt-1">No hay solicitudes pendientes</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {solicitudes.map(s => (
                        <div key={s.Id_Solicitud} className="bg-white rounded-2xl border border-[#E8E4E1] px-6 py-5 flex items-center gap-5">
                            <div className="w-11 h-11 rounded-full bg-[#7C2220]/10 flex items-center justify-center text-sm font-bold text-[#7C2220] shrink-0">
                                {iniciales(s.usuario?.nickname || s.usuario?.Nickname || '?')}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#5F2119]">
                                    {s.usuario?.nickname || s.usuario?.Nickname || `Usuario #${s.Id_Usuario}`}
                                </p>
                                <p className="text-xs text-[#A28C75] mt-0.5 truncate">{s.Motivo || 'Sin motivo especificado'}</p>
                                <p className="text-[11px] text-[#D7C1A8] mt-1">{s.Fecha_Creacion ? new Date(s.Fecha_Creacion).toLocaleDateString('es') : '—'}</p>
                            </div>
                            <Badge estado={s.Rol_Solicitado === 2 ? 'Organizador' : 'Arbitro'} />
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => decidir(s.Id_Solicitud, 'Aprobado')}
                                    className="px-4 py-2 rounded-xl bg-[#5F2119] text-[#D7C1A8] text-xs font-bold hover:bg-[#7C2220] transition-colors uppercase tracking-wider">
                                    Aprobar
                                </button>
                                <button onClick={() => decidir(s.Id_Solicitud, 'Rechazado')}
                                    className="px-4 py-2 rounded-xl bg-[#E8E4E1] text-[#A28C75] text-xs font-bold hover:bg-[#D7C1A8]/40 transition-colors uppercase tracking-wider">
                                    Rechazar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const VistaAuditoria = () => {
    const [logs, setLogs] = useState([]);
    useEffect(() => {
        fetch(`${API}/auditoria`, { headers: getHeaders() })
            .then(r => r.json()).then(d => setLogs(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    }, []);

    const accionColor = { INSERT: 'bg-[#7C2220]/10 text-[#7C2220]', UPDATE: 'bg-[#D7C1A8]/60 text-[#5F2119]', DELETE: 'bg-[#5F2119]/10 text-[#5F2119]' };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Log de auditoría</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">{logs.length} acciones registradas en el sistema</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                <div className="divide-y divide-[#F4F1EE]">
                    {logs.length === 0 && <p className="px-6 py-10 text-sm text-[#A28C75] text-center">Sin registros</p>}
                    {logs.map(a => (
                        <div key={a.Id_Auditoria} className="px-6 py-4 flex items-center gap-4">
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0 ${accionColor[a.Accion] || 'bg-[#E8E4E1] text-[#A28C75]'}`}>
                                {a.Accion}
                            </span>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[#5F2119]">
                                    Tabla: <span className="text-[#7C2220]">{a.Tabla}</span>
                                </p>
                                {a.Valores_Nuevos && <p className="text-xs text-[#A28C75] mt-0.5 truncate">{a.Valores_Nuevos}</p>}
                            </div>
                            <p className="text-xs text-[#A28C75] shrink-0">
                                {a.Fecha ? new Date(a.Fecha).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VistaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');

    const cargar = () => {
        fetch(`${API}/usuarios`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setUsuarios(Array.isArray(d) ? d : d?.data || []))
            .catch(() => { });
    };
    useEffect(() => { cargar(); }, []);

    const eliminar = async (id) => {
        if (!window.confirm('¿Desactivar este usuario?')) return;
        await fetch(`${API}/usuarios/${id}`, { method: 'DELETE', headers: getHeaders() }).catch(() => { });
        cargar();
    };

    const iniciales = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';
    const lista = busqueda
        ? usuarios.filter(u => (u.Nombre_Completo || u.nombreCompleto || '').toLowerCase().includes(busqueda.toLowerCase()) || (u.Nickname || u.nickname || '').toLowerCase().includes(busqueda.toLowerCase()))
        : usuarios;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#5F2119]">Usuarios</h1>
                    <p className="text-[#A28C75] text-sm mt-1.5">{usuarios.length} usuarios activos en el sistema</p>
                </div>
                <input
                    type="text"
                    placeholder="Buscar por nombre o nickname..."
                    value={busqueda}
                    onChange={e => setBusqueda(e.target.value)}
                    className="bg-white border border-[#E8E4E1] px-4 py-2.5 rounded-2xl text-sm text-[#5F2119] placeholder-[#A28C75] outline-none w-64"
                />
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                <div className="divide-y divide-[#F4F1EE]">
                    {lista.length === 0 && <p className="px-6 py-10 text-sm text-[#A28C75] text-center">Sin usuarios</p>}
                    {lista.map(u => {
                        const nombre = u.Nombre_Completo || u.nombreCompleto || '—';
                        const nickname = u.Nickname || u.nickname || '—';
                        const rol = u.Rol || u.rol?.nombre || '—';
                        const email = u.Email || u.email || '—';
                        const id = u.Id_Usuario || u.id;
                        return (
                            <div key={id} className="px-6 py-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#7C2220]/10 flex items-center justify-center text-sm font-bold text-[#7C2220] shrink-0">
                                    {iniciales(nombre)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#5F2119] truncate">{nombre}</p>
                                    <p className="text-xs text-[#A28C75] mt-0.5">@{nickname} · {email}</p>
                                </div>
                                <Badge estado={rol} />
                                <button onClick={() => eliminar(id)}
                                    className="px-3 py-1.5 rounded-xl bg-[#F4F1EE] text-[#A28C75] text-xs font-bold hover:bg-[#5F2119]/10 hover:text-[#5F2119] transition-colors uppercase tracking-wider">
                                    Desactivar
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const VistaOrganizaciones = () => {
    const [orgs, setOrgs] = useState([]);
    const [mostrarForm, setMostrarForm] = useState(false);
    const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
    const [editId, setEditId] = useState(null);

    const cargar = () => {
        fetch(`${API}/organizacion`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setOrgs(Array.isArray(d) ? d : d?.data || []))
            .catch(() => { });
    };
    useEffect(() => { cargar(); }, []);

    const guardar = async (e) => {
        e.preventDefault();
        const method = editId ? 'PUT' : 'POST';
        const url = editId ? `${API}/organizacion/${editId}` : `${API}/organizacion`;
        await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(form) }).catch(() => { });
        setMostrarForm(false); setEditId(null); setForm({ nombre: '', email: '', telefono: '' });
        cargar();
    };

    const editar = (org) => {
        setEditId(org.Id_Organizacion || org.id);
        setForm({ nombre: org.Nombre || org.nombre || '', email: org.Email || org.email || '', telefono: org.Telefono || org.telefono || '' });
        setMostrarForm(true);
    };

    const eliminar = async (id) => {
        if (!window.confirm('¿Desactivar esta organización?')) return;
        await fetch(`${API}/organizacion/${id}`, { method: 'DELETE', headers: getHeaders() }).catch(() => { });
        cargar();
    };

    const inp = 'w-full bg-[#F4F1EE] p-3.5 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75]';

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#5F2119]">Organizaciones</h1>
                    <p className="text-[#A28C75] text-sm mt-1.5">{orgs.length} organizaciones registradas</p>
                </div>
                <button onClick={() => { setMostrarForm(!mostrarForm); setEditId(null); setForm({ nombre: '', email: '', telefono: '' }); }}
                    className="bg-[#5F2119] text-[#D7C1A8] text-xs font-bold px-5 py-3 rounded-2xl hover:bg-[#7C2220] transition-colors uppercase tracking-widest">
                    {mostrarForm ? 'Cancelar' : '+ Nueva organización'}
                </button>
            </div>

            {mostrarForm && (
                <form onSubmit={guardar} className="bg-white rounded-2xl p-6 border border-[#E8E4E1] mb-6 grid grid-cols-3 gap-4">
                    <div>
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Nombre *</label>
                        <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} className={inp} placeholder="Nombre de la organización" />
                    </div>
                    <div>
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inp} placeholder="contacto@org.com" />
                    </div>
                    <div>
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Teléfono</label>
                        <input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} className={inp} placeholder="+506 0000-0000" />
                    </div>
                    <div className="col-span-3">
                        <button type="submit" className="bg-[#5F2119] text-[#D7C1A8] text-xs font-bold px-6 py-3 rounded-2xl hover:bg-[#7C2220] transition-colors uppercase tracking-widest">
                            {editId ? 'Actualizar' : 'Crear organización'}
                        </button>
                    </div>
                </form>
            )}

            <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                <div className="divide-y divide-[#F4F1EE]">
                    {orgs.length === 0 && <p className="px-6 py-10 text-sm text-[#A28C75] text-center">Sin organizaciones registradas</p>}
                    {orgs.map(o => {
                        const id = o.Id_Organizacion || o.id;
                        const nombre = o.Nombre || o.nombre || '—';
                        const email = o.Email || o.email || '—';
                        const telefono = o.Telefono || o.telefono || '—';
                        return (
                            <div key={id} className="px-6 py-4 flex items-center gap-5">
                                <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center shrink-0">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[#5F2119] truncate">{nombre}</p>
                                    <p className="text-xs text-[#A28C75] mt-0.5">{email} · {telefono}</p>
                                </div>
                                <Badge estado="Activo" />
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => editar(o)} className="px-3 py-1.5 rounded-xl bg-[#F4F1EE] text-[#7C2220] text-xs font-bold hover:bg-[#D7C1A8]/30 transition-colors uppercase tracking-wider">Editar</button>
                                    <button onClick={() => eliminar(id)} className="px-3 py-1.5 rounded-xl bg-[#F4F1EE] text-[#A28C75] text-xs font-bold hover:bg-[#5F2119]/10 hover:text-[#5F2119] transition-colors uppercase tracking-wider">Desactivar</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const DashboardAdmin = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const usuario = getUser();

    const onLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/');
    };

    const vistas = {
        dashboard: <VistaDashboard />,
        solicitudes: <VistaSolicitudes />,
        auditoria: <VistaAuditoria />,
        usuarios: <VistaUsuarios />,
        organizaciones: <VistaOrganizaciones />,
    };

    return (
        <div className="flex min-h-screen bg-[#F4F1EE]">
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} />
            <main className="flex-1 p-8 overflow-auto">
                {vistas[activo]}
            </main>
        </div>
    );
};

export default DashboardAdmin;