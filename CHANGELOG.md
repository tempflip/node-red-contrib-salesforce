# Changelog

## 0.1.1

- Backported improvements from benariss
  - streaming.js -> return error instead of throwing
  - all JS -> return errors

## 0.1.0

### Environment / Versions

- Tested on node-red 0.17.5
- Requires nodeJS > 6.0
- Upgraded to a fork of nforce 1.9 using latest packages
- Upgraded lodash dependency to 4.17.4
- Upgraded xmljs dependency to 0.4.19
- Minor bug fixes
- Switched from `var` to `const` where possible

### Functionality

- Streaming node now supports Streaming API, Generic Streaming events and Platform events (new)
- Streaming node indicates subscription in UI
- Configuration node now allows to specify instance (pot) URL for more stable login
- Configuration node allows to specify to read credentials from environment, for Heroku compatible deployment (no credentials in version control) - or other platforms
