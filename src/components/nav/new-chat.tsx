import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function NewChat() {
    return (
        <>
            {/* Expanded: Full "New Chat" button */}
            <div className="px-4 group-data-[collapsible=icon]:hidden">
                <Button className="flex items-center w-full font-owners font-medium tracking-wide hover:cursor-pointer" variant="gradient">
                    New Chat
                </Button>
            </div>

            {/* Collapsed: Plus icon in gradient container */}
            <Tooltip>
                <div className="hidden group-data-[collapsible=icon]:flex justify-center px-4 pt-2">
                    <TooltipTrigger asChild>
                        <Button
                            size="icon"
                            className="flex items-center justify-center hover:cursor-pointer"
                            variant="gradient"
                        >
                            <Plus className="h-5 w-5" />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent
                        side="right"
                        align="center"
                    >
                        <p>New Chat</p>
                    </TooltipContent>
                </div>
            </Tooltip>
        </>
    );
}
