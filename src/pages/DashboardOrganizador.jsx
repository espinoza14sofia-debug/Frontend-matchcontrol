import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, getUser, getHeaders, Badge, Sidebar, Card, CardHeader, MetricCard, Btn, Input, Select, PageHeader, EmptyState, Row, Avatar } from './shared.jsx';

const ITEMS = [
    { id: 'dashboard', label: 'Inicio', icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
    { id: 'torneos', label: 'Mis Torneos', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { id: 'participantes', label: 'Participantes', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { id: 'fases', label: 'Fases y Grupos', icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z' },
    { id: 'matches', label: 'Partidos', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
];

/* ── Dashboard ── */
const VistaDashboard = () => {
    const [torneos, setTorneos] = useState([]);
    const [participantes, setParticipantes] = useState([]);

    useEffect(() => {
        const h = getHeaders();
        fetch(`${API}/torneo`, { headers: h })
            .then(r => r.json())
            .then(d => {
                const lista = Array.isArray(d) ? d
                    : Array.isArray(d?.data) ? d.data
                        : Array.isArray(d?.torneos) ? d.torneos : [];
                setTorneos(lista);
            }).catch(() => { });
        fetch(`${API}/participantes`, { headers: h })
            .then(r => r.json())
            .then(d => setParticipantes(Array.isArray(d) ? d : d?.data || []))
            .catch(() => { });
    }, []);

    const misTorneos = torneos;
    const activos = misTorneos.filter(t => t.Estado === 'En Curso' || t.Estado === 'Inscripciones');
    const pendientes = participantes.filter(p => p.Estado_Inscripcion === 'Pendiente');

    return (
        <>
            <PageHeader title="Panel del Organizador" subtitle="Gestión de tus torneos y eventos" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                <MetricCard label="Mis torneos" value={misTorneos.length} accent />
                <MetricCard label="Torneos activos" value={activos.length} />
                <MetricCard label="Total torneos" value={torneos.length} />
                <MetricCard label="Inscripciones pend." value={pendientes.length} />
            </div>
            <Card>
                <CardHeader title="Mis torneos recientes" />
                {misTorneos.length === 0 ? <EmptyState msg="Aún no has creado torneos" /> :
                    misTorneos.slice(0, 8).map(t => (
                        <Row key={t.Id_Torneo}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.Nombre}</p>
                                <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', marginTop: '2px' }}>{t.Formato} · Max: {t.Max_Participantes}</p>
                            </div>
                            <Badge estado={t.Estado} />
                        </Row>
                    ))
                }
            </Card>
        </>
    );
};

/* ── Torneos ── */

const VistaTorneos = () => {
    const [torneos, setTorneos] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [form, setForm] = useState({ nombre: '', id_disciplina: '', id_organizacion: '', formato: 'Eliminacion Directa', max_participantes: '', fecha_inicio: '', fecha_fin: '' });
    const [error, setError] = useState('');
    const usuario = getUser();

    const cargar = () => {
        const h = getHeaders();
        fetch(`${API}/torneo`, { headers: h }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : [])).catch(() => { });
        fetch(`${API}/disciplina`, { headers: h }).then(r => r.json()).then(d => setDisciplinas(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [])).catch(() => { });
        fetch(`${API}/organizacion`, { headers: h }).then(r => r.json()).then(d => setOrgs(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [])).catch(() => { });
    };

    useEffect(() => { cargar(); }, []);

    const crear = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${API}/torneo`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    id_disciplina: Number(form.id_disciplina),
                    id_organizacion: Number(form.id_organizacion),
                    id_creador: usuario?.Id_Usuario || usuario?.id,
                    nombre: form.nombre,
                    formato: form.formato,
                    max_participantes: Number(form.max_participantes),
                    fecha_inicio: form.fecha_inicio || null,
                    fecha_fin: form.fecha_fin || null,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al crear torneo'); }
            setMostrar(false);
            setForm({ nombre: '', id_disciplina: '', id_organizacion: '', formato: 'Eliminacion Directa', max_participantes: '', fecha_inicio: '', fecha_fin: '' });
            cargar();
        } catch (err) { setError(err.message); }
    };

    const cambiarEstado = async (id, estado) => {
        await fetch(`${API}/torneo/${id}/estado`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ estado }),
        }).catch(() => { });
        cargar();
    };

    const eliminar = async id => {
        if (!window.confirm('¿Eliminar este torneo y toda su información? Esta acción no se puede deshacer.')) return;
        await fetch(`${API}/torneo/${id}`, { method: 'DELETE', headers: getHeaders() }).catch(() => { });
        cargar();
    };

    const ESTADOS = ['Borrador', 'Inscripciones', 'En Curso', 'Finalizado', 'Cancelado'];

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <PageHeader title="Mis torneos" subtitle={`${torneos.length} torneos en total`} />
                <Btn onClick={() => { setMostrar(!mostrar); setError(''); }}>{mostrar ? 'Cancelar' : '+ Nuevo torneo'}</Btn>
            </div>

            {mostrar && (
                <Card style={{ marginBottom: '16px', padding: '20px' }}>
                    <form onSubmit={crear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                        <Input label="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Nombre del torneo" />
                        <Select label="Disciplina *" value={form.id_disciplina} onChange={e => setForm({ ...form, id_disciplina: e.target.value })} required>
                            <option value="">Seleccionar...</option>
                            {disciplinas.map(d => <option key={d.Id_Disciplina} value={d.Id_Disciplina}>{d.Nombre}</option>)}
                        </Select>
                        <Select label="Organización *" value={form.id_organizacion} onChange={e => setForm({ ...form, id_organizacion: e.target.value })} required>
                            <option value="">Seleccionar...</option>
                            {orgs.map(o => <option key={o.Id_Organizacion} value={o.Id_Organizacion}>{o.Nombre}</option>)}
                        </Select>
                        <Select label="Formato *" value={form.formato} onChange={e => setForm({ ...form, formato: e.target.value })}>
                            <option value="Eliminacion Directa">Eliminación Directa</option>
                            <option value="Round Robin">Round Robin</option>
                            <option value="Grupos">Grupos</option>
                            <option value="Suizo">Suizo</option>
                        </Select>
                        <Input label="Máx. participantes *" type="number" value={form.max_participantes} onChange={e => setForm({ ...form, max_participantes: e.target.value })} required placeholder="16" />
                        <Input label="Fecha inicio" type="datetime-local" value={form.fecha_inicio} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} />
                        <Input label="Fecha fin" type="datetime-local" value={form.fecha_fin} onChange={e => setForm({ ...form, fecha_fin: e.target.value })} />
                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                            <Btn type="submit">Crear torneo</Btn>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {torneos.length === 0 ? <EmptyState msg="Sin torneos" /> : torneos.map(t => (
                    <Row key={t.Id_Torneo}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.Nombre}</p>
                            <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{t.Formato} · Max: {t.Max_Participantes}</p>
                        </div>
                        <Badge estado={t.Estado} />
                        <Select value={t.Estado} onChange={e => cambiarEstado(t.Id_Torneo, e.target.value)}
                            style={{ fontSize: '10px', padding: '4px 8px', width: 'auto', border: '1px solid var(--luxe-sand)', borderRadius: '4px', background: 'var(--luxe-white)', color: 'var(--luxe-black)', cursor: 'pointer' }}>
                            {ESTADOS.map(s => <option key={s} value={s}>{s}</option>)}
                        </Select>
                        <Btn small variant="danger" onClick={() => eliminar(t.Id_Torneo)}>Eliminar</Btn>
                    </Row>
                ))}
            </Card>
        </>
    );
};

/* ── Participantes ── */

const VistaParticipantes = () => {
    const [participantes, setParticipantes] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const [torneoFiltro, setTorneoFiltro] = useState('');

    const cargar = () => {
        const h = getHeaders();
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

    const decidir = async (id, estado) => {
        await fetch(`${API}/participantes/${id}`, {
            method: 'PATCH',
            headers: getHeaders(),
            body: JSON.stringify({ Estado_Inscripcion: estado }),
        }).catch(() => { });
        cargar();
    };

    const lista = torneoFiltro
        ? participantes.filter(p => String(p.Id_Torneo) === torneoFiltro)
        : participantes;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <PageHeader title="Participantes" subtitle={`${participantes.length} inscritos en total`} />
                <select value={torneoFiltro} onChange={e => setTorneoFiltro(e.target.value)}
                    style={{ background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '9px 14px', fontSize: '12px', color: 'var(--luxe-black)', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Todos los torneos</option>
                    {torneos.map(t => <option key={t.Id_Torneo} value={t.Id_Torneo}>{t.Nombre}</option>)}
                </select>
            </div>
            <Card>
                {lista.length === 0 ? <EmptyState msg="Sin participantes" /> : lista.map(p => (
                    <Row key={p.Id_Participante}>
                        <Avatar name={p.Nombre_En_Torneo || `P#${p.Id_Participante}`} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>
                                {p.Nombre_En_Torneo || `Participante #${p.Id_Participante}`}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>
                                Torneo #{p.Id_Torneo} · {p.Id_Equipo ? `Equipo #${p.Id_Equipo}` : `Usuario #${p.Id_Usuario}`}
                            </p>
                        </div>
                        <Badge estado={p.Estado_Inscripcion || 'Pendiente'} />
                        {p.Estado_Inscripcion === 'Pendiente' && (
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <Btn small variant="wine" onClick={() => decidir(p.Id_Participante, 'Aceptado')}>Aceptar</Btn>
                                <Btn small variant="ghost" onClick={() => decidir(p.Id_Participante, 'Rechazado')}>Rechazar</Btn>
                            </div>
                        )}
                    </Row>
                ))}
            </Card>
        </>
    );
};

