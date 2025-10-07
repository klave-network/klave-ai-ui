import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

// Handle copy to clipboard
export function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text).then(() => {
        toast('Copied to clipboard', {
            description: `${field} has been copied to your clipboard.`
        });
    });
}

export function cn(...inputs: Array<ClassValue>) {
    return twMerge(clsx(inputs));
}

export function delay() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve('Promise resolved after 20 seconds');
        }, 20000); // 20,000 milliseconds = 20 seconds
    });
}

export function generateSimpleId(length: number = 8): string {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

export function truncateId(
    id: string,
    startChars: number = 6,
    endChars: number = 4
): string {
    if (!id)
        return '';
    if (id.length <= startChars + endChars)
        return id;

    return `${id.slice(0, startChars)}...${id.slice(-endChars)}`;
}

export function formatTimestamp(timestampNanosStr: string): string {
    try {
        // Convert string to number
        const timestampNanos = BigInt(timestampNanosStr);

        // Convert nanoseconds to milliseconds (divide by 1,000,000)
        const timestampMillis = Number(timestampNanos / 1000000n);

        // Create Date object
        const date = new Date(timestampMillis);

        // Check if date is valid
        if (Number.isNaN(date.getTime())) {
            console.error('Invalid date from timestamp:', timestampNanosStr);
            return 'Invalid date';
        }

        // Format the date (you can customize this format)
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    catch (error) {
        console.error('Error formatting timestamp:', error);
        return 'Invalid date format';
    }
}

export function urlToId(url: string): string {
    // Remove any trailing slashes and extract the last part of the URL
    const cleanUrl = url.replace(/\/$/, '');
    const parts = cleanUrl.split('/');
    return parts[parts.length - 1] || url;
}

export function idToUrl(id: string): string {
    return id;
}

export function getFileExtension(filename: string): string {
    return `.${filename.split('.').pop()?.toLowerCase()}` || '';
}

export const FILE_TYPE_MAP: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.doc': 'application/msword',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.rtf': 'application/rtf',
    '.odt': 'application/vnd.oasis.opendocument.text',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.tiff': 'image/tiff',
    '.bmp': 'image/bmp',
    '.csv': 'text/csv',
    '.md': 'text/markdown'
};

export const TEXT_EXTENSIONS = ['.txt', '.rtf', '.md', '.csv'];
export const OCR_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.doc', '.ppt', '.odt', '.png', '.jpg', '.jpeg', '.tiff', '.bmp'];

export function getContentType(filename: string): string {
    const extension = getFileExtension(filename);
    return FILE_TYPE_MAP[extension] || 'application/octet-stream';
}

export function shouldUseOcr(filename: string): boolean {
    const extension = getFileExtension(filename);
    return OCR_EXTENSIONS.includes(extension);
}

export function isTextFile(filename: string): boolean {
    const extension = getFileExtension(filename);
    return TEXT_EXTENSIONS.includes(extension);
}

export function extractFileDate(): string {
    const d = new Date();
    return d.toISOString().split('T')[0];
}

export function getModelLogo(modelName: string): string | null {
    const lowerName = modelName.toLowerCase();

    // OpenAI models
    if (lowerName.includes('gpt') || lowerName.includes('openai')) {
        return '/src/assets/openai_light.svg';
    }

    // DeepSeek models
    if (lowerName.includes('deepseek')) {
        return '/src/assets/deepseek.svg';
    }

    // Meta models (Llama)
    if (lowerName.includes('llama') || lowerName.includes('meta')) {
        return '/src/assets/meta.svg';
    }

    // Microsoft models (Phi)
    if (lowerName.includes('phi') || lowerName.includes('microsoft')) {
        return '/src/assets/microsoft.svg';
    }

    // Mistral models
    if (lowerName.includes('mistral') || lowerName.includes('mixtral')) {
        return '/src/assets/mistral.svg';
    }

    // Qwen models
    if (lowerName.includes('qwen')) {
        return '/src/assets/qwen_light.svg';
    }

    // HuggingFace models
    if (lowerName.includes('smolvlm')) {
        return '/src/assets/hugging_face.svg';
    }

    return null;
}

export function getModelProvider(modelName: string): string {
    const lowerName = modelName.toLowerCase();

    if (lowerName.includes('gpt') || lowerName.includes('openai'))
        return 'OpenAI';
    if (lowerName.includes('deepseek'))
        return 'DeepSeek';
    if (lowerName.includes('llama') || lowerName.includes('meta'))
        return 'Meta';
    if (lowerName.includes('phi') || lowerName.includes('microsoft'))
        return 'Microsoft';
    if (lowerName.includes('mistral') || lowerName.includes('mixtral'))
        return 'Mistral';
    if (lowerName.includes('qwen'))
        return 'Qwen';

    return 'Unknown';
}
