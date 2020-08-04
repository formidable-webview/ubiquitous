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
import { createNativeEvent } from './events';
import { DOMHandlers, BackendState } from './types';
import { View } from 'react-native';
import React from 'react';

interface DOMBackendProps {
  html: string;
  url: string;
  injectedJavascript?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  javaScriptEnabled?: boolean;
  userAgent?: string;
  domHandlers: DOMHandlers;
}

interface InitDOMParams extends DOMHandlers {
  html: string;
  url?: string;
  injectedJavaScriptBeforeContentLoaded?: string;
  injectedJavascript?: string;
  javaScriptEnabled?: boolean;
  userAgent?: string;
  loadCycleId: number;
}

function initDOM({
  html,
  url,
  injectedJavaScriptBeforeContentLoaded,
  injectedJavascript,
  onMessage,
  onLoad,
  onLoadStart,
  onLoadProgress,
  onLoadEnd,
  onNavigationStateChange,
  javaScriptEnabled,
  userAgent
}: InitDOMParams): JSDOM {
  const postMessage = (message: string) => {
    if (typeof message !== 'string') {
      throw new Error('WebView: the argument of postMessage must be a string');
    }
    typeof onMessage === 'function' &&
      onMessage(createNativeEvent({ data: message }));
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
      injectedJavascript &&
      dom.window.eval(injectedJavascript);
  });
  dom.window.addEventListener('load', () => {
    const loadEvent = createNativeEvent<WebViewNavigation>({
      navigationType: 'other'
    });
    const loadProgress = createNativeEvent<WebViewNativeProgressEvent>({
      progress: 1
    });
    typeof onLoadProgress === 'function' && onLoadProgress(loadProgress);
    typeof onLoad === 'function' && onLoad(loadEvent);
    typeof onLoadEnd === 'function' && onLoadEnd(loadEvent);
    typeof onNavigationStateChange === 'function' &&
      onNavigationStateChange(loadEvent.nativeEvent);
  });
  const startEvent = createNativeEvent<WebViewNavigation>({
    loading: true,
    title: dom.window.document.title,
    navigationType: 'other',
    url: url || 'about:blank'
  });
  typeof onLoadStart === 'function' && onLoadStart(startEvent);
  typeof onNavigationStateChange === 'function' &&
    onNavigationStateChange(startEvent.nativeEvent);
  return dom;
}

export interface JSDOMBackendHandle {
  dom: JSDOM;
  reload(): void;
  stopLoading(): void;
  goBack(): void;
  goForward(): void;
}

const JSDOMBackend = forwardRef<JSDOMBackendHandle, DOMBackendProps>(
  function JSDOMBackend(
    {
      html,
      url,
      injectedJavascript,
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
    const [backendState, setBackendState] = useState<BackendState>('loading');
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
        injectedJavascript,
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
      injectedJavascript,
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
  }
);

export { JSDOMBackend };
