import React from 'react';
import ReactMarkdown from 'react-markdown';

import { LoadingDots } from '@/components/loading-dots';
import { useStreamedResponse } from '@/hooks/use-streamed-response';

type StreamedResponseProps = {
    context_name: string;
    onComplete: (fullResponse: string) => void;
    onToolCallRequired?: (toolCall: any) => void;
};

export const StreamedResponse: React.FC<StreamedResponseProps> = ({
    context_name,
    onComplete,
    onToolCallRequired
}) => {
    const { response, loading, error, wordCount } = useStreamedResponse({
        context_name,
        onComplete,
        onToolCallRequired
    });

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
};
