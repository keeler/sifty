<p align="left"><img src=https://raw.githubusercontent.com/keeler/sifty/master/icons/sifty.png></p>

Browser extension to

**S**ave

**I**tems

**F**rom

**T**abs,

**Y**o!

Searches open tabs for media (images, audio, video), saves them, and closes the tabs.

Get it as a [Firefox Add-on](https://addons.mozilla.org/en-US/firefox/addon/sifty/).

### Developer Notes

This extension uses [Node.js](https://nodejs.org/en/) v12, the easiest way to install it is using [`nvm`](https://github.com/nvm-sh/nvm).

### Testing

Tests are automated using Jasmine, modelled after the tests in the [sync-tab-groups](https://github.com/Morikko/sync-tab-groups) extension. The files in `test/util/jasmine-core/` were downloaded from [here](https://www.npmjs.com/package/jasmine-core) following the standalone install instructions.

Run the tests by loading the extension as a temporary extension using one of these methods:
1. Manually through the `about:debugging` page.
1. Using the `web-ext run` command. Docs on `web-ext` [here](https://extensionworkshop.com/documentation/develop/getting-started-with-web-ext/).

A test page should automatically launch and show the outcome of the tests.

**NOTE:** If the tests fail, you may need to [enable the extension in private browsing](https://support.mozilla.org/en-US/kb/extensions-private-browsing). Then reload the test page.

