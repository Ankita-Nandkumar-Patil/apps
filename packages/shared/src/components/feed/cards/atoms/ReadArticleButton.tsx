import React, { ReactElement } from 'react';
import { Button, ButtonSize } from '../../../buttons/Button';
import OpenLinkIcon from '../../../icons/OpenLink';
import useLeanPostActions from '../../../../hooks/post/useLeanPostActions';
import { getReadPostButtonText, Post } from '../../../../graphql/posts';

interface ReadArticleButtonProps {
  className?: string;
  openNewTab?: boolean;
  buttonSize?: ButtonSize;
  post?: Post;
  rel?: string;
}

export const ReadArticleButton = ({
  openNewTab,
  post,
  buttonSize = ButtonSize.Small,
  ...props
}: ReadArticleButtonProps): ReactElement => {
  const { onDirectClick } = useLeanPostActions();
  const onClickHandler = () => {
    onDirectClick(post);
  };
  return (
    <Button
      tag="a"
      href={post.permalink}
      title={post.title}
      {...props}
      buttonSize={buttonSize}
      rightIcon={<OpenLinkIcon className="ml-2" secondary />}
      onClick={onClickHandler}
      target={openNewTab ? '_blank' : '_self'}
    >
      {getReadPostButtonText(post)}
    </Button>
  );
};
