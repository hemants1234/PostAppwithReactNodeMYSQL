
import RegisterPage from "./components/auth/Register.jsx";
import ShowPost from "./components/post/ShowPost.jsx";
import Login from "./components/auth/Login.jsx";
import CreatePost from "./components/post/CreatePost.jsx";
import UpdatePost from "./components/post/UpdatePost.jsx";
import Layout from "./Layout.jsx";
import { Provider } from 'react-redux';
import store from './redux/store.js';
import { RouterProvider, createBrowserRouter,Navigate } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute';
import ChangePassword from "./components/auth/ChangePassword.jsx";
//import Header from "./components/header/Header.jsx";



function App() {

  const router = createBrowserRouter([

    {
      path: "/login",
      element: <Login />
    },
    {
      path: "/register",
      element: <RegisterPage />
    },
    {
      path: "/change-password",
      element: <ChangePassword />
    },
    {
      path: '/',
      element: <Navigate to="/login" replace />
    },
   {
     path: '/',
     element: <Layout/>,
     children: [
       {
         path: "post-list",
         element:  (
          <ProtectedRoute>
            <ShowPost />
          </ProtectedRoute>
        )
       },
       {
        path: "post-create",
        element:  (
          <ProtectedRoute>
             <CreatePost />
          </ProtectedRoute>
        )
      },
      {
        path: "post-update/:id",
        element:  (
          <ProtectedRoute>
             <UpdatePost />
          </ProtectedRoute>
        )
      }
     ]
   },
   {
    path: "*",
    element: <Navigate to="/login" replace />
  }
 ])

  return (
    <div className="App">
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </div>
  );
}

export default App;
