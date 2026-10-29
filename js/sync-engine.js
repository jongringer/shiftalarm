/**
 * sync-engine.js - APK 마스터 전용 클라우드 자동 동기화 엔진 (v1.2.77)
 *
 * - 기본 모드 (ALLOW_WEB_TO_APK_SYNC = false):
 *   1) APK(어플)에서만 일정 변경/추가/삭제 시 클라우드로 자동 푸시됩니다.
 *   2) 웹 링크(kbs-4shift-5855.surge.sh)에서는 APK의 최신 근무표를 자동으로 받아와 표시하며,
 *      웹에서 APK로 역방향 변경하는 UI 및 전송 기능은 숨김/차단됩니다.
 * - 향후 웹 -> APK 양방향 변경이 필요할 경우 ALLOW_WEB_TO_APK_SYNC = true 로만 바꾸면 즉시 활성화됩니다.
 */
(function() {
  'use strict';

  // [전환 스위치] 필요 시 true로 변경하면 웹에서의 일정 수정 및 웹 -> APK 역방향 동기화가 즉시 활성화됨
  var ALLOW_WEB_TO_APK_SYNC = false;

  var TELEGRAPH_PATH = 'KBS-SHIFT-SYNC-10-29';
  var TELEGRAPH_TOKEN = 'cad37a8299f5f01af3cd742787193d2e28f317467f91bc42d3fff0317000';
  var TELEGRAPH_EDIT_URL = 'https://api.telegra.ph/editPage/' + TELEGRAPH_PATH;
  var TELEGRAPH_GET_URL = 'https://api.telegra.ph/getPage/' + TELEGRAPH_PATH + '?return_content=true';

  var lastKnownCloudTime = 0;
  var lastPushedTime = 0;
  var hasPendingPush = false;
  var currentPushPromise = null;
  var currentSyncPromise = null;
  var pushDebounceTimer = null;

  // 현재 실행 환경이 안드로이드 네이티브 APK(어플)인지 정확히 판별
  function isApkClient() {
    if (typeof window === 'undefined') return false;
    if (window.__FORCE_APK_MODE__ === true) return true;
    if (window.__FORCE_WEB_MODE__ === true) return false;
    if (typeof window.AndroidAlarm !== 'undefined') return true;
    if (window.Capacitor && typeof window.Capacitor.isNativePlatform === 'function' && window.Capacitor.isNativePlatform()) return true;
    if (window.location && window.location.hostname === 'localhost' && typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent || '')) return true;
    return false;
  }

  // 클라우드 전송(Push) 권한 여부 판별 (APK이거나 양방향 허용 스위치 켜진 경우만 true)
  function canPushToCloud() {
    return isApkClient() || ALLOW_WEB_TO_APK_SYNC;
  }

  // 웹 전용 열람 모드(수정 기능 숨김) 스타일 적용/해제
  function applyWebReadonlyMode() {
    if (typeof document === 'undefined' || !document.body) return;
    var styleId = 'web-readonly-mode-style';
    if (!document.getElementById(styleId)) {
      var styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = [
        'body.web-readonly-mode .day-schedule-add-box,',
        'body.web-readonly-mode .day-shift-edit-box,',
        'body.web-readonly-mode #btnResetDayEdit,',
        'body.web-readonly-mode #btnDeleteSelectedSchedules,',
        'body.web-readonly-mode .day-schedule-checkbox,',
        'body.web-readonly-mode .btn-delete-single-schedule,',
        'body.web-readonly-mode .monthly-note-delete-btn,',
        'body.web-readonly-mode .add-plus-icon,',
        'body.web-readonly-mode #btnOpenUpload,',
        'body.web-readonly-mode #btnOpenUploadModal {',
        '  display: none !important;',
        '}'
      ].join('\n');
      document.head.appendChild(styleEl);
    }

    if (!canPushToCloud()) {
      document.body.classList.add('web-readonly-mode');
    } else {
      document.body.classList.remove('web-readonly-mode');
    }
  }

  function getStorage() {
    if (typeof shiftStorage !== 'undefined' && shiftStorage) return shiftStorage;
    if (typeof window !== 'undefined' && window.shiftStorage) return window.shiftStorage;
    return null;
  }

  function spinSyncIcon() {
    if (typeof document === 'undefined') return;
    var icon = document.getElementById('syncIcon');
    if (icon) {
      icon.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      icon.style.transform = 'rotate(360deg)';
      setTimeout(function() {
        icon.style.transition = 'none';
        icon.style.transform = 'rotate(0deg)';
      }, 650);
    }
  }

  function refreshUI() {
    if (typeof window === 'undefined' || !window.app) return;
    try {
      if (typeof window.app.renderCalendar === 'function') window.app.renderCalendar();
      if (typeof window.app.renderTodayCard === 'function') window.app.renderTodayCard();
      if (typeof window.app.renderMonthlyNotes === 'function') window.app.renderMonthlyNotes();
      if (typeof window.app.renderScheduleList === 'function') window.app.renderScheduleList();
      if (typeof window.app.populateScheduleDateOptions === 'function') window.app.populateScheduleDateOptions();
      if (typeof window.app.renderUploadModalSpecialNotes === 'function') window.app.renderUploadModalSpecialNotes();
    } catch (e) {
      console.warn('[SyncEngine] UI 갱신 중 오류:', e);
    }
  }

  // 현재 로컬 스토리지 스냅샷을 클라우드로 전송 (APK 전용 또는 양방향 스위치 활성 시에만 동작)
  function pushToCloud() {
    if (!canPushToCloud()) {
      hasPendingPush = false;
      if (pushDebounceTimer) {
        clearTimeout(pushDebounceTimer);
        pushDebounceTimer = null;
      }
      return Promise.resolve(false);
    }

    if (pushDebounceTimer) {
      clearTimeout(pushDebounceTimer);
      pushDebounceTimer = null;
    }

    if (currentPushPromise) {
      return currentPushPromise.then(function() {
        var st = getStorage();
        var curT = st && st.getUpdatedAt ? st.getUpdatedAt() : 0;
        if (hasPendingPush || curT > lastPushedTime) {
          return pushToCloud();
        }
        return true;
      });
    }

    var storage = getStorage();
    if (!storage) return Promise.resolve(false);

    var localTime = storage.getUpdatedAt ? storage.getUpdatedAt() : Date.now();
    if (localTime <= lastKnownCloudTime) {
      localTime = Math.max(Date.now(), lastKnownCloudTime + 1);
      if (storage.setUpdatedAt) storage.setUpdatedAt(localTime);
    }

    var snapshot = {
      version: '1.2.77',
      updatedAt: localTime,
      overrides: storage.getOverrides ? storage.getOverrides() : {},
      schedules: storage.getSchedules ? storage.getSchedules() : []
    };

    var contentNodes = JSON.stringify([
      { tag: 'p', children: [JSON.stringify(snapshot)] }
    ]);

    var bodyStr = 'access_token=' + encodeURIComponent(TELEGRAPH_TOKEN) +
                  '&title=' + encodeURIComponent('KBS_SHIFT_SYNC') +
                  '&content=' + encodeURIComponent(contentNodes);

    var reqPromise = fetch(TELEGRAPH_EDIT_URL, {
      method: 'POST',
      keepalive: true,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: bodyStr
    })
    .then(function(res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    })
    .then(function(json) {
      currentPushPromise = null;
      if (json && json.ok) {
        lastKnownCloudTime = Math.max(lastKnownCloudTime, localTime);
        lastPushedTime = Math.max(lastPushedTime, localTime);
        var latestLocalTime = storage.getUpdatedAt ? storage.getUpdatedAt() : localTime;
        if (latestLocalTime <= localTime) {
          hasPendingPush = false;
        } else {
          return pushToCloud();
        }
        return true;
      }

      if (json && json.error && String(json.error).indexOf('FLOOD_WAIT_') === 0) {
        var waitSec = parseInt(String(json.error).replace('FLOOD_WAIT_', ''), 10) || 2;
        hasPendingPush = true;
        return new Promise(function(resolve) {
          setTimeout(function() {
            resolve(pushToCloud());
          }, (waitSec + 0.5) * 1000);
        });
      }

      hasPendingPush = true;
      return false;
    })
    .catch(function(err) {
      currentPushPromise = null;
      hasPendingPush = true;
      console.warn('[SyncEngine] 클라우드 전송 대기:', err.message);
      return false;
    });

    currentPushPromise = reqPromise;
    return reqPromise;
  }

  // 로컬에서 일정 변경 발생 시 즉각 호출 (APK에서만 클라우드 전송 예약)
  function pushNow() {
    if (!canPushToCloud()) {
      return Promise.resolve(false);
    }
    hasPendingPush = true;
    var storage = getStorage();
    if (storage && storage.getUpdatedAt && storage.setUpdatedAt) {
      var cur = storage.getUpdatedAt();
      if (cur <= lastKnownCloudTime) {
        storage.setUpdatedAt(Math.max(Date.now(), lastKnownCloudTime + 1));
      }
    }
    if (pushDebounceTimer) clearTimeout(pushDebounceTimer);
    pushDebounceTimer = setTimeout(function() {
      pushDebounceTimer = null;
      pushToCloud();
    }, 150);
  }

  // 클라우드에서 최신 스냅샷 조회 및 동기화
  function syncNow(isManualClick) {
    if (isManualClick) {
      spinSyncIcon();
    }

    var waitPush = Promise.resolve(true);
    if (canPushToCloud() && (pushDebounceTimer || hasPendingPush || currentPushPromise)) {
      waitPush = pushToCloud();
    }

    if (currentSyncPromise) {
      return currentSyncPromise.then(function() {
        return syncNow(isManualClick);
      });
    }

    var syncTask = waitPush
      .then(function() {
        var url = TELEGRAPH_GET_URL + '&_t=' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
        return fetch(url, { cache: 'no-store' });
      })
      .then(function(res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function(json) {
        if (!json || !json.ok || !json.result || !Array.isArray(json.result.content) || !json.result.content[0]) {
          throw new Error('Invalid cloud response');
        }

        var firstNode = json.result.content[0];
        var rawText = (firstNode.children && firstNode.children[0]) ? firstNode.children[0] : '';
        if (!rawText || typeof rawText !== 'string') {
          throw new Error('Empty cloud payload');
        }

        var cloudSnapshot = JSON.parse(rawText);
        var cloudTime = Number(cloudSnapshot.updatedAt || 0);
        lastKnownCloudTime = Math.max(lastKnownCloudTime, cloudTime);

        var storage = getStorage();
        if (!storage) return false;

        var localTime = storage.getUpdatedAt ? storage.getUpdatedAt() : 0;

        if (!canPushToCloud()) {
          // [웹 열람 전용 모드]: 항상 APK가 올린 클라우드 스냅샷을 절대 기준으로 자동 동기화
          if (cloudTime > 0 && (cloudTime !== localTime || isManualClick)) {
            if (cloudSnapshot.overrides && typeof cloudSnapshot.overrides === 'object' && storage.setOverrides) {
              storage.setOverrides(cloudSnapshot.overrides);
            }
            if (Array.isArray(cloudSnapshot.schedules) && storage.setSchedules) {
              storage.setSchedules(cloudSnapshot.schedules);
            }
            if (storage.setUpdatedAt) {
              storage.setUpdatedAt(cloudTime);
            }
            refreshUI();
          }
          return true;
        }

        // [APK 마스터 모드 (또는 양방향 허용 시)]
        if (cloudTime > localTime) {
          if (cloudSnapshot.overrides && typeof cloudSnapshot.overrides === 'object' && storage.setOverrides) {
            storage.setOverrides(cloudSnapshot.overrides);
          }
          if (Array.isArray(cloudSnapshot.schedules) && storage.setSchedules) {
            storage.setSchedules(cloudSnapshot.schedules);
          }
          if (storage.setUpdatedAt) {
            storage.setUpdatedAt(cloudTime);
          }
          lastPushedTime = Math.max(lastPushedTime, cloudTime);
          refreshUI();
          return true;
        } else if (localTime > cloudTime) {
          return pushToCloud().then(function() {
            refreshUI();
            return true;
          });
        } else {
          if (isManualClick) {
            refreshUI();
          }
          return true;
        }
      })
      .catch(function(err) {
        console.warn('[SyncEngine] 클라우드 조회 알림:', err.message);
        if (isManualClick) {
          refreshUI();
        }
        return false;
      })
      .finally(function() {
        currentSyncPromise = null;
      });

    currentSyncPromise = syncTask;
    return syncTask;
  }

  // 웹 -> APK 역방향 변경 기능 동적 제어 API (필요 시 즉시 호출 가능)
  function setWebToApkSyncEnabled(enabled) {
    ALLOW_WEB_TO_APK_SYNC = !!enabled;
    applyWebReadonlyMode();
  }

  // 브라우저 / 웹뷰 환경 이벤트 바인딩
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    var initSyncEngine = function() {
      applyWebReadonlyMode();

      var btnSync = document.getElementById('btnSyncRefresh');
      if (btnSync) {
        btnSync.addEventListener('click', function() {
          syncNow(true);
        });
      }

      // 접속 즉시 클라우드 최신 데이터 동기화
      setTimeout(function() {
        syncNow(false);
      }, 100);

      // 앱/브라우저 화면 복귀 시 즉시 동기화
      document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'visible') {
          syncNow(false);
        }
      });

      window.addEventListener('focus', function() {
        syncNow(false);
      });

      // 화면을 열어둔 상태에서 6초 주기로 조용히 자동 동기화
      setInterval(function() {
        if (document.visibilityState === 'visible' && !currentPushPromise && !pushDebounceTimer) {
          syncNow(false);
        }
      }, 6000);
    };

    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', initSyncEngine);
    } else {
      initSyncEngine();
    }

    window.syncEngine = {
      pushNow: pushNow,
      pushToCloud: pushToCloud,
      syncNow: syncNow,
      isApkClient: isApkClient,
      canPushToCloud: canPushToCloud,
      setWebToApkSyncEnabled: setWebToApkSyncEnabled,
      getLastKnownCloudTime: function() { return lastKnownCloudTime; }
    };
    window.handleManualSyncClick = function() { return syncNow(true); };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      pushNow: pushNow,
      pushToCloud: pushToCloud,
      syncNow: syncNow,
      setWebToApkSyncEnabled: setWebToApkSyncEnabled
    };
  }
})();
