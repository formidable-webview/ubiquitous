import { RefObject } from 'react';
import {
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import { EventBase } from '@formidable-webview/skeletton';

import { WebViewSharedProps } from 'react-native-webview/lib/WebViewTypes';
import { WebPermissionPoliciesMap } from './web-features';

export interface IframeWebViewProps extends WebViewSharedProps {
  /**
   * Set iframe `csp` attribute.
   * See
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-csp | MDN reference.}
   *
   * @platform web
   */
  csp?: string;
  /**
   * Set iframe `referrerpolicy` attribute.
   * See
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-referrerpolicy | MDN reference.}
   *
   * @platform web
   */
  referrerPolicy?: string;
  /**
   * Sets whether Geolocation API can be used.
   *
   * @defaultValue false
   * @platform web
   */
  geolocationEnabled?: boolean;
  /**
   * Sets whether Fullscreen API can be used.
   *
   * @defaultValue true
   * @platform web
   */
  fullscreenEnabled?: boolean;
  /**
   * Sets whether PaymentRequest API can be used.
   *
   * @defaultValue true
   * @platform web
   */
  paymentEnabled?: boolean;
  /**
   * Set iframe `loading="lazy"` attribute.
   * This feature has the potential to boost page loading performances and limit
   * memory consumption, but is yet experimental.
   *
   * See
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-loading | loading attribute on MDN}.
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
   * Sets whether `WebView` messaging is enabled.
   *
   * @remarks Messaging will not work on cross origins iframes.
   *
   * @defaultValue true
   * @platform web
   *
   */
  messagingEnabled?: boolean;
  /**
   * Set iframe sandbox attribute.
   * See
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-sandbox | sandbox attribute on MDN}.
   *
   * @remarks
   * - This prop will be ignored when `sandboxEnabled` is set to `false`.
   * - `javascriptEnabled` prop will set `"allow-scripts"` rule when `true`.
   *
   * @defaultValue "allow-same-origin allow-modals allow-popups allow-forms"
   * @platform web
   */
  sandbox?: string;
  /**
   * A map to override iframe
   * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe#attr-allow | allow attribute}
   * to set permission policies. If you need access to a specific
   * peripherals, it can be allowed here (microphone, camera, battery ...).
   *
   * Each key is the name of a policy, camelCased, and each value is either:
   *
   * - `true`, which will enable the permission with default allowlist;
   * - `false`, which will disable the permission by setting allowlist to `'none'`;
   * - a string, which should follow the syntax of an allowlist to specify origins.
   *
   * Read more about allowlist syntax {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Feature_Policy/Using_Feature_Policy#allowlist | on MDN}.
   *
   * @remarks Some policies will be derived from specific props such as `fullscreenEnabled`.
   * When you set `webPolicies` prop, policies derived from props will be
   * merged into, meaning you can override them, but they will otherwise be preserved.
   *
   * @example
   *
   * ```tsx
   * <IframeWebView paymentEnabled webFeatures={{ documentDomain: false, camera: "'src' https://example.com" }} />
   * ```
   * will be rendered in the DOM as
   * ```html
   * <iframe allowpaymentrequest="true" allow="payment; document-domain 'none'; camera 'src' https://example.com"></iframe>
   * ```
   *
   * @defaultValue `{ documentDomain: true }`
   * @platform web
   */
  webPolicies?: WebPermissionPoliciesMap;
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
