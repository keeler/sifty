import * as _ from 'lodash'

import TestHelper from '../utils/TestHelper.js'

// For linter to be quiet.
/* global describe, afterEach, it, expect */

describe('Download integration tests:', () => {
  afterEach(async function () {
    TestHelper.closeAllTabsExceptTestPages()
  })

  it('Tabs should close after downloaded', async () => {
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
    const downloadUrls = _.map(finishedDownloads, 'src')
    _.forEach(mediaItemUrls, (url) => {
      expect(downloadUrls).toContain(url)
    })

    TestHelper.clearDownloads(finishedDownloads)
  })
})
