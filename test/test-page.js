const waitInit = (async() => {
    const Background = await browser.runtime.getBackgroundPage();
    // Available everywhere
    window.Background = Background
})()

// Store the original start function from Jasmine
const currentWindowOnload = window.onload;

// Overload the event to first get the background
window.onload = async function() {
    await waitInit;

    if (currentWindowOnload) {
        currentWindowOnload();
    }
};

const queryString = new jasmine.QueryString({
    getWindowLocation: function() {
        return window.location;
    },
});
  
const specFilter = new jasmine.HtmlSpecFilter({
    filterString: function() {
        if (getUrlParameterValueByName("enable") !== 'true') {
            // A fake string that matches no test
            return "@@@@@@@";
        } else {
            // Normal behavior: "spec" value is a regex to filter the test names
            return queryString.getParam("spec")
        }
    },
});

const env = jasmine.getEnv();
env.specFilter = function(spec) {
    return specFilter.matches(spec.getFullName());
};
