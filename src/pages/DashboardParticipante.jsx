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
        'Capitán': 'bg-[#5F2119] text-[#F4F1EE]',
    };
    return <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${map[estado] || 'bg-[#E8E4E1] text-[#A28C75]'}`}>{estado}</span>;
};

const iniciales = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const Sidebar = ({ activo, setActivo, usuario, onLogout, notifCount }) => {
    const items = [
        { id: 'dashboard', label: 'Inicio' },
        { id: 'torneos', label: 'Torneos disponibles' },
        { id: 'misequipos', label: 'Mi equipo' },
        { id: 'notificaciones', label: 'Notificaciones' },
        { id: 'solicitud', label: 'Solicitar rol' },
    ];
    return (
        <aside className="w-56 bg-[#5F2119] flex flex-col min-h-screen shrink-0">
            <div className="px-6 py-8 border-b border-[#7C2220]">
                <h1 className="text-xl font-bold text-[#F4F1EE]">Match<span className="text-[#D7C1A8]">Control</span></h1>
                <div className="flex items-center gap-3 mt-5">
                    <div className="w-9 h-9 rounded-full bg-[#7C2220] flex items-center justify-center text-xs font-bold text-[#D7C1A8] shrink-0">
                        {iniciales(usuario?.nickname || usuario?.nombreCompleto)}
                    </div>
                    <div>
                        <p className="text-[#F4F1EE] text-sm font-semibold leading-none">{usuario?.nickname || 'Jugador'}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F1EE]/10 text-[#D7C1A8] uppercase tracking-widest">Participante</span>
                    </div>
                </div>
            </div>
            <nav className="flex-1 py-4 px-3 space-y-0.5">
                {items.map(item => (
                    <button key={item.id} onClick={() => setActivo(item.id)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all text-left ${activo === item.id ? 'bg-[#7C2220] text-[#F4F1EE]' : 'text-[#D7C1A8]/60 hover:bg-[#7C2220]/40 hover:text-[#F4F1EE]'}`}>
                        <span>{item.label}</span>
                        {item.id === 'notificaciones' && notifCount > 0 && (
                            <span className="bg-[#F4F1EE] text-[#5F2119] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                                {notifCount > 9 ? '9+' : notifCount}
                            </span>
                        )}
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

