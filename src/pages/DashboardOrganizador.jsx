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
        'En Curso': 'bg-[#7C2220] text-[#F4F1EE]',
        'Finalizado': 'bg-[#E8E4E1] text-[#A28C75]',
        'Cancelado': 'bg-[#5F2119]/10 text-[#5F2119]',
        'Pendiente': 'bg-[#D7C1A8]/50 text-[#7C2220]',
        'Aceptado': 'bg-[#7C2220]/10 text-[#7C2220]',
        'Rechazado': 'bg-[#5F2119]/10 text-[#5F2119]',
        'Individual': 'bg-[#D7C1A8]/40 text-[#7C2220]',
        'Equipo': 'bg-[#E8E4E1] text-[#5F2119]',
    };
    return (
        <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${map[estado] || 'bg-[#E8E4E1] text-[#A28C75]'}`}>
            {estado}
        </span>
    );
};

const iniciales = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const Sidebar = ({ activo, setActivo, usuario, onLogout }) => {
    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
        { id: 'torneos', label: 'Mis torneos', icon: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z' },
        { id: 'inscripciones', label: 'Inscripciones', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
        { id: 'posiciones', label: 'Posiciones', icon: 'M18 20V10M12 20V4M6 20v-6' },
    ];
    return (
        <aside className="w-56 bg-[#5F2119] flex flex-col min-h-screen shrink-0">
            <div className="px-6 py-8 border-b border-[#7C2220]">
                <h1 className="text-xl font-bold text-[#F4F1EE]">Match<span className="text-[#D7C1A8]">Control</span></h1>
                <div className="flex items-center gap-3 mt-5">
                    <div className="w-9 h-9 rounded-full bg-[#7C2220] flex items-center justify-center text-xs font-bold text-[#D7C1A8] shrink-0">
                        {iniciales(usuario?.nickname)}
                    </div>
                    <div>
                        <p className="text-[#F4F1EE] text-sm font-semibold leading-none">{usuario?.nickname || 'Organizador'}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F1EE]/10 text-[#D7C1A8] uppercase tracking-widest">Organizador</span>
                    </div>
                </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5">
                {items.map(item => (
                    <button key={item.id} onClick={() => setActivo(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all text-left ${activo === item.id ? 'bg-[#7C2220] text-[#F4F1EE]' : 'text-[#D7C1A8]/60 hover:bg-[#7C2220]/40 hover:text-[#F4F1EE]'}`}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={item.icon} /></svg>
                        {item.label}
                    </button>
                ))}
            </nav>
            <button onClick={onLogout} className="flex items-center gap-3 mx-3 mb-4 px-4 py-3 rounded-xl text-sm text-[#D7C1A8]/40 hover:bg-[#7C2220]/30 hover:text-[#D7C1A8] transition-all">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                Cerrar sesión
            </button>
        </aside>
    );
};

