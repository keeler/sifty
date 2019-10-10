<p align="left"><img src=https://raw.githubusercontent.com/keeler/sifty/master/icons/sifty.png></p>

Browser extension to **S**ave **I**tems **F**rom **T**abs, **Y**o!

Searches open tabs for media (images, audio, video), saves them, and closes the tabs.

Get it as a [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/sifty/).

## Developer Notes

This extension uses [Node.js](https://nodejs.org/en/) v12. Use [`nvm`](https://github.com/nvm-sh/nvm) to install and manage your Node versions. 

### Testing

Tests are automated using Jasmine, modelled after the tests in the [sync-tab-groups](https://github.com/Morikko/sync-tab-groups) extension.

You can run the tests with this command:
```
npm run build && npm run firefox:dev
```

This will build the extension with tests included and load it as a temporary extension in Firefox using `web-ext`.

A test page should automatically launch and show the outcome of the tests.

**NOTE:** If the tests fail, you may need to [allow the extension in private browsing](https://support.mozilla.org/en-US/kb/extensions-private-browsing). When you click 'Allow' the test page should reload automatically because the extension reloads.

### Releasing

1. First, do a dry-run of the release process by building a prod version of the extension and loading it into Firefox as a temporary extension. Manually verify that clicking the sifty button in the browser toolbar downloads media items and closes their tabs.
    ```
    npm run clean && npm run build:prod && npm run firefox:prod
    ```
2. Package up the extension for uploading to the Firefox Add-on repository, and follow the instructions [here](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/) to submit a new version of sifty. You'll find a .zip and .xpi in the release/ subfolder.
    ```
    npm run build:prod && npm run zip
    ```