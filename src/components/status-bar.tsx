import secretariumHandler from '@/lib/secretarium-handler';
import { cn } from '@/lib/utils';
import { CircleX, CircleCheck } from 'lucide-react';

export const StatusBar = () => {
    return (
        <div
            className={cn(
                'mt-auto h-6 -mx-2 -mb-2 px-2 text-sm flex items-center justify-center',
                secretariumHandler.isConnected() ? 'bg-green-400' : 'bg-red-400'
            )}
        >
            {secretariumHandler.isConnected() ? (
                <span className="flex items-center gap-1">
                    <CircleCheck className="h-4 w-4" /> Connected
                </span>
            ) : (
                <span className="flex items-center gap-1">
                    Disconnected <CircleX className="h-4 w-4" />
                </span>
            )}
        </div>
    );
};
