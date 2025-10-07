import { Handle, Position } from '@xyflow/react';
import { BadgeCheck } from 'lucide-react';

import { cn } from '@/lib/utils';

type AttestationNodeData = {
    label: string;
    description: string;
    hasQuote: boolean;
};

type AttestationNodeProps = {
    data: AttestationNodeData;
};

export function AttestationNode({ data }: AttestationNodeProps) {
    return (
        <div className={cn('flex flex-col bg-card border-2 rounded-xl p-4 shadow-lg min-w-[220px] max-w-[220px]', data.hasQuote ? 'border-green-400' : 'border-border')}>
            <Handle type="target" position={Position.Top} className="w-3 h-3" />

            <div className="flex gap-2 mb-2">
                {data.hasQuote && (
                    <BadgeCheck className="size-4 shrink-0 mt-0.5" />
                )}
                <div className="flex flex-col gap-2">
                    <span className="font-semibold text-sm text-card-foreground">
                        {data.label}
                    </span>
                    {data.description && (
                        <p className="text-xs text-muted-foreground leading-tight">
                            {data.description}
                        </p>
                    )}
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}
