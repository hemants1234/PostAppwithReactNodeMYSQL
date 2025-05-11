import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/authSlice.js';
import { useNavigate, NavLink } from 'react-router-dom';
import { GoogleOAuthProvider } from "@react-oauth/google";

import GoogleLogin from './GoogleLogin.jsx';



export default function Login() {

  const GoogleWrapper = () => (
    <GoogleOAuthProvider clientId=""> // please add your client id here
       <GoogleLogin></GoogleLogin>
    </GoogleOAuthProvider>
  )

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginUser({ email, password }));

    if (loginUser.fulfilled.match(result)) {
      navigate('/post-list');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className='flex w-1/2 flex-row justify-between'>
      {loading ? <h1>Loading ....</h1> :
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded shadow-md w-full max-w-md"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block mb-1 font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
          >
            Log In
          </button>
          <div className='flex flex-row justify-between'>
            <span>
              <NavLink
                to="/change-password"
                className="text-blue-600 hover:text-blue-800"
              >
                Forgat Password ?
              </NavLink>
            </span>
            <span>
              <NavLink
                to="/register"
                className="text-blue-600 hover:text-blue-800"
              >
                Sign Up ?
              </NavLink>
            </span>
          </div>
        </form>
      }

      <span className='flex items-center flex-row justify-center'>Or</span>
      <span className='flex items-center flex-row justify-center'> <GoogleWrapper /> </span>
        </div>
    </div>
  );
}
