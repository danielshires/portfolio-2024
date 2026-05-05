import React from 'react';
import PropTypes from 'prop-types';
import Text from '../../ui/text/Text'

export default function PostCard({ post }) {
    return (
        <a
            href={`/journal/${post.slug?.current || post._id}`}
            className="group block py-3 border-b border-zinc-200/80 dark:border-zinc-800/80 last:border-b-0 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black dark:focus:ring-white rounded-sm transition-colors hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 -mx-1 px-1"
            data-swup-preload
        >
            <div className="">
                <Text variant="body" weight="medium" className="font-semibold text-zinc-900 dark:text-zinc-100">
                    {post.title}
                </Text>
                {post.description && (
                    <Text variant="body" color="muted" className="mt-1 line-clamp-2">
                        {post.description}
                    </Text>
                )}
            </div>
        </a>
    );
}

PostCard.propTypes = {
    post: PropTypes.object.isRequired,
};
