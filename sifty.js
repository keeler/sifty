function processTabs() {
    getTabs().then((tabs) => {
        for(var tab of tabs) {
            processTab(tab);
        }
    });
}

function processTab(tab) {
    browser.tabs.executeScript(
        tab.id,
        {file: '/content_scripts/getImage.js'}
    ).then((images) => {
        if(!images || !images[0]) {
            return;
        }

        for(var img of images) {
            console.log('Found ' + img.src);
            downloadImage(img.src, function() {closeTab(tab.id);});
        }
    });
}

function getFilenameFromUrl(url) {
    var result = url.substring(0, (url.indexOf('#') == -1 ? url.length : url.indexOf('#')));
    result = result.substring(0, (url.indexOf('?') == -1 ? url.length : url.indexOf('?')));
    result = result.substring(result.lastIndexOf('/') + 1, url.length);
    result = result.replace(/[|\\/&;:$%@!"<>()^+=?*,]/g, '_');
    return result;
}

function downloadImage(imgSrc, completedCallback) {
    var filename = getFilenameFromUrl(imgSrc)
    browser.downloads.download({
        url: imgSrc,
        filename: filename,
        conflictAction: 'uniquify',
        incognito: true
    }).then((id) => {
        console.log('Download of ' + imgSrc + ' started...');
        browser.downloads.onChanged.addListener(waitForDownloadComplete(id, completedCallback));
    });
}

function waitForDownloadComplete(id, callback) {
    return function(delta) {
        if(id === delta.id && delta.state && 'complete' === delta.state.current) {
            console.log('Download of ' + delta.url + ' complete!');
            callback();
        }
    }
}

function closeTab(tabId) {
    browser.tabs.remove(tabId);
}

function getTabs() {
    return browser.tabs.query({currentWindow: true});
}

browser.browserAction.onClicked.addListener(processTabs);
