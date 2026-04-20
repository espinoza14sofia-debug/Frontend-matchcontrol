import React from 'react';

export const API = 'http://localhost:3000';

export const getUser = () => { try { return JSON.parse(localStorage.getItem('usuario')) || {}; } catch { return {}; } };

export const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
    'admin-sofi': 'mcsofi',
});

export const iniciales = n => n ? n.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?';

const BADGE_MAP = {
    'Borrador': { bg: '#F0E9E3', color: '#AD9D8D' },
    'Inscripciones': { bg: '#D0C8BD', color: '#332E2B' },
    'En Curso': { bg: '#72393F', color: '#F0E9E3' },
    'Finalizado': { bg: '#332E2B', color: '#D0C8BD' },
    'Cancelado': { bg: '#AD9D8D40', color: '#332E2B' },
    'Pendiente': { bg: '#D0C8BD', color: '#332E2B' },
    'Aprobado': { bg: '#72393F20', color: '#72393F' },
    'Aceptado': { bg: '#72393F20', color: '#72393F' },
    'Rechazado': { bg: '#33000020', color: '#72393F' },
    'Admin': { bg: '#332E2B', color: '#F0E9E3' },
    'Organizador': { bg: '#72393F', color: '#F0E9E3' },
    'Arbitro': { bg: '#AD9D8D', color: '#332E2B' },
    'Participante': { bg: '#D0C8BD', color: '#332E2B' },
    'Activo': { bg: '#72393F20', color: '#72393F' },
    'Inactivo': { bg: '#AD9D8D40', color: '#332E2B' },
    'Programado': { bg: '#D0C8BD', color: '#332E2B' },
    'En Juego': { bg: '#72393F', color: '#F0E9E3' },
    'Postpuesto': { bg: '#AD9D8D', color: '#332E2B' },
    'Individual': { bg: '#D0C8BD', color: '#332E2B' },
    'Equipo': { bg: '#332E2B', color: '#F0E9E3' },
    'Capitán': { bg: '#72393F', color: '#F0E9E3' },
    'Advertencia': { bg: '#D0C8BD', color: '#332E2B' },
    'Suspension': { bg: '#AD9D8D', color: '#332E2B' },
    'Descalificacion': { bg: '#332E2B', color: '#F0E9E3' },
};

