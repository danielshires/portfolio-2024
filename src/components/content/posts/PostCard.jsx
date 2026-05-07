import PropTypes from 'prop-types';
import Text from '../../ui/text/Text'

import { linkListRowAnchorClass, linkListStrongTitleClass } from '../../ui/text/styles'

export default function PostCard({ post, showDescription = true }) {
    return (
        <a
            href={`/writing/${post.slug?.current || post._id}`}
            className={linkListRowAnchorClass}
            data-swup-preload
        >
            <div className="">
                <Text variant="body" className={linkListStrongTitleClass}>
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
