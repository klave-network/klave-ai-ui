import type {
    Component,
    Document,
    Model,
    Rag
} from '@/lib/types';

import { KLAVE_AI_RAG_MCP_SERVER_FQDN, KLAVE_AI_RAG_MCP_SERVER_NODE } from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';

export function waitForConnection() {
    return new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected(KLAVE_AI_RAG_MCP_SERVER_NODE);
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
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'graph_models',
                '',
                `graph_models-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'graph_save_component',
                args,
                `graph_save_component-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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
export async function pgsqlCreate(args: { host: string; dbname: string; user: string; password: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'pgsql_create',
                args,
                `pgsql_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'pgsql_list',
                '',
                `pgsql_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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
export async function ragCreate(args: { database_id: string; rag_name: string; model_name: string; chunk_length?: number }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'rag_create',
                { ...args, chunk_length: args.chunk_length ?? 255 },
                `rag_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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

export async function ragAddDocument(args: { rag_id: string; document: any }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'rag_add_document',
                args,
                `rag_add_document-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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

export async function ragDeleteDocument(args: { rag_id: string; document_id: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'rag_delete_document',
                args,
                `rag_delete_document-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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

export async function ragDocumentList(args: { rag_id: string }): Promise<Document[]> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'rag_document_list',
                args,
                `rag_document_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
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
                KLAVE_AI_RAG_MCP_SERVER_FQDN,
                'rag_list',
                '',
                `rag_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_RAG_MCP_SERVER_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: any) => {
                        console.log('rag_list:', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}