/* ── Fases y Grupos ── */
const VistaFasesGrupos = () => {
    const [torneos, setTorneos] = useState([]);
    const [fases, setFases] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [torneoSel, setTorneoSel] = useState('');
    const [faseSel, setFaseSel] = useState('');
    const [formFase, setFormFase] = useState({ nombre: '', orden: '1', tipo: 'Eliminacion' });
    const [formGrupo, setFormGrupo] = useState({ nombre: '' });
    const [mostrarFase, setMostrarFase] = useState(false);
    const [mostrarGrupo, setMostrarGrupo] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch(`${API}/torneo`, { headers: getHeaders() }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : [])).catch(() => { });
    }, []);

    const cargarFases = idTorneo => {
        if (!idTorneo) return;
        fetch(`${API}/fases/torneo/${idTorneo}`, { headers: getHeaders() })
            .then(r => r.json()).then(d => setFases(Array.isArray(d) ? d : [])).catch(() => { });
    };

    const cargarGrupos = idFase => {
        if (!idFase) return;
        fetch(`${API}/grupos/fase/${idFase}`, { headers: getHeaders() })
            .then(r => r.json()).then(d => setGrupos(Array.isArray(d) ? d : [])).catch(() => { });
    };

    const crearFase = async e => {
        e.preventDefault(); setError('');
        try {
            const res = await fetch(`${API}/fases`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Torneo: Number(torneoSel),
                    Nombre: formFase.nombre,
                    Orden: Number(formFase.orden),
                    Tipo_Fase: formFase.tipo,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
            setMostrarFase(false); setFormFase({ nombre: '', orden: '1', tipo: 'Eliminacion' });
            cargarFases(torneoSel);
        } catch (err) { setError(err.message); }
    };

    const eliminarFase = async id => {
        if (!window.confirm('¿Eliminar esta fase?')) return;
        await fetch(`${API}/fases/${id}`, { method: 'DELETE', headers: getHeaders() })
        cargarFases(torneoSel);
    };

    const crearGrupo = async e => {
        e.preventDefault(); setError('');
        try {
            const res = await fetch(`${API}/grupos`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Fase: Number(faseSel),   // ← mayúscula
                    Nombre: formGrupo.nombre,  // ← mayúscula
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
            setMostrarGrupo(false); setFormGrupo({ nombre: '' });
            cargarGrupos(faseSel);
        } catch (err) { setError(err.message); }
    };

    const eliminarGrupo = async id => {
        if (!window.confirm('¿Eliminar este grupo?')) return;
        await fetch(`${API}/grupos/${id}`, { method: 'DELETE', headers: getHeaders() })
        cargarGrupos(faseSel);
    };

    return (
        <>
            <PageHeader title="Fases y Grupos" subtitle="Arquitectura de competición por torneo" />

            {/* Selector torneo */}
            <Card style={{ padding: '16px 20px', marginBottom: '16px' }}>
                <Select label="Seleccionar torneo" value={torneoSel} onChange={e => { setTorneoSel(e.target.value); setFaseSel(''); setFases([]); setGrupos([]); cargarFases(e.target.value); }}>
                    <option value="">— Elige un torneo —</option>
                    {torneos.map(t => <option key={t.Id_Torneo} value={t.Id_Torneo}>{t.Nombre}</option>)}
                </Select>
            </Card>

            {torneoSel && (
                <>
                    {/* Fases */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}>Fases del torneo</p>
                        <Btn small onClick={() => setMostrarFase(!mostrarFase)}>{mostrarFase ? 'Cancelar' : '+ Fase'}</Btn>
                    </div>
                    {mostrarFase && (
                        <Card style={{ padding: '16px 20px', marginBottom: '12px' }}>
                            <form onSubmit={crearFase} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                                <Input label="Nombre *" value={formFase.nombre} onChange={e => setFormFase({ ...formFase, nombre: e.target.value })} required placeholder="Ej: Semifinal" />
                                <Input label="Orden *" type="number" value={formFase.orden} onChange={e => setFormFase({ ...formFase, orden: e.target.value })} required />
                                <Select label="Tipo *" value={formFase.tipo} onChange={e => setFormFase({ ...formFase, tipo: e.target.value })}>
                                    <option value="Grupos">Grupos</option>
                                    <option value="Eliminacion">Eliminación</option>
                                    <option value="Round Robin">Round Robin</option>
                                </Select>
                                <Btn type="submit">Crear</Btn>
                            </form>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)', marginTop: '8px' }}>{error}</p>}
                        </Card>
                    )}
                    <Card style={{ marginBottom: '20px' }}>
                        {fases.length === 0 ? <EmptyState msg="Sin fases para este torneo" /> : fases.map(f => (
                            <Row key={f.Id_Fase} style={{ cursor: 'pointer', background: faseSel === String(f.Id_Fase) ? 'var(--luxe-cream)' : 'transparent' }}
                                onClick={() => { setFaseSel(String(f.Id_Fase)); cargarGrupos(f.Id_Fase); }}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{f.Nombre}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>Orden: {f.Orden} · {f.Tipo_Fase}</p>
                                </div>
                                {faseSel === String(f.Id_Fase) && <Badge estado="Activo" />}
                                <Btn small variant="danger" onClick={ev => { ev.stopPropagation(); eliminarFase(f.Id_Fase); }}>Eliminar</Btn>
                            </Row>
                        ))}
                    </Card>

                    {/* Grupos de la fase seleccionada */}
                    {faseSel && (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}>Grupos de la fase</p>
                                <Btn small onClick={() => setMostrarGrupo(!mostrarGrupo)}>{mostrarGrupo ? 'Cancelar' : '+ Grupo'}</Btn>
                            </div>
                            {mostrarGrupo && (
                                <Card style={{ padding: '16px 20px', marginBottom: '12px' }}>
                                    <form onSubmit={crearGrupo} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                        <div style={{ flex: 1 }}>
                                            <Input label="Nombre del grupo *" value={formGrupo.nombre} onChange={e => setFormGrupo({ nombre: e.target.value })} required placeholder="Ej: Grupo A" />
                                        </div>
                                        <Btn type="submit">Crear</Btn>
                                    </form>
                                </Card>
                            )}
                            <Card>
                                {grupos.length === 0 ? <EmptyState msg="Sin grupos en esta fase" /> : grupos.map(g => (
                                    <Row key={g.Id_Grupo}>
                                        <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)', flex: 1 }}>{g.Nombre}</p>
                                        <Btn small variant="danger" onClick={() => eliminarGrupo(g.Id_Grupo)}>Eliminar</Btn>
                                    </Row>
                                ))}
                            </Card>
                        </>
                    )}
                </>
            )}
        </>
    );
};

