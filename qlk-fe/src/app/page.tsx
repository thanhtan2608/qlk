'use client';

import { AuthProvider } from '@/lib/auth-context';
import { MainLayout } from '@/components/MainLayout';

export default function Home() {
  return (
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
}
