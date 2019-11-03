import * as _ from 'lodash'

import Notify from './notify'

const Downloader = {}

Downloader.downloadMediaItems = async function (mediaItemPromises) {
  const mediaItems = await mediaItemPromises
  if (mediaItems.length <= 0) {
    return []
  }

  Notify.workInProgress(mediaItems.length)
  return downloadAll(mediaItems).then((completeDownloads) => {
    Notify.workComplete(completeDownloads.length)
    return completeDownloads
  })
}

function downloadAll (mediaItems) {
  const downloads = _.map(mediaItems, (item) => {
    return item.downloadAndCloseTab()
  })
  return Promise.all(downloads)
}

export default Downloader
