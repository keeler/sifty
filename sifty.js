// Wait for the user to click the button in their toolbar.
browser.browserAction.onClicked.addListener(processTabs)

function getTabsInWindow() {
    return browser.tabs.query({currentWindow: true})
}

function findImagesInTab(tab) {
    // Execute a content script in the tab which
    // returns the img src within (if any).
    return browser.tabs.executeScript(
        tab.id,
        {file: '/content_scripts/getImage.js'}
    ).then((images) => {
        return {
            'tabId': tab.id,
            'imgSrc': !!images && !!images[0] > 0 ? images[0].src : null
        }
    }).catch((error) => {
        // This usually happens on about:* or resource:* pages, which
        // we can't execute content scripts on by design.
        console.log("Couldn't execute on " + tab.url + ", " + error)
        return null
    })
}

function processTabs() {
    // Get all tabs in current window.
    getTabsInWindow().then((tabs) => {
        // Search tabs for images
        var findPromises = []
        for(var tab of tabs) {
            findPromises.push(findImagesInTab(tab))
        }

        // Make a promise for all the downloads to complete.
        var downloadsComplete = new Promise((resolveDownloadsComplete, reject) => {
            Promise.all(findPromises).then((imageTabs) => {
                // Filter to tabs that had an image.
                var imgTabs = imageTabs.filter(tab => !!tab && !!tab.imgSrc)
                if(imgTabs.length <= 0) {
                    // If there are no images, resolve with 0 downloads.
                    return resolveDownloadsComplete(0)
                }
                
                // Otherwise we have images, tell user we're starting downloads.
                notify({
                    id: 'sifty-working',
                    message:'Downloading ' + imgTabs.length + ' files...',
                    timeoutInMs: 0
                })

                // Create a bunch of download promises.
                var downloads = []
                for(let t of imgTabs) {
                    var download = startDownload(t).then((downloadId) => {
                        t.downloadId = downloadId
                        return finishDownload(t)
                    })
                    downloads.push(download)
                }

                // When all the download promises are complete, resolve the
                // parent promise with the number of completed downloads.
                Promise.all(downloads).then((alldone) => {
                    resolveDownloadsComplete(downloads.length)
                })
            })
        })
        
        // Wait for all the downloads to complete.
        downloadsComplete.then((downloadCount) => {
            var note = {
                id: 'sifty-finished',
                timeoutInMs: 1500
            }

            // Tell user how many downloads went through.
            if(downloadCount > 0) {
                browser.notifications.clear('sifty-working')
                note.message = 'Done! (' + downloadCount + ' saved)'
            }
            else {
                note.message = 'No images found.'
            }

            notify(note)
        })
    })
}

// Timeout defaults to 2 sec, set to 0 to not timeout.
function notify(note) {
    browser.notifications.create(note.id, {
        'type': 'basic',
        'iconUrl': browser.extension.getURL('icons/sifty.svg'),
        'title': 'Save Images From Tabs, Yo!',
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

function startDownload(tabImg) {
    return browser.downloads.download({
        url: tabImg.imgSrc,
        filename: getFilenameFromUrl(tabImg.imgSrc),
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
function finishDownload(tabImg) {
    return new Promise((resolve, reject) => {
        // The callback passed to callWhenDownloadComplete will
        // close the tab then resolve this promise.
        browser.downloads.onChanged.addListener(callWhenDownloadComplete(tabImg.downloadId, function() {
            browser.tabs.remove(tabImg.tabId)
            resolve(tabImg.imgSrc)
        }))
    }).catch((error) => {
        console.log("Couldn't download: " + error)
        return null
    })
}
