import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// API endpoints
const BASE_URL = 'http://localhost:3002/api/v1/posts';

// READ - Get all posts
export const fetchPosts = createAsyncThunk('posts/fetchPosts', async (_, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/get-post`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    const data = await res.json();
  //  console.log(data);
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// CREATE - Add a new post
export const createPost = createAsyncThunk('posts/createPost', async (newPost, thunkAPI) => {
  try {
    const res = await fetch(`${BASE_URL}/create-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(newPost)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// UPDATE - Edit a post
export const updatePost = createAsyncThunk('posts/updatePost', async (updatedPost, thunkAPI) => {
    console.log("this is updated post", updatedPost);
  try {
    const res = await fetch(`${BASE_URL}/update-post/${updatedPost.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(updatedPost)
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

// DELETE - Remove a post
export const deletePost = createAsyncThunk('posts/deletePost', async (postId, thunkAPI) => {
  try {
    await fetch(`${BASE_URL}/delete-post/${postId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    return postId;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.message);
  }
});

const postsSlice = createSlice({
  name: 'posts',
  initialState: {
    posts: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // FETCH POSTS
      .addCase(fetchPosts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.posts = action.payload.posts;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // CREATE POST
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.push(action.payload.post);
      })

      // UPDATE POST
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
      })

      // DELETE POST
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
      });
  }
});

export default postsSlice.reducer;
