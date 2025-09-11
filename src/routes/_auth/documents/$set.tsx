import { createFileRoute } from '@tanstack/react-router';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLlModel } from '@/hooks/use-klave-ai-store';

export const Route = createFileRoute('/_auth/documents/$set')({
    component: RouteComponent
});

function RouteComponent() {
    const { set } = Route.useParams();
    const model = useLlModel(set);

    // Handle copy to clipboard
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast('Copied to clipboard', {
                description: `${field} has been copied to your clipboard.`
            });
        });
    };

    if (!model)
        return <div className="p-4">Model not found</div>;

    return (
        <div className="p-4 space-y-2 w-1/3">
            <div className="space-y-2">
                <Label>Model name</Label>
                <div className="flex items-center gap-2">
                    <Input disabled value={model.name} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:cursor-pointer"
                        onClick={() =>
                            copyToClipboard(model.name, 'Model Name')}
                    >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy model name</span>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Model description</Label>
                <div className="flex items-center gap-2">
                    <Input disabled value={model.metadata.description.brief} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:cursor-pointer"
                        onClick={() =>
                            copyToClipboard(
                                model.metadata.description.brief,
                                'Model Description'
                            )}
                    >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy model description</span>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Model URL</Label>
                <div className="flex items-center gap-2">
                    <Input disabled value={model.metadata.url} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:cursor-pointer"
                        onClick={() => copyToClipboard(model.metadata.url, 'Model URL')}
                    >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy model url</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
