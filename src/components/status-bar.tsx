import secretariumHandler from '@/lib/secretarium-handler';
import { cn } from '@/lib/utils';
import { CircleX, CircleCheck } from 'lucide-react';

export const StatusBar = () => {
    return (
        <div
            className={cn(
                'mt-auto h-6 px-4 text-sm flex items-center',
                secretariumHandler.isConnected() ? 'bg-green-400' : 'bg-red-400'
            )}
        >
            <span className="font-semibold">Connection status:</span>
            {secretariumHandler.isConnected() ? (
                <span className="ml-4 flex items-center gap-1">
                    <CircleCheck className="h-4 w-4" /> Connected
                </span>
            ) : (
                <span className="ml-4 flex items-center gap-1">
                    Disconnected <CircleX className="h-4 w-4" />
                </span>
            )}
        </div>
    );
};
