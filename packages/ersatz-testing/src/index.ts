import type { Component } from 'react';
import type { RenderAPI, WaitForOptions } from '@testing-library/react-native';
import type {
  DOMBackendState,
  DOMBackendHandle,
  WindowShape,
  DocumentShape
} from '@formidable-webview/ersatz-core';

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
 * Create testing utilities to use with formidable-webview/ersatz and
 * testing-library/react-native.
 *
 * @param Ersatz - The Ersatz Component class from formidable-webview/ersatz.
 * @typeparam E - The type of Ersatz.
 * @typeparam D - The type of the DOM Document object.
 * @typeparam W - The type of the DOM Window object.
 */
export default function makeErsatzTesting<
  E extends {
    new (...args: any[]): Component<any> & DOMBackendHandle<D, W>;
  },
  D extends DocumentShape = DocumentShape,
  W extends WindowShape = WindowShape
>(Ersatz: E) {
  async function waitForErsatz(
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
    const { instance: webView } = UNSAFE_getByType(Ersatz);
    expect(webView).toBeTruthy();
    return webView;
  }
  async function waitForWindow(
    renderAPI: RenderAPI,
    options?: WaitForErsatzOptions
  ): Promise<W> {
    const webView = await waitForErsatz(renderAPI, options);
    const window = webView.getWindow();
    expect(window).toBeTruthy();
    return window as W;
  }
  async function waitForDocument(
    renderAPI: RenderAPI,
    options?: WaitForErsatzOptions
  ): Promise<D> {
    const webView = await waitForErsatz(renderAPI, options);
    const document = webView.getDocument();
    expect(document).toBeTruthy();
    return document as D;
  }
  return {
    /**
     * Asynchronously wait for the Ersatz instance to have loaded the DOM.
     *
     * @param renderAPI - See {@link RenderAPI}.
     * @param options - See {@link WaitForOptions}.
     * @return - An instance of generic type `E`, the Ersatz class.
     */
    waitForErsatz,
    /**
     * Asynchronously wait for Window DOM object to be loaded.
     *
     * @param renderAPI - See {@link RenderAPI}.
     * @param options - See {@link WaitForOptions}.
     * @return - An instance of generic type `W`, the DOM Window object.
     */
    waitForWindow,
    /**
     * Asynchronously wait for Document DOM object to be loaded.
     *
     * @param renderAPI - See {@link RenderAPI}.
     * @param options - See {@link WaitForOptions}.
     * @return - An instance of generic type `D`, the DOM Document object.
     */
    waitForDocument
  };
}
