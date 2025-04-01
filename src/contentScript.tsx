import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import './contentStyle.css';

let spotlightRoot: HTMLDivElement | null = null;
let reactRoot: ReactDOM.Root | null = null;

// Create spotlight container
function createSpotlight() {
  if (spotlightRoot) return;
  
  spotlightRoot = document.createElement('div');
  spotlightRoot.id = 'chrome-spotlight-root';
  document.body.appendChild(spotlightRoot);
  
  reactRoot = ReactDOM.createRoot(spotlightRoot);
  reactRoot.render(<App onClose={closeSpotlight} />);
}

function closeSpotlight() {
  if (spotlightRoot && reactRoot) {
    reactRoot.unmount();
    document.body.removeChild(spotlightRoot);
    spotlightRoot = null;
    reactRoot = null;
  }
}

function toggleSpotlight() {
  if (spotlightRoot) {
    closeSpotlight();
  } else {
    createSpotlight();
  }
}

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "toggleSpotlight") {
    toggleSpotlight();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && spotlightRoot) {
    closeSpotlight();
  }
});

document.addEventListener('click', (event) => {
  if (spotlightRoot && !spotlightRoot.contains(event.target as Node)) {
    closeSpotlight();
  }
});
