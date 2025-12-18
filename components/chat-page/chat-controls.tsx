'use client';

import { useAppDispatch } from '@/store/dispatch';
import { useAppSelector } from '@/store/useState';
import { toggleFullscreen, setTheme, setLayout } from '@/providers/chat-ui/reducer';
import { Button } from '@/components/ui/button';
import {
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  Monitor,
  LayoutGrid,
  LayoutList,
  AlignJustify,
  Plus,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

export function ChatControls() {
  const dispatch = useAppDispatch();
  const { isFullscreen, theme, layout } = useAppSelector((state) => state.chatUI);

  const themeIcons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    auto: <Monitor className="h-4 w-4" />,
  };

  const layoutIcons = {
    standard: <LayoutGrid className="h-4 w-4" />,
    wide: <LayoutList className="h-4 w-4" />,
  };

  const handleNewChat = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center gap-1">
      {/* New Chat */}
      <Button
        variant="default"
        onClick={handleNewChat}
        className="mr-4 h-9 w-auto"
        title="New Chat"
      >
        <Plus className="h-4 w-4" />
        <span className="text-sm font-medium">New Chat</span>
      </Button>

      {/* Theme Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="Change theme"
          >
            {themeIcons[theme]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => dispatch(setTheme('light'))}>
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(setTheme('dark'))}>
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Layout Selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            title="Change layout"
          >
            {layoutIcons[layout]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Layout</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => dispatch(setLayout('standard'))}>
            <LayoutGrid className="mr-2 h-4 w-4" />
            Standard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => dispatch(setLayout('wide'))}>
            <LayoutList className="mr-2 h-4 w-4" />
            Wide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Fullscreen Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => dispatch(toggleFullscreen())}
        className="h-9 w-9 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
      >
        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </Button>
    </div>
  );
}
