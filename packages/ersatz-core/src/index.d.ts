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
  | 'source'
> & {
  domHandlers: DOMBackendHandlers;
  renderLoading?: () => ReactElement;
  onHttpError?: (event: WebViewHttpErrorEvent) => void;
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
