interface Window {
    demoKlaveCluster: (config: string | Record<string, unknown>) => void;
    demoKlaveCommand: (
        dcApp: string,
        command: string,
        args?: Record<string, unknown>,
        id?: string
    ) => void;
    demoKlaveHandlerStore: SecretariumClusterConfig;
    // demoKlaveStore: Store;
    // demoKlaveGremlin: (enable: boolean) => AynAction;
    demoKlaveSubscriptions: Record<string, unknown>;
}
