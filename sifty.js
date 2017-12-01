// Wait for the user to click the button in their toolbar.
browser.browserAction.onClicked.addListener(handleToolbarButtonClicked)

function handleToolbarButtonClicked() {
    downloadMediaItems()
}

function downloadMediaItems() {
    // Get all tabs in current window.
    getTabsInWindow().then((tabs) => {
        // Search tabs for items
        var mediaItemsFound = []
        for(var tab of tabs) {
            mediaItemsFound.push(findMediaItemInTab(tab))
        }

        // Make a promise for all the downloads to complete.
        var downloadsComplete = new Promise((resolveAllDownloadsComplete, reject) => {
            // Only start once all the tabs have been scanned for items.
            Promise.all(mediaItemsFound).then((mediaItems) => {
                return downloadAll(mediaItems, resolveAllDownloadsComplete)
            })
        })
        
        // Wait for all the downloads to complete.
        downloadsComplete.then((downloadCount) => {
            var note = {
                id: 'sifty-finished',
                timeoutInMs: 2000
            }

            // Tell user how many downloads went through.
            if(downloadCount > 0) {
                browser.notifications.clear('sifty-working')
                note.message = 'Done! (' + downloadCount + ' saved)'
            }
            else {
                note.message = 'No media files to download'
            }

            notify(note)
        })
    })
}

function getTabsInWindow() {
    return browser.tabs.query({currentWindow: true})
}

function findMediaItemInTab(tab) {
    // Execute a script in the tab find and return
    // the source of the media item (e.g. a .jpeg,
    // .webm, .mp3 file) in the tab. if any exists.
    return browser.tabs.executeScript(
        tab.id,
        {file: '/content_scripts/getItem.js'}
    ).then((items) => {
        return {
            'tabId': tab.id,
            'src': !!items && !!items[0] > 0 ? items[0].src : null
        }
    }).catch((error) => {
        // This usually happens on about:* or resource:* pages, which
        // we can't execute content scripts on by design.
        console.log("Couldn't execute on " + tab.url + ", " + error)
        return null
    })
}

// Timeout defaults to 2 sec, set to 0 to not timeout.
function notify(note) {
    browser.notifications.create(note.id, {
        'type': 'basic',
        'iconUrl': browser.extension.getURL('icons/sifty.svg'),
        'title': 'Save Items From Tabs, Yo!',
        'message': note.message
    })

    var timeoutInMs = (typeof note.timeoutInMs !== 'undefined') ? note.timeoutInMs : 2000
    if(timeoutInMs !== 0) {
        setTimeout(function() {
            browser.notifications.clear(note.id)
        }, timeoutInMs)
    }
}

// Clean the query string parameters, hostname, and any
// characters that tend to break filepaths.
function getFilenameFromUrl(url) {
    var result = url.substring(0, (url.indexOf('#') == -1 ? url.length : url.indexOf('#')))
    result = result.substring(0, (url.indexOf('?') == -1 ? url.length : url.indexOf('?')))
    result = result.substring(result.lastIndexOf('/') + 1, url.length)
    result = result.replace(/[|\\/&:$%@!"<>()^+=?*,]/g, '_')
    return result
}

function downloadAll(mediaItems, callWhenComplete) {
    // Filter to tabs that had an item.
    mediaItems = mediaItems.filter(item => !!item && !!item.src)
    if(mediaItems.length <= 0) {
        // If there are no items, resolve with 0 downloads.
        return callWhenComplete(0)
    }
    
    // Otherwise we have items, tell user we're starting downloads.
    notify({
        id: 'sifty-working',
        message:'Downloading ' + mediaItems.length + ' files...',
        timeoutInMs: 0
    })

    // Create a bunch of download promises.
    var downloadsFinished = []
    for(let item of mediaItems) {
        var download = startDownload(item).then((downloadId) => {
            item.downloadId = downloadId
            return finishDownload(item)
        })
        downloadsFinished.push(download)
    }

    // When all the download promises are complete, resolve the
    // parent promise with the number of completed downloadsFinished.
    Promise.all(downloadsFinished).then((alldone) => {
        callWhenComplete(downloadsFinished.length)
    })
}

function startDownload(mediaItem) {
    return browser.downloads.download({
        url: mediaItem.src,
        filename: getFilenameFromUrl(mediaItem.src),
        conflictAction: 'uniquify',
        incognito: true
    })
}

// Call callback() when download with the given id completes.
function callWhenDownloadComplete(id, callback) {
    return function(delta) {
        if(id === delta.id && delta.state && 'complete' === delta.state.current) {
            callback()
        }
    }
}

// Finish the download by setting up the tab to close when the download completes.
function finishDownload(mediaItem) {
    return new Promise((resolve, reject) => {
        // The callback passed to callWhenDownloadComplete will
        // close the tab then resolve this promise.
        browser.downloads.onChanged.addListener(
            callWhenDownloadComplete(mediaItem.downloadId, function() {
                browser.tabs.remove(mediaItem.tabId)
                resolve(mediaItem.src)
            })
        )
    }).catch((error) => {
        console.log("Couldn't download: " + error)
        return null
    })
}
