/// <reference lib="dom" />
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
  RefObject,
  useState,
  useMemo,
  useCallback
} from 'react';
import {
  StyleProp,
  StyleSheet,
  View,
  ViewProps,
  ViewStyle
} from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { webViewLifecycle } from '@formidable-webview/skeletton';
import type {
  DOMBackendFunctionComponent,
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';
import {
  createOnShouldStartLoadWithRequest,
  defaultRenderError,
  defaultRenderLoading
} from './shared';
import {
  WebViewSourceHtml,
  WebViewSourceUri,
  WebViewSource
} from 'react-native-webview/lib/WebViewTypes';

let globalFrameId = 0;

function normalizeDimensions(style: StyleProp<ViewStyle>) {
  const { width, height } = StyleSheet.flatten([
    { width: 0, height: 0 },
    style
  ]);
  return {
    width,
    height: width ? height : 0,
    wrapperHeight: `max(100%, ${
      typeof height === 'number' ? `${height}px` : height
    })`
  };
}

function printLog(method: string, message: string) {
  console.warn(`WebBackend#${method}: ${message}`);
}

function printLimitedContextMsg(method: string) {
  printLog(
    method,
    'This iframe renders a cross origin resource, and thus the execution context is limited. JavaScript injection is not available in such context.'
  );
}

function useBackendHandle(
  iframeRef: RefObject<HTMLIFrameElement>,
  navigator: Navigator
) {
  return React.useMemo<DOMBackendHandle<Document, Window>>(
    () => ({
      getDocument() {
        return iframeRef.current?.contentDocument as Document;
      },
      getWindow() {
        return iframeRef.current?.contentWindow as Window;
      },
      injectJavaScript(javaScript: string) {
        const document = this.getDocument();
        if (document) {
          if (javaScript) {
            const script = document.createElement('script');
            script.innerText = javaScript;
            document.body.appendChild(script);
          }
        } else {
          printLimitedContextMsg('injectJavaScript');
        }
      },
      reload() {
        navigator.reload();
      },
      requestFocus() {
        iframeRef.current?.focus();
      },
      goBack() {
        navigator.goBack();
      },
      goForward() {
        navigator.goForward();
      },
      stopLoading() {
        printLog('stopLoading', 'not Implemented.');
      }
    }),
    [iframeRef, navigator]
  );
}

function injectBaseElement(document: Document | null, baseUrl: string) {
  if (!document) {
    return;
  }
  const head =
    document.getElementsByTagName('head')[0] ||
    (() => {
      const hd = document.createElement('head');
      document.documentElement.appendChild(hd);
      return hd;
    })();
  const base =
    head.getElementsByTagName('base')[0] ||
    (() => {
      const bs = document.createElement('base');
      head.appendChild(bs);
      return bs;
    })();
  base.href = baseUrl;
}

interface Navigation {
  current: number;
  history: Array<WebViewSource>;
  instanceId: number;
  syncState: 'init' | 'loading' | 'loaded' | 'error';
}

interface Navigator {
  reset(): void;
  reload(): void;
  navigate(next: WebViewSource): void;
  goBack(): void;
  goForward(): void;
}

function canGoBack(state: Navigation) {
  return state.current > 0;
}

function canGoForward(state: Navigation) {
  return state.current < state.history.length - 1;
}

function useNavigation(source: WebViewSource | undefined) {
  const [navState, setState] = useState<Navigation>({
    current: 0,
    history: [source || { html: '' }],
    instanceId: 0,
    syncState: 'init'
  });
  const uri = (source as WebViewSourceUri)?.uri;
  const html = (source as WebViewSourceHtml)?.html;
  const baseUrl = (source as WebViewSourceHtml)?.baseUrl;
  const selectedSource = navState.history[navState.current];
  const histUri = (selectedSource as WebViewSourceUri)?.uri;
  const histBaseUrl = (selectedSource as WebViewSourceHtml)?.baseUrl;
  const histHtml = (selectedSource as WebViewSourceHtml)?.html;
  const setSyncState = useCallback(
    (nxstate: Navigation['syncState']) =>
      setState((st) => {
        const nextAllowedState =
          (st.syncState === 'init' && nxstate === 'loading') ||
          (st.syncState === 'loading' && nxstate === 'loaded') ||
          (st.syncState === 'loading' && nxstate === 'error') ||
          (st.syncState === 'loaded' && nxstate === 'init') ||
          (st.syncState === 'loaded' && nxstate === 'error') || // For chrome
          (st.syncState === 'error' && nxstate === 'init')
            ? nxstate
            : st.syncState;

        return nextAllowedState !== st.syncState
          ? { ...st, syncState: nextAllowedState }
          : st;
      }),
    []
  );
  const flagHasError = useCallback(() => setSyncState('error'), [setSyncState]);
  const navigator = useMemo<Navigator>(
    () => ({
      reset() {
        setState((st) => ({
          ...st,
          instanceId: st.instanceId + 1,
          current: 0,
          history: [{ uri, html, baseUrl }],
          syncState: 'init'
        }));
      },
      reload() {
        setState((st) => ({
          ...st,
          instanceId: st.instanceId + 1,
          syncState: 'init'
        }));
      },
      navigate(next: WebViewSource) {
        setState((st) => ({
          ...st,
          current: st.current + 1,
          history: [...st.history, next],
          syncState: 'init'
        }));
      },
      goBack() {
        setState((st) => {
          if (canGoBack(st)) {
            return {
              ...st,
              current: st.current - 1,
              syncState: 'init'
            };
          }
          return st;
        });
      },
      goForward() {
        setState((st) => {
          if (canGoForward(st)) {
            return {
              ...st,
              current: st.current + 1,
              syncState: 'init'
            };
          }
          return st;
        });
      }
    }),
    [uri, html, baseUrl]
  );
  // useEffect(() => {
  //   navigator.reset();
  // }, [navigator]);
  return useMemo(
    () => ({
      instanceId: navState.instanceId,
      uri: histUri,
      baseUrl: histBaseUrl,
      html: histHtml,
      navigator,
      syncState: navState.syncState,
      setSyncState,
      flagHasError,
      canGoBack: canGoBack.bind(null, navState),
      canGoForward: canGoForward.bind(null, navState)
    }),
    [
      navState,
      setSyncState,
      flagHasError,
      histBaseUrl,
      histHtml,
      histUri,
      navigator
    ]
  );
}

export const WebBackend: DOMBackendFunctionComponent = forwardRef(
  (
    {
      renderLoading,
      renderError,
      onLayout,
      domHandlers,
      // onHttpError,
      javaScriptEnabled,
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
      originWhitelist,
      // userAgent,
      style,
      source
    }: DOMBackendProps & ViewProps,
    ref
  ) => {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const frameId = useRef(globalFrameId++).current;
    const { width, height, wrapperHeight } = normalizeDimensions(style);
    const {
      baseUrl,
      flagHasError,
      html,
      instanceId,
      navigator,
      setSyncState,
      syncState,
      uri
    } = useNavigation(source);
    const ownerOrigin = document.location.origin;
    const eventBase = React.useMemo(
      () => ({
        url: uri ?? 'about:blank',
        title: uri ?? 'about:blank'
      }),
      [uri]
    );
    const backendHandle = useBackendHandle(iframeRef, navigator);
    const handleOnLoadEnd = useCallback(
      function handleLoadEnd() {
        injectedJavaScript &&
          backendHandle.injectJavaScript(injectedJavaScript);
        webViewLifecycle.handleLoadEnd(domHandlers, eventBase);
        if (baseUrl) {
          injectBaseElement(backendHandle.getDocument(), baseUrl);
        }
        setSyncState('loaded');
      },
      [
        backendHandle,
        baseUrl,
        domHandlers,
        eventBase,
        injectedJavaScript,
        setSyncState
      ]
    );
    const iframeProps: JSX.IntrinsicElements['iframe'] & {
      allowpaymentrequest: string;
    } = {
      key: instanceId,
      width,
      height: '100%',
      ref: iframeRef,
      style: styles.iframe,
      src: uri,
      srcDoc: html,
      allow: 'fullscreen',
      allowFullScreen: true,
      allowpaymentrequest: 'true',
      sandbox: `allow-same-origin ${
        javaScriptEnabled ? 'allow-scripts' : ''
      } allow-popups allow-forms`,
      onLoad: handleOnLoadEnd
    };
    const onShouldStartLoadWithRequest = useMemo(() => {
      return createOnShouldStartLoadWithRequest(
        originWhitelist as string[],
        domHandlers.onShouldStartLoadWithRequest
      );
    }, [originWhitelist, domHandlers.onShouldStartLoadWithRequest]);

    useEffect(
      function initEffect() {
        setSyncState('loading');
        webViewLifecycle.handleLoadStart(domHandlers, eventBase);
        function handleBeforeUnload() {
          if (
            ifwindow?.document.activeElement &&
            ifwindow?.document.activeElement.hasAttribute('href')
          ) {
            // @ts-ignore
            const targetUrl = ifwindow.document.activeElement?.href as string;
            if (
              targetUrl &&
              !webViewLifecycle.shouldStartLoadEvent(
                onShouldStartLoadWithRequest,
                targetUrl
              )
            ) {
              navigator.reset();
            }
          }
        }
        const ifwindow = backendHandle.getWindow() as Window & {
          ReactNativeWebView: any;
        };
        if (ifwindow) {
          ifwindow.ReactNativeWebView = {
            postMessage(message: string) {
              ifwindow.parent.postMessage({ message, frameId }, ownerOrigin);
            }
          };
        }
        ifwindow?.addEventListener('beforeunload', handleBeforeUnload);
        if (injectedJavaScriptBeforeContentLoaded) {
          backendHandle.injectJavaScript(injectedJavaScriptBeforeContentLoaded);
        }
        return () => {
          try {
            ifwindow?.removeEventListener('beforeunload', handleBeforeUnload);
          } catch (e) {}
        };
      },
      [
        backendHandle,
        baseUrl,
        domHandlers,
        eventBase,
        frameId,
        injectedJavaScriptBeforeContentLoaded,
        instanceId,
        navigator,
        onShouldStartLoadWithRequest,
        ownerOrigin,
        setSyncState,
        flagHasError
      ]
    );
    useEffect(
      function mockError() {
        let isCancelled = false;
        if (renderError && uri) {
          const headers = new Headers({
            Accept: '*/*'
          });
          fetch(uri, {
            method: 'HEAD',
            headers: headers,
            mode: 'no-cors'
          }).catch(() => {
            if (!isCancelled) {
              flagHasError();
            }
          });
        }
        return () => {
          isCancelled = true;
        };
      },
      [renderError, flagHasError, uri]
    );
    useEffect(
      function messageEffect() {
        function handleMessage({ data, origin }: MessageEvent) {
          data &&
            data.frameId === frameId &&
            ownerOrigin === origin &&
            webViewLifecycle.handlePostMessage(
              domHandlers,
              {
                url: uri ?? 'about:srcdoc',
                title: uri ?? 'about:srcdoc'
              },
              data.message
            );
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
      },
      [domHandlers, frameId, ownerOrigin, uri]
    );
    useImperativeHandle(ref, () => backendHandle, [backendHandle]);
    const iframe = unstable_createElement('iframe', iframeProps);
    return (
      <View
        onLayout={onLayout}
        style={[
          { width, height: wrapperHeight, minHeight: height },
          styles.container
        ]}>
        {iframe}
        {syncState === 'error'
          ? renderError!(undefined, 0, 'The iframe failed to load.')
          : null}
        {syncState === 'loading' ? renderLoading!() : null}
      </View>
    );
  }
);

WebBackend.defaultProps = {
  renderLoading: defaultRenderLoading,
  renderError: defaultRenderError,
  originWhitelist: ['*']
};

const styles = StyleSheet.create({
  iframe: {
    flexGrow: 1,
    borderWidth: 0,
    flexBasis: 'auto'
  },
  container: {
    display: 'flex',
    flexBasis: 'auto',
    position: 'relative',
    flex: 1
  }
});
