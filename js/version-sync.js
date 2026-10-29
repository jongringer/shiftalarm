/**
 * version-sync.js - 실시간 버전 동기화 및 조용한 자동 갱신 엔진
 */
(function() {
  'use strict';

  function cleanLegacyCaches() {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
          registrations.forEach(function(registration) {
            registration.unregister().catch(function() {});
          });
        }).catch(function() {});
      }
      if ('caches' in window) {
        caches.keys().then(function(names) {
          names.forEach(function(name) {
            caches.delete(name).catch(function() {});
          });
        }).catch(function() {});
      }
    } catch (e) {
      console.warn('[VersionSync] Cache cleanup skipped:', e);
    }
  }

  var isChecking = false;
  var isUpdating = false;

  function applyUpdate(buildTimestamp) {
    if (isUpdating) return;
    isUpdating = true;

    var cleanUrl = window.location.origin + window.location.pathname;
    var searchParams = new URLSearchParams(window.location.search);
    searchParams.set('_v', buildTimestamp || Date.now());
    var newUrl = cleanUrl + '?' + searchParams.toString();

    setTimeout(function() {
      window.location.replace(newUrl);
    }, 300);
  }

  function checkServerVersion() {
    if (isChecking || isUpdating) return;
    isChecking = true;

    var currentBuildTime = window.__BUILD_TIMESTAMP__ || 0;
    var fetchUrl = 'version.json?_t=' + Date.now();

    fetch(fetchUrl, {
      cache: 'no-store',
      headers: {
        'Pragma': 'no-cache',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
    .then(function(res) {
      if (!res.ok) throw new Error('version.json status ' + res.status);
      return res.json();
    })
    .then(function(data) {
      isChecking = false;
      if (!data || !data.buildTimestamp) return;

      var serverBuildTime = Number(data.buildTimestamp);
      if (currentBuildTime > 0 && serverBuildTime > currentBuildTime) {
        var activeEl = document.activeElement;
        var isTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

        if (isTyping) {
          activeEl.addEventListener('blur', function onBlur() {
            activeEl.removeEventListener('blur', onBlur);
            applyUpdate(serverBuildTime);
          });
        } else {
          applyUpdate(serverBuildTime);
        }
      }
    })
    .catch(function() {
      isChecking = false;
    });
  }

  cleanLegacyCaches();
  if (typeof window !== 'undefined') {
    setTimeout(checkServerVersion, 1000);

    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'visible') {
        checkServerVersion();
      }
    });

    window.addEventListener('focus', function() {
      checkServerVersion();
    });

    setInterval(checkServerVersion, 15000);
  }
})();
