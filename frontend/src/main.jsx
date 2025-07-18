import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';
import Reservas from '@components/ReservaForm';
import Reclamos from "./pages/Reclamos"; // o la ruta correcta

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        path: '/home',
        element: <Home/>
      },
      {
        path: '/users',
        element: (
        <ProtectedRoute allowedRoles={['administrador']}>
          <Users />
        </ProtectedRoute>
        ),
    },
    {
      path: '/reclamos',
      element: <Reclamos/>
    }
    ]
    // rutas autorizadas para todos los usuarios autenticados
  },
  {
    path: '/auth',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  },
  {  path: '/reservas',
    element: <Reservas/>
  },
  
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
)