/* eslint-disable ts/consistent-type-definitions */
interface Window {
    appKlaveCluster: (config: string | Record<string, unknown>) => void;
    appKlaveCommand: (
        dcApp: string,
        command: string,
        args?: Record<string, unknown>,
        id?: string
    ) => void;
    appKlaveHandlerStore: SecretariumClusterConfig;
    // appKlaveStore: Store;
    // appKlaveGremlin: (enable: boolean) => AynAction;
    appKlaveSubscriptions: Record<string, unknown>;
}

declare module '@cubone/react-file-manager' {
    export type File = {
        name: string;
        isDirectory: boolean;
        path: string;
        updatedAt?: string; // Optional: Last update timestamp in ISO 8601 format
        size?: number; // Optional: File size in bytes (only applicable for files)
    };
    export const FileManager: React.FC<FileManagerProps>;
    export type FileManagerProps = {
        acceptedFileTypes?: string;
        collapsibleNav?: boolean;
        defaultNavExpanded?: boolean;
        enableFilePreview?: boolean;
        filePreviewPath?: string;
        filePreviewComponent?: (file: File) => React.ReactNode;
        fileUploadConfig?: {
            url: string;
            method?: 'POST' | 'PUT';
            headers?: Record<string, string>;
        };
        files: File[];
        fontFamily?: string;
        height?: string | number;
        initialPath?: string;
        isLoading?: boolean;
        language?: 'en' | 'fr';
        layout?: 'grid' | 'list';
        maxFileSize?: number;
        onCopy?: (files: File[]) => void;
        onCut?: (files: File[]) => void;
        onCreateFolder?: (folderName: string, parentFolder: File) => void;
        onDelete?: (files: File[]) => void;
        onDownload?: (files: File[]) => void;
        onError?: (error: Error) => void;
        onFileOpen?: (file: File) => void;
        onFileUploaded?: (response: Record<string, unknown>) => void;
        onFileUploading?: (
            file: File,
            parentFolder: File
        ) => Record<string, unknown>;
        onLayoutChange?: (layout: 'grid' | 'list') => void;
        onPaste?: (files: File[], targetFolder: File) => void;
        onRefresh?: () => void;
        onRename?: (file: File, newName: string) => void;
        onSelect?: (files: File[]) => void;
        permissions?: {
            create?: boolean;
            upload?: boolean;
            move?: boolean;
            copy?: boolean;
            rename?: boolean;
            download?: boolean;
            delete?: boolean;
        };
        primaryColor?: string;
        width?: string | number;
    };
}
