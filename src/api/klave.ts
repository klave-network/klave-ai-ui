import type {
    BackendVersion,
    QuoteResponse,
    VerifyArgs,
    VerifyResponse
} from '@/lib/types';

import { waitForConnection } from '@/api/klave-ai-multimodal';
import { KLAVE_AI_MULTIMODAL_FQDN, KLAVE_AI_MULTIMODAL_NODE } from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';

export async function isConnected(): Promise<boolean> {
    return secretariumHandler.isConnected(KLAVE_AI_MULTIMODAL_NODE);
}

export async function getQuote({
    challenge
}: {
    challenge: number[];
}): Promise<QuoteResponse> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MULTIMODAL_FQDN,
                'klave.get_quote',
                { challenge },
                `klave.get_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MULTIMODAL_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: QuoteResponse) => {
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
                KLAVE_AI_MULTIMODAL_FQDN,
                'klave.verify_quote',
                args,
                `klave.verify_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MULTIMODAL_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: VerifyResponse) => {
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
                KLAVE_AI_MULTIMODAL_FQDN,
                'klave.version',
                {},
                `klave.version-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MULTIMODAL_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: BackendVersion) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}
