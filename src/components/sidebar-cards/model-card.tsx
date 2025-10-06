import { Link } from '@tanstack/react-router';
import { Bot } from 'lucide-react';

type ModelCardProps = {
    name: string;
    description: string;
};

export function ModelCard({ name, description }: ModelCardProps) {
    return (
        <Link
            search
            to="/models/$name"
            params={{ name }}
            activeProps={{
                className: 'bg-sidebar-accent'
            }}
            className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-center hover:bg-sidebar-accent/80 transition-colors"
        >
            <div className="p-1 h-8 w-8 rounded-md text-white bg-klave-blue flex justify-center items-center shrink-0">
                <Bot className="h-4 w-4" />
            </div>
            <div className="flex flex-col min-w-0">
                <span className="capitalize line-clamp-2 break-words">
                    {name}
                </span>
                <span className="text-xs text-gray-500 line-clamp-2 break-words">
                    {description}
                </span>
            </div>
        </Link>
    );
}
