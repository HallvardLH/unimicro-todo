interface InfiniteScrollSentinelProps {
    refCallback: React.Ref<HTMLDivElement>;
    isFetching: boolean;
    hasNextPage: boolean;
}

export function InfiniteScrollSentinel({ refCallback, isFetching, hasNextPage }: InfiniteScrollSentinelProps) {
    return (
        <div
            ref={refCallback}
            className="h-10 flex justify-center items-center text-sm text-muted-foreground"
        >
            {isFetching ? "Loading more..." : hasNextPage ? "Scroll to load more" : "No more todos"}
        </div>
    );
}
