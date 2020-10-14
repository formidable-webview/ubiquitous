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
import { defaultRenderLoading } from './shared';
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
  return React.useMemo<DOMBackendHandle>(
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

function injectBaseElement(document: Document, baseUrl: string) {
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
  syncState: 'init' | 'loading' | 'loaded';
}

interface Navigator {
  reset(): void;
  reload(): void;
  navigate(next: WebViewSource): void;
  goBack(): void;
  goForward(): void;
}

function useNavigation(source: WebViewSource | undefined) {
  const [{ history, current, instanceId, syncState }, setState] = useState<
    Navigation
  >({
    current: 0,
    history: [source || { html: '' }],
    instanceId: 0,
    syncState: 'init'
  });
  const uri = (source as WebViewSourceUri)?.uri;
  const html = (source as WebViewSourceHtml)?.html;
  const baseUrl = (source as WebViewSourceHtml)?.baseUrl;
  const selectedSource = history[current];
  const histUri = (selectedSource as WebViewSourceUri)?.uri;
  const histBaseUrl = (selectedSource as WebViewSourceHtml)?.baseUrl;
  const histHtml = (selectedSource as WebViewSourceHtml)?.html;
  const setSyncState = useCallback(
    (sstate: Navigation['syncState']) =>
      setState((st) => {
        const nextAllowedState =
          (st.syncState === 'init' && sstate === 'loading') ||
          (st.syncState === 'loading' && sstate === 'loaded') ||
          (st.syncState === 'loaded' && sstate === 'init')
            ? sstate
            : st.syncState;
        return { ...st, syncState: nextAllowedState };
      }),
    []
  );
  const navigator = useMemo<Navigator>(
    () => ({
      reset() {
        console.info('RESETTING NAV');
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
        setState((st) => ({
          ...st,
          current: st.current - 1,
          syncState: 'init'
        }));
      },
      goForward() {
        setState((st) => ({
          ...st,
          current: st.current + 1,
          syncState: 'init'
        }));
      }
    }),
    [uri, html, baseUrl]
  );
  // useEffect(() => {
  //   navigator.reset();
  // }, [navigator]);
  return useMemo(
    () => ({
      instanceId,
      uri: histUri,
      baseUrl: histBaseUrl,
      html: histHtml,
      navigator,
      syncState,
      setSyncState,
      canGoBack() {
        return current > 0;
      },
      canGoForwards() {
        return current < history.length - 1;
      }
    }),
    [
      syncState,
      setSyncState,
      instanceId,
      current,
      histBaseUrl,
      histHtml,
      histUri,
      history,
      navigator
    ]
  );
}

export const WebBackend: DOMBackendFunctionComponent = forwardRef(
  (
    {
      renderLoading,
      onLayout,
      domHandlers,
      // onHttpError,
      javaScriptEnabled,
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
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
      navigator,
      uri,
      html,
      baseUrl,
      instanceId,
      syncState,
      setSyncState
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
      } allow-popups allow-forms`
    };

    useEffect(
      function initEffect() {
        setSyncState('loading');
        webViewLifecycle.handleLoadStart(domHandlers, eventBase);
        const ifwindow = backendHandle.getWindow() as Window & {
          ReactNativeWebView: any;
        };
        if (ifwindow) {
          ifwindow.ReactNativeWebView = {
            postMessage(message: string) {
              ifwindow.parent.postMessage({ message, frameId }, ownerOrigin);
            }
          };
          if (baseUrl) {
            injectBaseElement(ifwindow.document, baseUrl);
          }
          ifwindow.addEventListener('beforeunload', () => {
            navigator.reset();
          });
        }
        if (injectedJavaScriptBeforeContentLoaded) {
          backendHandle.injectJavaScript(injectedJavaScriptBeforeContentLoaded);
        }
      },
      [
        navigator,
        setSyncState,
        backendHandle,
        domHandlers,
        eventBase,
        frameId,
        ownerOrigin,
        injectedJavaScriptBeforeContentLoaded,
        baseUrl,
        instanceId
      ]
    );
    useEffect(() => {
      function handleLoadEnd() {
        injectedJavaScript &&
          backendHandle.injectJavaScript(injectedJavaScript);
        webViewLifecycle.handleLoadEnd(domHandlers, eventBase);
        setSyncState('loaded');
      }
      const iframe = iframeRef.current;
      iframe?.addEventListener('load', handleLoadEnd);
      return () => {
        iframe?.removeEventListener('load', handleLoadEnd);
      };
    }, [
      setSyncState,
      injectedJavaScript,
      backendHandle,
      eventBase,
      frameId,
      domHandlers,
      ownerOrigin,
      instanceId
    ]);
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
        {syncState === 'loading' ? renderLoading!() : null}
      </View>
    );
  }
);

WebBackend.defaultProps = {
  renderLoading: defaultRenderLoading
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
    flex: 1
  }
});
