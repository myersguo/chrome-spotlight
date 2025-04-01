
# Chrome Spotlight

Chrome Spotlight is a Spotlight-like search tool for Chrome that allows you to quickly search through your open tabs, bookmarks, and browsing history using an intuitive command palette. It is designed to enhance your browsing productivity and make navigation across your browsing data faster and more efficient.

## Features

- **Quick Access:** Search through open tabs, bookmarks, and history.
- **Keyboard Shortcut:** Easily toggle the Spotlight interface using `Ctrl+K` (or `Command+K` on macOS).
- **Seamless Integration:** Works across all websites with a content script that injects the search interface.
- **Customizable Options:** Configure settings via an options page.

## Installation

1. **Download or Clone the Repository:**
   ```bash
   git clone https://github.com/myersguo/chrome-spotlight.git
   ```
2. **Load the Extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`.
   - Enable **Developer mode** (toggle in the top right).
   - Click **Load unpacked** and select the directory containing the extension files.

## Usage

1. **Open Chrome Spotlight:**
   - Use the keyboard shortcut `Ctrl+K` (Windows/Linux) or `Command+K` (macOS) to toggle the Spotlight search interface.
2. **Search:**
   - Start typing to filter through your tabs, bookmarks, and history.
   - The search results will dynamically update based on your query.
3. **Select a Result:**
   - Use your mouse or arrow keys to navigate the results.
   - Click or press enter to open the selected item.
4. **Switch Categories:**
   - The interface displays three horizontally arranged tabs for **Tabs**, **Bookmarks**, and **History**.
   - Click on any category to view its corresponding results.



## File Structure

```
├── package-lock.json
├── package.json
├── src
│   ├── background.ts
│   ├── components
│   │   ├── App.tsx
│   │   ├── ResultItem.tsx
│   │   ├── ResultList.tsx
│   │   ├── SearchBar.tsx
│   │   └── TranslationResult.tsx
│   ├── contentScript.tsx
│   ├── contentStyle.css
│   ├── options.html
│   ├── options.tsx
│   ├── optionsStyle.css
│   └── types.ts
├── tsconfig.json
└── webpack.config.js
```

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

Distributed under the MIT License. See `LICENSE` for more information.
