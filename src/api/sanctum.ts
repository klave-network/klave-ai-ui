import secretariumHandler from '@/lib/secretarium-handler';
import { klaveSanctumContract, waitForConnection } from '@/api';
import type {
    ContextInput,
    Input,
    Model,
    PromptInput,
    Tokenizer,
    ChunkResult
} from '@/lib/types';

export const getModels = async (): Promise<Model[]> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveSanctumContract,
                'getModels',
                '',
                `getModels-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        const parsedResult = JSON.parse(result);
                        resolve(parsedResult);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const getTokenizers = async (): Promise<Tokenizer[]> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveSanctumContract,
                'getTokenizers',
                '',
                `getTokenizers-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        const parsedResult = JSON.parse(result);
                        resolve(parsedResult);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const graphInitExecutionContext = async (
    args: ContextInput
): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveSanctumContract,
                'graphInitExecutionContext',
                args,
                `graphInitExecutionContext-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: any) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const graphDeleteExecutionContext = async (
    contextName: string
): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveSanctumContract,
                'graphDeleteExecutionContext',
                contextName,
                `graphDeleteExecutionContext-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: any) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const inferenceAddPrompt = async (args: PromptInput): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveSanctumContract,
                'inferenceAddPrompt',
                args,
                `inferenceAddPrompt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: any) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const inferenceGetResponse = async (
    args: Input,
    resolveCallback: (result: ChunkResult) => boolean
): Promise<void> => {
    await waitForConnection();
    const tx = await secretariumHandler.request(
        klaveSanctumContract,
        'inferenceGetPieces',
        args,
        `inferenceGetPieces-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    );

    return new Promise<void>((resolve, reject) => {
        tx.onResult((result: ChunkResult) => {
            if (resolveCallback(result)) {
                resolve();
            }
        });

        tx.onError((error) => {
            console.error(`inferenceGetPieces error: ${error.message}`);
            reject(error);
        });

        tx.send().catch(reject);
    });
};
