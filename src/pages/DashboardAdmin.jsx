import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API, getUser, getHeaders, Badge, Sidebar, Card, CardHeader, MetricCard, Btn, Input, Select, PageHeader, EmptyState, Row, Avatar } from './shared.jsx';

const ITEMS = [
    { id: 'dashboard', label: 'Inicio', icon: 'M3 3h7v7H3zM13 3h7v7h-7zM3 13h7v7H3zM13 13h7v7h-7z' },
    { id: 'usuarios', label: 'Usuarios', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
    { id: 'solicitudes', label: 'Solicitudes de Rol', icon: 'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
    { id: 'organizaciones', label: 'Organizaciones', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z' },
    { id: 'categorias', label: 'Categorías', icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'disciplinas', label: 'Disciplinas', icon: 'M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z' },
    { id: 'sanciones', label: 'Sanciones', icon: 'M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' },
    { id: 'auditoria', label: 'Auditoría', icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' },
];

/* ── Dashboard ── */
const VistaDashboard = () => {
    const [torneos, setTorneos] = useState([]);
    const [solicitudes, setSolicitudes] = useState([]);
    const [sanciones, setSanciones] = useState([]);
    const [auditoria, setAuditoria] = useState([]);

    useEffect(() => {
        const h = getHeaders();
        fetch(`${API}/torneo`, { headers: h }).then(r => r.json()).then(d => setTorneos(Array.isArray(d) ? d : [])).catch(() => { });
        fetch(`${API}/solicitudes/pendientes`, { headers: h }).then(r => r.json()).then(d => setSolicitudes(Array.isArray(d) ? d : [])).catch(() => { });
        fetch(`${API}/sanciones`, { headers: h })  // ← con S.then(r => r.json())
            .then(d => setSanciones(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });
        fetch(`${API}/auditoria`, { headers: h })
            .then(r => r.json())
            .then(d => setAuditoria(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });
    }, []);

    const activos = torneos.filter(t => t.Estado === 'En Curso' || t.Estado === 'Inscripciones');

    return (
        <>
            <PageHeader title="Panel de administración" subtitle="Visión general del sistema MatchControl" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '1.5rem' }}>
                <MetricCard label="Torneos activos" value={activos.length} accent />
                <MetricCard label="Total torneos" value={torneos.length} />
                <MetricCard label="Solicitudes pendientes" value={solicitudes.length} />
                <MetricCard label="Sanciones registradas" value={sanciones.length} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <Card>
                    <CardHeader title="Torneos recientes" />
                    {torneos.length === 0 ? <EmptyState msg="Sin torneos registrados" /> :
                        torneos.slice(0, 6).map(t => (
                            <Row key={t.Id_Torneo}>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.Nombre}</p>
                                    <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', marginTop: '2px' }}>{t.Formato}</p>
                                </div>
                                <Badge estado={t.Estado} />
                            </Row>
                        ))
                    }
                </Card>
                <Card>
                    <CardHeader title="Actividad reciente" />
                    {auditoria.length === 0 ? <EmptyState msg="Sin registros de auditoría" /> :
                        auditoria.slice(0, 6).map(a => (
                            <Row key={a.Id_Auditoria}>
                                <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--luxe-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--luxe-taupe)', textTransform: 'uppercase' }}>{a.Accion?.slice(0, 3)}</span>
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--luxe-black)' }}>{a.Accion} <span style={{ fontWeight: 400, color: 'var(--luxe-taupe)' }}>en {a.Tabla}</span></p>
                                    <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{a.Fecha ? new Date(a.Fecha).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}</p>
                                </div>
                            </Row>
                        ))
                    }
                </Card>
            </div>
        </>
    );
};

/* ── Usuarios ── */


