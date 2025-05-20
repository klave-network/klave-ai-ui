import { useEffect, useState } from 'react';
import { inferenceGetResponse } from '@/api/sanctum';

export const StreamedResponse = ({
    context_name,
    onComplete
}: {
    context_name: string;
    onComplete?: (fullResponse: string) => void;
}) => {
    const [response, setResponse] = useState('');

    useEffect(() => {
        let isMounted = true;

        async function poll() {
            let complete = false;
            while (!complete && isMounted) {
                try {
                    const result = await inferenceGetResponse({
                        context_name
                    });
                    const chunk = String.fromCharCode.apply(null, result.piece);
                    setResponse((prev) => prev + chunk);
                    complete = result.complete;
                } catch (e) {
                    console.error(e);
                    break;
                }
            }
            if (onComplete && isMounted) {
                onComplete(response);
            }
        }

        poll();

        return () => {
            isMounted = false;
        };
    }, [context_name]);

    return (
        <pre className="whitespace-pre-wrap p-4 border rounded bg-gray-50">
            {response || 'Loading...'}
        </pre>
    );
};
