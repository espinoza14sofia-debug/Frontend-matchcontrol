const API_URL = "http://localhost:5000/api"; // Cambia esto por la URL de tu backend

export const authService = {

    login: async (nickname, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Nickname: nickname,
                Password: password
            })
        });
        return await response.json();
    },

    // Para el Registro  
    register: async (userData) => {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                Nombre_Completo: userData.nombre,
                Nickname: userData.nickname,
                Email: userData.email,
                Password_Hash: userData.password,
                Id_Rol: 4 // Asignamos el rol de "Usuario" por defecto  
            })
        });
        return await response.json();
    }
};