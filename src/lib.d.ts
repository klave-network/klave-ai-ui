interface Window {
    appKlaveCluster: (config: string | Record<string, unknown>) => void;
    appKlaveCommand: (
        dcApp: string,
        command: string,
        args?: Record<string, unknown>,
        id?: string
    ) => void;
    appKlaveHandlerStore: SecretariumClusterConfig;
    // appKlaveStore: Store;
    // appKlaveGremlin: (enable: boolean) => AynAction;
    appKlaveSubscriptions: Record<string, unknown>;
}
