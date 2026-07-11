import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '../../types';interface ExtendedAuthState extends AuthState {
  currentCityId: string; // 'all' or specific
  currentBranchId: string; // 'all' or specific
}

const initialState: ExtendedAuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  currentCityId: 'all',
  currentBranchId: 'all'
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },
    switchContext: (state, action: PayloadAction<{ cityId?: string; branchId?: string }>) => {
      if (action.payload.cityId !== undefined) {
        state.currentCityId = action.payload.cityId;
        // Auto reset branch context when city changes
        state.currentBranchId = 'all';
      }
      if (action.payload.branchId !== undefined) {
        state.currentBranchId = action.payload.branchId;
      }
    },
    switchRole: (state, action: PayloadAction<import('../../types').UserRole>) => {
      if (state.user) {
        state.user.role = action.payload;
      }
    }
  }
});

export const { loginStart, loginSuccess, loginFailure, logout, switchContext, switchRole } = authSlice.actions;
export default authSlice.reducer;
