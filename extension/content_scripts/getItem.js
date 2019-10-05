(async function () {
  const supportedMimeTypes = [
    'image',
    'video',
    'audio'
  ]

  // Grab the source of the media file (image, video, audio, etc.)
  function getItem () {
    for (var mimeType of supportedMimeTypes) {
      if (document.contentType.indexOf(mimeType + '/') === 0) {
        return {
          src: document.URL,
          mimeType: document.contentType
        }
      }
    }

    return null
  }

  function processThisTab () {
    var mediaItem = getItem()
    if (!mediaItem) {
      return null
    }
    return mediaItem
  }

  return processThisTab()
})()
