import secretariumHandler from '@/lib/secretarium-handler';

// Function to extract the klave app address from URL params
function getAddressFromUrl(): string | null {
    if (typeof window === 'undefined')
        return null;

    const urlParams = new URLSearchParams(window.location.search);
    const d = urlParams.get('d');

    if (d) {
        console.info('Klave app address found in URL:', d);
        return d;
    }

    return null;
}

export const klaveKlaveAIContract
    = getAddressFromUrl() || import.meta.env.VITE_APP_KLAVE_AI_CONTRACT;

export function waitForConnection() {
    return new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected();
            if (isConnected)
                resolve();
            else setTimeout(loopCondition, 1000);
        };
        loopCondition();
    });
}

export const isConnected = () => secretariumHandler.isConnected();
