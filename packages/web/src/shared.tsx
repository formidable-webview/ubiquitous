import escapeStringRegexp from 'escape-string-regexp';
import React from 'react';
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

const passesWhitelist = (compiledWhitelist: readonly string[], url: string) => {
  const origin = extractOrigin(url);
  return compiledWhitelist.some((x) => new RegExp(x).test(origin));
};

const compileWhitelist = (
  originWhitelist: readonly string[]
): readonly string[] =>
  ['about:blank', ...(originWhitelist || [])].map(originWhitelistToRegex);

const createOnShouldStartLoadWithRequest = (
  originWhitelist: readonly string[],
  onShouldStartLoadWithRequest?: OnShouldStartLoadWithRequest
) => {
  return (event: ShouldStartLoadRequest) => {
    let shouldStart = true;
    const { url } = event;
    if (!passesWhitelist(compileWhitelist(originWhitelist), url)) {
      window.open(url, '_blank');
      shouldStart = false;
    } else if (onShouldStartLoadWithRequest) {
      shouldStart = onShouldStartLoadWithRequest(event);
    }

    return shouldStart;
  };
};

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
