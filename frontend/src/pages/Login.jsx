import { useNavigate } from 'react-router-dom';
import { login } from '@services/auth.service.js';
import Form from '@components/Form';
import useLogin from '@hooks/auth/useLogin.jsx';
import '@styles/form.css';
import '@styles/home.css';

const Login = () => {
    const navigate = useNavigate();
    const {
        errorEmail,
        errorPassword,
        errorData,
        handleInputChange
    } = useLogin();

    const loginSubmit = async (data) => {
        try {
            const response = await login(data);
            if (response.status === 'Success') {
                navigate('/home');
            } else if (response.status === 'Client error') {
                errorData(response.details);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="login-container"> 
        <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7fafc', zIndex: 2 }}>
            <div style={{ display: 'flex', width: '100%', maxWidth: '950px', minHeight: '500px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', borderRadius: '18px', background: '#fff', overflow: 'hidden', zIndex: 2 }}>
                {/* Izquierda: Formulario */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f4ffed', padding: '40px 24px' }}>
                    <Form
                        title="Iniciar sesión"
                        fields={[
                            {
                                label: "Correo electrónico",
                                name: "email",
                                placeholder: "example@gmail.cl",
                                fieldType: 'input',
                                type: "email",
                                required: true,
                                minLength: 15,
                                maxLength: 30,
                                errorMessageData: errorEmail,
                                validate: {
                                    emailDomain: (value) => value.endsWith('@gmail.cl') || value.endsWith('@gmail.com') || 'El correo debe terminar en @gmail.cl o @gmail.com'
                                },
                                onChange: (e) => handleInputChange('email', e.target.value),
                            },
                            {
                                label: "Contraseña",
                                name: "password",
                                placeholder: "**********",
                                fieldType: 'input',
                                type: "password",
                                required: true,
                                minLength: 8,
                                maxLength: 26,
                                pattern: /^[a-zA-Z0-9]+$/,
                                patternMessage: "Debe contener solo letras y números",
                                errorMessageData: errorPassword,
                                onChange: (e) => handleInputChange('password', e.target.value)
                            },
                        ]}
                        buttonText="Iniciar sesión"
                        onSubmit={loginSubmit}
                        footerContent={
                            <p>
                                ¿No tienes cuenta?, <a href="/register">¡Regístrate aquí!</a>
                            </p>
                        }
                    />
                </div>
                {/* Derecha: Texto */}
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#119970', color: '#fff', flexDirection: 'column', padding: '40px 24px' }}>
                    <div style={{ textAlign: 'center' }}>
                        <h1 style={{ fontSize: '2.8rem', fontWeight: 'bold', marginBottom: '0.5em', color: '#fff' }}>Condominios</h1>
                        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#ffe082' }}>Grupo 5</h2>
                    </div>
                </div>
            </div>
            <div className="home-images">
            </div>
        </main>
        </div>
    );
};

export default Login;