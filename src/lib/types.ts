import { type EncryptedKeyPair } from '@secretarium/connector';

export type KeyPair = EncryptedKeyPair & {
    id: string;
    name: string;
};

export type Model = {
    access: number;
    description: string;
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
};

export type PromptInput = {
    context_name: string;
    user_prompt: string;
};

export type Input = Pick<PromptInput, 'context_name'>;
