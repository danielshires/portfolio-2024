import PropTypes from 'prop-types';
import Text from '../../ui/text/Text'

export default function PostCard({ post, showDescription = true }) {
    return (
        <a
            href={`/journal/${post.slug?.current || post._id}`}
            className="group block py-1 border-b border-zinc-200/80 dark:border-zinc-800/80 last:border-b-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black dark:focus-visible:ring-white dark:focus-visible:ring-offset-zinc-950"
            data-swup-preload
        >
            <div className="">
                <Text variant="body" className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:underline underline-offset-4">
                    {post.title}
                </Text>
                {showDescription && post.description && (
                    <Text variant="body" color="muted" className="mt-1 line-clamp-2 group-hover:text-zinc-900 dark:group-hover:text-zinc-200">
                        {post.description}
                    </Text>
                )}
            </div>
        </a>
    );
}

PostCard.propTypes = {
    post: PropTypes.object.isRequired,
    showDescription: PropTypes.bool,
};
