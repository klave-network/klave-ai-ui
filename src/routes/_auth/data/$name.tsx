import { useUserRagDataSet } from '@/store';
import { createFileRoute } from '@tanstack/react-router';
import { CUR_USER_KEY } from '@/lib/constants';
import { truncateId } from '@/lib/utils';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyIcon, FileText } from 'lucide-react';
import { ragDocumentList } from '@/api/klave-ai';
import { type Document } from '@/lib/types';

export const Route = createFileRoute('/_auth/data/$name')({
    component: RouteComponent,
    loader: async ({ params }) => {
        const { name } = params;
        const ragDocList = await ragDocumentList({ rag_id: name });

        if (!ragDocList) throw new Error('RAG not found');

        return { ragDocList };
    }
});

function RouteComponent() {
    const { name } = Route.useParams();
    const { ragDocList } = Route.useLoaderData();
    const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
    const rag = useUserRagDataSet(currentUser, name);

    // Handle copy to clipboard
    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast('Copied to clipboard', {
                description: `${field} has been copied to your clipboard.`
            });
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return dateString;
        }
    };

    if (!rag) return <div className="p-4">Loading RAG details...</div>;

    const documents: Document[] = ragDocList || [];

    return (
        <div className="space-y-2 w-full">
            <div className="h-12 p-4 font-bold capitalize">
                {truncateId(rag.rag_id)}
            </div>

            {/* RAG Information Section */}
            <div className="space-y-2">
                <div className="p-4 space-y-2">
                    <Label>RAG ID</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={rag.rag_id} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(rag.rag_id, 'RAG ID')
                            }
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy RAG ID</span>
                        </Button>
                    </div>
                </div>
                <div className="p-4 pt-0 space-y-2">
                    <Label>Model Name</Label>
                    <div className="flex items-center gap-2">
                        <Input disabled value={rag.model_name} />
                        <Button
                            variant="ghost"
                            size="icon"
                            className="size-6 hover:cursor-pointer"
                            onClick={() =>
                                copyToClipboard(rag.model_name, 'Model Name')
                            }
                        >
                            <CopyIcon className="h-3.5 w-3.5" />
                            <span className="sr-only">Copy model name</span>
                        </Button>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t">
                    <div className="p-4 space-y-2">
                        <Label>Database ID</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{truncateId(rag.database_id)}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        rag.database_id,
                                        'Database ID'
                                    )
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                    Copy database ID
                                </span>
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-2">
                        <Label>Table Name</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{rag.table_name}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        rag.table_name,
                                        'Table Name'
                                    )
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">Copy table name</span>
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 space-y-2 col-span-2">
                        <Label>Chunk Length</Label>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                            <span>{rag.chunk_length}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-5 hover:cursor-pointer"
                                onClick={() =>
                                    copyToClipboard(
                                        `${rag.chunk_length}`,
                                        'Chunk Length'
                                    )
                                }
                            >
                                <CopyIcon className="h-3.5 w-3.5" />
                                <span className="sr-only">
                                    Copy chunk length
                                </span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Section */}
            <div className="border-t pt-6 px-4">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">Documents</h3>
                </div>

                {documents.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No documents found in this RAG dataset</p>
                        <p className="text-sm">
                            Upload documents to get started
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {documents.map((doc, index) => (
                            <div
                                key={doc.id || index}
                                className="border rounded-lg p-4 bg-card hover:bg-accent/50 transition-colors"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="p-2 rounded-md bg-primary/10">
                                        <FileText className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-medium truncate">
                                                {doc.url}
                                            </h4>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-5 hover:cursor-pointer"
                                                onClick={() =>
                                                    copyToClipboard(
                                                        doc.url,
                                                        'Document URL'
                                                    )
                                                }
                                            >
                                                <CopyIcon className="h-3 w-3" />
                                                <span className="sr-only">
                                                    Copy document URL
                                                </span>
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-medium">
                                                    Size:
                                                </span>{' '}
                                                {formatFileSize(doc.length)}
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Type:
                                                </span>{' '}
                                                {doc.content_type}
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Version:
                                                </span>{' '}
                                                {doc.version}
                                            </div>
                                            <div>
                                                <span className="font-medium">
                                                    Date:
                                                </span>{' '}
                                                {formatDate(doc.date)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="py-2 text-sm text-gray-500">
                            Total: {documents.length} document
                            {documents.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
