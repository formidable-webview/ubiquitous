import * as React from 'react';
import { Ersatz } from '../Ersatz';
import { render, act } from '@testing-library/react-native';
import {
  waitForDocument,
  waitForWindow,
  waitForErsatz
} from '@formidable-webview/ersatz-testing';
import nock from 'nock';
import { WebViewProps } from 'react-native-webview';
import { eventFactory } from '@formidable-webview/skeletton';
import { View } from 'react-native';

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
const inlineHTMLSnippet = {
  name: 'inline HTML',
  getResource() {
    return { html: '<div></div>' };
  }
};
const remoteResourceSnippet = {
  name: 'remote HTML resource',
  getResource() {
    return {
      uri: nockFooBar()
    };
  }
};

const sourceSnippets = [inlineHTMLSnippet, remoteResourceSnippet];

function testInjectedScriptProp<T extends keyof WebViewProps>(
  scriptProperty: T
) {
  describe(`with ${scriptProperty} prop`, () => {
    it(`should run ${scriptProperty} when javaScriptEnabled is unset`, async () => {
      const props: any = {
        [scriptProperty]: 'window.awesomeProp = 1;'
      };
      const window = await waitForWindow(
        render(<Ersatz {...props} source={{ html: '<div></div>' }} />)
      );
      expect(window.awesomeProp).toEqual(1);
    });
    it(`should run ${scriptProperty} when javaScriptEnabled is set to true`, async () => {
      const props: any = {
        [scriptProperty]: 'window.awesomeProp = 1;'
      };
      const window = await waitForWindow(
        render(
          <Ersatz
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
          <Ersatz
            javaScriptEnabled={true}
            source={{ html: '<div></div>' }}
            {...props}
          />
        )
      );
      expect(window.awesomeProp).toEqual(1);
    });
    it(`should run ${scriptProperty} when source is not set or empty`, async () => {
      const props: any = {
        [scriptProperty]: 'window.awesomeProp = 1;'
      };
      const window = await waitForWindow(
        render(<Ersatz javaScriptEnabled={true} {...props} />)
      );
      expect(window.awesomeProp).toEqual(1);
    });
  });
}

