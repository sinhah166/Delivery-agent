import { ReactNode } from 'react';

export default function MobileFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mobile-frame">
      {children}
    </div>
  );
}
