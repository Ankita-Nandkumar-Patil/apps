import ad from '@dailydotdev/shared/__tests__/fixture/ad';
import defaultFeedPage from '@dailydotdev/shared/__tests__/fixture/feed';
import defaultUser from '@dailydotdev/shared/__tests__/fixture/loggedUser';
import { TestBootProvider } from '@dailydotdev/shared/__tests__/helpers/boot';
import {
  MockedGraphQLResponse,
  mockGraphQL,
} from '@dailydotdev/shared/__tests__/helpers/graphql';
import { MOST_UPVOTED_FEED_QUERY } from '@dailydotdev/shared/src/graphql/feed';
import { FeedData } from '@dailydotdev/shared/src/graphql/posts';
import { LoggedUser } from '@dailydotdev/shared/src/lib/user';
import { QueryClient } from '@tanstack/react-query';
import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { NextRouter, useRouter } from 'next/router';
import nock from 'nock';
import React from 'react';
import { mocked } from 'ts-jest/utils';

import Upvoted from '../pages/upvoted';

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  nock.cleanAll();
  mocked(useRouter).mockImplementation(
    () =>
      ({
        pathname: '/upvoted',
        query: {},
        replace: jest.fn(),
        push: jest.fn(),
      } as unknown as NextRouter),
  );
});

const createFeedMock = (
  page = defaultFeedPage,
  query: string = MOST_UPVOTED_FEED_QUERY,
  variables: unknown = {
    first: 7,
    loggedIn: true,
  },
): MockedGraphQLResponse<FeedData> => ({
  request: {
    query,
    variables,
  },
  result: {
    data: {
      page,
    },
  },
});

const renderComponent = (
  mocks: MockedGraphQLResponse[] = [createFeedMock()],
  user: LoggedUser = defaultUser,
): RenderResult => {
  const client = new QueryClient();

  mocks.forEach(mockGraphQL);
  nock('http://localhost:3000').get('/v1/a').reply(200, [ad]);

  return render(
    <TestBootProvider client={client} auth={{ user }}>
      {Upvoted.getLayout(<Upvoted />, {}, Upvoted.layoutProps)}
    </TestBootProvider>,
  );
};

it('should request most upvoted feed when logged-in', async () => {
  renderComponent([
    createFeedMock(defaultFeedPage, MOST_UPVOTED_FEED_QUERY, {
      first: 7,
      loggedIn: true,
      period: 7,
      version: 15,
    }),
  ]);
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});

it('should request most upvoted feed when not', async () => {
  renderComponent(
    [
      createFeedMock(defaultFeedPage, MOST_UPVOTED_FEED_QUERY, {
        first: 7,
        loggedIn: false,
        period: 7,
        version: 15,
      }),
    ],
    null,
  );
  await waitFor(async () => {
    const elements = await screen.findAllByTestId('postItem');
    expect(elements.length).toBeTruthy();
  });
});
