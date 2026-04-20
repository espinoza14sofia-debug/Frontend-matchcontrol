import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API = 'http://localhost:3000';

const Register = () => {
    const navigate = useNavigate();
    const [form, setForm] = useState({ Nombre_Completo: '', Nickname: '', Email: '', Password_Hash: '', confirmar: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handle = e => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!form.Nombre_Completo || !form.Nickname || !form.Email || !form.Password_Hash) { setError('Todos los campos son obligatorios'); return; }
        if (form.Password_Hash !== form.confirmar) { setError('Las contraseñas no coinciden'); return; }
        if (form.Password_Hash.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${API}/usuarios`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombreCompleto: form.Nombre_Completo, nickname: form.Nickname, email: form.Email, passwordHash: form.Password_Hash, idRol: 4 }),
            });
            if (!res.ok) { const d = await res.json(); throw new Error(d.message || 'Error en el registro'); }
            navigate('/');
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
    };

    const inp = { width: '100%', background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '14px 16px', fontSize: '14px', color: 'var(--luxe-black)', outline: 'none' };
    const lbl = { display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '8px' };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--luxe-cream)', padding: '2rem' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '40px', fontWeight: 300, color: 'var(--luxe-black)' }}>
                        Match<span style={{ color: 'var(--luxe-wine)', fontStyle: 'italic' }}>Control</span>
                    </h1>
                    <p style={{ fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginTop: '8px' }}>Registro de usuario</p>
                    <div style={{ width: '32px', height: '1px', background: 'var(--luxe-wine)', margin: '12px auto 0' }} />
                </div>

                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { name: 'Nombre_Completo', label: 'Nombre completo', type: 'text', ph: 'Tu nombre' },
                        { name: 'Nickname', label: 'Nombre de usuario', type: 'text', ph: 'Nickname único' },
                        { name: 'Email', label: 'Correo electrónico', type: 'email', ph: 'correo@ejemplo.com' },
                        { name: 'Password_Hash', label: 'Contraseña', type: 'password', ph: '••••••••' },
                        { name: 'confirmar', label: 'Confirmar contraseña', type: 'password', ph: '••••••••' },
                    ].map(f => (
                        <div key={f.name}>
                            <label style={lbl}>{f.label}</label>
                            <input name={f.name} type={f.type} placeholder={f.ph} value={form[f.name]} onChange={handle} disabled={loading} style={inp}
                                onFocus={e => e.target.style.borderColor = 'var(--luxe-wine)'}
                                onBlur={e => e.target.style.borderColor = 'var(--luxe-sand)'}
                            />
                        </div>
                    ))}

                    {error && <p style={{ fontSize: '12px', color: 'var(--luxe-wine)', textAlign: 'center' }}>{error}</p>}

                    <button type="submit" disabled={loading} style={{
                        marginTop: '8px', width: '100%', background: 'var(--luxe-black)', color: 'var(--luxe-cream)',
                        border: 'none', borderRadius: '4px', padding: '16px', fontSize: '11px',
                        letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500, opacity: loading ? 0.6 : 1
                    }}
                        onMouseOver={e => !loading && (e.target.style.background = 'var(--luxe-wine)')}
                        onMouseOut={e => e.target.style.background = 'var(--luxe-black)'}
                    >{loading ? 'Registrando...' : 'Crear cuenta'}</button>
                </form>

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}
                        onMouseOver={e => e.target.style.color = 'var(--luxe-black)'}
                        onMouseOut={e => e.target.style.color = 'var(--luxe-taupe)'}
                    >¿Ya tienes cuenta? Inicia sesión</button>
                </div>
            </div>
        </div>
    );
};

export default Register;