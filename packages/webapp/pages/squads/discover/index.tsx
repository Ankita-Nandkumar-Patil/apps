import React, { ReactElement } from 'react';
import { useSquadCategories } from '@dailydotdev/shared/src/hooks/squads/useSquadCategories';
import { SquadsDirectoryFeed } from '@dailydotdev/shared/src/components/cards/squad/SquadsDirectoryFeed';
import { NextSeo } from 'next-seo';
import { useViewSize, ViewSize } from '@dailydotdev/shared/src/hooks';
import {
  Typography,
  TypographyType,
} from '@dailydotdev/shared/src/components/typography/Typography';
import { IconSize } from '@dailydotdev/shared/src/components/Icon';
import { SourceIcon } from '@dailydotdev/shared/src/components/icons';
import { getLayout } from '../../../components/layouts/FeedLayout';
import { mainFeedLayoutProps } from '../../../components/layouts/MainFeedPage';
import { SquadDirectoryLayout } from '../../../../shared/src/components/squads/layout/SquadDirectoryLayout';
import { defaultSeo } from '../../../next-seo';

interface SquadDirectoryTitleProps {
  icon?: boolean;
  title: string;
}

const SquadDirectoryTitle = ({
  icon,
  title,
}: SquadDirectoryTitleProps): ReactElement => (
  <Typography
    className="flex flex-row items-center gap-1"
    type={TypographyType.Title2}
    bold
  >
    {icon && <SourceIcon secondary size={IconSize.Large} />}
    {title}
  </Typography>
);

function SquadDiscoveryPage(): ReactElement {
  const { data } = useSquadCategories();
  const isMobile = useViewSize(ViewSize.MobileL);
  const categories = data?.pages.flatMap((page) => page.categories.edges) ?? [];
  const limit = isMobile ? 5 : 20;

  return (
    <SquadDirectoryLayout className="gap-6">
      <NextSeo
        {...defaultSeo}
        title="Squads Directory"
        description="Explore the daily.dev Squads Directory and connect with communities of developers passionate about various technologies and topics. Discover, join, and engage with like-minded professionals in your area of interest."
      />
      <SquadsDirectoryFeed
        key="featured"
        linkToSeeAll="/squads/discover/featured"
        title={<SquadDirectoryTitle title="Featured" icon />}
        query={{ isPublic: true, featured: true, first: limit }}
      >
        {isMobile && (
          <div className="absolute inset-0 -left-4 -z-1 flex w-[calc(100%+2rem)] bg-gradient-to-t from-overlay-float-cabbage from-10% to-background-default tablet:hidden" />
        )}
      </SquadsDirectoryFeed>
      {categories.map(({ node }) => (
        <SquadsDirectoryFeed
          key={node.id}
          title={<SquadDirectoryTitle title={node.title} />}
          linkToSeeAll={`/squads/discover/${node.id}`}
          query={{
            categoryId: node.id,
            isPublic: true,
            first: limit,
            sortByMembersCount: true,
          }}
        />
      ))}
    </SquadDirectoryLayout>
  );
}

SquadDiscoveryPage.getLayout = getLayout;
SquadDiscoveryPage.layoutProps = mainFeedLayoutProps;

export default SquadDiscoveryPage;
