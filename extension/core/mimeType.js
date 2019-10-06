import * as _ from 'lodash'

const MimeType = {}

MimeType.getFileExtension = function (mimeType) {
  return mimeTypeToExtensionMap[mimeType]
}

MimeType.isSupported = function (mimeType) {
  return _.has(mimeTypeToExtensionMap, mimeType)
}

// Thanks nginx! https://github.com/nginx/nginx/blob/master/conf/mime.types
const mimeTypeToExtensionMap = {
  'text/html': 'html',
  'text/css': 'css',
  'text/xml': 'xml',
  'text/mathml': 'mml',
  'text/plain': 'txt',
  'text/vnd.sun.j2me.app-descriptor': 'jad',
  'text/vnd.wap.wml': 'wml',
  'text/x-component': 'htc',

  'image/gif': 'gif',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
  'image/tiff': 'tif',
  'image/vnd.wap.wbmp': 'wbmp',
  'image/webp': 'webp',
  'image/x-icon': 'ico',
  'image/x-jng': 'jng',
  'image/x-ms-bmp': 'bmp',

  'application/javascript': 'js',
  'application/atom+xml': 'atom',
  'application/rss+xml': 'rss',
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

  'video/3gpp': '3gpp',
  'video/mp2t': 'ts',
  'video/mp4': 'mp4',
  'video/mpeg': 'mpeg',
  'video/quicktime': 'mov',
  'video/webm': 'webm',
  'video/x-flv': 'flv',
  'video/x-m4v': 'm4v',
  'video/x-mng': 'mng',
  'video/x-ms-asf': 'asx',
  'video/x-ms-wmv': 'wmv',
  'video/x-msvideo': 'avi'
}

export default MimeType
