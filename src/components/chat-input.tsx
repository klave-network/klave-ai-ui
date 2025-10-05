import { ArrowUp } from 'lucide-react';
import React, { useRef } from 'react';

import type { QuoteResponse, VerifyResponse } from '@/lib/types';

import { AgentModeToggle } from '@/components/agent-mode-toggle';
import { SecureButton } from '@/components/secure-button';
import { ToolSelector } from '@/components/tool-selector';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';

type ChatInputProps = {
    userPrompt: string;
    setUserPrompt: React.Dispatch<React.SetStateAction<string>>;
    error: string | null;
    onSend: () => void;
    agentMode?: boolean;
    isDisabled?: boolean;
    secureButton: {
        currentTime: number;
        challenge: number[];
        quote?: QuoteResponse;
        verification?: VerifyResponse;
    };
};

export function ChatInput({
    userPrompt,
    setUserPrompt,
    error,
    onSend,
    agentMode = false,
    isDisabled: isParentDisabling,
    secureButton
}: ChatInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const isDisconnected = !secureButton.quote || !secureButton.verification;
    const isParentDisabled = isParentDisabling || isDisconnected;

    // Check if user has typed anything
    const hasContent = userPrompt.trim().length > 0;

    // "Send Button" is disabled if parent is disabling or if there's no content
    const isSendDisabled = isParentDisabled || !hasContent;

    const handleSend = () => {
        if (!isSendDisabled) {
            onSend();
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        // Don't focus textarea if clicking on buttons or other interactive elements
        const target = e.target as HTMLElement;
        const isInteractiveElement = target.closest('button')
            || target.closest('select')
            || target.closest('[role="button"]')
            || target.closest('[data-radix-collection-item]'); // For dropdown items

        if (!isInteractiveElement && textareaRef.current && !isParentDisabled) {
            textareaRef.current.focus();
        }
    };

    return (
        <div className="max-w-2xl w-full">
            {error && (
                <p
                    className="bg-red-100 border border-red-500 rounded-xl p-4 text-red-500 text-sm font-semibold mb-2"
                    role="alert"
                >
                    {error}
                </p>
            )}
            <div className="rounded-xl p-[1.5px] bg-gradient-to-r from-klave-cyan to-klave-blue shadow-centered shadow-gray/50">
                <div
                    className="flex flex-col gap-8 rounded-[calc(1rem-1.5px)] bg-white border p-4"
                    onClick={handleContainerClick}
                >
                    <textarea
                        ref={textareaRef}
                        placeholder={
                            isDisconnected
                                ? 'It looks like you might be disconnected :('
                                : 'Ask anything...'
                        }
                        className="flex-1 focus:outline-none resize-none field-sizing-content max-h-80"
                        rows={2}
                        disabled={isParentDisabled}
                        value={userPrompt}
                        onChange={e => setUserPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                if (!isSendDisabled) {
                                    handleSend();
                                }
                            }
                        }}
                        aria-label="User prompt input"
                    />
                    <div className="flex justify-between">
                        <div className="flex items-center gap-2">
                            <AgentModeToggle />
                            {agentMode && <ToolSelector />}
                        </div>
                        <div className="flex items-center gap-2 relative">
                            {/* "Secure Button" with transition that slides left when send button appears */}
                            <div className={`transition-transform duration-300 ease-in-out ${
                                (hasContent && !isParentDisabled) ? 'translate-x-0' : 'translate-x-11'
                            }`}
                            >
                                <SecureButton
                                    currentTime={secureButton.currentTime}
                                    challenge={secureButton.challenge}
                                    quote={secureButton.quote}
                                    verification={secureButton.verification}
                                />
                            </div>

                            {/* "Send Button" with slide-in animation */}
                            <div className={`transition-all duration-300 ease-out ${
                                (hasContent && !isParentDisabled)
                                    ? 'opacity-100 translate-x-0 pointer-events-auto'
                                    : 'opacity-0 -translate-x-8 pointer-events-none'
                            }`}
                            >
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                size="icon"
                                                className="hover:cursor-pointer"
                                                onClick={handleSend}
                                                disabled={isSendDisabled}
                                                tabIndex={hasContent ? 0 : -1}
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
            </div>
        </div>
    );
}
