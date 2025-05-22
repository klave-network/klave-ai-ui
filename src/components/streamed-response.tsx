import React, { useEffect, useState, useRef } from 'react';
import { inferenceGetResponse } from '@/api/sanctum';

interface StreamedResponseProps {
    context_name: string;
    onComplete: (fullResponse: string) => void;
}

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
            if (!isMountedRef.current) return true; // stop if unmounted

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

    return (
        <p className="whitespace-pre-wrap">
            {loading && !response ? (
                <span className="animate-pulse">Generating...</span>
            ) : (
                response
            )}
            {error && <span className="text-red-600">Error: {error}</span>}
        </p>
    );
};
