import { useUserModel } from '@/store';
import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { CUR_USER_KEY } from '@/lib/constants';
import { CachePolicies, useFetch } from 'use-http';
import { useEffect, useRef } from 'react';
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
    siblings: Array<{
        rfilename: string;
    }>;
    spaces: Array<string>;
    createdAt: string;
};

const sessionModelDetails: Record<string, ModelDetails | undefined> = {};

function RouteComponent() {
    const { name } = Route.useParams();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const model = useUserModel(currentUser, name);
    const modelDetailUrlRef = useRef<string | null>(null);
    const modelDetailQueriedRef = useRef(false);

    if (model?.url) {
        try {
            const modelUrl = URL.parse(model.url);
            if (modelUrl?.host === 'huggingface.co') {
                const comps = modelUrl.pathname.split('/');
                modelDetailUrlRef.current = `/api/models/${comps[1]}/${comps[2]}`;
            }
        } catch (e) {
            console.error('Invalid model URL:', model.url, e);
        }
    }

    const { get, data: remoteModelDetails } = useFetch(
        'https://huggingface.co',
        {
            mode: 'cors',
            cachePolicy: CachePolicies.NO_CACHE,
            interceptors: {
                request: (initObj) => {
                    console.log('Requesting model details from:', initObj);
                    const { route, options } = initObj;
                    if (!route || route === '') {
                        modelDetailQueriedRef.current = false;
                        throw new Error('Model URL is not set');
                    }
                    return options;
                }
            },
            // onNewData(currData, newData) {
            //     console.log('Fetched model details:', currData, newData);
            // },
            onError: (error) => {
                console.error('Error fetching model details:', error.error);
                toast.error('Failed to fetch model details.');
            }
        },
        [modelDetailUrlRef.current]
    );

    useEffect(() => {
        modelDetailUrlRef.current = null;
        modelDetailQueriedRef.current = false;
    }, [name]);

    if (!model) return <div className="p-4">Loading model...</div>;

    if (
        model &&
        modelDetailUrlRef.current &&
        modelDetailQueriedRef.current &&
        remoteModelDetails?.id
    ) {
        sessionModelDetails[model.name] = remoteModelDetails;
    }

    const enhancedModelDetails = {
        ...model,
        remote: sessionModelDetails[model?.name ?? '']
    };

    if (enhancedModelDetails.remote) modelDetailQueriedRef.current = true;

    if (modelDetailUrlRef.current && !modelDetailQueriedRef.current) {
        modelDetailQueriedRef.current = true;
        get(modelDetailUrlRef.current);
    }

    // Handle copy to clipboard
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast('Copied to clipboard', {
                description: `${field} has been copied to your clipboard.`
            });
        });
    };

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
    const dSize = prettyBytes(enhancedModelDetails.file_size);
    const dTokenizer = enhancedModelDetails.tokenizer_name ?? '-';

    return (
        <div className="space-y-2 w-full">
            <div className="h-12 p-4 font-bold capitalize">{model.name}</div>
            <div className="space-y-2">
                <div className="p-4 space-y-2">
                    <Label>URL</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={model.url} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(model.url, 'Model URL')
                            }
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy model url</span>
                        </Button>
                    </div>
                </div>
                <div className="p-4 space-y-2">
                    <Label>Type</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={model.description.task} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(
                                    model.description.task,
                                    'Model Type'
                                )
                            }
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy model type</span>
                        </Button>
                    </div>
                </div>
                <div className="p-4 space-y-2">
                    <Label>Description</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={model.description.brief} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(
                                    model.description.brief,
                                    'Model Description'
                                )
                            }
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">
                                Copy model description
                            </span>
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-3 gap-2 border-t">
                    <div className="p-4 space-y-2">
                        <Label>License</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{dLicense}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(dLicense, 'Model License')
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                    Copy model license
                                </span>
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        <Label>Size</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{dSize}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(dSize, 'Model Size')
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">Copy model size</span>
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        <Label>Stats</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{dLikes}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(`${dLikes}`, 'Model Stats')
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                    Copy model stats
                                </span>
                            </Button>
                        </div>
                    </div>
                    {/* <div className="p-4 space-y-2">
                        <Label>Downloads</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{dDownloads}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        `${dDownloads}`,
                                        'Model Downloads'
                                    )
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">Copy model downloads</span>
                            </Button>
                        </div>
                    </div> */}
                    <div className="p-4 space-y-2">
                        <Label>Downloads</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{dDownloads}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        `${dDownloads}`,
                                        'Model Downloads'
                                    )
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                    Copy model downloads
                                </span>
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        <Label>Tokenizer</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{dTokenizer}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        `${dTokenizer}`,
                                        'Model Tokenizer'
                                    )
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                    Copy model tokenizer
                                </span>
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        <Label>Creation</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{dCreatedAgo}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        `${dCreatedAt}`,
                                        'Model Created At'
                                    )
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                    Copy model created at
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
                {/* <div className="space-y-2">
                    <Label>Tokenizer type</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={model.tokenizer_name} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-5 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(model.name, 'Model Tokenizer Name')
                            }
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy tokenizer name</span>
                        </Button>
                    </div>
                </div> 
                <div>
                    <pre>{JSON.stringify(remoteModelDetails, null, 2)}</pre>
                </div>*/}
            </div>
        </div>
    );
}
