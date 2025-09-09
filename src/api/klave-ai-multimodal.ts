import type {
    AddRagPromptResult,
    ChunkResult,
    Component,
    ContextInput,
    FrameInput,
    InferenceResponseInput,
    Model,
    PgsqlCreateInput,
    PromptInput,
    PromptInputRag,
    Tokenizer
} from '@/lib/types';

import secretariumHandler from '@/lib/secretarium-handler';

export const klaveAiMultimodalFqdn = import.meta.env.VITE_APP_KLAVE_FQDN_MULTI_MODAL;
export const klaveAiMultimodalNode = 'thranduil1:5035';

export function waitForConnection() {
    return new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected(klaveAiMultimodalNode);
            if (isConnected)
                resolve();
            else setTimeout(loopCondition, 1000);
        };
        loopCondition();
    });
}

// GRAPH / MODEL MANAGEMENT
export async function getModels(): Promise<Model[]> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'graph_models',
                '',
                `graph_models-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

export async function graphSaveComponent(args: Component): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'graph_save_component',
                args,
                `graph_save_component-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

export async function graphLoadByName({
    model_name
}: {
    model_name: string;
}): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'graph_load_by_name',
                { model_name },
                `graph_load_by_name-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

export async function getTokenizers(): Promise<Tokenizer[]> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'graph_tokenizers',
                '',
                `graph_tokenizers-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

export async function graphInitExecutionContext(args: ContextInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'graph_init_execution_context',
                args,
                `graph_init_execution_context-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

export async function graphDeleteExecutionContext(contextName: string): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'graph_delete_execution_context',
                contextName,
                `graph_delete_execution_context-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

// INFERENCE
export async function inferenceGetResponse(args: InferenceResponseInput, resolveCallback: (result: ChunkResult) => boolean): Promise<void> {
    await waitForConnection();
    if (args.nb_pieces === undefined || args.nb_pieces < 1)
        args.nb_pieces = 2; // Default to 2 pieces if not specified
    if (args.nb_pieces > 20)
        args.nb_pieces = 20; // Limit to a maximum of 20 pieces
    const tx = await secretariumHandler.request(
        klaveAiMultimodalFqdn,
        'inference_get_pieces',
        args,
        `inference_get_pieces-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        klaveAiMultimodalNode
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
}

export async function inferenceAddFrame(args: FrameInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'inference_add_frame',
                args,
                `inference_add_frame-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

export async function inferenceAddPrompt(args: PromptInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'inference_add_prompt',
                args,
                `inference_add_prompt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
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
}

export async function inferenceAddRagPrompt(args: PromptInputRag): Promise<AddRagPromptResult> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'inference_rag_add_prompt',
                args,
                `inference_rag_add_prompt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: AddRagPromptResult) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

// POSTGRESQL
export async function pgsqlCreate(args: PgsqlCreateInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'pgsql_create',
                args,
                `pgsql_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function pgsqlList(): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMultimodalFqdn,
                'pgsql_list',
                '',
                `pgsql_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMultimodalNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: string) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}
