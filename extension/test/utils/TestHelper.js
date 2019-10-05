const TestHelper = {}

TestHelper.addHooksForIntegrationTests = function (clickSiftyBrowserButton) {
  // When installed as a temporary extension, open the test pages in new tabs.
  browser.runtime.onInstalled.addListener((details) => {
    if (details.temporary) {
      // Add message hooks for integration testing.
      browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.message === 'downloadMediaItems') {
          clickSiftyBrowserButton().then((finishedDownloads) => {
            sendResponse({
              response: 'done',
              finishedDownloads: finishedDownloads
            })
          })
        }
        // Return true so sendResponse() can be asynchronous.
        // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#Sending_an_asynchronous_response_using_sendResponse
        return true
      })

      // Load test pages to run tests.
      browser.windows.create({
        url: [
          browser.extension.getURL('test/integration.html')
        ]
      })
    }
  })
}

TestHelper.closeAllTabsExceptTestPages = async function () {
  const tabs = await browser.tabs.query({ currentWindow: true })
  for (const tab of tabs) {
    if (tab.url !== browser.extension.getURL('/test/integration.html')) {
      await browser.tabs.remove(tab.id)
    }
  }
}

const mediaItemUrls = [
  browser.extension.getURL('/test/resources/dahlia.jpeg'),
  browser.extension.getURL('/test/resources/hummingbird.png'),
  browser.extension.getURL('/test/resources/fig.gif'),
  browser.extension.getURL('/test/resources/boat.webm'),
  browser.extension.getURL('/test/resources/walking.mp4')
]

TestHelper.openMediaItemsInTabs = async function () {
  for (const url of mediaItemUrls) {
    await browser.tabs.create({
      url: url
    })
  }
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
    message: 'downloadMediaItems'
  }).then((response) => {
    return response.finishedDownloads
  }, (error) => {
    console.log(error)
  })
  return finishedDownloads
}

export default TestHelper
