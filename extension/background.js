import * as _ from 'lodash'
import MediaItem from './mediaItem'
import Downloader from './downloader'
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
    return new MediaItem(response.src, response.mimeType, tab.id)
  }).catch((error) => {
    console.log(error)
  })
}
