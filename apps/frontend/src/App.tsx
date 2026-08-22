import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './app/router';
import SocketProvider from './app/providers/SocketProvider';
import './index.css';

function App() {
  return (
    <>
      <SocketProvider>
        <RouterProvider router={router} />
      </SocketProvider>
      <Toaster 
        position="top-center"
        toastOptions={{
          className: 'toast-custom',
          style: {
            background: 'var(--color-surface)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
          },
        }}
      />
    </>
  );
}

export default App;
