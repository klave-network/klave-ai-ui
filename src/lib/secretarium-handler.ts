import type { ClearKeyPair, EncryptedKeyPairV2, Transaction } from '@secretarium/connector';

import {
    Key,
    SCP,
    Utils
} from '@secretarium/connector';

import type { KeyPair } from '@/lib/types';

type SecretariumGatewayConfig = {
    gateways: Array<{
        endpoint: string;
        name: string;
    }>;
};

type SecretariumClusterConfig = {
    [cluster: string]: SecretariumGatewayConfig;
};

type ConnectionInformation = {
    cluster: string;
    endpoint: string;
    gateway: string;
    socket: SCP;
};

type ConnectionInstance = {
    connection: SCP;
    clusters?: SecretariumClusterConfig;
    currentGateway: number;
    isConnected: boolean;
};

const handlerStore: {
    connections: Map<string, ConnectionInstance>;
    currentKey?: Key;
    fileService?: string;
    defaultConnectionId: string;
} = {
    connections: new Map(),
    currentKey: undefined,
    defaultConnectionId: 'default'
};

function gatewaysConfigReducer(config: SecretariumClusterConfig, current: string): SecretariumClusterConfig {
    const record = current.split('#');

    if (record.length !== 3)
        return config;

    const [cluster, name, endpoint] = record as [string, string, string];
    config[cluster] = {
        gateways: (config[cluster]?.gateways ?? []).concat([
            {
                endpoint,
                name
            }
        ])
    };
    return config;
}

function printClusterInfo(connectionId: string, clusters: SecretariumClusterConfig): void {
    if (!clusters)
        return;

    const printableConfig: {
        [key: string]: string;
    } = {};

    Object.entries(clusters).forEach(
        ([name, configuration], cindex) => {
            printableConfig[`c${cindex}_name`] = name;
            configuration.gateways.forEach((gateway, gindex) => {
                printableConfig[`c${cindex}_g${gindex}_name`] = gateway.name;
                printableConfig[`c${cindex}_g${gindex}_endpoint`]
                    = gateway.endpoint;
            });
        }
    );

    console.info(`Klave AI App connection [${connectionId}] using the following cluster configuration:`);
    console.table(printableConfig);
}

function processClusterConfig(config: string | SecretariumClusterConfig, connectionId: string): void {
    let clusters: SecretariumClusterConfig;

    if (typeof config === 'string') {
        clusters = config
            .split(',')
            .reduce<SecretariumClusterConfig>(gatewaysConfigReducer, {});
    }
    else {
        clusters = config as SecretariumClusterConfig;
    }

    const connectionInstance = handlerStore.connections.get(connectionId);
    if (connectionInstance) {
        connectionInstance.clusters = clusters;
    }
    else {
        handlerStore.connections.set(connectionId, {
            connection: new SCP({ logger: console }),
            clusters,
            currentGateway: -1,
            isConnected: false
        });
    }

    printClusterInfo(connectionId, clusters);
}

// Function to extract the gateway address from URL params
function getGatewayFromUrl(): string | null {
    if (typeof window === 'undefined')
        return null;

    const urlParams = new URLSearchParams(window.location.search);
    const g = urlParams.get('g');

    if (g) {
        console.info('Gateway address found in URL:', g);
        return g;
    }

    return null;
}

