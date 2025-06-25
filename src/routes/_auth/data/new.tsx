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
import { Upload, X } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_auth/data/new')({
    component: RouteComponent
});

function RouteComponent() {
    const [files, setFiles] = useState<File[]>([]);

    const onFileReject = useCallback((file: File, message: string) => {
        toast(message, {
            description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`
        });
    }, []);

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
                            Or click to browse (max 2 files, up to 5MB each)
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
        </div>
    );
}
