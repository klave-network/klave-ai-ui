import React, { useRef, useState } from 'react';
import { toast } from 'sonner';

import { getFileUploadToken, updateDrive } from '@/api/klave-drive';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { urlToId } from '@/lib/utils';
import { prepareFile } from '@/utils/file-tools';

// Define the props expected by the Dropzone component
type DropzoneProps = {
    klaveDriveId: string;
    onChange?: React.Dispatch<React.SetStateAction<string[]>>;
    onCompleted?: () => void;
    className?: string;
    fileExtension?: string;
    maxFiles?: number;
    maxFileSize?: number; // in bytes
};

// Create the Dropzone component receiving props
export function Dropzone({
    klaveDriveId,
    onChange,
    onCompleted,
    className,
    fileExtension,
    maxFiles = 10,
    maxFileSize = 50 * 1024 * 1024, // 50MB default
    ...props
}: DropzoneProps) {
    // Initialize state variables using the useState hook
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [fileInfo, setFileInfo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: string }>({});

    // Function to validate files
    const validateFiles = (files: FileList): { valid: File[]; errors: string[] } => {
        const valid: File[] = [];
        const errors: string[] = [];

        if (files.length > maxFiles) {
            errors.push(`Maximum ${maxFiles} files allowed`);
            return { valid, errors };
        }

        Array.from(files).forEach((file) => {
            if (file.size > maxFileSize) {
                errors.push(`${file.name} exceeds maximum size of ${Math.round(maxFileSize / (1024 * 1024))}MB`);
            }
            else if (fileExtension && !file.name.endsWith(`.${fileExtension}`)) {
                errors.push(`${file.name} does not have the required extension .${fileExtension}`);
            }
            else {
                valid.push(file);
            }
        });

        return { valid, errors };
    };

    // Function to handle drag over event
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    // Function to handle processing of uploaded files
    const handleFiles = async (files: FileList) => {
        if (!fileInputRef.current || !klaveDriveId) {
            setError('Missing required components for upload');
            return;
        }

        // Validate files first
        const { valid: validFiles, errors: validationErrors } = validateFiles(files);

        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            validationErrors.forEach(error => toast.error(error));
            return;
        }

        if (validFiles.length === 0) {
            setError('No valid files to upload');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress({});
        setFileInfo(`Preparing ${validFiles.length} file(s) for upload...`);

        const uploadPromises = validFiles.map(async (file) => {
            try {
                const fileKey = file.name;

                setUploadProgress(prev => ({ ...prev, [fileKey]: 'Preparing...' }));
                setFileInfo(`Preparing ${file.name}...`);

                // Prepare the file (encrypt and get digest)
                const { encryptedBlob, digest, key } = await prepareFile(file);

                if (!encryptedBlob || !key || !digest) {
                    throw new Error('Error preparing file for upload');
                }

                setUploadProgress(prev => ({ ...prev, [fileKey]: 'Getting token...' }));
                setFileInfo(`Getting upload token for ${file.name}...`);

                // Get upload token
                const uploadToken = await getFileUploadToken({
                    driveId: urlToId(klaveDriveId),
                    digestB64: digest
                });

                setUploadProgress(prev => ({ ...prev, [fileKey]: 'Uploading...' }));
                setFileInfo(`Uploading ${file.name}...`);

                // Upload the encrypted file
                const data = new FormData();
                data.append('token', uploadToken.result.tokenB64);
                data.append('file', encryptedBlob);

                const rawResponse = await fetch('/api/file', {
                    method: 'POST',
                    body: data
                });

                if (!rawResponse.ok) {
                    const errBody = await rawResponse.json().catch(() => null);
                    throw new Error(`Upload failed ${rawResponse.status}: ${errBody?.error ?? rawResponse.statusText}`);
                }

                const response = await rawResponse.json();

                setUploadProgress(prev => ({ ...prev, [fileKey]: 'Updating drive...' }));
                setFileInfo(`Updating drive with ${file.name}...`);

                // Update drive with file information
                await updateDrive({
                    driveId: urlToId(klaveDriveId),
                    operation: 'addFile',
                    file: {
                        digestB64: digest,
                        name: file.name,
                        type: file.type,
                        key,
                        tokenB64: response.uploadToken
                    }
                });

                setUploadProgress(prev => ({ ...prev, [fileKey]: 'Completed' }));
                toast.success(`${file.name} uploaded successfully`);
                return file.name;
            }
            catch (error) {
                console.error(`Error uploading ${file.name}:`, error);
                const errorMessage = error instanceof Error ? error.message : 'Upload failed';
                setUploadProgress(prev => ({ ...prev, [file.name]: `Error: ${errorMessage}` }));
                toast.error(`Failed to upload ${file.name}: ${errorMessage}`);
                throw error;
            }
        });

        try {
            const uploadedFiles = await Promise.allSettled(uploadPromises);
            const successful = uploadedFiles
                .filter(result => result.status === 'fulfilled')
                .map(result => (result as PromiseFulfilledResult<string>).value);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }

            if (successful.length > 0) {
                setFileInfo(`Successfully uploaded ${successful.length} file(s)`);
                setTimeout(() => setFileInfo(null), 3000);

                // Notify parent components
                onChange?.(successful);
                onCompleted?.();
            }
            else {
                setError('All uploads failed');
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            setError(errorMessage);
            setFileInfo(null);
            console.error('Upload error:', error);
        }
        finally {
            setIsUploading(false);
            setUploadProgress({});
        }
    };

    // Function to handle drop event
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const { files } = e.dataTransfer;
        handleFiles(files);
    };

    // Function to handle file input change event
    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = e.target;
        if (files) {
            handleFiles(files);
        }
    };

    // Function to simulate a click on the file input element
    const handleButtonClick = () => {
        if (fileInputRef.current && !isUploading) {
            fileInputRef.current.click();
        }
    };

    return (
        <Card
            className={`bg-muted hover:border-muted-foreground/50 border-2 border-dashed ${
                isUploading ? 'pointer-events-none opacity-50' : 'hover:cursor-pointer'
            } ${className}`}
            {...props}
            onClick={handleButtonClick}
        >
            <CardContent
                className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <div className="text-muted-foreground flex items-center justify-center">
                    <span className="text-lg font-medium">
                        {isUploading ? 'Uploading...' : 'Drag Files to Upload or'}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto flex h-8 space-x-2 px-0 pl-1 text-lg"
                        disabled={isUploading}
                    >
                        Click Here
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept={fileExtension ? `.${fileExtension}` : '*'}
                        onChange={handleFileInputChange}
                        className="hidden"
                        multiple
                        disabled={isUploading}
                    />
                </div>
                {fileInfo && <p className="text-muted-foreground">{fileInfo}</p>}
                {error && <span className="text-red-500">{error}</span>}
                {Object.keys(uploadProgress).length > 0 && (
                    <div className="w-full space-y-1">
                        {Object.entries(uploadProgress).map(([fileName, status]) => (
                            <div key={fileName} className="flex justify-between text-xs">
                                <span className="truncate">{fileName}</span>
                                <span className="ml-2 text-muted-foreground">{status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
