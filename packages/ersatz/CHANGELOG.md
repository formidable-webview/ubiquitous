## [2.1.1](https://github.com/formidable-webview/ubiquitous/compare/@formidable-webview/ersatz@2.1.0...@formidable-webview/ersatz@2.1.1) (2020-10-30)


### Bug Fixes

* update github references from ersatz to ubiquitous ([1245ce4](https://github.com/formidable-webview/ubiquitous/commit/1245ce43f04e939a99e130cdb3d18213599bd071)), closes [#3](https://github.com/formidable-webview/ubiquitous/issues/3)

# [2.1.0](https://github.com/formidable-webview/ersatz/compare/@formidable-webview/ersatz@2.0.3...@formidable-webview/ersatz@2.1.0) (2020-10-29)


### Features

* **skeletton:** pass all remaining props to backend ([7909391](https://github.com/formidable-webview/ersatz/commit/7909391c7ebbd91e0821703b340544c245f9a8e4))

## [2.0.3](https://github.com/formidable-webview/ersatz/compare/@formidable-webview/ersatz@2.0.2...@formidable-webview/ersatz@2.0.3) (2020-10-27)


### Bug Fixes

* **ersatz:** use yarn compatible "prepack" hook instead of "prepare" ([5ef911b](https://github.com/formidable-webview/ersatz/commit/5ef911b351302412b34450a9889fd97b6013728f)), closes [#2](https://github.com/formidable-webview/ersatz/issues/2)

## [2.0.2](https://github.com/formidable-webview/ersatz/compare/@formidable-webview/ersatz@2.0.1...@formidable-webview/ersatz@2.0.2) (2020-10-27)


### Bug Fixes

* **ersatz:** upgrade jsdom dependency to 16.4.0 ([209aaed](https://github.com/formidable-webview/ersatz/commit/209aaedbbc274f11eb12bcfe81b556d875bc4c20)), closes [#1](https://github.com/formidable-webview/ersatz/issues/1)

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
