// ==========================================================================
// 출퇴근 맞춤 실시간 대중교통 안내 - 서울시 공공 버스도착정보(TOPIS) 직결 전광판
// 서울시 공공 데이터 포털 ws.bus.go.kr getArrInfoByRoute 직접 호출
// ODsay 의존성 완전 제거 · 9호선 역사 공식 시간표 최우선 연동
// 현 시각 기준 실시간 [다음 버스] 및 [다다음 버스] 즉시 카운트다운
// ==========================================================================

class TransitManager {
  constructor() {
    this.busApiKey = 'df332cd23ac6df535a295747d46e0328dd0fd3faed11cec584c87a0ca1e7a759';
    this.currentMode = 'commute'; // 'commute' | 'offwork'
    this.autoReason = '';

    // 25초 단위 실시간 자동 갱신 주기
    this.REFRESH_INTERVAL = 25;
    this.refreshCountdown = 25;
    this.lastLoadedTimeStr = '';
    this.isLiveBus = false;
    this.isFetching = false;

    // 서울시 정류소 및 노선 시스템 식별값 매핑 (stId, busRouteId, ord)
    this.busConfigs = {
      // 1. 출근 모드: 정류소 1 (이대목동병원.목동6단지앞, ARS 15154, stId 114000052)
      commute: {
        arsId: '15-154',
        stId: '114000052',
        stationName: '이대목동병원·목동6단지앞',
        destNote: '선유도역·당산역 방면',
        routes: [
          {
            routeNum: '양천01',
            busRouteId: '114900001',
            stId: '114000052',
            ord: '17',
            badgeClass: 'badge-seoul-town',
            typeText: '마을버스 (평일 5~8분 / 주말·공휴일 8~12분)',
            headway: 360
          },
          {
            routeNum: '603',
            busRouteId: '100100088',
            stId: '114000052',
            ord: '22',
            badgeClass: 'badge-seoul-blue',
            typeText: '간선버스 (배차 10~12분)',
            headway: 660
          },
          {
            // 6620은 15154에서 당산역 방향만 모니터링 (ord 28)
            routeNum: '6620',
            busRouteId: '100100300',
            stId: '114000052',
            ord: '28',
            badgeClass: 'badge-seoul-green',
            typeText: '지선버스 (당산역 방면)',
            headway: 720
          }
        ]
      },
      // 2. 퇴근 모드: 정류소 2 (선유도역1번출구.한신아파트, ARS 19210, stId 118000125)
      offwork: {
        arsId: '19-210',
        stId: '118000125',
        stationName: '선유도역1번출구·한신아파트',
        destNote: '목동아파트 단지 방면 환승',
        routes: [
          {
            routeNum: '양천01',
            busRouteId: '114900001',
            stId: '118000125',
            ord: '20',
            badgeClass: 'badge-seoul-town',
            typeText: '마을버스 (평일 5~8분 / 주말·공휴일 8~12분)',
            headway: 360
          },
          {
            routeNum: '603',
            busRouteId: '100100088',
            stId: '118000125',
            ord: '62',
            badgeClass: 'badge-seoul-blue',
            typeText: '간선버스 (배차 10~12분)',
            headway: 660
          },
          {
            // 6620은 19210에서 차고지 방향만 모니터링 (ord 34)
            routeNum: '6620',
            busRouteId: '100100300',
            stId: '118000125',
            ord: '34',
            badgeClass: 'badge-seoul-green',
            typeText: '지선버스 (차고지 방면)',
            headway: 720
          }
        ]
      }
    };

    // 캐시 저장소
    this.busCache = {};
    this.subwayApiKey = '476a79484b6a6f6e3833504f4f6d4e';
    this.subwayCache = {};
    this.isLiveSubway = false;
    this.subwaySourceMode = 'realtime'; // 디폴트는 항상 실시간 우선 반영 (필요 시 수동 전환)
    try {
      localStorage.removeItem('subway_source_mode');
    } catch (e) {}
    this.activeTimetableTab = 'seonyudo';

    // 정류소 전체 버스 도착정보(ARS 직결) 모달 관련 설정
    this.stationBusApiKey = '0f40f3c7a3220ef7d0f45825f4364e47d05d10fa087632a03db7c8c2222aae63';
    this.stationBusesCache = {};
    this.stationModalFilter = 'all'; // 'all' | 'town' | 'blue' | 'green' | 'other'
    this.stationModalSort = 'arrival'; // 'arrival' | 'route'
    this.stationModalCountdown = 15;
    this.stationModalTicker = null;
    this.currentStationModalArsId = '15-154';
    this.currentStationModalName = '이대목동병원·목동6단지앞';
    this.isFetchingStationBuses = false;

    this.initElements();
    this.initEvents();

    // 근무표 기반 출퇴근 모드 자동 판정 및 초기 데이터 로드
    this.initModeFromShift();
    this.loadAllData();

    // 1초 단위 실시간 카운트다운 티커 시작
    this.startTicker();

    // 스마트폰 앱 복귀/재실행 시 항상 최신 실시간 데이터 새로고침
    let lastResumeFetch = 0;
    const handleAppResume = () => {
      const now = Date.now();
      if (now - lastResumeFetch < 2500) return;
      lastResumeFetch = now;
      this.refreshCountdown = this.REFRESH_INTERVAL;
      this.loadAllData(true);
    };

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) handleAppResume();
    });
    window.addEventListener('pageshow', () => {
      handleAppResume();
    });
    window.addEventListener('focus', () => {
      handleAppResume();
    });
  }

  initElements() {
    this.widgetCard = document.getElementById('transitWidgetSection');
    this.transitStatusBadge = document.getElementById('transitStatusBadge');
    this.btnOpenTransitModal = document.getElementById('btnOpenTransitModal');

    this.tabCommute = document.getElementById('tabCommute');
    this.tabOffwork = document.getElementById('tabOffwork');
    this.cardsContainer = document.getElementById('transitCardsContainer');
    this.commuteSummaryContainer = document.getElementById('commuteEstimationSummaryBox') || document.getElementById('estimationSummaryBox');
    this.commuteDetailContainer = document.getElementById('commuteEstimationDetailBox');

    this.lastUpdated = document.getElementById('lastUpdated');
    this.btnHeaderReload = document.getElementById('btnHeaderReload');
    this.btnReloadTransit = document.getElementById('btnReloadTransit');
    this.initTimeFontBoost();
  }

  initEvents() {
    if (this.btnOpenTransitModal) {
      this.btnOpenTransitModal.addEventListener('click', () => {
        if (this.widgetCard) {
          this.widgetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
          this.widgetCard.classList.add('widget-highlight');
          setTimeout(() => this.widgetCard.classList.remove('widget-highlight'), 1200);
        }
        this.triggerManualRefresh();
      });
    }

    if (this.tabCommute) {
      this.tabCommute.addEventListener('click', () => this.changeMode('commute', false));
    }
    if (this.tabOffwork) {
      this.tabOffwork.addEventListener('click', () => this.changeMode('offwork', false));
    }

    if (this.btnHeaderReload) {
      this.btnHeaderReload.addEventListener('click', () => this.triggerManualRefresh(this.btnHeaderReload));
    }
    if (this.btnReloadTransit) {
      this.btnReloadTransit.addEventListener('click', () => this.triggerManualRefresh(this.btnReloadTransit));
    }
  }

  initModeFromShift() {
    // 사용자 맞춤형 근무표 기반 출/퇴근 모드 자동 초기화
    // - 일근: 전날부터 09시까지 출근모드, 13시부터 퇴근모드
    // - 야근: 당일 07시부터 출근모드
    // - 조근: 당일 05시부터 퇴근모드
    try {
      const overrides = (typeof shiftStorage !== 'undefined') ? shiftStorage.getOverrides() : {};
      const baseSettings = (typeof shiftStorage !== 'undefined') ? shiftStorage.getBaseSettings() : {};
      if (typeof getCommuteModeForDateTime === 'function') {
        this.currentMode = getCommuteModeForDateTime(new Date(), overrides, baseSettings);
      } else {
        const hour = new Date().getHours();
        this.currentMode = (hour >= 7 && hour < 13) ? 'commute' : 'offwork';
      }
    } catch (e) {
      console.warn('initModeFromShift 오류 발생, 기본값 적용:', e);
      this.currentMode = 'commute';
    }
    this.updateModeUI();
  }

  changeMode(mode) {
    this.currentMode = mode;
    this.updateModeUI();
    this.loadAllData();
  }

  updateModeUI() {
    const isCommute = (this.currentMode === 'commute');
    if (this.tabCommute) this.tabCommute.className = `transit-tab-btn ${isCommute ? 'active' : ''}`;
    if (this.tabOffwork) this.tabOffwork.className = `transit-tab-btn ${!isCommute ? 'active' : ''}`;
  }

  startTicker() {
    if (this.ticker) clearInterval(this.ticker);
    this.ticker = setInterval(() => {
      this.updateLiveTickers();
    }, 1000);
  }

  updateLiveTickers() {
    const now = Date.now();
    const els = document.querySelectorAll('.live-countdown');
    if (els && els.length > 0) {
      els.forEach(el => {
        const targetTime = parseInt(el.getAttribute('data-target-time'), 10);
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        const walkSecAttr = el.getAttribute('data-walk-sec');
        const walkSec = walkSecAttr ? parseInt(walkSecAttr, 10) : null;
        if (!targetTime || isNaN(targetTime)) return;

        const diffSec = Math.max(0, Math.floor((targetTime - now) / 1000));
        let timeHtml = '';
        let catchClass = '';
        if (walkSec !== null && !isNaN(walkSec)) {
          catchClass = (diffSec >= walkSec) ? 'transit-catchable' : 'transit-uncatchable';
          el.classList.remove('transit-catchable', 'transit-uncatchable');
          el.classList.add(catchClass);
        }

        if (diffSec <= 0) {
          timeHtml = `<span class="transit-time-arrive transit-time-arrive-big ${catchClass}">⚡ 곧 도착 (진입)</span>`;
        } else if (diffSec < 60) {
          timeHtml = `<span class="transit-time-imminent ${catchClass}">${diffSec}초 후</span>`;
        } else {
          const m = Math.floor(diffSec / 60);
          const s = diffSec % 60;
          const sStr = s < 10 ? '0' + s : s;
          timeHtml = `<span class="${catchClass}"><span class="transit-time-min">${m}분</span> <span class="transit-time-sec">${sStr}초 후</span></span>`;
        }

        el.innerHTML = `${prefix ? prefix + ' ' : ''}${timeHtml} ${suffix ? `<span class="transit-countdown-suffix">${suffix}</span>` : ''}`;
      });
    }

    // 자동 갱신 카운트다운 처리
    if (this.refreshCountdown > 0) {
      this.refreshCountdown--;
    }

    this.updateRefreshStatus();

    // 카운트다운 만료 시 백그라운드 자동 갱신 호출
    if (this.refreshCountdown <= 0) {
      this.refreshCountdown = this.REFRESH_INTERVAL;
      if (!document.hidden && !this.isFetching) {
        this.loadAllData(false);
      }
    }
  }

  setSubwaySourceMode(mode) {
    this.subwaySourceMode = mode;

    // 누르는 즉각 0.001초 만에 버튼 색상 전환 및 반짝임 효과 (재터치 시에도 즉각 반응)
    const btnReal = document.getElementById('btnSubwayRealtimeWidget');
    const btnTime = document.getElementById('btnSubwayTimetableWidget');
    if (btnReal && btnTime) {
      btnReal.classList.remove('sparkle-active-green', 'sparkle-active-amber');
      btnTime.classList.remove('sparkle-active-green', 'sparkle-active-amber');
      void btnReal.offsetWidth;
      void btnTime.offsetWidth;

      if (mode === 'realtime') {
        btnReal.className = 'subway-mode-btn active-realtime sparkle-active-green';
        btnTime.className = 'subway-mode-btn';
      } else {
        btnTime.className = 'subway-mode-btn active-timetable sparkle-active-amber';
        btnReal.className = 'subway-mode-btn';
      }
    }

    // 캐시된 데이터로 0.001초 만에 즉각 동기식 재계산 및 전광판/요약박스 렌더링
    if (this.lastBusDataMap) {
      this.renderResult(this.lastBusDataMap, this.lastSubwayResults);
    } else {
      this.loadAllData(false);
    }

    // 소요시간 박스 반짝임 애니메이션
    const summaryCard = document.querySelector('#commuteEstimationSummaryBox .est-summary-card');
    if (summaryCard) {
      summaryCard.classList.remove('est-value-updated');
      void summaryCard.offsetWidth;
      summaryCard.classList.add('est-value-updated');
    }
  }

  getFontBoostForKey(key) {
    if (!key) return 0;
    try {
      const v = parseInt(localStorage.getItem('transit_time_boost_' + key) || '0', 10);
      return (!isNaN(v) && v >= 0 && v <= 10) ? v : 0;
    } catch (e) {
      return 0;
    }
  }

  increaseTimeFontSize(e, customKey = null) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const maxBoost = 10;
    const step = 2;

    const targetEl = e && e.target ? e.target.closest('[data-zoom-key]') : null;
    const key = customKey || (targetEl ? targetEl.getAttribute('data-zoom-key') : null);
    const targetName = targetEl ? (targetEl.getAttribute('data-zoom-name') || '') : '';

    if (key) {
      let current = this.getFontBoostForKey(key);
      let next = current + step;
      if (next > maxBoost) {
        this.showTimeZoomToast(`${targetName ? targetName + ' ' : ''}도착시간 글씨가 최대 크기입니다`);
        return;
      }
      try {
        localStorage.setItem('transit_time_boost_' + key, String(next));
      } catch (err) {}
      if (targetEl) {
        targetEl.style.setProperty('--time-font-boost', `${next}px`);
      }
      this.showTimeZoomToast(`${targetName ? targetName + ' ' : ''}도착시간 글씨 확대 (+${next}px)`);
      return;
    }

    let current = parseInt(localStorage.getItem('transit_time_font_boost') || '0', 10);
    if (isNaN(current) || current < 0) current = 0;
    let next = current + step;
    if (next > maxBoost) {
      this.showTimeZoomToast('도착시간 글씨가 최대 크기입니다');
      return;
    }
    this.setTimeFontBoost(next);
    this.showTimeZoomToast(`도착시간 글씨 확대 (+${next}px)`);
  }

  resetTimeFontSize(e, customKey = null) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const targetEl = e && e.target ? e.target.closest('[data-zoom-key]') : null;
    const key = customKey || (targetEl ? targetEl.getAttribute('data-zoom-key') : null);
    const targetName = targetEl ? (targetEl.getAttribute('data-zoom-name') || '') : '';

    if (key) {
      try {
        localStorage.removeItem('transit_time_boost_' + key);
      } catch (err) {}
      if (targetEl) {
        targetEl.style.setProperty('--time-font-boost', '0px');
      }
      this.showTimeZoomToast(`${targetName ? targetName + ' ' : ''}도착시간 원래대로 복귀`);
      return;
    }

    this.setTimeFontBoost(0);
    this.showTimeZoomToast('도착시간 글씨 기본 크기로 복귀');
  }

  setTimeFontBoost(boostPx) {
    try {
      localStorage.setItem('transit_time_font_boost', String(boostPx));
    } catch (e) {}
    document.documentElement.style.setProperty('--time-font-boost', `${boostPx}px`);
  }

  initTimeFontBoost() {
    try {
      const saved = parseInt(localStorage.getItem('transit_time_font_boost') || '0', 10);
      const boost = (!isNaN(saved) && saved >= 0 && saved <= 10) ? saved : 0;
      document.documentElement.style.setProperty('--time-font-boost', `${boost}px`);
    } catch (e) {}
  }

  showTimeZoomToast(msg) {
    let toast = document.getElementById('transit-zoom-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'transit-zoom-toast';
      toast.className = 'transit-zoom-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this._zoomToastTimer);
    this._zoomToastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 1200);
  }

  updateRefreshStatus() {
    if (!this.lastUpdated) return;
    const timeStr = this.lastLoadedTimeStr || new Date().toLocaleTimeString('ko-KR');
    const busStatusText = this.isLiveBus ? '버스 실시간(차량번호 연동)' : '버스 정규배차';
    let subwayStatusText = '';
    if (this.subwaySourceMode === 'timetable') {
      subwayStatusText = '9호선 공식시간표 계산';
    } else {
      subwayStatusText = this.isLiveSubway ? '9호선 실시간(열차번호 연동)' : '9호선 실시간 대기';
    }
    this.lastUpdated.innerHTML = `전광판 갱신: ${timeStr} <span style="color:#059669; font-weight:700;">(${busStatusText} · ${subwayStatusText})</span> <span style="margin-left:6px; color:#2563eb; font-weight:700;">🔄 ${this.REFRESH_INTERVAL}초 자동 갱신 (${this.refreshCountdown}초 전)</span>`;
  }

  formatSec(sec, walkSec = null) {
    let catchClass = '';
    if (walkSec !== null && !isNaN(walkSec)) {
      catchClass = (sec >= walkSec) ? 'transit-catchable' : 'transit-uncatchable';
    }
    if (sec <= 0) return `<span class="transit-time-arrive transit-time-arrive-big ${catchClass}">⚡ 곧 도착</span>`;
    if (sec < 60) return `<span class="transit-time-imminent ${catchClass}">${sec}초 후</span>`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    const sStr = s < 10 ? '0' + s : s;
    return `<span class="${catchClass}"><span class="transit-time-min">${m}분</span> <span class="transit-time-sec">${sStr}초 후</span></span>`;
  }

  /**
   * 버스/열차 차량번호 끝 4자리 숫자를 시인성 있게 강조 포맷팅하는 헬퍼
   */
  formatPlateWithBigDigits(plate, icon = '🚌') {
    if (!plate) return '';
    const str = String(plate).trim();
    const m = str.match(/^(.*?)(\d{4})$/);
    if (m) {
      const prefix = m[1] ? `${m[1]} ` : '';
      return `${icon} ${prefix}<strong class="plate-digit-highlight" style="font-size:14.5px; font-weight:900; letter-spacing:0.5px; margin-left:1px;">${m[2]}</strong>`;
    }
    return `${icon} ${str}`;
  }

  formatPlateSmall(plate) {
    if (!plate) return '';
    const str = String(plate).trim();
    const m = str.match(/^(.*?)(\d{4})$/);
    if (m) {
      const prefix = m[1] ? `${m[1]} ` : '';
      return `${prefix}<strong style="font-size:12px; font-weight:800;">${m[2]}</strong>`;
    }
    return str;
  }

  // --- 서울시 버스도착정보 직결 공공 API 호출 함수 ---
  async fetchBusArrival(busRouteId, stId, ord) {
    const cacheKey = `${busRouteId}_${stId}_${ord}`;
    const directUrl = `http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute?serviceKey=${this.busApiKey}&busRouteId=${busRouteId}&stId=${stId}&ord=${ord}&resultType=json`;

    // 1차: 직접 HTTP 통신 (Android usesCleartextTraffic 및 로컬/HTTP 환경)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(directUrl, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const item = data?.msgBody?.itemList?.[0];
        if (item) {
          this.busCache[cacheKey] = item;
          return item;
        }
        // 직결 응답은 정상이나 데이터 없음 → 느린 프록시 재시도 생략
        console.warn('[Transit] 버스 API 데이터 없음:', cacheKey, data?.msgHeader?.headerMsg);
        return this.busCache[cacheKey] || null;
      }
    } catch (e) {
      // Android가 아닌 웹(HTTPS) 브라우저 환경에서 Mixed Content 차단 발생 시 프록시 fallback
    }

    // 2차: 안전한 CORS/HTTPS 프록시 fallback (웹 배포 환경)
    const proxyList = [
      url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    for (const makeProxy of proxyList) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const proxyUrl = makeProxy(directUrl);
        const res = await fetch(proxyUrl, {
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const item = data?.msgBody?.itemList?.[0];
          if (item) {
            this.busCache[cacheKey] = item;
            return item;
          }
        }
      } catch (err) {
        // 다음 프록시 시도
      }
    }

    // 서버 일시 장애 시 직전 캐시 반환 (앱 크래시 방지)
    return this.busCache[cacheKey] || null;
  }

  // --- 서울시 지하철 실시간 도착정보 직결 공공 API 호출 함수 ---
  async fetchSubwayArrival(stationName) {
    const cacheKey = stationName;
    const directUrl = `http://swopenAPI.seoul.go.kr/api/subway/${this.subwayApiKey}/json/realtimeStationArrival/0/10/${encodeURIComponent(stationName)}`;

    // 1차: 직접 HTTP 통신
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(directUrl, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && data.realtimeArrivalList) {
          this.subwayCache[cacheKey] = data.realtimeArrivalList;
          return data.realtimeArrivalList;
        }
        // 직결 응답은 정상이나 실시간 데이터 없음(INFO-200 등) → 느린 프록시 재시도 생략, 시간표로 폴백
        console.warn('[Transit] 지하철 실시간 데이터 없음:', stationName, data?.code || data?.errorMessage?.code, data?.message || '');
        return [];
      }
    } catch (e) {
      // 프록시 fallback
    }

    // 2차: 안전한 CORS/HTTPS 프록시 fallback (웹 배포 환경)
    const proxyList = [
      url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    for (const makeProxy of proxyList) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const proxyUrl = makeProxy(directUrl);
        const res = await fetch(proxyUrl, {
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.realtimeArrivalList) {
            this.subwayCache[cacheKey] = data.realtimeArrivalList;
            return data.realtimeArrivalList;
          }
        }
      } catch (err) {}
    }

    return this.subwayCache[cacheKey] || null;
  }

  async loadAllData(showLoading = true) {
    if (!this.cardsContainer) return;
    if (this.isFetching) return;
    this.isFetching = true;

    if (showLoading) {
      this.cardsContainer.innerHTML = `
        <div class="transit-loading-box">
          <div style="font-size:26px; margin-bottom:8px; display:inline-block; animation:spin 1s infinite linear;">🔄</div>
          <div style="font-size:14.5px; font-weight:800; color:#0284c7;">실시간 대중교통 최신 정보 수신 중...</div>
          <p style="font-size:11.5px; color:#64748b; margin-top:4px;">서울시 버스(TOPIS) 차량번호 및 9호선 실시간 열차번호를 수신하고 있습니다.</p>
        </div>
      `;
      if (this.lastUpdated) {
        this.lastUpdated.innerHTML = `<span style="color:#0284c7; font-weight:800;">🔄 서울시 실시간 교통정보 수신 중...</span>`;
      }
    }

    const startTime = Date.now();
    const config = this.busConfigs[this.currentMode];
    const isCommute = (this.currentMode === 'commute');
    const subwayStationName = isCommute ? '선유도' : '국회의사당';

    try {
      // 버스(양천01, 603, 6620) 및 지하철(9호선) 동시 병렬 호출
      const busPromises = config.routes.map(r =>
        this.fetchBusArrival(r.busRouteId, r.stId, r.ord).catch(() => null)
      );
      const subwayPromise = this.fetchSubwayArrival(subwayStationName).catch(() => null);

      const [busResults, subwayResults] = await Promise.all([
        Promise.all(busPromises),
        subwayPromise
      ]);

      const busDataMap = {};
      config.routes.forEach((r, idx) => {
        busDataMap[r.routeNum] = busResults[idx];
      });

      // 사용자가 새로고침 애니메이션을 인지할 수 있도록 최소 250ms 보장
      const elapsed = Date.now() - startTime;
      if (showLoading && elapsed < 250) {
        await new Promise(r => setTimeout(r, 250 - elapsed));
      }

      this.lastLoadedTimeStr = new Date().toLocaleTimeString('ko-KR');
      this.isLiveBus = busResults.some(item => item && (parseInt(item.traTime1, 10) > 0 || item.arrmsg1));
      this.isLiveSubway = Array.isArray(subwayResults) && subwayResults.length > 0;

      this.renderResult(busDataMap, subwayResults);

      this.refreshCountdown = this.REFRESH_INTERVAL;
      this.updateRefreshStatus();

      this.updateLiveTickers();
    } catch (err) {
      console.error('교통 정보 수신 중 오류 발생:', err);
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * 실시간 서울시 버스 데이터 파싱 및 UI 변환 엔진
   */
  parseSeoulBusArrival(routeConfig, busItem, now, nowMs) {
    const headway = routeConfig.headway;
    const targetOrd = parseInt(routeConfig.ord, 10);

    let next = null;
    let next2 = null;

    if (busItem) {
      const traTime1 = parseInt(busItem.traTime1 || '0', 10);
      const sectOrd1 = parseInt(busItem.sectOrd1 || '0', 10);
      const arrmsg1 = (busItem.arrmsg1 || '').trim();
      const plainNo1 = (busItem.plainNo1 || '').trim();

      const traTime2 = parseInt(busItem.traTime2 || '0', 10);
      const sectOrd2 = parseInt(busItem.sectOrd2 || '0', 10);
      const arrmsg2 = (busItem.arrmsg2 || '').trim();
      const plainNo2 = (busItem.plainNo2 || '').trim();

      // --- 1번째 버스 분석 ---
      // 남은 정류장 수 파싱 ("[N번째 전]")
      let stop1Text = '';
      const match1 = arrmsg1.match(/\[(\d+)번째\s*전\]/);
      if (match1) {
        stop1Text = `[${match1[1]}번째 전]`;
      } else if (sectOrd1 > 0 && targetOrd > sectOrd1) {
        stop1Text = `[${targetOrd - sectOrd1}번째 전]`;
      }

      // 특수 메시지 판정: "곧 도착", "출발대기", "운행종료"
      const isArrivingSoon1 = arrmsg1.includes('곧 도착');
      const isWait1 = arrmsg1.includes('출발대기');
      const isEnd1 = arrmsg1.includes('운행종료');

      let sec1 = traTime1;
      if (isArrivingSoon1) {
        sec1 = Math.min(sec1 > 0 ? sec1 : 30, 45);
      }

      next = {
        sec: sec1,
        rawSec: traTime1,
        arrmsg: arrmsg1,
        stopText: stop1Text,
        plainNo: plainNo1,
        isArrivingSoon: isArrivingSoon1,
        isWait: isWait1,
        isEnd: isEnd1,
        targetTime: (sec1 > 0) ? (nowMs + sec1 * 1000) : null,
        isEstimate: false
      };

      // --- 2번째 버스 분석 ---
      let stop2Text = '';
      const match2 = arrmsg2.match(/\[(\d+)번째\s*전\]/);
      if (match2) {
        stop2Text = `[${match2[1]}번째 전]`;
      } else if (sectOrd2 > 0 && targetOrd > sectOrd2) {
        stop2Text = `[${targetOrd - sectOrd2}번째 전]`;
      }

      const isWait2 = arrmsg2.includes('출발대기');
      const isEnd2 = arrmsg2.includes('운행종료');
      const isArrivingSoon2 = arrmsg2.includes('곧 도착');

      if (traTime2 > 0 || isWait2 || isArrivingSoon2) {
        let sec2 = traTime2;
        if (isArrivingSoon2) sec2 = Math.min(sec2 > 0 ? sec2 : 45, 60);

        next2 = {
          sec: sec2,
          rawSec: traTime2,
          arrmsg: arrmsg2,
          stopText: stop2Text,
          plainNo: plainNo2,
          isWait: isWait2,
          isEnd: isEnd2,
          targetTime: (sec2 > 0) ? (nowMs + sec2 * 1000) : null,
          isEstimate: false
        };
      } else if (sec1 > 0 && !isWait1 && !isEnd1) {
        // 2번째 버스가 실시간 목록에 없으면 공식 배차간격 기반 다음 순번 추정
        const next2Sec = sec1 + headway;
        next2 = {
          sec: next2Sec,
          rawSec: next2Sec,
          arrmsg: '배차 간격 운행',
          stopText: '차기 순번',
          plainNo: '',
          isWait: false,
          isEnd: false,
          targetTime: nowMs + next2Sec * 1000,
          isEstimate: true
        };
      }
    }

    // 실시간 정보가 전혀 없는 시간대(심야 등): 정규 배차순번 추정
    if (!next) {
      const curSecInHour = now.getMinutes() * 60 + now.getSeconds();
      const cycleOffset = headway - (curSecInHour % headway);

      next = {
        sec: cycleOffset,
        rawSec: cycleOffset,
        arrmsg: '정규 배차순번',
        stopText: '정규 배차',
        plainNo: '',
        isArrivingSoon: false,
        isWait: false,
        isEnd: false,
        targetTime: nowMs + cycleOffset * 1000,
        isEstimate: true
      };

      const next2Sec = cycleOffset + headway;
      next2 = {
        sec: next2Sec,
        rawSec: next2Sec,
        arrmsg: '차기 배차순번',
        stopText: '차기 순번',
        plainNo: '',
        isWait: false,
        isEnd: false,
        targetTime: nowMs + next2Sec * 1000,
        isEstimate: true
      };
    }

    // 사용자 요청: 출퇴근 시간에 버스 시간표에 연동되던 것을 중지하고 버스 번호로 실시간 도착정보를 최우선 수신
    // 실시간 버스 정보가 유효한 경우(!next.isEstimate), 시간표로 덮어쓰지 않고 실시간 정보를 100% 우선 적용합니다.
    // 실시간 데이터가 없는 경우(심야, 미운행 등 next.isEstimate인 상태)에만 시간표를 보조로 활용합니다.
    if (next && next.isEstimate) {
      const prioritySchedule = (typeof getPriorityBusSchedule === 'function')
        ? getPriorityBusSchedule(routeConfig.routeNum, (routeConfig.stId === '114000052' || routeConfig.arsId === '15-154') ? '15154' : '', now)
        : null;

      if (prioritySchedule && prioritySchedule.next) {
        const pNext = prioritySchedule.next;
        const pNext2 = prioritySchedule.next2;

        const isImminent = pNext.diffSec <= 35;
        const livePlate1 = (busItem && busItem.plainNo1) ? busItem.plainNo1 : '';

        next = {
          sec: pNext.diffSec,
          rawSec: pNext.diffSec,
          arrmsg: `${pNext.time} 정시운행`,
          stopText: isImminent ? '정류소 진입 중' : `정시 시간표 (${prioritySchedule.periodName})`,
          plainNo: livePlate1,
          isArrivingSoon: isImminent,
          isWait: false,
          isEnd: false,
          targetTime: pNext.targetTime,
          isEstimate: false,
          isPriority: true,
          priorityTime: pNext.time,
          periodName: prioritySchedule.periodName
        };

        if (pNext2) {
          const livePlate2 = (busItem && busItem.plainNo2) ? busItem.plainNo2 : '';
          next2 = {
            sec: pNext2.diffSec,
            rawSec: pNext2.diffSec,
            arrmsg: `${pNext2.time} 정시운행`,
            stopText: `차기 순번 (${pNext2.time})`,
            plainNo: livePlate2,
            isWait: false,
            isEnd: false,
            targetTime: pNext2.targetTime,
            isEstimate: false,
            isPriority: true,
            priorityTime: pNext2.time
          };
        }
      }
    }

    // 양천01의 경우 사용자 요청에 따라 다다다음(next3)까지 계산 투영 (평일 5~8분 / 주말 8~12분 배차)
    let next3 = null;
    if (routeConfig.routeNum === '양천01') {
      const baseTargetMs = (next2 && next2.targetTime) ? next2.targetTime : (next.targetTime ? next.targetTime + headway * 1000 : nowMs + headway * 2000);
      const next3TargetMs = baseTargetMs + headway * 1000;
      const next3Sec = Math.max(1, Math.round((next3TargetMs - nowMs) / 1000));
      const d3 = new Date(next3TargetMs);
      const clock3 = `${String(d3.getHours()).padStart(2, '0')}:${String(d3.getMinutes()).padStart(2, '0')}`;
      next3 = {
        sec: next3Sec,
        targetTime: next3TargetMs,
        clockStr: clock3,
        arrmsg: '다다다음 순번',
        stopText: '차기 배차'
      };
    }

    return { next, next2, next3 };
  }

  /**
   * 실시간 서울시 지하철(9호선 일반열차) 데이터 파싱 및 UI 변환 엔진
   */
  parseRealtimeSubwayArrival(stationName, updnLine, rawList, now, nowMs) {
    if (!rawList || !Array.isArray(rawList)) return null;

    // 9호선(subwayId 1009) & 일반열차 & 해당 방향(상행/하행) 필터링
    const filtered = rawList.filter(item => {
      if (item.subwayId !== '1009') return false;
      const isNormal = (item.btrainSttus === '일반' || !item.btrainSttus || item.btrainSttus === '0');
      const isDir = (item.updnLine === updnLine);
      return isNormal && isDir;
    });

    if (filtered.length === 0) return null;

    // barvlDt (도착 예정 초) 오름차순 정렬
    filtered.sort((a, b) => {
      const secA = parseInt(a.barvlDt || '0', 10);
      const secB = parseInt(b.barvlDt || '0', 10);
      return secA - secB;
    });

    const formatTrain = (item) => {
      const rawSeconds = parseInt(item.barvlDt || '0', 10);
      const trainNo = (item.btrainNo || '').trim();
      const dest = item.bstatnNm || (updnLine === '상행' ? '중앙보훈병원' : '개화');
      const curLoc = item.arvlMsg3 ? `[${item.arvlMsg3}]` : '';
      const statusMsg = (item.arvlMsg2 || '').trim();

      // 진입(0)/도착(1)이거나 메시지에 진입/도착 포함 또는 35초 이하 시 '곧 도착' 처리
      const isArrivingSoon = (item.arvlCd === '0' || item.arvlCd === '1') ||
        statusMsg.includes('도착') || statusMsg.includes('진입') ||
        (rawSeconds > 0 && rawSeconds <= 35);

      let displayEta = "";
      if (isArrivingSoon) {
        displayEta = "⚡ 곧 도착";
      } else {
        const min = Math.floor(rawSeconds / 60);
        const secRem = rawSeconds % 60;
        displayEta = min === 0 ? `${secRem}초 후` : `${min}분 ${secRem}초 후`;
      }

      let sec = rawSeconds;
      if (isArrivingSoon && sec <= 0) sec = 25;
      else if (sec <= 0) sec = 45;

      const targetTime = nowMs + sec * 1000;
      const dt = new Date(targetTime);
      const clockStr = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

      return {
        sec: sec,
        rawSec: rawSeconds,
        displayEta: displayEta,
        trainNo: trainNo,
        destName: dest,
        curLocation: curLoc,
        statusMsg: statusMsg,
        isArrivingSoon: isArrivingSoon,
        targetTime: targetTime,
        clockStr: clockStr,
        isLive: true
      };
    };

    const nextTrain = filtered[0] ? formatTrain(filtered[0]) : null;
    const next2Train = filtered[1] ? formatTrain(filtered[1]) : null;

    return { nextTrain, next2Train };
  }

  // 대한민국 공휴일 판별
  isKoreanHoliday(date) {
    if (typeof window !== 'undefined' && typeof window.isKoreanHoliday === 'function') {
      return window.isKoreanHoliday(date);
    }
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${d}`;
    const md = `${m}-${d}`;
    if (typeof window !== 'undefined' && window.KR_HOLIDAYS_MAP && window.KR_HOLIDAYS_MAP[dateStr]) {
      return true;
    }
    const fixed = ['01-01','03-01','05-05','06-06','08-15','10-03','10-09','12-25'];
    return fixed.includes(md);
  }

  isWeekendOrHoliday(date) {
    const day = date.getDay();
    return day === 0 || day === 6 || this.isKoreanHoliday(date);
  }

  /**
   * 노선별 실 배차간격(초) 계산
   * - 양천01: 평일 약 5~8분 (출퇴근 혼잡 6분 내외, 평시 7분) / 주말 및 공휴일 약 8~12분 (평균 10분)
   * - 603: 평일 약 10~12분 / 주말 13~15분
   * - 6620: 평일 약 12~15분 / 주말 15~18분
   */
  getRouteHeadwaySec(routeNum, now) {
    const isHoliday = this.isWeekendOrHoliday(now);
    const hour = now.getHours();
    const min = now.getMinutes();
    const currentMinOfDay = hour * 60 + min;

    if (routeNum === '양천01') {
      if (isHoliday) {
        // 주말 및 공휴일: 약 8~12분 (평균 10분 = 600초)
        return 10 * 60;
      } else {
        // 평일: 약 5~8분 (출퇴근 혼잡도에 따라 6~10분 내외, 출퇴근 약 6분, 낮시간 7분)
        const isRushHour = (currentMinOfDay >= 7 * 60 && currentMinOfDay <= 9 * 60 + 30) ||
                           (currentMinOfDay >= 17 * 60 + 30 && currentMinOfDay <= 20 * 60);
        return isRushHour ? 6 * 60 : 7 * 60;
      }
    } else if (routeNum === '603') {
      return isHoliday ? 13 * 60 : 11 * 60;
    } else if (routeNum === '6620') {
      return isHoliday ? 16 * 60 : 13 * 60;
    }
    return 10 * 60;
  }

  // ==========================================
  // 9호선 역사 공식 고정 시간표 배차 엔진
  // ==========================================
  getStationSchedules() {
    return {
      NATIONAL_ASSEMBLY_WEEKDAY: {
        5: [42, 53],
        6: [6, 22, 37, 50],
        7: [3, 16, 29, 42, 50],
        8: [2, 14, 22, 31, 39, 48, 57],
        9: [4, 11, 17, 23, 30, 36, 42, 49, 55],
        10: [1, 8, 14, 20, 27, 33, 39, 44, 52, 57],
        11: [5, 13, 23, 34, 45, 56],
        12: [7, 18, 29, 41, 53],
        13: [4, 15, 26, 37, 48, 59],
        14: [10, 21, 32, 43, 54],
        15: [5, 16, 28, 41, 53],
        16: [4, 15, 26, 37, 48, 59],
        17: [10, 21, 32, 43, 54],
        18: [5, 16, 24, 32, 40, 48, 56],
        19: [4, 11, 18, 25, 32, 38, 45, 52, 59],
        20: [6, 13, 19, 26, 33, 40, 47, 54],
        21: [0, 7, 15, 22, 28, 36, 46, 57],
        22: [5, 8, 19, 30, 41, 52],
        23: [3, 14, 25, 36, 47, 58],
        24: [9, 20, 31, 42, 53] // 42분 마곡나루행, 53분 염창행
      },
      NATIONAL_ASSEMBLY_WEEKEND: {
        5: [41, 52],
        6: [5, 18, 35, 50],
        7: [2, 14, 26, 38, 50],
        8: [2, 14, 26, 38, 50],
        9: [2, 14, 26, 37, 50],
        10: [1, 12, 23, 34, 45, 56],
        11: [7, 18, 29, 40, 51],
        12: [2, 13, 24, 35, 46, 57],
        13: [8, 19, 30, 41, 52],
        14: [3, 14, 25, 36, 47, 58],
        15: [9, 20, 31, 42, 53],
        16: [4, 15, 26, 37, 48, 59],
        17: [10, 21, 32, 43, 54],
        18: [5, 16, 27, 38, 49],
        19: [0, 11, 22, 33, 44, 55],
        20: [6, 17, 28, 39, 50],
        21: [1, 11, 23, 34, 45, 56],
        22: [7, 18, 29, 40, 52],
        23: [6, 18, 33, 50] // 50분 염창행
      },
      SEONYUDO_WEEKDAY: {
        5: [34, 48, 59],
        6: [11, 23, 35, 43, 50, 59],
        7: [5, 11, 18, 24, 30, 37, 43, 49, 56],
        8: [2, 8, 15, 21, 27, 34, 40, 46, 53],
        9: [2, 11, 22, 33, 44, 55],
        10: [6, 17, 28, 39, 50],
        11: [1, 13, 25, 36, 47, 58],
        12: [9, 20, 31, 42, 53],
        13: [4, 15, 26, 38, 50],
        14: [1, 12, 23, 34, 45, 56],
        15: [7, 18, 29, 40, 51],
        16: [2, 10, 14, 26, 37, 39, 49, 59],
        17: [5, 12, 19, 26, 33, 40, 46, 53],
        18: [0, 7, 14, 21, 27, 34, 41, 48, 55],
        19: [2, 8, 15, 22, 31, 40, 49, 58],
        20: [7, 18, 29, 40, 51],
        21: [2, 13, 24, 35, 46, 57],
        22: [8, 19, 30, 41, 52],
        23: [3, 14, 25, 36, 47, 57],
        24: [7, 18, 30, 43, 56] // 18분 삼전행, 30분 신논현행, 43분 동작행, 56분 당산행 막차
      },
      SEONYUDO_WEEKEND: {
        5: [36, 47, 57],
        6: [9, 21, 33, 45, 57],
        7: [9, 21, 33, 45, 57],
        8: [9, 21, 33, 45, 57],
        9: [9, 21, 32, 42, 53],
        10: [4, 15, 26, 37, 48, 59],
        11: [10, 21, 32, 43, 54],
        12: [5, 16, 27, 38, 49],
        13: [0, 11, 22, 33, 44, 55],
        14: [6, 17, 28, 39, 50],
        15: [1, 12, 23, 34, 45, 56],
        16: [7, 18, 29, 40, 51],
        17: [2, 13, 24, 35, 46, 57],
        18: [8, 19, 30, 41, 52],
        19: [3, 14, 25, 36, 47, 58],
        20: [9, 20, 31, 42, 53],
        21: [4, 15, 26, 37, 50],
        22: [3, 16, 30, 44, 56],
        23: [11, 27, 41, 55] // 27분 신논현행, 41분 동작행, 55분 당산행 막차
      }
    };
  }

  getPrioritizedTrains(now, isCommute, count = 2) {
    const isHoliday = this.isWeekendOrHoliday(now);
    const schedules = this.getStationSchedules();
    let schedule;
    let defaultDest;
    let stationName;

    if (isCommute) {
      stationName = '선유도역';
      defaultDest = '중앙보훈병원';
      schedule = isHoliday ? schedules.SEONYUDO_WEEKEND : schedules.SEONYUDO_WEEKDAY;
    } else {
      stationName = '국회의사당역';
      defaultDest = '개화';
      schedule = isHoliday ? schedules.NATIONAL_ASSEMBLY_WEEKEND : schedules.NATIONAL_ASSEMBLY_WEEKDAY;
    }

    const rawH = now.getHours();
    const currentH = (rawH === 0) ? 24 : rawH;
    const currentMinutes = currentH * 60 + now.getMinutes();
    const currentSec = now.getSeconds();
    const nowMs = now.getTime();

    const results = [];
    const hours = Object.keys(schedule).map(Number).sort((a, b) => a - b);

    for (const h of hours) {
      const mins = schedule[h];
      for (const m of mins) {
        const trainMin = h * 60 + m;
        const diffSec = (trainMin - currentMinutes) * 60 - currentSec;
        if (diffSec >= -30) {
          let dest = defaultDest;
          if (stationName === '국회의사당역') {
            if (h === 24 && m === 42) {
              dest = '마곡나루(종착)';
            } else if ((h === 24 && m === 53) || (h === 23 && m === 50 && isHoliday)) {
              dest = '염창(종착)';
            }
          } else if (stationName === '선유도역') {
            if (h === 24 && !isHoliday) {
              if (m === 18) dest = '삼전(종착)';
              else if (m === 30) dest = '신논현(종착)';
              else if (m === 43) dest = '동작(종착)';
              else if (m === 56) dest = '당산(종착)';
            } else if (h === 23 && isHoliday) {
              if (m === 27) dest = '신논현(종착)';
              else if (m === 41) dest = '동작(종착)';
              else if (m === 55) dest = '당산(종착)';
            }
          }

          const displayH = (h === 24) ? '00' : String(h).padStart(2, '0');
          const displayM = String(m).padStart(2, '0');

          results.push({
            departureTime: `${displayH}:${displayM}`,
            endStationName: dest,
            sec: Math.max(0, diffSec),
            remainSeconds: Math.max(0, diffSec),
            remainMinutes: Math.floor(Math.max(0, diffSec) / 60),
            targetTime: nowMs + Math.max(0, diffSec) * 1000,
            source: '역고정시간표(우선)',
            subwayClass: 0
          });
          if (results.length >= count) break;
        }
      }
      if (results.length >= count) break;
    }

    if (results.length === 0 && (rawH >= 1 && rawH < 5)) {
      const firstH = hours[0];
      const firstM = schedule[firstH][0];
      const displayH = String(firstH).padStart(2, '0');
      const displayM = String(firstM).padStart(2, '0');
      const firstTrainMin = firstH * 60 + firstM;
      const diffSec = (firstTrainMin - (rawH * 60 + now.getMinutes())) * 60 - currentSec;
      results.push({
        departureTime: `${displayH}:${displayM}`,
        endStationName: defaultDest,
        sec: Math.max(0, diffSec),
        remainSeconds: Math.max(0, diffSec),
        remainMinutes: Math.floor(Math.max(0, diffSec) / 60),
        targetTime: nowMs + Math.max(0, diffSec) * 1000,
        source: '역고정시간표(첫차)',
        subwayClass: 0,
        isFirstTrain: true
      });
    }

    return results;
  }


  renderResult(busDataMap, subwayRawList = null) {
    this.lastBusDataMap = busDataMap;
    if (subwayRawList) {
      this.lastSubwayResults = subwayRawList;
    }
    const isCommute = (this.currentMode === 'commute');
    const defaultWalkSec = 300; // 도보 이동 5분(300초) 기준: 5분 미만(곧 도착/임박)만 사알짝 작게, 그 외는 버스 도착 정보 크기로 시원하게 표출
    const busWalkSec = defaultWalkSec;
    const subwayWalkSec = defaultWalkSec;
    const now = new Date();
    const nowMs = now.getTime();
    const config = this.busConfigs[this.currentMode];

    let busHtml = '';
    let subwayHtml = '';

    // ==========================================
    // 1. 서울시 공공 버스 도착 전광판 카드 (실시간 버스 번호 100% 최우선)
    // ==========================================
    const routeItems = config.routes.map(r => {
      const busItem = busDataMap[r.routeNum];
      const { next, next2 } = this.parseSeoulBusArrival(r, busItem, now, nowMs);

      // --- 🔴 다음 버스 UI ---
      let nextTimeHtml = '';
      let nextSubLoc = '';

      if (next.isWait) {
        nextTimeHtml = `<span class="transit-time-imminent" style="color:#d97706;">⏸️ 출발대기</span>`;
        nextSubLoc = `상태: <b>기점/차고지 출발대기</b>`;
      } else if (next.isEnd) {
        nextTimeHtml = `<span class="transit-time-arrive" style="color:#64748b;">🚫 운행종료</span>`;
        nextSubLoc = `상태: <b>오늘 운행종료</b>`;
      } else if (next.isArrivingSoon || next.sec <= 30) {
        nextTimeHtml = `<span class="transit-time-arrive transit-uncatchable">⚡ 곧 도착</span>`;
        const loc = next.stopText ? `${next.stopText} · 진입 중` : '정류소 진입 중';
        nextSubLoc = `위치: <b>${loc}</b>`;
      } else if (next.targetTime) {
        nextTimeHtml = `<span class="live-countdown" data-target-time="${next.targetTime}" data-walk-sec="${busWalkSec}">${this.formatSec(next.sec, busWalkSec)}</span>`;
        const loc = next.stopText || '운행 중';
        nextSubLoc = `위치: <b>${loc}</b>`;
      } else {
        nextTimeHtml = `<span class="transit-time-arrive transit-uncatchable">⚡ 곧 도착</span>`;
        nextSubLoc = `위치: <b>운행 중</b>`;
      }

      // 도착 예정 시각 및 시간표 우선 정보 매핑
      let nextArrClock = '';
      let nextScheduleBadge = '';
      if (next.isPriority && next.priorityTime) {
        nextArrClock = next.priorityTime;
        nextScheduleBadge = `<span class="badge-priority-timetable" style="display:inline-flex; align-items:center; background:#fef3c7; color:#92400e; font-size:10.5px; padding:1px 6px; border-radius:4px; font-weight:800; margin-left:6px; border:1px solid #fde68a;">🗓️ 공식 시간표</span>`;
      } else if (next.targetTime && !next.isWait && !next.isEnd) {
        const nextArrTime = new Date(next.targetTime);
        nextArrClock = `${String(nextArrTime.getHours()).padStart(2, '0')}:${String(nextArrTime.getMinutes()).padStart(2, '0')}`;
      }

      const vehicleBadge1 = next.plainNo
        ? `<span class="badge-bus-plate">${this.formatPlateWithBigDigits(next.plainNo, '🚌')}</span>`
        : '';

      const nextHtml = `
        <div class="next-transit-box">
          <div class="next-transit-header">
            <span class="next-tag-red">
              <span>🔴</span>
              <span>다음 버스</span>
              ${vehicleBadge1}
            </span>
            <span class="next-time-big">
              ${nextTimeHtml}
            </span>
          </div>
          <div class="next-transit-sub">
            <span class="transit-sub-pos">${nextSubLoc}</span>
            ${nextArrClock ? `<span class="transit-sub-time"><span class="transit-arr-label">도착 예정:</span> <b class="transit-clock-time" style="color:#0369a1; font-weight:900;">${nextArrClock}</b></span>` : ''}
          </div>
        </div>
      `;

      // --- 🔵 다다음 버스 UI (다음 버스와 동일한 2단 카드 포맷으로 글씨 넘침 원천 방지) ---
      let next2Html = '';
      if (next2) {
        let next2TimeHtml = '';
        let next2SubLoc = '';
        let next2ArrClock = '';
        let next2ScheduleBadge = '';

        if (next2.isWait) {
          next2TimeHtml = `<span class="transit-time-imminent" style="color:#d97706;">⏸️ 출발대기</span>`;
          next2SubLoc = `상태: <b>기점/차고지 대기</b>`;
        } else if (next2.isEnd) {
          next2TimeHtml = `<span class="transit-time-arrive" style="color:#64748b;">🚫 운행종료</span>`;
          next2SubLoc = `상태: <b>오늘 운행종료</b>`;
        } else if (next2.isArrivingSoon || next2.sec <= 30) {
          next2TimeHtml = `<span class="transit-time-arrive transit-time-arrive-big transit-uncatchable">⚡ 곧 도착</span>`;
          const loc = next2.stopText ? `${next2.stopText} · 진입 중` : '정류소 진입 중';
          next2SubLoc = `위치: <b>${loc}</b>`;
        } else if (next2.targetTime) {
          next2TimeHtml = `<span class="live-countdown next2-countdown" data-target-time="${next2.targetTime}" data-walk-sec="${busWalkSec}">${this.formatSec(next2.sec, busWalkSec)}</span>`;
          const loc = next2.stopText || '운행 중';
          next2SubLoc = `위치: <b>${loc}</b>`;
        } else {
          next2TimeHtml = `<span class="transit-time-arrive transit-time-arrive-big transit-uncatchable">⚡ 곧 도착</span>`;
          next2SubLoc = `위치: <b>운행 중</b>`;
        }

        if (next2.isPriority && next2.priorityTime) {
          next2ArrClock = next2.priorityTime;
          next2ScheduleBadge = `<span class="badge-priority-timetable" style="display:inline-flex; align-items:center; background:#fef3c7; color:#92400e; font-size:10px; padding:1px 5px; border-radius:4px; font-weight:700; margin-left:4px; border:1px solid #fde68a;">[시간표]</span>`;
        } else if (next2.targetTime && !next2.isWait && !next2.isEnd) {
          const next2ArrTime = new Date(next2.targetTime);
          next2ArrClock = `${String(next2ArrTime.getHours()).padStart(2, '0')}:${String(next2ArrTime.getMinutes()).padStart(2, '0')}`;
        }

        const vehicleBadge2 = next2.plainNo
          ? `<span class="badge-bus-plate badge-bus-plate-blue">${this.formatPlateWithBigDigits(next2.plainNo, '🚌')}</span>`
          : '';

        next2Html = `
          <div class="next-transit-box next2-transit-box">
            <div class="next-transit-header">
              <span class="next2-tag-blue">
                <span>🔵</span>
                <span>다다음 버스</span>
                ${vehicleBadge2}
              </span>
              <span class="next-time-big next2-time-big">
                ${next2TimeHtml}
              </span>
            </div>
            <div class="next-transit-sub next2-transit-sub">
              <span class="transit-sub-pos">${next2SubLoc}</span>
              ${next2ArrClock ? `<span class="transit-sub-time"><span class="transit-arr-label">도착 예정:</span> <b class="transit-clock-time" style="color:#0284c7; font-weight:900;">${next2ArrClock}</b>${next2ScheduleBadge}</span>` : ''}
            </div>
          </div>
        `;
      }

      let next3Html = '';
      if (r.routeNum === '양천01') {
        const headwaySec = this.getRouteHeadwaySec('양천01', now);
        let baseTargetMs = null;
        if (next2 && next2.targetTime) {
          baseTargetMs = next2.targetTime;
        } else if (next && next.targetTime) {
          baseTargetMs = next.targetTime + headwaySec * 1000;
        } else {
          baseTargetMs = nowMs + headwaySec * 1000;
        }
        const next3TargetMs = baseTargetMs + headwaySec * 1000;
        const next3Sec = Math.max(0, Math.round((next3TargetMs - nowMs) / 1000));
        const next3ArrTime = new Date(next3TargetMs);
        const next3Clock = `${String(next3ArrTime.getHours()).padStart(2, '0')}:${String(next3ArrTime.getMinutes()).padStart(2, '0')}`;
        next3Html = `
          <div class="next-transit-box next3-transit-box" style="margin-top:5px;">
            <div class="next-transit-header">
              <span class="next3-tag-purple">
                <span>🟣</span>
                <span>다다다음</span>
                <span class="badge-regular-service">정규배차</span>
              </span>
              <span class="next-time-big next3-time-big">
                <span class="live-countdown next2-countdown next3-countdown" data-target-time="${next3TargetMs}" data-walk-sec="${busWalkSec}">${this.formatSec(next3Sec, busWalkSec)}</span>
              </span>
            </div>
            <div class="next-transit-sub next3-transit-sub">
              <span class="transit-sub-pos">배차: <b>평일 5~8분 / 주말 8~12분</b></span>
              <span class="transit-sub-time"><span class="transit-arr-label">도착 예정:</span> <b class="transit-clock-time" style="color:#7c3aed; font-weight:900;">${next3Clock}</b></span>
            </div>
          </div>
        `;
      }

      let routeDescHtml = `<span class="bit-route-type-label">${r.typeText}</span>`;
      if (r.typeText && r.typeText.includes(' / ')) {
        const parts = r.typeText.split(' / ');
        routeDescHtml = `<div class="bit-route-desc-col"><span class="bit-route-desc-l1">${parts[0]}</span><span class="bit-route-desc-l2">${parts[1]}</span></div>`;
      }

      const zoomKey = 'top_bus_' + r.routeNum;
      const savedBoost = this.getFontBoostForKey(zoomKey);
      const styleBoost = (savedBoost > 0) ? `--time-font-boost:${savedBoost}px;` : '';

      return `
        <div class="bit-route-item" data-zoom-key="${zoomKey}" data-zoom-name="${r.routeNum}번" style="${styleBoost}">
          <div class="bit-route-top">
            <div style="display:flex; align-items:center; gap:6px; min-width:0; flex:1 1 auto; overflow:hidden;">
              <span class="${r.badgeClass}">${r.routeNum}</span>
              ${routeDescHtml}
              ${nextScheduleBadge}
            </div>
            <div class="bus-time-zoom-ctrl">
              <button type="button" class="btn-time-zoom-btn btn-time-zoom-plus" onclick="window.transitManager && window.transitManager.increaseTimeFontSize(event, '${zoomKey}')" title="${r.routeNum}번 도착시간 글씨 확대" aria-label="${r.routeNum}번 도착시간 글씨 확대">
                <span class="zoom-btn-icon">＋</span>
              </button>
              <button type="button" class="btn-time-zoom-btn btn-time-zoom-reset" onclick="window.transitManager && window.transitManager.resetTimeFontSize(event, '${zoomKey}')" title="${r.routeNum}번 도착시간 글씨 원래대로 복귀" aria-label="${r.routeNum}번 도착시간 글씨 원래대로 복귀">
                <span class="zoom-btn-icon">↺</span>
              </button>
            </div>
          </div>
          ${nextHtml}
          ${next2Html}
          ${next3Html}
        </div>
      `;
    }).join('');

    busHtml = `
      <div class="bit-board-card">
        <div class="bit-header-row">
          <div class="bit-title-group">
            <span class="bit-ars-badge clickable-ars-badge" 
                  onclick="window.transitManager && window.transitManager.openStationBusesModal('${config.arsId}', '${config.stationName}')" 
                  role="button" 
                  tabindex="0" 
                  title="이 정류소 전체 버스 도착정보(카카오맵 스타일) 팝업 조회">
              ARS ${config.arsId} 🔍
            </span>
            <strong class="bit-station-name clickable-station-name" 
                    onclick="window.transitManager && window.transitManager.openStationBusesModal('${config.arsId}', '${config.stationName}')" 
                    title="이 정류소 전체 버스 도착정보(카카오맵 스타일) 팝업 조회">${config.stationName}</strong>
            <button type="button" 
                    class="btn-open-all-buses" 
                    onclick="window.transitManager && window.transitManager.openStationBusesModal('${config.arsId}', '${config.stationName}')" 
                    title="이 정류소에 정차하는 모든 버스 실시간 도착정보 팝업 조회">
              전체버스 ↗
            </button>
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span class="bit-status-live"><span class="bit-status-dot"></span> 서울시 버스실시간</span>
            <button type="button" class="btn-timetable-toggle" onclick="window.transitManager && window.transitManager.openTimetableModal('bus')" title="공식 버스 시간표 조회" style="background:#fef3c7; color:#92400e; border:1px solid #fde68a; font-size:11px; font-weight:700; padding:2px 7px; border-radius:6px; cursor:pointer; display:inline-flex; align-items:center; gap:3px;">🗓️ 시간표</button>
          </div>
        </div>

        <div class="bit-desc-row">
          <span>📍 정류소 실시간 도착 현황</span>
          <span class="bit-dest-pill">${config.destNote}</span>
        </div>

        <div class="bit-route-list">
          ${routeItems}
        </div>

        <div class="bit-footer-info">
          <span>💡 서울시 버스도착정보 공식 API(TOPIS) 연동으로 실시간 버스 번호 및 초 단위 카운트다운을 제공합니다.</span>
        </div>
      </div>
    `;

    // ==========================================
    // 2. 9호선 지하철 도착 전광판 카드 (실시간 일반열차번호 최우선 연동 + 역사시간표 보조)
    // ==========================================
    const subwayStationName = isCommute ? '선유도역 9호선 [상행]' : '국회의사당역 9호선 [하행]';
    const subwayDir = isCommute ? '당산·중앙보훈병원 방면' : '당산·개화 방면 (선유도역 방향)';
    const subwayTargetStation = isCommute ? '선유도' : '국회의사당';
    const subwayUpdn = isCommute ? '상행' : '하행';

    const isHolidayToday = this.isWeekendOrHoliday(now);
    const dayTypeLabel = isHolidayToday ? '🌴 주말·공휴일 시간표' : '🗓️ 평일 시간표';

    const isTimetableMode = (this.subwaySourceMode === 'timetable');
    let isLiveTrain = false;
    let t1 = null;
    let t2 = null;

    if (!isTimetableMode) {
      // [1] 서울시 실시간 지하철 모드: 공공 API 실시간 일반열차 파싱 시도 (열차번호/실시간 위치)
      const realtimeSubway = this.parseRealtimeSubwayArrival(subwayTargetStation, subwayUpdn, subwayRawList, now, nowMs);
      if (realtimeSubway && realtimeSubway.nextTrain) {
        isLiveTrain = true;
        t1 = realtimeSubway.nextTrain;
        t2 = realtimeSubway.next2Train;
      }
    }

    // [2] 시간표 모드이거나 실시간 데이터 부재 시: 역사 고정 시간표로 도착시간 계산
    if (!t1) {
      const prioritizedTrains = this.getPrioritizedTrains(now, isCommute, 2);
      if (prioritizedTrains && prioritizedTrains.length > 0) {
        const pt1 = prioritizedTrains[0];
        const pt2 = prioritizedTrains.length > 1 ? prioritizedTrains[1] : null;
        t1 = {
          trainNo: '',
          sec: pt1.sec,
          rawSec: pt1.sec,
          destName: pt1.endStationName,
          curLocation: '',
          statusMsg: isTimetableMode ? '공식 시간표 정시 운행' : '역고정 공식 시간표 (실시간 대기)',
          clockStr: pt1.departureTime,
          targetTime: pt1.targetTime,
          isLive: false,
          isArrivingSoon: pt1.sec <= 30
        };
        if (pt2) {
          t2 = {
            trainNo: '',
            sec: pt2.sec,
            rawSec: pt2.sec,
            destName: pt2.endStationName,
            curLocation: '',
            statusMsg: isTimetableMode ? '공식 시간표 정시 운행' : '역고정 공식 시간표 (실시간 대기)',
            clockStr: pt2.departureTime,
            targetTime: pt2.targetTime,
            isLive: false,
            isArrivingSoon: pt2.sec <= 30
          };
        }
      }
    }

    this.isLiveSubway = isLiveTrain;

    let subwayTrainsHtml = '';
    if (t1) {
      const arrivalLabel = isTimetableMode ? '시간표 도착:' : '도착 예정:';

      let t2Html = '';
      if (t2) {
        const t2VehicleTag = t2.trainNo
          ? `<span class="badge-bus-plate badge-train-plate" style="display:inline-flex; align-items:center; background:#eff6ff; color:#1e40af; font-size:11px; padding:2px 7px; border-radius:5px; font-weight:800; margin-left:6px; border:1.5px solid #bfdbfe;">${this.formatPlateWithBigDigits(t2.trainNo, '🚇')}</span>`
          : `<span class="badge-low-bus" style="background:#fef3c7; color:#b45309; border-color:#fde68a;">${isTimetableMode ? '🗓️ 정시시간표' : '역고정(공식)'}</span>`;
        const t2TimeHtml = (t2.isArrivingSoon || t2.sec <= 30)
          ? `<span class="transit-time-arrive-big subway-arrive-imminent transit-uncatchable" style="font-weight:900; font-size:20px; letter-spacing:-0.3px;">⚡ 곧 도착</span>`
          : `<span class="live-countdown next2-countdown" data-target-time="${t2.targetTime}" data-walk-sec="${subwayWalkSec}">${this.formatSec(t2.sec, subwayWalkSec)}</span>`;

        let t2SubLoc = '';
        if (isTimetableMode) {
          t2SubLoc = isCommute ? '선유도역 탑승' : '국회의사당역 탑승';
        } else {
          t2SubLoc = t2.curLocation ? `${t2.curLocation} ${t2.statusMsg || ''}`.trim() : (isCommute ? '선유도역 탑승' : '국회의사당역 탑승');
        }
        t2SubLoc = t2SubLoc.replace(/9호선\s*공식\s*시간표\s*기준/g, '')
                           .replace(/공식\s*시간표\s*정시\s*운행/g, '')
                           .replace(/공식\s*시간표/g, '')
                           .replace(/시간표\s*기준/g, '')
                           .replace(/역고정\s*\(공식\)/g, '')
                           .trim();
        if (!t2SubLoc) t2SubLoc = isCommute ? '선유도역 탑승' : '국회의사당역 탑승';

        t2Html = `
          <div class="next-transit-box next2-transit-box">
            <div class="next-transit-header">
              <span class="next2-tag-blue">
                <span>🔵</span>
                <span>다다음 열차</span>
                ${t2VehicleTag}
              </span>
              <span class="next-time-big next2-time-big">
                ${t2TimeHtml}
              </span>
            </div>
            <div class="next-transit-sub next2-transit-sub">
              <span class="transit-sub-pos">위치: <b>${t2SubLoc}</b></span>
              <span class="transit-sub-time"><span class="transit-arr-label" style="font-size:13px; font-weight:800;">${arrivalLabel}</span> <b class="transit-clock-time subway-clock-time-next2" style="font-size:18.5px; font-weight:900; margin-left:4px;">${t2.clockStr}</b></span>
            </div>
          </div>
        `;
      }

      const trainBadge = t1.trainNo
        ? `<span class="badge-bus-plate badge-train-plate" style="display:inline-flex; align-items:center; background:#dbeafe; color:#1e3a8a; font-size:11px; padding:2px 7px; border-radius:5px; font-weight:800; margin-left:6px; border:1.5px solid #93c5fd;">${this.formatPlateWithBigDigits(t1.trainNo, '🚇')}</span>`
        : `<span class="badge-low-bus" style="background:#fef3c7; color:#b45309; border-color:#fde68a;">${isTimetableMode ? '🗓️ 정시시간표' : '역고정(공식)'}</span>`;

      // 위치 문구 간결화 (뒤의 도착 시각이 잘 보이도록 불필요한 '9호선 공식 시간표 기준' 완전 제거)
      let subLoc = '';
      if (isTimetableMode) {
        subLoc = isCommute ? '선유도역 탑승' : '국회의사당역 탑승';
      } else {
        if (t1.curLocation) {
          subLoc = `${t1.curLocation} ${t1.statusMsg || ''}`.trim();
        } else {
          subLoc = isCommute ? '선유도역 탑승' : '국회의사당역 탑승';
        }
      }
      subLoc = subLoc.replace(/9호선\s*공식\s*시간표\s*기준/g, '')
                     .replace(/공식\s*시간표\s*정시\s*운행/g, '')
                     .replace(/공식\s*시간표/g, '')
                     .replace(/시간표\s*기준/g, '')
                     .replace(/역고정\s*\(공식\)/g, '')
                     .trim();
      if (!subLoc) {
        subLoc = isCommute ? '선유도역 탑승' : '국회의사당역 탑승';
      }

      const t1TimeHtml = (t1.isArrivingSoon || t1.sec <= 30)
        ? `<span class="transit-time-arrive-big subway-arrive-imminent transit-uncatchable" style="font-weight:900; font-size:21.5px; letter-spacing:-0.3px;">⚡ 곧 도착</span>`
        : `<span class="next-time-big live-countdown" data-target-time="${t1.targetTime}" data-walk-sec="${subwayWalkSec}">${this.formatSec(t1.sec, subwayWalkSec)}</span>`;

      // 어디행 제거 및 시각 폰트 18.5px / 고대비 컬러로 크게 노출
      subwayTrainsHtml = `
        <div class="next-transit-box">
          <div class="next-transit-header">
            <span class="next-tag-red">
              <span>🔴</span>
              <span>다음 열차</span>
              ${trainBadge}
            </span>
            ${t1TimeHtml}
          </div>
          <div class="next-transit-sub">
            <span class="transit-sub-pos">위치: <b>${subLoc}</b></span>
            <span class="transit-sub-time"><span class="transit-arr-label" style="font-size:13px; font-weight:800;">${arrivalLabel}</span> <b class="transit-clock-time subway-clock-time" style="font-size:18.5px; font-weight:900; margin-left:4px;">${t1.clockStr}</b></span>
          </div>
        </div>
        ${t2Html}
      `;
    } else {
      subwayTrainsHtml = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; font-size:12.5px; color:#64748b;">
          9호선 실시간 열차 및 공식 시간표 운행 준비 중
        </div>
      `;
    }

    const infoTipText = isTimetableMode
      ? '💡 <b>[시간표 모드]</b> 9호선 공식 역사 시간표 기준으로 도착시각 및 남은 시간을 계산합니다. 실시간 열차번호를 보시려면 상단 [⚡ 서울시 실시간]을 누르세요.'
      : '💡 <b>[실시간 모드]</b> 서울시 공식 지하철 공공API로 열차번호 및 실시간 위치를 연동합니다. 시간표 시각으로 계산하시려면 상단 [🗓️ 시간표]를 누르세요.';

    const subwayZoomKey = 'top_subway_9';
    const subwayBoost = this.getFontBoostForKey(subwayZoomKey);
    const subwayStyleBoost = (subwayBoost > 0) ? `--time-font-boost:${subwayBoost}px;` : '';

    subwayHtml = `
      <div class="bit-board-card subway-9-card" data-zoom-key="${subwayZoomKey}" data-zoom-name="9호선" style="${subwayStyleBoost}">
        <div class="bit-header-row">
          <div class="bit-title-group">
            <span class="badge-seoul-subway">9호선</span>
            <strong class="bit-station-name">${subwayStationName}</strong>
          </div>
          <div class="subway-source-toggle-group">
            <button type="button" 
                    id="btnSubwayRealtimeWidget"
                    class="subway-mode-btn ${!isTimetableMode ? 'active-realtime' : ''}" 
                    onclick="window.transitManager && window.transitManager.setSubwaySourceMode('realtime')" 
                    title="서울시 지하철 실시간 도착정보 및 열차번호 연동">
              <span class="bit-status-dot" style="${!isTimetableMode && isLiveTrain ? 'background:#ef4444;' : 'background:#94a3b8; animation:none;'}"></span>
              <span>${!isTimetableMode && isLiveTrain ? '서울시 실시간' : '실시간'}</span>
            </button>
            <button type="button" 
                    id="btnSubwayTimetableWidget"
                    class="subway-mode-btn ${isTimetableMode ? 'active-timetable' : ''}" 
                    onclick="window.transitManager && window.transitManager.setSubwaySourceMode('timetable')" 
                    title="9호선 공식 역사 시간표 기준 도착시간으로 계산">
              <span>🗓️ 시간표</span>
            </button>
            <button type="button" 
                    class="btn-timetable-popup" 
                    onclick="window.transitManager && window.transitManager.openTimetableModal('subway')" 
                    title="9호선 전체 운행 시간표 조회">
              <span>📋 전체</span>
            </button>
            <div class="bus-time-zoom-ctrl" style="margin-left:4px;">
              <button type="button" class="btn-time-zoom-btn btn-time-zoom-plus" onclick="window.transitManager && window.transitManager.increaseTimeFontSize(event, '${subwayZoomKey}')" title="9호선 도착시간 글씨 확대" aria-label="9호선 도착시간 글씨 확대">
                <span class="zoom-btn-icon">＋</span>
              </button>
              <button type="button" class="btn-time-zoom-btn btn-time-zoom-reset" onclick="window.transitManager && window.transitManager.resetTimeFontSize(event, '${subwayZoomKey}')" title="9호선 도착시간 글씨 원래대로 복귀" aria-label="9호선 도착시간 글씨 원래대로 복귀">
                <span class="zoom-btn-icon">↺</span>
              </button>
            </div>
          </div>
        </div>

        <div class="bit-desc-row">
          <span>방면: <b>${subwayDir}</b></span>
          <span class="bit-dest-pill">${isCommute ? '선유도역 탑승' : '국회의사당역 탑승'}</span>
        </div>

        <div style="margin-top:6px;">
          ${subwayTrainsHtml}
        </div>

        <div class="bit-footer-info" style="margin-top:8px;">
          <span>${infoTipText}</span>
        </div>
      </div>
    `;

    // 출근 모드: 1단계 버스(목동6단지앞) ➔ 2단계 지하철(선유도역)
    // 퇴근 모드: 1단계 지하철(국회의사당역) ➔ 2단계 버스(선유도역1번출구)
    if (isCommute) {
      this.cardsContainer.innerHTML = busHtml + subwayHtml;
    } else {
      this.cardsContainer.innerHTML = subwayHtml + busHtml;
    }

    // 도착예정시각 및 총소요시간 그래픽 전광판 카드 렌더링 (출근/퇴근 탭 바로 아래)
    this.renderCommuteEstimation(busDataMap, t1, isTimetableMode);
  }

  // ==========================================
  // 3. 시간표 모달 시스템 (9호선 / 버스 공식 시간표 팝업)
  // ==========================================
  openTimetableModal(tabType = 'subway') {
    const isCommute = (this.currentMode === 'commute');
    if (tabType === 'subway') {
      this.activeTimetableTab = isCommute ? 'seonyudo' : 'national';
    } else {
      this.activeTimetableTab = 'bus603';
    }
    this.ensureTimetableModal();
    this.renderTimetableModal();
    const modal = document.getElementById('transitTimetableModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }
  }

  closeTimetableModal() {
    const modal = document.getElementById('transitTimetableModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
  }

  switchTimetableTab(tabKey) {
    this.activeTimetableTab = tabKey;
    this.renderTimetableModal();
  }

  ensureTimetableModal() {
    if (document.getElementById('transitTimetableModal')) return;

    const modalHtml = `
      <div class="modal-overlay" id="transitTimetableModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.65); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); z-index:99999; justify-content:center; align-items:center; padding:16px;">
        <div class="modal-container" style="background:#ffffff; width:100%; max-width:440px; max-height:88vh; border-radius:18px; box-shadow:0 20px 40px rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden; border:1px solid #e2e8f0;">
          <div class="modal-header" style="background:linear-gradient(135deg, #0f172a, #1e293b); color:#ffffff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="font-size:16px;">🗓️</span>
              <strong style="font-size:15px; font-weight:800;">대중교통 공식 운행 시간표</strong>
            </div>
            <button type="button" class="modal-close-btn" onclick="window.transitManager && window.transitManager.closeTimetableModal()" style="background:rgba(255,255,255,0.15); border:none; color:#ffffff; font-size:16px; width:28px; height:28px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
          </div>

          <div style="display:flex; background:#f1f5f9; border-bottom:1px solid #cbd5e1; padding:4px 6px; gap:4px; overflow-x:auto;" id="ttTabContainer">
            <!-- 탭 버튼들 -->
          </div>

          <div class="modal-body" id="ttBodyContainer" style="padding:14px; overflow-y:auto; flex:1; font-size:12.5px; color:#334155;">
            <!-- 시간표 내용 -->
          </div>

          <div class="modal-footer" style="padding:10px 14px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:11px; color:#64748b;">💡 현재 시각 시간대는 노란색으로 강조됩니다.</span>
            <button type="button" class="btn-primary" onclick="window.transitManager && window.transitManager.closeTimetableModal()" style="background:#0284c7; color:#ffffff; border:none; padding:7px 16px; border-radius:8px; font-weight:700; cursor:pointer; font-size:12px;">닫기</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // 모달 바깥 터치 시 닫기
    const modalEl = document.getElementById('transitTimetableModal');
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) this.closeTimetableModal();
      });
    }
  }

  renderTimetableModal() {
    const tabContainer = document.getElementById('ttTabContainer');
    const bodyContainer = document.getElementById('ttBodyContainer');
    if (!tabContainer || !bodyContainer) return;

    const currentTab = this.activeTimetableTab;
    const now = new Date();
    const curH = now.getHours();
    const isHoliday = this.isWeekendOrHoliday(now);

    const tabs = [
      { key: 'seonyudo', label: '🚇 9호선 선유도' },
      { key: 'national', label: '🚇 9호선 국회의사당' },
      { key: 'bus603', label: '🚌 603번 버스' },
      { key: 'bus6620', label: '🚌 6620번 버스' }
    ];

    tabContainer.innerHTML = tabs.map(t => {
      const active = (t.key === currentTab);
      return `
        <button type="button" onclick="window.transitManager && window.transitManager.switchTimetableTab('${t.key}')"
          style="flex:1; white-space:nowrap; padding:6px 8px; border-radius:6px; font-size:11px; font-weight:${active ? '800' : '600'}; border:none; background:${active ? '#0284c7' : 'transparent'}; color:${active ? '#ffffff' : '#475569'}; cursor:pointer; transition:all 0.15s;">
          ${t.label}
        </button>
      `;
    }).join('');

    // 내용 렌더링
    let contentHtml = '';
    const schedules = this.getStationSchedules();

    if (currentTab === 'seonyudo' || currentTab === 'national') {
      const isSeonyu = (currentTab === 'seonyudo');
      const title = isSeonyu ? '9호선 선유도역 (상행 당산·중앙보훈병원 방면 일반열차)' : '9호선 국회의사당역 (하행 당산·개화 방면 일반열차)';
      const sched = isSeonyu
        ? (isHoliday ? schedules.SEONYUDO_WEEKEND : schedules.SEONYUDO_WEEKDAY)
        : (isHoliday ? schedules.NATIONAL_ASSEMBLY_WEEKEND : schedules.NATIONAL_ASSEMBLY_WEEKDAY);

      const hours = Object.keys(sched).map(Number).sort((a, b) => a - b);

      contentHtml = `
        <div style="margin-bottom:10px; padding:8px 10px; background:#eff6ff; border-radius:8px; border:1px solid #bfdbfe; font-size:11.5px; color:#1e40af;">
          <strong>${title}</strong><br>
          <span style="font-size:11px; color:#3b82f6;">운행 구분: ${isHoliday ? '🌴 주말·공휴일 시간표' : '🗓️ 평일 시간표'} (공식 정시 시간표)</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${hours.map(h => {
            const mins = sched[h];
            const isCurHour = (h === curH || (h === 24 && curH === 0));
            return `
              <div style="display:flex; align-items:center; padding:5px 8px; border-radius:6px; background:${isCurHour ? '#fef3c7' : '#f8fafc'}; border:1px solid ${isCurHour ? '#fde68a' : '#e2e8f0'};">
                <span style="width:50px; font-weight:800; color:${isCurHour ? '#b45309' : '#0f172a'}; font-size:12px;">${h === 24 ? '00' : String(h).padStart(2,'0')}시</span>
                <div style="display:flex; flex-wrap:wrap; gap:4px; flex:1;">
                  ${mins.map(m => `
                    <span style="padding:1px 5px; border-radius:4px; background:${isCurHour ? '#ffffff' : '#ffffff'}; border:1px solid ${isCurHour ? '#f59e0b' : '#cbd5e1'}; font-weight:700; font-size:11px; color:#1e293b;">
                      ${String(m).padStart(2,'0')}분
                    </span>
                  `).join('')}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // 버스 시간표 (603, 6620)
      const routeNum = (currentTab === 'bus603') ? '603' : '6620';
      const routeTitle = (currentTab === 'bus603') ? '간선 603번 (이대목동병원 15154)' : '지선 6620번 (이대목동병원 15154)';
      const ttData = (typeof BUS_TIMETABLE_15154 !== 'undefined') ? BUS_TIMETABLE_15154[routeNum] : null;

      if (ttData) {
        const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        const dayKey = dayNames[now.getDay()];
        const dayKo = ['일', '월', '화', '수', '목', '금', '토'][now.getDay()];

        const morningSched = ttData.morning?.schedules?.[dayKey] || [];
        const afternoonSched = ttData.afternoon?.schedules?.[dayKey] || [];

        contentHtml = `
          <div style="margin-bottom:10px; padding:8px 10px; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0; font-size:11.5px; color:#166534;">
            <strong>${routeTitle}</strong><br>
            <span style="font-size:11px; color:#15803d;">기준: 오늘(${dayKo}요일) 정시 기준 운행표</span>
          </div>

          <div style="margin-bottom:10px;">
            <div style="font-weight:800; font-size:12px; margin-bottom:4px; color:#0f172a;">🌅 아침 출근 시간대</div>
            <div style="display:flex; flex-wrap:wrap; gap:4px;">
              ${morningSched.length > 0 ? morningSched.map(item => `
                <span style="padding:3px 7px; border-radius:5px; background:#f8fafc; border:1px solid #cbd5e1; font-weight:700; font-size:11.5px;">${item.time}</span>
              `).join('') : '<span style="color:#94a3b8;">시간표 정보 없음</span>'}
            </div>
          </div>

          <div>
            <div style="font-weight:800; font-size:12px; margin-bottom:4px; color:#0f172a;">🌆 오후/저녁 시간대</div>
            <div style="display:flex; flex-wrap:wrap; gap:4px;">
              ${afternoonSched.length > 0 ? afternoonSched.map(item => `
                <span style="padding:3px 7px; border-radius:5px; background:#f8fafc; border:1px solid #cbd5e1; font-weight:700; font-size:11.5px;">${item.time}</span>
              `).join('') : '<span style="color:#94a3b8;">시간표 정보 없음</span>'}
            </div>
          </div>
        `;
      } else {
        contentHtml = `<div style="padding:16px; text-align:center; color:#94a3b8;">시간표 데이터 준비 중</div>`;
      }
    }

    bodyContainer.innerHTML = contentHtml;
  }

  // ==========================================
  // 4. 정류소 전체 버스 도착정보 팝업 시스템 (카카오맵 실시간 도착 스타일)
  // ARS 15-154 클릭 시 정차하는 모든 버스(6637, 571, 674, 700부천, 6018, 양천01, 603, 6620 등)의
  // 다음/다다음 버스 도착정보를 실시간 초 단위 카운트다운과 함께 팝업으로 제공
  // ==========================================

  async fetchStationBuses(arsId) {
    const cleanArsId = String(arsId).replace(/[^0-9]/g, '');
    const directUrl = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${this.stationBusApiKey}&arsId=${cleanArsId}&resultType=json`;

    // 1차: 직접 HTTP 통신
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(directUrl, {
        cache: 'no-store',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const items = data?.msgBody?.itemList;
        if (Array.isArray(items) && items.length > 0) {
          this.stationBusesCache[cleanArsId] = items;
          return items;
        }
      }
    } catch (e) {
      // 프록시 fallback
    }

    // 2차: 안전한 CORS/HTTPS 프록시 fallback (웹 브라우저 환경)
    const proxyList = [
      url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    ];

    for (const makeProxy of proxyList) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        const proxyUrl = makeProxy(directUrl);
        const res = await fetch(proxyUrl, {
          cache: 'no-store',
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const items = data?.msgBody?.itemList;
          if (Array.isArray(items) && items.length > 0) {
            this.stationBusesCache[cleanArsId] = items;
            return items;
          }
        }
      } catch (err) {}
    }

    return this.stationBusesCache[cleanArsId] || [];
  }

  openStationBusesModal(arsId = '15-154', stationName = '') {
    this.currentStationModalArsId = arsId || '15-154';
    this.currentStationModalName = stationName || (String(arsId).includes('154') ? '이대목동병원·목동6단지앞' : '선유도역1번출구·한신아파트');
    this.stationModalFilter = 'all';
    this.stationModalCountdown = 15;

    this.ensureStationBusesModal();
    const modal = document.getElementById('stationBusesModal');
    if (modal) {
      modal.style.display = 'flex';
      modal.classList.add('active');
    }

    this.loadStationBusesData(true);
    this.startStationBusesTicker();
  }

  closeStationBusesModal() {
    const modal = document.getElementById('stationBusesModal');
    if (modal) {
      modal.style.display = 'none';
      modal.classList.remove('active');
    }
    this.stopStationBusesTicker();
  }

  switchStationModalFilter(filterKey) {
    this.stationModalFilter = filterKey;
    this.renderStationBusesModal();
  }

  toggleStationModalSort(sortKey) {
    if (sortKey) {
      this.stationModalSort = sortKey;
    } else {
      this.stationModalSort = (this.stationModalSort === 'arrival') ? 'route' : 'arrival';
    }
    this.renderStationBusesModal();
  }

  triggerStationModalRefresh() {
    this.stationModalCountdown = 15;
    const btn = document.getElementById('btnRefreshStationBuses');
    if (btn) btn.classList.add('spinning');
    this.loadStationBusesData(true).finally(() => {
      if (btn) btn.classList.remove('spinning');
    });
  }

  ensureStationBusesModal() {
    if (document.getElementById('stationBusesModal')) return;

    const modalHtml = `
      <div class="modal-overlay" id="stationBusesModal" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.7); backdrop-filter:blur(5px); -webkit-backdrop-filter:blur(5px); z-index:100000; justify-content:center; align-items:center; padding:12px;">
        <div class="modal-container station-buses-container" style="background:#f8fafc; width:100%; max-width:480px; max-height:90vh; border-radius:20px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.35); display:flex; flex-direction:column; overflow:hidden; border:1px solid #cbd5e1;">
          
          <!-- 모달 상단 헤더 (카카오맵 스타일 다크 블루 그라데이션) -->
          <div class="modal-header station-modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#ffffff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; align-items:center; gap:8px; min-width:0; flex:1;">
              <span style="font-size:18px; flex-shrink:0;">🚏</span>
              <div style="min-width:0; overflow:hidden;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <strong id="stModalStationName" style="font-size:15px; font-weight:900; letter-spacing:-0.3px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">정류소 전체 버스 도착</strong>
                  <span id="stModalArsBadge" style="background:#0284c7; color:#ffffff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; flex-shrink:0;">ARS 15-154</span>
                </div>
                <div style="font-size:11px; color:#94a3b8; margin-top:2px; display:flex; align-items:center; gap:4px;">
                  <span>카카오맵 실시간 도착정보 직결</span>
                  <span>·</span>
                  <span id="stModalRefreshTimerText" style="color:#38bdf8; font-weight:700;">15초 자동갱신</span>
                </div>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
              <button type="button" id="btnRefreshStationBuses" onclick="window.transitManager && window.transitManager.triggerStationModalRefresh()" title="실시간 도착정보 새로고침" style="background:rgba(255,255,255,0.12); border:1px solid rgba(255,255,255,0.2); color:#ffffff; font-size:12px; font-weight:700; padding:5px 9px; border-radius:8px; cursor:pointer; display:inline-flex; align-items:center; gap:3px;">
                <span class="refresh-icon">🔄</span> 새로고침
              </button>
              <button type="button" class="modal-close-btn" onclick="window.transitManager && window.transitManager.closeStationBusesModal()" style="background:rgba(255,255,255,0.15); border:none; color:#ffffff; font-size:16px; width:30px; height:30px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
            </div>
          </div>

          <!-- 서브 헤더: 카테고리 필터 탭 & 정렬 버튼 바 -->
          <div style="background:#ffffff; border-bottom:1px solid #e2e8f0; padding:8px 12px; display:flex; flex-direction:column; gap:6px;">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <!-- 노선 유형별 필터 칩 -->
              <div id="stModalFilterChips" style="display:flex; gap:4px; overflow-x:auto; padding-bottom:2px; scrollbar-width:none; -webkit-overflow-scrolling:touch;">
                <!-- JS 렌더링 -->
              </div>
              <!-- 정렬 토글 -->
              <div id="stModalSortWrap" style="flex-shrink:0;">
                <!-- JS 렌더링 -->
              </div>
            </div>
          </div>

          <!-- 모달 본문: 버스 도착 카드 목록 (스크롤) -->
          <div class="modal-body" id="stModalBodyContainer" style="padding:12px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:8px; background:#f8fafc;">
            <!-- JS 렌더링 -->
          </div>

          <!-- 모달 푸터 -->
          <div class="modal-footer" style="padding:10px 14px; background:#ffffff; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
            <span id="stModalFooterInfo" style="font-size:11px; color:#64748b;">💡 서울시 TOPIS 실시간 버스도착정보 직결 전광판</span>
            <button type="button" class="btn-primary" onclick="window.transitManager && window.transitManager.closeStationBusesModal()" style="background:#0284c7; color:#ffffff; border:none; padding:7px 16px; border-radius:8px; font-weight:700; cursor:pointer; font-size:12px;">닫기</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalEl = document.getElementById('stationBusesModal');
    if (modalEl) {
      modalEl.addEventListener('click', (e) => {
        if (e.target === modalEl) this.closeStationBusesModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const m = document.getElementById('stationBusesModal');
        if (m && m.style.display !== 'none') this.closeStationBusesModal();
      }
    });
  }

  async loadStationBusesData(showLoading = false) {
    if (this.isFetchingStationBuses) return;
    this.isFetchingStationBuses = true;

    const cleanArsId = String(this.currentStationModalArsId).replace(/[^0-9]/g, '');
    const bodyContainer = document.getElementById('stModalBodyContainer');

    if (showLoading && bodyContainer && (!this.stationBusesCache[cleanArsId] || this.stationBusesCache[cleanArsId].length === 0)) {
      bodyContainer.innerHTML = `
        <div style="padding:40px 16px; text-align:center;">
          <div style="font-size:28px; animation:spin 1s infinite linear; display:inline-block; margin-bottom:10px;">🔄</div>
          <div style="font-size:14.5px; font-weight:800; color:#0284c7;">정류소 전체 버스 도착정보 수신 중...</div>
          <p style="font-size:11.5px; color:#64748b; margin-top:4px;">서울시 TOPIS 서버에서 이 정류소의 모든 버스 실시간 위치를 조회하고 있습니다.</p>
        </div>
      `;
    }

    try {
      await this.fetchStationBuses(this.currentStationModalArsId);
      this.renderStationBusesModal();
    } catch (err) {
      console.error('loadStationBusesData 오류:', err);
      if (bodyContainer) {
        bodyContainer.innerHTML = `
          <div style="padding:32px 16px; text-align:center; color:#64748b;">
            <div style="font-size:26px; margin-bottom:8px;">⚠️</div>
            <div style="font-size:14px; font-weight:800; color:#dc2626;">도착정보를 가져오지 못했습니다.</div>
            <p style="font-size:11.5px; margin-top:4px;">일시적인 통신 지연입니다. 잠시 후 다시 시도해 주세요.</p>
            <button type="button" onclick="window.transitManager && window.transitManager.loadStationBusesData(true)" style="margin-top:12px; background:#0284c7; color:#fff; border:none; padding:6px 14px; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer;">다시 시도</button>
          </div>
        `;
      }
    } finally {
      this.isFetchingStationBuses = false;
    }
  }

  getRouteBadgeStyle(routeType, rtNm) {
    const t = String(routeType);
    if (t === '2' || rtNm.startsWith('양천')) {
      return { typeName: '마을', badgeBg: '#059669', badgeColor: '#ffffff', pillBg: '#ecfdf5', pillText: '#059669', pillBorder: '#a7f3d0' };
    }
    if (t === '3') {
      return { typeName: '간선', badgeBg: '#1d4ed8', badgeColor: '#ffffff', pillBg: '#eff6ff', pillText: '#1d4ed8', pillBorder: '#bfdbfe' };
    }
    if (t === '4') {
      return { typeName: '지선', badgeBg: '#16a34a', badgeColor: '#ffffff', pillBg: '#f0fdf4', pillText: '#15803d', pillBorder: '#bbf7d0' };
    }
    if (t === '1') {
      return { typeName: '공항', badgeBg: '#b45309', badgeColor: '#ffffff', pillBg: '#fef3c7', pillText: '#b45309', pillBorder: '#fde68a' };
    }
    if (t === '8') {
      return { typeName: '경기', badgeBg: '#6366f1', badgeColor: '#ffffff', pillBg: '#eef2ff', pillText: '#4338ca', pillBorder: '#c7d2fe' };
    }
    if (t === '6') {
      return { typeName: '광역', badgeBg: '#dc2626', badgeColor: '#ffffff', pillBg: '#fef2f2', pillText: '#dc2626', pillBorder: '#fecaca' };
    }
    return { typeName: '일반', badgeBg: '#475569', badgeColor: '#ffffff', pillBg: '#f1f5f9', pillText: '#334155', pillBorder: '#cbd5e1' };
  }

  renderStationBusesModal() {
    const nameEl = document.getElementById('stModalStationName');
    const arsBadgeEl = document.getElementById('stModalArsBadge');
    const filterContainer = document.getElementById('stModalFilterChips');
    const sortWrap = document.getElementById('stModalSortWrap');
    const bodyContainer = document.getElementById('stModalBodyContainer');
    const footerInfo = document.getElementById('stModalFooterInfo');

    if (!bodyContainer) return;

    if (nameEl) nameEl.textContent = this.currentStationModalName;
    if (arsBadgeEl) arsBadgeEl.textContent = `ARS ${this.currentStationModalArsId}`;

    const cleanArsId = String(this.currentStationModalArsId).replace(/[^0-9]/g, '');
    const rawItems = this.stationBusesCache[cleanArsId] || [];

    if (rawItems.length === 0) {
      bodyContainer.innerHTML = `
        <div style="padding:32px 16px; text-align:center; color:#64748b;">
          <div style="font-size:24px; margin-bottom:8px;">🚏</div>
          <div style="font-size:14px; font-weight:800; color:#334155;">현재 도착 예정인 버스 정보가 없습니다.</div>
          <p style="font-size:11.5px; margin-top:4px;">심야 시간이거나 버스 운행 준비 중일 수 있습니다.</p>
        </div>
      `;
      return;
    }

    const now = new Date();
    const nowMs = now.getTime();

    // 1. 카테고리별 카운트 계산
    const countTotal = rawItems.length;
    const countTown = rawItems.filter(i => String(i.routeType) === '2' || i.rtNm.startsWith('양천')).length;
    const countBlue = rawItems.filter(i => String(i.routeType) === '3').length;
    const countGreen = rawItems.filter(i => String(i.routeType) === '4').length;
    const countOther = rawItems.filter(i => !['2','3','4'].includes(String(i.routeType)) && !i.rtNm.startsWith('양천')).length;

    // 필터 칩 렌더링
    if (filterContainer) {
      const filters = [
        { key: 'all', label: `전체 ${countTotal}` },
        { key: 'town', label: `마을 ${countTown}` },
        { key: 'blue', label: `간선 ${countBlue}` },
        { key: 'green', label: `지선 ${countGreen}` }
      ];
      if (countOther > 0) {
        filters.push({ key: 'other', label: `경기·공항 ${countOther}` });
      }

      filterContainer.innerHTML = filters.map(f => {
        const active = (this.stationModalFilter === f.key);
        return `
          <button type="button" onclick="window.transitManager && window.transitManager.switchStationModalFilter('${f.key}')"
            style="padding:4px 9px; border-radius:14px; font-size:11px; font-weight:${active ? '800' : '600'}; border:1px solid ${active ? '#0284c7' : '#e2e8f0'}; background:${active ? '#0284c7' : '#ffffff'}; color:${active ? '#ffffff' : '#64748b'}; cursor:pointer; white-space:nowrap; transition:all 0.15s;">
            ${f.label}
          </button>
        `;
      }).join('');
    }

    // 정렬 토글 렌더링
    if (sortWrap) {
      const isArrivalSort = (this.stationModalSort === 'arrival');
      sortWrap.innerHTML = `
        <button type="button" onclick="window.transitManager && window.transitManager.toggleStationModalSort()"
          title="정렬 기준 변경 (도착순 ↔ 노선번호순)"
          style="padding:4px 8px; border-radius:8px; font-size:10.5px; font-weight:700; border:1px solid #cbd5e1; background:#f8fafc; color:#334155; cursor:pointer; display:inline-flex; align-items:center; gap:3px;">
          <span>${isArrivalSort ? '⏱️ 도착순' : '🔤 번호순'}</span>
          <span style="font-size:9px; color:#94a3b8;">↕</span>
        </button>
      `;
    }

    // 2. 필터 적용
    let filtered = rawItems.filter(item => {
      const t = String(item.routeType);
      const isTown = (t === '2' || item.rtNm.startsWith('양천'));
      if (this.stationModalFilter === 'all') return true;
      if (this.stationModalFilter === 'town') return isTown;
      if (this.stationModalFilter === 'blue') return t === '3';
      if (this.stationModalFilter === 'green') return t === '4';
      if (this.stationModalFilter === 'other') return (!['2','3','4'].includes(t) && !isTown);
      return true;
    });

    // 3. 각 버스 파싱
    const parsedList = filtered.map(item => {
      const traTime1 = parseInt(item.traTime1 || '0', 10);
      const arrmsg1 = (item.arrmsg1 || '').trim();
      const stationNm1 = (item.stationNm1 || '').trim();
      const isArriving1 = arrmsg1.includes('곧 도착') || (traTime1 > 0 && traTime1 <= 35);
      const isWait1 = arrmsg1.includes('출발대기');
      const isEnd1 = arrmsg1.includes('운행종료');

      let sec1 = traTime1;
      if (isArriving1 && sec1 <= 0) sec1 = 25;

      // 정류장 수
      let stopText1 = '';
      const m1 = arrmsg1.match(/\[(\d+)번째\s*전\]/);
      if (m1) {
        stopText1 = `${m1[1]}번째 전`;
      } else if (item.staOrd && item.sectOrd1) {
        const diff = parseInt(item.staOrd, 10) - parseInt(item.sectOrd1, 10);
        if (diff > 0) stopText1 = `${diff}번째 전`;
      }

      // 2번째 버스
      const traTime2 = parseInt(item.traTime2 || '0', 10);
      const arrmsg2 = (item.arrmsg2 || '').trim();
      const stationNm2 = (item.stationNm2 || '').trim();
      const isArriving2 = arrmsg2.includes('곧 도착') || (traTime2 > 0 && traTime2 <= 35);
      const isWait2 = arrmsg2.includes('출발대기');
      const isEnd2 = arrmsg2.includes('운행종료');

      let sec2 = traTime2;
      if (isArriving2 && sec2 <= 0) sec2 = 50;

      let stopText2 = '';
      const m2 = arrmsg2.match(/\[(\d+)번째\s*전\]/);
      if (m2) {
        stopText2 = `${m2[1]}번째 전`;
      } else if (item.staOrd && item.sectOrd2) {
        const diff2 = parseInt(item.staOrd, 10) - parseInt(item.sectOrd2, 10);
        if (diff2 > 0) stopText2 = `${diff2}번째 전`;
      }

      // 정렬 랭크
      let rank = 1;
      let effectiveSec = sec1;
      if (isArriving1) { rank = 0; effectiveSec = 0; }
      else if (sec1 > 0) { rank = 1; effectiveSec = sec1; }
      else if (isWait1) { rank = 2; effectiveSec = 99999; }
      else if (isEnd1) { rank = 3; effectiveSec = 999999; }
      else { rank = 2; effectiveSec = 99999; }

      return {
        item,
        rank,
        effectiveSec,
        sec1,
        targetTime1: (sec1 > 0) ? (nowMs + sec1 * 1000) : null,
        arrmsg1,
        stationNm1,
        stopText1,
        isArriving1,
        isWait1,
        isEnd1,
        sec2,
        targetTime2: (sec2 > 0) ? (nowMs + sec2 * 1000) : null,
        arrmsg2,
        stationNm2,
        stopText2,
        isArriving2,
        isWait2,
        isEnd2
      };
    });

    // 4. 정렬 적용
    if (this.stationModalSort === 'arrival') {
      parsedList.sort((a, b) => {
        if (a.rank !== b.rank) return a.rank - b.rank;
        if (a.effectiveSec !== b.effectiveSec) return a.effectiveSec - b.effectiveSec;
        return a.item.rtNm.localeCompare(b.item.rtNm, undefined, { numeric: true });
      });
    } else {
      // 노선번호순
      parsedList.sort((a, b) => {
        return a.item.rtNm.localeCompare(b.item.rtNm, undefined, { numeric: true });
      });
    }

    // 5. 카카오맵 스타일 카드 렌더링
    const cardsHtml = parsedList.map(p => {
      const it = p.item;
      const badge = this.getRouteBadgeStyle(it.routeType, it.rtNm);

      // 첫 번째 버스 도착시간/상태 렌더링 (대형 폰트 고정)
      let eta1Html = '';
      if (p.isArriving1) {
        eta1Html = `<span class="k-eta k-eta-arriving" style="color:#dc2626; font-size:20px; font-weight:900;">⚡ 곧 도착</span>`;
      } else if (p.isWait1) {
        eta1Html = `<span class="k-eta k-eta-wait" style="color:#d97706; font-size:16px; font-weight:800;">⏸️ 출발대기</span>`;
      } else if (p.isEnd1) {
        eta1Html = `<span class="k-eta k-eta-end" style="color:#64748b; font-size:15px; font-weight:700;">🚫 운행종료</span>`;
      } else if (p.targetTime1) {
        eta1Html = `<span class="k-eta k-eta-live live-station-bus-countdown" data-target-time="${p.targetTime1}">${this.formatStationCountdown1(p.sec1)}</span>`;
      } else {
        eta1Html = `<span style="color:#475569; font-size:15px; font-weight:800;">${p.arrmsg1 || '운행 중'}</span>`;
      }

      // 첫 번째 버스 위치 정보 (정류장 수 + 현재 정류장명)
      let loc1Html = '';
      if (p.stopText1 || p.stationNm1) {
        const stopPill = p.stopText1 ? `<span style="background:#e0f2fe; color:#0369a1; font-weight:800; font-size:11.5px; padding:2px 6px; border-radius:4px; margin-right:4px;">${p.stopText1}</span>` : '';
        const curName = p.stationNm1 ? `<span style="color:#64748b; font-size:12px; font-weight:600;">${p.stationNm1}</span>` : '';
        loc1Html = `<span class="k-loc-wrap" style="display:inline-flex; align-items:center;">${stopPill}${curName}</span>`;
      }

      // 첫 번째 버스 도착 예정 시각 (대형 폰트 20px)
      let clock1Html = '';
      if (p.targetTime1 && !p.isWait1 && !p.isEnd1) {
        const dt1 = new Date(p.targetTime1);
        const clockStr1 = `${String(dt1.getHours()).padStart(2, '0')}:${String(dt1.getMinutes()).padStart(2, '0')}`;
        clock1Html = `
          <div style="text-align:right;">
            <span style="font-size:11px; font-weight:700; color:#64748b;">도착시각</span>
            <b style="font-size:20px; font-weight:900; color:#0284c7; letter-spacing:-0.5px; display:inline-block; margin-left:4px;">${clockStr1}</b>
          </div>
        `;
      }

      // 두 번째 버스 렌더링 (대형 폰트 16.5px ~ 17px)
      let next2Html = '';
      if (p.isEnd2) {
        next2Html = `<span style="color:#94a3b8; font-size:13.5px; font-weight:700;">다다음: 운행종료</span>`;
      } else if (p.isWait2) {
        next2Html = `<span style="color:#d97706; font-size:13.5px; font-weight:800;">다다음: ⏸️ 차고지 대기</span>`;
      } else if (p.isArriving2) {
        next2Html = `<span style="color:#dc2626; font-size:16px; font-weight:900;">다다음: ⚡ 곧 도착</span>`;
      } else if (p.targetTime2) {
        const dt2 = new Date(p.targetTime2);
        const clockStr2 = `${String(dt2.getHours()).padStart(2, '0')}:${String(dt2.getMinutes()).padStart(2, '0')}`;
        const stopTag2 = p.stopText2 ? `<span style="background:#e2e8f0; color:#475569; font-weight:800; font-size:11px; padding:1px 5px; border-radius:4px; margin-left:4px;">[${p.stopText2}]</span>` : '';
        next2Html = `
          <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:6px;">
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              <span style="color:#2563eb; font-size:11.5px; font-weight:900; display:inline-flex; align-items:center; gap:3px; background:#eff6ff; border:1px solid #dbeafe; padding:2px 6px; border-radius:4px;">
                <span style="width:6px; height:6px; border-radius:50%; background:#2563eb; display:inline-block;"></span>
                다다음 버스
              </span>
              <span class="live-station-bus-countdown2" data-target-time="${p.targetTime2}">${this.formatStationCountdown2(p.sec2)}</span>
              ${stopTag2}
            </div>
            <div style="text-align:right; margin-left:auto; flex-shrink:0;">
              <span style="font-size:11px; font-weight:700; color:#64748b;">도착시각</span>
              <b style="font-size:17px; font-weight:900; color:#1d4ed8; letter-spacing:-0.5px; display:inline-block; margin-left:3px;">${clockStr2}</b>
            </div>
          </div>
        `;
      } else if (p.arrmsg2) {
        next2Html = `<span style="font-size:13px; color:#64748b; font-weight:700;">다다음: ${p.arrmsg2}</span>`;
      }

      // 좌석 잔여/탑승 인원
      const seatInfo = it.remndrNmpr1 && parseInt(it.remndrNmpr1, 10) > 0
        ? `<span style="background:#fef3c7; color:#92400e; font-size:10px; font-weight:800; padding:1px 5px; border-radius:4px; margin-left:4px;">잔여 ${it.remndrNmpr1}석</span>`
        : '';

      return `
        <div class="k-bus-card" style="background:#ffffff; border:1px solid #e2e8f0; border-radius:14px; padding:12px 14px; box-shadow:0 2px 6px rgba(0,0,0,0.04); transition:all 0.15s ease;">
          <!-- 버스 헤더: 노선 번호 뱃지 + 방면 + 다음 정류장 -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid #f1f5f9; padding-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="background:${badge.badgeBg}; color:${badge.badgeColor}; font-size:17px; font-weight:900; padding:4px 11px; border-radius:8px; letter-spacing:0.4px; display:inline-block; line-height:1.2;">${it.rtNm}</span>
              <span style="background:${badge.pillBg}; color:${badge.pillText}; border:1px solid ${badge.pillBorder}; font-size:11px; font-weight:800; padding:2px 7px; border-radius:5px;">${badge.typeName}</span>
              ${seatInfo}
            </div>
            <div style="text-align:right;">
              <div style="font-size:13px; font-weight:800; color:#0f172a;"><strong style="color:#0369a1;">${it.adirection || ''}</strong> 방면</div>
              ${it.nxtStn ? `<div style="font-size:11px; color:#64748b; margin-top:2px;">다음: ${it.nxtStn}</div>` : ''}
            </div>
          </div>

          <!-- 🔴 다음 버스 도착 영역 (대형 글씨) -->
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-bottom:7px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="color:#dc2626; font-size:12px; font-weight:900; display:inline-flex; align-items:center; gap:4px; background:#fef2f2; border:1px solid #fee2e2; padding:2px 7px; border-radius:5px;">
                  <span style="width:7px; height:7px; border-radius:50%; background:#dc2626; display:inline-block;"></span>
                  다음 버스
                </span>
                ${loc1Html}
              </div>
              ${clock1Html}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding-top:2px;">
              <div>${eta1Html}</div>
            </div>
          </div>

          <!-- 🔵 다다음 버스 도착 영역 (대형 글씨) -->
          ${next2Html ? `
            <div style="background:#f1f5f9; border:1px solid #e2e8f0; border-radius:9px; padding:8px 12px; display:flex; align-items:center; justify-content:space-between;">
              ${next2Html}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    bodyContainer.innerHTML = cardsHtml;

    if (footerInfo) {
      footerInfo.innerHTML = `💡 서울시 TOPIS 실시간 버스도착정보 시스템 직결 (이 정류소 전체 <b>${countTotal}개</b> 노선)`;
    }
  }

  formatStationCountdown1(diffSec) {
    if (diffSec <= 0) {
      return `<span style="color:#dc2626; font-size:20px; font-weight:900;">⚡ 곧 도착</span>`;
    }
    if (diffSec < 60) {
      return `<span style="color:#dc2626; font-size:20px; font-weight:900;">${diffSec}초 후</span>`;
    }
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    const sStr = s < 10 ? '0' + s : s;
    return `<span style="color:#dc2626; font-size:20px; font-weight:900;">${m}분</span> <span style="color:#0f172a; font-size:15px; font-weight:800; margin-left:2px;">${sStr}초 후</span>`;
  }

  formatStationCountdown2(diffSec) {
    if (diffSec <= 0) {
      return `<span style="color:#dc2626; font-size:16.5px; font-weight:900;">⚡ 곧 도착</span>`;
    }
    if (diffSec < 60) {
      return `<span style="color:#dc2626; font-size:16.5px; font-weight:900;">${diffSec}초 후</span>`;
    }
    const m = Math.floor(diffSec / 60);
    const s = diffSec % 60;
    const sStr = s < 10 ? '0' + s : s;
    return `<span style="color:#2563eb; font-size:16.5px; font-weight:900;">${m}분</span> <span style="color:#0f172a; font-size:13.5px; font-weight:800; margin-left:2px;">${sStr}초 후</span>`;
  }

  startStationBusesTicker() {
    this.stopStationBusesTicker();
    this.stationModalTicker = setInterval(() => {
      this.updateStationBusesTickers();
    }, 1000);
  }

  stopStationBusesTicker() {
    if (this.stationModalTicker) {
      clearInterval(this.stationModalTicker);
      this.stationModalTicker = null;
    }
  }

  updateStationBusesTickers() {
    const modal = document.getElementById('stationBusesModal');
    if (!modal || modal.style.display === 'none') {
      this.stopStationBusesTicker();
      return;
    }

    const now = Date.now();

    // 1. 다음 버스 카운트다운 (20px 대형 유지)
    const els1 = modal.querySelectorAll('.live-station-bus-countdown');
    if (els1 && els1.length > 0) {
      els1.forEach(el => {
        const targetTime = parseInt(el.getAttribute('data-target-time'), 10);
        if (!targetTime || isNaN(targetTime)) return;

        const diffSec = Math.max(0, Math.floor((targetTime - now) / 1000));
        el.innerHTML = this.formatStationCountdown1(diffSec);
      });
    }

    // 2. 다다음 버스 카운트다운 (16.5px 대형 유지)
    const els2 = modal.querySelectorAll('.live-station-bus-countdown2');
    if (els2 && els2.length > 0) {
      els2.forEach(el => {
        const targetTime = parseInt(el.getAttribute('data-target-time'), 10);
        if (!targetTime || isNaN(targetTime)) return;

        const diffSec = Math.max(0, Math.floor((targetTime - now) / 1000));
        el.innerHTML = this.formatStationCountdown2(diffSec);
      });
    }

    // 15초 자동 새로고침 카운트다운
    if (this.stationModalCountdown > 0) {
      this.stationModalCountdown--;
    }

    const timerTextEl = document.getElementById('stModalRefreshTimerText');
    if (timerTextEl) {
      timerTextEl.textContent = `${this.stationModalCountdown}초 후 자동갱신`;
    }

    if (this.stationModalCountdown <= 0) {
      this.stationModalCountdown = 15;
      if (!this.isFetchingStationBuses) {
        this.loadStationBusesData(false);
      }
    }
  }

  /**
   * 3대 버스(양천01, 603, 6620) 중 특정 도보 도착시각 이후 가장 빨리 탈 수 있는 최적 버스 선정
   */
  findFastestBusForCommute(routes, busDataMap, reachTimeMs, now, nowMs) {
    const routeBestList = [];

    routes.forEach(r => {
      const item = busDataMap ? busDataMap[r.routeNum] : null;
      const { next, next2, next3 } = this.parseSeoulBusArrival(r, item, now, nowMs);
      const headway = this.getRouteHeadwaySec ? this.getRouteHeadwaySec(r.routeNum, now) : 360;

      // 노선의 실시간/시간표 버스 목록 수집
      const busList = [];
      if (next && next.targetTime && !next.isWait && !next.isEnd) {
        busList.push({ targetTime: next.targetTime, label: '다음', plainNo: next.plainNo || '' });
      }
      if (next2 && next2.targetTime && !next2.isWait && !next2.isEnd) {
        busList.push({ targetTime: next2.targetTime, label: '다다음', plainNo: next2.plainNo || '' });
      }
      if (next3 && next3.targetTime) {
        busList.push({ targetTime: next3.targetTime, label: '다다다음', plainNo: '' });
      }

      // 1. reachTimeMs 이후에 오는 버스가 이미 목록에 있다면
      let candidate = busList.find(b => b.targetTime >= reachTimeMs);

      // 만약 candidate가 있더라도 대기시간이 해당 노선 배차간격보다 길다면,
      // 지하철 시각 차이가 버스 고정시각에 삼켜지지 않도록 정규 순환 배차 반영
      if (candidate && (candidate.targetTime - reachTimeMs) > headway * 1000) {
        const cycleTime = reachTimeMs + Math.max(60000, Math.round((headway * 1000) * 0.45));
        candidate = {
          targetTime: cycleTime,
          label: `${r.routeNum} 순환배차`,
          plainNo: candidate.plainNo || ''
        };
      } else if (!candidate) {
        // 목록의 버스들이 모두 지나갔거나 없는 경우 배차간격 기준으로 차기 배차 투영
        let baseTimeMs = (busList.length > 0)
          ? busList[busList.length - 1].targetTime
          : nowMs;
        
        let count = 0;
        while (baseTimeMs < reachTimeMs && count < 20) {
          baseTimeMs += headway * 1000;
          count++;
        }

        candidate = {
          targetTime: baseTimeMs,
          label: count > 1 ? `차기 ${count}회차` : '차기 배차',
          plainNo: ''
        };
      }

      routeBestList.push({
        routeNum: r.routeNum,
        badgeClass: r.badgeClass,
        label: candidate.label,
        targetTime: candidate.targetTime,
        plainNo: candidate.plainNo || '',
        waitMin: Math.max(0, Math.round((candidate.targetTime - reachTimeMs) / 60000))
      });
    });

    // 3개 노선(양천01, 603, 6620) 중 정류장 도착 후 가장 빨리 오는(targetTime 최소) 버스 선택!
    // 동점 시 배차간격이 가장 짧은 양천01 우선
    routeBestList.sort((a, b) => {
      if (a.targetTime !== b.targetTime) return a.targetTime - b.targetTime;
      if (a.routeNum === '양천01') return -1;
      if (b.routeNum === '양천01') return 1;
      return 0;
    });

    return routeBestList[0];
  }

  /**
   * 특정 도보 도착시각 이후 가장 빨리 탈 수 있는 지하철(실시간 or 역사시간표) 선정
   */
  findFastestSubwayForCommute(reachTimeMs, isCommute, isTimetableMode, t1, t2) {
    const reachDate = new Date(reachTimeMs);
    const trains = this.getPrioritizedTrains ? this.getPrioritizedTrains(reachDate, isCommute, 12) : [];

    const ttTrain = (trains && trains.length > 0)
      ? trains.find(tr => tr.targetTime >= reachTimeMs) || trains[0]
      : null;

    if (isTimetableMode) {
      if (ttTrain) {
        return {
          departureTime: ttTrain.departureTime,
          trainNo: '',
          targetTime: ttTrain.targetTime,
          isLive: false,
          modeTag: '시간표'
        };
      }
    }

    let liveDelayMs = 0;
    if (t1 && t1.targetTime) {
      const nowMs = Date.now();
      const schedFirst = this.getPrioritizedTrains ? this.getPrioritizedTrains(new Date(nowMs), isCommute, 1)?.[0] : null;
      if (schedFirst && schedFirst.targetTime) {
        liveDelayMs = t1.targetTime - schedFirst.targetTime;
      }
    }

    const liveList = [];
    if (t1 && t1.targetTime && t1.targetTime >= reachTimeMs) liveList.push(t1);
    if (t2 && t2.targetTime && t2.targetTime >= reachTimeMs) liveList.push(t2);

    if (liveList.length > 0) {
      liveList.sort((a, b) => a.targetTime - b.targetTime);
      const sel = liveList[0];
      return {
        departureTime: sel.clockStr || sel.departureTime,
        trainNo: sel.trainNo || '',
        targetTime: sel.targetTime,
        isLive: true,
        modeTag: '실시간'
      };
    }

    if (ttTrain) {
      let adjTargetTime = ttTrain.targetTime + liveDelayMs;
      if (adjTargetTime < reachTimeMs && trains.length > 1) {
        const nextTt = trains.find(tr => (tr.targetTime + liveDelayMs) >= reachTimeMs) || trains[1];
        adjTargetTime = nextTt.targetTime + liveDelayMs;
      }
      const adjDate = new Date(adjTargetTime);
      const adjClock = `${String(adjDate.getHours()).padStart(2, '0')}:${String(adjDate.getMinutes()).padStart(2, '0')}`;
      return {
        departureTime: adjClock,
        trainNo: (t1 && t1.trainNo) ? t1.trainNo : '',
        targetTime: adjTargetTime,
        isLive: true,
        modeTag: '실시간'
      };
    }

    const fbMs = reachTimeMs + 4 * 60000;
    const d = new Date(fbMs);
    return {
      departureTime: `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`,
      trainNo: '',
      targetTime: fbMs,
      isLive: false,
      modeTag: '예상'
    };
  }

  /**
   * 실시간 도보/버스/지하철 연계 출퇴근 예상 소요시간 및 도착예정시각 계산 엔진
   */
  calculateCommuteEstimation(busDataMap, liveSubwayTrain = null, isTimetableMode = false) {
    const isCommute = (this.currentMode === 'commute');
    const now = new Date();
    const nowMs = now.getTime();

    const WALK_OFFICE_SUB = 9;        // 회사 ↔ 국회의사당역 승강장 (도보 9분)
    const WALK_SUB_BUS_TRANSIT = 3;   // 선유도역 승강장 ↔ 선유도역1번출구 버스정류장 (도보 3분)
    const WALK_HOME_BUS = 9;          // 목동6단지 버스정류장 ↔ 집 (도보 9분)
    // 도보 합계: 9 + 3 + 9 = 21분

    const RIDE_SUBWAY = 4;            // 9호선 일반열차 두 정거장(선유도 ↔ 당산 ↔ 국회의사당) 공식 운행 소요시간: 정확히 4분
    const RIDE_BUS = 3;               // 버스(선유도역1번출구 ↔ 목동6단지앞) 승차 이동: 3분
    // 승차 합계: 4 + 3 = 7분

    if (isCommute) {
      // [출근] 집 ➔ 도보 9분 ➔ 6단지 정류장 ➔ 버스 3분 ➔ 선유도역 ➔ 도보 3분 환승 ➔ 지하철 4분 ➔ 국회의사당역 ➔ 도보 9분 ➔ 회사
      const t0 = new Date(nowMs);
      const t_reach_bus = new Date(nowMs + WALK_HOME_BUS * 60 * 1000);
      const config = this.busConfigs.commute;

      // 6단지 정류장 도착(t_reach_bus) 이후 가장 빠른 버스 (양천01, 603, 6620)
      const chosenBus = this.findFastestBusForCommute(config.routes, busDataMap, t_reach_bus.getTime(), now, nowMs);
      const t_bus_board = new Date(chosenBus.targetTime);
      const busWaitMin = Math.max(0, Math.round((t_bus_board.getTime() - t_reach_bus.getTime()) / 60000));

      // 버스 3분 승차 후 선유도역 하차
      const t_drop_bus = new Date(t_bus_board.getTime() + RIDE_BUS * 60 * 1000);
      // 선유도역 9호선 승강장 환승 도보 3분
      const t_reach_sub = new Date(t_drop_bus.getTime() + WALK_SUB_BUS_TRANSIT * 60 * 1000);

      // 선유도역 승강장 도착(t_reach_sub) 이후 탑승 가능한 9호선 열차 (시간표 vs 실시간)
      const chosenTrain = this.findFastestSubwayForCommute(t_reach_sub.getTime(), true, isTimetableMode, liveSubwayTrain, null);
      const t_sub_board = new Date(chosenTrain.targetTime);
      const subWaitMin = Math.max(0, Math.round((t_sub_board.getTime() - t_reach_sub.getTime()) / 60000));

      // 9호선 두 정거장 4분 승차 후 국회의사당역 하차
      const t_drop_sub = new Date(t_sub_board.getTime() + RIDE_SUBWAY * 60 * 1000);
      // 국회의사당역에서 회사까지 도보 9분
      const t_final = new Date(t_drop_sub.getTime() + WALK_OFFICE_SUB * 60 * 1000);

      // 총 소요시간: 도보 21분 + 승차 7분 + 버스 대기 + 지하철 대기 (절대 어긋남 없는 수학적 합계)
      const totalMinutes = 21 + 7 + busWaitMin + subWaitMin;

      return {
        mode: 'commute',
        startTime: t0,
        t_reach_bus,
        chosenBus,
        t_bus_board,
        busWaitMin,
        t_drop_bus,
        t_reach_sub,
        chosenTrain,
        t_sub_board,
        subWaitMin,
        t_drop_sub,
        t_final,
        totalMinutes
      };
    } else {
      // [퇴근] 회사 ➔ 도보 9분 ➔ 국회의사당역 ➔ 지하철 4분 ➔ 선유도역 ➔ 도보 3분 환승 ➔ 버스 3분 ➔ 6단지 ➔ 도보 9분 ➔ 집
      const t0 = new Date(nowMs);
      const t_reach_sub = new Date(nowMs + WALK_OFFICE_SUB * 60 * 1000);

      // 국회의사당역 승강장 도착(t_reach_sub) 이후 탑승 가능한 9호선 열차 (시간표 vs 실시간)
      const chosenTrain = this.findFastestSubwayForCommute(t_reach_sub.getTime(), false, isTimetableMode, liveSubwayTrain, null);
      const t_sub_board = new Date(chosenTrain.targetTime);
      const subWaitMin = Math.max(0, Math.round((t_sub_board.getTime() - t_reach_sub.getTime()) / 60000));

      // 9호선 두 정거장 4분 승차 후 선유도역 하차
      const t_drop_sub = new Date(t_sub_board.getTime() + RIDE_SUBWAY * 60 * 1000);
      // 선유도역 1번출구 버스정류장 환승 도보 3분
      const t_reach_bus = new Date(t_drop_sub.getTime() + WALK_SUB_BUS_TRANSIT * 60 * 1000);

      const config = this.busConfigs.offwork;
      // 선유도역 버스정류장 도착(t_reach_bus) 이후 탈 수 있는 가장 빠른 버스 (양천01, 603, 6620)
      const chosenBus = this.findFastestBusForCommute(config.routes, busDataMap, t_reach_bus.getTime(), now, nowMs);
      const t_bus_board = new Date(chosenBus.targetTime);
      const busWaitMin = Math.max(0, Math.round((t_bus_board.getTime() - t_reach_bus.getTime()) / 60000));

      // 버스 3분 승차 후 목동6단지앞 하차
      const t_drop_bus = new Date(t_bus_board.getTime() + RIDE_BUS * 60 * 1000);
      // 목동6단지에서 집까지 도보 9분
      const t_final = new Date(t_drop_bus.getTime() + WALK_HOME_BUS * 60 * 1000);

      // 총 소요시간: 도보 21분 + 승차 7분 + 지하철 대기 + 버스 대기
      const totalMinutes = 21 + 7 + busWaitMin + subWaitMin;

      return {
        mode: 'offwork',
        startTime: t0,
        t_reach_sub,
        chosenTrain,
        t_sub_board,
        subWaitMin,
        t_drop_sub,
        t_reach_bus,
        chosenBus,
        t_bus_board,
        busWaitMin,
        t_drop_bus,
        t_final,
        totalMinutes
      };
    }
  }

  renderCommuteEstimation(busDataMap, t1 = null, isTimetableMode = false) {
    if (!this.commuteSummaryContainer) {
      this.commuteSummaryContainer = document.getElementById('commuteEstimationSummaryBox') || document.getElementById('estimationSummaryBox');
    }
    if (!this.commuteSummaryContainer) return;

    const est = this.calculateCommuteEstimation(busDataMap, t1, isTimetableMode);
    if (!est) return;

    const isCommute = (est.mode === 'commute');
    const destName = isCommute ? '회사' : '집';

    const fmtTime = (d) => {
      if (!d) return '--:--';
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    };

    const fmtClockFull = (d) => {
      if (!d) return '--:--';
      const h = d.getHours();
      const m = d.getMinutes();
      const ampm = h >= 12 ? '오후' : '오전';
      const h12 = h % 12 === 0 ? 12 : h % 12;
      const mStr = String(m).padStart(2, '0');
      return `${ampm} ${h12}시 ${mStr}분`;
    };

    const busPlateNum = est.chosenBus?.plainNo ? (est.chosenBus.plainNo.length > 4 ? est.chosenBus.plainNo.slice(-4) : est.chosenBus.plainNo) : '';
    const busPlateStr = busPlateNum ? ` <span class="dark-red-num">(${busPlateNum})</span>` : '';
    const busLabelBadge = `<b style="color:#0369a1;">${est.chosenBus?.routeNum || '버스'}</b> (${est.chosenBus?.label || '다음'})${busPlateStr}`;

    const subModeTag = isTimetableMode ? '[🗓️시간표]' : '[⚡실시간]';
    const trainLabelBadge = `<b style="color:#1d4ed8;">9호선 일반 (${est.chosenTrain?.departureTime || est.chosenTrain?.clockStr || ''} 탑승 ${subModeTag})</b>`;

    const stepsHtml = isCommute ? `
      <!-- Step 1: 집 출발 -->
      <div class="est-timeline-step">
        <div class="est-step-node start">🏠</div>
        <div class="est-step-content">
          <span class="est-step-name">집 출발</span>
          <span class="est-step-clock">${fmtTime(est.startTime)}</span>
        </div>
      </div>
      <div class="est-timeline-line"><span class="est-timeline-line-label">🚶 도보 9분 이동 (6단지 도착: ${fmtTime(est.t_reach_bus)})</span></div>

      <!-- Step 2: 6단지 버스정류장 -->
      <div class="est-timeline-step">
        <div class="est-step-node">🚌</div>
        <div class="est-step-content est-step-bus">
          <div>
            <div class="est-step-name">6단지 버스정류장 ➔ ${busLabelBadge}</div>
            <div class="est-step-detail">🚌 버스 승차${busPlateStr} (대기 약 ${est.busWaitMin}분 / 3분 이동)</div>
          </div>
          <span class="est-step-clock est-clock-bus">${fmtTime(est.t_bus_board)} 탑승</span>
        </div>
      </div>
      <div class="est-timeline-line"><span class="est-timeline-line-label">🚶 선유도역 하차 ${fmtTime(est.t_drop_bus)} ➔ 환승 도보 3분 (승강장 도착: ${fmtTime(est.t_reach_sub)})</span></div>

      <!-- Step 3: 선유도역 9호선 탑승 -->
      <div class="est-timeline-step">
        <div class="est-step-node">🚇</div>
        <div class="est-step-content est-step-subway">
          <div>
            <div class="est-step-name">선유도역 승강장 ➔ ${trainLabelBadge}</div>
            <div class="est-step-detail">🚇 9호선 일반 (대기 약 ${est.subWaitMin}분 / 두 정거장 4분 이동)</div>
          </div>
          <span class="est-step-clock est-clock-subway">${fmtTime(est.t_sub_board)} 탑승</span>
        </div>
      </div>
      <div class="est-timeline-line"><span class="est-timeline-line-label">🚶 국회의사당역 하차 ${fmtTime(est.t_drop_sub)} ➔ 회사 도보 9분 이동</span></div>

      <!-- Step 4: 회사 도착 -->
      <div class="est-timeline-step">
        <div class="est-step-node end">🎯</div>
        <div class="est-step-content est-final-step">
          <span class="est-step-name est-final-name">🏢 회사 도착 예정</span>
          <span class="est-step-clock highlight-arr-clock">${fmtClockFull(est.t_final)}</span>
        </div>
      </div>
    ` : `
      <!-- Step 1: 회사 출발 -->
      <div class="est-timeline-step">
        <div class="est-step-node start">🏢</div>
        <div class="est-step-content">
          <span class="est-step-name">회사 출발</span>
          <span class="est-step-clock">${fmtTime(est.startTime)}</span>
        </div>
      </div>
      <div class="est-timeline-line"><span class="est-timeline-line-label">🚶 도보 9분 이동 (국회의사당역 승강장 도착: ${fmtTime(est.t_reach_sub)})</span></div>

      <!-- Step 2: 국회의사당역 탑승 -->
      <div class="est-timeline-step">
        <div class="est-step-node">🚇</div>
        <div class="est-step-content est-step-subway">
          <div>
            <div class="est-step-name">국회의사당역 승강장 ➔ ${trainLabelBadge}</div>
            <div class="est-step-detail">🚇 9호선 일반 탑승 (대기 약 ${est.subWaitMin}분 / 두 정거장 4분 이동)</div>
          </div>
          <span class="est-step-clock est-clock-subway">${fmtTime(est.t_sub_board)} 탑승</span>
        </div>
      </div>
      <div class="est-timeline-line"><span class="est-timeline-line-label">🚶 선유도역 하차 ${fmtTime(est.t_drop_sub)} ➔ 환승 도보 3분 (정류장 도착: ${fmtTime(est.t_reach_bus)})</span></div>

      <!-- Step 3: 선유도역 버스정류장 탑승 -->
      <div class="est-timeline-step">
        <div class="est-step-node">🚌</div>
        <div class="est-step-content est-step-bus">
          <div>
            <div class="est-step-name">선유도역1번출구 ➔ ${busLabelBadge}</div>
            <div class="est-step-detail">🚌 버스 승차${busPlateStr} (대기 약 ${est.busWaitMin}분 / 3분 이동)</div>
          </div>
          <span class="est-step-clock est-clock-bus">${fmtTime(est.t_bus_board)} 탑승</span>
        </div>
      </div>
      <div class="est-timeline-line"><span class="est-timeline-line-label">🚶 6단지 하차 ${fmtTime(est.t_drop_bus)} ➔ 집 도보 9분 이동</span></div>

      <!-- Step 4: 집 도착 -->
      <div class="est-timeline-step">
        <div class="est-step-node end">🎯</div>
        <div class="est-step-content est-final-step">
          <span class="est-step-name est-final-name">🏠 집 도착 예정</span>
          <span class="est-step-clock highlight-arr-clock">${fmtClockFull(est.t_final)}</span>
        </div>
      </div>
    `;

    if (!this.commuteDetailContainer) {
      this.commuteDetailContainer = document.getElementById('commuteEstimationDetailBox');
    }

    this.commuteSummaryContainer.innerHTML = `
      <div class="est-summary-card est-header-only-card est-value-updated">
        <div class="est-main-header">
          <div class="est-dest-title">
            <span class="est-dest-icon">${isCommute ? '🏢' : '🏠'}</span>
            <div class="est-dest-text">
              <div class="est-dep-time">지금(${fmtTime(est.startTime)}) 출발 기준</div>
              <div class="est-dest-label"><span class="est-total-min">${est.totalMinutes}분</span> 소요 예상</div>
            </div>
          </div>
          <div class="est-arr-box">
            <span class="est-arr-sub">도착 예정 시각</span>
            <span class="est-arr-time">${fmtClockFull(est.t_final)}</span>
          </div>
        </div>
      </div>
    `;

    const detailHtml = `
      <div class="est-summary-card est-detail-timeline-card">
        <div class="est-detail-title-bar est-title-tworow">
          <div class="est-title-top-row">
            <span class="est-title-main">🧭 <b>${isCommute ? '출근' : '퇴근'} 이동 경로 및 순차 시각표</b></span>
          </div>
          <div class="est-title-sub-row">
            <span class="est-mode-badge">${isTimetableMode ? '🗓️ 시간표 모드' : '⚡ 실시간 모드'}</span>
            <span class="est-detail-badge">도보 21분 + 두정거장 4분 연계</span>
          </div>
        </div>
        <div class="est-timeline-flow">
          ${stepsHtml}
        </div>
        <div class="est-breakdown-bar">
          <span>💡 소요시간 구성: 🚶 도보 21분 (9+3+9) + 🚏 대기 ${est.busWaitMin + est.subWaitMin}분 + 🚍 승차 7분 (지하철 4분+버스 3분) = <b>총 ${est.totalMinutes}분 소요</b></span>
        </div>
      </div>
    `;

    if (this.commuteDetailContainer) {
      this.commuteDetailContainer.innerHTML = detailHtml;
    } else {
      this.commuteSummaryContainer.querySelector('.est-summary-card').insertAdjacentHTML('beforeend', detailHtml);
    }
  }

  triggerManualRefresh(btn = null) {
    this.refreshCountdown = this.REFRESH_INTERVAL;
    if (btn) {
      btn.classList.add('spinning');
      const originalText = btn.innerHTML;
      btn.innerHTML = '🔄 수신중';
      this.loadAllData(true).finally(() => {
        btn.innerHTML = '✅ 완료';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('spinning');
        }, 700);
      });
    } else {
      this.loadAllData(true);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  window.transitManager = new TransitManager();
  window.openStationBusesModal = (arsId, name) => {
    if (window.transitManager) window.transitManager.openStationBusesModal(arsId, name);
  };
  window.closeStationBusesModal = () => {
    if (window.transitManager) window.transitManager.closeStationBusesModal();
  };
});
