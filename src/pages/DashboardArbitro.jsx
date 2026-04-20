import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, getUser, getHeaders, Badge, Sidebar, Card, CardHeader, MetricCard, Btn, Input, Select, PageHeader, EmptyState, Row } from './shared.jsx';

const ITEMS = [
    { id: 'dashboard', label: 'Inicio', icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
    { id: 'matches', label: 'Mis Partidos', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { id: 'sanciones', label: 'Sanciones', icon: 'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
];

/* ── Dashboard ── */
const VistaDashboard = () => {
    const [matches, setMatches] = useState([]);
    const [sanciones, setSanciones] = useState([]);

    useEffect(() => {
        const h = getHeaders();
        fetch(`${API}/matches`, { headers: h })
            .then(r => r.json())
            .then(d => {
                const all = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
                setMatches(all);
            }).catch(() => { });
        fetch(`${API}/sancion`, { headers: h })
            .then(r => r.json())
            .then(d => setSanciones(Array.isArray(d) ? d : d?.data || []))
            .catch(() => { });
    }, []);

    const enJuego = matches.filter(m => m.Estado === 'En Juego');
    const programados = matches.filter(m => m.Estado === 'Programado');

    return (
        <>
            <PageHeader title="Panel del Árbitro" subtitle="Gestión de partidos y disciplina" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                <MetricCard label="Partidos activos" value={enJuego.length} accent />
                <MetricCard label="Programados" value={programados.length} />
                <MetricCard label="Total asignados" value={matches.length} />
                <MetricCard label="Sanciones emitidas" value={sanciones.length} />
            </div>
            <Card>
                <CardHeader title="Partidos asignados" />
                {matches.length === 0 ? <EmptyState msg="Sin partidos asignados" /> : matches.slice(0, 8).map(m => (
                    <Row key={m.Id_Match}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: '#332E2B' }}>Partido #{m.Id_Match}</p>
                            <p style={{ fontSize: '11px', color: '#AD9D8D' }}>
                                {m.Ubicacion || 'Sin ubicación'} · {m.Fecha_Hora ? new Date(m.Fecha_Hora).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha'}
                            </p>
                        </div>
                        <Badge estado={m.Estado} />
                    </Row>
                ))}
            </Card>
        </>
    );
};
/* ── Mis Partidos ── */

const VistaMatches = () => {
    const [matches, setMatches] = useState([]);
    const [sets, setSets] = useState({});
    const [expandido, setExpandido] = useState(null);
    const [formRes, setFormRes] = useState({});
    const [formSet, setFormSet] = useState({});
    const [error, setError] = useState('');

    const cargar = () => {
        fetch(`${API}/matches`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => {
                const all = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];
                setMatches(all);
            }).catch(() => { });
    };

    useEffect(() => { cargar(); }, []);

    const cargarSets = async id => {
        const res = await fetch(`${API}/match-set/match/${id}`, { headers: getHeaders() });
        const d = await res.json();
        setSets(prev => ({ ...prev, [id]: Array.isArray(d) ? d : [] }));
    };

    const toggleExpand = id => {
        if (expandido === id) { setExpandido(null); return; }
        setExpandido(id);
        cargarSets(id);
    };

    const registrarResultado = async id => {
        setError('');
        const f = formRes[id] || {};
        try {
            const res = await fetch(`${API}/matches/${id}/resultado`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    IdP1: Number(f.id_ganador) || null,
                    Score1: Number(f.score1) || 0,
                    IdP2: null,
                    Score2: Number(f.score2) || 0,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al registrar'); }
            cargar();
        } catch (err) { setError(err.message); }
    };

    const agregarSet = async id => {
        setError('');
        const f = formSet[id] || {};
        try {
            const matchSets = sets[id] || [];
            const res = await fetch(`${API}/match-set`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Match: id,
                    Numero_Set: matchSets.length + 1,
                    Mapa_Modo: f.mapa || null,
                    Puntaje_Lado1: Number(f.p1) || 0,
                    Puntaje_Lado2: Number(f.p2) || 0,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
            setFormSet(prev => ({ ...prev, [id]: { mapa: '', p1: '', p2: '' } }));
            cargarSets(id);
        } catch (err) { setError(err.message); }
    };

    const C = { black: '#332E2B', wine: '#72393F', taupe: '#AD9D8D', sand: '#D0C8BD', cream: '#F0E9E3', silver: '#D9D9D9' };
    const inp = { width: '100%', background: C.cream, border: `1px solid ${C.sand}`, borderRadius: 10, padding: '10px 14px', fontSize: 13, color: C.black, outline: 'none', boxSizing: 'border-box' };
    const Field = ({ label, children }) => <div><label style={{ display: 'block', fontSize: 10, fontWeight: 700, color: C.taupe, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</label>{children}</div>;

    return (
        <>
            <PageHeader title="Mis partidos" subtitle="Registra resultados y detalle técnico" />
            {matches.length === 0 ? (
                <Card><EmptyState msg="Sin partidos asignados" /></Card>
            ) : matches.map(m => (
                <Card key={m.Id_Match} style={{ marginBottom: '12px' }}>
                    <div onClick={() => toggleExpand(m.Id_Match)}
                        style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: C.black }}>
                                Partido #{m.Id_Match}
                                {m.Torneo && <span style={{ fontSize: '11px', fontWeight: 400, color: C.taupe, marginLeft: '8px' }}>· {m.Torneo}</span>}
                            </p>
                            <p style={{ fontSize: '11px', color: C.taupe }}>
                                {m.Fase || ''}{m.Grupo ? ` · ${m.Grupo}` : ''} · {m.Ubicacion || 'Sin ubicación'} · {m.Fecha_Hora ? new Date(m.Fecha_Hora).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha'}
                            </p>
                        </div>
                        <Badge estado={m.Estado} />
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={C.taupe} strokeWidth="2"
                            style={{ transform: expandido === m.Id_Match ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                            <path d="M6 9l6 6 6-6" />
                        </svg>
                    </div>

                    {expandido === m.Id_Match && (
                        <div style={{ borderTop: `1px solid ${C.silver}`, padding: '16px 20px' }}>
                            {error && <p style={{ fontSize: '11px', color: C.wine, marginBottom: '12px' }}>{error}</p>}

                            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.taupe, marginBottom: '10px' }}>Registrar resultado</p>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', marginBottom: '16px', alignItems: 'flex-end' }}>
                                <Field label="ID Ganador"><input style={inp} type="number" value={(formRes[m.Id_Match] || {}).id_ganador || ''} onChange={e => setFormRes(prev => ({ ...prev, [m.Id_Match]: { ...(prev[m.Id_Match] || {}), id_ganador: e.target.value } }))} placeholder="Id_Participante" /></Field>
                                <Field label="Score Lado 1"><input style={inp} type="number" value={(formRes[m.Id_Match] || {}).score1 || ''} onChange={e => setFormRes(prev => ({ ...prev, [m.Id_Match]: { ...(prev[m.Id_Match] || {}), score1: e.target.value } }))} placeholder="0" /></Field>
                                <Field label="Score Lado 2"><input style={inp} type="number" value={(formRes[m.Id_Match] || {}).score2 || ''} onChange={e => setFormRes(prev => ({ ...prev, [m.Id_Match]: { ...(prev[m.Id_Match] || {}), score2: e.target.value } }))} placeholder="0" /></Field>
                                <Btn small variant="wine" onClick={() => registrarResultado(m.Id_Match)}>Guardar</Btn>
                            </div>

                            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: C.taupe, marginBottom: '10px' }}>Sets / Mapas</p>
                            {(sets[m.Id_Match] || []).length > 0 && (
                                <div style={{ marginBottom: '10px' }}>
                                    {(sets[m.Id_Match] || []).map(s => (
                                        <div key={s.Id_Set} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '6px 0', borderBottom: `1px solid ${C.silver}`, fontSize: '12px', color: C.black }}>
                                            <span style={{ color: C.taupe, minWidth: '50px' }}>Set {s.Numero_Set}</span>
                                            <span>{s.Mapa_Modo || '—'}</span>
                                            <span style={{ marginLeft: 'auto', fontWeight: 500 }}>{s.Puntaje_Lado1} – {s.Puntaje_Lado2}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '10px', alignItems: 'flex-end' }}>
                                <Field label="Mapa / Modo"><input style={inp} value={(formSet[m.Id_Match] || {}).mapa || ''} onChange={e => setFormSet(prev => ({ ...prev, [m.Id_Match]: { ...(prev[m.Id_Match] || {}), mapa: e.target.value } }))} placeholder="Ej: Mirage / Tiempo 1" /></Field>
                                <Field label="P. Lado 1"><input style={inp} type="number" value={(formSet[m.Id_Match] || {}).p1 || ''} onChange={e => setFormSet(prev => ({ ...prev, [m.Id_Match]: { ...(prev[m.Id_Match] || {}), p1: e.target.value } }))} placeholder="0" /></Field>
                                <Field label="P. Lado 2"><input style={inp} type="number" value={(formSet[m.Id_Match] || {}).p2 || ''} onChange={e => setFormSet(prev => ({ ...prev, [m.Id_Match]: { ...(prev[m.Id_Match] || {}), p2: e.target.value } }))} placeholder="0" /></Field>
                                <Btn small onClick={() => agregarSet(m.Id_Match)}>+ Set</Btn>
                            </div>
                        </div>
                    )}
                </Card>
            ))}
        </>
    );
};
/* ── Sanciones ── */
const VistaSanciones = () => {
    const [sanciones, setSanciones] = useState([]);
    const [participantes, setParticipantes] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const [jugadoresEquipo, setJugadoresEquipo] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [form, setForm] = useState({
        id_torneo: '',
        id_participante: '',
        id_usuario: '',
        tipo: 'Advertencia',
        motivo: ''
    });
    const [error, setError] = useState('');

    const cargar = () => {
        const h = getHeaders();
        fetch(`${API}/sanciones`, { headers: h })
            .then(r => r.json())
            .then(d => setSanciones(Array.isArray(d) ? d : []))
            .catch(() => { });
        fetch(`${API}/participantes`, { headers: h })
            .then(r => r.json())
            .then(d => setParticipantes(Array.isArray(d) ? d : []))
            .catch(() => { });
        fetch(`${API}/torneo`, { headers: h })
            .then(r => r.json())
            .then(d => setTorneos(Array.isArray(d) ? d : []))
            .catch(() => { });
    };

    useEffect(() => { cargar(); }, []);


    const cargarJugadores = (idEquipo) => {
        if (!idEquipo) { setJugadoresEquipo([]); return; }
        fetch(`${API}/equipo-jugadores/equipo/${idEquipo}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setJugadoresEquipo(Array.isArray(d) ? d : []))
            .catch(() => setJugadoresEquipo([]));
    };

    const crear = async () => {
        setError('');
        try {
            const res = await fetch(`${API}/sanciones`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Torneo: Number(form.id_torneo),
                    Id_Participante: Number(form.id_participante),
                    Tipo_Sancion: form.tipo,
                    Motivo: form.motivo,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al registrar sanción'); }
            setMostrar(false);
            setForm({ id_torneo: '', id_participante: '', id_usuario: '', tipo: 'Advertencia', motivo: '' });
            setJugadoresEquipo([]);
            cargar();
        } catch (err) { setError(err.message); }
    };


    const partsTorneo = form.id_torneo
        ? participantes.filter(p => String(p.Id_Torneo) === form.id_torneo)
        : [];


    const esDeEquipos = partsTorneo.some(p => p.Id_Equipo);


    const equiposUnicos = partsTorneo
        .filter(p => p.Id_Equipo)
        .reduce((acc, p) => {
            if (!acc.find(e => String(e.Id_Equipo) === String(p.Id_Equipo))) acc.push(p);
            return acc;
        }, []);


    const partSeleccionado = partsTorneo.find(p => String(p.Id_Participante) === form.id_participante);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <PageHeader title="Sanciones" subtitle={`${sanciones.length} sanciones registradas`} />
                <Btn onClick={() => { setMostrar(!mostrar); setError(''); }}>
                    {mostrar ? 'Cancelar' : '+ Nueva sanción'}
                </Btn>
            </div>

            {mostrar && (
                <Card style={{ marginBottom: '16px', padding: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>


                        <Select
                            label="Torneo *"
                            value={form.id_torneo}
                            onChange={e => {
                                setForm({ ...form, id_torneo: e.target.value, id_participante: '', id_usuario: '' });
                                setJugadoresEquipo([]);
                            }}
                        >
                            <option value="">Seleccionar torneo...</option>
                            {torneos.map(t => (
                                <option key={t.Id_Torneo} value={t.Id_Torneo}>{t.Nombre}</option>
                            ))}
                        </Select>


                        {form.id_torneo && !esDeEquipos && <div />}


                        {form.id_torneo && esDeEquipos && (
                            <Select
                                label="Equipo *"
                                value={form.id_participante}
                                onChange={e => {
                                    const part = partsTorneo.find(p => String(p.Id_Participante) === e.target.value);
                                    setForm({ ...form, id_participante: e.target.value, id_usuario: '' });
                                    cargarJugadores(part?.Id_Equipo);
                                }}
                            >
                                <option value="">Seleccionar equipo...</option>
                                {equiposUnicos.map(p => (
                                    <option key={p.Id_Participante} value={p.Id_Participante}>
                                        👥 {p.Nombre_En_Torneo || `Equipo #${p.Id_Equipo}`}
                                    </option>
                                ))}
                            </Select>
                        )}


                        {form.id_torneo && !esDeEquipos && (
                            <Select
                                label="Participante *"
                                value={form.id_participante}
                                onChange={e => setForm({ ...form, id_participante: e.target.value, id_usuario: '' })}
                            >
                                <option value="">Seleccionar participante...</option>
                                {partsTorneo.map(p => (
                                    <option key={p.Id_Participante} value={p.Id_Participante}>
                                        {p.Nombre_En_Torneo || `#${p.Id_Participante}`}
                                    </option>
                                ))}
                            </Select>
                        )}


                        {form.id_participante && esDeEquipos && jugadoresEquipo.length > 0 && (
                            <Select
                                label="Sancionar a..."
                                value={form.id_usuario}
                                onChange={e => setForm({ ...form, id_usuario: e.target.value })}
                                style={{ gridColumn: '1/-1' }}
                            >
                                <option value=""> Equipo completo</option>
                                {jugadoresEquipo.map(j => (
                                    <option key={j.Id_Usuario} value={j.Id_Usuario}>
                                        {j.Nombre_Completo} ({j.Nickname})
                                    </option>
                                ))}
                            </Select>
                        )}


                        <Select
                            label="Tipo *"
                            value={form.tipo}
                            onChange={e => setForm({ ...form, tipo: e.target.value })}
                        >
                            <option value="Advertencia">Advertencia</option>
                            <option value="Suspension">Suspensión</option>
                            <option value="Descalificacion">Descalificación</option>
                        </Select>


                        <Input
                            label="Motivo *"
                            value={form.motivo}
                            onChange={e => setForm({ ...form, motivo: e.target.value })}
                            placeholder="Descripción de la sanción"
                        />

                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                            <Btn onClick={crear}>Registrar sanción</Btn>
                        </div>
                    </div>
                </Card>
            )}

            <Card>
                {sanciones.length === 0
                    ? <EmptyState msg="Sin sanciones registradas" />
                    : sanciones.map(s => (
                        <Row key={s.Id_Sancion}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>
                                    {s.Participante || `Participante #${s.Id_Participante}`}
                                </p>
                                <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {s.Motivo || 'Sin motivo'} · Torneo: {s.Torneo || s.Id_Torneo}
                                </p>
                            </div>
                            <Badge estado={s.Tipo_Sancion || 'Advertencia'} />
                            <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', flexShrink: 0 }}>
                                {s.Fecha_Sancion ? new Date(s.Fecha_Sancion).toLocaleDateString('es') : '—'}
                            </p>
                        </Row>
                    ))}
            </Card>
        </>
    );
};
/* ── Componente principal ── */
const DashboardArbitro = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const usuario = getUser();

    const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); };

    const vistas = {
        dashboard: <VistaDashboard />,
        matches: <VistaMatches />,
        sanciones: <VistaSanciones />,
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--luxe-cream)' }}>
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} items={ITEMS} rol="Árbitro" />
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', minWidth: 0 }}>
                {vistas[activo]}
            </main>
        </div>
    );
};

export default DashboardArbitro;