const VistaUsuarios = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [mostrar, setMostrar] = useState(false);
    const [form, setForm] = useState({ nombre: '', nickname: '', email: '', password: '', rol: '4' });
    const [error, setError] = useState('');

    const cargar = () =>
        fetch(`${API}/usuarios`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setUsuarios(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });

    useEffect(() => { cargar(); }, []);

    const crear = async e => {
        e.preventDefault();
        setError('');
        try {
            const res = await fetch(`${API}/usuarios`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify({
                    nombreCompleto: form.nombre,
                    nickname: form.nickname,
                    email: form.email,
                    passwordHash: form.password,
                    idRol: Number(form.rol),
                }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al crear'); }
            setMostrar(false);
            setForm({ nombre: '', nickname: '', email: '', password: '', rol: '4' });
            cargar();
        } catch (err) { setError(err.message); }
    };

    const eliminar = async id => {
        if (!window.confirm('¿Desactivar este usuario?')) return;
        await fetch(`${API}/usuarios/${id}`, { method: 'DELETE', headers: getHeaders() }).catch(() => { });
        cargar();
    };

    const lista = busqueda
        ? usuarios.filter(u =>
            (u.Nombre_Completo || '').toLowerCase().includes(busqueda.toLowerCase()) ||
            (u.Nickname || '').toLowerCase().includes(busqueda.toLowerCase()))
        : usuarios;

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <PageHeader title="Usuarios" subtitle={`${usuarios.length} usuarios en el sistema`} />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar usuario..."
                        style={{ background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '9px 14px', fontSize: '12px', color: 'var(--luxe-black)', outline: 'none', width: '200px' }} />
                    <Btn onClick={() => { setMostrar(!mostrar); setError(''); }}>{mostrar ? 'Cancelar' : '+ Nuevo usuario'}</Btn>
                </div>
            </div>

            {mostrar && (
                <Card style={{ marginBottom: '16px', padding: '20px' }}>
                    <form onSubmit={crear} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                        <Input label="Nombre completo *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Juan Pérez" />
                        <Input label="Nickname *" value={form.nickname} onChange={e => setForm({ ...form, nickname: e.target.value })} required placeholder="juanp99" />
                        <Input label="Email *" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="juan@email.com" />
                        <Input label="Contraseña *" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="••••••••" />
                        <Select label="Rol *" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                            <option value="1">Admin</option>
                            <option value="2">Organizador</option>
                            <option value="3">Árbitro</option>
                            <option value="4">Participante</option>
                        </Select>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                            <Btn type="submit">Crear usuario</Btn>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {lista.length === 0 ? <EmptyState msg="Sin usuarios" /> : lista.map(u => {
                    const nombre = u.Nombre_Completo || '—';
                    const nick = u.Nickname || '—';
                    const rol = u.Rol || '—';
                    const id = u.Id_Usuario;
                    return (
                        <Row key={id}>
                            <Avatar name={nombre} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{nombre}</p>
                                <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>@{nick} · {u.Email || '—'}</p>
                            </div>
                            <Badge estado={rol} />
                            <Btn small variant="ghost" onClick={() => eliminar(id)}>Desactivar</Btn>
                        </Row>
                    );
                })}
            </Card>
        </>
    );
};

/* ── Solicitudes de Rol ── */
{ estado: 'Aprobado' | 'Rechazado' }
const VistaSolicitudes = () => {
    const [solicitudes, setSolicitudes] = useState([]);

    const cargar = () =>
        fetch(`${API}/solicitudes/pendientes`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setSolicitudes(Array.isArray(d) ? d : []))
            .catch(() => { });

    useEffect(() => { cargar(); }, []);

    const decidir = async (id, estado) => {
        await fetch(`${API}/solicitudes/${id}/procesar`, {
            method: 'PUT',                        // ← era PATCH
            headers: getHeaders(),
            body: JSON.stringify({ estado }),
        }).catch(() => { });
        cargar();
    };

    return (
        <>
            <PageHeader title="Solicitudes de rol" subtitle="Aprueba o rechaza cambios de rol" />
            {solicitudes.length === 0 ? (
                <Card><EmptyState msg="No hay solicitudes pendientes" /></Card>
            ) : (
                <Card>
                    {solicitudes.map(s => (
                        <Row key={s.Id_Solicitud}>
                            <Avatar name={s.Nombre_Completo || '?'} />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>
                                    {s.Nombre_Completo || `Usuario #${s.Id_Usuario}`}
                                </p>
                                <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '260px' }}>
                                    {s.Motivo || 'Sin motivo'} · {s.Email || ''}
                                </p>
                            </div>
                            <Badge estado={s.Nombre_Rol || `Rol #${s.Rol_Solicitado}`} />
                            <div style={{ display: 'flex', gap: '6px' }}>
                                <Btn small variant="wine" onClick={() => decidir(s.Id_Solicitud, 'Aprobado')}>Aprobar</Btn>
                                <Btn small variant="ghost" onClick={() => decidir(s.Id_Solicitud, 'Rechazado')}>Rechazar</Btn>
                            </div>
                        </Row>
                    ))}
                </Card>
            )}
        </>
    );
};

/* ── Organizaciones ── */

