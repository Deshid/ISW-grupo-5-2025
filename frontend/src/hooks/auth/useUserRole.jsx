export default function useUserRole() {
    // Puedes cambiar esto según dónde guardes el usuario
    const user = JSON.parse(sessionStorage.getItem('usuario')) || {};
    const rol = user.rol || null;

    // Helpers para permisos
    const isAdmin = rol === "administrador";
    const isSecretario = rol === "secretario";
    const isTesorero = rol === "tesorero";
    const isUsuario = rol === "usuario";
    const isPresidente = rol === "presidente";

    // Puedes agregar más helpers según tus necesidades
    return { rol, isAdmin, isSecretario, isTesorero, isUsuario, isPresidente };
}