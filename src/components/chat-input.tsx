import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
// import {
//     Popover,
//     PopoverContent,
//     PopoverTrigger
// } from '@/components/ui/popover';
// import { Link } from '@tanstack/react-router';
import { SecureButton } from '@/components/secure-button';
import type { QuoteResponse, VerifyResponse } from '@/lib/types';

type ChatInputProps = {
    userPrompt: string;
    setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
    error: string | null;
    onSend: () => void;
    isDisabled?: boolean;
    secureButton: {
        currentTime: number;
        challenge: number[];
        quote: QuoteResponse;
        verification: VerifyResponse;
    };
};

export const ChatInput = ({
    userPrompt,
    setUserPrompt,
    error,
    onSend,
    isDisabled,
    secureButton
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
                <div className="flex justify-end">
                    {/* <div>
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
                            <Link to="/chat/video" search>
                                <Video className="h-4 w-4" />
                                Use camera
                            </Link>
                        </Button>
                    </div> */}
                    <div className="flex items-center gap-2">
                        <SecureButton
                            currentTime={secureButton.currentTime}
                            challenge={secureButton.challenge}
                            quote={secureButton.quote}
                            verification={secureButton.verification}
                        />
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
        </div>
    );
};
