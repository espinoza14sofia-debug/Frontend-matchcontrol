import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        Nombre_Completo: '',
        Nickname: '',
        Email: '',
        Password_Hash: '',
        Id_Rol: 4
    });

    const [error, setError] = useState('');
    const [cargando, setCargando] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.Nombre_Completo || !formData.Nickname || !formData.Email || !formData.Password_Hash) {
            setError('Todos los campos son obligatorios');
            return;
        }

        const dataToSend = {
            nombreCompleto: formData.Nombre_Completo,
            nickname: formData.Nickname,
            email: formData.Email,
            passwordHash: formData.Password_Hash,
            idRol: 4,
        };

        setCargando(true);
        try {
            const response = await fetch('http://localhost:3000/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataToSend),
            });

            // Muestra el error real del backend (nickname duplicado, email duplicado)
            if (!response.ok) {
                const errorData = await response.json();
                setError(errorData.message || 'Error en el registro');
                return;
            }

            alert(`Usuario ${formData.Nickname} registrado correctamente`);
            navigate('/');

        } catch (err) {
            // Solo llega aquí si el servidor no responde
            setError('No se puede conectar con el servidor');
        } finally {
            setCargando(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F1EE]">
            <div className="w-full max-w-sm px-8">

                <div className="text-center mb-10">
                    <h2 className="text-lg font-light text-[#5F2119] tracking-[0.3em] uppercase">
                        Registro de Usuario
                    </h2>
                    <div className="h-[1px] w-12 bg-[#7C2220] mx-auto mt-4 opacity-40"></div>
                </div>

                <form onSubmit={handleRegister} className="space-y-3">

                    <input
                        type="text"
                        name="Nombre_Completo"
                        placeholder="Nombre Completo"
                        value={formData.Nombre_Completo}
                        onChange={handleChange}
                        disabled={cargando}
                        className="w-full bg-[#E8E4E1]/60 p-4 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75] disabled:opacity-50"
                    />

                    <input
                        type="text"
                        name="Nickname"
                        placeholder="Nombre de Usuario"
                        value={formData.Nickname}
                        onChange={handleChange}
                        disabled={cargando}
                        className="w-full bg-[#E8E4E1]/60 p-4 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75] disabled:opacity-50"
                    />

                    <input
                        type="email"
                        name="Email"
                        placeholder="Correo Electrónico"
                        value={formData.Email}
                        onChange={handleChange}
                        disabled={cargando}
                        className="w-full bg-[#E8E4E1]/60 p-4 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75] disabled:opacity-50"
                    />

                    <input
                        type="password"
                        name="Password_Hash"
                        placeholder="Contraseña"
                        value={formData.Password_Hash}
                        onChange={handleChange}
                        disabled={cargando}
                        className="w-full bg-[#E8E4E1]/60 p-4 rounded-2xl outline-none text-sm text-[#5F2119] placeholder-[#A28C75] disabled:opacity-50"
                    />

                    {/* Muestra el error real del backend */}
                    {error && (
                        <p className="text-[#7C2220] text-xs text-center pt-1">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={cargando}
                        className="w-full bg-[#5F2119] text-[#D7C1A8] py-4 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs mt-6 hover:bg-[#7C2220] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {cargando ? 'Registrando...' : 'Finalizar Registro'}
                    </button>

                </form>

                <div className="mt-10 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="text-[#A28C75] text-[10px] uppercase tracking-widest hover:text-[#5F2119] font-bold"
                    >
                        ¿Ya tienes cuenta? Iniciar sesión
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Register;