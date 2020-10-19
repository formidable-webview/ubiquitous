/// <reference lib="dom" />
import escapeStringRegexp from 'escape-string-regexp';
import React, { RefObject } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import {
  ShouldStartLoadRequest,
  OnShouldStartLoadWithRequest
} from 'react-native-webview/lib/WebViewTypes';
import styles from './styles';

const defaultOriginWhitelist = ['http://*', 'https://*'];

const extractOrigin = (url: string): string => {
  const result = /^[A-Za-z][A-Za-z0-9+\-.]+:(\/\/)?[^/]*/.exec(url);
  return result === null ? '' : result[0];
};

const originWhitelistToRegex = (originWhitelist: string): string =>
  `^${escapeStringRegexp(originWhitelist).replace(/\\\*/g, '.*')}`;

export const passesWhitelist = (
  compiledWhitelist: readonly string[],
  url: string
) => {
  const origin = extractOrigin(url);
  return compiledWhitelist.some((x) => new RegExp(x).test(origin));
};

export const compileWhitelist = (
  originWhitelist: readonly string[]
): readonly string[] =>
  ['about:blank', 'about:srcdoc', ...(originWhitelist || [])].map(
    originWhitelistToRegex
  );

function browserWillOpenTargetInNewTab(activeElement: HTMLAnchorElement) {
  const relAttribute = activeElement.getAttribute('rel') || '';
  return (
    activeElement.hasAttribute('download') ||
    ((activeElement.getAttribute('target') === '_blank' ||
      relAttribute.indexOf('noopener') !== -1) &&
      !activeElement.hasAttribute('opener'))
  );
}

function isActiveElementAnchor(
  activeElement: null | Element
): activeElement is HTMLAnchorElement {
  return !!activeElement && activeElement.tagName.toLowerCase() === 'a';
}

const createOnShouldStartLoadWithRequest = (
  originWhitelist: readonly string[],
  iframeRef: RefObject<HTMLIFrameElement>,
  onShouldStartLoadWithRequest?: OnShouldStartLoadWithRequest
) => {
  return (event: ShouldStartLoadRequest) => {
    let shouldStart = true;
    let shouldOpenUrl = false;
    const { url } = event;
    const localDocument = iframeRef.current?.contentDocument;
    if (!passesWhitelist(compileWhitelist(originWhitelist), url)) {
      const activeElement = localDocument?.activeElement || null;
      if (isActiveElementAnchor(activeElement)) {
        shouldStart = browserWillOpenTargetInNewTab(activeElement);
        if (!shouldStart) {
          shouldOpenUrl = true;
        }
      } else {
        shouldStart = true;
      }
    } else if (onShouldStartLoadWithRequest) {
      shouldStart = onShouldStartLoadWithRequest(event);
    }

    return { shouldStart, shouldOpenUrl, url };
  };
};

export function getEventBase(uri?: string) {
  return {
    url: uri ?? 'about:srcdoc',
    title: uri ?? 'about:srcdoc'
  };
}

const defaultRenderLoading = () => (
  <View style={styles.loadingOrErrorView}>
    <ActivityIndicator />
  </View>
);
const defaultRenderError = (
  errorDomain: string | undefined,
  errorCode: number,
  errorDesc: string
) => (
  <View style={styles.loadingOrErrorView}>
    <Text style={styles.errorTextTitle}>Error loading page</Text>
    <Text style={styles.errorText}>{`Domain: ${errorDomain}`}</Text>
    <Text style={styles.errorText}>{`Error Code: ${errorCode}`}</Text>
    <Text style={styles.errorText}>{`Description: ${errorDesc}`}</Text>
  </View>
);

export {
  defaultOriginWhitelist,
  createOnShouldStartLoadWithRequest,
  defaultRenderLoading,
  defaultRenderError
};
