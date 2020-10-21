import type { RefAttributes, Component } from 'react';
import type { default as WebView } from 'react-native-webview';
import { WebViewSharedProps } from 'react-native-webview/lib/WebViewTypes';

export type DOMBackendHandlers = Pick<
  WebViewSharedProps,
  | 'onError'
  | 'onLoad'
  | 'onLoadEnd'
  | 'onLoadProgress'
  | 'onLoadStart'
  | 'onMessage'
  | 'onNavigationStateChange'
  | 'onShouldStartLoadWithRequest'
>;

export type DOMBackendProps<O = {}> = Omit<
  WebViewSharedProps,
  keyof DOMBackendHandlers
> & {
  domHandlers: DOMBackendHandlers;
} & O;

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

export interface DOMBackendComponentInstance<O = {}>
  extends Component<DOMBackendProps<O>, any>,
    DOMBackendHandle {}

export interface DOMBackendComponentClass<O = {}>
  extends ComponentClassWithHandle<DOMBackendHandle, DOMBackendProps<O>> {}

export interface DOMBackendFunctionComponent<O = {}>
  extends FunctionComponentWithRef<DOMBackendHandle, DOMBackendProps<O>> {}

export type DOMBackendComponent<O = {}> =
  | DOMBackendComponentClass<O>
  | DOMBackendFunctionComponent<O>;
