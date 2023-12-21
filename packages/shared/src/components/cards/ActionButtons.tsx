import React, { ReactElement, ReactNode } from 'react';
import classNames from 'classnames';
import dynamic from 'next/dynamic';
import styles from './Card.module.css';
import { Post, UserPostVote } from '../../graphql/posts';
import InteractionCounter from '../InteractionCounter';
import { QuaternaryButton } from '../buttons/QuaternaryButton';
import UpvoteIcon from '../icons/Upvote';
import CommentIcon from '../icons/Discuss';
import { Button, ButtonProps, ButtonSize } from '../buttons/Button';
import { SimpleTooltip } from '../tooltips/SimpleTooltip';
import OptionsButton from '../buttons/OptionsButton';
import { ReadArticleButton } from './ReadArticleButton';
import { visibleOnGroupHover } from './common';
import ConditionalWrapper from '../ConditionalWrapper';
import { useFeedPreviewMode } from '../../hooks';

const ShareIcon = dynamic(
  () => import(/* webpackChunkName: "share" */ '../icons/Share'),
);

export interface ActionButtonsProps {
  post: Post;
  onMenuClick?: (e: React.MouseEvent) => unknown;
  onUpvoteClick?: (post: Post) => unknown;
  onCommentClick?: (post: Post) => unknown;
  onShare?: (post: Post) => unknown;
  onShareClick?: (event: React.MouseEvent, post: Post) => unknown;
  onReadArticleClick?: (e: React.MouseEvent) => unknown;
  className?: string;
  children?: ReactNode;
  insaneMode?: boolean;
  openNewTab?: boolean;
}

export default function ActionButtons({
  openNewTab,
  post,
  onUpvoteClick,
  onCommentClick,
  onMenuClick,
  onReadArticleClick,
  onShareClick,
  className,
  children,
  insaneMode,
}: ActionButtonsProps): ReactElement {
  const upvoteCommentProps: ButtonProps<'button'> = {
    buttonSize: ButtonSize.Small,
  };
  const isFeedPreview = useFeedPreviewMode();

  if (isFeedPreview) {
    return null;
  }

  return (
    <div
      className={classNames(
        styles.actionButtons,
        'flex flex-row items-center',
        insaneMode && 'justify-between',
        className,
      )}
    >
      <ConditionalWrapper
        condition={insaneMode}
        wrapper={(leftChildren) => (
          <div className="flex justify-between">{leftChildren}</div>
        )}
      >
        <SimpleTooltip
          content={
            post?.userState?.vote === UserPostVote.Up
              ? 'Remove upvote'
              : 'Upvote'
          }
        >
          <QuaternaryButton
            id={`post-${post.id}-upvote-btn`}
            icon={
              <UpvoteIcon
                secondary={post?.userState?.vote === UserPostVote.Up}
              />
            }
            pressed={post?.userState?.vote === UserPostVote.Up}
            onClick={() => onUpvoteClick?.(post)}
            {...upvoteCommentProps}
            className="btn-tertiary-avocado w-[4.875rem]"
          >
            <InteractionCounter
              value={post.numUpvotes > 0 && post.numUpvotes}
            />
          </QuaternaryButton>
        </SimpleTooltip>
        <SimpleTooltip content="Comments">
          <QuaternaryButton
            id={`post-${post.id}-comment-btn`}
            icon={<CommentIcon secondary={post.commented} />}
            pressed={post.commented}
            onClick={() => onCommentClick?.(post)}
            {...upvoteCommentProps}
            className="btn-tertiary-blueCheese w-[4.875rem]"
          >
            <InteractionCounter
              value={post.numComments > 0 && post.numComments}
            />
          </QuaternaryButton>
        </SimpleTooltip>
        <SimpleTooltip content="Share post">
          <Button
            icon={<ShareIcon />}
            buttonSize={ButtonSize.Small}
            onClick={(event) => onShareClick?.(event, post)}
            className="btn-tertiary-cabbage"
          />
        </SimpleTooltip>
      </ConditionalWrapper>
      <ConditionalWrapper
        condition={insaneMode}
        wrapper={(rightChildren) => (
          <div
            className={classNames('flex justify-between', visibleOnGroupHover)}
          >
            {rightChildren}
          </div>
        )}
      >
        {insaneMode && (
          <ReadArticleButton
            className="mr-2 btn-primary"
            href={post.permalink}
            onClick={onReadArticleClick}
            openNewTab={openNewTab}
          />
        )}
        {insaneMode && (
          <OptionsButton
            className={visibleOnGroupHover}
            onClick={onMenuClick}
            tooltipPlacement="top"
          />
        )}
        {children}
      </ConditionalWrapper>
    </div>
  );
}
