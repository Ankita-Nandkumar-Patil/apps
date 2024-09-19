import { useMemo } from 'react';
import {
  QueryClient,
  QueryKey,
  QueryObserverOptions,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';
import { useAuthContext } from '../contexts/AuthContext';
import {
  Post,
  PostData,
  POST_BY_ID_QUERY,
  RelatedPost,
} from '../graphql/posts';
import { PostCommentsData } from '../graphql/comments';
import {
  generateQueryKey,
  RequestKey,
  updateAuthorContentPreference,
} from '../lib/query';
import { Connection, gqlClient } from '../graphql/common';
import { useMutationSubscription } from './mutationSubscription/useMutationSubscription';
import {
  ContentPreferenceMutation,
  contentPreferenceMutationMatcher,
  mutationKeyToContentPreferenceStatusMap,
} from './contentPreference/types';
import { PropsParameters } from '../types';

interface UsePostByIdProps {
  id: string;
  options?: QueryObserverOptions<PostData>;
}

interface UsePostById extends Pick<UseQueryResult, 'isError' | 'isLoading'> {
  post: Post;
  relatedCollectionPosts?: Connection<RelatedPost>;
}

const POST_KEY = 'post';

export const getPostByIdKey = (id: string): QueryKey => [POST_KEY, id];

export const updatePostCache = (
  client: QueryClient,
  id: string,
  postUpdate:
    | Partial<Omit<Post, 'id'>>
    | ((current: Post) => Partial<Omit<Post, 'id'>>),
): PostData => {
  const currentPost = client.getQueryData<PostData>(getPostByIdKey(id));

  if (!currentPost?.post) {
    return currentPost;
  }

  return client.setQueryData<PostData>(getPostByIdKey(id), (node) => {
    const update =
      typeof postUpdate === 'function' ? postUpdate(node.post) : postUpdate;
    const updatedPost = { ...node.post, ...update } as Post;
    const bookmark = updatedPost.bookmark ?? { createdAt: new Date() };

    return {
      post: {
        ...updatedPost,
        id: node.post.id,
        bookmark: !updatedPost.bookmarked ? null : bookmark,
      },
    };
  });
};

export const removePostComments = (
  client: QueryClient,
  post: Post,
  commentId: string,
  parentId: string,
): void => {
  const key = generateQueryKey(RequestKey.PostComments, null, post.id);
  client.setQueryData<PostCommentsData>(key, (data) => {
    if (!data) {
      return data;
    }
    const copy = { ...data };

    if (commentId !== parentId) {
      const parent = copy.postComments.edges.find(
        ({ node }) => node.id === parentId,
      );
      parent.node.children.edges = parent.node.children.edges.filter(
        ({ node }) => node.id !== commentId,
      );
      updatePostCache(client, post.id, { numComments: post.numComments - 1 });
      return copy;
    }

    const parent = copy.postComments.edges.find(
      ({ node }) => node.id === commentId,
    );
    const count = parent.node.children.edges.length + 1;
    const numComments = post.numComments - count;
    updatePostCache(client, post.id, { numComments });
    copy.postComments.edges = data.postComments.edges.filter(
      ({ node }) => node.id !== commentId,
    );

    return data;
  });
};

const usePostById = ({ id, options = {} }: UsePostByIdProps): UsePostById => {
  const { tokenRefreshed } = useAuthContext();
  const key = getPostByIdKey(id);
  const {
    data: postById,
    isError,
    isLoading,
  } = useQuery<PostData>(
    key,
    () => gqlClient.request(POST_BY_ID_QUERY, { id }),
    {
      ...options,
      enabled: !!id && tokenRefreshed,
    },
  );
  const post = postById || (options?.initialData as PostData);

  useMutationSubscription({
    matcher: contentPreferenceMutationMatcher,
    callback: ({ mutation, variables: mutationVariables, queryClient }) => {
      const currentData = queryClient.getQueryData(key);
      const [requestKey] = mutation.options.mutationKey as [
        RequestKey,
        ...unknown[],
      ];

      if (!currentData) {
        return;
      }

      queryClient.setQueryData<PostData>(key, (data) => {
        const { id: entityId, entity } =
          mutationVariables as PropsParameters<ContentPreferenceMutation>;

        const nextStatus = mutationKeyToContentPreferenceStatusMap[requestKey];

        if (typeof nextStatus === 'undefined') {
          return data;
        }

        const newData = structuredClone(data);

        if (newData.post?.author?.id === entityId) {
          newData.post.author = updateAuthorContentPreference({
            data: newData.post.author,
            status: nextStatus,
            entity,
          });
        }

        if (newData.post?.scout?.id === entityId) {
          newData.post.scout = updateAuthorContentPreference({
            data: newData.post.scout,
            status: nextStatus,
            entity,
          });
        }

        return newData;
      });
    },
  });

  return useMemo(
    () => ({
      post: post?.post,
      relatedCollectionPosts: post?.relatedCollectionPosts,
      isError,
      isLoading,
    }),
    [post, isError, isLoading],
  );
};

export default usePostById;
