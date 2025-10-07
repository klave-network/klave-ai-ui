import { createFileRoute } from '@tanstack/react-router';
import { CopyIcon } from 'lucide-react';
import prettyBytes from 'pretty-bytes';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { CachePolicies, useFetch } from 'use-http';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLlModel, useMcpModel, useVlModel } from '@/hooks/use-klave-ai-store';
import { copyToClipboard } from '@/lib/utils';

export const Route = createFileRoute('/_auth/models/$name')({
    component: RouteComponent
});

type ModelDetails = {
    id: string;
    private: boolean;
    tags: string[];
    downloads: number;
    likes: number;
    author: string;
    cardData: Record<string, string>;
    siblings: Array<{ rfilename: string }>;
    spaces: Array<string>;
    createdAt: string;
};

const sessionModelDetails: Record<string, ModelDetails | undefined> = {};

function RouteComponent() {
    const { name } = Route.useParams();

    // Try to find model in LL models first, then VL models
    const llModel = useLlModel(name);
    const vlModel = useVlModel(name);
    const mcpModel = useMcpModel(name);

    // Prefer LL model if exists, otherwise VL model
    const model = llModel ?? vlModel ?? mcpModel ?? null;

    const [modelDetailUrl, setModelDetailUrl] = useState<string | null>(null);
    const modelDetailQueriedRef = useRef(false);

    // Derive model detail URL if from huggingface.co
    useEffect(() => {
        if (model?.metadata.url) {
            try {
                const modelUrl = new URL(model.metadata.url);
                if (modelUrl.host === 'huggingface.co') {
                    const comps = modelUrl.pathname.split('/').filter(Boolean);
                    if (comps.length >= 2) {
                        setModelDetailUrl(
                            `/api/models/${comps[0]}/${comps[1]}`
                        );
                        modelDetailQueriedRef.current = false;
                    }
                }
                else {
                    setModelDetailUrl(null);
                }
            }
            catch (e) {
                console.error('Invalid model URL:', model.metadata.url, e);
                setModelDetailUrl(null);
            }
        }
        else {
            setModelDetailUrl(null);
        }
    }, [model?.metadata.url]);

    const { get, data: remoteModelDetails } = useFetch<ModelDetails>(
        'https://huggingface.co',
        {
            mode: 'cors',
            cachePolicy: CachePolicies.NO_CACHE,
            interceptors: {
                request: (initObj) => {
                    if (!initObj.route) {
                        modelDetailQueriedRef.current = false;
                        throw new Error('Model URL is not set');
                    }
                    return initObj.options;
                }
            },
            onError: (error) => {
                console.error('Error fetching model details:', error.error);
                toast.error('Failed to fetch model details.');
            }
        },
        [modelDetailUrl]
    );

    // Fetch remote model details once when URL changes
    useEffect(() => {
        if (modelDetailUrl && !modelDetailQueriedRef.current) {
            modelDetailQueriedRef.current = true;
            get(modelDetailUrl);
        }
    }, [modelDetailUrl, get]);

    // Cache remote details per model name
    useEffect(() => {
        if (model && remoteModelDetails?.id) {
            sessionModelDetails[model.name] = remoteModelDetails;
        }
    }, [model, remoteModelDetails]);

    const enhancedModelDetails = {
        ...model,
        remote: sessionModelDetails[model?.name ?? '']
    };

    // Extract remote details safely
    const dSize = prettyBytes(enhancedModelDetails.file_size ?? 0);

    if (!model)
        return <div className="p-4">Loading model...</div>;

    return (
        <div className="space-y-2 w-full">
            <div className="h-12 p-4 font-bold capitalize">{model.name}</div>

            <div className="space-y-2">
                {/* URL */}
                <ModelDetailField
                    label="URL"
                    value={model.metadata.url}
                    onCopy={() => copyToClipboard(model.metadata.url, 'Model URL')}
                />

                {/* Type */}
                <ModelDetailField
                    label="Type"
                    value={model.metadata.description.task}
                    onCopy={() =>
                        copyToClipboard(model.metadata.description.task, 'Model Type')}
                />

                {/* Description */}
                <ModelDetailField
                    label="Description"
                    value={model.metadata.description.brief}
                    onCopy={() =>
                        copyToClipboard(
                            model.metadata.description.brief,
                            'Model Description'
                        )}
                />

                {/* Size */}
                <ModelDetailField
                    label="Size"
                    value={dSize}
                    onCopy={() => copyToClipboard(dSize, 'Model Size')}
                    isSmall
                />

            </div>
        </div>
    );
}

type ModelDetailFieldProps = {
    label: string;
    value: string;
    onCopy: () => void;
    isSmall?: boolean;
};

function ModelDetailField({
    label,
    value,
    onCopy,
    isSmall = false
}: ModelDetailFieldProps) {
    return (
        <div
            className={`p-4 space-y-2 ${isSmall ? 'text-gray-500 text-sm' : ''}`}
        >
            <Label>{label}</Label>
            <div className="flex items-center gap-2">
                <Input disabled value={value} />
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 hover:cursor-pointer"
                    onClick={onCopy}
                >
                    <CopyIcon className="h-3.5 w-3.5" />
                    <span className="sr-only">
                        Copy
                        {label.toLowerCase()}
                    </span>
                </Button>
            </div>
        </div>
    );
}
