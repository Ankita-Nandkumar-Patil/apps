import { GrowthBookProvider } from '@dailydotdev/shared/src/components/GrowthBookProvider';
import { PromptElement } from '@dailydotdev/shared/src/components/modals/Prompt';
import Toast from '@dailydotdev/shared/src/components/notifications/Toast';
import { AlertContextProvider } from '@dailydotdev/shared/src/contexts/AlertContext';
import { AuthContextProvider } from '@dailydotdev/shared/src/contexts/AuthContext';
import { LogContextProvider } from '@dailydotdev/shared/src/contexts/LogContext';
import { NotificationsContextProvider } from '@dailydotdev/shared/src/contexts/NotificationsContext';
import { SettingsContextProvider } from '@dailydotdev/shared/src/contexts/SettingsContext';
import { useEventListener } from '@dailydotdev/shared/src/hooks';
import { useError } from '@dailydotdev/shared/src/hooks/useError';
import { useRefreshToken } from '@dailydotdev/shared/src/hooks/useRefreshToken';
import { Boot, BootApp } from '@dailydotdev/shared/src/lib/boot';
import {
  ExtensionMessageType,
  getCompanionWrapper,
} from '@dailydotdev/shared/src/lib/extension';
import { AuthEvent } from '@dailydotdev/shared/src/lib/kratos';
import { defaultQueryClientConfig } from '@dailydotdev/shared/src/lib/query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import React, { ReactElement, useState } from 'react';
import browser from 'webextension-polyfill';

import { version } from '../../package.json';
import CustomRouter from '../lib/CustomRouter';
import Companion from './Companion';
import { companionFetch } from './companionFetch';

const queryClient = new QueryClient(defaultQueryClientConfig);
const router = new CustomRouter();

export type CompanionData = { url: string; deviceId: string } & Pick<
  Boot,
  | 'postData'
  | 'settings'
  | 'alerts'
  | 'user'
  | 'visit'
  | 'accessToken'
  | 'squads'
  | 'exp'
>;

const app = BootApp.Companion;

export default function App({
  deviceId,
  url,
  postData,
  settings,
  user,
  alerts,
  visit,
  accessToken,
  squads,
  exp,
}: CompanionData): ReactElement {
  useError();
  const [token, setToken] = useState(accessToken);
  const [isOptOutCompanion, setIsOptOutCompanion] = useState<boolean>(
    settings?.optOutCompanion,
  );

  const refetchData = async () => {
    if (isOptOutCompanion) {
      return undefined;
    }

    return browser.runtime.sendMessage({
      type: ExtensionMessageType.ContentLoaded,
    });
  };

  useRefreshToken(token, refetchData);

  useEventListener(globalThis, 'message', async (e) => {
    if (e.data?.eventKey === AuthEvent.Login) {
      await refetchData();
    }
  });

  if (isOptOutCompanion) {
    return <></>;
  }

  return (
    <div>
      <style>
        @import &quot;{browser.runtime.getURL('css/companion.css')}&quot;;
      </style>
      <RouterContext.Provider value={router}>
        <QueryClientProvider client={queryClient}>
          <GrowthBookProvider
            app={app}
            user={user}
            deviceId={deviceId}
            experimentation={exp}
          >
            <AuthContextProvider
              user={user}
              visit={visit}
              tokenRefreshed
              getRedirectUri={() => browser.runtime.getURL('index.html')}
              updateUser={() => null}
              squads={squads}
            >
              <SettingsContextProvider settings={settings}>
                <AlertContextProvider alerts={alerts}>
                  <LogContextProvider
                    app={app}
                    version={version}
                    fetchMethod={companionFetch}
                    backgroundMethod={(msg) => browser.runtime.sendMessage(msg)}
                    deviceId={deviceId}
                    getPage={() => url}
                  >
                    <NotificationsContextProvider
                      isNotificationsReady={false}
                      unreadCount={0}
                    >
                      <Companion
                        postData={postData}
                        companionHelper={alerts?.companionHelper}
                        companionExpanded={settings?.companionExpanded}
                        onOptOut={() => setIsOptOutCompanion(true)}
                        onUpdateToken={setToken}
                      />
                    </NotificationsContextProvider>
                    <PromptElement parentSelector={getCompanionWrapper} />
                    <Toast
                      autoDismissNotifications={
                        settings?.autoDismissNotifications
                      }
                    />
                  </LogContextProvider>
                </AlertContextProvider>
              </SettingsContextProvider>
            </AuthContextProvider>
          </GrowthBookProvider>
          <ReactQueryDevtools />
        </QueryClientProvider>
      </RouterContext.Provider>
    </div>
  );
}
