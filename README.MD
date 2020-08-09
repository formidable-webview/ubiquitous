[![npm](https://img.shields.io/npm/v/@formidable-webview/ersatz)](https://www.npmjs.com/package/@formidable-webview/ersatz)
[![semver](https://img.shields.io/badge/semver-2.0.0-e10079.svg)](https://semver.org/spec/v2.0.0.html)
[![codecov](https://codecov.io/gh/formidable-webview/ersatz/branch/master/graph/badge.svg)](https://codecov.io/gh/formidable-webview/ersatz)
[![CI](https://github.com/formidable-webview/ersatz/workflows/CI/badge.svg?branch=master)](https://github.com/formidable-webview/ersatz/actions?query=branch%3Amaster+workflow%3ACI)

# @formidable-webview/ersatz

> :warning: _This library is in early development._

## When Should I Use this Library?

> **The best use-case is when your application or library uses a `WebView`
> component with injected JavaScript**. With Ersatz, you can mock the
> `WebView`, perform assertions on the DOM, and verify that your [JS to native
> communication](https://github.com/react-native-community/react-native-webview/blob/master/docs/Guide.md#communicating-between-js-and-native)
> is behaving as expected. Fundamentally, you can now-on consider code injected in a
> `WebView` as part of the codebase and tested as deemed appropriate.

## How to Use?

The easiest way to use `Ersatz` is in combination with
[`jest`](https://www.npmjs.com/package/jest),
[`@formidable-webview/ersatz-testing`](https://www.npmjs.com/package/@formidable-webview/ersatz-testing)
and
[`@testing-library/react-native`](https://www.npmjs.com/package/@testing-library/react-native).
**[See examples here](https://github.com/formidable-webview/ersatz-testing#readme)**.

## Compatibility Table

| @formidable-webview/ersatz | react-native-webview |
| -------------------------- | -------------------- |
| 0.10                       | ≥ 7.6.0 < 11         |

## Emulated Features

### Basic Props

All the props in common with `ScrollView` are supported.

- Deprecated props are ignored.
- Platform-specific props are ignored.

Other props which can influence the DOM or the WebView and their support are
listed bellow. If a prop is not listed, it is probably irrelevant (related to
visual rendering) and will be ignored:

| Prop                                                    | Support            | Comments                                                                                                                          |
| ------------------------------------------------------- | ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `source`                                                | :warning:          | Both remote URI (including body, headers and method) and inline HTML are supported. Local files are not supported.                |
| `javaScriptEnabled`                                     | :heavy_check_mark: |                                                                                                                                   |
| `containerStyle`                                        | :heavy_check_mark: | Mapped to ScrollView `contentContainerStyle`.                                                                                     |
| `renderError`                                           | :heavy_check_mark: |                                                                                                                                   |
| `renderLoading`                                         | :heavy_check_mark: |                                                                                                                                   |
| `injectedJavaScript`                                    | :heavy_check_mark: | This code is evaluated in the DOM by jsdom. The code shouldn't be able to access scopes outside of the DOM, thanks to sandboxing. |
| `injectedJavaScriptBeforeContentLoaded`                 | :heavy_check_mark: | Ibidem.                                                                                                                           |
| `userAgent`                                             | :heavy_check_mark: |                                                                                                                                   |
| `injectedJavaScriptForMainFrameOnly`                    | :warning:          | Consider the behavior of Ersatz as if this prop was forced to `true`.                                                             |
| `injectedJavaScriptBeforeContentLoadedForMainFrameOnly` | :warning:          | Consider the behavior of Ersatz as if this prop was forced to `true`.                                                             |
| `incognito`                                             | :warning:          | Technically, that is true because nothing is persisted between to jsdom instantiations!                                           |
| `allowsFullscreenVideo`                                 | :warning:          | There are no visual rendering in jsdom, so this prop cannot be emulated.                                                          |
| `cacheEnabled`                                          | :warning:          | There is no cache implemented in jsdom. You can consider value `false`.                                                           |
| `javaScriptCanOpenWindowsAutomatically`                 | :x:                | Navigation is not (yet) supported.                                                                                                |
| `mediaPlaybackRequiresUserAction`                       | :x:                |                                                                                                                                   |
| `originWhitelist`                                       | :x:                |                                                                                                                                   |
| `startInLoadingState`                                   | :x:                |                                                                                                                                   |
| `applicationNameForUserAgent`                           | :x:                |                                                                                                                                   |

### DOM Event Handlers Props

To reproduce the logic behind the different event handlers, we based our
assumptions on the doc, the original source code and manual testing in Android,
at version 10.3.3 of `react-native-webview`. If you find a divergence in
behaviors, you are welcome to open a bug report. Bellow is a list of event
handler props with a description of our understanding of when this handler will
be invoked.

| Event Handler                  | Support            | Behavior                                                                                                                                                   |
| ------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onLoad`                       | :heavy_check_mark: | Invoked when the WebView has finished the load operation with success.                                                                                     |
| `onLoadEnd`                    | :heavy_check_mark: | Invoked when the WebView has finished the load operation, either with a success or failure                                                                 |
| `onError`                      | :heavy_check_mark: | Invoked when the WebView has finished the load operation with a failure. Failures cannot be reproduced though.                                             |
| `onLoadStart`                  | :heavy_check_mark: | Invoked when the WebView is starting to load from a source object.                                                                                         |
| `onLoadProgress`               | :heavy_check_mark: | Invoked multiple times when the WebView is loading. Although we support this, only one event will be fired at the end with `progress: 1`.                  |
| `onHttpError`                  | :heavy_check_mark: | Invoked when a HTTP request fetching the resource in `source.uri` fails. We do provide the `description` and `httpStatus` attributes of `nativeEvent`.     |
| `onMessage`                    | :heavy_check_mark: | Invoked when a script in the backend has posted a message with `window.ReactNativeWebView.postMessage`. We also provide the legacy `window.postMessage`.   |
| `onNavigationStateChange`      | :warning:          | Invoked when the WebView loading starts or ends. Special events such as `formsubmit` are not handled. Also, navigation to different URLs is not supported. |
| `onShouldStartLoadWithRequest` | :x:                | Unsupported. We don't have navigation right now.                                                                                                           |
| `onFileDownload`               | :x:                | Access to local filesystem is unsupported.                                                                                                                 |

### Instance Methods

| Method             | Support            | Behavior                                                         |
| ------------------ | ------------------ | ---------------------------------------------------------------- |
| `injectJavaScript` | :heavy_check_mark: | Full support.                                                    |
| `reload`           | :heavy_check_mark: | Full support.                                                    |
| `stopLoading`      | :warning:          | Method is present but does nothing.                              |
| `goBack`           | :warning:          | Method is present but does nothing. Navigation is not supported. |
| `goForward`        | :warning:          | Method is present but does nothing. Navigation is not supported. |
| `requestFocus`     | :warning:          | Method is present but does nothing.                              |

### Additional Instance Methods specifics to Ersatz

| Method        | Behavior                                                                                                                                           |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `getDocument` | Return the [Document](https://developer.mozilla.org/docs/Web/API/Document) instance loaded from the DOM. **Prerequisite**: the DOM must be loaded. |
| `getWindow`   | Return the [Window](https://developer.mozilla.org/docs/Web/API/Window) instance loaded from the DOM. **Prerequisite**: the DOM must be loaded.     |

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
- When loaded with an undefined `source` prop, `injectedJavaScript` and other scripts are still run.
- When loaded with a `source.url` prop, `url` in events is set to `about:blank`.

## Caveats

- NativeSyntheticEvents types are respected, but outside of `nativeEvent`
  attribute, their content is meaningless.
- The mounting of the DOM is performed with
  [jsdom](https://github.com/jsdom/jsdom). Thus, the assertions you can do on
  the DOM are constrained by this library capabilities. Notably:
  - because there is no real visual rendering performed, elements will have dimensions of
    size 0.
  - the absence of a Navigation API.
    [A detailed list of caveats is available here](https://github.com/jsdom/jsdom#caveats).
