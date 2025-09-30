import type { EncryptedKeyPair } from '@secretarium/connector';

export type KeyPair = EncryptedKeyPair & {
    id: string;
    name: string;
};

export type Capabilities = {
    logging: {
        level: string;
    };
    prompts: {
        listChanged: boolean;
    };
    resources: {
        listChanged: boolean;
        subscribe: boolean;
    };
    sampling: string;
    tools: {
        listChanged: boolean;
    };
};

export type McpCapabilities = {
    success: boolean;
    note: string;
    capabilities: Capabilities;
};

export type McpSession = {
    session_id: string;
    server_id: string;
    capabilities: Capabilities;
    created_at: string;
    last_activity: string;
    status: string;
};

export type McpServer = {
    id: string;
    name: string;
    url: string;
    auth_type: string;
    auth_config: {
        auth_type: string;
        token: string | null;
        username: string | null;
        password: string | null;
    };
    init_config: {
        protocolVersion: string;
        capabilities: {
            roots: {
                list_changed: boolean;
            };
            sampling: any;
        };
        clientInfo: {
            name: string;
            version: string;
        };
    };
    description: {
        brief: string;
        is_rag: boolean;
    };
    created_at: string;
    last_connected: string;
    is_active: boolean;
    tools: string[];
};

export type McpServerInput = Omit<
    McpServer,
  'id' | 'clientInfo' | 'created_at' | 'last_connected' | 'is_active' | 'tools'
>;

export type Model = {
    name: string;
    metadata: {
        type: number;
        local_path: string;
        url: string;
        description: {
            brief: string;
            task: string;
        };
        format: number;
        engine_type: number;
        tensor_type: number;
        engine_config: {
            multimodal: boolean;
        };
        dependencies: (null | unknown)[];
        parent_component: null | unknown;
    };
    status: number;
    file_size: number;
};

export type AddRagPromptResult = {
    references: Reference[];
    user_prompt: string;
};

export type Reference = {
    filename: string;
    content: string;
};

export type Tokenizer = {
    access: number;
    description: string;
    encryption_type: number;
    file_size: number;
    hash: string[];
    hash_type: number;
    inactivity_timeout: number;
    is_loaded: boolean;
    local_path: string;
    model_format: number;
    name: string;
    status: number;
    tensor_type: number;
    url: string;
};

export type ContextInput = {
    model_name: string;
    context_name: string;
    system_prompt: string;
    temperature: number;
    topp: number;
    steps: number;
    sliding_window: boolean;
    mode: string;
    embeddings: boolean;
    multimodal: boolean;
};

// Base context type
type BaseContext = {
    context_name: string;
};

export type Input = BaseContext;

export type PromptInput = BaseContext & {
    user_prompt: string;
};

export type InferenceResponseInput = BaseContext & {
    nb_pieces?: number;
};

export type LlmResponseInput = BaseContext & {
    session_id: string;
    nb_pieces?: number;
};

export type PromptInputRag = BaseContext & {
    user_prompt: string;
    rag_id: string;
    n_rag_chunks: number;
    n_max_augmentations: number;
};

export type FrameInput = BaseContext & {
    frame_bytes_b64: string;
    user_prompt: string;
};

export type ChunkResult = {
    piece: number[];
    complete: boolean;
};

export type McpChunkResult = {
    piece: number[];
    complete: boolean;
    has_tool_call: boolean;
    tool_call: {
        function_name: string;
        arguments: {
            agentPrompt: string;
            nChunks: number;
        };
    };
    message_before_tool: string;
};

export type BackendVersion = {
    core_version: {
        major: number;
        minor: number;
        patch: number;
        build_number: number;
    };
    wasm_version: {
        major: number;
        minor: number;
        patch: number;
        build_number: number;
    };
};

export type QuoteResponse = {
    quote: {
        report_body: {
            mr_enclave: { m: Array<number> };
            mr_signer: { m: Array<number> };
            report_data: Array<number>;
        };
    };
    quote_binary: Array<number>;
};

export type VerifyResponse = {
    quote_verification_result: number;
    quote_verification_result_description: string;
    sa_list: string;
};

export type VerifyArgs = {
    quote: number[];
    current_time: number;
};

export type Rag = {
    chunk_length: number;
    database_id: string;
    model_name: string;
    rag_id: string;
    table_name: string;
    tool_name: string;
};

export type Document = {
    id: string;
    url: string;
    version: string;
    length: number;
    date: string;
    content_type: string;
    controller_public_key: string;
};

export type Component = {
    name: string;
    metadata: {
        type: string;
        local_path: string;
        url: string;
        description: string;
        format: string;
        engine_type: string;
        engine_config: {
            multimodal: boolean;
        };
        tensor_type: string;
        dependencies: string[];
        parent_component: string;
    };
    encryption_type: string;
    encryption_key: string[];
    hash_type: string;
    hash: string[];
    is_loaded: boolean;
    access: string;
    inactivity_timeout: number;
};

export type Ocr = {
    host: string;
    ocr_id: string;
};

// Chunking strategy enum
export const ChunkingStrategy = {
    SEMANTIC: 'semantic',
    FIXED: 'fixed',
    SENTENCE: 'sentence',
    PARAGRAPH: 'paragraph'
} as const;

export type ChunkingStrategyType = typeof ChunkingStrategy[keyof typeof ChunkingStrategy];

export type TransactionResult = {
    success: boolean;
    message: string;
};

export type TokenIdentityResult = {
    requestId: string;
    result: {
        klaveServerPublicKey: string;
        storageServerPublicKey: string;
    };
    message?: string;
};

export type ListUserRequestsResult = {
    requestId: string;
    result: string[];
    message?: string;
};

export type ListDrivesResult = {
    requestId: string;
    result: string[];
};

export type DriveContentResult = {
    requestId: string;
    result: {
        locked: boolean;
        files: DriveFile[];
    };
    message?: string;
};

export type DriveFile = {
    digestB64: string;
    name: string;
    id: string;
    key: string;
    tokenB64: string;
    type: string;
};

export type GetFileUploadTokenResult = {
    requestId: string;
    result: {
        tokenB64: string;
    };
};

export type DriveRole = {
    driveId: string;
    role: string;
};

export type GetUserContentResult = {
    requestId: string;
    result: {
        id: string;
        roles: DriveRole[];
    };
    message?: string;
    success?: boolean;
};

export type GetFileUploadTokenInput = {
    driveId: string;
    digestB64: string;
};

export type UpdateDriveInput = {
    driveId: string;
    operation: 'addFile' | 'removeFile' | 'lock';
    file: {
        name: string;
        digestB64: string;
        type: string;
        key: string;
        tokenB64: string;
    };
};

export type UserRequestInput = {
    driveId: string;
    role: string;
};

export type ApproveUserRequestInput = {
    userRequestId: string;
};

export type SetIdentitiesInput = {
    resetKlaveServer: boolean;
    resetStorageServer: boolean;
};

export type ExportStorageServerPrivateKeyInput = {
    format: string;
};
