import TestHelper from './test/utils/TestHelper.js'

// When installed as a temporary extension, open the test pages in new tabs.
browser.runtime.onInstalled.addListener((details) => {
  if (details.temporary) {
    // Add message hooks for integration testing.
    browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.message === 'downloadMediaItems') {
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

    // Load test pages to run tests.
    browser.windows.create({
      url: [
        browser.extension.getURL('test/integration.html')
      ]
    })
  }
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
  return downloadMediaItems(mediaItemsFound)
}

function findMediaItemsInTabs (tabs) {
  var mediaItemsFound = []
  for (var tab of tabs) {
    mediaItemsFound.push(findMediaItemInTab(tab))
  }
  return mediaItemsFound
}

function downloadMediaItems (mediaItemPromises) {
  // Make a promise for all the downloads to complete.
  var downloadsComplete = new Promise((resolve, reject) => {
    // Only start once all the tabs have been scanned for items.
    Promise.all(mediaItemPromises).then((mediaItems) => {
      // Filter to tabs that had an item.
      mediaItems = mediaItems.filter(item => !!item && !!item.src)
      if (mediaItems.length <= 0) {
        // If there are no items, resolve with 0 downloads.
        return resolve([])
      }

      // Otherwise we have items, tell user we're starting downloads.
      notify({
        id: 'sifty-working',
        message: 'Downloading ' + mediaItems.length + ' files...',
        timeoutInMs: 0
      })

      return downloadAll(mediaItems, resolve)
    })
  })

  return new Promise((resolve, reject) => {
    // Wait for all the downloads to complete.
    downloadsComplete.then((completeDownloads) => {
      var note = {
        id: 'sifty-finished',
        timeoutInMs: 2000
      }

      // Tell user how many downloads went through.
      var downloadCount = completeDownloads.length
      if (downloadCount > 0) {
        browser.notifications.clear('sifty-working')
        note.message = 'Done! (' + downloadCount + ' saved)'
      } else {
        note.message = 'No media files to download'
      }

      notify(note)

      resolve(completeDownloads)
    })
  })
}

function findMediaItemInTab (tab) {
  // Execute a script in the tab find and return
  // the source of the media item (e.g. a .jpeg,
  // .webm, .mp3 file) in the tab. if any exists.
  return browser.tabs.executeScript(
    tab.id,
    { file: '/content_scripts/getItem.js' }
  ).then((items) => {
    var result = {}
    if (!!items && !!items[0] > 0) {
      result = items[0]
    }
    return result
  }).catch((error) => {
    // This usually happens on about:* or resource:* pages, which
    // we can't execute content scripts on by design.
    console.log('Couldn\'t execute on ' + tab.url + ', ' + error)
    return null
  })
}

function downloadAll (mediaItems, callWhenComplete) {
  // Create a bunch of download promises.
  var downloadsFinished = []
  for (const item of mediaItems) {
    var download = startDownload(item).then((downloadId) => {
      item.downloadId = downloadId
      return finishDownload(item)
    })
    downloadsFinished.push(download)
  }

  // When all the download promises are complete, resolve the
  // parent promise with the number of completed downloadsFinished.
  Promise.all(downloadsFinished).then((finishedDownloads) => {
    callWhenComplete(finishedDownloads)
  })
}

// Thanks nginx! https://github.com/nginx/nginx/blob/master/conf/mime.types
const mimeTypeToExtension = {
  'text/html': 'html',
  'text/css': 'css',
  'text/xml': 'xml',
  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'application/javascript': 'js',
  'application/atom+xml': 'atom',
  'application/rss+xml': 'rss',
  'text/mathml': 'mml',
  'text/plain': 'txt',
  'text/vnd.sun.j2me.app-descriptor': 'jad',
  'text/vnd.wap.wml': 'wml',
  'text/x-component': 'htc',

  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tif',
  'image/vnd.wap.wbmp': 'wbmp',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/x-jng': 'jng',
  'image/x-ms-bmp': 'bmp',

  'application/font-woff': 'woff',
  'application/java-archive': 'jar',
  'application/json': 'json',
  'application/mac-binhex40': 'hqx',
  'application/msword': 'doc',
  'application/pdf': 'pdf',
  'application/postscript': 'ps',
  'application/rtf': 'rtf',
  'application/vnd.apple.mpegurl': 'm3u8',
  'application/vnd.google-earth.kml+xml': 'kml',
  'application/vnd.google-earth.kmz': 'kmz',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-fontobject': 'eot',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.oasis.opendocument.graphics': 'odg',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/x-7z-compressed': '7z',
  'application/x-rar-compressed': 'rar',
  'application/x-shockwave-flash': 'swf',
  'application/zip': 'zip',

  'audio/midi': 'mid',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/x-m4a': 'm4a',
  'audio/x-realaudio': 'ra',

  'video/3gpp': '3gpp 3gp',
  'video/mp2t': 'ts',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg mpg',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-flv': 'flv',
  'video/x-m4v': 'm4v',
  'video/x-mng': 'mng',
  'video/x-ms-asf': 'asx asf',
  'video/x-ms-wmv': 'wmv',
  'video/x-msvideo': 'avi'
}

// Clean the query string parameters, hostname, and any
// characters that tend to break filepaths.
function getLocalFilename (mediaItem) {
  var url = mediaItem.src
  var mimeType = mediaItem.mimeType
  var result = url.substring(0, (url.indexOf('#') === -1 ? url.length : url.indexOf('#')))
  result = result.substring(0, (result.indexOf('?') === -1 ? result.length : result.indexOf('?')))
  result = result.substring(result.lastIndexOf('/') + 1, url.length)
  result = result.replace(/[|\\/&:$%@!"<>()^+=?*,]/g, '_')

  // Get the file extension, if there is one.
  var a = result.split('.')
  var ext = ''
  if (!(a.length === 1 || (a[0] === '' && a.length === 2))) {
    ext = a.pop()
  }

  // If the filename inferred from the URL doesn't have an extension,
  // infer the extension from the mime type.
  if (!ext || ext !== mimeTypeToExtension[mimeType]) {
    result = result + '.' + mimeTypeToExtension[mimeType]
  }

  return result
}

function startDownload (mediaItem) {
  return browser.downloads.download({
    url: mediaItem.src,
    filename: getLocalFilename(mediaItem),
    conflictAction: 'uniquify',
    incognito: true
  })
}

// Finish the download by setting up the tab to close when the download completes.
function finishDownload (mediaItem) {
  return new Promise((resolve, reject) => {
    // The callback passed to callWhenDownloadComplete will
    // close the tab then resolve this promise.
    browser.downloads.onChanged.addListener(
      callWhenDownloadComplete(mediaItem.downloadId, function () {
        browser.tabs.remove(mediaItem.tabId)
        resolve(mediaItem)
      })
    )
  }).catch((error) => {
    console.log(error)
    return null
  })
}

// Call callback() when download with the given id completes.
function callWhenDownloadComplete (id, callback) {
  return function (delta) {
    if (id === delta.id && delta.state && delta.state.current === 'complete') {
      callback()
    }
  }
}

// Timeout defaults to 2 sec, set to 0 to not timeout.
function notify (note) {
  browser.notifications.create(note.id, {
    type: 'basic',
    iconUrl: browser.extension.getURL('icons/sifty.svg'),
    title: 'Save Items From Tabs, Yo!',
    message: note.message
  })

  var timeoutInMs = (typeof note.timeoutInMs !== 'undefined') ? note.timeoutInMs : 2000
  if (timeoutInMs !== 0) {
    setTimeout(function () {
      browser.notifications.clear(note.id)
    }, timeoutInMs)
  }
}
