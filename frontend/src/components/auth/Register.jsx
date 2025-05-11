import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser } from '../../redux/authSlice.js';
import { useNavigate } from 'react-router-dom';
import GoogleLogin from './GoogleLogin.jsx';
import { GoogleOAuthProvider } from "@react-oauth/google";



export default function RegisterPage() {

  const GoogleWrapper = () => (
    <GoogleOAuthProvider clientId=""> // please add your client id here
        <GoogleLogin></GoogleLogin>
    </GoogleOAuthProvider>
)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const { loading, error } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    role: '',
    coverImage: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await dispatch(registerUser(formData));

    if (registerUser.fulfilled.match(result)) {
      navigate('/login');
      setIsLoading(false);

    }
  };

  return (
    <div className="flex items-center flex-row justify-center min-h-screen bg-gray-100">
     <div className='flex w-1/2 flex-row justify-between'>
     {
      loading ? <h1>data is loading</h1> :  
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-md"
        encType="multipart/form-data"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Full Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Full Name</label>
          <input
            type="text"
            name="fullname"
            value={formData.fullname}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          >
            <option value="">Select role</option>
            <option value="admin">Admin</option>
            <option value="editor">Editor</option>
            <option value="user">User</option>
          </select>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded"
          />
        </div>

        {/* Image */}

                <div className="mb-6">
                    <label className="block mb-1 font-medium">Profile Image</label>
                    <input
                        type="file"
                        name="coverImage"
                        accept="image/*"
                        onChange={handleChange}
                        className="w-full"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition duration-200"
                >
                    Register
                </button>
        </form>
            }
            <span className='flex items-center flex-row justify-center'>Or</span>
            <span className='flex items-center flex-row justify-center'> <GoogleWrapper /> </span>     
     </div>
                         

        </div>
    );
}
