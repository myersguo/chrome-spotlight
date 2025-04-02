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

  if (request.action === "aiChat") {
    const { messages, settings } = request;
    
    if (!settings.aiChatEnabled || !settings.aiChatApiKey) {
      sendResponse({ error: "AI Chat is not properly configured" });
      return true;
    }
    
    let apiUrl, requestBody, headers;
    
    // Configure request based on provider
    switch (settings.aiChatProvider) {
      case 'gemini':
        apiUrl = `${settings.aiChatApiUrl}/models/${settings.aiChatModel}:generateContent?key=${settings.aiChatApiKey}`;
        
        const geminiMessages = messages.map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        }));
        
        requestBody = JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        });
        
        headers = {
          'Content-Type': 'application/json'
        };
        break;
        
      case 'openai':
        apiUrl = `${settings.aiChatApiUrl}/chat/completions`;
        
        requestBody = JSON.stringify({
          model: settings.aiChatModel,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1024
        });
        
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.aiChatApiKey}`
        };
        break;
        
      case 'claude':
        apiUrl = `${settings.aiChatApiUrl}/messages`;
        
        const systemMessage = messages.find((msg: any) => msg.role === 'system');
        const userAssistantMessages = messages.filter((msg: any) => msg.role !== 'system');
        
        requestBody = JSON.stringify({
          model: settings.aiChatModel,
          messages: userAssistantMessages,
          system: systemMessage?.content || undefined,
          temperature: 0.7,
          max_tokens: 1024
        });
        
        headers = {
          'Content-Type': 'application/json',
          'x-api-key': settings.aiChatApiKey,
          'anthropic-dangerous-direct-browser-access': 'true',
        };
        break;
      case 'volcengine':
        apiUrl = `${settings.aiChatApiUrl}/api/v3/chat/completions`
        requestBody = JSON.stringify({
          messages: messages,
          model: settings.aiChatModel,
        });
        
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.aiChatApiKey}`
        };
        break;
      case 'custom':
        apiUrl = settings.aiChatApiUrl;
        
        requestBody = JSON.stringify({
          messages: messages,
          model: settings.aiChatModel,
          temperature: 0.7,
          max_tokens: 1024
        });
        
        headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${settings.aiChatApiKey}`
        };
        break;
        
      default:
        sendResponse({ error: "Unknown AI provider" });
        return true;
    }
    
    fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: requestBody
    })
      .then(response => {
        if (!response.ok) {
          return response.text().then(text => {
            throw new Error(`API error (${response.status}): ${text}`);
          });
        }
        return response.json();
      })
      .then(data => {
        let responseContent = '';
        
        switch (settings.aiChatProvider) {
          case 'gemini':
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
              responseContent = data.candidates[0].content.parts[0].text;
            }
            break;
            
          case 'openai':
            if (data.choices && data.choices[0] && data.choices[0].message) {
              responseContent = data.choices[0].message.content;
            }
            break;
            
          case 'claude':
            if (data.content && data.content[0] && data.content[0].text) {
              responseContent = data.content[0].text;
            }
            break;
          case 'custom':
          case 'volcengine':
            if (data.choices && data.choices[0] && data.choices[0].message) {
              responseContent = data.choices[0].message.content; 
            } else if (data.response) {
              responseContent = data.response; 
            } else if (data.content) {
              responseContent = typeof data.content === 'string' ? data.content : JSON.stringify(data.content);
            } else {
              responseContent = "Received a response but couldn't parse it. Please check the custom API format.";
            }
            break;
        }
        
        if (responseContent) {
          sendResponse({
            message: {
              role: 'assistant',
              content: responseContent
            }
          });
        } else {
          sendResponse({ 
            error: "Received an empty or invalid response from the AI provider" 
          });
        }
      })
      .catch(error => {
        console.error("AI Chat error:", error);
        sendResponse({ error: error.message });
      });
      
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
