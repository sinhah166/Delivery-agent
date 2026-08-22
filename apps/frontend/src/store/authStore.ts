import { create } from 'zustand';

interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
  vehicleType: string;
  currentLatitude: number;
  currentLongitude: number;
  currentLoad: number;
  maxCapacity: number;
  rating: number;
  totalDeliveries: number;
  onTimeDeliveries: number;
}

interface AuthState {
  token: string | null;
  agent: Agent | null;
  isAuthenticated: boolean;
  login: (token: string, agent: Agent) => void;
  logout: () => void;
  updateAgent: (agent: Partial<Agent>) => void;
}

const safeParse = (str: string | null) => {
  if (!str || str === 'undefined') return null;
  try { return JSON.parse(str); } catch { return null; }
};

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('rq_token') === 'undefined' ? null : localStorage.getItem('rq_token'),
  agent: safeParse(localStorage.getItem('rq_agent')),
  isAuthenticated: !!localStorage.getItem('rq_token') && localStorage.getItem('rq_token') !== 'undefined',
  login: (token, agent) => {
    localStorage.setItem('rq_token', token);
    localStorage.setItem('rq_agent', JSON.stringify(agent));
    set({ token, agent, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('rq_token');
    localStorage.removeItem('rq_agent');
    set({ token: null, agent: null, isAuthenticated: false });
  },
  updateAgent: (updates) => set((state) => {
    const agent = state.agent ? { ...state.agent, ...updates } : null;
    if (agent) localStorage.setItem('rq_agent', JSON.stringify(agent));
    return { agent };
  }),
}));
