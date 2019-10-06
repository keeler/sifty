import MimeType from './mimeType'

class MediaItem {
  constructor (sourceUrl, mimeType, tabId) {
    this.src = sourceUrl
    this.tabId = tabId
    this.mimeType = mimeType
  }

  getLocalFilename () {
    // Clean the query string parameters, hostname, and any
    // characters that tend to break filepaths.
    var url = this.src
    var mimeType = this.mimeType
    var result = url.substring(0, (url.indexOf('#') === -1 ? url.length : url.indexOf('#')))
    result = result.substring(0, (result.indexOf('?') === -1 ? result.length : result.indexOf('?')))
    result = result.substring(result.lastIndexOf('/') + 1, url.length)
    result = result.replace(/[|\\/&:$%@!"<>()^+=?*,]/g, '_')

    // Get the file extension, if there is one.
    var a = result.split('.')
    var ext = ''
    if (!(a.length === 1 || (a[0] === '' && a.length === 2))) {
      ext = a.pop()
    }

    // If the filename inferred from the URL doesn't have an extension,
    // infer the extension from the mime type.
    const extension = MimeType.getFileExtension(mimeType)
    if (!ext || ext !== extension) {
      result = result + '.' + extension
    }

    return result
  }
}

export default MediaItem
