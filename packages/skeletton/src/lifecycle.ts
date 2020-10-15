import {
  OnShouldStartLoadWithRequest,
  ShouldStartLoadRequest,
  WebViewError,
  WebViewHttpErrorEvent,
  WebViewMessageEvent,
  WebViewNativeEvent,
  WebViewNativeProgressEvent,
  WebViewNavigation
} from 'react-native-webview/lib/WebViewTypes';
import { NativeSyntheticEvent } from 'react-native';
import { DOMBackendHandlers } from '@formidable-webview/ersatz-core';

type EventExtended<E extends WebViewNativeEvent> = Omit<
  E,
  keyof WebViewNativeEvent
>;

function createNavigationEvent<E extends WebViewNativeEvent>({
  ...other
}: EventExtended<E> & Partial<WebViewNativeEvent>) {
  return {
    canGoBack: false,
    canGoForward: false,
    loading: false,
    lockIdentifier: 1,
    title: '',
    url: '',
    ...other
  } as E;
}

function createNativeEvent<E extends WebViewNativeEvent>({
  ...other
}: EventExtended<E> & Partial<WebViewNativeEvent>): NativeSyntheticEvent<E> {
  return {
    nativeEvent: createNavigationEvent(other)
  } as NativeSyntheticEvent<E>;
}

export interface EventBase {
  url: string;
  title: string;
}

export const eventFactory = {
  createLoadStartEvent(eventBase: EventBase) {
    return createNativeEvent<WebViewNavigation>({
      ...eventBase,
      loading: true,
      navigationType: 'other'
    });
  },
  createLoadEndEvent(eventBase: EventBase) {
    return createNativeEvent<WebViewNavigation>({
      ...eventBase,
      navigationType: 'other'
    });
  },
  createLoadProgressEvent(eventBase: EventBase, progress = 1) {
    return createNativeEvent<WebViewNativeProgressEvent>({
      ...eventBase,
      progress
    });
  },
  createErrorEvent(eventBase: EventBase, description: string, code = 1) {
    return createNativeEvent<WebViewError>({
      ...eventBase,
      description,
      code
    });
  },
  createHttpErrorEvent(
    description: string,
    statusCode: number,
    url: string
  ): WebViewHttpErrorEvent {
    return createNativeEvent({
      description,
      statusCode,
      url
    });
  },
  createMessageEvent(eventBase: EventBase, data: string): WebViewMessageEvent {
    return createNativeEvent({ ...eventBase, data });
  },
  createShouldStartLoadEvent(eventBase: EventBase) {
    return createNativeEvent<WebViewNavigation>({
      ...eventBase,
      loading: false,
      navigationType: 'other'
    });
  }
};

export const webViewLifecycle = {
  handleLoadStart(
    { onLoadStart, onNavigationStateChange }: DOMBackendHandlers,
    eventBase: EventBase
  ) {
    const startEvent = eventFactory.createLoadStartEvent(eventBase);
    typeof onLoadStart === 'function' && onLoadStart(startEvent);
    typeof onNavigationStateChange === 'function' &&
      onNavigationStateChange(startEvent.nativeEvent);
  },
  handleLoadEnd(
    {
      onLoad,
      onLoadProgress,
      onLoadEnd,
      onNavigationStateChange
    }: DOMBackendHandlers,
    eventBase: EventBase
  ) {
    const loadEvent = eventFactory.createLoadEndEvent(eventBase);
    const loadProgress = eventFactory.createLoadProgressEvent(eventBase);
    typeof onLoadProgress === 'function' && onLoadProgress(loadProgress);
    typeof onLoad === 'function' && onLoad(loadEvent);
    typeof onLoadEnd === 'function' && onLoadEnd(loadEvent);
    typeof onNavigationStateChange === 'function' &&
      onNavigationStateChange(loadEvent.nativeEvent);
  },
  handleHttpError(
    onHttpError: ((e: WebViewHttpErrorEvent) => void) | undefined,
    description: string,
    statusCode: number,
    uri: string
  ) {
    typeof onHttpError === 'function' &&
      onHttpError(
        eventFactory.createHttpErrorEvent(description, statusCode, uri)
      );
  },
  handlePostMessage(
    { onError, onMessage }: DOMBackendHandlers,
    eventBase: EventBase,
    message: string
  ) {
    if (typeof message !== 'string') {
      typeof onError === 'function' &&
        onError(
          eventFactory.createErrorEvent(
            eventBase,
            'WebView: the argument of postMessage must be a string'
          )
        );
    }
    typeof onMessage === 'function' &&
      onMessage(eventFactory.createMessageEvent(eventBase, message));
  },
  shouldStartLoadEvent(
    onShouldStartLoadWithRequest: OnShouldStartLoadWithRequest,
    url: string
  ) {
    return onShouldStartLoadWithRequest(
      createNavigationEvent<ShouldStartLoadRequest>({
        url: url,
        title: url,
        isTopFrame: false,
        navigationType: 'other'
      })
    );
  }
};
