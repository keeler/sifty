(async function () {
  const tabId = await browser.runtime.sendMessage({
    message: 'getTabId'
  }).then(response => {
    return response.tabId
  }, (error) => {
    console.log(error)
  })

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
          tabId: tabId,
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
