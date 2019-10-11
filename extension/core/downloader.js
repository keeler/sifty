import * as _ from 'lodash'

import Notify from './notify'

const Downloader = {}

Downloader.downloadMediaItems = async function (mediaItemPromises) {
  const mediaItems = await mediaItemPromises
  if (mediaItems.length <= 0) {
    return []
  }

  Notify.workInProgress(mediaItems.length)
  const downloadsComplete = downloadAll(mediaItems)

  return await Promise.all(downloadsComplete).then((completeDownloads) => {
    Notify.workComplete(completeDownloads.length)
    return completeDownloads
  })
}

function downloadAll (mediaItems) {
  return _.map(mediaItems, (item) => {
    return item.downloadAndCloseTab()
  })
}

export default Downloader
