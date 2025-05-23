import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, Mic, Video, Paperclip } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from '@/components/ui/popover';
import { Link } from '@tanstack/react-router';

interface ChatInputProps {
    userPrompt: string;
    setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
    error: string | null;
    onSend: () => void;
    isDisabled?: boolean;
}

export const ChatInput = ({
    userPrompt,
    setUserPrompt,
    error,
    onSend,
    isDisabled
}: ChatInputProps) => {
    return (
        <div className="max-w-3xl w-full mt-auto">
            {error && (
                <p
                    className="bg-red-100 border border-red-500 rounded-xl p-4 text-red-500 text-sm font-semibold mb-2"
                    role="alert"
                >
                    {error}
                </p>
            )}
            <div className="flex flex-col gap-4 rounded-xl border p-4">
                <textarea
                    placeholder="Ask anything..."
                    className="flex-1 focus:outline-none resize-none field-sizing-content max-h-80"
                    rows={2}
                    disabled={isDisabled}
                    value={userPrompt}
                    onChange={(e) => setUserPrompt(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            onSend();
                        }
                    }}
                    aria-label="User prompt input"
                />
                <div className="flex justify-between">
                    <div>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="hover:cursor-pointer"
                                >
                                    <Paperclip className="h-4 w-4" />
                                    Add files
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="text-center">
                                Feature coming soon!
                            </PopoverContent>
                        </Popover>
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
                            asChild
                        >
                            <Link to="/chat/video">
                                <Video className="h-4 w-4" />
                                Use camera
                            </Link>
                        </Button>
                    </div>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    size="icon"
                                    className="hover:cursor-pointer"
                                    onClick={onSend}
                                    disabled={isDisabled}
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
    );
};