const VistaDashboard = ({ setActivo }) => {
    const [torneos, setTorneos] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [pendientes, setPendientes] = useState([]);

    useEffect(() => {
        fetch(`${API}/torneo`, { headers: getHeaders() }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
        fetch(`${API}/disciplina`, { headers: getHeaders() }).then(r => r.json()).then(d => setDisciplinas(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
        fetch(`${API}/participantes`, { headers: getHeaders() }).then(r => r.json())
            .then(d => { const l = Array.isArray(d) ? d : d?.data || []; setPendientes(l.filter(p => (p.Estado_Inscripcion || p.estado) === 'Pendiente')); }).catch(() => { });
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Panel del organizador</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Gestiona tus torneos y participantes</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[['Torneos', torneos.length, true], ['Inscripciones pendientes', pendientes.length, false], ['Disciplinas disponibles', disciplinas.length, false]].map(([label, value, accent]) => (
                    <div key={label} className={`rounded-2xl p-6 border ${accent ? 'bg-[#5F2119] border-[#7C2220]' : 'bg-white border-[#E8E4E1]'}`}>
                        <p className={`text-[11px] uppercase tracking-widest font-semibold mb-3 ${accent ? 'text-[#D7C1A8]/60' : 'text-[#A28C75]'}`}>{label}</p>
                        <p className={`text-4xl font-bold ${accent ? 'text-[#F4F1EE]' : 'text-[#5F2119]'}`}>{value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-5">
                <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#F4F1EE]">
                        <h3 className="text-sm font-bold text-[#5F2119] uppercase tracking-widest">Torneos recientes</h3>
                    </div>
                    <div className="divide-y divide-[#F4F1EE]">
                        {torneos.length === 0 && <p className="px-6 py-8 text-sm text-[#A28C75] text-center">Sin torneos</p>}
                        {torneos.slice(0, 5).map(t => (
                            <div key={t.Id_Torneo} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-[#5F2119] truncate max-w-[150px]">{t.Nombre}</p>
                                    <p className="text-xs text-[#A28C75] mt-0.5">{t.Formato}</p>
                                </div>
                                <Badge estado={t.Estado} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                    <div className="px-6 py-4 border-b border-[#F4F1EE] flex justify-between items-center">
                        <h3 className="text-sm font-bold text-[#5F2119] uppercase tracking-widest">Pendientes</h3>
                        {pendientes.length > 0 && (
                            <button onClick={() => setActivo('inscripciones')} className="text-xs font-bold text-[#7C2220] hover:underline">Ver todas →</button>
                        )}
                    </div>
                    <div className="divide-y divide-[#F4F1EE]">
                        {pendientes.length === 0 && (
                            <div className="px-6 py-8 text-center">
                                <p className="text-sm font-semibold text-[#5F2119]">Todo al día</p>
                                <p className="text-xs text-[#A28C75] mt-1">Sin inscripciones pendientes</p>
                            </div>
                        )}
                        {pendientes.slice(0, 5).map(p => (
                            <div key={p.Id_Participante || p.id} className="px-6 py-4 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#7C2220]/10 flex items-center justify-center text-xs font-bold text-[#7C2220] shrink-0">
                                    {iniciales(p.Nombre_En_Torneo || '?')}
                                </div>
                                <p className="flex-1 text-sm font-semibold text-[#5F2119] truncate">{p.Nombre_En_Torneo || '—'}</p>
                                <Badge estado="Pendiente" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const VistaTorneos = () => {
    const [torneos, setTorneos] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [mostrarForm, setMostrarForm] = useState(false);
    const [form, setForm] = useState({ Nombre: '', Id_Disciplina: '', Id_Organizacion: '', Formato: 'Eliminacion Directa', Max_Participantes: 16 });
    const usuario = getUser();

    const cargar = () => {
        fetch(`${API}/torneo`, { headers: getHeaders() }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    };
    useEffect(() => {
        cargar();
        fetch(`${API}/disciplina`, { headers: getHeaders() }).then(r => r.json()).then(d => setDisciplinas(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
        fetch(`${API}/organizacion`, { headers: getHeaders() }).then(r => r.json()).then(d => setOrgs(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    }, []);

    const cambiarEstado = async (id, estado) => {
        if (!estado) return;
        await fetch(`${API}/torneo/${id}/estado`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ estado }) }).catch(() => { });
        cargar();
    };

    const crearTorneo = async (e) => {
        e.preventDefault();
        await fetch(`${API}/torneo`, {
            method: 'POST', headers: getHeaders(),
            body: JSON.stringify({ ...form, Id_Creador: usuario?.id || 1, Max_Participantes: parseInt(form.Max_Participantes) }),
        }).catch(() => { });
        setMostrarForm(false);
        cargar();
    };

    const lista = filtro ? torneos.filter(t => t.Estado === filtro) : torneos;
    const inp = "w-full bg-[#F4F1EE] p-3.5 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75]";

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#5F2119]">Mis torneos</h1>
                    <p className="text-[#A28C75] text-sm mt-1.5">Crea y gestiona tus torneos</p>
                </div>
                <button onClick={() => setMostrarForm(!mostrarForm)}
                    className="bg-[#5F2119] text-[#D7C1A8] text-xs font-bold px-5 py-3 rounded-2xl hover:bg-[#7C2220] transition-colors uppercase tracking-widest">
                    {mostrarForm ? 'Cancelar' : '+ Nuevo torneo'}
                </button>
            </div>

            {mostrarForm && (
                <form onSubmit={crearTorneo} className="bg-white rounded-2xl p-6 border border-[#E8E4E1] mb-6 grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Nombre del torneo</label>
                        <input required value={form.Nombre} onChange={e => setForm({ ...form, Nombre: e.target.value })} className={inp} placeholder="Ej: Copa Primavera 2026" />
                    </div>
                    <div>
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Disciplina</label>
                        <select required value={form.Id_Disciplina} onChange={e => setForm({ ...form, Id_Disciplina: e.target.value })} className={inp}>
                            <option value="">Seleccionar...</option>
                            {disciplinas.map(d => <option key={d.Id_Disciplina} value={d.Id_Disciplina}>{d.Nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Organización</label>
                        <select required value={form.Id_Organizacion} onChange={e => setForm({ ...form, Id_Organizacion: e.target.value })} className={inp}>
                            <option value="">Seleccionar...</option>
                            {orgs.map(o => <option key={o.id || o.Id_Organizacion} value={o.id || o.Id_Organizacion}>{o.nombre || o.Nombre}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Formato</label>
                        <select value={form.Formato} onChange={e => setForm({ ...form, Formato: e.target.value })} className={inp}>
                            <option>Eliminacion Directa</option>
                            <option>Round Robin</option>
                            <option>Grupos</option>
                            <option>Suizo</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-[#A28C75] uppercase tracking-wider block mb-2">Máx. participantes</label>
                        <input type="number" min="2" value={form.Max_Participantes} onChange={e => setForm({ ...form, Max_Participantes: e.target.value })} className={inp} />
                    </div>
                    <div className="col-span-2">
                        <button type="submit" className="bg-[#5F2119] text-[#D7C1A8] text-xs font-bold px-6 py-3 rounded-2xl hover:bg-[#7C2220] transition-colors uppercase tracking-widest">
                            Crear torneo
                        </button>
                    </div>
                </form>
            )}

            <div className="flex gap-2 mb-5 flex-wrap">
                {['', 'Borrador', 'Inscripciones', 'En Curso', 'Finalizado'].map(f => (
                    <button key={f} onClick={() => setFiltro(f)}
                        className={`text-[11px] px-4 py-2 rounded-full font-bold transition-colors uppercase tracking-wider ${filtro === f ? 'bg-[#5F2119] text-[#D7C1A8]' : 'bg-white border border-[#E8E4E1] text-[#A28C75] hover:border-[#D7C1A8]'}`}>
                        {f || 'Todos'}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                <div className="divide-y divide-[#F4F1EE]">
                    {lista.length === 0 && <p className="px-6 py-10 text-sm text-[#A28C75] text-center">Sin torneos</p>}
                    {lista.map(t => (
                        <div key={t.Id_Torneo} className="px-6 py-4 flex items-center gap-5">
                            <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center shrink-0">
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="2"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-[#5F2119] truncate">{t.Nombre}</p>
                                <p className="text-xs text-[#A28C75] mt-0.5">{t.Formato} · {t.Max_Participantes} participantes</p>
                            </div>
                            <Badge estado={t.Estado} />
                            <select onChange={e => cambiarEstado(t.Id_Torneo, e.target.value)}
                                className="text-xs bg-[#F4F1EE] border-0 rounded-xl px-3 py-2 text-[#5F2119] outline-none font-semibold cursor-pointer">
                                <option value="">Cambiar estado...</option>
                                {['Inscripciones', 'En Curso', 'Finalizado', 'Cancelado'].map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VistaInscripciones = () => {
    const [participantes, setParticipantes] = useState([]);

    const cargar = () => {
        fetch(`${API}/participantes`, { headers: getHeaders() }).then(r => r.json())
            .then(d => setParticipantes(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    };
    useEffect(() => { cargar(); }, []);

    const actualizar = async (id, estado) => {
        await fetch(`${API}/participantes/${id}`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ Estado_Inscripcion: estado }) }).catch(() => { });
        cargar();
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Inscripciones</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Aprueba o rechaza participantes</p>
            </div>
            <div className="space-y-3">
                {participantes.length === 0 && (
                    <div className="bg-white rounded-2xl border border-[#E8E4E1] p-12 text-center">
                        <p className="text-sm font-bold text-[#5F2119]">Sin inscripciones</p>
                        <p className="text-xs text-[#A28C75] mt-1">Todavía no hay participantes registrados</p>
                    </div>
                )}
                {participantes.map(p => (
                    <div key={p.Id_Participante || p.id} className="bg-white rounded-2xl border border-[#E8E4E1] px-6 py-4 flex items-center gap-5">
                        <div className="w-10 h-10 rounded-full bg-[#7C2220]/10 flex items-center justify-center text-sm font-bold text-[#7C2220] shrink-0">
                            {iniciales(p.Nombre_En_Torneo || '?')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#5F2119]">{p.Nombre_En_Torneo || '—'}</p>
                            <p className="text-xs text-[#A28C75] mt-0.5">Torneo #{p.Id_Torneo || '—'}</p>
                        </div>
                        <Badge estado={p.Estado_Inscripcion || p.estado || 'Pendiente'} />
                        {(p.Estado_Inscripcion === 'Pendiente' || p.estado === 'Pendiente') && (
                            <div className="flex gap-2 shrink-0">
                                <button onClick={() => actualizar(p.Id_Participante || p.id, 'Aceptado')}
                                    className="px-4 py-2 rounded-xl bg-[#5F2119] text-[#D7C1A8] text-xs font-bold hover:bg-[#7C2220] transition-colors uppercase tracking-wider">
                                    Aprobar
                                </button>
                                <button onClick={() => actualizar(p.Id_Participante || p.id, 'Rechazado')}
                                    className="px-4 py-2 rounded-xl bg-[#E8E4E1] text-[#A28C75] text-xs font-bold hover:bg-[#D7C1A8]/40 transition-colors uppercase tracking-wider">
                                    Rechazar
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

const VistaPosiciones = () => {
    const [torneos, setTorneos] = useState([]);
    const [selTorneo, setSelTorneo] = useState('');
    const [posiciones, setPosiciones] = useState([]);

    useEffect(() => {
        fetch(`${API}/torneo`, { headers: getHeaders() }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    }, []);
    useEffect(() => {
        if (!selTorneo) return;
        fetch(`${API}/posiciones/torneo/${selTorneo}`, { headers: getHeaders() }).then(r => r.json())
            .then(d => setPosiciones(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    }, [selTorneo]);

    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Tabla de posiciones</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Clasificación por torneo</p>
            </div>
            <select value={selTorneo} onChange={e => setSelTorneo(e.target.value)}
                className="bg-white border border-[#E8E4E1] px-5 py-3 rounded-2xl outline-none text-sm text-[#5F2119] mb-5 min-w-[280px]">
                <option value="">— Seleccionar torneo —</option>
                {torneos.map(t => <option key={t.Id_Torneo} value={t.Id_Torneo}>{t.Nombre}</option>)}
            </select>

            {!selTorneo ? (
                <div className="bg-white rounded-2xl border border-[#E8E4E1] p-12 text-center">
                    <p className="text-sm text-[#A28C75]">Selecciona un torneo para ver la clasificación</p>
                </div>
            ) : posiciones.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E4E1] p-12 text-center">
                    <p className="text-sm text-[#A28C75]">Sin posiciones registradas aún</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {posiciones.map((p, i) => (
                        <div key={p.Id_Posicion} className={`rounded-2xl border px-6 py-4 flex items-center gap-5 ${i === 0 ? 'bg-[#5F2119] border-[#7C2220]' : 'bg-white border-[#E8E4E1]'}`}>
                            <span className="text-xl w-8 text-center shrink-0">{medals[i] || <span className="text-sm font-bold text-[#A28C75]">{i + 1}</span>}</span>
                            <p className={`flex-1 text-sm font-bold ${i === 0 ? 'text-[#F4F1EE]' : 'text-[#5F2119]'}`}>
                                {p.Participante || p.Nombre_En_Torneo || `#${p.Id_Participante}`}
                            </p>
                            {[['Pts', p.Puntos], ['PJ', p.Partidos_Jugados || p.PJ || 0], ['PG', p.Ganados || p.PG || 0], ['PE', p.Empatados || p.PE || 0], ['PP', p.Perdidos || p.PP || 0], ['Dif', p.Diferencia_Score ?? '—']].map(([l, v]) => (
                                <div key={l} className="text-center min-w-[36px]">
                                    <p className={`text-[10px] uppercase tracking-wider ${i === 0 ? 'text-[#D7C1A8]/60' : 'text-[#A28C75]'}`}>{l}</p>
                                    <p className={`text-sm font-bold mt-0.5 ${i === 0 ? 'text-[#D7C1A8]' : 'text-[#5F2119]'}`}>{v}</p>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DashboardOrganizador = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const usuario = getUser();
    const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); };
    const vistas = { dashboard: <VistaDashboard setActivo={setActivo} />, torneos: <VistaTorneos />, inscripciones: <VistaInscripciones />, posiciones: <VistaPosiciones /> };
    return (
        <div className="flex min-h-screen bg-[#F4F1EE]">
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} />
            <main className="flex-1 p-8 overflow-auto">{vistas[activo]}</main>
        </div>
    );
};
export default DashboardOrganizador;