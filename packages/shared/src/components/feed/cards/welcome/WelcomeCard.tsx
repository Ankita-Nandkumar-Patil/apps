import React, { ReactElement } from 'react';
import { Card } from '../atoms/Card';
import { CardButton } from '../atoms/CardAction';
import SourceButton from '../../../cards/SourceButton';
import {
  Typography,
  TypographyColor,
  TypographyType,
} from '../../../typography/Typography';
import MetaContainer from '../atoms/MetaContainer';
import CreatedAt from '../atoms/CreatedAt';
import { Separator } from '../../../cards/common';
import { UpvoteButton } from '../atoms/UpvoteButton';
import { CommentButton } from '../atoms/CommentButton';
import ShareButton from '../atoms/ShareButton';
import { CardContainer } from '../atoms/CardContainer';
import { Image } from '../atoms/Image';
import { cloudinary } from '../../../../lib/image';
import OptionButton from '../atoms/OptionButton';
import { Flag } from '../atoms/Flag';
import { RaisedLabelType } from '../../../cards/RaisedLabel';
import { ProfilePicture } from '../../../ProfilePicture';
import { CardType } from '../common';

export const WelcomeCard = ({ post }: CardType): ReactElement => {
  return (
    <CardContainer>
      {post.pinnedAt && (
        <Flag type={RaisedLabelType.Pinned} description="Pinned" />
      )}
      <Card>
        <CardButton post={post} />
        <header className="relative m-2 mb-3 flex flex-row gap-2">
          <div className="relative">
            <SourceButton
              source={post.source}
              size="xsmall"
              className="absolute -bottom-2 -right-2"
            />
            <ProfilePicture user={post.author} size="large" />
          </div>
          <div className="ml-2 mr-6 flex flex-1 flex-col">
            <Typography type={TypographyType.Footnote} bold>
              {post.author.name}
            </Typography>
            <div className="flex-1" />
            <MetaContainer
              type={TypographyType.Footnote}
              color={TypographyColor.Tertiary}
            >
              <Typography bold>@{post.author.username}</Typography>
              <Separator />
              <CreatedAt createdAt={post.createdAt} />
            </MetaContainer>
          </div>
          <div className="invisible ml-auto flex flex-row gap-2 self-start group-hover/card:visible">
            <OptionButton post={post} tooltipPlacement="top" />
          </div>
        </header>
        <section className="flex flex-1">
          <div className="flex flex-1 flex-col px-2 pb-3 pt-2">
            <Typography
              type={TypographyType.Title3}
              bold
              className="line-clamp-3"
            >
              {post.title}
            </Typography>
            <div className="flex-1" />
          </div>
        </section>
        <section>
          <Image
            alt="Post Cover image"
            src={post.image}
            fallbackSrc={cloudinary.post.imageCoverPlaceholder}
            loading="lazy"
            className="my-2 w-full object-cover"
          />
        </section>
        <footer className="mx-4 flex flex-row justify-between">
          <UpvoteButton post={post} />
          <CommentButton post={post} />
          <ShareButton post={post} />
        </footer>
      </Card>
    </CardContainer>
  );
};
