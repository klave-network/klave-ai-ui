import type {
    Component,
    Document,
    Model,
    PgsqlCreateInput,
    Rag,
    RagCreateInput,
    RagDeleteDocumentInput,
    RagDocumentInput,
    RagDocumentListInput
} from '@/lib/types';

import secretariumHandler from '@/lib/secretarium-handler';

export const klaveAiRagMcpServerFqdn = import.meta.env.VITE_APP_KLAVE_FQDN_RAG;
export const klaveAiRagMcpServerNode = 'thranduil1:5037';

export function waitForConnection() {
    return new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected(klaveAiRagMcpServerNode);
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
                klaveAiRagMcpServerFqdn,
                'graph_models',
                '',
                `graph_models-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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
                klaveAiRagMcpServerFqdn,
                'graph_save_component',
                args,
                `graph_save_component-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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
                klaveAiRagMcpServerFqdn,
                'graph_load_by_name',
                { model_name },
                `graph_load_by_name-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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

// POSTGRESQL
export async function pgsqlCreate(args: PgsqlCreateInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiRagMcpServerFqdn,
                'pgsql_create',
                args,
                `pgsql_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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
                klaveAiRagMcpServerFqdn,
                'pgsql_list',
                '',
                `pgsql_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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

// RAG
export async function ragCreate(args: RagCreateInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiRagMcpServerFqdn,
                'rag_create',
                { ...args, chunk_length: args.chunk_length ?? 255 },
                `rag_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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

export async function ragAddDocument(args: RagDocumentInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiRagMcpServerFqdn,
                'rag_add_document',
                args,
                `rag_add_document-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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

export async function ragDeleteDocument(args: RagDeleteDocumentInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiRagMcpServerFqdn,
                'rag_delete_document',
                args,
                `rag_delete_document-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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

export async function ragDocumentList(args: RagDocumentListInput): Promise<Document[]> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiRagMcpServerFqdn,
                'rag_document_list',
                args,
                `rag_document_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
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

export async function getRagList(): Promise<Rag[]> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiRagMcpServerFqdn,
                'rag_list',
                '',
                `rag_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiRagMcpServerNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: any) => {
                        console.log('Rag list:', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}
