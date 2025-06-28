import React from 'react';
import PropTypes from 'prop-types';
import { urlFor } from '../../lib/sanity';
import Text from '../Text/Text';

export default function PostCard({ post }) {
    // Generate optimized image URL with quality control
    const imageUrl = post.mainImage
        ? urlFor(post.mainImage)
            .width(1200)
            .quality(75) // Optimized quality for thumbnails
            .auto('format')
            .fit('max')
            .url()
        : null;

    return (
        <a
            href={`/journal/${post.slug?.current || post._id}`}
            className="group block relative overflow-hidden transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
            {post.mainImage ? (
                <div className="w-full aspect-[2/1] overflow-hidden rounded-lg">
                    <img
                        src={imageUrl}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            ) : (
                <div className="w-full aspect-[2/1] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-4xl">📝</div>
            )}
            <div className="flex flex-col justify-between pt-6">
                <div className="">

                    <Text variant="h5">{post.title}</Text>
                    {post.description && (
                        <Text variant="body" color="muted" className="mt-1 line-clamp-2">{post.description}</Text>
                    )}
                    <div className="flex items-center gap-2 pt-2">
                        {post.publishedAt && (
                            <Text variant="overline" color="muted">
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </Text>
                        )} ·

                        <Text variant="overline" color='muted'>{post.category || 'Post'}</Text>
                    </div>
                    <div className="flex items-center gap-4 mt-4">

                        {/* {typeof post.views === 'number' && post.views > 0 && (
                            <Text variant="caption" color="muted">{post.views} views</Text>
                        )} */}
                    </div>
                </div>
            </div>
        </a>
    );
}

PostCard.propTypes = {
    post: PropTypes.object.isRequired,
};
