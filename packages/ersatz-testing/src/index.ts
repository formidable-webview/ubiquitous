import type { Component } from 'react';
import type { RenderAPI, WaitForOptions } from '@testing-library/react-native';
import type {
  DOMBackendState,
  DOMBackendHandle,
  WindowShape,
  DocumentShape
} from '@formidable-webview/ersatz-core';
import Skeletton from '@formidable-webview/skeletton';

/**
 * An object to customize the waiting logic.
 */
export interface WaitForErsatzOptions extends WaitForOptions {
  /**
   * At which loading cycle should the instance be returned?
   *
   * @defaultValue 0
   */
  loadCycleId?: number;
  /**
   * At which loading state should the instance be returned?
   *
   * @defaultValue "loaded"
   */
  loadingState?: DOMBackendState;
  /**
   * Maximum time in milliseconds to wait for the DOM.
   *
   * @defaultValue 300
   */
  timeout?: number;
}

declare function expect(something: any): any;

/**
 * Asynchronously wait for the Ersatz instance to have loaded the DOM.
 *
 * @param renderAPI - See {@link RenderAPI}.
 * @param options - See {@link WaitForOptions}.
 * @return - An instance of generic type `E`, the Ersatz class.
 */
export async function waitForErsatz<
  D extends DocumentShape = DocumentShape,
  W extends WindowShape = WindowShape
>(
  renderAPI: RenderAPI,
  options: WaitForErsatzOptions = {}
): Promise<Component<any> & DOMBackendHandle<D, W>> {
  const { findByTestId, UNSAFE_getByType } = renderAPI;
  const {
    loadCycleId = 0,
    loadingState = 'loaded',
    timeout = 300,
    ...waitForOptions
  } = options;
  await findByTestId(`backend-${loadingState}-${loadCycleId}`, {
    timeout,
    ...waitForOptions
  });
  const { instance: skel } = UNSAFE_getByType(Skeletton);
  expect(skel).toBeTruthy();
  return skel;
}

/**
 * Asynchronously wait for Window DOM object to be loaded.
 *
 * @param renderAPI - See {@link RenderAPI}.
 * @param options - See {@link WaitForOptions}.
 * @return - An instance of generic type `W`, the DOM Window object.
 */
export async function waitForWindow<W extends WindowShape = WindowShape>(
  renderAPI: RenderAPI,
  options?: WaitForErsatzOptions
): Promise<W> {
  const webView = await waitForErsatz(renderAPI, options);
  const window = webView.getWindow();
  expect(window).toBeTruthy();
  return window as W;
}

/**
 * Asynchronously wait for Document DOM object to be loaded.
 *
 * @param renderAPI - See {@link RenderAPI}.
 * @param options - See {@link WaitForOptions}.
 * @return - An instance of generic type `D`, the DOM Document object.
 */
export async function waitForDocument<D extends DocumentShape = DocumentShape>(
  renderAPI: RenderAPI,
  options?: WaitForErsatzOptions
): Promise<D> {
  const webView = await waitForErsatz(renderAPI, options);
  const document = webView.getDocument();
  expect(document).toBeTruthy();
  return document as D;
}
