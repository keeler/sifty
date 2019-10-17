import * as _ from 'lodash'

const TestHelper = {}

TestHelper.testPageUrls = [
  browser.extension.getURL('test/unit/unit.html'),
  browser.extension.getURL('test/integration/integration.html')
]

TestHelper.initTestsIfTemporaryInstallation = function (activateSifty) {
  if (process.env.IS_PROD) {
    return
  }

  browser.runtime.onInstalled.addListener((details) => {
    // When installed as a temporary extension...
    if (details.temporary) {
      // Listen for messages from the test and activate sifty in response.
      browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'activateDownloadForIntegrationTest') {
          activateSifty().then((finishedDownloads) => {
            sendResponse({ finishedDownloads: finishedDownloads })
          })
        }
        // Return true so sendResponse() can be asynchronous.
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#Sending_an_asynchronous_response_using_sendResponse
        return true
      })

      // Open the test pages which will run the tests.
      browser.windows.create({
        url: TestHelper.testPageUrls
      })
    }
  })
}

TestHelper.closeAllTabsExceptTestPages = async function () {
  const tabs = await browser.tabs.query({ currentWindow: true })
  _.forEach(tabs, async (tab) => {
    if (!_.includes(TestHelper.testPageUrls, tab.url)) {
      await browser.tabs.remove(tab.id)
    }
  })
}

const mediaItemUrls = [
  browser.extension.getURL('/test/resources/dahlia.jpeg'),
  browser.extension.getURL('/test/resources/hummingbird.png'),
  browser.extension.getURL('/test/resources/fig.gif'),
  browser.extension.getURL('/test/resources/boat.webm'),
  browser.extension.getURL('/test/resources/walking.mp4')
]

TestHelper.openMediaItemsInTabs = async function () {
  _.forEach(mediaItemUrls, async (url) => {
    await browser.tabs.create({ url: url })
  })
  return mediaItemUrls
}

TestHelper.clearDownloads = async function (finishedDownloads) {
  for (const download of finishedDownloads) {
    await browser.downloads.removeFile(download.downloadId)
    await browser.downloads.erase({ id: download.downloadId })
  }
}

TestHelper.downloadUsingSifty = async function () {
  const finishedDownloads = await browser.runtime.sendMessage({
    message: 'activateDownloadForIntegrationTest'
  }).then((response) => {
    return response.finishedDownloads
  }, (error) => {
    console.log(error)
  })
  return finishedDownloads
}

export default TestHelper