/* ── Matches / Partidos ── */

const VistaMatches = () => {
    const [torneos, setTorneos] = useState([]);
    const [fases, setFases] = useState([]);
    const [grupos, setGrupos] = useState([]);
    const [arbitros, setArbitros] = useState([]);
    const [matches, setMatches] = useState([]);
    const [torneoSel, setTorneoSel] = useState('');
    const [faseSel, setFaseSel] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [form, setForm] = useState({ id_grupo: '', id_arbitro: '', fecha_hora: '', ubicacion: '' });
    const [error, setError] = useState('');

    useEffect(() => {
        const h = getHeaders();
        fetch(`${API}/torneo`, { headers: h })
            .then(r => r.json())
            .then(d => setTorneos(Array.isArray(d) ? d : []))
        fetch(`${API}/usuarios`, { headers: h })
            .then(r => r.json())
            .then(d => setArbitros((Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []).filter(u => u.Rol === 'Arbitro')))
            .catch(() => { });
    }, []);

    const cargarFases = id => {
        setFaseSel(''); setFases([]); setMatches([]);
        if (!id) return;
        fetch(`${API}/fases/torneo/${id}`, { headers: getHeaders() }).then(r => r.json()).then(d => setFases(Array.isArray(d) ? d : [])).catch(() => { });
    };

    const cargarMatches = id => {
        setFaseSel(id);
        if (!id) return;
        const h = getHeaders();
        fetch(`${API}/matches/fase/${id}`, { headers: h })
            .then(r => r.json())
            .then(d => setMatches(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });
        fetch(`${API}/grupos/fase/${id}`, { headers: h })
            .then(r => r.json())
            .then(d => setGrupos(Array.isArray(d) ? d : []))
            .catch(() => { });
    };
    const crear = async e => {
        e.preventDefault(); setError('');
        try {
            const res = await fetch(`${API}/matches`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Fase: Number(faseSel),
                    id_grupo: form.id_grupo ? Number(form.id_grupo) : null,
                    id_arbitro: form.id_arbitro ? Number(form.id_arbitro) : null,
                    fecha_hora: form.fecha_hora || null,
                    Ubicacion: form.ubicacion || 'Por definir',
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error'); }
            setMostrar(false); setForm({ id_grupo: '', id_arbitro: '', fecha_hora: '', ubicacion: '' });
            cargarMatches(faseSel);
        } catch (err) { setError(err.message); }
    };

    const cambiarEstado = async (id, estado) => {
        await fetch(`${API}/matches/${id}/estado`, { method: 'PATCH', headers: getHeaders(), body: JSON.stringify({ estado }) }).catch(() => { });
        cargarMatches(faseSel);
    };

    const eliminar = async id => {
        if (!window.confirm('¿Eliminar este partido?')) return;
        await fetch(`${API}/matches/${id}`, { method: 'DELETE', headers: getHeaders() })
        cargarMatches(faseSel);
    };

    const ESTADOS_MATCH = ['Programado', 'En Juego', 'Finalizado', 'Postpuesto'];

    return (
        <>
            <PageHeader title="Partidos" subtitle="Logística de encuentros por fase" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <Card style={{ padding: '16px 20px' }}>
                    <Select label="Torneo" value={torneoSel} onChange={e => { setTorneoSel(e.target.value); cargarFases(e.target.value); }}>
                        <option value="">— Elige torneo —</option>
                        {torneos.map(t => <option key={t.Id_Torneo} value={t.Id_Torneo}>{t.Nombre}</option>)}
                    </Select>
                </Card>
                <Card style={{ padding: '16px 20px' }}>
                    <Select label="Fase" value={faseSel} onChange={e => cargarMatches(e.target.value)} disabled={!torneoSel}>
                        <option value="">— Elige fase —</option>
                        {fases.map(f => <option key={f.Id_Fase} value={f.Id_Fase}>{f.Nombre}</option>)}
                    </Select>
                </Card>
            </div>

            {faseSel && (
                <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                        <Btn small onClick={() => { setMostrar(!mostrar); setError(''); }}>{mostrar ? 'Cancelar' : '+ Nuevo partido'}</Btn>
                    </div>
                    {mostrar && (
                        <Card style={{ padding: '16px 20px', marginBottom: '12px' }}>
                            <form onSubmit={crear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                                <Select label="Grupo (opcional)" value={form.id_grupo} onChange={e => setForm({ ...form, id_grupo: e.target.value })}>
                                    <option value="">Sin grupo</option>
                                    {grupos.map(g => <option key={g.Id_Grupo} value={g.Id_Grupo}>{g.Nombre}</option>)}
                                </Select>
                                <Select label="Árbitro (opcional)" value={form.id_arbitro} onChange={e => setForm({ ...form, id_arbitro: e.target.value })}>
                                    <option value="">Sin árbitro asignado</option>
                                    {arbitros.map(a => <option key={a.Id_Usuario} value={a.Id_Usuario}>{a.Nickname || a.Nombre_Completo}</option>)}
                                </Select>
                                <Input label="Fecha y hora" type="datetime-local" value={form.fecha_hora} onChange={e => setForm({ ...form, fecha_hora: e.target.value })} />
                                <Input label="Ubicación" value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} placeholder="Sala / Campo / Online" />
                                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                                    <Btn type="submit">Crear partido</Btn>
                                </div>
                            </form>
                        </Card>
                    )}
                    <Card>
                        {matches.length === 0 ? <EmptyState msg="Sin partidos en esta fase" /> : matches.map(m => (
                            <Row key={m.Id_Match}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>Partido #{m.Id_Match}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>
                                        {m.Ubicacion || 'Sin ubicación'} · {m.Fecha_Hora ? new Date(m.Fecha_Hora).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sin fecha'}
                                    </p>
                                </div>
                                <Badge estado={m.Estado} />
                                <select value={m.Estado} onChange={e => cambiarEstado(m.Id_Match, e.target.value)}
                                    style={{ fontSize: '10px', padding: '4px 8px', width: 'auto', border: '1px solid var(--luxe-sand)', borderRadius: '4px', background: 'var(--luxe-white)', color: 'var(--luxe-black)', cursor: 'pointer' }}>
                                    {ESTADOS_MATCH.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <Btn small variant="danger" onClick={() => eliminar(m.Id_Match)}>Eliminar</Btn>
                            </Row>
                        ))}
                    </Card>
                </>
            )}
        </>
    );
};

/* ── Componente principal ── */
const DashboardOrganizador = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const usuario = getUser();

    const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); };

    const vistas = {
        dashboard: <VistaDashboard />,
        torneos: <VistaTorneos />,
        participantes: <VistaParticipantes />,
        fases: <VistaFasesGrupos />,
        matches: <VistaMatches />,
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--luxe-cream)' }}>
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} items={ITEMS} rol="Organizador" />
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', minWidth: 0 }}>
                {vistas[activo]}
            </main>
        </div>
    );
};

export default DashboardOrganizador;