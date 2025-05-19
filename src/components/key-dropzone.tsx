import { useCallback } from 'react';
import {
    useDropzone,
    type DropzoneRootProps,
    type DropzoneInputProps
} from 'react-dropzone';
import { Card, CardContent } from '@/components/ui/card';
import { type KeyPair } from '@/lib/types';

type DropzoneProps = {
    onFileUpload: (data: KeyPair | null) => void;
};

export const KeyDropzone: React.FC<DropzoneProps> = ({ onFileUpload }) => {
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
                        } catch (error) {
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
        onDrop,
        accept: {
            'application/json': ['.secretarium']
        }
    });

    return (
        <Card className="w-full border-2 border-dashed bg-muted hover:cursor-pointer hover:border-muted-foreground/50">
            <CardContent
                className="flex flex-col items-center justify-center space-y-2 px-2 py-4 text-xs"
                {...(getRootProps() as DropzoneRootProps)}
            >
                <div className="flex items-center justify-center text-muted-foreground">
                    <input {...(getInputProps() as DropzoneInputProps)} />
                    <p className="text-center">
                        {isDragActive
                            ? 'Drop the key here...'
                            : "Drag 'n' drop some Secretarium keys here, or click to select key"}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};
