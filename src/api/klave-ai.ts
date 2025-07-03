import secretariumHandler from '@/lib/secretarium-handler';
import { klaveKlaveAIContract, waitForConnection } from '@/api';
import type {
    ContextInput,
    InferenceResponseInput,
    Model,
    PromptInput,
    FrameInput,
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

let triedLoadingModels = false;
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
                        if (!Array.isArray(parsedResult)) {
                            reject(new Error('Invalid response format'));
                            return;
                        }
                        if (parsedResult.length === 0) {
                            if (!triedLoadingModels) {
                                triedLoadingModels = true;
                                return loadModel()
                                    .then(() => {
                                        // Retry getting models after loading
                                        return getModels();
                                    });
                            }
                        }
                        console.info(
                            'Models loaded successfully:',
                            parsedResult
                        );
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

export const inferenceAddFrame = async (args: FrameInput): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'inference_add_frame',
                args,
                `inference_add_frame-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
    args: InferenceResponseInput,
    resolveCallback: (result: ChunkResult) => boolean
): Promise<void> => {
    await waitForConnection();
    if (args.nb_pieces === undefined || args.nb_pieces < 1)
        args.nb_pieces = 2; // Default to 2 pieces if not specified
    if (args.nb_pieces > 20)
        args.nb_pieces = 20; // Limit to a maximum of 20 pieces
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

const url = 'SmolVLM-500M-Instruct-Q8_0.gguf';
const name = 'SmolVLM';
const description = 'SmolVLM is a small, efficient vision-language model designed for tasks like image captioning and visual question answering. It is optimized for performance while maintaining high accuracy.';

// Define enums as objects
const graph_encoding = { autodetect: 0 };
const execution_target = { cpu: 0 };

// Model object
const model = {
    name: name,
    tokenizer_name: "",
    local_path: url.split('/').pop(),
    url: url,
    description: description,
    model_format: 1,
    tensor_type: 2,
    encryption_type: 0,
    encryption_key: [],
    hash_type: 0,
    hash: [],
    system_prompt: [66, 101, 32, 97, 32, 104, 101, 108, 112, 102, 117, 108, 32, 97, 115, 115, 105, 115, 116, 97, 110, 116, 46, 32, 65, 110, 115, 119, 101, 114, 32, 116, 104, 101, 32, 113, 117, 101, 115, 116, 105, 111, 110, 32, 97, 115, 32, 116, 114, 117, 116, 104, 102, 117, 108, 108, 121, 32, 97, 115, 32, 112, 111, 115, 115, 105, 98, 108, 101, 44, 32, 98, 117, 116, 32, 100, 111, 32, 110, 111, 116, 32, 103, 117, 101, 115, 115, 32, 105, 102, 32, 121, 111, 117, 32, 100, 111, 32, 110, 111, 116, 32, 107, 110, 111, 119, 32, 116, 104, 101, 32, 97, 110, 115, 119, 101, 114, 46, 32, 73, 102, 32, 121, 111, 117, 32, 97, 114, 101, 32, 117, 110, 115, 117, 114, 101, 44, 32, 115, 97, 121, 32, 115, 111, 46], // "Be a helpful assistant. Answer the question as truthfully as possible, but do not guess if you do not know the answer. If you are unsure, say so."
    is_loaded: false,
    access: 0,
    max_threads: 64,
    max_concurrent_queries: 10,
    max_concurrent_queries_per_user: 50,
    inactivitiy_timeout: 30000
};

// Tokenizer object
const tokenizer = {
    name: "",
    local_path: "",
    url: "",
    description: "",
    model_format: 0,
    engine_type: 0,
    tensor_type: 0,
    encryption_type: 0,
    encryption_key: [],
    hash_type: 0,
    hash: [],
    is_loaded: false,
    access: 0
};

// Graph builder object
const graph_builder = {
    model: model,
    tokenizer: tokenizer
};

// Graph load input object
const graph_load_input = {
    builder: JSON.stringify(graph_builder),
    encoding: graph_encoding.autodetect,
    target: execution_target.cpu
};

export const loadModel = async (): Promise<any> =>
    waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveKlaveAIContract,
                'graphLoad',
                graph_load_input,
                `graphLoad-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
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
