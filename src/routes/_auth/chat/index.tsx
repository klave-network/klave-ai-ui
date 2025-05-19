import { createFileRoute } from '@tanstack/react-router';
import { ArrowUp, Mic, Video, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';

export const Route = createFileRoute('/_auth/chat/')({
    component: RouteComponent
});

function RouteComponent() {
    return (
        <div className="flex flex-col items-center h-full">
            <div className="flex flex-col gap-6 items-center justify-center h-full">
                <h2 className="text-2xl md:text-4xl">
                    Welcome to Sanctum by Klave
                </h2>
                <p className="text-center max-w-xl">
                    Introducing Sanctum by Klave – an advanced AI to challenge
                    assumptions, generate ideas and help you think beyond the
                    obvious.
                </p>
            </div>
            <div className="max-w-3xl w-full mt-auto">
                <div className="flex flex-col gap-4 rounded-xl border p-4">
                    <textarea
                        placeholder="Ask anything..."
                        className="flex-1 focus:outline-none resize-none field-sizing-content max-h-80"
                        rows={2}
                    />
                    <div className="flex justify-between">
                        <div>
                            <Button
                                variant="ghost"
                                className="hover:cursor-pointer"
                            >
                                <Paperclip className="h-4 w-4" />
                                Add files
                            </Button>
                            <Button
                                variant="ghost"
                                className="hover:cursor-pointer"
                            >
                                <Mic className="h-4 w-4" />
                                Use microphone
                            </Button>
                            <Button
                                variant="ghost"
                                className="hover:cursor-pointer"
                            >
                                <Video className="h-4 w-4" />
                                Use camera
                            </Button>
                        </div>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        size="icon"
                                        className="hover:cursor-pointer"
                                    >
                                        <ArrowUp className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>Send message</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>
            </div>
        </div>
    );
}
