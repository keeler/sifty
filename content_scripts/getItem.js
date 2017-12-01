(function() {
    supportedMimeTypes = [
        'image',
        'video',
        'audio'
    ]

    // Grab the source of the media file (image, video, audio, etc.)
    function getItem() {
        for(var mimeType of supportedMimeTypes){
            if(0 === document.contentType.indexOf(mimeType + '/')) {
                return {
                    src: document.URL,
                    mimeType: document.contentType
                }
            }
        }

        return null
    }

    function processThisTab() {
        var mediaItem = getItem()
        if(!mediaItem) {
            return null
        }
        return mediaItem
    }

    return processThisTab()
})()
