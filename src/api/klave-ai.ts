import secretariumHandler from '@/lib/secretarium-handler';
import { klaveKlaveAIContract, waitForConnection } from '@/api';
import type {
    ContextInput,
    InferenceResponseInput,
    Model,
    PromptInput,
    Tokenizer,
    ChunkResult,
    PromptInputRag,
    RagCreateInput,
    RagDocumentInput,
    RagDeleteDocumentInput,
    RagDocumentListInput,
    Rag,
    Document
} from '@/lib/types';

export const getModels = async (): Promise<Model[]> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'graph_models',
                '',
                `graph_models-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        const parsedResult = JSON.parse(result) as Model[];
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
                klaveKlaveAIContract,
                'graph_tokenizers',
                '',
                `graph_tokenizers-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        const parsedResult = JSON.parse(result) as Tokenizer[];
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
                klaveKlaveAIContract,
                'graph_init_execution_context',
                args,
                `graph_init_execution_context-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
                klaveKlaveAIContract,
                'graph_delete_execution_context',
                contextName,
                `graph_delete_execution_context-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
                klaveKlaveAIContract,
                'inference_add_prompt',
                args,
                `inference_add_prompt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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

export const inferenceAddRagPrompt = async (
    args: PromptInputRag
): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'inference_rag_add_prompt',
                args,
                `inference_rag_add_prompt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
            )
        )
        .then(
            (tx) =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: any) => {
                        console.log('Result:', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );

export const inferenceGetResponse = async (
    args: InferenceResponseInput,
    resolveCallback: (result: ChunkResult) => boolean
): Promise<void> => {
    await waitForConnection();
    const tx = await secretariumHandler.request(
        klaveKlaveAIContract,
        'inference_get_pieces',
        args,
        `inference_get_pieces-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    );

    return new Promise<void>((resolve, reject) => {
        tx.onResult((result: ChunkResult) => {
            if (resolveCallback(result)) {
                resolve();
            }
        });

        tx.onError((error) => {
            console.error(`inference_get_pieces error: ${error.message}`);
            reject(error);
        });

        tx.send().catch(reject);
    });
};

export const ragCreate = async (args: RagCreateInput): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'rag_create',
                { ...args, chunk_length: args.chunk_length ?? 255 },
                `rag_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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

export const ragAddDocument = async (args: RagDocumentInput): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'rag_add_document',
                args,
                `rag_add_document-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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

export const ragDeleteDocument = async (
    args: RagDeleteDocumentInput
): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'rag_delete_document',
                args,
                `rag_delete_document-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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

export const ragDocumentList = async (
    args: RagDocumentListInput
): Promise<Document[]> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'rag_document_list',
                args,
                `rag_document_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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

export const getRagList = async (): Promise<Rag[]> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'rag_list',
                '',
                `rag_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
