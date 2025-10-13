import { Hammer, Lightbulb } from 'lucide-react';
import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { Spinner } from '@/components/spinner';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useStreamedResponse } from '@/hooks/use-streamed-response';

type StreamedResponseProps = {
    context_name: string;
    onComplete: (fullResponse: string, reasoningContent: string) => void;
    processingToolCall: boolean;
    onToolCallRequired?: (toolCall: unknown) => void;
    triggerKey?: number; // Used to re-trigger streaming after tool execution
};

export function StreamedResponse({
    context_name,
    onComplete,
    processingToolCall,
    onToolCallRequired,
    triggerKey = 0
}: StreamedResponseProps) {
    const iterationRef = useRef(0);
    const maxIterations = 5;

    const { response, reasoningContent, streamingToolCalls, loading, error, wordCount } = useStreamedResponse({
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
        <div className="w-full space-y-2">
            {/* Display reasoning content in real-time */}
            {reasoningContent && reasoningContent.trim() && (
                <div className="w-full">
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="reasoning" className="border bg-card rounded-lg px-2">
                            <AccordionTrigger className="text-xs font-mono text-muted-foreground hover:no-underline py-2">
                                <span className="flex items-center gap-2">
                                    <Lightbulb className="size-4" />
                                    {' '}
                                    Thinking...
                                </span>
                            </AccordionTrigger>
                            <AccordionContent className="text-xs text-gray-700 whitespace-pre-wrap">
                                {reasoningContent}
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}

            {/* Display accumulated tool calls in real-time */}
            {streamingToolCalls.length > 0 && (
                <div className="w-full">
                    <Accordion type="multiple" className="w-full space-y-2">
                        {streamingToolCalls.map((toolCall, idx) => (
                            <AccordionItem
                                key={idx}
                                value={`tool-call-${idx}`}
                                className="border bg-card rounded-lg px-2"
                            >
                                <AccordionTrigger className="text-xs font-mono text-muted-foreground hover:no-underline py-2">
                                    <div className="flex items-center gap-2">
                                        <span className="flex items-center gap-2">
                                            <Hammer className="size-4" />
                                            {toolCall.name}
                                        </span>
                                        {toolCall.isProcessing && <Spinner height={16} width={16} />}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                        <pre className="text-xs whitespace-pre-wrap overflow-x-auto text-gray-700">
                                            {JSON.stringify(toolCall.arguments, null, 2)}
                                        </pre>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}

            {/* Display streaming response */}
            {(response || loading || error) && (
                <div className="w-fit mb-2 px-4 py-2 rounded-xl mr-auto">
                    <div className="prose">
                        {loading && wordCount < 5
                            ? (
                                    <div className="flex items-center gap-2">
                                        <span className="animate-pulse text-sm">{processingToolCall ? 'Calling MCP tool...' : 'Generating...'}</span>
                                        <Spinner />
                                    </div>
                                )
                            : (
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {response}
                                    </ReactMarkdown>
                                )}
                        {error && (
                            <span className="text-red-600">
                                Error:
                                {' '}
                                {error}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
