import React, { useEffect, useRef, useState } from 'react';

import { inferenceGetResponse } from '@/api/klave-ai';
import { LoadingDots } from '@/components/loading-dots';

type StreamedResponseProps = {
    context_name: string;
    onComplete: (fullResponse: string) => void;
};

export const StreamedResponse: React.FC<StreamedResponseProps> = ({
    context_name,
    onComplete
}) => {
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isMountedRef = useRef(true);
    const fullResponseRef = useRef(''); // accumulate full response here

    useEffect(() => {
        // console.log('is this streaming again');
        isMountedRef.current = true;

        setResponse('');
        fullResponseRef.current = '';
        setLoading(true);
        setError(null);

        inferenceGetResponse({ context_name }, (result) => {
            if (!isMountedRef.current)
                return true; // stop if unmounted

            if (typeof result === 'string') {
                setError(result);
                setLoading(false);
                isMountedRef.current = false;
                return true; // stop streaming on error
            }

            const chunkText = String.fromCharCode(...result.piece);
            fullResponseRef.current += chunkText;
            setResponse(fullResponseRef.current);

            if (result.complete === true) {
                setLoading(false);
                onComplete(fullResponseRef.current);
                isMountedRef.current = false;
            }

            return result.complete === true;
        });
    }, [context_name, onComplete]);

    // Count words in the current response
    const wordCount = response.trim().split(/\s+/).filter(Boolean).length;

    return (
        <div className="whitespace-pre-wrap">
            {loading && wordCount < 5
                ? (
                        <div className="flex flex-col">
                            <span className="animate-pulse">Generating</span>
                            <LoadingDots />
                        </div>
                    )
                : (
                        response
                    )}
            {error && (
                <span className="text-red-600">
                    Error:
                    {error}
                </span>
            )}
        </div>
    );
};
