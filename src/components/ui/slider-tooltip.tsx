import * as SliderPrimitive from '@radix-ui/react-slider';
import * as React from 'react';

import { Label } from '@/components/ui/label.tsx';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type SliderProps = React.ComponentPropsWithoutRef<
    typeof SliderPrimitive.Root
> & {
    showTooltip?: boolean;
    hasMarks?: boolean;
    labelTitle?: string;
    labelValue?: number;
    labelFor?: string;
};

export function SliderTooltip({ ref, className, showTooltip = false, hasMarks = false, labelTitle, labelValue, labelFor, ...props }: SliderProps & { ref?: React.RefObject<React.ComponentRef<typeof SliderPrimitive.Root> | null> }) {
    const [value, setValue] = React.useState<number[]>(
        props.defaultValue ? [...props.defaultValue] : [0]
    );
    const [showTooltipState, setShowTooltipState] = React.useState(false);
    const space = props.max && props.step ? props?.max / props.step : 0;

    const handlePointerDown = () => {
        setShowTooltipState(true);
    };

    const handlePointerUp = React.useCallback(() => {
        setShowTooltipState(false);
    }, []);

    React.useEffect(() => {
        document.addEventListener('pointerup', handlePointerUp);
        return () => {
            document.removeEventListener('pointerup', handlePointerUp);
        };
    }, [handlePointerUp]);

    return (
        <div className="grid gap-6">
            {labelFor && labelTitle && (
                <Label
                    htmlFor={labelFor}
                    className="justify-between pl-0.5"
                >
                    <span>{labelTitle}</span>
                    <span>{labelValue}</span>
                </Label>
            )}

            <SliderPrimitive.Root
                ref={ref}
                className={cn(
                    'relative flex w-full touch-none select-none items-center',
                    className
                )}
                onValueChange={(val) => {
                    setValue(val);
                    props.onValueChange?.(val);
                }}
                onPointerDown={handlePointerDown}
                {...props}
            >
                <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-primary/20">
                    <SliderPrimitive.Range className="absolute h-full bg-primary" />
                </SliderPrimitive.Track>

                {hasMarks && (
                    <div className="absolute inset-0 flex grow w-full items-center justify-between px-[7px]">
                        {Array.from({ length: space + 1 }).map(
                            (_, index) => (
                                <div
                                    className="w-1 h-2 rounded-full bg-primary"
                                    key={index}
                                >
                                </div>
                            )
                        )}
                    </div>
                )}

                <TooltipProvider>
                    <Tooltip open={showTooltip && showTooltipState}>
                        <TooltipTrigger
                            asChild
                            className="pointer-events-none"
                        >
                            <SliderPrimitive.Thumb
                                className="block h-4 w-4 rounded-full border border-primary/50 bg-background shadow transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                                onMouseEnter={() =>
                                    setShowTooltipState(true)}
                                onMouseLeave={() =>
                                    setShowTooltipState(false)}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{value[0]}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </SliderPrimitive.Root>
        </div>
    );
}

SliderTooltip.displayName = 'SliderTooltip';
