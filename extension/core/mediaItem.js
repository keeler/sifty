import * as _ from 'lodash'

import MimeType from './mimeType'

class MediaItem {
  constructor (sourceUrl, mimeType, tabId) {
    this.src = sourceUrl
    this.tabId = tabId
    this.mimeType = mimeType
  }

  getLocalFilename () {
    const url = this.src
    const mimeType = this.mimeType
    const rawFilename = getFilenameFromUrl(url)
    return cleanExtensionBasedOnMimeType(rawFilename, mimeType)
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

export default MediaItem
