import type { RefAttributes, Component } from 'react';
import type { default as WebView, WebViewProps } from 'react-native-webview';

export type DOMBackendHandlers = Pick<
  WebViewProps,
  | 'onMessage'
  | 'onLoadStart'
  | 'onLoad'
  | 'onLoadEnd'
  | 'onLoadProgress'
  | 'onNavigationStateChange'
  | 'onError'
>;

export type DOMBackendProps = Pick<
  WebViewProps,
  | 'injectedJavaScript'
  | 'injectedJavaScriptBeforeContentLoaded'
  | 'javaScriptEnabled'
  | 'userAgent'
> & {
  html: string;
  url: string;
  domHandlers: DOMBackendHandlers;
};

export type DOMBackendState = 'loading' | 'loaded';

export type DocumentShape = {
  [k in string]: any;
};

export type WindowShape = {
  [k in string]: any;
} & { document: DocumentShape };

export type DOMBackendHandle<
  D extends DocumentShape = DocumentShape,
  W extends WindowShape = WindowShape
> = Pick<
  WebView,
  | 'reload'
  | 'stopLoading'
  | 'goBack'
  | 'goForward'
  | 'injectJavaScript'
  | 'requestFocus'
> & {
  getDocument(): D;
  getWindow(): W;
};

export type DOMBackendComponent = Component<
  DOMBackendProps & RefAttributes<DOMBackendHandle>
>;
