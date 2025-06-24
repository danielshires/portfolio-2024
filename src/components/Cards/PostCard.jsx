import React from 'react';
import PropTypes from 'prop-types';
import { urlFor } from '../../lib/sanity';
import Text from '../Text/Text';

export default function PostCard({ post }) {
    return (
        <a
            href={`/posts/${post.slug?.current || post._id}`}
            className="group block relative overflow-hidden bg-background-light/5 dark:bg-background-dark/5 backdrop-blur-sm border border-border-light/10 dark:border-border-dark/10 hover:border-border-light/20 dark:hover:border-border-dark/20 transition-all duration-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
        >
            {post.mainImage ? (
                <div className="w-full aspect-[2/1] overflow-hidden">
                    <img
                        src={urlFor(post.mainImage).width(1200).url()}
                        alt={post.title}
                        loading="lazy"
                        decoding="async"
                        className="object-cover w-full h-full rounded transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            ) : (
                <div className="w-full aspect-[2/1] flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-4xl">📝</div>
            )}
            <div className="flex flex-col justify-between pt-2">
                <div className="">
                    <Text variant="overline" color='muted' className="mt-4">{post.category || 'Post'}</Text>
                    <Text variant="h4" className="mt-1 group-hover:text-primary transition-colors duration-200">{post.title}</Text>
                    {post.description && (
                        <Text variant="body" color="muted" className="mt-1 line-clamp-2">{post.description}</Text>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                        {post.publishedAt && (
                            <Text variant="caption" color="muted">
                                {new Date(post.publishedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </Text>
                        )}
                        {typeof post.views === 'number' && post.views > 0 && (
                            <Text variant="caption" color="muted">{post.views} views</Text>
                        )}
                    </div>
                </div>
                <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
            </div>
        </a>
    );
}

PostCard.propTypes = {
    post: PropTypes.object.isRequired,
};
