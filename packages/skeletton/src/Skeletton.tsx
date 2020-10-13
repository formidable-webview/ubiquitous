import React from 'react';
import { WebViewProps } from 'react-native-webview';
import { PureComponent, createRef } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import {
  DOMBackendHandle,
  WindowShape,
  DocumentShape,
  DOMBackendComponent
} from '@formidable-webview/ersatz-core';
import assert from 'assert';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden'
  },
  loadingOrErrorView: {
    position: 'absolute',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: '100%',
    backgroundColor: 'white'
  },
  loadingProgressBar: {
    height: 20
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 2
  },
  errorTextTitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 10
  },
  webView: {
    flex: 0,
    height: '100%',
    width: 0,
    backgroundColor: '#ffffff'
  },
  webViewWrapper: {
    margin: 0,
    padding: 0,
    flex: 1
  }
});

export class Skeletton<
    D extends DocumentShape = DocumentShape,
    W extends WindowShape = WindowShape
  >
  extends PureComponent<WebViewProps & { DOMBackend: DOMBackendComponent }>
  implements DOMBackendHandle {
  static defaultProps: Partial<WebViewProps> = {
    javaScriptEnabled: true
  };
  private backend = createRef<DOMBackendHandle<D, W>>();
  private scrollview = createRef<ScrollView>();

  private formatLog(method: string, text: string): string {
    return `${Skeletton.name}#${method}: ${text}`;
  }

  goBack() {
    this.backend.current?.goBack();
  }

  goForward() {
    this.backend.current?.goForward();
  }

  reload() {
    this.backend.current?.reload();
  }

  stopLoading() {
    this.backend.current?.stopLoading();
  }

  static extraNativeComponentConfig() {}

  injectJavaScript(script: string) {
    this.backend.current?.injectJavaScript(script);
  }

  requestFocus() {
    this.backend.current?.requestFocus();
  }

  getWindow() {
    const backend = this.backend.current;
    assert(
      backend !== null,
      this.formatLog(
        'getWindow',
        'The DOM backend is not loaded. Make sure you call this method after it has loaded. ' +
          'You sould use @formidable-webview/ersatz-testing for that purpose.'
      )
    );
    return backend!.getWindow();
  }

  getDocument() {
    const backend = this.backend.current;
    assert(
      backend !== null,
      this.formatLog(
        'getDocument',
        'The DOM backend is not loaded. Make sure you call this method after it has loaded. ' +
          'You sould use @formidable-webview/ersatz-testing for that purpose.'
      )
    );
    return backend!.getDocument() as D;
  }

  render() {
    const {
      containerStyle,
      contentInset,
      contentInsetAdjustmentBehavior,
      decelerationRate,
      directionalLockEnabled,
      DOMBackend,
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
      javaScriptEnabled,
      onError,
      onHttpError,
      onLoad,
      onLoadEnd,
      onLoadProgress,
      onLoadStart,
      onMessage,
      onNavigationStateChange,
      overScrollMode,
      renderLoading,
      scrollEnabled,
      source,
      style,
      userAgent
    } = this.props;
    const webViewContainerStyle = [styles.container, containerStyle];
    const webViewStyle = [styles.webView, style];
    return (
      <ScrollView
        ref={this.scrollview}
        contentInset={contentInset}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
        decelerationRate={decelerationRate}
        contentContainerStyle={styles.webViewWrapper}
        overScrollMode={overScrollMode as any}
        scrollEnabled={scrollEnabled}
        directionalLockEnabled={directionalLockEnabled}
        style={webViewContainerStyle}>
        <DOMBackend
          javaScriptEnabled={javaScriptEnabled}
          injectedJavaScript={injectedJavaScript}
          injectedJavaScriptBeforeContentLoaded={
            injectedJavaScriptBeforeContentLoaded
          }
          source={source}
          style={webViewStyle}
          userAgent={userAgent}
          ref={this.backend}
          onHttpError={onHttpError}
          renderLoading={renderLoading}
          domHandlers={{
            onMessage,
            onLoadStart,
            onLoad,
            onLoadEnd,
            onLoadProgress,
            onNavigationStateChange,
            onError
          }}
        />
      </ScrollView>
    );
  }
}
