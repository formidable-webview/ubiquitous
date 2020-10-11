/// <reference lib="dom" />
import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle
} from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { webViewLifecycle } from '@formidable-webview/skeletton';
import type {
  DOMBackendFunctionComponent,
  DOMBackendHandle,
  DOMBackendProps
} from '@formidable-webview/ersatz-core';

export const WebBackend: DOMBackendFunctionComponent = forwardRef(
  (
    {
      // renderLoading,
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
    const { width, height } = StyleSheet.flatten(style);
    const ownerOrigin = document.location.href;
    const uri = (source as any)?.uri;
    const html = (source as any)?.html;
    const eventBase = React.useMemo(
      () => ({
        url: uri ?? 'about:blank',
        title: ''
      }),
      [uri]
    );
    const backendHandle = React.useMemo<DOMBackendHandle>(
      () => ({
        getDocument() {
          return iframeRef.current?.contentDocument as Document;
        },
        getWindow() {
          return iframeRef.current?.contentWindow as Window;
        },
        injectJavaScript(javaScript: string) {
          const document = this.getDocument();
          const script = document.createElement('script');
          script.innerText = javaScript;
          document.body.appendChild(script);
        },
        reload() {
          this.getWindow().location.reload();
        },
        requestFocus() {
          this.getWindow().focus();
        },
        goBack() {
          // noop
        },
        goForward() {
          // noop
        },
        stopLoading() {
          // noop
        }
      }),
      []
    );
    const iframeProps: JSX.IntrinsicElements['iframe'] & {
      allowPaymentRequest: boolean;
    } = {
      width,
      height,
      allow: 'fullscreen',
      ref: iframeRef,
      src: uri,
      style: styles.iframe,
      srcDoc: (source as any)?.html,
      allowFullScreen: true,
      allowPaymentRequest: true,
      sandbox: `allow-same-origin ${
        javaScriptEnabled ? 'allow-scripts' : ''
      } allow-popups allow-forms`
    };
    useEffect(() => {
      // load start
      console.info('ON LOAD START', eventBase);
      webViewLifecycle.handleLoadStart(domHandlers, eventBase);
      function handleContentLoadEnd() {
        injectedJavaScriptBeforeContentLoaded &&
          backendHandle.injectJavaScript(injectedJavaScriptBeforeContentLoaded);
      }
      function handleLoadEnd() {
        injectedJavaScript &&
          backendHandle.injectJavaScript(injectedJavaScript);
        console.info('ON LOAD END', eventBase);
        webViewLifecycle.handleLoadEnd(domHandlers, eventBase);
      }
      const ifwindow = backendHandle.getWindow() as Window & {
        ReactNativeWebView: any;
      };
      ifwindow.addEventListener('load', handleLoadEnd);
      ifwindow.addEventListener('DOMContentLoaded', handleContentLoadEnd);
      ifwindow.ReactNativeWebView = {
        postMessage(message: string) {
          ifwindow.top.postMessage(message, ownerOrigin);
        }
      };
      return () => {
        ifwindow.removeEventListener('load', handleLoadEnd);
        ifwindow.removeEventListener('DOMContentLoaded', handleContentLoadEnd);
      };
    }, [
      uri,
      html,
      injectedJavaScript,
      backendHandle,
      eventBase,
      injectedJavaScriptBeforeContentLoaded,
      domHandlers,
      ownerOrigin
    ]);
    useEffect(() => {
      function handleMessage({
        data,
        source: emitter,
        origin
      }: MessageEvent<string>) {
        console.info(
          'RECEIVED MESSAGE',
          data,
          'FROM ORIGIN',
          origin,
          'MATCHING OWNER?',
          origin === ownerOrigin
        );
        emitter === iframeRef.current &&
          ownerOrigin === origin &&
          webViewLifecycle.handlePostMessage(
            domHandlers,
            {
              url: uri ?? 'about:blank',
              title: ''
            },
            data
          );
      }
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [uri, html, ...Object.values(domHandlers)]);
    useImperativeHandle(ref, () => backendHandle, [backendHandle]);
    const iframe = unstable_createElement('iframe', iframeProps);
    return (
      <View style={style} onLayout={onLayout}>
        {iframe}
      </View>
    );
  }
);

const styles = StyleSheet.create({
  iframe: {
    width: '100%',
    height: 'auto'
  }
});
