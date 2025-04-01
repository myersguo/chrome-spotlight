chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({
    translateSourceLang: 'auto',
    translateTargetLang: 'en',
    translateApiKey: '',
    translateService: 'google'
  }, (items) => {
    chrome.storage.sync.set(items);
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "getTabs") {
    chrome.tabs.query({}, (tabs) => {
      sendResponse({ tabs });
    });
    return true;
  }
  
  if (request.action === "getBookmarks") {
    chrome.bookmarks.search(request.query, (bookmarks) => {
      sendResponse({ bookmarks });
    });
    return true;
  }
  
  if (request.action === "getHistory") {
    chrome.history.search({
      text: request.query,
      maxResults: 20
    }, (historyItems) => {
      sendResponse({ historyItems });
    });
    return true;
  }
  
  if (request.action === "openTab") {
    chrome.tabs.update(request.tabId, { active: true });
    chrome.windows.update(request.windowId, { focused: true });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === "openUrl") {
    chrome.tabs.create({ url: request.url });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === "translate") {
    // Get translation settings from storage
    chrome.storage.sync.get({
      translateSourceLang: 'auto',
      translateTargetLang: 'en',
      translateApiKey: '',
      translateService: 'google'
    }, (settings) => {
      const sourceLang = request.sourceLang || settings.translateSourceLang;
      const targetLang = request.targetLang || settings.translateTargetLang;
      const text = request.text;
      
      if (settings.translateService === 'google') {
        // Use Google Translate free API
        fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`)
          .then(response => response.json())
          .then(data => {
            const translation = data[0][0][0];
            sendResponse({ 
              translation,
              sourceLang,
              targetLang
            });
          })
          .catch(error => {
            sendResponse({ error: error.message });
          });
      } else if (settings.translateService === 'googlecloud' && settings.translateApiKey) {
        // Use Google Cloud Translation API
        const url = `https://translation.googleapis.com/language/translate/v2?key=${settings.translateApiKey}`;
        
        fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            target: targetLang,
            format: 'text'
          })
        })
          .then(response => response.json())
          .then(data => {
            if (data.error) {
              sendResponse({ error: data.error.message || "Translation error" });
            } else if (data.data && data.data.translations && data.data.translations.length > 0) {
              sendResponse({ 
                translation: data.data.translations[0].translatedText,
                sourceLang: data.data.translations[0].detectedSourceLanguage || sourceLang,
                targetLang
              });
            } else {
              sendResponse({ error: "Invalid response from Google Cloud Translation API" });
            }
          })
          .catch(error => {
            sendResponse({ error: error.message });
          });
      } else {
        sendResponse({ error: "Translation service not properly configured" });
      }
    });
    return true;
  }
  
  if (request.action === "getTranslationSettings") {
    chrome.storage.sync.get({
      translateSourceLang: 'auto',
      translateTargetLang: 'en',
      translateService: 'google'
    }, (settings) => {
      sendResponse(settings);
    });
    return true;
  }
  if (request.action === "openOptionsPage") {
    const optionsPageUrl = chrome.runtime.getURL('options.html');
    chrome.tabs.create({ url: optionsPageUrl });
    sendResponse({ success: true });
    return true;
  }
});

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-spotlight") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id!, { action: "toggleSpotlight" });
      }
    });
  }
});