export const Badge = ({ estado }) => {
    const s = BADGE_MAP[estado] || { bg: '#D0C8BD', color: '#332E2B' };
    return (
        <span style={{ display: 'inline-block', fontSize: '9px', fontWeight: 500, padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.1em', textTransform: 'uppercase', background: s.bg, color: s.color, whiteSpace: 'nowrap' }}>
            {estado}
        </span>
    );
};

export const Sidebar = ({ activo, setActivo, usuario, onLogout, items, rol }) => {
    const ini = iniciales(usuario?.nickname || usuario?.Nickname || usuario?.nombreCompleto);
    return (
        <aside style={{ width: '220px', minHeight: '100vh', background: 'var(--luxe-black)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #FFFFFF10' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 400, color: 'var(--luxe-white)', letterSpacing: '0.02em' }}>
                    Match<span style={{ color: 'var(--luxe-wine)', fontStyle: 'italic' }}>Control</span>
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '1.5rem' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--luxe-wine)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--luxe-cream)', flexShrink: 0 }}>{ini}</div>
                    <div>
                        <p style={{ color: 'var(--luxe-white)', fontSize: '12px', fontWeight: 500, lineHeight: 1 }}>{usuario?.nickname || usuario?.Nickname || 'Usuario'}</p>
                        <span style={{ fontSize: '9px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}>{rol}</span>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
                {items.map(item => (
                    <button key={item.id} onClick={() => setActivo(item.id)} style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px',
                        borderRadius: '6px', border: 'none', marginBottom: '2px', textAlign: 'left', fontSize: '12px', fontWeight: 400,
                        background: activo === item.id ? 'var(--luxe-wine)' : 'transparent',
                        color: activo === item.id ? 'var(--luxe-cream)' : 'var(--luxe-taupe)',
                    }}
                        onMouseOver={e => { if (activo !== item.id) { e.currentTarget.style.background = '#FFFFFF08'; e.currentTarget.style.color = 'var(--luxe-white)'; } }}
                        onMouseOut={e => { if (activo !== item.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--luxe-taupe)'; } }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d={item.icon} />
                        </svg>
                        {item.label}
                        {item.badge > 0 && (
                            <span style={{ marginLeft: 'auto', background: 'var(--luxe-wine)', color: 'var(--luxe-cream)', fontSize: '9px', fontWeight: 600, padding: '2px 6px', borderRadius: '10px' }}>
                                {item.badge > 9 ? '9+' : item.badge}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            <button onClick={onLogout} style={{
                display: 'flex', alignItems: 'center', gap: '10px', margin: '0.75rem', padding: '10px 12px',
                borderRadius: '6px', border: 'none', background: 'transparent', color: 'var(--luxe-taupe)', fontSize: '12px'
            }}
                onMouseOver={e => { e.currentTarget.style.background = '#FFFFFF08'; e.currentTarget.style.color = 'var(--luxe-white)'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--luxe-taupe)'; }}
            >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                Cerrar sesión
            </button>
        </aside>
    );
};

export const Card = ({ children, style }) => (
    <div style={{ background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '8px', overflow: 'hidden', ...style }}>
        {children}
    </div>
);

export const CardHeader = ({ title, subtitle, action }) => (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--luxe-silver)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
            <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: subtitle ? '2px' : 0 }}>{title}</p>
            {subtitle && <p style={{ fontSize: '12px', color: 'var(--luxe-black)', fontWeight: 500 }}>{subtitle}</p>}
        </div>
        {action}
    </div>
);

export const MetricCard = ({ label, value, accent }) => (
    <div style={{ background: accent ? 'var(--luxe-black)' : 'var(--luxe-white)', border: `1px solid ${accent ? 'transparent' : 'var(--luxe-sand)'}`, borderRadius: '8px', padding: '20px 24px' }}>
        <p style={{ fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: accent ? 'var(--luxe-taupe)' : 'var(--luxe-taupe)', marginBottom: '8px' }}>{label}</p>
        <p style={{ fontSize: '36px', fontFamily: 'var(--font-display)', fontWeight: 400, color: accent ? 'var(--luxe-cream)' : 'var(--luxe-black)', lineHeight: 1 }}>{value ?? '—'}</p>
    </div>
);

export const Btn = ({ children, onClick, variant = 'dark', small, disabled, style: extraStyle }) => {
    const base = {
        border: 'none', borderRadius: '4px', fontFamily: 'var(--font-body)', fontWeight: 400,
        fontSize: small ? '10px' : '11px', letterSpacing: '0.12em', textTransform: 'uppercase',
        padding: small ? '6px 14px' : '11px 20px', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, ...extraStyle,
    };
    const variants = {
        dark: { background: 'var(--luxe-black)', color: 'var(--luxe-cream)' },
        wine: { background: 'var(--luxe-wine)', color: 'var(--luxe-cream)' },
        ghost: { background: 'transparent', color: 'var(--luxe-black)', border: '1px solid var(--luxe-sand)' },
        danger: { background: 'transparent', color: 'var(--luxe-wine)', border: '1px solid var(--luxe-sand)' },
    };
    return (
        <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}
            onMouseOver={e => { if (!disabled) e.currentTarget.style.opacity = '0.8'; }}
            onMouseOut={e => { e.currentTarget.style.opacity = '1'; }}
        >{children}</button>
    );
};

export const Input = ({ label, ...props }) => (
    <div>
        {label && <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '6px' }}>{label}</label>}
        <input {...props} style={{ width: '100%', background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: 'var(--luxe-black)', outline: 'none', fontFamily: 'var(--font-body)' }}
            onFocus={e => e.target.style.borderColor = 'var(--luxe-wine)'}
            onBlur={e => e.target.style.borderColor = 'var(--luxe-sand)'}
        />
    </div>
);

export const Select = ({ label, children, ...props }) => (
    <div>
        {label && <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '6px' }}>{label}</label>}
        <select {...props} style={{ width: '100%', background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '10px 14px', fontSize: '13px', color: 'var(--luxe-black)', outline: 'none', fontFamily: 'var(--font-body)', cursor: 'pointer' }}
            onFocus={e => e.target.style.borderColor = 'var(--luxe-wine)'}
            onBlur={e => e.target.style.borderColor = 'var(--luxe-sand)'}
        >{children}</select>
    </div>
);

export const PageHeader = ({ title, subtitle }) => (
    <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--luxe-black)', marginBottom: '4px' }}>{title}</h2>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--luxe-taupe)' }}>{subtitle}</p>}
    </div>
);

export const EmptyState = ({ msg }) => (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', color: 'var(--luxe-taupe)' }}>{msg}</p>
    </div>
);

export const Row = ({ children, style }) => (
    <div style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--luxe-silver)', ...style }}>
        {children}
    </div>
);

export const Avatar = ({ name, size = 36 }) => (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'var(--luxe-sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 500, color: 'var(--luxe-black)', flexShrink: 0 }}>
        {iniciales(name)}
    </div>
);