// PWA and Service Worker management
import { Workbox } from 'workbox-window';

export async function registerServiceWorker() {
  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      console.log('✅ Service Worker registered');

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000);

      // Handle new version available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            notifyAppUpdate();
          }
        });
      });

      return registration;
    }
  } catch (error) {
    console.warn('Service Worker registration failed:', error);
  }
}

function notifyAppUpdate() {
  const banner = document.createElement('div');
  banner.className = 'update-banner';
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');
  banner.innerHTML = `
    <p>A new version is available!</p>
    <button onclick="window.location.reload()">Refresh</button>
  `;
  
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('show'), 100);
}

// Auto-update check
export function setupAutoUpdate() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      // Check for updates on page focus
      window.addEventListener('focus', () => {
        registration.update();
      });

      // Periodic check
      setInterval(() => {
        registration.update();
      }, 60000);
    });
  }
}

// Install PWA prompt handling
export function setupInstallPrompt() {
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ App installed to home screen');
  });

  function showInstallButton() {
    const btn = document.getElementById('install-btn');
    if (btn) {
      btn.style.display = 'block';
      btn.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const outcome = await deferredPrompt.userChoice;
          if (outcome.outcome === 'accepted') {
            deferredPrompt = null;
            btn.style.display = 'none';
          }
        }
      });
    }
  }
}
