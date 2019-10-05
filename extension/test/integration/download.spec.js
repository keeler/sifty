import TestHelper from '../utils/TestHelper.js'

// For linter to be quiet.
/* global describe, afterEach, it, expect */

describe('Download integration tests:', () => {
  afterEach(async function () {
    TestHelper.closeAllTabsExceptTestPages()
  })

  it('Tabs should close after downloaded', async () => {
    console.log(TestHelper)
    const tabsBefore = await browser.tabs.query({ currentWindow: true })
    const numTabsBefore = tabsBefore.length

    await TestHelper.openMediaItemsInTabs()

    const finishedDownloads = await TestHelper.downloadUsingSifty()

    const tabsAfter = await browser.tabs.query({ currentWindow: true })
    const numTabsAfter = tabsAfter.length
    expect(numTabsAfter).toEqual(numTabsBefore)

    TestHelper.clearDownloads(finishedDownloads)
  })

  it('Downloads complete', async () => {
    const mediaItemUrls = await TestHelper.openMediaItemsInTabs()

    const finishedDownloads = await TestHelper.downloadUsingSifty()

    expect(finishedDownloads.length).toEqual(mediaItemUrls.length)
    const downloadUrls = []
    for (const download of finishedDownloads) {
      downloadUrls.push(download.src)
    }
    for (const url of mediaItemUrls) {
      expect(downloadUrls).toContain(url)
    }

    TestHelper.clearDownloads(finishedDownloads)
  })
})
