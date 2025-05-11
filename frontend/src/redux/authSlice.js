import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { googleAuth } from '../api.js'; // adjust path as needed

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await fetch('http://localhost:3002/api/v1/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' // <-- this allows cookies
      });
      const data = await res.json();
      localStorage.setItem('LoginUser', JSON.stringify(data.data.user));

      console.log(data.data.user);
     // if (!res.ok) throw new Error(data.message || 'Login failed');

      localStorage.setItem('token', data.data.refreshToken);
      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

// google login


export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (code, thunkAPI) => {
    try {
      const response = await googleAuth(code);
      
				const token = response.data.accessToken;
        const role = 'user'
        const email =  response.data.UserData.email
        const fullname = response.data.UserData.fullname;
        const image = response.data.UserData.coverImage;
				const obj = { email, fullname, token, image, role };
				localStorage.setItem('user-info', JSON.stringify(obj));
        localStorage.setItem('token', token);


      console.log(response.data.UserData)
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);


// Async thunk for change-password

export const changePassword = createAsyncThunk(
    'auth/changePassword',

    async ({ oldPassword, newPassword }, thunkAPI) => {
      try {
        const res = await fetch('http://localhost:3002/api/v1/users/change-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ oldPassword, newPassword }),
          credentials: 'include' // <-- this allows cookies
        });
        const data = await res.json();
  
        console.log(data);
       // if (!res.ok) throw new Error(data.message || 'Login failed');
  
       // localStorage.setItem('token', data.data.refreshToken);
        return data;
      } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
      }
    }
  );

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',

    async ( thunkAPI) => {
      try {
        const res = await fetch('http://localhost:3002/api/v1/users/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        //  body: JSON.stringify({ }),
          credentials: 'include' // <-- this allows cookies
        });
        const data = await res.json();
  
        console.log(data);
       // if (!res.ok) throw new Error(data.message || 'Login failed');
        localStorage.removeItem('token');
        localStorage.removeItem('LoginUser');
        localStorage.removeItem('user-info')
       // localStorage.setItem('token', data.data.refreshToken);
        return data;
      } catch (err) {
        return thunkAPI.rejectWithValue(err.message);
      }
    }
  );


// Async thunk for registration
export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (formData, thunkAPI) => {
    try {
      const body = new FormData();
      for (let key in formData) {
        body.append(key, formData[key]);
      }

      const res = await fetch('http://localhost:3002/api/v1/users/register', {
        method: 'POST',
        body,
      });
      const data = await res.json();
        console.log(data);
     // if (!res.ok) throw new Error(data.message || 'Registration failed');

      return data;
    } catch (err) {
      return thunkAPI.rejectWithValue(err.message);
    }
  }
);

const initialState = {
  isAuthenticated: !!localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('token');
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      //google login 

      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.UserData;
      })


      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // change password
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
      })

      //logout user

      .addCase(logoutUser.fulfilled, (state, action) => {
        state.loading = false;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
