"use client";

import useAccount from '@/hooks/useAccount';
import { createContext, useContext } from 'react';

export type AccountContextExposes = ReturnType<typeof useAccount>;

const AccountContext = createContext({} as AccountContextExposes);

export function useAccountContext() {
  return useContext(AccountContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const accountHook = useAccount();
  const exposes = {...accountHook };

  return <AccountContext.Provider value={exposes}>{children}</AccountContext.Provider>;
}
