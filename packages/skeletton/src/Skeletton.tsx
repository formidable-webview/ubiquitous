import React from 'react';
import { WebViewProps } from 'react-native-webview';
import { PureComponent, createRef } from 'react';
import { ScrollView } from 'react-native';
import {
  DOMBackendHandle,
  WindowShape,
  DocumentShape,
  DOMBackendComponent
} from '@formidable-webview/ersatz-core';
import assert from 'assert';

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
    return (
      <ScrollView
        ref={this.scrollview}
        contentInset={contentInset}
        contentInsetAdjustmentBehavior={contentInsetAdjustmentBehavior}
        decelerationRate={decelerationRate}
        contentContainerStyle={containerStyle}
        overScrollMode={overScrollMode as any}
        scrollEnabled={scrollEnabled}
        directionalLockEnabled={directionalLockEnabled}
        style={style}>
        <DOMBackend
          javaScriptEnabled={javaScriptEnabled}
          injectedJavaScript={injectedJavaScript}
          injectedJavaScriptBeforeContentLoaded={
            injectedJavaScriptBeforeContentLoaded
          }
          source={source}
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
