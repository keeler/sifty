const TestHelper = {};

const mediaItemUrls = [
    browser.extension.getURL("/test/resources/dahlia.jpeg"),
    browser.extension.getURL("/test/resources/hummingbird.png"),
    browser.extension.getURL("/test/resources/fig.gif"),
    browser.extension.getURL("/test/resources/boat.webm"),
    browser.extension.getURL("/test/resources/walking.mp4"),
]

TestHelper.closeAllTabsExceptTestPages = async function() {
    let tabs = await browser.tabs.query({currentWindow: true})
    for (let tab of tabs) {
        if (tab.url !== browser.extension.getURL("/test/integration.html")) {
            await browser.tabs.remove(tab.id)
        }
    }
}

TestHelper.openMediaItemsInTabs = async function() {
    for (let url of mediaItemUrls) {
        await browser.tabs.create({
            url: url
        })
    }
    return mediaItemUrls;
}

TestHelper.clearDownloads = async function(finishedDownloads) {
    for (let download of finishedDownloads) {
        await browser.downloads.removeFile(download.downloadId)
        await browser.downloads.erase({id: download.downloadId})
    }
}

TestHelper.downloadUsingSifty = async function() {
    let finishedDownloads = await browser.runtime.sendMessage({
        message: "downloadMediaItems"
    }).then((response) => {
        return response.finishedDownloads
    }, (error) => {
        console.log(error)
    })
    return finishedDownloads
}

export default TestHelper