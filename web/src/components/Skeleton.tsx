import clsx from 'clsx';

interface SkeletonProps {
    className?: string;
    count?: number;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

export default function Skeleton({ className, count = 1, width, height, circle }: SkeletonProps) {
    const skeletons = Array(count).fill(0);

    return (
        <>
            {skeletons.map((_, index) => (
                <div
                    key={index}
                    className={clsx(
                        'bg-gray-200 animate-pulse',
                        circle ? 'rounded-full' : 'rounded',
                        className
                    )}
                    style={{
                        width: width,
                        height: height,
                    }}
                />
            ))}
        </>
    );
}
