import { Lock, Unplug } from 'lucide-react';
import React from 'react';

import { Button } from '@/components/ui/button';
import { useSecurityData } from '@/contexts/security-context';
import { useSidebar } from '@/hooks/use-sidebar';

export const SecureButton: React.FC = () => {
    const { securityData } = useSecurityData();
    const { toggleSidebar } = useSidebar('right');

    const quote = securityData?.quote;
    const verification = securityData?.verification;

    if (!quote || !verification) {
        return (
            <Button
                variant="ghost"
                disabled={true}
                className="hover:cursor-pointer hover:bg-gray-200 bg-gray-300 border border-gray-500"
            >
                <Unplug className="size-4" />
                Disconnected
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:cursor-pointer hover:bg-green-200 bg-green-300 border border-green-500"
        >
            <Lock />
        </Button>
    );
};
