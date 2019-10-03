import TestHelper from '../utils/TestHelper.js';

describe("Download integration tests:", () => {
    afterEach(async function(){
        TestHelper.closeAllTabsExceptTestPages();
    })

    it("Tabs should close after downloaded", async () => {
        let tabsBefore = await browser.tabs.query({currentWindow: true})
        let numTabsBefore = tabsBefore.length

        await TestHelper.openMediaItemsInTabs()

        let finishedDownloads = await TestHelper.downloadUsingSifty()

        let tabsAfter = await browser.tabs.query({currentWindow: true})
        let numTabsAfter = tabsAfter.length
        expect(numTabsAfter).toEqual(numTabsBefore)

        TestHelper.clearDownloads(finishedDownloads)
    })

    it("Downloads complete", async () => {
        let mediaItemUrls = await TestHelper.openMediaItemsInTabs()

        let finishedDownloads = await TestHelper.downloadUsingSifty()

        expect(finishedDownloads.length).toEqual(mediaItemUrls.length)
        let downloadUrls = []
        for (let download of finishedDownloads) {
            downloadUrls.push(download.src)
        }
        for (let url of mediaItemUrls) {
            expect(downloadUrls).toContain(url)
        }
        
        TestHelper.clearDownloads(finishedDownloads)
    })
})
