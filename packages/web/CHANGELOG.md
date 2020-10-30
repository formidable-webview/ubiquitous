## [0.0.1](https://github.com/formidable-webview/ubiquitous/compare/@formidable-webview/web@0.0.1-alpha.1...@formidable-webview/web@0.0.1) (2020-10-30)

## [0.0.1-alpha.1](https://github.com/formidable-webview/ubiquitous/compare/@formidable-webview/web@0.0.1-alpha.0...@formidable-webview/web@0.0.1-alpha.1) (2020-10-30)

## 0.0.1-alpha.0 (2020-10-29)


### Bug Fixes

* **web:** use yarn compatible "prepack" hook instead of "prepare" ([44d3c52](https://github.com/formidable-webview/ersatz/commit/44d3c529937c65b8a6e4282b9784f70f4b52c31c))


### Features

* **web:** add handful of new props specific to IframeWebView component ([23fd1b0](https://github.com/formidable-webview/ersatz/commit/23fd1b0e4cc90ca19a5a44bade6edf419f88e4dd))
* **web:** add support for renderError, onShouldStartLoadWithRequest ([3a208a9](https://github.com/formidable-webview/ersatz/commit/3a208a98c530ff5bc5e4acb83d503bd7c2ea9a9c))
* **web:** exhaustive attributes coverage ([532ed94](https://github.com/formidable-webview/ersatz/commit/532ed9411d1950f63ec29cd2884848fd7f4e26d1))
* **web:** implement and document web policies (security) ([d5f27f8](https://github.com/formidable-webview/ersatz/commit/d5f27f87114b19013fea694f41c033259c414ea3))
* support new props ([7d08486](https://github.com/formidable-webview/ersatz/commit/7d08486737e0e7fb26e41d776da98fe3fb8f5504))
* **web:** implement navigation (wip) ([7b496df](https://github.com/formidable-webview/ersatz/commit/7b496df19d0905fc92d3f520e5ebff322d01e29d))
* new "web" package to run WebView on web ([131bd3b](https://github.com/formidable-webview/ersatz/commit/131bd3b4325b7d5ddc29c17563d91311bded15c1))

## [2.0.1](https://github.com/formidable-webview/ersatz/compare/@formidable-webview/ersatz@2.0.0...@formidable-webview/ersatz@2.0.1) (2020-10-07)

### Bug Fixes

- Patch release-it to support yarn workspaces

# [2.0.0](https://github.com/formidable-webview/ersatz/compare/@formidable-webview/ersatz-testing@2.0.0...@formidable-webview/ersatz@2.0.0) (2020-10-07)


### Code Refactoring

* **ersatz:** use @formidable-webview/skeletton extracted logic ([0d91dfc](https://github.com/formidable-webview/ersatz/commit/0d91dfc2c69fe1e15f5732320d361d7c7d228154))


### BREAKING CHANGES

* **ersatz:** The type of the default exported component has the same
props, but it is not a class anymore. Instead, exotic forwarded ref
component. That shouldn't change anything for a vast majority of users.
If you are using @formidable-webview/ersatz-testing though, you will
need to upgrade that one too.

## [1.0.2](https://github.com/formidable-webview/ersatz/compare/v1.0.1...@formidable-webview/ersatz@1.0.2) (2020-10-05)

* chore: release @formidable-webview/ersatz@ (16ea40f)


## [1.0.1](https://github.com/formidable-webview/ersatz/compare/v1.0.0...v1.0.1) (2020-10-01)


### Bug Fixes

* allow injectJavaScript invocation as soon as the DOM object ready ([f41efa2](https://github.com/formidable-webview/ersatz/commit/f41efa2efe45046b2c0ce2a88194b89772c8ea39))

# [1.0.0](https://github.com/formidable-webview/ersatz/compare/v0.10.1-alpha.5...v1.0.0) (2020-08-20)

Initial version.
