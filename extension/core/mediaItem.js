import * as _ from 'lodash'

import MimeType from './mimeType'

class MediaItem {
  constructor (sourceUrl, mimeType, tabId) {
    this.src = sourceUrl
    this.tabId = tabId
    this.mimeType = mimeType
    this.downloadId = -1
  }

  getLocalFilename () {
    const url = this.src
    const mimeType = this.mimeType
    const rawFilename = getFilenameFromUrl(url)
    return cleanExtensionBasedOnMimeType(rawFilename, mimeType)
  }

  downloadAndCloseTab () {
    return startDownload(this).then((downloadId) => {
      this.downloadId = downloadId
      return finishDownload(this)
    })
  }

  isValid () {
    return !_.isNil(this.src) &&
           !_.isNil(this.mimeType) &&
           !_.isNil(this.tabId)
  }
}

function getFilenameFromUrl (url) {
  const sansAnchor = trimAfterAndIncluding(url, '#')
  const sansQuery = trimAfterAndIncluding(sansAnchor, '?')
  const filename = trimBeforeAndIncluding(sansQuery, '/')
  return replaceIllegalFilenameChars(filename)
}

function trimAfterAndIncluding (str, substr) {
  const index = str.indexOf(substr)
  return index === -1 ? str : str.substring(0, index)
}

function trimBeforeAndIncluding (str, substr) {
  const index = str.lastIndexOf(substr)
  return index === -1 ? str : str.substring(index + 1, str.length)
}

function replaceIllegalFilenameChars (filename) {
  return filename.replace(/[|\\/&:$%@!"<>()^+=?*,]/g, '_')
}

function getExtensionFromFilename (filename) {
  return trimBeforeAndIncluding(filename, '.')
}

function cleanExtensionBasedOnMimeType (filename, mimeType) {
  const givenExtension = getExtensionFromFilename(filename)
  const mimeExtension = MimeType.getFileExtension(mimeType)

  const filenameWithoutExtension = trimAfterAndIncluding(filename, `.${givenExtension}`)
  if (_.isNil(filenameWithoutExtension) ||
      _.isEmpty(filenameWithoutExtension)) {
    throw new Error('Filename cannot be empty.')
  }
  return `${filenameWithoutExtension}.${mimeExtension}`
}

function startDownload (mediaItem) {
  return browser.downloads.download({
    url: mediaItem.src,
    filename: mediaItem.getLocalFilename(),
    conflictAction: 'uniquify',
    incognito: true
  })
}

// Finish the download by setting up the tab to close when the download completes.
function finishDownload (mediaItem) {
  return new Promise((resolve, reject) => {
    // The callback passed to callWhenDownloadComplete will
    // close the tab then resolve this promise.
    browser.downloads.onChanged.addListener(
      callWhenDownloadComplete(mediaItem.downloadId, function () {
        browser.tabs.remove(mediaItem.tabId)
        resolve(mediaItem)
      })
    )
  }).catch((error) => {
    console.log(error)
    return null
  })
}

// Call callback() when download with the given id completes.
function callWhenDownloadComplete (id, callback) {
  return function (delta) {
    if (id === delta.id && delta.state && delta.state.current === 'complete') {
      callback()
    }
  }
}

export default MediaItem
