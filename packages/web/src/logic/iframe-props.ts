import { useMemo } from 'react';
import { WebBackendState } from '../types';
import {
  compileWebPermissionsPolicies,
  WebPermissionPoliciesMap
} from '../web-features';

type IframeProps = JSX.IntrinsicElements['iframe'] & {
  allowpaymentrequest?: 'true';
  csp?: string;
};

export function useIframeProps({
  csp,
  referrerPolicy,
  fullscreenEnabled,
  paymentEnabled,
  webPolicies,
  geolocationEnabled,
  html,
  iframeRef,
  instanceId,
  javaScriptEnabled,
  lazyLoadingEnabled,
  mediaPlaybackRequiresUserAction,
  onLoad,
  sandbox,
  style = undefined,
  sandboxEnabled,
  uri,
  width
}: {
  width?: string | number;
  onLoad: () => void;
} & WebBackendState) {
  const allow = useMemo(
    () =>
      compileWebPermissionsPolicies(
        defaultWebPolicies,
        {
          geolocation: !!geolocationEnabled,
          autoplay: !mediaPlaybackRequiresUserAction,
          fullscreen: fullscreenEnabled,
          payment: paymentEnabled
        },
        webPolicies || {}
      ),
    [
      webPolicies,
      fullscreenEnabled,
      paymentEnabled,
      geolocationEnabled,
      mediaPlaybackRequiresUserAction
    ]
  );
  return useMemo(() => {
    const iframeProps: IframeProps = {
      width,
      allow,
      onLoad,
      style: style as any,
      key: instanceId,
      height: '100%',
      ref: iframeRef,
      src: uri,
      srcDoc: html,
      allowFullScreen: fullscreenEnabled
    };
    if (csp) {
      iframeProps.csp = csp;
    }
    if (referrerPolicy) {
      iframeProps.referrerPolicy = referrerPolicy;
    }
    if (paymentEnabled) {
      iframeProps.allowpaymentrequest = 'true';
    }
    if (lazyLoadingEnabled) {
      iframeProps.loading = 'lazy';
    }
    if (sandboxEnabled) {
      iframeProps.sandbox = `${sandbox} ${
        javaScriptEnabled ? 'allow-scripts' : ''
      }`;
    }
    return iframeProps;
  }, [
    allow,
    csp,
    fullscreenEnabled,
    html,
    iframeRef,
    instanceId,
    javaScriptEnabled,
    lazyLoadingEnabled,
    onLoad,
    paymentEnabled,
    referrerPolicy,
    sandbox,
    sandboxEnabled,
    style,
    uri,
    width
  ]);
}

export const defaultWebPolicies: WebPermissionPoliciesMap = {
  fullscreen: true,
  payment: true,
  documentDomain: true
};
