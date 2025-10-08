import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

import { LoadingDots } from '@/components/loading-dots';
import { useStreamedResponse } from '@/hooks/use-streamed-response';

type StreamedResponseProps = {
    context_name: string;
    onComplete: (fullResponse: string, reasoningContent: string) => void;
    onToolCallRequired?: (toolCall: unknown) => void;
    triggerKey?: number; // Used to re-trigger streaming after tool execution
};

export function StreamedResponse({
    context_name,
    onComplete,
    onToolCallRequired,
    triggerKey = 0
}: StreamedResponseProps) {
    const iterationRef = useRef(0);
    const maxIterations = 5;

    const { response, reasoningContent: _reasoningContent, loading, error, wordCount } = useStreamedResponse({
        context_name,
        onComplete: (fullResponse, reasoning) => {
            iterationRef.current += 1;
            if (iterationRef.current >= maxIterations) {
                console.warn('Max iterations reached');
            }
            onComplete(fullResponse, reasoning);
        },
        onToolCallRequired: (toolCall) => {
            if (onToolCallRequired) {
                onToolCallRequired(toolCall);
            }
        },
        triggerKey
    });

    // Reset iteration counter when context changes
    useEffect(() => {
        // console.log(`🔄 StreamedResponse context changed to: ${context_name}`);
        iterationRef.current = 0;
    }, [context_name]);

    return (
        <div className="whitespace-pre-wrap">
            {loading && wordCount < 5
                ? (
                        <div className="flex flex-col">
                            <span className="animate-pulse">Generating...</span>
                            <LoadingDots />
                        </div>
                    )
                : (
                        <ReactMarkdown>{response}</ReactMarkdown>
                    )}
            {error && (
                <span className="text-red-600">
                    Error:
                    {' '}
                    {error}
                </span>
            )}
        </div>
    );
}
