import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate();

    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');

        if (!nickname || !password) {
            setError('Por favor rellena los campos');
            return;
        }

        setLoading(true);
        try {
            // ── Llamada real al backend ──────────────────────────────
            const res = await fetch('http://localhost:3000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nickname, password }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Credenciales incorrectas');
            }

            const data = await res.json();

            // Guardar token y datos del usuario en localStorage
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));

            // Redirigir según el rol que devuelve el backend
            const rol = data.usuario?.rol?.nombre;
            if (rol === 'Admin') navigate('/dashboard-admin');
            else if (rol === 'Organizador') navigate('/dashboard-organizador');
            else if (rol === 'Arbitro') navigate('/dashboard-arbitro');
            else navigate('/dashboard-participante');

        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F1EE]">
            <div className="w-full max-w-sm px-8">

                {/* Logo y nombre — diseño original intacto */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-5">
                        <div className="bg-[#7C2220] p-5 rounded-full">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#F4F1EE" strokeWidth="2">
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                <path d="M4 22h16" />
                                <path d="M10 14.66V17c0 .55-.45 1-1 1H8v2h8v-2h-1c-.55 0-1-.45-1-1v-2.34" />
                                <path d="M12 2C9 2 7 4.5 7 7.5S9 13 12 13s5-2.5 5-5.5S15 2 12 2z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-[#5F2119]">
                        Match<span className="text-[#7C2220]">Control</span>
                    </h1>

                    <p className="text-[#A28C75] text-sm mt-2">
                        Gestión de torneos multicategoría
                    </p>
                </div>

                {/* Formulario — diseño original intacto */}
                <form onSubmit={handleLogin} className="space-y-3">

                    <input
                        type="text"
                        name="Nickname"
                        placeholder="Nombre de Usuario"
                        value={nickname}
                        onChange={(e) => setNickname(e.target.value)}
                        className="w-full bg-[#E8E4E1]/60 p-4 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75] border-none"
                    />

                    <input
                        type="password"
                        name="Password_Hash"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-[#E8E4E1]/60 p-4 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75] border-none"
                    />

                    {/* Mensaje de error — solo aparece si el login falla */}
                    {error && (
                        <p className="text-red-500 text-xs text-center pt-1">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#5F2119] text-[#D7C1A8] py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs mt-6 hover:bg-[#7C2220] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>

                </form>

                {/* Navegación — diseño original intacto */}
                <div className="mt-8 text-center flex flex-col space-y-4">

                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="text-[#A28C75] text-[10px] uppercase tracking-widest hover:text-[#7C2220] transition-colors font-bold"
                    >
                        ¿Olvidaste tu contraseña?
                    </button>

                    <button
                        onClick={() => navigate('/register')}
                        className="text-[#A28C75] text-[10px] uppercase tracking-widest hover:text-[#5F2119] transition-colors"
                    >
                        ¿No tienes cuenta? <span className="text-[#7C2220] font-bold">Regístrate</span>
                    </button>

                </div>

            </div>
        </div>
    );
};

export default Login;
