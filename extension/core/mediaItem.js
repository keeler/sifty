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
  const sansAnchor = trimAfter(url, '#')
  const sansQuery = trimAfter(sansAnchor, '?')
  const filename = everythingAfter(sansQuery, '/')
  return replaceIllegalFilenameChars(filename)
}

function trimAfter (originalString, stringToFind) {
  const index = originalString.indexOf(stringToFind)
  return index === -1 ? originalString : originalString.substring(0, index)
}

function everythingAfter (originalString, stringToFind) {
  const index = originalString.lastIndexOf(stringToFind)
  return originalString.substring(index + 1, originalString.length)
}

function replaceIllegalFilenameChars (filename) {
  return filename.replace(/[|\\/&:$%@!"<>()^+=?*,]/g, '_')
}

function getExtensionFromFilename (filename) {
  return everythingAfter(filename, '.')
}

function cleanExtensionBasedOnMimeType (filename, mimeType) {
  const givenExtension = getExtensionFromFilename(filename)
  const mimeExtension = MimeType.getFileExtension(mimeType)

  const filenameWithoutExtension = everythingBefore(filename, `.${givenExtension}`)
  if (_.isNil(filenameWithoutExtension) ||
      _.isEmpty(filenameWithoutExtension)) {
    throw new Error('Filename cannot be empty.')
  }
  return `${filenameWithoutExtension}.${mimeExtension}`
}

function everythingBefore (originalString, stringToFind) {
  const index = originalString.lastIndexOf(stringToFind)
  return originalString.substring(0, index)
}

export default MediaItem
