import { createSlice } from '@reduxjs/toolkit';

const getInitialState = () => {
  try {
    const raw = localStorage.getItem('staffsync_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.token && parsed.user) {
        return {
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: true
        };
      }
    }
  } catch (err) {
    console.error('Failed to parse auth from storage', err);
  }
  return {
    user: null,
    token: null,
    isAuthenticated: false
  };
};

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    setCredentials: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('staffsync_auth', JSON.stringify({ user, token }));
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('staffsync_auth', JSON.stringify({ user: state.user, token: state.token }));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('staffsync_auth');
    }
  }
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;
