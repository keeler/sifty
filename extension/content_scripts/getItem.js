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

    return {}
  }

  browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'getItem') {
      sendResponse(getItem())
    }
    // Return true so sendResponse() can be asynchronous.
    // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/onMessage#Sending_an_asynchronous_response_using_sendResponse
    return true
  })
})()