const secretariumHandler = {
    initialize: (gatewayConfig?: string, connectionId: string = 'default'): void => {
        // First check if gateway is provided in URL (only for default connection)
        if (connectionId === 'default') {
            const urlGateway = getGatewayFromUrl();

            // If URL has gateway info, use that directly
            if (urlGateway) {
                // Format for the gateway config
                const clusterName = 'default';
                const gatewayName = 'url-provided';
                const formattedConfig = `${clusterName}#${gatewayName}#wss://${urlGateway}`;
                processClusterConfig(formattedConfig, connectionId);
                return;
            }
        }

        let clusterConfigBase = gatewayConfig || import.meta.env.VITE_APP_SECRETARIUM_GATEWAYS || '';

        // Only fetch config.json for the default connection to avoid multiple requests
        if (connectionId === 'default') {
            fetch(
                `/config.json?v=${import.meta.env.VITE_APP_VERSION ?? '0.0.0'}&t=${Date.now()}`
            )
                .then(response => response.json())
                .then((config: any) => {
                    if (config.SECRETARIUM_GATEWAYS)
                        clusterConfigBase = config.SECRETARIUM_GATEWAYS;
                    if (config.DK_SERVICES)
                        handlerStore.fileService = config.DK_SERVICES;
                    processClusterConfig(clusterConfigBase, connectionId);
                    console.info(`Klave AI App connection [${connectionId}] now using config.json overrides`);
                })
                .catch(() => {
                    processClusterConfig(clusterConfigBase, connectionId);
                });
        }
        else {
            processClusterConfig(clusterConfigBase, connectionId);
        }
    },

    initializeMultiple: (configs: { [connectionId: string]: string }): void => {
        Object.entries(configs).forEach(([connectionId, gatewayConfig]) => {
            secretariumHandler.initialize(gatewayConfig, connectionId);
        });
    },

    createKeyPair: (values: any): Promise<EncryptedKeyPairV2> =>
        new Promise((resolve, reject) => {
            Key.createKey()
                .then(key => key.seal(values.password))
                .then((key) => {
                    handlerStore.currentKey = key;
                    key.exportEncryptedKey().then((key) => {
                        resolve({
                            ...key,
                            name: values.name
                        });
                    });
                })
                .catch(e => reject(e));
        }),

    createEphemeral: (): Promise<EncryptedKeyPairV2> =>
        new Promise((resolve, reject) => {
            Key.createKey()
                .then((key) => {
                    handlerStore.currentKey = key;
                    key.exportEncryptedKey().then(resolve);
                })
                .catch(e => reject(e));
        }),

    encryptKey: (
        keyPair: ClearKeyPair,
        password: string
    ): Promise<EncryptedKeyPairV2> =>
        Key.importKey(keyPair)
            .then(key => key.seal(password))
            .then(encKey => encKey.exportEncryptedKey()),

    use: (keyPair: KeyPair, password: string): Promise<ClearKeyPair> => {
        return new Promise((resolve, reject) => {
            Key.importEncryptedKeyPair(keyPair, password)
                .then((key) => {
                    handlerStore.currentKey = key;
                    key.exportKey().then(resolve);
                })
                .catch(e => reject(e));
        });
    },

    connect: (connectionId: string = 'default'): Promise<ConnectionInformation> =>
        new Promise((resolve, reject) => {
            const connectionInstance = handlerStore.connections.get(connectionId);

            if (!connectionInstance) {
                return reject(new Error(`Connection ${connectionId} not initialized`));
            }

            const clusters = Object.entries<SecretariumGatewayConfig>(
                connectionInstance.clusters ?? {}
            );

            if (!connectionInstance.clusters) {
                return setTimeout(() => {
                    resolve(secretariumHandler.connect(connectionId));
                }, 500);
            }

            if (!clusters[0]) {
                console.error(`There are no cluster configured for connection ${connectionId}!`);
                return reject(new Error(`There are no cluster configured for connection ${connectionId}!`));
            }

            const cluster = clusters[0];
            let nextGateway = connectionInstance.currentGateway;
            do {
                nextGateway = Math.floor(
                    Math.random() * cluster[1].gateways.length
                );
            } while (
                (nextGateway === connectionInstance.currentGateway
                    && cluster[1].gateways?.length > 1)
                || nextGateway < 0
                || nextGateway >= cluster[1].gateways.length
            );

            connectionInstance.currentGateway = nextGateway;
            const endpoint = cluster[1].gateways?.[nextGateway]?.endpoint;

            if (cluster && endpoint && handlerStore.currentKey) {
                console.info(
                    `Klave AI connection [${connectionId}] now using the following gateway:`,
                    endpoint
                );
                connectionInstance.connection
                    .reset()
                    .onError((e: string) => {
                        console.error(`Connection [${connectionId}] error:`, e);
                        connectionInstance.isConnected = false;
                    })
                    .connect(endpoint, handlerStore.currentKey)
                    .then(() => {
                        connectionInstance.isConnected = true;
                        resolve({
                            cluster: cluster[0],
                            gateway:
                                cluster[1]?.gateways?.[nextGateway]?.name ?? '',
                            endpoint,
                            socket: connectionInstance.connection
                        });
                    })
                    .catch((e: Error) => {
                        connectionInstance.isConnected = false;
                        reject(e);
                    });
            }
            else {
                reject(new Error(`Cluster not configured for connection ${connectionId}`));
            }
        }),

    connectAll: async (): Promise<{ [connectionId: string]: ConnectionInformation }> => {
        const results: { [connectionId: string]: ConnectionInformation } = {};
        const connections = Array.from(handlerStore.connections.keys());

        await Promise.all(connections.map(async (connectionId) => {
            try {
                results[connectionId] = await secretariumHandler.connect(connectionId);
            }
            catch (error) {
                console.error(`Failed to connect ${connectionId}:`, error);
            }
        }));

        return results;
    },

    isConnected: (connectionId: string = 'default'): boolean => {
        const connectionInstance = handlerStore.connections.get(connectionId);
        return connectionInstance?.connection?.state === 1 && connectionInstance?.isConnected === true;
    },

    disconnect: (connectionId: string = 'default', hold = false): Promise<void> =>
        new Promise((resolve) => {
            const connectionInstance = handlerStore.connections.get(connectionId);

            if (connectionInstance) {
                connectionInstance.connection?.reset();
                connectionInstance.connection?.close();
                connectionInstance.connection = new SCP({ logger: console });
                connectionInstance.isConnected = false;
            }

            if (!hold)
                handlerStore.currentKey = undefined;
            resolve();
        }),

    disconnectAll: async (hold = false): Promise<void> => {
        const connections = Array.from(handlerStore.connections.keys());
        await Promise.all(connections.map(connectionId =>
            secretariumHandler.disconnect(connectionId, hold)
        ));
    },

    request: (
        dcApp: string,
        command: string,
        args: Record<string, unknown> | string,
        id: string,
        connectionId: string = 'default'
    ): Promise<Transaction> =>
        new Promise((resolve, reject) => {
            const connectionInstance = handlerStore.connections.get(connectionId);

            if (connectionInstance?.connection && connectionInstance.isConnected) {
                const queryHandle = connectionInstance.connection.newTx(
                    dcApp,
                    command,
                    id,
                    args
                );
                resolve(queryHandle);
            }
            else {
                reject(new Error(`No connection to Secretarium for ${connectionId}.`));
            }
        }),

    getConnection: (connectionId: string = 'default'): SCP | null => {
        const connectionInstance = handlerStore.connections.get(connectionId);
        return connectionInstance?.connection || null;
    },

    getAllConnections: (): { [connectionId: string]: SCP } => {
        const connections: { [connectionId: string]: SCP } = {};
        handlerStore.connections.forEach((instance, connectionId) => {
            connections[connectionId] = instance.connection;
        });
        return connections;
    },

    utils: Utils
};

// Legacy support - maintain backwards compatibility
// Object.defineProperty(secretariumHandler, 'currentConnection', {
//     get: () => {
//         const defaultInstance = handlerStore.connections.get(handlerStore.defaultConnectionId);
//         return defaultInstance?.connection;
//     }
// });

// if (
//     (import.meta.env.NODE_ENV === 'development'
//         || import.meta.env.VITE_APP_SECRETARIUM_GATEWAYS_OVERWRITABLE
//         === 'true')
//     && window
// ) {
//     window.appKlaveCluster = config => processClusterConfig(config, handlerStore.defaultConnectionId);
//     window.appKlaveCommand = (dcApp, command, args, id): void => {
//         secretariumHandler
//             .request(dcApp, command, args ?? {}, id ?? `${Math.random()}`)
//             .then((query) => {
//                 query.send();
//             });
//     };
//     window.appKlaveHandlerStore = handlerStore;
// }

export default secretariumHandler;
