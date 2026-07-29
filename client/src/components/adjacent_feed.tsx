import type { Feed } from "@rin/api";
import { useEffect, useRef, useState } from "react";
import { client } from "../app/runtime";
import { timeago } from "../utils/timeago.ts";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";

export function AdjacentSection({ id }: { id: string }) {
    console.log('[AdjacentSection] rendering with id:', id);
    const [relatedFeeds, setRelatedFeeds] = useState<Feed[]>([]);
    const [currentFeed, setCurrentFeed] = useState<Feed | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    useEffect(() => {
        // Fetch the current feed to get its hashtags
        client.feed.get(id).then(({ data }) => {
            if (data && typeof data !== "string") {
                const feed = data as Feed;
                setCurrentFeed(feed);
                // Use the first hashtag to find related feeds
                if (feed.hashtags.length > 0) {
                    const tagName = feed.hashtags[0].name;
                    client.tag.get(tagName).then(({ data: tagData }) => {
                        if (tagData) {
                            const tagFeeds = (tagData as any).feeds || [];
                            // Exclude the current feed
                            const filtered = tagFeeds.filter((f: Feed) => String(f.id) !== String(id));
                            setRelatedFeeds(filtered);
                        }
                    });
                }
            }
        });
    }, [id]);

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const scrollAmount = 320;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    if (!currentFeed) {
        return null;
    }

    return (
        <div className="rounded-2xl bg-w m-2 p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold t-primary">
                    {t('related_posts') || '相關文章'}
                </h2>
                {relatedFeeds.length > 3 && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-8 h-8 rounded-full bg-button flex items-center justify-center t-secondary hover:text-theme transition-colors"
                            aria-label="Scroll left"
                        >
                            <i className="ri-arrow-left-s-line"></i>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-8 h-8 rounded-full bg-button flex items-center justify-center t-secondary hover:text-theme transition-colors"
                            aria-label="Scroll right"
                        >
                            <i className="ri-arrow-right-s-line"></i>
                        </button>
                    </div>
                )}
            </div>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {relatedFeeds.length === 0 ? (
                    <p className="t-secondary text-sm">{t('no_related_posts')}</p>
                ) : (
                    relatedFeeds.slice(0, 10).map((feed) => (
                        <Link
                            key={feed.id}
                            href={`/feed/${feed.id}`}
                            target="_blank"
                            className="flex-shrink-0 w-64 bg-button rounded-xl p-4 hover:shadow-md transition-shadow duration-300 cursor-pointer"
                        >
                            <h3 className="text-base font-bold text-gray-700 dark:text-white line-clamp-2 mb-2">
                                {feed.title}
                            </h3>
                            <p className="text-gray-400 text-xs mb-2">
                                {timeago(feed.createdAt)}
                            </p>
                            {feed.hashtags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {feed.hashtags.slice(0, 2).map((tag, idx) => (
                                        <span key={idx} className="text-[11px] text-theme">
                                            #{tag.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
