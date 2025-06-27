import { useState, useCallback } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList,
    FileUploadTrigger
} from '@/components/ui/file-upload';
import { Upload, X, Database } from 'lucide-react';
import { toast } from 'sonner';
import {
    getModels,
    ragCreate,
    ragAddDocument,
    ragDocumentList
} from '@/api/klave-ai';
import { pgsqlCreate, pgsqlList } from '@/api/klave-pg';
import { CUR_USER_KEY } from '@/lib/constants';

export const Route = createFileRoute('/_auth/data/new')({
    component: RouteComponent
});

function RouteComponent() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const onFileReject = useCallback((file: File, message: string) => {
        toast(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`
        });
    }, []);

    const readFileAsText = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    resolve(content);
                } else {
                    reject(new Error('Failed to read file as text'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    };

    const buildRag = async (currentUser: string) => {
        try {
            // Get available models
            const models = await getModels();
            console.log('Available models:', models);

            // Create PostgreSQL database
            const database_id = await pgsqlCreate({
                host: 'cuyegue.secretivecomputing.tech',
                dbname: 'klave_rag',
                user: 'klave',
                password: 'RlOsujsb3M6zZ78'
            });
            console.log('Database created with ID:', database_id);

            // List databases to verify creation
            const retrieved_database_id = await pgsqlList();
            console.log('Retrieved database list:', retrieved_database_id);

            // Create RAG instance
            const rag_id = await ragCreate({
                database_id: database_id,
                rag_name: 'rag_demo1',
                model_name: 'mistral'
            });
            console.log('RAG created with ID:', rag_id);

            // Process each uploaded file
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                // Only process text files
                if (
                    !file.type.startsWith('text/') &&
                    !file.name.endsWith('.txt') &&
                    !file.name.endsWith('.md')
                ) {
                    toast.error(`Skipping ${file.name}`, {
                        description: 'Only text files are supported for RAG'
                    });
                    continue;
                }

                try {
                    const content = await readFileAsText(file);

                    await ragAddDocument({
                        rag_id: rag_id,
                        document: {
                            url: file.name,
                            version: '1.0',
                            length: content.length,
                            content: content,
                            date: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
                            content_type: file.type || 'text/plain',
                            controller_public_key:
                                'controller_public_key_example'
                        }
                    });

                    toast.success(`Document added: ${file.name}`, {
                        description: `Content length: ${content.length} characters`
                    });
                } catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    toast.error(`Failed to process ${file.name}`, {
                        description:
                            error instanceof Error
                                ? error.message
                                : 'Unknown error'
                    });
                }
            }

            // List documents to verify addition
            const doc_list = await ragDocumentList({ rag_id: rag_id });
            console.log('Documents in RAG:', doc_list);

            toast.success('RAG setup completed!', {
                description: `RAG ID: ${rag_id} with ${files.length} documents`
            });

            return rag_id;
        } catch (error) {
            console.error('Error building RAG:', error);
            toast.error('Failed to build RAG', {
                description:
                    error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    };

    const handleProcessFiles = async () => {
        if (files.length === 0) {
            toast.error('No files to process', {
                description: 'Please upload at least one file before processing'
            });
            return;
        }

        const currentUser = localStorage.getItem(CUR_USER_KEY) ?? '';
        if (!currentUser) {
            toast.error('User not found', {
                description: 'Please ensure you are logged in'
            });
            return;
        }

        setIsProcessing(true);
        try {
            await buildRag(currentUser);
        } catch (error) {
            // Error handling is done in buildRag function
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="p-4 space-y-6 w-full">
            <h3 className="text-xl font-medium">Upload new file</h3>
            <FileUpload
                maxFiles={2}
                maxSize={5 * 1024 * 1024}
                className="w-full max-w-md"
                value={files}
                onValueChange={setFiles}
                onFileReject={onFileReject}
                multiple
                accept="text/*,.txt,.md"
            >
                <FileUploadDropzone>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center justify-center rounded-full border p-2.5">
                            <Upload className="size-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm">
                            Drag & drop text files here
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Or click to browse (max 2 text files, up to 5MB
                            each)
                        </p>
                    </div>
                    <FileUploadTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-fit"
                        >
                            Browse files
                        </Button>
                    </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadList>
                    {files.map((file, index) => (
                        <FileUploadItem key={index} value={file}>
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                >
                                    <X />
                                </Button>
                            </FileUploadItemDelete>
                        </FileUploadItem>
                    ))}
                </FileUploadList>
            </FileUpload>

            {files.length > 0 && (
                <div className="flex justify-start">
                    <Button
                        onClick={handleProcessFiles}
                        disabled={isProcessing}
                        className="flex items-center gap-2"
                    >
                        <Database className="size-4" />
                        {isProcessing
                            ? 'Building RAG...'
                            : 'Build RAG Database'}
                    </Button>
                </div>
            )}
        </div>
    );
}
