import { createFileRoute } from '@tanstack/react-router';
import { Bot, Hammer, Layers, MessageCirclePlus } from 'lucide-react';

import {
    getAttestations,
    getModels as getMcpModels,
    getMcpServerCapabilities,
    getMcpServers,
    getMcpTools,
    initMcpSession
} from '@/api/klave-ai-mcp-client';
import {
    getModels as getMultimodalModels
} from '@/api/klave-ai-multimodal';
import { getRagList } from '@/api/klave-ai-rag-mcp-server';
import { LoadingDots } from '@/components/loading-dots';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { store, storeActions } from '@/store';

export const Route = createFileRoute('/_auth/')({
    component: RouteComponent,
    loader: async () => {
        const currentUser = store.state.currentUser ?? '';
        const models = await getMultimodalModels();
        const mcpModels = await getMcpModels();
        const ragSets = await getRagList();
        const mcpServers = await getMcpServers();
        const attestations = await getAttestations();
        console.log('Attestations:', attestations);
        storeActions.addModels(currentUser, [...models]);
        storeActions.addMcpModels(mcpModels);
        storeActions.addMcpServers(mcpServers);
        storeActions.addRagDataSets(ragSets);

        // Initialize MCP sessions for all servers and fetch their tools
        const mcpSessions = [];
        for (const server of mcpServers) {
            console.log(`Initializing MCP server ${server.name}...`);
            try {
                // Get capabilities for this server
                const capsResponse = await getMcpServerCapabilities({ server_id: server.id });
                console.log(`Capabilities for ${server.name}:`, capsResponse.capabilities);

                // Initialize session
                const session = await initMcpSession({
                    server_id: server.id,
                    capabilities: capsResponse.capabilities
                });

                mcpSessions.push(session);

                // Fetch tools for this session
                const toolsResponse = await getMcpTools({ session_id: session.session_id });
                console.log(`Tools for ${server.name}:`, toolsResponse.tools);

                // Update the server with its tools
                if (toolsResponse && toolsResponse.tools) {
                    storeActions.updateMcpServerTools(server.id, toolsResponse.tools);
                }
            }
            catch (error) {
                console.error(`Failed to initialize MCP server ${server.name}:`, error);
            }
        }

        // Store all sessions for the current user
        if (currentUser && mcpSessions.length > 0) {
            storeActions.addMcpSessions(currentUser, mcpSessions);
        }
    },
    pendingComponent: () => (
        <div className="min-h-screen grid place-items-center">
            <div className="flex flex-col items-center gap-2">
                <span>Initializing Klave AI</span>
                <div className="flex flex-col justify-center items-center text-center mb-4">
                    <LoadingDots />
                </div>
            </div>
        </div>
    )
});

function RouteComponent() {
    return (
        <>
            <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                <div className="w-full flex items-center justify-between gap-2 px-4">
                    <SidebarTrigger side="left" />
                </div>
            </header>

            <div className="flex flex-col items-center h-full">
                <div className="flex flex-col items-center justify-center h-full w-full">
                    <div className="flex flex-col gap-4">
                        <h2 className="font-owners font-medium tracking-wide text-2xl md:text-3xl">
                            Welcome to
                            {' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-klave-cyan to-klave-blue">Klave AI</span>
                        </h2>
                        <p className="text-muted-foreground">
                            Experience AI-powered conversations with end-to-end confidentiality.
                            <br />
                            Your data is processed securely, ensuring privacy without compromise.
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline">
                                <MessageCirclePlus />
                                New Chat
                            </Button>
                            <Button variant="outline">
                                <Bot />
                                View Models
                            </Button>
                            <Button variant="outline">
                                <Layers />
                                View Spaces
                            </Button>
                            <Button variant="outline">
                                <Hammer />
                                View Tools
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
