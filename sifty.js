browser.browserAction.onClicked.addListener(processTabs);

function processTabs() {
    getTabs().then((tabs) => {
        var findPromises = []
        for(var tab of tabs) {
            findPromises.push(findImagesInTab(tab));
        }

        var downloadsComplete = new Promise((resolve, reject) => {
            Promise.all(findPromises).then((imageTabs) => {
                var imgTabs = imageTabs.filter(tab => !!tab && !!tab.imgSrc);
                if(imgTabs.length <= 0) {
                    notify('sifty-finished', 'No images found.');
                    return;
                }
                
                notify('sifty-working', 'Downloading ' + imgTabs.length + ' files...', 1000);

                var downloads = [];
                for(var i = 0; i < imgTabs.length; i++) {
                    let t = imgTabs[i];
                    console.log(t);
                    var download = startDownload(t).then((downloadId) => {
                        t.downloadId = downloadId;
                        return finishDownload(t);
                    });
                    downloads.push(download);
                }

                Promise.all(downloads).then((blah) => {resolve(downloads.length);});
            })
        });
        

        downloadsComplete.then((count) => {
            notify('sifty-finished', 'Done! (' + count + ' saved)', 4000);
        });
    });
}

// Timeout defaults to 2 sec, set to 'notimeout' to not timeout.
function notify(id, message, timeoutInMs) {
    browser.notifications.create(id, {
        'type': 'basic',
        'iconUrl': browser.extension.getURL('icons/sifty.svg'),
        'title': 'Save Images From Tabs, Yo!',
        'message': message
    });

    timeoutInMs = (typeof timeoutInMs !== 'undefined') ? timeoutInMs : 2000;
    if(timeoutInMs !== 'notimeout') {
        setTimeout(function() {
            browser.notifications.clear(id);
        }, timeoutInMs);
    }
}

function findImagesInTab(tab) {
    return browser.tabs.executeScript(
        tab.id,
        {file: '/content_scripts/getImage.js'}
    ).then((images) => {
        return {
            'tabId': tab.id,
            'imgSrc': !!images && !!images[0]  > 0 ? images[0].src : null
        };
    }).catch((error) => {
        console.log("Couldn't execute on " + tab.url + ", " + error);
        return null;
    });
}

function getFilenameFromUrl(url) {
    var result = url.substring(0, (url.indexOf('#') == -1 ? url.length : url.indexOf('#')))
    result = result.substring(0, (url.indexOf('?') == -1 ? url.length : url.indexOf('?')));
    result = result.substring(result.lastIndexOf('/') + 1, url.length);
    result = result.replace(/[|\\/&;:$%@!"<>()^+=?*,]/g, '_');
    return result;
}

function startDownload(tabImg) {
    var filename = getFilenameFromUrl(tabImg.imgSrc)
    return browser.downloads.download({
        url: tabImg.imgSrc,
        filename: filename,
        conflictAction: 'uniquify',
        incognito: true
    });
}

function waitForDownloadComplete(id, callback) {
    return function(delta) {
        if(id === delta.id && delta.state && 'complete' === delta.state.current) {
            console.log(delta.id + ' complete')
            callback();
        }
    }
}

function finishDownload(tabImg) {
    console.log('dl id: ' + tabImg.tabId + ' ' + tabImg.downloadId);
    return new Promise((resolve, reject) => {
        console.log('promise finish ' + tabImg.downloadId);
        browser.downloads.onChanged.addListener(waitForDownloadComplete(tabImg.downloadId, function() {
            browser.tabs.remove(tabImg.tabId);
            console.log('resolve ' + tabImg.downloadId);
            resolve(tabImg.imgSrc);
        }));
    }).catch((error) => {
        console.log("Couldn't download cause " + error);
        return null;
    });
}

function getTabs() {
    return browser.tabs.query({currentWindow: true});
}
