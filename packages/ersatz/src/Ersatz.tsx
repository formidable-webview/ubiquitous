import React from 'react';
import { WebViewProps } from 'react-native-webview';
import { PureComponent, createRef } from 'react';
import { ScrollView } from 'react-native';
import {
  DOMBackendHandle,
  WindowShape,
  DocumentShape
} from '@formidable-webview/ersatz-core';
import assert from 'assert';
import { JSDOMBackend } from './JSDOMBackend';
import { SourceLoader, NormalSource } from './SourceLoader';

export class Ersatz<
    D extends DocumentShape = DocumentShape,
    W extends WindowShape = WindowShape
  >
  extends PureComponent<WebViewProps>
  implements DOMBackendHandle {
  static defaultProps: Partial<WebViewProps> = {
    javaScriptEnabled: true
  };
  private backend = createRef<DOMBackendHandle<D, W>>();
  private scrollview = createRef<ScrollView>();

  private formatLog(method: string, text: string): string {
    return `${Ersatz.name}#${method}: ${text}`;
  }

  private renderBackend = ({ html, url }: NormalSource) => {
    const {
      javaScriptEnabled,
      injectedJavaScript,
      injectedJavaScriptBeforeContentLoaded,
      userAgent,
      onMessage,
      onLoadStart,
      onLoad,
      onLoadEnd,
      onLoadProgress,
      onNavigationStateChange,
      onError
    } = this.props;
    return (
      <JSDOMBackend
        javaScriptEnabled={javaScriptEnabled}
        injectedJavaScript={injectedJavaScript}
        injectedJavaScriptBeforeContentLoaded={
          injectedJavaScriptBeforeContentLoaded
        }
        html={html}
        url={url}
        userAgent={userAgent}
        ref={this.backend}
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
    );
  };

  goBack() {
    console.warn(this.formatLog('goBack', 'not Implemented.'));
  }

  goForward() {
    console.warn(this.formatLog('goForward', 'not Implemented.'));
  }

  reload() {
    this.backend.current?.reload();
  }

  stopLoading() {
    console.warn(this.formatLog('stopLoading', 'not Implemented.'));
  }

  static extraNativeComponentConfig() {}

  injectJavaScript(script: string) {
    this.backend.current?.injectJavaScript(script);
  }

  requestFocus() {
    console.warn(this.formatLog('requestFocus', 'not Implemented.'));
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
      source,
      onHttpError,
      containerStyle,
      renderLoading,
      style,
      decelerationRate,
      contentInset,
      contentInsetAdjustmentBehavior,
      overScrollMode,
      scrollEnabled,
      directionalLockEnabled
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
        <SourceLoader
          children={this.renderBackend}
          renderLoading={renderLoading}
          onHttpError={onHttpError}
          source={source}
          cancelled={false}
        />
      </ScrollView>
    );
  }
}
