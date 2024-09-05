import { AuthenticationBanner } from '@dailydotdev/shared/src/components/auth';
import CustomAuthBanner from '@dailydotdev/shared/src/components/auth/CustomAuthBanner';
import { ONBOARDING_OFFSET } from '@dailydotdev/shared/src/components/post/BasePostContent';
import { CollectionPostContent } from '@dailydotdev/shared/src/components/post/collection';
import {
  PostContent,
  SCROLL_OFFSET,
} from '@dailydotdev/shared/src/components/post/PostContent';
import PostLoadingSkeleton from '@dailydotdev/shared/src/components/post/PostLoadingSkeleton';
import SquadPostContent from '@dailydotdev/shared/src/components/post/SquadPostContent';
import OnboardingContext from '@dailydotdev/shared/src/contexts/OnboardingContext';
import { ApiError, gqlClient } from '@dailydotdev/shared/src/graphql/common';
import {
  POST_BY_ID_STATIC_FIELDS_QUERY,
  PostData,
  PostType,
} from '@dailydotdev/shared/src/graphql/posts';
import {
  useJoinReferral,
  useViewSize,
  ViewSize,
} from '@dailydotdev/shared/src/hooks';
import { useOnboarding } from '@dailydotdev/shared/src/hooks/auth/useOnboarding';
import { usePrivateSourceJoin } from '@dailydotdev/shared/src/hooks/source/usePrivateSourceJoin';
import usePostById from '@dailydotdev/shared/src/hooks/usePostById';
import { useScrollTopOffset } from '@dailydotdev/shared/src/hooks/useScrollTopOffset';
import { useFeatureTheme } from '@dailydotdev/shared/src/hooks/utils/useFeatureTheme';
import { webappUrl } from '@dailydotdev/shared/src/lib/constants';
import { Origin } from '@dailydotdev/shared/src/lib/log';
import classNames from 'classnames';
import { ClientError } from 'graphql-request';
import {
  GetStaticPathsResult,
  GetStaticPropsContext,
  GetStaticPropsResult,
} from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { NextSeoProps } from 'next-seo/lib/types';
import { ParsedUrlQuery } from 'querystring';
import React, {
  CSSProperties,
  ReactElement,
  useContext,
  useState,
} from 'react';

import FooterNavBarLayout from '../../../components/layouts/FooterNavBarLayout';
import { getLayout } from '../../../components/layouts/MainLayout';
import { getTemplatedTitle } from '../../../components/layouts/utils';
import {
  getSeoDescription,
  PostSEOSchema,
} from '../../../components/PostSEOSchema';

const Custom404 = dynamic(
  () => import(/* webpackChunkName: "404" */ '../../404'),
);

export interface Props {
  id: string;
  initialData?: PostData;
}

const CONTENT_MAP: Record<PostType, typeof PostContent> = {
  article: PostContent,
  share: SquadPostContent,
  welcome: SquadPostContent,
  freeform: SquadPostContent,
  [PostType.VideoYouTube]: PostContent,
  collection: CollectionPostContent,
};

interface PostParams extends ParsedUrlQuery {
  id: string;
}

const PostPage = ({ id, initialData }: Props): ReactElement => {
  useJoinReferral();
  const { showArticleOnboarding } = useContext(OnboardingContext);
  const [position, setPosition] =
    useState<CSSProperties['position']>('relative');
  const router = useRouter();
  const { isFallback } = router;
  const { shouldShowAuthBanner } = useOnboarding();
  const isLaptop = useViewSize(ViewSize.Laptop);
  const { post, isError, isLoading } = usePostById({
    id,
    options: { initialData, retry: false },
  });
  const featureTheme = useFeatureTheme();
  const containerClass = classNames(
    'mb-16 min-h-page max-w-screen-laptop tablet:mb-8 laptop:mb-0 laptop:pb-6 laptopL:pb-0',
    [PostType.Share, PostType.Welcome, PostType.Freeform].includes(post?.type),
    featureTheme && 'bg-transparent',
  );
  const seoTitle = () => {
    if (post?.type === PostType.Share && post?.title === null) {
      return `Shared post at ${post?.source?.name}`;
    }

    return post?.title;
  };
  const seo: NextSeoProps = {
    canonical: post?.slug ? `${webappUrl}posts/${post.slug}` : undefined,
    title: getTemplatedTitle(seoTitle()),
    description: getSeoDescription(post),
    openGraph: {
      images: [{ url: `https://og.daily.dev/api/posts/${post?.id}` }],
      article: {
        publishedTime: post?.createdAt,
        tags: post?.tags,
      },
    },
  };

  const seoComponent = <NextSeo {...seo} />;

  useScrollTopOffset(() => globalThis.window, {
    onOverOffset: () => position !== 'fixed' && setPosition('fixed'),
    onUnderOffset: () => position !== 'relative' && setPosition('relative'),
    offset: SCROLL_OFFSET + (showArticleOnboarding ? ONBOARDING_OFFSET : 0),
    scrollProperty: 'scrollY',
  });

  const privateSourceJoin = usePrivateSourceJoin({ postId: id });

  if (isLoading || isFallback || privateSourceJoin.isActive) {
    return (
      <>
        <PostSEOSchema post={post} />
        {post?.title?.length && seoComponent}
        <PostLoadingSkeleton className={containerClass} type={post?.type} />
      </>
    );
  }

  const Content = CONTENT_MAP[post?.type];

  if (!Content || isError) {
    return <Custom404 />;
  }

  return (
    <FooterNavBarLayout post={post}>
      <Head>
        <link rel="preload" as="image" href={post?.image} />
      </Head>
      {seoComponent}
      <PostSEOSchema post={post} />
      <Content
        position={position}
        isPostPage
        post={post}
        isFallback={isFallback}
        backToSquad={!!router?.query?.squad}
        shouldOnboardAuthor={!!router.query?.author}
        origin={Origin.ArticlePage}
        isBannerVisible={shouldShowAuthBanner && !isLaptop}
        className={{
          container: containerClass,
          fixedNavigation: { container: 'flex laptop:hidden' },
          navigation: {
            container: 'flex tablet:hidden',
            actions: 'flex-1 justify-between',
          },
          content: 'laptop:pt-8',
        }}
      />
      {shouldShowAuthBanner && isLaptop && <AuthenticationBanner />}
    </FooterNavBarLayout>
  );
};

PostPage.getLayout = getLayout;
PostPage.layoutProps = {
  screenCentered: false,
  customBanner: <CustomAuthBanner />,
};

export default PostPage;

export async function getStaticPaths(): Promise<GetStaticPathsResult> {
  return { paths: [], fallback: true };
}

export async function getStaticProps({
  params,
}: GetStaticPropsContext<PostParams>): Promise<GetStaticPropsResult<Props>> {
  const { id } = params;
  try {
    const initialData = await gqlClient.request<PostData>(
      POST_BY_ID_STATIC_FIELDS_QUERY,
      { id },
    );
    return {
      props: {
        id: initialData.post.id,
        initialData,
      },
      revalidate: 60,
    };
  } catch (err) {
    const clientError = err as ClientError;
    const errors = Object.values(ApiError);
    if (errors.includes(clientError?.response?.errors?.[0]?.extensions?.code)) {
      const { postId } = clientError.response.errors[0].extensions;

      return {
        props: { id: postId || id },
        revalidate: 60,
      };
    }
    throw err;
  }
}
