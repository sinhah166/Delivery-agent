import { useEffect, createContext, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { useDeliveryStore } from '../../store/deliveryStore';
import toast from 'react-hot-toast';

export const SocketContext = createContext<Socket | null>(null);

export default function SocketProvider({ children }: { children: ReactNode }) {
  const agent = useAuthStore(s => s.agent);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const { setActiveDelivery } = useDeliveryStore();

  useEffect(() => {
    if (!isAuthenticated || !agent?.id) return;

    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Socket connected');
      socket.emit('agent:join', agent.id);
    });

    socket.on('delivery:assigned', (data) => {
      toast.success('New delivery assigned!');
      setActiveDelivery(data);
    });

    socket.on('delivery:updated', (data) => {
      toast('Delivery status updated');
      setActiveDelivery(data);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, agent?.id]);

  return <SocketContext.Provider value={null}>{children}</SocketContext.Provider>;
}
