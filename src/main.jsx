import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import Home from "./Home"
import MyLists from "./pages/MyLists"
import MyList from "./pages/MyList"
import NewList from "./pages/NewList"
import AddProduct from './pages/AddProduct'
import UserProfile from './pages/UserProfile'

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/mylists", element: <MyLists /> },
  { path: "/mylist/:id", element: <MyList /> },
  { path: "/newlist", element: <NewList /> },
  { path: "/addproduct", element: <AddProduct /> },
  { path: "/userprofile", element: <UserProfile /> }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)


// --- AGREGA ESTO AQUÍ ABAJO ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registrado con éxito:', reg.scope))
      .catch(err => console.error('Fallo al registrar SW:', err));
  });
}