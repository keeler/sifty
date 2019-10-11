import * as _ from 'lodash'
import MediaItem from './core/mediaItem'
import Downloader from './core/downloader'
import TestHelper from './test/utils/TestHelper'

TestHelper.initTestsIfTemporaryInstallation(downloadMediaItemsInCurrentWindow)

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
  const mediaItems = _.map(tabs, tab => findMediaItemInTab(tab))
  const validItems = Promise.all(mediaItems).then(items => {
    return items.filter(item => item.isValid())
  })
  return validItems
}

async function findMediaItemInTab (tab) {
  await injectGetItemScriptIntoTab(tab)
  return requestMediaItemInfoFromTab(tab)
}

async function injectGetItemScriptIntoTab (tab) {
  await browser.tabs.executeScript(
    tab.id,
    { file: '/content_scripts/getItem.js' }
  ).catch((error) => {
    // This usually happens on about:* or resource:* pages,
    // which can't execute content scripts by design.
    console.log(`Couldn't execute on ${tab.url}, ${error}`)
  })
}

function requestMediaItemInfoFromTab (tab) {
  // Expects the tab to have the getItem.js content script available.
  return browser.tabs.sendMessage(
    tab.id,
    { message: 'getItem' }
  ).then(response => {
    return new MediaItem(response.src, response.mimeType, tab.id)
  }).catch((error) => {
    console.log(error)
  })
}
