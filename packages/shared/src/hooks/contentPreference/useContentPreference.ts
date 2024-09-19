import { useMutation } from '@tanstack/react-query';
import {
  CONTENT_PREFERENCE_FOLLOW_MUTATION,
  CONTENT_PREFERENCE_UNFOLLOW_MUTATION,
  ContentPreferenceStatus,
} from '../../graphql/contentPreference';
import { useAuthContext } from '../../contexts/AuthContext';
import { gqlClient } from '../../graphql/common';
import { PropsParameters } from '../../types';
import { generateQueryKey, RequestKey } from '../../lib/query';
import { useToastNotification } from '../useToastNotification';
import { ContentPreferenceMutation } from './types';

export type UseContentPreference = {
  follow: ContentPreferenceMutation;
  unfollow: ContentPreferenceMutation;
  subscribe: ContentPreferenceMutation;
  unsubscribe: ContentPreferenceMutation;
};

export const useContentPreference = (): UseContentPreference => {
  const { user } = useAuthContext();
  const { displayToast } = useToastNotification();

  const { mutateAsync: follow } = useMutation(
    async ({
      id,
      entity,
      entityName,
    }: PropsParameters<UseContentPreference['follow']>) => {
      await gqlClient.request(CONTENT_PREFERENCE_FOLLOW_MUTATION, {
        id,
        entity,
        status: ContentPreferenceStatus.Follow,
      });

      displayToast(`✅ You are now following ${entityName}`);
    },
    {
      mutationKey: generateQueryKey(RequestKey.ContentPreferenceFollow, user),
    },
  );

  const { mutateAsync: unfollow } = useMutation(
    async ({
      id,
      entity,
      entityName,
    }: PropsParameters<UseContentPreference['unfollow']>) => {
      await gqlClient.request(CONTENT_PREFERENCE_UNFOLLOW_MUTATION, {
        id,
        entity,
      });

      displayToast(`⛔️ You are no longer following ${entityName}`);
    },
    {
      mutationKey: generateQueryKey(RequestKey.ContentPreferenceUnfollow, user),
    },
  );

  const { mutateAsync: subscribe } = useMutation(
    async ({
      id,
      entity,
      entityName,
    }: PropsParameters<UseContentPreference['subscribe']>) => {
      await gqlClient.request(CONTENT_PREFERENCE_FOLLOW_MUTATION, {
        id,
        entity,
        status: ContentPreferenceStatus.Subscribed,
      });

      displayToast(`✅ You are now subscribed to ${entityName}`);
    },
    {
      mutationKey: generateQueryKey(
        RequestKey.ContentPreferenceSubscribe,
        user,
      ),
    },
  );

  const { mutateAsync: unsubscribe } = useMutation(
    async ({
      id,
      entity,
      entityName,
    }: PropsParameters<UseContentPreference['subscribe']>) => {
      await gqlClient.request(CONTENT_PREFERENCE_FOLLOW_MUTATION, {
        id,
        entity,
        status: ContentPreferenceStatus.Follow,
      });

      displayToast(`⛔️ You are no longer subscribed to ${entityName}`);
    },
    {
      mutationKey: generateQueryKey(
        RequestKey.ContentPreferenceUnsubscribe,
        user,
      ),
    },
  );

  return {
    follow,
    unfollow,
    subscribe,
    unsubscribe,
  };
};
