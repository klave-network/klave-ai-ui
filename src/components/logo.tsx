import { Link } from '@tanstack/react-router';
import klaveIcon from '@/assets/klave-icon.svg';
import klaveLogo from '@/assets/klave-logo.svg';
import { cn } from '@/lib/utils';

export const Logo = ({ className, type = 'square' }: { type?: 'square' | 'horizontal'; className?: string }) => {
    if (type === 'horizontal') {
        return (
            <Link
                search
                to="/"
                className={cn(
                    'flex items-start justify-start self-center font-medium',
                    className
                )}
            >
                <img src={klaveLogo} alt="klave logo" className='h-full' />
            </Link>
        );
    }
    return (
        <Link
            search
            to="/"
            className={cn(
                'flex flex-col items-center gap-2 self-center font-medium',
                className
            )}
        >
            <div className="rounded-xl p-[2px] bg-gradient-to-r from-kor via-kbl to-kcy shadow-centered shadow-gray/50">
                <div className="bg-gray-50 p-5 rounded-[calc(0.9rem-2px)]">
                    <img src={klaveIcon} alt="klave logo" className="size-8" />
                </div>
            </div>
        </Link>
    );
};
