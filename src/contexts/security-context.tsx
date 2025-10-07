import type { ReactNode } from 'react';

import { createContext, use, useCallback, useMemo, useState } from 'react';

import type { QuoteResponse, VerifyResponse } from '@/lib/types';

export type SecurityData = {
    currentTime: number;
    challenge: number[];
    quote?: QuoteResponse;
    verification?: VerifyResponse;
};

type SecurityContextType = {
    securityData: SecurityData | null;
    setSecurityData: (data: SecurityData) => void;
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: ReactNode }) {
    const [securityData, setSecurityDataState] = useState<SecurityData | null>(null);

    const setSecurityData = useCallback((data: SecurityData) => {
        setSecurityDataState(data);
    }, []);

    const value = useMemo(() => ({ securityData, setSecurityData }), [securityData, setSecurityData]);

    return (
        <SecurityContext value={value}>
            {children}
        </SecurityContext>
    );
}

export function useSecurityData() {
    const context = use(SecurityContext);
    if (context === undefined) {
        throw new Error('useSecurityData must be used within a SecurityProvider');
    }
    return context;
}
