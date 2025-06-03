import { useUserModel } from '@/store';
import { createFileRoute } from '@tanstack/react-router';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';
import { CUR_USER_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/models/$name')({
    component: RouteComponent
});

function RouteComponent() {
    const { name } = Route.useParams();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const model = useUserModel(currentUser, name);

    // Handle copy to clipboard
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast('Copied to clipboard', {
                description: `${field} has been copied to your clipboard.`
            });
        });
    };

    if (!model) return <div className="p-4">Model not found</div>;

    return (
        <div className="p-4 space-y-6 w-full">
            <h3 className="text-xl font-medium">Model details</h3>
            <div className="space-y-2">
                <Label>Model name</Label>
                <div className="flex items-center gap-2">
                    <Input disabled value={model.name} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:cursor-pointer"
                        onClick={() =>
                            copyToClipboard(model.name, 'Model Name')
                        }
                    >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy model name</span>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Model description</Label>
                <div className="flex items-center gap-2">
                    <Input disabled value={model.description} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:cursor-pointer"
                        onClick={() =>
                            copyToClipboard(
                                model.description,
                                'Model Description'
                            )
                        }
                    >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy model description</span>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Model URL</Label>
                <div className="flex items-center gap-2">
                    <Input disabled value={model.url} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:cursor-pointer"
                        onClick={() => copyToClipboard(model.url, 'Model URL')}
                    >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy model url</span>
                    </Button>
                </div>
            </div>
            <div className="space-y-2">
                <Label>Model tokenizer</Label>
                <div className="flex items-center gap-2">
                    <Input disabled value={model.tokenizer_name} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-6 hover:cursor-pointer"
                        onClick={() =>
                            copyToClipboard(model.name, 'Model Tokenizer Name')
                        }
                    >
                        <CopyIcon className="h-3.5 w-3.5" />
                        <span className="sr-only">Copy tokenizer name</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
