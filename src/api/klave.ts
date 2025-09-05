import type {
    BackendVersion,
    QuoteResponse,
    VerifyArgs,
    VerifyResponse
} from '@/lib/types';

import { klaveAiMultimodalFqdn, klaveAiMultimodalNode, waitForConnection } from '@/api/klave-ai-multimodal';
import secretariumHandler from '@/lib/secretarium-handler';

export async function isConnected(): Promise<boolean> {
    return secretariumHandler.isConnected(klaveAiMultimodalNode);
}

export async function getQuote({
    challenge
}: {
    challenge: number[];
}): Promise<QuoteResponse> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'klave.get_quote',
                { challenge },
                `klave.get_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: QuoteResponse) => {
                        // console.log('klave.get_quote', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function verifyQuote(args: VerifyArgs): Promise<VerifyResponse> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'klave.verify_quote',
                args,
                `klave.verify_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: VerifyResponse) => {
                        // console.log('klave.verify_quote', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getBackendVersion(): Promise<BackendVersion> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'klave.version',
                {},
                `klave.version-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: BackendVersion) => {
                        // console.log('klave.version', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}
