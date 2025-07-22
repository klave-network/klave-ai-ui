import type {
    BackendVersion,
    QuoteResponse,
    VerifyArgs,
    VerifyResponse
} from '@/lib/types';

import { klaveKlaveAIContract, waitForConnection } from '@/api';
import secretariumHandler from '@/lib/secretarium-handler';

export async function isConnected(): Promise<boolean> {
    return secretariumHandler.isConnected();
}

export async function getQuote({
    challenge
}: {
    challenge: number[];
}): Promise<QuoteResponse> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'klave.get_quote',
                { challenge },
                `klave.get_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
                klaveKlaveAIContract,
                'klave.verify_quote',
                args,
                `klave.verify_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
                klaveKlaveAIContract,
                'klave.version',
                {},
                `klave.version-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
