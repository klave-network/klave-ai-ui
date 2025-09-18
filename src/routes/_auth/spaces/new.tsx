import { createFileRoute } from '@tanstack/react-router';
import { Database, Upload, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { ChunkingStrategyType } from '@/lib/types';

import { getOcrList, getRagList, pgsqlCreate, ragAddDocument, ragCreate } from '@/api/klave-ai-rag-mcp-server';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { useLlModels } from '@/hooks/use-klave-ai-store';
import { ChunkingStrategy } from '@/lib/types';
import { storeActions } from '@/store';

const FILE_TYPE_MAP: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.doc': 'application/msword',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.rtf': 'application/rtf',
    '.odt': 'application/vnd.oasis.opendocument.text',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.tiff': 'image/tiff',
    '.bmp': 'image/bmp',
    '.csv': 'text/csv',
    '.md': 'text/markdown'
};

const TEXT_EXTENSIONS = ['.txt', '.rtf', '.md', '.csv'];
const OCR_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.doc', '.ppt', '.odt', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'];

// Chunking strategy options for the dropdown
const CHUNKING_STRATEGY_OPTIONS = [
    { value: ChunkingStrategy.FIXED, label: 'Fixed Size', description: 'Split by fixed token count' },
    { value: ChunkingStrategy.SENTENCE, label: 'Sentence', description: 'Split by sentence boundaries' },
    { value: ChunkingStrategy.PARAGRAPH, label: 'Paragraph', description: 'Split by paragraph boundaries' }
];

export const Route = createFileRoute('/_auth/spaces/new')({
    component: RouteComponent
});

