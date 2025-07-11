import { createFileRoute } from '@tanstack/react-router';
import { useUserLlModel, useUserVlModel } from '@/store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { CUR_USER_KEY } from '@/lib/constants';
import { CachePolicies, useFetch } from 'use-http';
import { useEffect, useRef, useState } from 'react';
import prettyBytes from 'pretty-bytes';
import { formatDistance } from 'date-fns';

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
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';

    // Try to find model in LL models first, then VL models
    const llModel = useUserLlModel(currentUser, name);
    const vlModel = useUserVlModel(currentUser, name);

    // Prefer LL model if exists, otherwise VL model
    const model = llModel ?? vlModel ?? null;

    const [modelDetailUrl, setModelDetailUrl] = useState<string | null>(null);
    const modelDetailQueriedRef = useRef(false);

    // Derive model detail URL if from huggingface.co
    useEffect(() => {
        if (model?.url) {
            try {
                const modelUrl = new URL(model.url);
                if (modelUrl.host === 'huggingface.co') {
                    const comps = modelUrl.pathname.split('/').filter(Boolean);
                    if (comps.length >= 2) {
                        setModelDetailUrl(
                            `/api/models/${comps[0]}/${comps[1]}`
                        );
                        modelDetailQueriedRef.current = false;
                    }
                } else {
                    setModelDetailUrl(null);
                }
            } catch (e) {
                console.error('Invalid model URL:', model.url, e);
                setModelDetailUrl(null);
            }
        } else {
            setModelDetailUrl(null);
        }
    }, [model?.url]);

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

    // Copy to clipboard helper
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast(`Copied to clipboard`, {
                description: `${field} has been copied to your clipboard.`
            });
        });
    };

    // Extract remote details safely
    const dLicense =
        enhancedModelDetails.remote?.tags
            ?.find((tag) => tag.includes('license:'))
            ?.split(':')[1]
            .toUpperCase() ?? '-';
    const dLikes = enhancedModelDetails.remote?.likes ?? '-';
    const dDownloads = enhancedModelDetails.remote?.downloads ?? '-';
    const dCreatedAt = enhancedModelDetails.remote?.createdAt
        ? new Date(enhancedModelDetails.remote.createdAt)
        : undefined;
    const dCreatedAgo = dCreatedAt
        ? formatDistance(dCreatedAt, new Date())
        : '-';
    const dSize = prettyBytes(enhancedModelDetails.file_size ?? 0);
    const dTokenizer = enhancedModelDetails.tokenizer_name ?? '-';

    if (!model) return <div className="p-4">Loading model...</div>;

    return (
        <div className="space-y-2 w-full">
            <div className="h-12 p-4 font-bold capitalize">{model.name}</div>

            <div className="space-y-2">
                {/* URL */}
                <ModelDetailField
                    label="URL"
                    value={model.url}
                    onCopy={() => copyToClipboard(model.url, 'Model URL')}
                />

                {/* Type */}
                <ModelDetailField
                    label="Type"
                    value={model.description.task}
                    onCopy={() =>
                        copyToClipboard(model.description.task, 'Model Type')
                    }
                />

                {/* Description */}
                <ModelDetailField
                    label="Description"
                    value={model.description.brief}
                    onCopy={() =>
                        copyToClipboard(
                            model.description.brief,
                            'Model Description'
                        )
                    }
                />

                <div className="grid grid-cols-3 gap-2 border-t">
                    {/* License */}
                    <ModelDetailField
                        label="License"
                        value={dLicense}
                        onCopy={() =>
                            copyToClipboard(dLicense, 'Model License')
                        }
                        isSmall
                    />

                    {/* Size */}
                    <ModelDetailField
                        label="Size"
                        value={dSize}
                        onCopy={() => copyToClipboard(dSize, 'Model Size')}
                        isSmall
                    />

                    {/* Likes */}
                    <ModelDetailField
                        label="Stats"
                        value={`${dLikes}`}
                        onCopy={() =>
                            copyToClipboard(`${dLikes}`, 'Model Stats')
                        }
                        isSmall
                    />
                </div>

                {/* Downloads */}
                <ModelDetailField
                    label="Downloads"
                    value={`${dDownloads}`}
                    onCopy={() =>
                        copyToClipboard(`${dDownloads}`, 'Model Downloads')
                    }
                    isSmall
                />

                {/* Tokenizer */}
                <ModelDetailField
                    label="Tokenizer"
                    value={dTokenizer}
                    onCopy={() =>
                        copyToClipboard(dTokenizer, 'Model Tokenizer')
                    }
                    isSmall
                />

                {/* Creation */}
                <ModelDetailField
                    label="Creation"
                    value={dCreatedAgo}
                    onCopy={() =>
                        copyToClipboard(
                            dCreatedAt?.toISOString() ?? '',
                            'Model Created At'
                        )
                    }
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
                    <span className="sr-only">Copy {label.toLowerCase()}</span>
                </Button>
            </div>
        </div>
    );
}
