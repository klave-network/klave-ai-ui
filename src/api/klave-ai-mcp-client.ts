import type {
    Capabilities,
    Component,
    ContextInput,
    McpCapabilities,
    McpChunkResult,
    McpServer,
    McpServerInput,
    McpSession,
    Model
} from '@/lib/types';

import { KLAVE_AI_MCP_CLIENT_FQDN, KLAVE_AI_MCP_CLIENT_NODE } from '@/lib/constants';
import secretariumHandler from '@/lib/secretarium-handler';

export function waitForConnection() {
    return new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected(KLAVE_AI_MCP_CLIENT_NODE);
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
                KLAVE_AI_MCP_CLIENT_FQDN,
                'graph_models',
                '',
                `graph_models-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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
                KLAVE_AI_MCP_CLIENT_FQDN,
                'graph_save_component',
                args,
                `graph_save_component-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

// MCP Tool Operations
export async function createMcpServer(args: McpServerInput): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_server_create',
                args,
                `mcp_server_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function getMcpServers(): Promise<McpServer[]> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_server_list',
                {},
                `mcp_server_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result: { servers: McpServer[] }) => {
                        resolve(result.servers);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getMcpServerCapabilities(args: { server_id: string }): Promise<McpCapabilities> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_capabilities_list',
                args,
                `mcp_capabilities_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getMcpTools(args: { session_id: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_tool_list',
                args,
                `mcp_tool_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function callMcpTool(args: { session_id: string; tool_name: string; arguments: any }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_tool_call',
                args,
                `mcp_tool_call-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

// MCP Session Management
export async function initMcpSession(args: { server_id: string; capabilities: Capabilities }): Promise<McpSession> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_session_initialize',
                args,
                `mcp_session_initialize-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function mcpSessionStatus(args: { session_id: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_session_status',
                args,
                `mcp_session_status-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function mcpSessionUpdate(args: {
    session_id: string;
    tool_name: string;
    enabled: boolean;
}): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_session_update',
                args,
                `mcp_session_update-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function closeMcpSession(args: { session_id: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'mcp_session_close',
                args,
                `mcp_session_close-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

// LLM Context Management
export async function createLlmContext(args: {
    context: ContextInput;
    session_ids: string[];
    token_id: string;
}): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'llm_context_create',
                args,
                `llm_context_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function deleteLlmContext(args: { context_name: string; token_id: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'llm_context_delete',
                args,
                `llm_context_delete-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function addLlmContextTools(args: {
    context_name: string;
    session_ids: string[];
    token_id: string;
}): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'llm_context_add_tools',
                args,
                `llm_context_add_tools-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function sendLlmContextPrompt(args: {
    context_name: string;
    user_prompt: string;
    token_id: string;
}): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'llm_context_send_prompt',
                args,
                `llm_context_send_prompt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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

export async function getLlmContextResponse(
    args: { context_name: string; token_id: string; nb_pieces?: number },
    resolveCallback: (result: McpChunkResult) => boolean
): Promise<void> {
    await waitForConnection();
    if (args.nb_pieces === undefined || args.nb_pieces < 1)
        args.nb_pieces = 5; // Default to 5 pieces if not specified
    if (args.nb_pieces > 20)
        args.nb_pieces = 20; // Limit to a maximum of 20 pieces
    const tx = await secretariumHandler.request(
        KLAVE_AI_MCP_CLIENT_FQDN,
        'llm_context_get_response',
        args,
        `llm_context_get_response-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
        KLAVE_AI_MCP_CLIENT_NODE
    );

    return new Promise<void>((resolve, reject) => {
        tx.onResult((result: McpChunkResult) => {
            if (resolveCallback(result)) {
                resolve();
            }
        });

        tx.onError((error) => {
            console.error(`llm_context_get_response error: ${error.message}`);
            reject(error);
        });

        tx.send().catch(reject);
    });
}

export async function getAttestations(): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                KLAVE_AI_MCP_CLIENT_FQDN,
                'attestation_get_all',
                {},
                `attestation_get_all-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                KLAVE_AI_MCP_CLIENT_NODE
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
