import { Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import type { ChunkingStrategyType, DriveFile } from '@/lib/types';

import { getOcrList, getRagList, pgsqlCreate, ragAddDocument, ragCreate } from '@/api/klave-ai-rag-mcp-server';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
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
import { ChunkingStrategy } from '@/lib/types';
import { extractFileDate, getContentType, isTextFile, shouldUseOcr } from '@/lib/utils';
import { storeActions } from '@/store';
import { loadFile } from '@/utils/file-tools';

// Chunking strategy options for the dropdown
const CHUNKING_STRATEGY_OPTIONS = [
    { value: ChunkingStrategy.FIXED, label: 'Fixed Size', description: 'Split by fixed token count' },
    { value: ChunkingStrategy.SENTENCE, label: 'Sentence', description: 'Split by sentence boundaries' },
    { value: ChunkingStrategy.PARAGRAPH, label: 'Paragraph', description: 'Split by paragraph boundaries' }
];

type NewSpaceDialogProps = {
    selectedFiles: Set<string>;
    files: DriveFile[];
};

export function NewSpaceDialog({ selectedFiles, files }: NewSpaceDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedChunkingStrategy, setSelectedChunkingStrategy] = useState<ChunkingStrategyType>(
        ChunkingStrategy.SENTENCE
    );
    const [spaceName, setSpaceName] = useState<string>('');
    const [chunkSize, setChunkSize] = useState<number>(256);
    const [isProcessing, setIsProcessing] = useState(false);

    // Reset chunk size to default when switching away from fixed chunking strategy
    useEffect(() => {
        if (selectedChunkingStrategy !== ChunkingStrategy.FIXED) {
            setChunkSize(256);
        }
    }, [selectedChunkingStrategy]);

    const processDriveFile = async (file: DriveFile, ragId: string, ocrId: string) => {
        const contentType = getContentType(file.name);
        const useOcr = shouldUseOcr(file.name);
        const isText = isTextFile(file.name);

        try {
            if (!isText && !useOcr) {
                toast.error(`Unsupported file type: ${file.name}`);
                return false;
            }

            const loaded = await loadFile(
                {
                    name: file.name,
                    type: file.type,
                    size: -1,
                    key: file.key,
                    digest: file.digestB64,
                    token: file.tokenB64
                },
                true,
                isText ? 'text' : 'base64'
            );

            const content = loaded.content ?? '';

            await ragAddDocument({
                rag_id: ragId,
                document: {
                    url: file.name,
                    version: '1.0',
                    length: content.length,
                    content,
                    date: extractFileDate(),
                    content_type: contentType,
                    controller_public_key: 'controller_public_key_example'
                },
                nb_chars_per_chunk: chunkSize,
                overlap_ratio: 0.1,
                chunking_strategy: selectedChunkingStrategy,
                ocr_id: ocrId,
                perform_ocr: useOcr,
                batch_size: 100
            });

            toast.success(`Document added: ${file.name}`, {
                description: `${useOcr ? '(with OCR)' : '(direct text)'}`
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
            if (selectedFiles.size === 0) {
                toast.error('No files selected', { description: 'Select at least one file to assign to RAG' });
                return;
            }
            if (!spaceName.trim()) {
                toast.error('Please enter a space name', {
                    description: 'A space name is required to create the space'
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

            const database_id = await pgsqlCreate({
                host: 'hellomylovelies.secretivecomputing.org',
                dbname: 'klave_rag',
                user: 'klave',
                password: 'RlOsujsb3M6zZ78'
            });

            const rag_id = await ragCreate({
                database_id,
                rag_name: `rag_uat_${spaceName.trim() || `rag_uat_${Date.now()}`}`,
                model_name: 'Qwen3-Embedding-8B',
                tool_name: `tool_rag_uat_${spaceName.trim() || `rag_uat_${Date.now()}`}`
            });

            const ocr = await getOcrList();
            const ocrId = ocr[0]?.ocr_id ?? '';

            let successCount = 0;
            let failCount = 0;

            const byId = new Map(files.map(f => [f.id, f]));
            for (const id of selectedFiles) {
                const f = byId.get(id);
                if (!f)
                    continue;
                const success = await processDriveFile(f, rag_id, ocrId);
                if (success)
                    successCount++;
                else failCount++;
            }

            if (successCount > 0) {
                const ragSets = await getRagList();
                storeActions.addRagDataSets(ragSets);
                toast.success('RAG setup completed!', {
                    description: `RAG ID: ${rag_id} with ${successCount} documents processed${
                        failCount > 0 ? ` (${failCount} failed)` : ''
                    }`
                });
                setOpen(false);
                setSpaceName('');
                setSelectedChunkingStrategy(ChunkingStrategy.SENTENCE);
                setChunkSize(256);
            }

            if (failCount === selectedFiles.size) {
                throw new Error('All files failed to process');
            }
        }
        catch (error) {
            console.error('Error building RAG:', error);
            toast.error('Failed to build RAG', {
                description: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        finally {
            setIsProcessing(false);
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isProcessing) {
            await buildRag();
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button disabled={selectedFiles.size === 0}>
                    <Plus />
                    New Space
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Space</DialogTitle>
                    <DialogDescription>
                        Create your space here. Click save when you&apos;re done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="grid gap-4">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="space-name">Space Name</Label>
                            <Input
                                id="space-name"
                                type="text"
                                placeholder="Enter a name for your space"
                                value={spaceName}
                                onChange={e => setSpaceName(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Chunking Strategy</Label>
                            <Select
                                value={selectedChunkingStrategy}
                                onValueChange={value =>
                                    setSelectedChunkingStrategy(value as ChunkingStrategyType)}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select chunking strategy" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Chunking strategies</SelectLabel>
                                        {CHUNKING_STRATEGY_OPTIONS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                <span>{option.label}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {option.description}
                                                </span>
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid gap-2">
                            <Label>Chunk Size</Label>
                            <Select
                                value={chunkSize.toString()}
                                onValueChange={value => setChunkSize(Number(value))}
                                disabled={selectedChunkingStrategy !== ChunkingStrategy.FIXED}
                            >
                                <SelectTrigger className="w-full">
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
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isProcessing} type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isProcessing}>
                            {isProcessing ? 'Creating...' : 'Save'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
