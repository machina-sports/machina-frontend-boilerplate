import { combineReducers, configureStore, type Action, type ThunkAction } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import SampleReducer from '@/providers/sample/reducer';
import AssistantReducer from '@/providers/assistant/reducer';
import ChatUIReducer from '@/providers/chat-ui/reducer';

const rootReducer = combineReducers({
  sample: SampleReducer.reducer,
  assistant: AssistantReducer.reducer,
  chatUI: ChatUIReducer.reducer,
});

const persistConfig = {
  key: 'machina-boilerplate',
  storage,
  whitelist: ['chatUI'], // Persist only chatUI which contains the theme
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export type AppState = ReturnType<typeof rootReducer>;

export const makeStore = () =>
  configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
        },
      }),
    devTools: process.env.NODE_ENV !== 'production',
  });

let clientStore: AppStore | undefined;
let clientPersistor: ReturnType<typeof persistStore> | undefined;

/**
 * Returns a singleton store on the client and a new store per request on the server.
 * Keeps Redux SSR-safe for the App Router.
 */
export const getStore = () => {
  if (typeof window === 'undefined') {
    return makeStore();
  }

  if (!clientStore) {
    clientStore = makeStore();
    clientPersistor = persistStore(clientStore);
  }

  return clientStore;
};

export const getPersistor = () => {
  if (!clientPersistor) {
    const store = getStore();
    clientPersistor = persistStore(store);
  }
  return clientPersistor;
};

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;
