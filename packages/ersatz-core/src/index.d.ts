import type { RefAttributes, Component } from 'react';
import type { default as WebView, WebViewProps } from 'react-native-webview';

export type DOMBackendHandlers = Pick<
  WebViewProps,
  | 'onError'
  | 'onLoad'
  | 'onLoadEnd'
  | 'onLoadProgress'
  | 'onLoadStart'
  | 'onMessage'
  | 'onNavigationStateChange'
  | 'onShouldStartLoadWithRequest'
>;

export type DOMBackendProps = Pick<
  WebViewProps,
  | 'geolocationEnabled'
  | 'injectedJavaScript'
  | 'injectedJavaScriptBeforeContentLoaded'
  | 'javaScriptEnabled'
  | 'mediaPlaybackRequiresUserAction'
  | 'onHttpError'
  | 'onLayout'
  | 'renderError'
  | 'renderLoading'
  | 'source'
  | 'style'
  | 'userAgent'
  | 'originWhitelist'
> & {
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
  | 'goBack'
  | 'goForward'
  | 'injectJavaScript'
  | 'reload'
  | 'requestFocus'
  | 'stopLoading'
> & {
  getDocument(): D | null;
  getWindow(): W | null;
};

export interface ComponentInstanceWithRef<H, P> extends Component<P, any>, H {}

export interface ComponentClassWithHandle<H, P> extends ComponentClass<P> {
  new (props: P, context?: any): ComponentInstanceWithRef<H, P>;
}

export interface FunctionComponentWithRef<H, P>
  extends React.ForwardRefExoticComponent<P & React.RefAttributes<H>> {}

export type ComponentTypeWithRef<H, P> =
  | ComponentClassWithHandle<H, P>
  | FunctionComponentWithRef<H, P>;

export interface DOMBackendComponentInstance
  extends Component<DOMBackendProps, any>,
    DOMBackendHandle {}

export interface DOMBackendComponentClass
  extends ComponentClassWithHandle<DOMBackendHandle, DOMBackendProps> {}

export interface DOMBackendFunctionComponent
  extends FunctionComponentWithRef<DOMBackendHandle, DOMBackendProps> {}

export type DOMBackendComponent =
  | DOMBackendComponentClass
  | DOMBackendFunctionComponent;
