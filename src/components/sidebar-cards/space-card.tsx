import { Link } from '@tanstack/react-router';
import { File } from 'lucide-react';

type SpaceCardProps = {
    ragId: string;
    tableName: string;
    modelName: string;
};

export function SpaceCard({ ragId, tableName, modelName }: SpaceCardProps) {
    return (
        <Link
            search
            to="/spaces/$name"
            params={{ name: ragId }}
            activeProps={{
                className: 'bg-sidebar-accent'
            }}
            className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-center hover:bg-sidebar-accent/80 transition-colors"
        >
            <div className="p-1 h-8 w-8 rounded-md text-white bg-klave-blue flex justify-center items-center shrink-0">
                <File className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="capitalize line-clamp-2 break-words">
                    {tableName}
                </span>
                <span className="text-xs text-gray-500 line-clamp-2 break-words">
                    {modelName}
                </span>
            </div>
        </Link>
    );
}
