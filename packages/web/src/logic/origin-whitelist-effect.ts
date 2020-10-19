/* eslint-disable no-undef */
/// <reference lib="dom" />
import { DOMBackendHandle } from '@formidable-webview/ersatz-core';
import { useEffect } from 'react';
import { compileWhitelist, passesWhitelist } from '../shared';

export function useOriginWhitelistEffect({
  backendHandle,
  originWhitelist = [],
  instanceId
}: {
  backendHandle: DOMBackendHandle<Document, Window>;
  instanceId: number;
  originWhitelist?: string[];
}) {
  useEffect(
    function originWhitelistEffect() {
      const compiledWhitelist = compileWhitelist(originWhitelist);
      const doc = backendHandle.getDocument();
      function fixAnchor(anchor: HTMLAnchorElement) {
        if (!passesWhitelist(compiledWhitelist, anchor.href)) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }
      }
      const MO: typeof MutationObserver =
        window.MutationObserver || (window as any).WebKitMutationObserver;
      const mutationObserver = MO
        ? new MO(function (mutations) {
            for (const mut of mutations) {
              if (mut.type === 'childList') {
                mut.addedNodes.forEach((node) => {
                  if (node instanceof HTMLAnchorElement) {
                    fixAnchor(node);
                  }
                });
              }
            }
          })
        : null;
      function onDOMContentLoaded() {
        if (doc) {
          Array.prototype.forEach.call(
            doc.getElementsByTagName('a'),
            fixAnchor
          );
        }
      }
      if (doc) {
        mutationObserver?.observe(doc.body, {
          attributes: false,
          childList: true,
          subtree: true
        });
        onDOMContentLoaded();
      }
      return () => {
        mutationObserver?.disconnect();
      };
    },
    [originWhitelist, backendHandle, instanceId]
  );
}
