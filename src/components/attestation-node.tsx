import { Handle, Position } from '@xyflow/react';

type AttestationNodeData = {
    label: string;
    description: string;
};

type AttestationNodeProps = {
    data: AttestationNodeData;
};

export function AttestationNode({ data }: AttestationNodeProps) {
    return (
        <div className="flex flex-col bg-card border-2 border-primary/30 rounded-xl p-4 shadow-lg min-w-[220px] max-w-[220px]">
            <Handle type="target" position={Position.Top} className="w-3 h-3" />

            <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-sm text-card-foreground">
                    {data.label}
                </span>
            </div>

            {data.description && (
                <p className="text-xs text-muted-foreground leading-tight">
                    {data.description}
                </p>
            )}

            <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
        </div>
    );
}
