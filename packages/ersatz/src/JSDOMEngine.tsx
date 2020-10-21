import {
  useMemo,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react';
import { JSDOM } from 'jsdom';
import {
  AndroidWebViewProps,
  WebViewNavigationEvent
} from 'react-native-webview/lib/WebViewTypes';
import type {
  DOMBackendHandle,
  DOMBackendHandlers,
  DOMBackendProps,
  DOMBackendState
} from '@formidable-webview/ersatz-core';
import { webViewLifecycle } from '@formidable-webview/skeletton';
import { View } from 'react-native';
import React from 'react';

type InitDOMParams = {
  html: string;
  url?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  injectedJavaScript?: string;
  javaScriptEnabled?: boolean;
  userAgent?: string;
  loadCycleId: number;
  domHandlers: DOMBackendHandlers;
};

function initDOM({
  html,
  url,
  injectedJavaScriptBeforeContentLoaded,
  injectedJavaScript,
  domHandlers,
  javaScriptEnabled,
  userAgent
}: InitDOMParams): JSDOM {
  const eventBase = {
    get url(): string {
      return dom.window.location.href;
    },
    get title(): string {
      return dom.window.document.title;
    }
  };
  const postMessage = (message: string) => {
    webViewLifecycle.handlePostMessage(domHandlers, eventBase, message);
  };
  const dom = new JSDOM(html, {
    [url ? 'url' : '']: url,
    runScripts: javaScriptEnabled ? 'dangerously' : undefined,
    resources: 'usable',
    userAgent,
    beforeParse(window) {
      // To support legacy WebView
      window.postMessage = postMessage;
      window.ReactNativeWebView = {
        postMessage
      };
      injectedJavaScriptBeforeContentLoaded &&
        window.eval(injectedJavaScriptBeforeContentLoaded);
    }
  });
  dom.window.addEventListener('DOMContentLoaded', () => {
    javaScriptEnabled &&
      injectedJavaScript &&
      dom.window.eval(injectedJavaScript);
  });
  dom.window.addEventListener('load', () => {
    webViewLifecycle.handleLoadEnd(domHandlers, eventBase);
  });
  webViewLifecycle.handleLoadStart(domHandlers, eventBase);
  return dom;
}

type JSDOMBackendEngineProps = Omit<
  DOMBackendProps<Pick<AndroidWebViewProps, 'userAgent'>>,
  'source'
> & {
  html: string;
  url: string;
};

function printLog(method: string, message: string) {
  console.warn(`JSDOMBackend#${method}: ${message}`);
}

export const JSDOMDOMEngine = forwardRef<
  DOMBackendHandle,
  JSDOMBackendEngineProps
>(function DOMEngine(
  {
    html,
    url,
    injectedJavaScript,
    javaScriptEnabled,
    injectedJavaScriptBeforeContentLoaded,
    userAgent,
    domHandlers
  }: JSDOMBackendEngineProps,
  ref
) {
  const { onLoad: userOnLoad } = domHandlers;
  const [backendState, setBackendState] = useState<DOMBackendState>('loading');
  // This state variable permits imperative reloadings
  const [loadCycleId, setLoadCycleId] = useState(0);
  const onLoad = useCallback(
    (e: WebViewNavigationEvent) => {
      setBackendState('loaded');
      typeof userOnLoad === 'function' && userOnLoad(e);
    },
    [userOnLoad]
  );
  const dom = useMemo(() => {
    return initDOM({
      html,
      url,
      injectedJavaScriptBeforeContentLoaded,
      injectedJavaScript,
      javaScriptEnabled,
      userAgent,
      domHandlers: { ...domHandlers, onLoad },
      loadCycleId
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    html,
    url,
    userAgent,
    injectedJavaScriptBeforeContentLoaded,
    injectedJavaScript,
    javaScriptEnabled,
    loadCycleId,
    onLoad,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...Object.values(domHandlers)
  ]);
  useImperativeHandle(
    ref,
    () => ({
      dom,
      goBack() {
        printLog('goBack', 'not Implemented.');
      },
      goForward() {
        printLog('goForward', 'not Implemented.');
      },
      reload() {
        setLoadCycleId(loadCycleId + 1);
      },
      stopLoading() {
        printLog('stopLoading', 'not Implemented.');
      },
      requestFocus() {
        printLog('requestFocus', 'not Implemented.');
      },
      injectJavaScript(script: string) {
        dom.window.eval(script);
      },
      getDocument() {
        return dom.window?.document as any;
      },
      getWindow() {
        return dom.window as any;
      }
    }),
    [dom, loadCycleId]
  );
  const children =
    backendState === 'loaded' ? (
      <View testID={`backend-loading-${loadCycleId}`} />
    ) : null;
  return (
    <View testID={`backend-${backendState}-${loadCycleId}`}>{children}</View>
  );
});
