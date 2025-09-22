import type { ClassValue } from 'clsx';

import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

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
