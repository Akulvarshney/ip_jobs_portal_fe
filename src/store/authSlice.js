import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

export const saveTheme = createAsyncThunk('auth/saveTheme', async (theme, { rejectWithValue }) => {
  try {
    const response = await api.patch('/api/auth/theme', { theme });
    return response.data.theme;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || 'Could not save your theme. Please try again.');
  }
}, {
  condition: (theme, { getState }) => {
    const { isAuthenticated, themeSaving, loading } = getState().auth;
    return isAuthenticated && !themeSaving && !loading && ['light', 'dark'].includes(theme);
  },
});

// Async thunk to fetch fresh user profile info
export const fetchCurrentUser = createAsyncThunk('auth/fetchCurrentUser', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || 'Failed to fetch user session');
  }
});

const initialState = {
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  loading: false,
  error: null,
  guestTheme: localStorage.getItem('portalGuestTheme') === 'light' ? 'light' : 'dark',
  themeSaving: false,
  themeRequestId: null,
  sessionRequestId: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
      state.themeSaving = false;
      state.themeRequestId = null;
      state.sessionRequestId = null;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      state.themeSaving = false;
      state.themeRequestId = null;
      state.sessionRequestId = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    setGuestTheme: (state, action) => {
      if (!['light', 'dark'].includes(action.payload)) return;
      state.guestTheme = action.payload;
      localStorage.setItem('portalGuestTheme', action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCurrentUser.pending, (state, action) => {
        state.loading = true;
        state.sessionRequestId = action.meta.requestId;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        if (state.sessionRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.sessionRequestId = null;
        state.user = action.payload;
        state.isAuthenticated = true;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        if (state.sessionRequestId !== action.meta.requestId) return;
        state.loading = false;
        state.sessionRequestId = null;
        state.error = action.payload;
      })
      .addCase(saveTheme.pending, (state, action) => {
        state.themeSaving = true;
        state.themeRequestId = action.meta.requestId;
      })
      .addCase(saveTheme.fulfilled, (state, action) => {
        if (state.themeRequestId !== action.meta.requestId || !state.user) return;
        state.user.theme = action.payload;
        state.themeSaving = false;
        state.themeRequestId = null;
        localStorage.setItem('user', JSON.stringify(state.user));
      })
      .addCase(saveTheme.rejected, (state, action) => {
        if (state.themeRequestId !== action.meta.requestId) return;
        state.themeSaving = false;
        state.themeRequestId = null;
      });
  },
});

export const { loginSuccess, updateUser, logout, setGuestTheme } = authSlice.actions;
export const selectTheme = (state) => state.auth.isAuthenticated
  ? (state.auth.user?.theme === 'light' ? 'light' : 'dark')
  : state.auth.guestTheme;
export default authSlice.reducer;