const VistaOrganizaciones = () => {
    const [orgs, setOrgs] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ nombre: '', email: '', telefono: '' });
    const [error, setError] = useState('');

    const cargar = () =>
        fetch(`${API}/organizacion`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setOrgs(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });

    useEffect(() => { cargar(); }, []);

    const guardar = async e => {
        e.preventDefault();
        setError('');
        try {
            const method = editId ? 'PUT' : 'POST';
            const url = editId ? `${API}/organizacion/${editId}` : `${API}/organizacion`;
            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify({ nombre: form.nombre, email: form.email, telefono: form.telefono }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al guardar'); }
            setMostrar(false); setEditId(null); setForm({ nombre: '', email: '', telefono: '' });
            cargar();
        } catch (err) { setError(err.message); }
    };

    const eliminar = async id => {
        if (!window.confirm('¿Desactivar esta organización?')) return;
        await fetch(`${API}/organizacion/${id}`, { method: 'DELETE', headers: getHeaders() }).catch(() => { });
        cargar();
    };

    const editar = o => {
        setEditId(o.Id_Organizacion);
        setForm({ nombre: o.Nombre || '', email: o.Email || '', telefono: o.Telefono || '' });
        setMostrar(true);
        setError('');
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <PageHeader title="Organizaciones" subtitle={`${orgs.length} registradas`} />
                <Btn onClick={() => { setMostrar(!mostrar); setEditId(null); setForm({ nombre: '', email: '', telefono: '' }); setError(''); }}>
                    {mostrar ? 'Cancelar' : '+ Nueva organización'}
                </Btn>
            </div>

            {mostrar && (
                <Card style={{ marginBottom: '16px', padding: '20px' }}>
                    <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                        <Input label="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Nombre de la organización" />
                        <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contacto@org.com" />
                        <Input label="Teléfono" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+506 0000-0000" />
                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                            <Btn type="submit">{editId ? 'Actualizar' : 'Crear organización'}</Btn>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {orgs.length === 0 ? <EmptyState msg="Sin organizaciones" /> : orgs.map(o => (
                    <Row key={o.Id_Organizacion}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '6px', background: 'var(--luxe-cream)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--luxe-taupe)" strokeWidth="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{o.Nombre || '—'}</p>
                            <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{o.Email || '—'} · {o.Telefono || '—'}</p>
                        </div>
                        <Badge estado="Activo" />
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <Btn small variant="ghost" onClick={() => editar(o)}>Editar</Btn>
                            <Btn small variant="danger" onClick={() => eliminar(o.Id_Organizacion)}>Desactivar</Btn>
                        </div>
                    </Row>
                ))}
            </Card>
        </>
    );
};

/* ── Categorías ── */

const VistaCategorias = () => {
    const [cats, setCats] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });
    const [error, setError] = useState('');

    const cargar = () =>
        fetch(`${API}/categoria`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setCats(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });

    useEffect(() => { cargar(); }, []);

    const guardar = async e => {
        e.preventDefault();
        setError('');
        try {
            const method = editId ? 'PUT' : 'POST';
            const url = editId ? `${API}/categoria/${editId}` : `${API}/categoria`;
            const res = await fetch(url, {
                method,
                headers: getHeaders(),
                body: JSON.stringify({ nombre: form.nombre, descripcion: form.descripcion }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al guardar'); }
            setMostrar(false); setEditId(null); setForm({ nombre: '', descripcion: '' });
            cargar();
        } catch (err) { setError(err.message); }
    };

    const eliminar = async id => {
        if (!window.confirm('¿Eliminar esta categoría?')) return;
        const res = await fetch(`${API}/categoria/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!res.ok) { const d = await res.json(); alert(d.message || 'No se puede eliminar'); return; }
        cargar();
    };

    const editar = c => {
        setEditId(c.Id_Categoria);
        setForm({ nombre: c.Nombre || '', descripcion: c.Descripcion || '' });
        setMostrar(true); setError('');
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <PageHeader title="Categorías" subtitle={`${cats.length} categorías definidas`} />
                <Btn onClick={() => { setMostrar(!mostrar); setEditId(null); setForm({ nombre: '', descripcion: '' }); setError(''); }}>
                    {mostrar ? 'Cancelar' : '+ Nueva categoría'}
                </Btn>
            </div>

            {mostrar && (
                <Card style={{ marginBottom: '16px', padding: '20px' }}>
                    <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'end' }}>
                        <Input label="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej: eSports Mobile" />
                        <Input label="Descripción" value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Descripción opcional" />
                        <div style={{ gridColumn: '1/-1', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                            <Btn type="submit">{editId ? 'Actualizar' : 'Crear categoría'}</Btn>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {cats.length === 0 ? <EmptyState msg="Sin categorías registradas" /> : cats.map(c => (
                    <Row key={c.Id_Categoria}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{c.Nombre}</p>
                            <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{c.Descripcion || 'Sin descripción'}</p>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <Btn small variant="ghost" onClick={() => editar(c)}>Editar</Btn>
                            <Btn small variant="danger" onClick={() => eliminar(c.Id_Categoria)}>Eliminar</Btn>
                        </div>
                    </Row>
                ))}
            </Card>
        </>
    );
};

/* ── Disciplinas ── */

const VistaDisciplinas = () => {
    const [disciplinas, setDisciplinas] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [mostrar, setMostrar] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ id_categoria: '', nombre: '', tipo: 'Individual', min: '1', max: '' });
    const [error, setError] = useState('');

    const cargar = () => {
        const h = getHeaders();
        fetch(`${API}/disciplina`, { headers: h })
            .then(r => r.json())
            .then(d => setDisciplinas(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });
        fetch(`${API}/categoria`, { headers: h })
            .then(r => r.json())
            .then(d => setCategorias(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))  // ← esta línea
            .catch(() => { });
    };

    useEffect(() => { cargar(); }, []);

    const guardar = async e => {
        e.preventDefault();
        setError('');
        try {
            const method = editId ? 'PUT' : 'POST';
            const url = editId ? `${API}/disciplina/${editId}` : `${API}/disciplina`;
            const body = editId
                ? { nombre: form.nombre, min_integrantes: Number(form.min), max_integrantes: Number(form.max) }
                : { id_categoria: Number(form.id_categoria), nombre: form.nombre, tipo_participacion: form.tipo, min_integrantes: Number(form.min), max_integrantes: Number(form.max) };
            const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(body) });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error al guardar'); }
            setMostrar(false); setEditId(null); setForm({ id_categoria: '', nombre: '', tipo: 'Individual', min: '1', max: '' });
            cargar();
        } catch (err) { setError(err.message); }
    };

    const eliminar = async id => {
        if (!window.confirm('¿Eliminar esta disciplina?')) return;
        const res = await fetch(`${API}/disciplina/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (!res.ok) { const d = await res.json(); alert(d.message || 'No se puede eliminar'); return; }
        cargar();
    };

    const editar = d => {
        setEditId(d.Id_Disciplina);
        setForm({ id_categoria: String(d.Id_Categoria), nombre: d.Nombre, tipo: d.Tipo_Participacion, min: String(d.Min_Integrantes), max: String(d.Max_Integrantes || '') });
        setMostrar(true); setError('');
    };

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <PageHeader title="Disciplinas" subtitle={`${disciplinas.length} disciplinas registradas`} />
                <Btn onClick={() => { setMostrar(!mostrar); setEditId(null); setForm({ id_categoria: '', nombre: '', tipo: 'Individual', min: '1', max: '' }); setError(''); }}>
                    {mostrar ? 'Cancelar' : '+ Nueva disciplina'}
                </Btn>
            </div>

            {mostrar && (
                <Card style={{ marginBottom: '16px', padding: '20px' }}>
                    <form onSubmit={guardar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', alignItems: 'end' }}>
                        {!editId && (
                            <Select label="Categoría *" value={form.id_categoria} onChange={e => setForm({ ...form, id_categoria: e.target.value })} required>
                                <option value="">Seleccionar...</option>
                                {categorias.map(c => <option key={c.Id_Categoria} value={c.Id_Categoria}>{c.Nombre}</option>)}
                            </Select>
                        )}
                        <Input label="Nombre *" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required placeholder="Ej: League of Legends" />
                        {!editId && (
                            <Select label="Tipo *" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                                <option value="Individual">Individual</option>
                                <option value="Equipo">Equipo</option>
                                <option value="Ambos">Ambos</option>
                            </Select>
                        )}
                        <Input label="Mín. integrantes" type="number" value={form.min} onChange={e => setForm({ ...form, min: e.target.value })} placeholder="1" />
                        <Input label="Máx. integrantes" type="number" value={form.max} onChange={e => setForm({ ...form, max: e.target.value })} placeholder="5" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {error && <p style={{ fontSize: '11px', color: 'var(--luxe-wine)' }}>{error}</p>}
                            <Btn type="submit">{editId ? 'Actualizar' : 'Crear disciplina'}</Btn>
                        </div>
                    </form>
                </Card>
            )}

            <Card>
                {disciplinas.length === 0 ? <EmptyState msg="Sin disciplinas registradas" /> : disciplinas.map(d => (
                    <Row key={d.Id_Disciplina}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>{d.Nombre}</p>
                            <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)' }}>{d.Categoria} · Min: {d.Min_Integrantes} / Max: {d.Max_Integrantes ?? '∞'}</p>
                        </div>
                        <Badge estado={d.Tipo_Participacion} />
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <Btn small variant="ghost" onClick={() => editar(d)}>Editar</Btn>
                            <Btn small variant="danger" onClick={() => eliminar(d.Id_Disciplina)}>Eliminar</Btn>
                        </div>
                    </Row>
                ))}
            </Card>
        </>
    );
};

/* ── Sanciones ── */

const VistaSanciones = () => {
    const [sanciones, setSanciones] = useState([]);

    useEffect(() => {
        fetch(`${API}/sanciones`, { headers: getHeaders() })  // ← con S
            .then(r => r.json())
            .then(d => setSanciones(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });
    }, []);

    return (
        <>
            <PageHeader title="Sanciones" subtitle={`${sanciones.length} sanciones registradas`} />
            <Card>
                {sanciones.length === 0 ? <EmptyState msg="Sin sanciones registradas" /> : sanciones.map(s => (
                    <Row key={s.Id_Sancion}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--luxe-black)' }}>
                                {s.Participante || s.Nickname || `Participante #${s.Id_Participante}`}
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

/* ── Auditoría ── */

const VistaAuditoria = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch(`${API}/auditoria`, { headers: getHeaders() })
            .then(r => r.json())
            .then(d => setLogs(Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : []))
            .catch(() => { });
    }, []);

    const colores = {
        // Variantes posibles según el SP
        'INSERT': 'var(--luxe-wine)',
        'UPDATE': 'var(--luxe-taupe)',
        'DELETE': 'var(--luxe-black)',
        'INSERTAR': 'var(--luxe-wine)',
        'ACTUALIZAR': 'var(--luxe-taupe)',
        'ELIMINAR': 'var(--luxe-black)',
        'INSERT INTO': 'var(--luxe-wine)',
        'CREAR': 'var(--luxe-wine)',
        'MODIFICAR': 'var(--luxe-taupe)',
    };

    const getColor = accion => {
        if (!accion) return 'var(--luxe-taupe)';
        const upper = accion.toUpperCase();
        // Busca coincidencia exacta primero, luego parcial
        return colores[upper] ||
            colores[Object.keys(colores).find(k => upper.includes(k)) || ''] ||
            'var(--luxe-taupe)';
    };

    return (
        <>
            <PageHeader title="Auditoría" subtitle={`${logs.length} acciones registradas`} />
            <Card>
                {logs.length === 0 ? <EmptyState msg="Sin registros" /> : logs.map(a => (
                    <Row key={a.Id_Auditoria}>
                        <span style={{
                            fontSize: '9px', fontWeight: 600, padding: '3px 8px', borderRadius: '3px',
                            background: `${getColor(a.Accion)}20`,
                            color: getColor(a.Accion),
                            textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0
                        }}>
                            {a.Accion || '—'}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--luxe-black)' }}>
                                Tabla: <span style={{ color: 'var(--luxe-wine)' }}>{a.Tabla || '—'}</span>
                            </p>
                            {a.Valores_Nuevos && (
                                <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {a.Valores_Nuevos}
                                </p>
                            )}
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--luxe-taupe)', flexShrink: 0 }}>
                            {a.Fecha ? new Date(a.Fecha).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                    </Row>
                ))}
            </Card>
        </>
    );
};

/* ── Componente principal ── */
const DashboardAdmin = () => {
    const navigate = useNavigate();
    const [activo, setActivo] = useState('dashboard');
    const usuario = getUser();

    const onLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('usuario'); navigate('/'); };

    const vistas = {
        dashboard: <VistaDashboard />,
        usuarios: <VistaUsuarios />,
        solicitudes: <VistaSolicitudes />,
        organizaciones: <VistaOrganizaciones />,
        categorias: <VistaCategorias />,
        disciplinas: <VistaDisciplinas />,
        sanciones: <VistaSanciones />,
        auditoria: <VistaAuditoria />,
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--luxe-cream)' }}>
            <Sidebar activo={activo} setActivo={setActivo} usuario={usuario} onLogout={onLogout} items={ITEMS} rol="Admin" />
            <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto', minWidth: 0 }}>
                {vistas[activo]}
            </main>
        </div>
    );
};

export default DashboardAdmin;