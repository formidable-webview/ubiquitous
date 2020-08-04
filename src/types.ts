import { WebViewProps } from 'react-native-webview';

export type DOMHandlers = Pick<
  WebViewProps,
  | 'onMessage'
  | 'onLoadStart'
  | 'onLoad'
  | 'onLoadEnd'
  | 'onLoadProgress'
  | 'onNavigationStateChange'
>;

export type BackendState = 'loading' | 'loaded';

export type SupportedPropsKeys =
  | 'source'
  | 'javaScriptEnabled'
  | 'containerStyle'
  | 'renderError'
  | 'renderLoading'
  | 'onScroll'
  | 'onLoad'
  | 'onLoadEnd'
  | 'onLoadStart'
  | 'onError'
  | 'onHttpError'
  | 'onNavigationStateChange'
  | 'onMessage'
  | 'onLoadProgress'
  | 'injectedJavaScript'
  | 'userAgent'
  | 'injectedJavaScriptBeforeContentLoaded';

export type SupportedProps = Pick<WebViewProps, SupportedPropsKeys>;