function RouteComponent() {
    const [files, setFiles] = useState<File[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedModel, setSelectedModel] = useState<string>('');
    const [selectedChunkingStrategy, setSelectedChunkingStrategy] = useState<ChunkingStrategyType>(ChunkingStrategy.SENTENCE);
    const [spaceName, setSpaceName] = useState<string>('');
    const [chunkSize, setChunkSize] = useState<number>(256);
    const llModels = useLlModels();

    // Reset chunk size to default when switching away from fixed chunking strategy
    useEffect(() => {
        if (selectedChunkingStrategy !== ChunkingStrategy.FIXED) {
            setChunkSize(256);
        }
    }, [selectedChunkingStrategy]);

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
                }
                else {
                    reject(new Error('Failed to read file as text'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    };

    const readFileAsBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result;
                if (typeof content === 'string') {
                    // Remove the data:mime/type;base64, prefix
                    const base64Content = content.split(',')[1] || content;
                    resolve(base64Content);
                }
                else {
                    reject(new Error('Failed to read file as base64'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsDataURL(file);
        });
    };

    const getFileExtension = (filename: string): string => {
        return `.${filename.split('.').pop()?.toLowerCase()}` || '';
    };

    const getContentType = (filename: string): string => {
        const extension = getFileExtension(filename);
        return FILE_TYPE_MAP[extension] || 'application/octet-stream';
    };

    const extractFileDate = (file: File): string => {
        // Use file's last modified date, or current date as fallback
        const fileDate = file.lastModified ? new Date(file.lastModified) : new Date();
        return fileDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    };

    const shouldUseOcr = (filename: string): boolean => {
        const extension = getFileExtension(filename);
        return OCR_EXTENSIONS.includes(extension);
    };

    const isTextFile = (filename: string): boolean => {
        const extension = getFileExtension(filename);
        return TEXT_EXTENSIONS.includes(extension);
    };

    const processFile = async (file: File, ragId: string) => {
        const extension = getFileExtension(file.name);
        const contentType = getContentType(file.name);
        const fileDate = extractFileDate(file);
        const useOcr = shouldUseOcr(file.name);
        const isText = isTextFile(file.name);
        const ocr = await getOcrList();

        let content: string;

        try {
            if (isText) {
                // Read as text directly
                content = await readFileAsText(file);
            }
            else if (useOcr) {
                // Read as base64 for OCR processing
                content = await readFileAsBase64(file);
            }
            else {
                toast.error(`Unsupported file type: ${file.name} (${extension})`);
                return false;
            }
            // Add document to RAG with OCR support
            await ragAddDocument({
                rag_id: ragId,
                document: {
                    url: file.name,
                    version: '1.0',
                    length: content.length,
                    content,
                    date: fileDate,
                    content_type: contentType,
                    controller_public_key: 'controller_public_key_example'
                },
                // Additional parameters for chunking and OCR
                nb_tokens_per_chunk: chunkSize,
                embd_window_size: 128,
                chunking_strategy: selectedChunkingStrategy,
                ocr_id: ocr[0].ocr_id ?? '',
                perform_ocr: useOcr
            });

            toast.success(`Document added: ${file.name}`, {
                description: `${useOcr ? '(with OCR)' : '(direct text)'} - Date: ${fileDate}`
            });

            return true;
        }
        catch (error) {
            console.error(`Error processing file ${file.name}:`, error);
            toast.error(`Failed to process ${file.name}`, {
                description: error instanceof Error ? error.message : 'Unknown error'
            });
            return false;
        }
    };

    const buildRag = async () => {
        try {
            // Create PostgreSQL database
            const database_id = await pgsqlCreate({
                host: 'hellomylovelies.secretivecomputing.org',
                dbname: 'klave_rag',
                user: 'klave',
                password: 'RlOsujsb3M6zZ78'
            });

            // Create RAG instance
            const rag_id = await ragCreate({
                database_id,
                rag_name: `rag_dev_${spaceName.trim() || `rag_dev_${Date.now()}`}`,
                model_name: selectedModel
            });

            // Process each uploaded file
            let successCount = 0;
            let failCount = 0;

            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                try {
                    const success = await processFile(file, rag_id);
                    if (success) {
                        successCount++;
                    }
                    else {
                        failCount++;
                    }
                }
                catch (error) {
                    console.error(`Error processing file ${file.name}:`, error);
                    failCount++;
                }
            }

            if (successCount > 0) {
                const ragSets = await getRagList();
                storeActions.addRagDataSets(ragSets);
                toast.success('RAG setup completed!', {
                    description: `RAG ID: ${rag_id} with ${successCount} documents processed${failCount > 0 ? ` (${failCount} failed)` : ''}`
                });
            }

            if (failCount === files.length) {
                throw new Error('All files failed to process');
            }

            return rag_id;
        }
        catch (error) {
            console.error('Error building RAG:', error);
            toast.error('Failed to build RAG', {
                description: error instanceof Error ? error.message : 'Unknown error'
            });
            throw error;
        }
    };

    const handleProcessFiles = async () => {
        if (!spaceName.trim()) {
            toast.error('Please enter a space name', {
                description: 'A space name is required to create the space'
            });
            return;
        }

        if (files.length === 0) {
            toast.error('No files to process', {
                description: 'Please upload at least one file before processing'
            });
            return;
        }

        if (!selectedModel) {
            toast.error('Please select a language model', {
                description: 'A language model is required to create the space'
            });
            return;
        }

        if (!selectedChunkingStrategy) {
            toast.error('Please select a chunking strategy', {
                description: 'A chunking strategy is required to process documents'
            });
            return;
        }

        setIsProcessing(true);
        try {
            await buildRag();
        }
        catch (error) {
            // Error handling is done in buildRag function
            console.error('Error building RAG:', error);
        }
        finally {
            setIsProcessing(false);
        }
    };

    // Count files by type for user feedback
    const textFileCount = files.filter(file => isTextFile(file.name)).length;
    const ocrFileCount = files.filter(file => shouldUseOcr(file.name)).length;
    const unsupportedCount = files.filter(file => !isTextFile(file.name) && !shouldUseOcr(file.name)).length;

    return (
        <div className="p-4 flex flex-col gap-6 w-full">
            <h3 className="text-xl font-medium">New space</h3>

            <div className="flex flex-col gap-2">
                <Label htmlFor="space-name">Space name</Label>
                <Input
                    id="space-name"
                    type="text"
                    placeholder="Enter a name for your space"
                    value={spaceName}
                    onChange={e => setSpaceName(e.target.value)}
                    className="w-[300px]"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label>Select model</Label>
                <Select value={selectedModel} onValueChange={value => setSelectedModel(value)}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select language model" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Available language models</SelectLabel>
                            {llModels.map(model => (
                                <SelectItem key={model.name} value={model.name}>
                                    {model.name}
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Select chunking strategy</Label>
                <Select value={selectedChunkingStrategy} onValueChange={value => setSelectedChunkingStrategy(value as ChunkingStrategyType)}>
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select chunking strategy" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Chunking strategies</SelectLabel>
                            {CHUNKING_STRATEGY_OPTIONS.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    <span>{option.label}</span>
                                    <span className="text-xs text-muted-foreground">{option.description}</span>
                                </SelectItem>
                            ))}
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Select chunk size</Label>
                <Select
                    value={chunkSize.toString()}
                    onValueChange={value => setChunkSize(Number(value))}
                    disabled={selectedChunkingStrategy !== ChunkingStrategy.FIXED}
                >
                    <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select chunk size" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Chunk sizes (tokens)</SelectLabel>
                            <SelectItem value="64">64</SelectItem>
                            <SelectItem value="96">96</SelectItem>
                            <SelectItem value="128">128</SelectItem>
                            <SelectItem value="192">192</SelectItem>
                            <SelectItem value="256">256</SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
            </div>

            <div className="flex flex-col gap-2">
                <Label>Upload files</Label>
                <FileUpload
                    maxFiles={10}
                    maxSize={5 * 1024 * 1024}
                    className="w-full max-w-md"
                    value={files}
                    onValueChange={setFiles}
                    onFileReject={onFileReject}
                    multiple
                    accept=".txt,.md,.csv,.rtf,.pdf,.docx,.pptx,.doc,.ppt,.odt,.png,.jpg,.jpeg,.tiff,.bmp"
                >
                    <FileUploadDropzone>
                        <div className="flex flex-col items-center gap-1 text-center">
                            <div className="flex items-center justify-center rounded-full border p-2.5">
                                <Upload className="size-6 text-muted-foreground" />
                            </div>
                            <p className="font-medium text-sm">
                                Drag & drop files here
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Text files, documents, PDFs, and images supported
                            </p>
                            <p className="text-muted-foreground text-xs">
                                (max 10 files, up to 5MB each)
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
                                {/* Show processing type indicator */}
                                <div className="text-xs text-muted-foreground">
                                    {isTextFile(file.name) && 'Text'}
                                    {shouldUseOcr(file.name) && 'OCR'}
                                    {!isTextFile(file.name) && !shouldUseOcr(file.name) && 'Unsupported'}
                                </div>
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
                    <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                            {textFileCount > 0 && (
                                <div>
                                    {textFileCount}
                                    {' '}
                                    text files (direct processing)
                                </div>
                            )}
                            {ocrFileCount > 0 && (
                                <div>
                                    {ocrFileCount}
                                    {' '}
                                    files requiring OCR
                                </div>
                            )}
                            {unsupportedCount > 0 && (
                                <div>
                                    {unsupportedCount}
                                    {' '}
                                    unsupported files (will be skipped)
                                </div>
                            )}
                        </div>

                        <div className="flex justify-start">
                            <Button
                                onClick={handleProcessFiles}
                                disabled={isProcessing || !selectedModel || !selectedChunkingStrategy}
                                className="flex items-center gap-2"
                            >
                                {isProcessing
                                    ? 'Adding files to space...'
                                    : 'Add files to space'}
                                <Database />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
