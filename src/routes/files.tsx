import { createFileRoute } from '@tanstack/react-router';
// import { FileManager } from "../components/fileManager";
// import type { File } from "@cubone/react-file-manager";
// import { useState } from 'react';

export const Route = createFileRoute('/files')({
    component: FilesComponent
});

function FilesComponent() {
    'use client';
    // const [files] = useState<File[]>([]);

    return null;
    // return <div>
    //     <FileManager
    //         enableFilePreview={false}
    //         files={files}
    //         fileUploadConfig={{
    //             url: 'demo.ai.127.0.0.1.xip.io:300/upload',
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json'
    //             }
    //         }}
    //         isLoading={false}
    //         onCut={() => { }}
    //         onCopy={() => { }}
    //         onPaste={() => { }}
    //         onRename={() => { }}
    //         onDownload={() => { }}
    //         onRefresh={() => { }}
    //         onSelect={() => { }}
    //         maxFileSize={10485760}
    //         filePreviewPath="/api/files/preview"
    //         acceptedFileTypes='pdf,txt,jpg,jpeg,png,gif'
    //         filePreviewComponent={(file: any) => (
    //             <div>
    //                 <h3>{file.name}</h3>
    //                 <p>Path: {file.path}</p>
    //                 <p>Size: {file.size ? `${file.size} bytes` : 'Unknown'}</p>
    //             </div>
    //         )}
    //     // onFileUploaded={(response) => {
    //     //     console.log('File uploaded:', response);
    //     //     // You can update the files state here if needed
    //     //     const newFile: File = {
    //     //         name: response.name as string,
    //     //         isDirectory: response.isDirectory as boolean,
    //     //         path: response.path as string
    //     //     }
    //     //     setFiles([...files, newFile])
    //     // }}
    //     />
    // </div>;
}
