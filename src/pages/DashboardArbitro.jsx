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
    const map = { 'Programado': 'bg-[#E8E4E1] text-[#A28C75]', 'En Juego': 'bg-[#7C2220] text-[#F4F1EE]', 'Finalizado': 'bg-[#7C2220]/10 text-[#7C2220]', 'Postpuesto': 'bg-[#5F2119]/10 text-[#5F2119]' };
    return <span className={`inline-block text-[10px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide ${map[estado] || 'bg-[#E8E4E1] text-[#A28C75]'}`}>{estado}</span>;
};

const iniciales = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const Sidebar = ({ activo, setActivo, usuario, onLogout }) => {
    const items = [
        { id: 'dashboard', label: 'Mis partidos', icon: 'M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z' },
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
                        <p className="text-[#F4F1EE] text-sm font-semibold leading-none">{usuario?.nickname || 'Árbitro'}</p>
                        <span className="inline-block mt-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F4F1EE]/10 text-[#D7C1A8] uppercase tracking-widest">Árbitro</span>
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

const MatchCard = ({ match, onActualizar }) => {
    const [p1, setP1] = useState('');
    const [p2, setP2] = useState('');
    const [sets, setSets] = useState([]);
    const [participantes, setParticipantes] = useState([]);
    const [guardando, setGuardando] = useState(false);

    useEffect(() => {
        fetch(`${API}/match-participantes/match/${match.Id_Match}`, { headers: getHeaders() })
            .then(r => r.json()).then(d => setParticipantes(Array.isArray(d) ? d : [])).catch(() => { });
        fetch(`${API}/match-set/match/${match.Id_Match}`, { headers: getHeaders() })
            .then(r => r.json()).then(d => setSets(Array.isArray(d) ? d : [])).catch(() => { });
    }, [match.Id_Match]);

    const lado1 = participantes.find(p => p.Lado === 1);
    const lado2 = participantes.find(p => p.Lado === 2);

    const cambiarEstado = async (estado) => {
        await fetch(`${API}/matches/${match.Id_Match}`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ Estado: estado }) }).catch(() => { });
        onActualizar();
    };

    const guardar = async () => {
        if (!lado1 || !lado2) { alert('No hay participantes asignados a este partido'); return; }
        setGuardando(true);
        const s1 = parseInt(p1) || 0;
        const s2 = parseInt(p2) || 0;
        try {
            await fetch(`${API}/match-participantes/${match.Id_Match}/${lado1.Id_Participante}`, {
                method: 'PATCH', headers: getHeaders(),
                body: JSON.stringify({ Score_Final: s1, Es_Ganador: s1 > s2 ? 1 : 0 }),
            });
            await fetch(`${API}/match-participantes/${match.Id_Match}/${lado2.Id_Participante}`, {
                method: 'PATCH', headers: getHeaders(),
                body: JSON.stringify({ Score_Final: s2, Es_Ganador: s2 > s1 ? 1 : 0 }),
            });
            for (let i = 0; i < sets.length; i++) {
                const s = sets[i];
                if (s._nuevo) {
                    await fetch(`${API}/match-set`, {
                        method: 'POST', headers: getHeaders(),
                        body: JSON.stringify({ Id_Match: match.Id_Match, Numero_Set: i + 1, Mapa_Modo: s.Mapa_Modo || `Set ${i + 1}`, Puntaje_Lado1: s.Puntaje_Lado1 || 0, Puntaje_Lado2: s.Puntaje_Lado2 || 0, Id_Ganador_Set: (s.Puntaje_Lado1 || 0) > (s.Puntaje_Lado2 || 0) ? (lado1?.Id_Participante || null) : (lado2?.Id_Participante || null) }),
                    }).catch(() => { });
                }
            }
            onActualizar();
        } catch { alert('Error al guardar el resultado'); }
        finally { setGuardando(false); }
    };

    const agregarSet = () => setSets(prev => [...prev, { _nuevo: true, Numero_Set: prev.length + 1, Mapa_Modo: '', Puntaje_Lado1: 0, Puntaje_Lado2: 0 }]);
    const updateSet = (i, campo, val) => setSets(prev => prev.map((s, idx) => idx === i ? { ...s, [campo]: val } : s));

    return (
        <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden mb-4">
            {/* Cabecera del partido */}
            <div className="px-6 py-3.5 bg-[#F4F1EE] flex items-center justify-between">
                <p className="text-xs font-bold text-[#A28C75] uppercase tracking-wider">
                    Partido #{match.Id_Match} · Fase {match.Id_Fase}
                </p>
                <div className="flex items-center gap-3">
                    <Badge estado={match.Estado} />
                    {match.Ubicacion && <span className="text-xs text-[#A28C75]">📍 {match.Ubicacion}</span>}
                </div>
            </div>

            <div className="px-6 py-6">
                {/* Marcador VS */}
                <div className="flex items-center gap-8 mb-6">
                    <div className="flex-1 text-center">
                        <div className="w-10 h-10 rounded-full bg-[#F4F1EE] flex items-center justify-center text-sm font-bold text-[#5F2119] mx-auto mb-2">
                            {iniciales(lado1?.Nombre_En_Torneo || 'L1')}
                        </div>
                        <p className="text-sm font-bold text-[#5F2119] mb-3 truncate">{lado1?.Nombre_En_Torneo || 'Lado 1'}</p>
                        <input type="number" min="0" value={p1} onChange={e => setP1(e.target.value)} placeholder="0"
                            className="w-20 text-center bg-[#F4F1EE] rounded-2xl py-3 text-2xl font-bold text-[#5F2119] outline-none mx-auto block" />
                    </div>
                    <div className="text-center shrink-0">
                        <p className="text-2xl font-black text-[#E8E4E1]">VS</p>
                    </div>
                    <div className="flex-1 text-center">
                        <div className="w-10 h-10 rounded-full bg-[#F4F1EE] flex items-center justify-center text-sm font-bold text-[#5F2119] mx-auto mb-2">
                            {iniciales(lado2?.Nombre_En_Torneo || 'L2')}
                        </div>
                        <p className="text-sm font-bold text-[#5F2119] mb-3 truncate">{lado2?.Nombre_En_Torneo || 'Lado 2'}</p>
                        <input type="number" min="0" value={p2} onChange={e => setP2(e.target.value)} placeholder="0"
                            className="w-20 text-center bg-[#F4F1EE] rounded-2xl py-3 text-2xl font-bold text-[#5F2119] outline-none mx-auto block" />
                    </div>
                </div>

                {/* Sets */}
                <div className="border-t border-[#F4F1EE] pt-5 mb-5">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-xs font-bold text-[#A28C75] uppercase tracking-wider">Sets / mapas</p>
                        <button onClick={agregarSet} className="text-xs font-bold text-[#7C2220] hover:underline uppercase tracking-wider">+ Agregar set</button>
                    </div>
                    <div className="space-y-2">
                        {sets.map((s, i) => (
                            <div key={i} className="flex items-center gap-3 bg-[#F4F1EE] rounded-xl px-4 py-2.5">
                                <span className="text-xs font-bold text-[#A28C75] w-12 shrink-0">Set {i + 1}</span>
                                <input type="number" min="0" value={s.Puntaje_Lado1} onChange={e => updateSet(i, 'Puntaje_Lado1', parseInt(e.target.value) || 0)}
                                    className="w-12 text-center bg-white rounded-lg py-1.5 text-sm font-bold text-[#5F2119] outline-none" />
                                <span className="text-[#D7C1A8] font-bold">–</span>
                                <input type="number" min="0" value={s.Puntaje_Lado2} onChange={e => updateSet(i, 'Puntaje_Lado2', parseInt(e.target.value) || 0)}
                                    className="w-12 text-center bg-white rounded-lg py-1.5 text-sm font-bold text-[#5F2119] outline-none" />
                                <input type="text" placeholder="Mapa / modo..." value={s.Mapa_Modo} onChange={e => updateSet(i, 'Mapa_Modo', e.target.value)}
                                    className="flex-1 bg-white rounded-lg py-1.5 px-3 text-sm text-[#5F2119] outline-none placeholder-[#A28C75]" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Acciones */}
                <div className="flex gap-3 flex-wrap">
                    {match.Estado === 'Programado' && (
                        <button onClick={() => cambiarEstado('En Juego')}
                            className="px-5 py-2.5 rounded-xl border-2 border-[#D7C1A8] text-[#7C2220] text-xs font-bold hover:bg-[#D7C1A8]/20 transition-colors uppercase tracking-wider">
                            ▶ Iniciar partido
                        </button>
                    )}
                    <button onClick={guardar} disabled={guardando}
                        className="px-5 py-2.5 rounded-xl bg-[#5F2119] text-[#D7C1A8] text-xs font-bold hover:bg-[#7C2220] transition-colors uppercase tracking-wider disabled:opacity-50">
                        {guardando ? 'Guardando...' : 'Guardar resultado'}
                    </button>
                    {match.Estado === 'En Juego' && (
                        <button onClick={() => cambiarEstado('Finalizado')}
                            className="px-5 py-2.5 rounded-xl border border-[#E8E4E1] text-[#A28C75] text-xs font-bold hover:bg-[#E8E4E1] transition-colors uppercase tracking-wider">
                            ✓ Finalizar
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const VistaPartidos = () => {
    const [matches, setMatches] = useState([]);
    const cargar = () => {
        fetch(`${API}/matches`, { headers: getHeaders() }).then(r => r.json())
            .then(d => setMatches(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    };
    useEffect(() => { cargar(); }, []);

    const activos = matches.filter(m => m.Estado === 'En Juego' || m.Estado === 'Programado');
    const finalizados = matches.filter(m => m.Estado === 'Finalizado');

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Mis partidos asignados</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Registra resultados en tiempo real</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[['Programados', matches.filter(m => m.Estado === 'Programado').length, false],
                ['En juego', matches.filter(m => m.Estado === 'En Juego').length, true],
                ['Finalizados', finalizados.length, false]
                ].map(([label, value, accent]) => (
                    <div key={label} className={`rounded-2xl p-6 border ${accent ? 'bg-[#5F2119] border-[#7C2220]' : 'bg-white border-[#E8E4E1]'}`}>
                        <p className={`text-[11px] uppercase tracking-widest font-semibold mb-3 ${accent ? 'text-[#D7C1A8]/60' : 'text-[#A28C75]'}`}>{label}</p>
                        <p className={`text-4xl font-bold ${accent ? 'text-[#F4F1EE]' : 'text-[#5F2119]'}`}>{value}</p>
                    </div>
                ))}
            </div>

            {activos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[#E8E4E1] p-16 text-center mb-5">
                    <div className="w-14 h-14 bg-[#F4F1EE] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#A28C75" strokeWidth="1.5"><path d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" /></svg>
                    </div>
                    <p className="text-base font-bold text-[#5F2119]">Sin partidos activos</p>
                    <p className="text-sm text-[#A28C75] mt-1">Los partidos asignados a ti aparecerán aquí</p>
                </div>
            ) : (
                <>
                    <p className="text-xs font-bold text-[#A28C75] uppercase tracking-widest mb-4">Partidos activos</p>
                    {activos.map(m => <MatchCard key={m.Id_Match} match={m} onActualizar={cargar} />)}
                </>
            )}

            {finalizados.length > 0 && (
                <>
                    <p className="text-xs font-bold text-[#A28C75] uppercase tracking-widest mb-4 mt-6">Finalizados</p>
                    <div className="bg-white rounded-2xl border border-[#E8E4E1] overflow-hidden">
                        <div className="divide-y divide-[#F4F1EE]">
                            {finalizados.map(m => (
                                <div key={m.Id_Match} className="px-6 py-4 flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-[#F4F1EE] flex items-center justify-center text-xs font-bold text-[#A28C75] shrink-0">
                                        #{m.Id_Match}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-[#5F2119]">Fase {m.Id_Fase}</p>
                                        <p className="text-xs text-[#A28C75] mt-0.5">{m.Ubicacion || 'Sin ubicación'}</p>
                                    </div>
                                    <Badge estado={m.Estado} />
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
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
        fetch(`${API}/posiciones/torneo/${selTorneo}`, { headers: getHeaders() }).then(r => r.json()).then(d => setPosiciones(Array.isArray(d) ? d : d?.data || [])).catch(() => { });
    }, [selTorneo]);

    const medals = ['🥇', '🥈', '🥉'];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-[#5F2119]">Tabla de posiciones</h1>
                <p className="text-[#A28C75] text-sm mt-1.5">Solo lectura</p>
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
                            <p className={`flex-1 text-sm font-bold ${i === 0 ? 'text-[#F4F1EE]' : 'text-[#5F2119]'}`}>{p.Participante || `#${p.Id_Participante}`}</p>
                            {[['Pts', p.Puntos], ['PG', p.Ganados || p.PG || 0], ['PP', p.Perdidos || p.PP || 0]].map(([l, v]) => (
                                <div key={l} className="text-center min-w-[40px]">
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

const DashboardArbitro = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const usuario = getUser();
    const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); };
    return (
        <div className="flex min-h-screen bg-[#F4F1EE]">
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} />
            <main className="flex-1 p-8 overflow-auto">
                {activo === 'dashboard' ? <VistaPartidos /> : <VistaPosiciones />}
            </main>
        </div>
    );
};
export default DashboardArbitro;