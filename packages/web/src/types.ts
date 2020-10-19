import { RefObject } from 'react';
import {
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import { EventBase } from '@formidable-webview/skeletton';
import { WebViewSource } from 'react-native-webview/lib/WebViewTypes';

export interface Navigation {
  current: number;
  history: Array<WebViewSource>;
  instanceId: number;
  syncState: 'init' | 'loading' | 'loaded' | 'error';
}

export interface Navigator {
  reset(): void;
  reload(): void;
  navigate(next: WebViewSource): void;
  goBack(): void;
  goForward(): void;
}

export interface NavigationState {
  instanceId: number;
  uri: string;
  baseUrl: string | undefined;
  html: string;
  navigator: Navigator;
  syncState: 'init' | 'loading' | 'loaded' | 'error';
  setSyncState: (nxstate: Navigation['syncState']) => void;
  flagHasError: () => void;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
}

export type WebBackendState = {
  iframeRef: RefObject<HTMLIFrameElement>;
  frameId: number;
  navigator: Navigator;
  ownerOrigin: string;
  eventBase: EventBase;
  baseUrl?: string;
  backendHandle: DOMBackendHandle<Document, Window>;
} & DOMBackendProps &
  NavigationState;
