/* eslint-disable dot-notation */

import * as React from 'react';
import { WebViewErsatz } from '../WebViewErsatz';
import { render, RenderAPI, act } from '@testing-library/react-native';
import { DOMWindow, Document } from 'jsdom';
import nock from 'nock';
import { WebViewProps } from 'react-native-webview';

interface WaitForOptions {
  loadCycleId?: number;
  loadingState?: string;
}

async function waitForWebViewBackend(
  renderAPI: RenderAPI,
  options: WaitForOptions = {}
): Promise<WebViewErsatz> {
  const { findByTestId, UNSAFE_getByType } = renderAPI;
  const { loadCycleId = 0, loadingState = 'loaded' } = options;
  await findByTestId(`backend-${loadingState}-${loadCycleId}`, {
    timeout: 300
  });
  const { instance: webView } = UNSAFE_getByType(WebViewErsatz);
  expect(webView).toBeTruthy();
  return webView;
}

async function waitForWindow(
  rapi: RenderAPI,
  options?: WaitForOptions
): Promise<DOMWindow> {
  const webView = await waitForWebViewBackend(rapi, options);
  const window = webView.getWindow();
  expect(window).toBeTruthy();
  return window as DOMWindow;
}

async function waitForDocument(
  rapi: RenderAPI,
  options?: WaitForOptions
): Promise<Document> {
  const webView = await waitForWebViewBackend(rapi, options);
  const document = webView.getDocument();
  expect(document).toBeTruthy();
  return document as Document;
}

function nockFooBar() {
  const resource = 'https://foo.bar';
  nock('https://foo.bar')
    .get('/200')
    .reply(
      200,
      '<!DOCTYPE html><html><head><title>Hello world</title></head><body><header></header></body></html>',
      { 'Content-Type': 'text/html' }
    );
  return resource + '/200';
}

const startHandlers: (keyof WebViewProps)[] = [
  'onLoadStart',
  'onNavigationStateChange'
];
const endHandlers: (keyof WebViewProps)[] = [
  'onLoad',
  'onLoadEnd',
  'onNavigationStateChange',
  'onLoadProgress'
];
const sourceSnippets = [
  {
    name: 'inline HTML',
    getResource() {
      return { html: '<div></div>' };
    }
  },
  {
    name: 'remote HTML resource',
    getResource() {
      return {
        uri: nockFooBar()
      };
    }
  }
];

function testInjectedScriptProp<T extends keyof WebViewProps>(
  scriptProperty: T
) {
  describe('with injectedJavascript prop', () => {
    it(`should run ${scriptProperty} when javaScriptEnabled is unset`, async () => {
      const props: any = {
        [scriptProperty]: 'window.awesomeProp = 1;'
      };
      const window = await waitForWindow(
        render(<WebViewErsatz {...props} source={{ html: '<div></div>' }} />)
      );
      expect(window.awesomeProp).toEqual(1);
    });
    it(`should run ${scriptProperty} when javaScriptEnabled is set to true`, async () => {
      const props: any = {
        [scriptProperty]: 'window.awesomeProp = 1;'
      };
      const window = await waitForWindow(
        render(
          <WebViewErsatz
            javaScriptEnabled={true}
            source={{ html: '<div></div>' }}
            {...props}
          />
        )
      );
      expect(window.awesomeProp).toEqual(1);
    });
    it(`should not run ${scriptProperty} when javaScriptEnabled is set to false`, async () => {
      const props: any = {
        [scriptProperty]: 'window.awesomeProp = 1;'
      };
      const window = await waitForWindow(
        render(
          <WebViewErsatz
            javaScriptEnabled={true}
            source={{ html: '<div></div>' }}
            {...props}
          />
        )
      );
      expect(window.awesomeProp).toEqual(1);
    });
  });
}

describe('WebView component', () => {
  it('should expose the document object after loading', async () => {
    await waitForDocument(
      render(<WebViewErsatz source={{ html: '<div></div>' }} />)
    );
  });
  it('should expose the window object after loading', async () => {
    await waitForDocument(
      render(<WebViewErsatz source={{ html: '<div></div>' }} />)
    );
  });
  it('should allow queries to document API', async () => {
    const document = await waitForDocument(
      render(<WebViewErsatz source={{ html: '<div id="hi"></div>' }} />)
    );
    expect(document.getElementById('hi')).toBeTruthy();
  });
  testInjectedScriptProp('injectedJavaScript');
  testInjectedScriptProp('injectedJavaScriptBeforeContentLoaded');
  it('should support baseUrl source attribute', async () => {
    const document = await waitForDocument(
      render(
        <WebViewErsatz
          source={{
            html: '<a id="hi" href="/blog">foo<a>',
            baseUrl: 'https://foo.bar'
          }}
        />
      )
    );
    expect(document.getElementById('hi')['href']).toEqual(
      'https://foo.bar/blog'
    );
  });
  it('should support source with URIs', async () => {
    const resource = nockFooBar();
    const document = await waitForDocument(
      render(
        <WebViewErsatz
          source={{
            uri: resource
          }}
        />
      )
    );
    expect(document.getElementsByTagName('header')).toHaveLength(1);
  });
  describe('regarding loading cycles', () => {
    it('should create a new DOM object after reload', async () => {
      const rendererApi = render(
        <WebViewErsatz
          injectedJavaScript="window.awesomeProp = (window.awesomeProp||0) + 1;"
          source={{ html: '<div></div>' }}
        />
      );
      const webView = await waitForWebViewBackend(rendererApi);
      const oldWindow = webView.getWindow();
      act(() => {
        webView.reload();
      });
      await waitForWebViewBackend(rendererApi, {
        loadCycleId: 1,
        loadingState: 'loaded'
      });
      expect(webView.getWindow()).not.toBe(oldWindow);
    });
    for (const handlerName of startHandlers) {
      for (const snippet of sourceSnippets) {
        it(`should invoke ${handlerName} before loading ${snippet.name}`, async () => {
          const props = {
            [handlerName]: jest.fn()
          };
          await waitForWebViewBackend(
            render(<WebViewErsatz {...props} source={snippet.getResource()} />),
            { loadingState: 'loading' }
          );
          expect(props[handlerName]).toHaveBeenCalled();
        });
      }
    }
    for (const handlerName of endHandlers) {
      for (const snippet of sourceSnippets) {
        it(`should have invoked ${handlerName} when content loaded for ${snippet.name}`, async () => {
          const props = {
            [handlerName]: jest.fn()
          };
          await waitForWebViewBackend(
            render(<WebViewErsatz {...props} source={snippet.getResource()} />),
            { loadingState: 'loaded' }
          );
          expect(props[handlerName]).toHaveBeenCalled();
        });
      }
    }
    it('should invoke onHttpError when a request fails', async () => {
      nock('https://foo.bar')
        .get('/500')
        .reply(500, 'Internal server error', { 'Content-Type': 'text/plain' });
      const onHttpError = jest.fn();
      await waitForWebViewBackend(
        render(
          <WebViewErsatz
            onHttpError={onHttpError}
            source={{
              uri: 'https://foo.bar/500'
            }}
          />
        )
      );
      expect(onHttpError).toHaveBeenCalledTimes(1);
    });
  });
});
