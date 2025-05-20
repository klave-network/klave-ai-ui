import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState, useCallback } from 'react';
import { ArrowUp, Mic, Video, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { graphInitExecutionContext, inferenceAddPrompt } from '@/api/sanctum';
import { generateSimpleId } from '@/lib/utils';
import { storeActions } from '@/store';

export const Route = createFileRoute('/_auth/chat/')({
    component: RouteComponent
});

function RouteComponent() {
    const [userPrompt, setUserPrompt] = useState('');
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const currentUser = localStorage.getItem('currentUser');

    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setUserPrompt(event.target.value);
    };

    const handleCreateContext = useCallback(async () => {
        if (!userPrompt.trim()) {
            setError('Please enter a prompt before sending.');
            return;
        }

        setError(null);

        const contextId = generateSimpleId();
        const contextName = `stories_context_${contextId}`;
        try {
            const graphInitInput = {
                model_name: 'stories',
                context_name: contextName,
                system_prompt: 'You are are a helpful assistant.',
                temperature: 0.8,
                topp: 0.9,
                steps: 256,
                sliding_window: false
            };
            const addPromptInput = {
                context_name: contextName,
                user_prompt: userPrompt
            };
            const result1 = await graphInitExecutionContext(graphInitInput);
            const result2 = await inferenceAddPrompt(addPromptInput);

            console.log('Graph Init Result:', result1);
            console.log('Add Prompt Result:', result2);
            storeActions.createChat(currentUser ?? '', contextId, {
                id: generateSimpleId(),
                content: userPrompt,
                role: 'user'
            });
            navigate({ to: `/chat/${contextId}` });
        } catch (error) {
            console.error('Error: ', error);
            setError('Failed to create context');
        }
    }, [userPrompt]);

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
                {/* <StreamedResponse context_name="stories_context_2" /> */}
            </div>
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
                        value={userPrompt}
                        onChange={handleChange}
                        aria-label="User prompt input"
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
                                <TooltipTrigger asChild>
                                    <Button
                                        size="icon"
                                        className="hover:cursor-pointer"
                                        onClick={handleCreateContext}
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
