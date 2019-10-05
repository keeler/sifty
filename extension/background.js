import * as _ from 'lodash'
import MediaItem from './mediaItem'
import Downloader from './downloader'

// When installed as a temporary extension, open the test pages in new tabs.
browser.runtime.onInstalled.addListener((details) => {
  if (details.temporary) {
    browser.windows.create({
      url: [
        browser.extension.getURL('test/integration.html')
      ]
    })
  }
})

browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'downloadMediaItems') {
    // Used for integration testing.
    downloadMediaItemsInCurrentWindow().then((finishedDownloads) => {
      sendResponse({ finishedDownloads: finishedDownloads })
    })
  } else if (request.message === 'getTabId') {
    sendResponse({ tabId: sender.tab.id })
  }
  // Return true so sendResponse() can be asynchronous.
  // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#Sending_an_asynchronous_response_using_sendResponse
  return true
})

// Wait for the user to click the button in their toolbar.
browser.browserAction.onClicked.addListener(handleToolbarButtonClicked)

function handleToolbarButtonClicked () {
  downloadMediaItemsInCurrentWindow()
}

function downloadMediaItemsInCurrentWindow () {
  return getTabsInCurrentWindow().then(downloadItemsInTabs)
}

function getTabsInCurrentWindow () {
  return browser.tabs.query({ currentWindow: true })
}

function downloadItemsInTabs (tabs) {
  const mediaItemsFound = findMediaItemsInTabs(tabs)
  return Downloader.downloadMediaItems(mediaItemsFound)
}

function findMediaItemsInTabs (tabs) {
  return _.map(tabs, (tab) => {
    return findMediaItemInTab(tab)
  })
}

async function findMediaItemInTab (tab) {
  await browser.tabs.executeScript(
    tab.id,
    { file: '/content_scripts/getItem.js' }
  ).catch((error) => {
    // This usually happens on about:* or resource:* pages, which
    // we can't execute content scripts on by design.
    console.log('Couldn\'t execute on ' + tab.url + ', ' + error)
  })

  return browser.tabs.sendMessage(
    tab.id,
    { message: 'getItem' }
  ).then(response => {
    return new MediaItem(response.src, response.mimeType, response.tabId)
  }).catch((error) => {
    console.log(error)
  })
}