const VistaDashboard = ({ setActivo, notifCount }) => {
    const [torneos, setTorneos] = useState([]);
    const [misInscr, setMisInscr] = useState([]);
    const usuario = getUser();

    useEffect(() => {
        fetch(`${API}/torneo`, { headers: getHeaders() }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
        if (usuario?.id) {
            fetch(`${API}/participantes`, { headers: getHeaders() }).then(r => r.json())
                .then(d => { const l = Array.isArray(d) ? d : d?.data || []; setMisInscr(l.filter(p => p.Id_Usuario === usuario.id)); }).catch(() => { });
        }
    }, []);

    const abiertos = torneos.filter(t => t.Estado === 'Inscripciones');

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Hola, {usuario?.nickname || 'jugador'} 👋</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Tu espacio en MatchControl</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-[#5F2119] rounded-2xl p-6 border border-[#7C2220]">
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-[#D7C1A8]/60 mb-3">Torneos abiertos</p>
                    <p className="text-4xl font-bold text-[#F4F1EE]">{abiertos.length}</p>
                    <button onClick={() => setActivo('torneos')} className="text-xs text-[#D7C1A8]/60 mt-2 hover:text-[#D7C1A8] font-bold uppercase tracking-wider transition-colors">
                        Inscribirme →
                    </button>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-[#E8E4E1]">
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-[#A28C75] mb-3">Mis inscripciones</p>
                    <p className="text-4xl font-bold text-[#5F2119]">{misInscr.length}</p>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-[#E8E4E1]">
                    <p className="text-[11px] uppercase tracking-widest font-semibold text-[#A28C75] mb-3">Notificaciones nuevas</p>
                    <p className="text-4xl font-bold text-[#5F2119]">{notifCount}</p>
                    {notifCount > 0 && (
                        <button onClick={() => setActivo('notificaciones')} className="text-xs text-[#7C2220] mt-2 font-bold hover:underline uppercase tracking-wider">
                            Ver →
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                <div className="px-6 py-4 border-b border-[#F4F1EE] flex justify-between items-center">
                    <h3 className="text-sm font-bold text-[#5F2119] uppercase tracking-widest">Torneos disponibles</h3>
                    <button onClick={() => setActivo('torneos')} className="text-xs font-bold text-[#7C2220] hover:underline">Ver todos →</button>
                </div>
                <div className="divide-y divide-[#F4F1EE]">
                    {torneos.length === 0 && <p className="px-6 py-8 text-sm text-[#A28C75] text-center">Sin torneos disponibles</p>}
                    {torneos.slice(0, 5).map(t => (
                        <div key={t.Id_Torneo} className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-[#5F2119] truncate max-w-[180px]">{t.Nombre}</p>
                                <p className="text-xs text-[#A28C75] mt-0.5">{t.Formato} · {t.Max_Participantes} participantes</p>
                            </div>
                            <Badge estado={t.Estado} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const VistaTorneos = () => {
    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(false);
    const usuario = getUser();

    useEffect(() => {
        fetch(`${API}/torneo`, { headers: getHeaders() }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    }, []);

    const inscribirse = async (torneo) => {
        if (!usuario?.id) { alert('Debes iniciar sesión'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/participantes`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({ Id_Torneo: torneo.Id_Torneo, Id_Usuario: usuario.id, Nombre_En_Torneo: usuario.nickname, Estado_Inscripcion: 'Pendiente' }),
            });
            if (!res.ok) throw new Error();
            alert(`¡Inscripción enviada en "${torneo.Nombre}"!\nEspera la aprobación del organizador.`);
        } catch { alert('Error al inscribirse'); }
        finally { setLoading(false); }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Torneos disponibles</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Inscríbete en torneos abiertos</p>
            </div>
            <div className="space-y-3">
                {torneos.length === 0 && (
                    <div className="bg-white rounded-2xl border border-[#E8E4E1] p-12 text-center">
                        <p className="text-sm text-[#A28C75]">Sin torneos disponibles por ahora</p>
                    </div>
                )}
                {torneos.map(t => (
                    <div key={t.Id_Torneo} className="bg-white rounded-2xl border border-[#E8E4E1] px-6 py-4 flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-[#F4F1EE] flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="2"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#5F2119] truncate">{t.Nombre}</p>
                            <p className="text-xs text-[#A28C75] mt-0.5">{t.Formato} · máx. {t.Max_Participantes} participantes</p>
                        </div>
                        <Badge estado={t.Estado} />
                        <button disabled={t.Estado !== 'Inscripciones' || loading} onClick={() => inscribirse(t)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shrink-0
                                ${t.Estado === 'Inscripciones'
                                    ? 'bg-[#5F2119] text-[#D7C1A8] hover:bg-[#7C2220]'
                                    : 'bg-[#E8E4E1] text-[#A28C75] cursor-not-allowed'}`}>
                            {t.Estado === 'Inscripciones' ? 'Inscribirse' : t.Estado}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VistaEquipo = () => {
    const [miEquipo, setMiEquipo] = useState(null);
    const [miembros, setMiembros] = useState([]);
    const [loading, setLoading] = useState(true);
    const usuario = getUser();

    useEffect(() => {
        if (!usuario?.id) { setLoading(false); return; }
        // Buscar todos los equipos y ver en cuál está el usuario como jugador
        fetch(`${API}/equipo-jugadores`, { headers: getHeaders() })
            .then(r => r.json())
            .then(async d => {
                const todos = Array.isArray(d) ? d : [];
                const miRel = todos.find(ej => (ej.Id_Usuario || ej.id_usuario) === usuario.id);
                if (!miRel) { setLoading(false); return; }
                const idEquipo = miRel.Id_Equipo || miRel.id_equipo;
                // Obtener info del equipo
                const eqRes = await fetch(`${API}/equipos/${idEquipo}`, { headers: getHeaders() });
                const eq = await eqRes.json();
                setMiEquipo(eq);
                // Obtener miembros vía SP
                const mRes = await fetch(`${API}/equipo-jugadores/equipo/${idEquipo}`, { headers: getHeaders() });
                const mData = await mRes.json();
                setMiembros(Array.isArray(mData) ? mData : mData?.data || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <p className="text-sm text-[#A28C75]">Cargando equipo...</p>
        </div>
    );

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Mi equipo</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">
                    {miEquipo ? (miEquipo.Nombre || '—') : 'Sin equipo asignado'}
                </p>
            </div>
            {!miEquipo ? (
                <div className="bg-white rounded-2xl border border-[#E8E4E1] p-16 text-center">
                    <div className="w-14 h-14 bg-[#F4F1EE] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>
                    </div>
                    <p className="text-base font-bold text-[#5F2119]">Sin equipo</p>
                    <p className="text-sm text-[#A28C75] mt-1">No perteneces a ningún equipo todavía</p>
                </div>
            ) : (
                <>
                    {/* Info del equipo */}
                    <div className="bg-[#5F2119] rounded-2xl p-6 border border-[#7C2220] mb-5 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-xl bg-[#7C2220] flex items-center justify-center text-base font-black text-[#D7C1A8] shrink-0">
                            {(miEquipo.Siglas || (miEquipo.Nombre || '?').slice(0, 2)).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-lg font-bold text-[#F4F1EE]">{miEquipo.Nombre}</p>
                            <p className="text-xs text-[#D7C1A8]/60 mt-0.5">Capitán: {miEquipo.Capitan || miEquipo.capitan || '—'}</p>
                        </div>
                    </div>
                    {/* Miembros */}
                    <div className="space-y-2">
                        {miembros.map((m, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-[#E8E4E1] px-6 py-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-[#7C2220]/10 flex items-center justify-center text-sm font-bold text-[#7C2220] shrink-0">
                                    {iniciales(m.Nombre_Completo || m.Nickname)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[#5F2119]">{m.Nombre_Completo || '—'}</p>
                                    <p className="text-xs text-[#A28C75] mt-0.5">@{m.Nickname || ''}</p>
                                </div>
                                {m.Es_Capitan === 1 && <Badge estado="Capitán" />}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

const VistaNotificaciones = ({ onRefreshCount }) => {
    const [notifs, setNotifs] = useState([]);
    const usuario = getUser();

    const cargar = () => {
        if (!usuario?.id) return;
        fetch(`${API}/notificaciones/usuario/${usuario.id}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => {
                const l = Array.isArray(d) ? d : d?.data || [];
                setNotifs(l);
                if (onRefreshCount) onRefreshCount(l.filter(n => !n.Leido).length);
            }).catch(() => { });
    };
    useEffect(() => { cargar(); }, []);

    const marcarLeida = async (id) => {
        await fetch(`${API}/notificaciones/leer/${id}`, { method: 'PATCH', headers: getHeaders() }).catch(() => { });
        cargar();
    };
    const marcarTodas = async () => {
        await Promise.all(notifs.filter(n => !n.Leido).map(n =>
            fetch(`${API}/notificaciones/leer/${n.Id_Notificacion}`, { method: 'PATCH', headers: getHeaders() })
        ));
        cargar();
    };

    const noLeidas = notifs.filter(n => !n.Leido).length;

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-[#5F2119]">Notificaciones</h1>
                    <p className="text-[#A28C75] text-sm mt-1.5">{noLeidas} sin leer</p>
                </div>
                {noLeidas > 0 && (
                    <button onClick={marcarTodas}
                        className="text-xs font-bold text-[#7C2220] border border-[#D7C1A8] px-4 py-2.5 rounded-2xl hover:bg-[#D7C1A8]/20 transition-colors uppercase tracking-wider">
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            {notifs.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E4E1] p-16 text-center">
                    <div className="w-14 h-14 bg-[#F4F1EE] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="1.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>
                    </div>
                    <p className="text-base font-bold text-[#5F2119]">Sin notificaciones</p>
                    <p className="text-sm text-[#A28C75] mt-1">Estás al día</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {notifs.map(n => (
                        <div key={n.Id_Notificacion}
                            className={`rounded-2xl border px-6 py-4 flex items-start gap-4 transition-opacity
                                ${!n.Leido ? 'bg-white border-[#D7C1A8]' : 'bg-[#F4F1EE] border-[#E8E4E1] opacity-50'}`}>
                            <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${!n.Leido ? 'bg-[#7C2220]' : 'bg-[#D7C1A8]'}`} />
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!n.Leido ? 'font-bold text-[#5F2119]' : 'font-medium text-[#A28C75]'}`}>{n.Titulo}</p>
                                <p className="text-xs text-[#A28C75] mt-0.5">{n.Mensaje}</p>
                                <p className="text-[11px] text-[#D7C1A8] mt-1.5">
                                    {n.Fecha_Envio ? new Date(n.Fecha_Envio).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}
                                </p>
                            </div>
                            {!n.Leido && (
                                <button onClick={() => marcarLeida(n.Id_Notificacion)}
                                    className="text-xs font-bold text-[#7C2220] hover:underline shrink-0 uppercase tracking-wider">
                                    Leído
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const VistaSolicitudRol = () => {
    const [rol, setRol] = useState('');
    const [motivo, setMotivo] = useState('');
    const [status, setStatus] = useState({ msg: '', ok: null });
    const usuario = getUser();

    const enviar = async (e) => {
        e.preventDefault();
        if (!rol) { setStatus({ msg: 'Selecciona un rol primero', ok: false }); return; }
        try {
            const res = await fetch(`${API}/solicitudes/pedir`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({ Id_Usuario: usuario?.id, Rol_Solicitado: parseInt(rol), Motivo: motivo || null, Estado: 'Pendiente' }),
            });
            if (!res.ok) throw new Error();
            setStatus({ msg: '¡Solicitud enviada! El administrador la revisará pronto.', ok: true });
            setRol(''); setMotivo('');
        } catch { setStatus({ msg: 'Error al enviar. Intenta de nuevo.', ok: false }); }
    };

    const inp = "w-full bg-[#F4F1EE] p-4 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75]";

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Solicitar cambio de rol</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Pide ser Organizador o Árbitro. El Admin decidirá.</p>
            </div>
            <div className="bg-white rounded-2xl border border-[#E8E4E1] p-7 max-w-md">
                <form onSubmit={enviar} className="space-y-5">
                    <div>
                        <label className="text-xs font-bold text-[#A28C75] uppercase tracking-wider block mb-2">¿Qué rol deseas?</label>
                        <select value={rol} onChange={e => setRol(e.target.value)} className={inp}>
                            <option value="">Seleccionar...</option>
                            <option value="2">🏆 Organizador — crea y gestiona torneos</option>
                            <option value="3">⚖️ Árbitro — registra resultados en vivo</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-[#A28C75] uppercase tracking-wider block mb-2">Motivo (opcional)</label>
                        <textarea value={motivo} onChange={e => setMotivo(e.target.value)} rows={3}
                            placeholder="Cuéntanos por qué quieres este rol..."
                            className={`${inp} resize-none`} />
                    </div>
                    {status.msg && (
                        <div className={`p-4 rounded-2xl text-sm font-semibold ${status.ok ? 'bg-[#7C2220]/10 text-[#7C2220]' : 'bg-[#5F2119]/10 text-[#5F2119]'}`}>
                            {status.msg}
                        </div>
                    )}
                    <button type="submit"
                        className="w-full bg-[#5F2119] text-[#D7C1A8] py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-[#7C2220] transition-colors">
                        Enviar solicitud
                    </button>
                </form>
            </div>
        </div>
    );
};

const DashboardParticipante = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const [notifCount, setNotifCount] = useState(0);
    const usuario = getUser();

    useEffect(() => {
        if (usuario?.id) {
            fetch(`${API}/notificaciones/usuario/${usuario.id}`, { headers: getHeaders() })
                .then(r => r.json())
                .then(d => { const l = Array.isArray(d) ? d : d?.data || []; setNotifCount(l.filter(n => !n.Leido).length); })
                .catch(() => { });
        }
    }, []);

    const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); };

    const vistas = {
        dashboard: <VistaDashboard setActivo={setActivo} notifCount={notifCount} />,
        torneos: <VistaTorneos />,
        misequipos: <VistaEquipo />,
        notificaciones: <VistaNotificaciones onRefreshCount={setNotifCount} />,
        solicitud: <VistaSolicitudRol />,
    };

    return (
        <div className="flex min-h-screen bg-[#F4F1EE]">
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} notifCount={notifCount} />
            <main className="flex-1 p-8 overflow-auto">{vistas[activo]}</main>
        </div>
    );
};
export default DashboardParticipante;