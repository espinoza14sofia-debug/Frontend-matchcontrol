import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3000';

const Login = () => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!nickname || !password) { setError('Completa todos los campos'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, password }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Credenciales incorrectas'); }
            const data = await res.json();
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            const rol = data.usuario?.rol?.nombre || data.usuario?.Rol;
            if (rol === 'Admin') navigate('/dashboard-admin');
            else if (rol === 'Organizador') navigate('/dashboard-organizador');
            else if (rol === 'Arbitro') navigate('/dashboard-arbitro');
            else navigate('/dashboard-participante');
        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor');
        } finally { setLoading(false); }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--luxe-cream)' }}>
            {/* Panel izquierdo decorativo */}
            <div style={{
                width: '42%', background: 'var(--luxe-black)', display: 'flex', flexDirection: 'column',
                justifyContent: 'space-between', padding: '3rem', position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: 0, right: 0, width: '1px', height: '100%', background: 'var(--luxe-wine)' }} />
                <div>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: '11px', letterSpacing: '0.3em', color: 'var(--luxe-taupe)', textTransform: 'uppercase' }}>Sistema de gestión de torneos multicategoria</p>
                </div>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '72px', fontWeight: 300, lineHeight: 1, color: 'var(--luxe-white)', marginBottom: '1rem' }}>
                        Match<br /><span style={{ color: 'var(--luxe-wine)', fontStyle: 'italic' }}>Control</span>
                    </h1>
                    <p style={{ color: 'var(--luxe-taupe)', fontSize: '13px', fontWeight: 300, lineHeight: 1.7, maxWidth: '280px' }}>
                        Controla cada partida.<br />Domina el torneo.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    {['Torneos', 'Árbitros', 'Rankings'].map(t => (
                        <span key={t} style={{ fontSize: '10px', letterSpacing: '0.15em', color: 'var(--luxe-taupe)', textTransform: 'uppercase', paddingBottom: '2px', borderBottom: '1px solid var(--luxe-wine)' }}>{t}</span>
                    ))}
                </div>
            </div>

            {/* Panel derecho — formulario */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div style={{ width: '100%', maxWidth: '360px' }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: 400, color: 'var(--luxe-black)', marginBottom: '6px' }}>
                            Bienvenido
                        </h2>
                        <div style={{ width: '32px', height: '1px', background: 'var(--luxe-wine)' }} />
                    </div>

                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '8px' }}>Usuario</label>
                            <input
                                type="text" value={nickname} onChange={e => setNickname(e.target.value)}
                                placeholder="Nombre de usuario"
                                style={{ width: '100%', background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '14px 16px', fontSize: '14px', color: 'var(--luxe-black)', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = 'var(--luxe-wine)'}
                                onBlur={e => e.target.style.borderColor = 'var(--luxe-sand)'}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '8px' }}>Contraseña</label>
                            <input
                                type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{ width: '100%', background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '14px 16px', fontSize: '14px', color: 'var(--luxe-black)', outline: 'none' }}
                                onFocus={e => e.target.style.borderColor = 'var(--luxe-wine)'}
                                onBlur={e => e.target.style.borderColor = 'var(--luxe-sand)'}
                            />
                        </div>

                        {error && <p style={{ fontSize: '12px', color: 'var(--luxe-wine)', marginBottom: '12px', textAlign: 'center' }}>{error}</p>}

                        <button type="submit" disabled={loading} style={{
                            width: '100%', background: 'var(--luxe-black)', color: 'var(--luxe-cream)',
                            border: 'none', borderRadius: '4px', padding: '16px', fontSize: '11px',
                            letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500,
                            opacity: loading ? 0.6 : 1
                        }}
                            onMouseOver={e => !loading && (e.target.style.background = 'var(--luxe-wine)')}
                            onMouseOut={e => e.target.style.background = 'var(--luxe-black)'}
                        >
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <button onClick={() => navigate('/forgot-password')} style={{ background: 'none', border: 'none', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}
                            onMouseOver={e => e.target.style.color = 'var(--luxe-wine)'}
                            onMouseOut={e => e.target.style.color = 'var(--luxe-taupe)'}
                        >¿Olvidaste tu contraseña?</button>
                        <button onClick={() => navigate('/register')} style={{ background: 'none', border: 'none', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}
                            onMouseOver={e => e.target.style.color = 'var(--luxe-black)'}
                            onMouseOut={e => e.target.style.color = 'var(--luxe-taupe)'}
                        >Crear cuenta</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;