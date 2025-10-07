import { Link } from '@tanstack/react-router';
import { Bot } from 'lucide-react';

import { getModelLogo } from '@/lib/utils';

type ModelCardProps = {
    name: string;
    description: string;
};

export function ModelCard({ name, description }: ModelCardProps) {
    const logoPath = getModelLogo(name);

    return (
        <Link
            search
            to="/models/$name"
            params={{ name }}
            activeProps={{
                className: 'bg-sidebar-accent'
            }}
            className="border rounded-xl p-3 bg-sidebar text-sm flex gap-2 items-start hover:bg-sidebar-accent/80 transition-colors"
        >
            <div className="h-5 w-5 flex items-center justify-center shrink-0">
                {logoPath
                    ? (
                            <img
                                src={logoPath}
                                alt={`${name} logo`}
                                className="h-4 w-4 object-contain"
                            />
                        )
                    : (
                            <Bot className="h-4 w-4" />
                        )}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
                <span className="font-medium break-words line-clamp-2">
                    {name}
                </span>
                <span className="text-xs text-muted-foreground break-words line-clamp-2">
                    {description}
                </span>
            </div>
        </Link>
    );
}