describe('WebView component', () => {
  it('should expose the document object after loading', async () => {
    await waitForDocument(render(<Ersatz source={{ html: '<div></div>' }} />));
  });
  it('should expose the window object after loading', async () => {
    await waitForDocument(render(<Ersatz source={{ html: '<div></div>' }} />));
  });
  it('should allow queries to document API', async () => {
    const document = await waitForDocument(
      render(<Ersatz source={{ html: '<div id="hi"></div>' }} />)
    );
    expect(document.getElementById('hi')).toBeTruthy();
  });
  testInjectedScriptProp('injectedJavaScript');
  testInjectedScriptProp('injectedJavaScriptBeforeContentLoaded');
  it('should support baseUrl source attribute', async () => {
    const document = await waitForDocument(
      render(
        <Ersatz
          source={{
            html: '<a id="hi" href="/blog">foo<a>',
            baseUrl: 'https://foo.bar'
          }}
        />
      )
    );
    expect(document.getElementById('hi').href).toEqual('https://foo.bar/blog');
  });
  it('should support source with URIs', async () => {
    const resource = nockFooBar();
    const document = await waitForDocument(
      render(
        <Ersatz
          source={{
            uri: resource
          }}
        />
      )
    );
    expect(document.getElementsByTagName('header')).toHaveLength(1);
  });
  it('should render a source loader when a source prop is passed', async () => {
    const renderAPI = render(<Ersatz source={{ html: '<div></div>' }} />);
    await renderAPI.findByTestId('ersatz-source-loader', {
      timeout: 10
    });
    await waitForErsatz(renderAPI);
  });
  describe('regarding instance methods', () => {
    it('should do nothing when goBack is invoked', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const ersatz = await waitForErsatz(
        render(<Ersatz source={{ html: '<div></div>' }} />)
      );
      expect(() => ersatz.goBack()).not.toThrow();
    });
    it('should do nothing when goForward is invoked', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const ersatz = await waitForErsatz(
        render(<Ersatz source={{ html: '<div></div>' }} />)
      );
      expect(() => ersatz.goForward()).not.toThrow();
    });
    it('should do nothing when requestFocus is invoked', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const ersatz = await waitForErsatz(
        render(<Ersatz source={{ html: '<div></div>' }} />)
      );
      expect(() => ersatz.requestFocus()).not.toThrow();
    });
    it('should do nothing when stopLoading is invoked', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const ersatz = await waitForErsatz(
        render(<Ersatz source={{ html: '<div></div>' }} />)
      );
      expect(() => ersatz.stopLoading()).not.toThrow();
    });
    it('should execute javascript in the DOM when injectJavascript is invoked', async () => {
      const ersatz = await waitForErsatz(
        render(<Ersatz source={{ html: '<div></div>' }} />)
      );
      ersatz.injectJavaScript('window.awesomeProp = 1;');
      expect(ersatz.getWindow()!.awesomeProp).toEqual(1);
    });
  });
  describe('regarding renderer props', () => {
    it('should use renderLoading when loading', async () => {
      const renderLoading = () => <View testID="custom-loading" />;
      const renderAPI = render(
        <Ersatz
          renderLoading={renderLoading}
          source={remoteResourceSnippet.getResource()}
        />
      );
      const { queryByTestId } = renderAPI;
      expect(queryByTestId('custom-loading')).toBeTruthy();
      await waitForErsatz(renderAPI);
    });
  });
  describe('regarding Native to JS communication', () => {
    it('should invoke onMessage handler when window.ReactNativeWebview.postMessage is invoked in the DOM with a text argument', async () => {
      const onMessage = jest.fn();
      const rendererApi = render(
        <Ersatz
          injectedJavaScript="window.ReactNativeWebView.postMessage('Hello world!');"
          onMessage={onMessage}
          source={{ html: '<div></div>' }}
        />
      );
      await waitForErsatz(rendererApi);
      expect(onMessage).toHaveBeenCalledWith(
        eventFactory.createMessageEvent(
          { title: '', url: 'about:blank' },
          'Hello world!'
        )
      );
    });
    it('should invoke onError when window.ReactNativeWebview.postMessage is invoked in the DOM with a non-text argument', async () => {
      const onError = jest.fn();
      const rendererApi = render(
        <Ersatz
          injectedJavaScript="window.ReactNativeWebView.postMessage({});"
          onError={onError}
          source={{ html: '<div></div>' }}
        />
      );
      await waitForErsatz(rendererApi);
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });
  describe('regarding loading cycles', () => {
    it('should create a new DOM object after reload', async () => {
      const rendererApi = render(
        <Ersatz
          injectedJavaScript="window.awesomeProp = (window.awesomeProp||0) + 1;"
          source={{ html: '<div></div>' }}
        />
      );
      const webView = await waitForErsatz(rendererApi);
      const oldWindow = webView.getWindow();
      act(() => {
        webView.reload();
      });
      await waitForErsatz(rendererApi, {
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
          await waitForErsatz(
            render(<Ersatz {...props} source={snippet.getResource()} />),
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
          await waitForErsatz(
            render(<Ersatz {...props} source={snippet.getResource()} />),
            { loadingState: 'loaded' }
          );
          expect(props[handlerName]).toHaveBeenCalled();
        });
      }
    }
    it('should invoke handlers with appropriate url and title when handling a remote HTTP resource', async () => {
      nock('https://foo.bar')
        .get('/200')
        .reply(
          200,
          '<!DOCTYPE html><html><head><title>Hello world</title></head><body><header></header></body></html>',
          { 'Content-Type': 'text/html' }
        );
      const onLoad = jest.fn();
      const onLoadStart = jest.fn();
      await waitForErsatz(
        render(
          <Ersatz
            onLoadStart={onLoadStart}
            onLoad={onLoad}
            source={{
              uri: 'https://foo.bar/200'
            }}
          />
        )
      );
      expect(onLoad).toHaveBeenCalledWith(
        eventFactory.createLoadEndEvent({
          url: 'https://foo.bar/200',
          title: 'Hello world'
        })
      );
      expect(onLoadStart).toHaveBeenCalledWith(
        eventFactory.createLoadStartEvent({
          url: 'https://foo.bar/200',
          title: 'Hello world'
        })
      );
    });
    it('should invoke handlers with appropriate url and title when handling inline HTML', async () => {
      const onLoad = jest.fn();
      const onLoadStart = jest.fn();
      await waitForErsatz(
        render(
          <Ersatz
            onLoadStart={onLoadStart}
            onLoad={onLoad}
            source={{
              html:
                '<!DOCTYPE html><html><head><title>Hello world</title></head><body><header></header></body></html>'
            }}
          />
        )
      );
      expect(onLoad).toHaveBeenCalledWith(
        eventFactory.createLoadEndEvent({
          url: 'about:blank',
          title: 'Hello world'
        })
      );
      expect(onLoadStart).toHaveBeenCalledWith(
        eventFactory.createLoadStartEvent({
          url: 'about:blank',
          title: 'Hello world'
        })
      );
    });
    it('should invoke onHttpError when a request fails', async () => {
      nock('https://foo.bar')
        .get('/500')
        .reply(500, 'Internal server error', { 'Content-Type': 'text/plain' });
      const onHttpError = jest.fn();
      const { findByTestId } = render(
        <Ersatz
          onHttpError={onHttpError}
          source={{
            uri: 'https://foo.bar/500'
          }}
        />
      );
      await findByTestId('ersatz-error');
      expect(onHttpError).toHaveBeenCalledTimes(1);
    });
  });
});
