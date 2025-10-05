import type { FC, PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

export const TypographyH1: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
    return (
        <h1 className={cn('', className)}>
            {children}
        </h1>
    );
};

export const TypographyH2: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
    return (
        <h2 className={cn('', className)}>
            {children}
        </h2>
    );
};

export const TypographyH3: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
    return (
        <h3 className={cn('', className)}>
            {children}
        </h3>
    );
};

export const TypographyH4: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
    return (
        <h4 className={cn('', className)}>
            {children}
        </h4>
    );
};

export const TypographyP: FC<PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
    return (
        <p className={cn('', className)}>
            {children}
        </p>
    );
};
