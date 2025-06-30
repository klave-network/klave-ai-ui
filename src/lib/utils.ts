import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { ClassValue } from 'clsx';

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
    if (!id) return '';
    if (id.length <= startChars + endChars) return id;

    return `${id.slice(0, startChars)}...${id.slice(-endChars)}`;
}
