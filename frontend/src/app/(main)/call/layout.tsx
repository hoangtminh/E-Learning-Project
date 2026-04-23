'use client';

import { CallProvider } from './contexts/CallContext';

export default function CallLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CallProvider>{children}</CallProvider>;
}
