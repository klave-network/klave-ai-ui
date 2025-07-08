import { type EncryptedKeyPair } from '@secretarium/connector';

export type KeyPair = EncryptedKeyPair & {
    id: string;
    name: string;
};

export type Model = {
    access: number;
    description: {
        brief: string;
        task: string;
    };
    encryption_type: number;
    file_size: number;
    hash: string[];
    hash_type: number;
    inactivity_timeout: number;
    is_loaded: boolean;
    local_path: string;
    max_concurrent_queries: number;
    max_concurrent_queries_per_user: number;
    max_threads: number;
    model_format: number;
    name: string;
    status: number;
    system_prompt: number[];
    tensor_type: number;
    tokenizer_name: string;
    url: string;
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

export type PromptInputRag = BaseContext & {
    user_prompt: string;
    rag_id: string;
    n_rag_chunks: number;
    n_max_augmentations: number;
};

export type FrameInput = BaseContext & {
    frame_bytes: Uint8Array;
};

export type ChunkResult = {
    piece: number[];
    complete: boolean;
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

export type PgsqlCreateInput = {
    host: string;
    dbname: string;
    user: string;
    password: string;
};

export type RagCreateInput = {
    database_id: string;
    rag_name: string;
    model_name: string;
    chunk_length?: number;
};

export type RagDocumentInput = {
    rag_id: string;
    document: any; // Replace with proper document metadata type
};

export type RagDeleteDocumentInput = {
    rag_id: string;
    document_id: string;
};

export type RagDocumentListInput = {
    rag_id: string;
};

export type Rag = {
    chunk_length: number;
    database_id: string;
    model_name: string;
    rag_id: string;
    table_name: string;
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
