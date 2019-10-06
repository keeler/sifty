const Downloader = {}

Downloader.downloadMediaItems = function (mediaItemPromises) {
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
        message: `Downloading ${mediaItems.length} files...`,
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
        note.message = `Done! (${downloadCount} saved)`
      } else {
        note.message = 'No media files to download'
      }

      notify(note)

      resolve(completeDownloads)
    })
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

function startDownload (mediaItem) {
  return browser.downloads.download({
    url: mediaItem.src,
    filename: mediaItem.getLocalFilename(),
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

export default Downloader
