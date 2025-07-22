import { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';

import type { KeyPair } from '@/lib/types';

import { Card, CardContent } from '@/components/ui/card';

type DropzoneProps = {
    onFileUpload: (data: KeyPair | null) => void;
};

export const KeyDropzone: React.FC<DropzoneProps> = ({ onFileUpload }) => {
    useEffect(() => {
        return () => {
        };
    }, []);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            acceptedFiles.forEach((file) => {
                const reader = new FileReader();

                reader.onabort = () => console.log('File reading was aborted');
                reader.onerror = () => console.log('File reading failed');
                reader.onload = (event) => {
                    if (event.target?.result) {
                        try {
                            const data = JSON.parse(
                                event.target.result as string
                            ) as KeyPair;
                            onFileUpload(data);
                        }
                        catch (error) {
                            console.error('JSON parse error:', error);
                        }
                    }
                };

                reader.readAsText(file);
            });
        },
        [onFileUpload]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        preventDropOnDocument: false,
        noDragEventsBubbling: true,
        onDrop,
        accept: {
            'application/json': ['.secretarium', '.id', '.keypair']
        }
    });

    return (
        <Card className="w-full border border-dashed hover:bg-gray-50 hover:cursor-pointer hover:border-muted-foreground/50">
            <CardContent
                className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
                {...(getRootProps())}
            >
                <div className="flex items-center justify-center text-muted-foreground">
                    <input {...(getInputProps())} />
                    <p className="text-center">
                        {isDragActive
                            ? 'Drop the key here...'
                            : 'Drag your key or click to select one'}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
