import {
  useMemo,
  useCallback,
  useState,
  useImperativeHandle,
  forwardRef
} from 'react';
import { JSDOM } from 'jsdom';
import {
  WebViewNavigationEvent,
  WebViewNativeProgressEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes';
import type {
  DOMBackendHandle,
  DOMBackendHandlers,
  DOMBackendProps,
  DOMBackendState
} from '@formidable-webview/ersatz-core';
import { createNativeEvent } from './events';
import { View } from 'react-native';
import React from 'react';

type InitDOMParams = DOMBackendHandlers & {
  html: string;
  url?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  injectedJavaScript?: string;
  javaScriptEnabled?: boolean;
  userAgent?: string;
  loadCycleId: number;
};

function initDOM({
  html,
  url,
  injectedJavaScriptBeforeContentLoaded,
  injectedJavaScript,
  onMessage,
  onLoad,
  onLoadStart,
  onLoadProgress,
  onLoadEnd,
  onNavigationStateChange,
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
    if (typeof message !== 'string') {
      throw new Error('WebView: the argument of postMessage must be a string');
    }
    typeof onMessage === 'function' &&
      onMessage(createNativeEvent({ ...eventBase, data: message }));
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
    const loadEvent = createNativeEvent<WebViewNavigation>({
      ...eventBase,
      navigationType: 'other'
    });
    const loadProgress = createNativeEvent<WebViewNativeProgressEvent>({
      ...eventBase,
      progress: 1
    });
    typeof onLoadProgress === 'function' && onLoadProgress(loadProgress);
    typeof onLoad === 'function' && onLoad(loadEvent);
    typeof onLoadEnd === 'function' && onLoadEnd(loadEvent);
    typeof onNavigationStateChange === 'function' &&
      onNavigationStateChange(loadEvent.nativeEvent);
  });
  const startEvent = createNativeEvent<WebViewNavigation>({
    ...eventBase,
    loading: true,
    navigationType: 'other'
  });
  typeof onLoadStart === 'function' && onLoadStart(startEvent);
  typeof onNavigationStateChange === 'function' &&
    onNavigationStateChange(startEvent.nativeEvent);
  return dom;
}

export const JSDOMBackend = forwardRef<DOMBackendHandle, DOMBackendProps>(
  function JSDOMBackend(
    {
      html,
      url,
      injectedJavaScript,
      javaScriptEnabled,
      injectedJavaScriptBeforeContentLoaded,
      userAgent,
      domHandlers: {
        onMessage,
        onLoadStart,
        onLoad: userOnLoad,
        onLoadEnd,
        onLoadProgress,
        onNavigationStateChange
      }
    }: DOMBackendProps,
    ref
  ) {
    const [backendState, setBackendState] = useState<DOMBackendState>(
      'loading'
    );
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
        onMessage,
        onLoadStart,
        onLoadProgress,
        onLoad,
        onLoadEnd,
        onNavigationStateChange,
        loadCycleId
      });
    }, [
      html,
      url,
      userAgent,
      injectedJavaScriptBeforeContentLoaded,
      injectedJavaScript,
      javaScriptEnabled,
      onMessage,
      onLoadStart,
      onLoadProgress,
      onLoad,
      onLoadEnd,
      onNavigationStateChange,
      loadCycleId
    ]);
    useImperativeHandle(
      ref,
      () => ({
        dom,
        goBack() {
          console.warn('goBack not implemented');
        },
        goForward() {
          console.warn('goForward not implemented');
        },
        reload() {
          setLoadCycleId(loadCycleId + 1);
        },
        stopLoading() {
          console.warn('stopLoading not implemented');
        },
        injectJavaScript(script: string) {
          backendState === 'loaded' && dom.window.eval(script);
        },
        getDocument() {
          return dom.window?.document as any;
        },
        getWindow() {
          return dom.window as any;
        }
      }),
      [dom, loadCycleId, backendState]
    );
    const children =
      backendState === 'loaded' ? (
        <View testID={`backend-loading-${loadCycleId}`} />
      ) : null;
    return (
      <View testID={`backend-${backendState}-${loadCycleId}`}>{children}</View>
    );
  }
);
