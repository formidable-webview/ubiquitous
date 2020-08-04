# React Native WebView Emulator

> :warning: *This library is in early development.*

## What can be tested?

- Injected Javascript and the JS to Native communication;
- The DOM;
- Remote sources and options ( `{ uri, body, headers, method`);
- Inline sources and options (`{ html, baseUrl }`);

## What is not supported?

- platform-specific props
- decoration props (`shows*`)
- deprecated props (`url`, `html`)
- `allow*` props
- props related to caching, cooking and data storage (`incognito`,
  `cacheEnabled` ...)
- loading source from a file
- special `onNavigationStateChange` event types such as `formsubmit`

## Event Handling

To reproduce the logic behind the different event handlers, we based our
assumptions on the doc, the original source code and manual testing in Android,
at version 10.3.3 of `react-native-webview`. If you find a divergence in
behaviors, you are welcome to open a bug report. Bellow is a list of event
handler props with a description of our understanding of when this handler will
be invoked.

| Event Handler             | Support            | Behavior                                                                                                                                                 |
| ------------------------- | ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onLoad`                  | :heavy_check_mark: | Invoked when the WebView has finished the load operation with success.                                                                                   |
| `onLoadEnd`               | :heavy_check_mark: | Invoked when the WebView has finished the load operation, either with a success or failure                                                               |
| `onError`                 | :heavy_check_mark: | Invoked when the WebView has finished the load operation with a failure. Failures cannot be reproduced though.                                           |
| `onLoadStart`             | :heavy_check_mark: | Invoked when the WebView is starting to load from a source object.                                                                                       |
| `onLoadProgress`          | :heavy_check_mark: | Invoked multiple times when the WebView is loading. Although we support this, only one event will be fired at the end with `progress: 1`.                |
| `onHttpError`             | :heavy_check_mark: | Invoked when a HTTP request fetching the resource in `source.uri` fails. We do provide the `description` and `httpStatus` attributes of `nativeEvent`.   |
| `onNavigationStateChange` | :warning:          | Invoked when the WebView loading starts or ends. Special events such as `formsubmit` are not handled.                                                    |
| `onMessage`               | :heavy_check_mark: | Invoked when a script in the backend has posted a message with `window.ReactNativeWebView.postMessage`. We also provide the legacy `window.postMessage`. |

### Load Cycle

As per the manual tests we performed, a load cycle appears to start:

- When the component is mounted with a `source` prop;
- When an attribute of `source` changes (a deep-equal don't trigger);
- When the `reload` method is invoked;
- When the `document.location.href` is changed (internal navigation);
- When any event handler reference is changed;

```
FETCHING (0)   LOAD START (1)              PROGRESS (2)      LOAD END (3)
onHttpError -> onLoadStart              -> onLoadProgress -> onLoadEnd
               onNavigationStateChange                       onNavigationStateChange
                                                             onLoad (success)
                                                             onError (failure)
```

According to the documentation, `injectedJavaScriptBeforeContentLoaded` and
`injectedScript` are loaded between (1) and (3), but
`injectedJavaScriptBeforeContentLoaded` is run right after document object
creation, while `injectedScript` is run after
[DOMContentLoaded](https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event)
event. Our manual tests found out that both scripts have access to
`window.ReactNativeWebView`.

**Edge cases**

- When loaded with an undefined `source` prop, onLoadStart is triggered with `loading: false`.
- When loaded with a `source.url` prop, `url` in events is set to `about:blank`.

## Caveats

- NativeSyntheticEvents types are respected, but their content is unlikely to
  be meaningful. If you have a specific use case for supporting an attribute of
  the `nativeEvent` attribute, we are open to suggestions.
- The mounting of the DOM is performed with
  [jsdom](https://github.com/jsdom/jsdom). Thus, the assertions you can do on
  the DOM are constrained by this library capabilities. Notably:
  - because there is no real visual rendering performed, elements will have dimensions of
    size 0.
  - the absence of a Navigation API.
    [A detailed list of caveats is available here](https://github.com/jsdom/jsdom#caveats).
