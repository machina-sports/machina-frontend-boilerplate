import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ChatTheme = 'light' | 'dark' | 'auto';
export type ChatLayout = 'standard' | 'wide';

type ChatUIState = {
  isFullscreen: boolean;
  isSidebarOpen: boolean;
  theme: ChatTheme;
  layout: ChatLayout;
  fontSize: number; // em pixels (12-20)
  showTimestamps: boolean;
  showAvatars: boolean;
};

const initialState: ChatUIState = {
  isFullscreen: false,
  isSidebarOpen: true,
  theme: 'auto',
  layout: 'standard',
  fontSize: 14,
  showTimestamps: true,
  showAvatars: true,
};

const ChatUIReducer = createSlice({
  name: 'chatUI',
  initialState,
  reducers: {
    toggleFullscreen: (state) => {
      state.isFullscreen = !state.isFullscreen;
    },
    setFullscreen: (state, action: PayloadAction<boolean>) => {
      state.isFullscreen = action.payload;
    },
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setTheme: (state, action: PayloadAction<ChatTheme>) => {
      state.theme = action.payload;
    },
    setLayout: (state, action: PayloadAction<ChatLayout>) => {
      state.layout = action.payload;
    },
    setFontSize: (state, action: PayloadAction<number>) => {
      state.fontSize = Math.max(12, Math.min(20, action.payload));
    },
    toggleTimestamps: (state) => {
      state.showTimestamps = !state.showTimestamps;
    },
    toggleAvatars: (state) => {
      state.showAvatars = !state.showAvatars;
    },
    resetChatUI: () => initialState,
  },
});

export const {
  toggleFullscreen,
  setFullscreen,
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setLayout,
  setFontSize,
  toggleTimestamps,
  toggleAvatars,
  resetChatUI,
} = ChatUIReducer.actions;

export default ChatUIReducer;
