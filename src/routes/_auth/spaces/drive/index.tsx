import { createFileRoute, useRouter } from '@tanstack/react-router';
import { useState } from 'react';

import type { DriveFile } from '@/lib/types';

import { getDriveContent } from '@/api/klave-drive';
import { Dropzone } from '@/components/dropzone';
import { NewSpaceDialog } from '@/components/modals/new-space-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { store } from '@/store';
import { loadFile } from '@/utils/file-tools';

export const Route = createFileRoute('/_auth/spaces/drive/')({
    component: RouteComponent,
    loader: async () => {
        const klaveDriveId = store.state.klaveDriveId;
        if (!klaveDriveId) {
            throw new Error('Drive ID not found');
        }
        const driveContent = await getDriveContent(klaveDriveId);
        console.log('Drive content received', driveContent);
        return { driveContent, klaveDriveId };
    }
});

function RouteComponent() {
    const router = useRouter();
    const { driveContent, klaveDriveId } = Route.useLoaderData();
    const [_uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());

    // Extract files from drive content
    const files: DriveFile[] = driveContent?.result?.files || [];

    const handleUploadCompleted = async () => {
        // Fetch drive content after upload completion
        // Invalidate current route to refetch drive content
        try {
            await getDriveContent(klaveDriveId);
            router.invalidate();
        }
        catch (error) {
            console.error('Error refreshing drive content:', error);
        }
    };

    const handleDownload = async (file: DriveFile) => {
        const doneFile = await loadFile(
            {
                name: file.name,
                type: file.type,
                size: -1,
                key: file.key,
                digest: file.digestB64,
                token: file.tokenB64
            },
            false
        );

        const link = document.createElement('a');

        link.download = file.name;
        link.href = doneFile.downloadUrl ?? '#';
        link.target = '_blank';
        link.click();
    };

    const toggleSelected = (file: DriveFile, checked: boolean | 'indeterminate') => {
        setSelectedFiles((prev) => {
            const next = new Set(prev);
            if (checked)
                next.add(file.id);
            else next.delete(file.id);
            return next;
        });
    };

    return (
        <div className="w-full h-full p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h2 className="font-owners font-medium tracking-wide text-xl">Files</h2>
                <NewSpaceDialog selectedFiles={selectedFiles} files={files} />
            </div>

            {/* File Upload Dropzone */}
            <Dropzone
                klaveDriveId={klaveDriveId}
                onChange={setUploadedFiles}
                onCompleted={handleUploadCompleted}
                className="w-full"
            />

            {/* Files Table */}
            <Table className="w-full">
                <TableCaption>
                    {files.length === 0
                        ? 'No files in this drive yet. Upload some files using the dropzone above.'
                        : `${files.length} file(s) in your drive.`}
                </TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead>File Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {files.map((file: DriveFile, index: number) => {
                        const isChecked = selectedFiles.has(file.id);
                        return (
                            <TableRow key={file.digestB64 || index}>
                                <TableCell className="font-medium">{file.name || 'Unknown'}</TableCell>
                                <TableCell>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="hover:cursor-pointer"
                                        onClick={() => {
                                            handleDownload(file);
                                        }}
                                    >
                                        Download
                                    </Button>
                                </TableCell>
                                <TableCell>
                                    <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={checked => toggleSelected(file, !!checked)}
                                    />
                                    {' '}
                                    Assign to RAG
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
                {files.length > 0 && (
                    <TableFooter>
                        <TableRow>
                            <TableCell colSpan={3}>Total Files</TableCell>
                            <TableCell className="text-right">{files.length}</TableCell>
                        </TableRow>
                    </TableFooter>
                )}
            </Table>
        </div>
    );
}
