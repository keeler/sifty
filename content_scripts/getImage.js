(function() {
    function getImage() {
        if(0 === document.contentType.indexOf("image")) {
            return { src: document.URL };
        }
        return null;
    }

    function processThisTab() {
        var img = getImage();
        if(!img) {
            return null;
        }
        return img;
    }

    return processThisTab();
})();
