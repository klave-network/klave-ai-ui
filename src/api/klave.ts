import secretariumHandler from '@/lib/secretarium-handler';
import { klaveKlaiveContract, waitForConnection } from '@/api';
import type {
    BackendVersion,
    QuoteResponse,
    VerifyArgs,
    VerifyResponse
} from '@/lib/types';

export const getQuote = async ({
    challenge
}: {
    challenge: number[];
}): Promise<QuoteResponse> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaiveContract,
                'klave.get_quote',
                { challenge },
                `klave.get_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: QuoteResponse) => {
                        console.log('klave.get_quote', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const verifyQuote = async (args: VerifyArgs): Promise<VerifyResponse> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaiveContract,
                'klave.verify_quote',
                args,
                `klave.verify_quote-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: VerifyResponse) => {
                        console.log('klave.verify_quote', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const getBackendVersion = async (): Promise<BackendVersion> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaiveContract,
                'klave.version',
                {},
                `klave.version-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: BackendVersion) => {
                        console.log('klave.version', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
