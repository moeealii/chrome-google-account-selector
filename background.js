
const setting = getSettings((setting) => {
  setListeners(setting?.links, setting?.newUrls)
})



function  getSettings(callback){
  const get = chrome.storage.sync.get(null, (items) => {
    // Pass any observed errors down the promise chain.
    if (chrome.runtime.lastError) {
      return reject(chrome.runtime.lastError);
    }
    // Pass the data retrieved from storage down the promise chain.

    const links = items
    const newUrls = []
    Object.keys(links).forEach((value => {
      newUrls.push({ hostEquals: value })
    }))
    const result = {links, newUrls}
    callback(chrome.runtime.lastError ? null : result)
  });
}


chrome.storage.onChanged.addListener(function (changes, namespace) {
  getSettings((setting) => {
    setListeners(setting?.links, setting?.newUrls)
  })
});

function setListeners( authSettings, hostUrls ) {
  console.info("called");
  if (hostUrls) {
    chrome.webNavigation.onCommitted.addListener(
      function ({ url: currentUrl }) {
        var urlHost = new URL(currentUrl);
        if (!currentUrl.match('authuser') && authSettings[urlHost.hostname]) {
          chrome.tabs.query({ currentWindow: true, active: true },
            function (tabs) {
              const tab = tabs[0];
              const separator = currentUrl.match("\\?") ? "&" : "?";
              const destination = `${currentUrl}${separator}authuser=${authSettings[urlHost.hostname]}`;
              console.info(`Redirected from ${currentUrl} to ${destination}`);
              chrome.tabs.update(tab.id, { url: destination });
            });
        }
      }, { url: hostUrls });
  }
}