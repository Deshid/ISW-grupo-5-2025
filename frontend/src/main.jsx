import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from '@pages/Login';
import Home from '@pages/Home';
import Users from '@pages/Users';
import Reclamos from '@pages/Reclamos';
import Register from '@pages/Register';
import Error404 from '@pages/Error404';
import Root from '@pages/Root';
import ProtectedRoute from '@components/ProtectedRoute';
import '@styles/styles.css';


import ReservasAdmin from '@pages/ReservasAdmin';
import Reclamos from "./pages/Reclamos";

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    errorElement: <Error404/>,
    children: [
      {
        path: '/home',
        element: <Home/>,
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
    },
      {  
        path: '/reservas',
        element: <Reservas/>
  },
    {
      path: '/reservas-admin',
      element: (
        <ProtectedRoute allowedRoles={['administrador']}>
          <ReservasAdmin />
        </ProtectedRoute>
      )
    },
    ]
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
  {
    path: '/reclamos',
    element: <Reclamos/>
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router}/>
)