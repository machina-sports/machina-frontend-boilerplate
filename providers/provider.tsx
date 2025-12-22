'use client';

import { useMemo, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from '@/components/theme-provider';
import { PosthogProvider } from '@/components/analytics/posthog-provider';
import { SampleProvider } from '@/providers/sample/provider';
import { AssistantProvider } from '@/providers/assistant/provider';
import { getStore, getPersistor } from '@/store';

export function Providers({ children }: { children: ReactNode }) {
  const store = useMemo(() => getStore(), []);
  const persistor = useMemo(() => getPersistor(), []);

  return (
    <ReduxProvider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider defaultTheme="dark">
          <PosthogProvider>
            <SampleProvider>
              <AssistantProvider>{children}</AssistantProvider>
            </SampleProvider>
          </PosthogProvider>
        </ThemeProvider>
      </PersistGate>
    </ReduxProvider>
  );
}
