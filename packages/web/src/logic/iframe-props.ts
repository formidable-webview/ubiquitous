import { useMemo } from 'react';
import { WebBackendState } from '../types';
import {
  compileWebPoliciesToAllowAttr,
  compileWebPoliciesToSandboxAttr,
  WebPoliciesMap
} from '../web-features';

type IframeProps = JSX.IntrinsicElements['iframe'] & {
  allowpaymentrequest?: 'true';
  csp?: string;
};

export function useIframeProps({
  csp,
  referrerPolicy,
  allowsFullscreen,
  allowsPayment,
  webPolicies,
  geolocationEnabled,
  html,
  iframeRef,
  instanceId,
  javaScriptEnabled,
  lazyLoadingEnabled,
  mediaPlaybackRequiresUserAction,
  onLoad,
  allowsPreserveOrigin,
  seamlessEnabled,
  style = undefined,
  sandboxEnabled,
  uri,
  width
}: {
  width?: string | number;
  onLoad: () => void;
} & WebBackendState) {
  const permissions = useMemo(
    () =>
      Object.assign(
        {},
        defaultWebPolicies,
        {
          geolocation: !!geolocationEnabled,
          autoplay: !mediaPlaybackRequiresUserAction,
          fullscreen: allowsFullscreen,
          payment: allowsPayment,
          scripts: javaScriptEnabled
        },
        webPolicies || {}
      ),
    [
      webPolicies,
      allowsFullscreen,
      allowsPayment,
      geolocationEnabled,
      javaScriptEnabled,
      mediaPlaybackRequiresUserAction
    ]
  );
  const allow = useMemo(() => compileWebPoliciesToAllowAttr(permissions), [
    permissions
  ]);
  const sandbox = useMemo(() => compileWebPoliciesToSandboxAttr(permissions), [
    permissions
  ]);
  return useMemo(() => {
    const iframeProps: IframeProps = {
      width,
      allow,
      onLoad,
      style: style as any,
      key: instanceId,
      height: '100%',
      ref: iframeRef,
      seamless: seamlessEnabled,
      src: uri || 'about:blank',
      srcDoc: html,
      allowFullScreen: allowsFullscreen
    };
    if (csp) {
      iframeProps.csp = csp;
    }
    if (referrerPolicy) {
      iframeProps.referrerPolicy = referrerPolicy;
    }
    if (allowsPayment) {
      iframeProps.allowpaymentrequest = 'true';
    }
    if (lazyLoadingEnabled) {
      iframeProps.loading = 'lazy';
    }
    if (sandboxEnabled) {
      iframeProps.sandbox = `${
        allowsPreserveOrigin ? 'allow-same-origin' : ''
      } ${sandbox}`;
    }
    return iframeProps;
  }, [
    allow,
    csp,
    allowsFullscreen,
    html,
    iframeRef,
    instanceId,
    lazyLoadingEnabled,
    onLoad,
    allowsPayment,
    allowsPreserveOrigin,
    referrerPolicy,
    sandbox,
    sandboxEnabled,
    seamlessEnabled,
    style,
    uri,
    width
  ]);
}

export const defaultWebPolicies: WebPoliciesMap = {
  fullscreen: true,
  payment: true,
  documentDomain: true,
  forms: false,
  modals: false,
  orientationLock: false,
  plugins: false,
  pointerLock: false,
  popups: false,
  presentation: false,
  topNavigation: false,
  downloadsWithoutUserActivation: false
};
