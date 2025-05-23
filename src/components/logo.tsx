import { Link } from '@tanstack/react-router';
import klaveLogo from '@/assets/klave-icon.svg';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => {
    return (
        <Link
            to="/"
            className={cn(
                'flex items-center gap-2 self-center font-medium',
                className
            )}
        >
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <img src={klaveLogo} alt="klave logo" className="size-4" />
            </div>
            <span className="text-2xl font-semibold">Klaive</span>
        </Link>
    );
};
