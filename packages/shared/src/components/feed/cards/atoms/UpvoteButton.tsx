import React, { ReactElement } from 'react';
import { Post, UserPostVote } from '../../../../graphql/posts';
import { QuaternaryButton } from '../../../buttons/QuaternaryButton';
import UpvoteIcon from '../../../icons/Upvote';
import InteractionCounter from '../../../InteractionCounter';
import { SimpleTooltip } from '../../../tooltips';

interface UpvoteButtonProps {
  post: Post;
}
export function UpvoteButton({ post }: UpvoteButtonProps): ReactElement {
  return (
    <SimpleTooltip
      content={
        post?.userState?.vote === UserPostVote.Up ? 'Remove upvote' : 'Upvote'
      }
    >
      <QuaternaryButton
        id={`post-${post.id}-upvote-btn`}
        icon={
          <UpvoteIcon secondary={post?.userState?.vote === UserPostVote.Up} />
        }
        pressed={post?.userState?.vote === UserPostVote.Up}
        onClick={() => {}}
        className="btn-tertiary-avocado w-[4.875rem]"
      >
        <InteractionCounter value={post.numUpvotes > 0 && post.numUpvotes} />
      </QuaternaryButton>
    </SimpleTooltip>
  );
}
