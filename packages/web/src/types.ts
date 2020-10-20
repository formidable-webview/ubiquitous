import { RefObject } from 'react';
import {
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import { EventBase } from '@formidable-webview/skeletton';

export interface Navigation {
  instanceId: number;
  syncState: 'init' | 'loading' | 'loaded' | 'error';
}

export interface PageLoader {
  reload(): void;
  stopLoading(): void;
  goBack(): void;
  goForward(): void;
}

export interface PageLoadState {
  instanceId: number;
  uri: string;
  baseUrl: string | undefined;
  html: string;
  loader: PageLoader;
  syncState: 'init' | 'loading' | 'loaded' | 'error';
  setSyncState: (nxstate: Navigation['syncState']) => void;
  flagHasError: () => void;
}

export type WebBackendState = {
  iframeRef: RefObject<HTMLIFrameElement>;
  frameId: number;
  ownerOrigin: string;
  eventBase: EventBase;
  baseUrl?: string;
  backendHandle: DOMBackendHandle<Document, Window>;
} & DOMBackendProps &
  PageLoadState;
