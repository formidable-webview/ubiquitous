import { RefObject } from 'react';
import {
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import { EventBase } from '@formidable-webview/skeletton';

import { WebViewSharedProps } from 'react-native-webview/lib/WebViewTypes';

export interface IframeWebViewProps extends WebViewSharedProps {
  /**
   * Sets whether Geolocation is available.
   *
   * @defaultValue false
   * @platform web
   */
  geolocationEnabled?: boolean;
  /**
   * Set iframe `loading="lazy"` attribute.
   * This feature has the potential to boost page loading performances, but is
   * still experimental.
   *
   * See {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-loading}.
   *
   * @defaultValue false
   * @platform web
   */
  lazyLoadingEnabled?: boolean;
  /**
   * By default, the iframe will be
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox | sandboxed}
   * for the sake of safety. You can disable this behavior by setting this prop
   * to `true`. Read more about the security risks associated with removing
   * {@link https://looker.com/blog/iframe-sandbox-tutorial | sandboxing here}.
   *
   * @defaultValue true
   * @platform web
   */
  sandboxEnabled?: boolean;
  /**
   * Override iframe
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox | sandbox attribute}
   * to lift sandbox restrictions.
   *
   * @defaultValue "allow-same-origin allow-modals allow-popups allow-forms"
   * @platform web
   */
  sandboxAuthorizations?: string;
  /**
   * Override iframe
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-allow | allow attribute}
   * to set feature policies. If you need access to a specific
   * peripherals, it can be allowed here (microphone, camera, battery ...).
   *
   * @defaultValue "fullscreen payment document-domain"
   * @platform web
   */
  allowedFeatures?: string;
}

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
} & DOMBackendProps<IframeWebViewProps> &
  PageLoadState;
