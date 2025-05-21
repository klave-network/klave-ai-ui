import secretariumHandler from '@/lib/secretarium-handler';
import { klaveSanctumContract, waitForConnection } from '@/api';
import type {
    ContextInput,
    Input,
    Model,
    PromptInput,
    Tokenizer
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
                        console.log(
                            'graphInitExecutionContext result: ',
                            result
                        );
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
                        console.log(
                            'graphDeleteExecutionContext result: ',
                            result
                        );
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
                        console.log('inferenceAddPrompt result: ', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const inferenceGetResponse = async (args: Input): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveSanctumContract,
                'inferenceGetPiece',
                args,
                `inferenceGetPiece-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
