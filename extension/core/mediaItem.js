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
    if (!ext || ext !== mimeTypeToExtension[mimeType]) {
      result = result + '.' + mimeTypeToExtension[mimeType]
    }

    return result
  }
}

// Thanks nginx! https://github.com/nginx/nginx/blob/master/conf/mime.types
const mimeTypeToExtension = {
  'text/html': 'html',
  'text/css': 'css',
  'text/xml': 'xml',
  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'application/javascript': 'js',
  'application/atom+xml': 'atom',
  'application/rss+xml': 'rss',
  'text/mathml': 'mml',
  'text/plain': 'txt',
  'text/vnd.sun.j2me.app-descriptor': 'jad',
  'text/vnd.wap.wml': 'wml',
  'text/x-component': 'htc',

  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tif',
  'image/vnd.wap.wbmp': 'wbmp',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/x-jng': 'jng',
  'image/x-ms-bmp': 'bmp',

  'application/font-woff': 'woff',
  'application/java-archive': 'jar',
  'application/json': 'json',
  'application/mac-binhex40': 'hqx',
  'application/msword': 'doc',
  'application/pdf': 'pdf',
  'application/postscript': 'ps',
  'application/rtf': 'rtf',
  'application/vnd.apple.mpegurl': 'm3u8',
  'application/vnd.google-earth.kml+xml': 'kml',
  'application/vnd.google-earth.kmz': 'kmz',
  'application/vnd.ms-excel': 'xls',
  'application/vnd.ms-fontobject': 'eot',
  'application/vnd.ms-powerpoint': 'ppt',
  'application/vnd.oasis.opendocument.graphics': 'odg',
  'application/vnd.oasis.opendocument.presentation': 'odp',
  'application/vnd.oasis.opendocument.spreadsheet': 'ods',
  'application/vnd.oasis.opendocument.text': 'odt',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/x-7z-compressed': '7z',
  'application/x-rar-compressed': 'rar',
  'application/x-shockwave-flash': 'swf',
  'application/zip': 'zip',

  'audio/midi': 'mid',
  'audio/mpeg': 'mp3',
  'audio/ogg': 'ogg',
  'audio/x-m4a': 'm4a',
  'audio/x-realaudio': 'ra',

  'video/3gpp': '3gpp 3gp',
  'video/mp2t': 'ts',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg mpg',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-flv': 'flv',
  'video/x-m4v': 'm4v',
  'video/x-mng': 'mng',
  'video/x-ms-asf': 'asx asf',
  'video/x-ms-wmv': 'wmv',
  'video/x-msvideo': 'avi'
}

export default MediaItem
