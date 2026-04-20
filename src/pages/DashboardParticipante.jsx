import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, getUser, getHeaders, Badge, Sidebar, Card, CardHeader, MetricCard, Btn, Input, Select, PageHeader, EmptyState, Row, Avatar } from './shared.jsx';

const ITEMS = [
    { id: 'dashboard', label: 'Inicio', icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
    { id: 'torneos', label: 'Torneos', icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01' },
    { id: 'misequipo', label: 'Mi Equipo', icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
    { id: 'solicitud', label: 'Solicitar Rol', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
];

/* ── Dashboard ── */
const VistaDashboard = () => {
    const [inscripciones, setInscripciones] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const usuario = getUser();

    useEffect(() => {
        const h = getHeaders();

        fetch(`${API}/participantes`, { headers: h })
            .then(r => r.json())
            .then(d => {
                const uid = Number(usuario?.Id_Usuario || usuario?.id || 0);
                const all = Array.isArray(d) ? d : [];
                setInscripciones(all.filter(p => Number(p.Id_Usuario) === uid));
            }).catch(() => { });
        fetch(`${API}/torneo`, { headers: h })
            .then(r => r.json())
            .then(d => setTorneos(Array.isArray(d) ? d : []))
            .catch(() => { });
    }, []);

    const aceptadas = inscripciones.filter(i => i.Estado_Inscripcion === 'Aceptado');
    const pendientes = inscripciones.filter(i => i.Estado_Inscripcion === 'Pendiente');
    const disponibles = torneos.filter(t => t.Estado === 'Inscripciones');

    return (
        <>
            <PageHeader title="Mi Panel" subtitle="Tu actividad en MatchControl" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                <MetricCard label="Torneos activos" value={aceptadas.length} accent />
                <MetricCard label="Inscripciones pend." value={pendientes.length} />
                <MetricCard label="Total inscritos" value={inscripciones.length} />
                <MetricCard label="Torneos disponibles" value={disponibles.length} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Card>
                    <CardHeader title="Mis inscripciones" />
                    {inscripciones.length === 0
                        ? <EmptyState msg="Aún no estás inscrito en ningún torneo" />
                        : inscripciones.slice(0, 6).map(i => (
                            <Row key={i.Id_Participante}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{i.Nombre_En_Torneo || `Torneo #${i.Id_Torneo}`}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>Torneo #{i.Id_Torneo}</p>
                                </div>
                                <Badge estado={i.Estado_Inscripcion} />
                            </Row>
                        ))
                    }
                </Card>
                <Card>
                    <CardHeader title="Torneos con inscripciones abiertas" />
                    {disponibles.length === 0
                        ? <EmptyState msg="No hay torneos con inscripciones abiertas" />
                        : disponibles.slice(0, 6).map(t => (
                            <Row key={t.Id_Torneo}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{t.Nombre}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{t.Formato} · Max: {t.Max_Participantes}</p>
                                </div>
                                <Badge estado={t.Estado} />
                            </Row>
                        ))
                    }
                </Card>
            </div>
        </>
    );
};

/* ── Torneos ── */
const VistaTorneos = () => {
    const [torneos, setTorneos] = useState([]);
    const [inscripciones, setInscripciones] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [formInscribir, setFormInscribir] = useState(null);
    const [nombre, setNombre] = useState('');
    const [error, setError] = useState('');
    const usuario = getUser();

    const cargar = () => {
        const h = getHeaders();
        const uid = Number(usuario?.Id_Usuario || usuario?.id || 0);
        fetch(`${API}/torneo`, { headers: h })
            .then(r => r.json())
            .then(d => setTorneos(Array.isArray(d) ? d : []))
            .catch(() => { });

        fetch(`${API}/participantes`, { headers: h })
            .then(r => r.json())
            .then(d => {
                const all = Array.isArray(d) ? d : [];
                setInscripciones(all.filter(p => Number(p.Id_Usuario) === uid));
            }).catch(() => { });
    };

    useEffect(() => { cargar(); }, []);

    const inscribirse = async () => {
        setError('');
        const uid = Number(usuario?.Id_Usuario || usuario?.id || 0);
        try {
            const res = await fetch(`${API}/participantes`, {

                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Torneo: formInscribir,
                    Id_Usuario: uid,
                    Nombre_En_Torneo: nombre || (usuario?.Nickname || usuario?.nickname || `Usuario #${uid}`),
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al inscribirse'); }
            setFormInscribir(null); setNombre('');
            cargar();
        } catch (err) { setError(err.message); }
    };

    const yaInscrito = id => inscripciones.some(i => Number(i.Id_Torneo) === Number(id));

    const lista = busqueda
        ? torneos.filter(t => t.Nombre.toLowerCase().includes(busqueda.toLowerCase()))
        : torneos;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <PageHeader title="Torneos" subtitle={`${torneos.length} torneos en el sistema`} />
                <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar torneo..."
                    style={{ background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '9px 14px', fontSize: '12px', color: 'var(--luxe-black)', outline: 'none', width: '200px' }} />
            </div>

            {formInscribir && (
                <Card style={{ marginBottom: '16px', padding: '20px' }}>
                    <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '12px' }}>Inscripción al torneo #{formInscribir}</p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <Input label="Nombre en el torneo"
                                value={nombre}
                                onChange={e => setNombre(e.target.value)}
                                placeholder={usuario?.Nickname || 'Tu nombre en el torneo'} />
                        </div>
                        <Btn variant="wine" onClick={inscribirse}>Inscribirse</Btn>
                        <Btn variant="ghost" onClick={() => { setFormInscribir(null); setError(''); }}>Cancelar</Btn>
                    </div>
                    {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)', marginTop: '8px' }}>{error}</p>}
                </Card>
            )}

            <Card>
                {lista.length === 0 ? <EmptyState msg="Sin torneos disponibles" /> : lista.map(t => {
                    const inscrito = yaInscrito(t.Id_Torneo);
                    const abierto = t.Estado === 'Inscripciones';
                    return (
                        <Row key={t.Id_Torneo}>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.Nombre}</p>
                                <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{t.Formato} · Max: {t.Max_Participantes}</p>
                            </div>
                            <Badge estado={t.Estado} />
                            {abierto && !inscrito && (
                                <Btn small variant="wine" onClick={() => { setFormInscribir(t.Id_Torneo); setNombre(''); setError(''); }}>Inscribirse</Btn>
                            )}
                            {inscrito && <Badge estado="Aceptado" />}
                        </Row>
                    );
                })}
            </Card>
        </>
    );
};

/* ── Mi Equipo ── */
const VistaMiEquipo = () => {
    const [miEquipo, setMiEquipo] = useState(null);
    const [jugadores, setJugadores] = useState([]);
    const [equiposEnLos, setEquiposEnLos] = useState([]);
    const [crearForm, setCrearForm] = useState(false);
    const [formEquipo, setFormEquipo] = useState({ nombre: '', siglas: '' });
    const [addNick, setAddNick] = useState('');
    const [error, setError] = useState('');
    const usuario = getUser();

    const cargar = () => {
        const h = getHeaders();
        const uid = Number(usuario?.Id_Usuario || usuario?.id || 0);


        fetch(`${API}/equipos`, { headers: h })
            .then(r => r.json())
            .then(d => {
                const todos = Array.isArray(d) ? d : [];
                const eq = todos.find(e => Number(e.Id_Capitan) === uid) || null;
                setMiEquipo(eq);
                if (eq) {

                    fetch(`${API}/equipo-jugadores/equipo/${eq.Id_Equipo}`, { headers: h })
                        .then(r => r.json())
                        .then(j => setJugadores(Array.isArray(j) ? j : []))
                        .catch(() => { });
                }
            }).catch(() => { });


        fetch(`${API}/equipo-jugadores`, { headers: h })
            .then(r => r.json())
            .then(d => {
                const todos = Array.isArray(d) ? d : [];
                setEquiposEnLos(todos.filter(e => Number(e.Id_Usuario) === uid));
            }).catch(() => { });
    };

    useEffect(() => { cargar(); }, []);

    const crearEquipo = async () => {
        setError('');
        const uid = Number(usuario?.Id_Usuario || usuario?.id || 0);
        try {
            const res = await fetch(`${API}/equipos`, {

                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Capitan: uid,
                    Nombre: formEquipo.nombre,
                    Siglas: formEquipo.siglas || null,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al crear equipo'); }
            setCrearForm(false); setFormEquipo({ nombre: '', siglas: '' });
            cargar();
        } catch (err) { setError(err.message); }
    };

    const agregarJugador = async () => {
        setError('');
        if (!miEquipo) return;
        try {

            const busRes = await fetch(`${API}/usuarios`, { headers: getHeaders() });
            const busData = await busRes.json();
            const todos = Array.isArray(busData) ? busData : Array.isArray(busData?.data) ? busData.data : [];
            const target = todos.find(u =>
                (u.Nickname || u.nickname || '').toLowerCase() === addNick.toLowerCase()
            );
            if (!target) throw new Error('Usuario no encontrado');

            const res = await fetch(`${API}/equipo-jugadores`, {

                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    Id_Equipo: miEquipo.Id_Equipo,
                    Id_Usuario: target.Id_Usuario,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al agregar'); }
            setAddNick('');
            cargar();
        } catch (err) { setError(err.message); }
    };

    const removerJugador = async idUsuario => {
        if (!miEquipo || !window.confirm('¿Remover este jugador?')) return;

        await fetch(`${API}/equipo-jugadores/${miEquipo.Id_Equipo}/${idUsuario}`, {
            method: 'DELETE', headers: getHeaders(),
        }).catch(() => { });
        cargar();
    };

    return (
        <>
            <PageHeader title="Mi Equipo" subtitle="Crea y gestiona tu equipo de competición" />

            {!miEquipo ? (
                <>
                    {!crearForm ? (
                        <Card style={{ padding: '2rem', textAlign: 'center' }}>
                            <p style={{ fontSize: '13px', color: 'var(--luxe-taupe)', marginBottom: '16px' }}>Aún no tienes un equipo. ¡Crea uno y conviértete en capitán!</p>
                            <Btn onClick={() => setCrearForm(true)}>+ Crear equipo</Btn>
                        </Card>
                    ) : (
                        <Card style={{ padding: '20px', marginBottom: '16px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                                <Input label="Nombre del equipo *" value={formEquipo.nombre} onChange={e => setFormEquipo({ ...formEquipo, nombre: e.target.value })} placeholder="Ej: Team Phoenix" />
                                <Input label="Siglas (opcional)" value={formEquipo.siglas} onChange={e => setFormEquipo({ ...formEquipo, siglas: e.target.value })} placeholder="TPX" />
                                <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <Btn variant="wine" onClick={crearEquipo}>Crear equipo</Btn>
                                        <Btn variant="ghost" onClick={() => { setCrearForm(false); setError(''); }}>Cancelar</Btn>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}

                    {equiposEnLos.length > 0 && (
                        <>
                            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', margin: '16px 0 8px' }}>Equipos donde eres jugador</p>
                            <Card>
                                {equiposEnLos.map(e => (
                                    <Row key={e.Id_Equipo}>
                                        <Avatar name={e.Nombre || 'Equipo'} />
                                        <div style={{ flex: 1 }}>
                                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{e.Nombre || `Equipo #${e.Id_Equipo}`}</p>
                                            {e.Siglas && <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{e.Siglas}</p>}
                                        </div>
                                        <Badge estado="Participante" />
                                    </Row>
                                ))}
                            </Card>
                        </>
                    )}
                </>
            ) : (
                <>
                    <Card style={{ padding: '20px', marginBottom: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '52px', height: '52px', borderRadius: '10px', background: 'var(--luxe-wine)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600, color: 'var(--luxe-cream)' }}>
                                {(miEquipo.Siglas || miEquipo.Nombre?.slice(0, 2) || 'EQ').toUpperCase()}
                            </div>
                            <div>
                                <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--luxe-black)' }}>{miEquipo.Nombre}</p>
                                {miEquipo.Siglas && <p style={{ fontSize: '12px', color: 'var(--luxe-taupe)' }}>{miEquipo.Siglas}</p>}
                            </div>
                            <Badge estado="Capitán" />
                        </div>
                    </Card>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}>Jugadores ({jugadores.length})</p>
                    </div>

                    <Card style={{ padding: '16px 20px', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                            <div style={{ flex: 1 }}>
                                <Input label="Agregar jugador por nickname"
                                    value={addNick}
                                    onChange={e => setAddNick(e.target.value)}
                                    placeholder="nickname del jugador" />
                            </div>
                            <Btn small variant="wine" onClick={agregarJugador}>Agregar</Btn>
                        </div>
                        {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)', marginTop: '8px' }}>{error}</p>}
                    </Card>

                    <Card>
                        {jugadores.length === 0 ? <EmptyState msg="Sin jugadores en el equipo aún" /> : jugadores.map(j => (
                            <Row key={j.Id_Usuario}>
                                <Avatar name={j.Nombre_Completo || j.Nickname || `#${j.Id_Usuario}`} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{j.Nombre_Completo || '—'}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>@{j.Nickname || '—'}</p>
                                </div>
                                <Btn small variant="ghost" onClick={() => removerJugador(j.Id_Usuario)}>Remover</Btn>
                            </Row>
                        ))}
                    </Card>
                </>
            )}
        </>
    );
};

/* ── Solicitar Rol ── */
const VistaSolicitudRol = () => {
    const [solicitudes, setSolicitudes] = useState([]);
    const [form, setForm] = useState({ rol: '2', motivo: '' });
    const [enviado, setEnviado] = useState(false);
    const [error, setError] = useState('');
    const usuario = getUser();

    const cargar = () => {
        const uid = usuario?.Id_Usuario || usuario?.id;

        fetch(`${API}/solicitudes?id_usuario=${uid}`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setSolicitudes(Array.isArray(d) ? d : []))
            .catch(() => { });
    };

    useEffect(() => { cargar(); }, []);

    const enviar = async () => {
        setError('');
        const uid = usuario?.Id_Usuario || usuario?.id;
        try {
            const res = await fetch(`${API}/solicitudes`, {
                method: 'POST', headers: getHeaders(),
                body: JSON.stringify({
                    id_usuario: uid,
                    rol_solicitado: Number(form.rol),
                    motivo: form.motivo,
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al enviar solicitud'); }
            setForm({ rol: '2', motivo: '' }); setEnviado(true);
            cargar();
        } catch (err) { setError(err.message); }
    };

    const tienePendiente = solicitudes.some(s => s.Estado === 'Pendiente');

    return (
        <>
            <PageHeader title="Solicitar rol" subtitle="Pide ascender a Organizador o Árbitro" />

            {enviado && (
                <div style={{ background: '#72393F20', border: '1px solid #72393F40', borderRadius: '8px', padding: '14px 20px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--luxe-wine)', fontWeight: 500 }}>✓ Solicitud enviada correctamente. El administrador la revisará pronto.</p>
                </div>
            )}

            {tienePendiente && (
                <div style={{ background: '#D0C8BD40', border: '1px solid var(--luxe-sand)', borderRadius: '8px', padding: '14px 20px', marginBottom: '16px' }}>
                    <p style={{ fontSize: '13px', color: 'var(--luxe-taupe)' }}>Ya tienes una solicitud pendiente de revisión.</p>
                </div>
            )}

            {!tienePendiente && (
                <Card style={{ padding: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                        <Select label="Rol que solicitas *" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                            <option value="2">Organizador</option>
                            <option value="3">Árbitro</option>
                        </Select>
                        <div style={{ gridColumn: '1/-1' }}>
                            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '6px' }}>Motivo *</label>
                            <textarea
                                value={form.motivo}
                                onChange={e => setForm({ ...form, motivo: e.target.value })}
                                placeholder="Explica por qué deseas obtener este rol y qué experiencia tienes..."
                                rows={4}
                                style={{ width: '100%', background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: 'var(--luxe-black)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical', boxSizing: 'border-box' }}
                                onFocus={e => e.target.style.borderColor = 'var(--luxe-wine)'}
                                onBlur={e => e.target.style.borderColor = 'var(--luxe-sand)'}
                            />
                        </div>
                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                            <Btn variant="wine" onClick={enviar}>Enviar solicitud</Btn>
                        </div>
                    </div>
                </Card>
            )}

            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '8px' }}>Historial de solicitudes</p>
            <Card>
                {solicitudes.length === 0 ? <EmptyState msg="Sin solicitudes previas" /> : solicitudes.map(s => (
                    <Row key={s.Id_Solicitud}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>
                                {s.Rol_Solicitado === 2 ? 'Organizador' : s.Rol_Solicitado === 3 ? 'Árbitro' : `Rol #${s.Rol_Solicitado}`}
                            </p>
                            <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.Motivo || '—'}</p>
                        </div>
                        <Badge estado={s.Estado} />
                        <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', flexShrink: 0 }}>
                            {s.Fecha_Creacion ? new Date(s.Fecha_Creacion).toLocaleDateString('es') : '—'}
                        </p>
                    </Row>
                ))}
            </Card>
        </>
    );
};

/* ── Componente principal ── */
const DashboardParticipante = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const usuario = getUser();

    const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); };

    const vistas = {
        dashboard: <VistaDashboard />,
        torneos: <VistaTorneos />,
        misequipo: <VistaMiEquipo />,
        solicitud: <VistaSolicitudRol />,
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--luxe-cream)' }}>
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} items={ITEMS} rol="Participante" />
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', minWidth: 0 }}>
                {vistas[activo]}
            </main>
        </div>
    );
};

export default DashboardParticipante;