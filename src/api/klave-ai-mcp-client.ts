import type {
    Component,
    LlmContextCreateInputArgs,
    McpCapabilities,
    McpServer,
    McpSessionInitArgs,
    Model
} from '@/lib/types';

import secretariumHandler from '@/lib/secretarium-handler';

export const klaveAiMcpClientFqdn = import.meta.env.VITE_APP_KLAVE_FQDN_MCP;
export const klaveAiMcpClientNode = 'thranduil1:5036';

export function waitForConnection() {
    return new Promise<void>((resolve) => {
        const loopCondition = () => {
            const isConnected = secretariumHandler.isConnected(klaveAiMcpClientNode);
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
                klaveAiMcpClientFqdn,
                'graph_models',
                '',
                `graph_models-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
                klaveAiMcpClientFqdn,
                'graph_save_component',
                args,
                `graph_save_component-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
                klaveAiMcpClientFqdn,
                'graph_load_by_name',
                { model_name },
                `graph_load_by_name-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
export async function getMcpServers(): Promise<McpServer[]> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'mcp_server_list',
                {},
                `mcp_server_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
                klaveAiMcpClientFqdn,
                'mcp_capabilities_list',
                args,
                `mcp_capabilities_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
            )
        )
        .then(
            tx =>
                new Promise((resolve, reject) => {
                    tx.onResult((result) => {
                        console.log('caps', result);
                        resolve(result);
                    });
                    tx.onError((error) => {
                        reject(error);
                    });
                    tx.send().catch(reject);
                })
        );
}

export async function getMcpTools(): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'mcp_tool_list',
                {},
                `mcp_tool_list-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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

export async function callMcpTool(args: { function_name: string; arguments: any }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'mcp_tool_call',
                args,
                `mcp_tool_call-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
export async function initMcpSession(args: McpSessionInitArgs): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'mcp_session_initialize',
                args,
                `mcp_session_initialize-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
                klaveAiMcpClientFqdn,
                'mcp_session_status',
                args,
                `mcp_session_status-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
                klaveAiMcpClientFqdn,
                'mcp_session_close',
                args,
                `mcp_session_close-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
export async function createLlmContext(args: LlmContextCreateInputArgs): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'llm_context_create',
                args,
                `llm_context_create-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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

export async function deleteLlmContext(args: { context_name: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'llm_context_delete',
                args,
                `llm_context_delete-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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

export async function addLlmContextTools(args: { context_name: string; session_ids: string[] }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'llm_context_add_tools',
                args,
                `llm_context_add_tools-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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

export async function sendLlmContextPrompt(args: { context_name: string; user_prompt: string }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'llm_context_send_prompt',
                args,
                `llm_context_send_prompt-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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

export async function getLlmContextResponse(args: { context_name: string; nb_pieces: number }): Promise<any> {
    return waitForConnection()
        .then(() =>
            secretariumHandler.request(
                klaveAiMcpClientFqdn,
                'llm_context_get_response',
                args,
                `llm_context_get_response-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
                klaveAiMcpClientNode
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
