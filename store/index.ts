import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';
import SampleReducer from '@/providers/sample/reducer';
import AssistantReducer from '@/providers/assistant/reducer';
import ChatUIReducer from '@/providers/chat-ui/reducer';

const rootReducer = combineReducers({
  sample: SampleReducer.reducer,
  assistant: AssistantReducer.reducer,
  chatUI: ChatUIReducer.reducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export const makeStore = (preloadedState?: Partial<AppState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    devTools: process.env.NODE_ENV !== 'production',
  });

let clientStore: AppStore | undefined;

/**
 * Returns a singleton store on the client and a new store per request on the server.
 * Keeps Redux SSR-safe for the App Router.
 */
export const getStore = (preloadedState?: Partial<AppState>) => {
  if (typeof window === 'undefined') {
    return makeStore(preloadedState);
  }

  if (!clientStore) {
    clientStore = makeStore(preloadedState);
  }

  return clientStore;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;
