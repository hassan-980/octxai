import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthUserPayload } from '../../components/AuthView';
import { AdminUserPayload } from '../../data/adminData';
import { ViewName } from '../../types';

export type AppRoute = '/' | '/login' | '/signup' | '/dashboard' | '/admin';
export type DashboardView = Exclude<ViewName, 'landing'>;

export const AUTH_STORAGE_KEY = 'octxai_auth_user';
export const ADMIN_STORAGE_KEY = 'octxai_admin_user';

export function normalizeRoute(pathname: string): AppRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/login') return '/login';
  if (clean === '/signup') return '/signup';
  if (clean === '/dashboard') return '/dashboard';
  if (clean === '/admin' || clean.startsWith('/admin/')) return '/admin';
  return '/';
}

export function getStoredAuthUser(): AuthUserPayload | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUserPayload) : null;
  } catch {
    return null;
  }
}

export function getStoredAdminUser(): AdminUserPayload | null {
  try {
    const raw = localStorage.getItem(ADMIN_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminUserPayload) : null;
  } catch {
    return null;
  }
}

export interface AuthState {
  authUser: AuthUserPayload | null;
  adminUser: AdminUserPayload | null;
  routePath: AppRoute;
  activeView: DashboardView;
  pendingDashboardView: DashboardView | null;
  toastMsg: string | null;
}

const storedAuth = typeof window !== 'undefined' ? getStoredAuthUser() : null;
const storedAdmin = typeof window !== 'undefined' ? getStoredAdminUser() : null;
const initialPath: AppRoute =
  typeof window !== 'undefined'
    ? (() => {
        const parsed = normalizeRoute(window.location.pathname);
        if (parsed === '/dashboard' && !storedAuth) return '/login';
        return parsed;
      })()
    : '/';

const initialState: AuthState = {
  authUser: storedAuth,
  adminUser: storedAdmin,
  routePath: initialPath,
  activeView: 'overview',
  pendingDashboardView: null,
  toastMsg: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRoutePath(state, action: PayloadAction<AppRoute>) {
      state.routePath = action.payload;
    },
    setActiveView(state, action: PayloadAction<DashboardView>) {
      state.activeView = action.payload;
    },
    setPendingDashboardView(state, action: PayloadAction<DashboardView | null>) {
      state.pendingDashboardView = action.payload;
    },
    loginSellerSuccess(
      state,
      action: PayloadAction<{ user: AuthUserPayload; message: string }>
    ) {
      const { user, message } = action.payload;
      try {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } catch {
        // ignore storage errors
      }
      state.authUser = user;
      state.activeView = state.pendingDashboardView ?? 'overview';
      state.pendingDashboardView = null;
      state.routePath = '/dashboard';
      state.toastMsg = message;
    },
    logoutSeller(state) {
      try {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      state.authUser = null;
      state.routePath = '/login';
      state.toastMsg = 'Signed out successfully';
    },
    loginAdminSuccess(state, action: PayloadAction<AdminUserPayload>) {
      const admin = action.payload;
      try {
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(admin));
      } catch {
        // ignore storage errors
      }
      state.adminUser = admin;
      state.routePath = '/admin';
      state.toastMsg = `Welcome to Admin Console, ${admin.fullName}`;
    },
    logoutAdmin(state) {
      try {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      state.adminUser = null;
      state.routePath = '/admin';
      state.toastMsg = 'Signed out of Admin Console';
    },
    showToast(state, action: PayloadAction<string>) {
      state.toastMsg = action.payload;
    },
    clearToast(state) {
      state.toastMsg = null;
    },
  },
});

export const {
  setRoutePath,
  setActiveView,
  setPendingDashboardView,
  loginSellerSuccess,
  logoutSeller,
  loginAdminSuccess,
  logoutAdmin,
  showToast,
  clearToast,
} = authSlice.actions;

export default authSlice.reducer;
