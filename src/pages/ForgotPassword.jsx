import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handle = async (e) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--luxe-cream)' }}>
            <div style={{ width: '100%', maxWidth: '360px', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--luxe-wine)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--luxe-cream)" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: 400, color: 'var(--luxe-black)' }}>Recuperar cuenta</h2>
                    <div style={{ width: '32px', height: '1px', background: 'var(--luxe-wine)', margin: '12px auto 0' }} />
                </div>

                {sent ? (
                    <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '13px', color: 'var(--luxe-taupe)', lineHeight: 1.7 }}>Si el correo existe en nuestro sistema, recibirás instrucciones para restablecer tu contraseña.</p>
                        <button onClick={() => navigate('/')} style={{ marginTop: '2rem', background: 'none', border: 'none', fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--luxe-wine)' }}>Volver al inicio</button>
                    </div>
                ) : (
                    <form onSubmit={handle}>
                        <label style={{ display: 'block', fontSize: '10px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--luxe-taupe)', marginBottom: '8px' }}>Correo electrónico</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="correo@ejemplo.com"
                            style={{ width: '100%', background: 'var(--luxe-white)', border: '1px solid var(--luxe-sand)', borderRadius: '4px', padding: '14px 16px', fontSize: '14px', color: 'var(--luxe-black)', outline: 'none', marginBottom: '20px' }}
                            onFocus={e => e.target.style.borderColor = 'var(--luxe-wine)'}
                            onBlur={e => e.target.style.borderColor = 'var(--luxe-sand)'}
                        />
                        <button type="submit" style={{ width: '100%', background: 'var(--luxe-black)', color: 'var(--luxe-cream)', border: 'none', borderRadius: '4px', padding: '16px', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 500 }}
                            onMouseOver={e => e.target.style.background = 'var(--luxe-wine)'}
                            onMouseOut={e => e.target.style.background = 'var(--luxe-black)'}
                        >Enviar instrucciones</button>
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--luxe-taupe)' }}>Volver al inicio</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default ForgotPassword;