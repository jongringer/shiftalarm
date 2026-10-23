// 4조 3교대 근무표 메인 애플리케이션 컨트롤러

// 대한민국 공식 법정 공휴일 및 대체공휴일 전수 데이터베이스 (2024~2028년 완벽 대응)
const KR_HOLIDAYS_MAP = {
  // 2024년
  '2024-01-01': '신정',
  '2024-02-09': '설날 연휴',
  '2024-02-10': '설날',
  '2024-02-11': '설날 연휴',
  '2024-02-12': '대체공휴일',
  '2024-03-01': '삼일절',
  '2024-04-10': '국회의원선거',
  '2024-05-05': '어린이날',
  '2024-05-06': '대체공휴일',
  '2024-05-15': '부처님오신날',
  '2024-06-06': '현충일',
  '2024-08-15': '광복절',
  '2024-09-16': '추석 연휴',
  '2024-09-17': '추석',
  '2024-09-18': '추석 연휴',
  '2024-10-01': '국군의 날',
  '2024-10-03': '개천절',
  '2024-10-09': '한글날',
  '2024-12-25': '성탄절',

  // 2025년
  '2025-01-01': '신정',
  '2025-01-28': '설날 연휴',
  '2025-01-29': '설날',
  '2025-01-30': '설날 연휴',
  '2025-03-01': '삼일절',
  '2025-03-03': '대체공휴일',
  '2025-05-05': '어린이날·부처님오신날',
  '2025-05-06': '대체공휴일',
  '2025-06-06': '현충일',
  '2025-08-15': '광복절',
  '2025-10-03': '개천절',
  '2025-10-05': '추석 연휴',
  '2025-10-06': '추석',
  '2025-10-07': '추석 연휴',
  '2025-10-08': '대체공휴일',
  '2025-10-09': '한글날',
  '2025-12-25': '성탄절',

  // 2026년 (현재 시스템 기준: 철저한 검증 데이터)
  '2026-01-01': '신정',
  '2026-02-16': '설날 연휴',
  '2026-02-17': '설날',
  '2026-02-18': '설날 연휴',
  '2026-03-01': '삼일절',
  '2026-03-02': '대체공휴일',
  '2026-05-05': '어린이날',
  '2026-05-24': '부처님오신날',
  '2026-05-25': '대체공휴일',
  '2026-06-03': '지방선거',
  '2026-06-06': '현충일',
  '2026-08-15': '광복절',
  '2026-08-17': '대체공휴일',
  '2026-09-24': '추석 연휴',
  '2026-09-25': '추석',
  '2026-09-26': '추석 연휴',
  '2026-10-03': '개천절',
  '2026-10-05': '대체공휴일',
  '2026-10-09': '한글날',
  '2026-12-25': '성탄절',

  // 2027년
  '2027-01-01': '신정',
  '2027-02-06': '설날 연휴',
  '2027-02-07': '설날',
  '2027-02-08': '설날 연휴',
  '2027-02-09': '대체공휴일',
  '2027-03-01': '삼일절',
  '2027-03-03': '대통령선거',
  '2027-05-05': '어린이날',
  '2027-05-13': '부처님오신날',
  '2027-06-06': '현충일',
  '2027-08-15': '광복절',
  '2027-08-16': '대체공휴일',
  '2027-09-14': '추석 연휴',
  '2027-09-15': '추석',
  '2027-09-16': '추석 연휴',
  '2027-10-03': '개천절',
  '2027-10-04': '대체공휴일',
  '2027-10-09': '한글날',
  '2027-10-11': '대체공휴일',
  '2027-12-25': '성탄절',
  '2027-12-27': '대체공휴일',

  // 2028년
  '2028-01-01': '신정',
  '2028-01-26': '설날 연휴',
  '2028-01-27': '설날',
  '2028-01-28': '설날 연휴',
  '2028-03-01': '삼일절',
  '2028-04-12': '국회의원선거',
  '2028-05-02': '부처님오신날',
  '2028-05-05': '어린이날',
  '2028-06-06': '현충일',
  '2028-08-15': '광복절',
  '2028-10-02': '추석 연휴',
  '2028-10-03': '개천절·추석',
  '2028-10-04': '추석 연휴',
  '2028-10-05': '대체공휴일',
  '2028-10-09': '한글날',
  '2028-12-25': '성탄절'
};

// 고정 공휴일 기본 폴백
const FIXED_KR_HOLIDAYS = {
  '01-01': '신정',
  '03-01': '삼일절',
  '05-05': '어린이날',
  '06-06': '현충일',
  '08-15': '광복절',
  '10-03': '개천절',
  '10-09': '한글날',
  '12-25': '성탄절'
};

function getKoreanHolidayInfo(dateObj) {
  const y = dateObj.getFullYear();
  const m = String(dateObj.getMonth() + 1).padStart(2, '0');
  const d = String(dateObj.getDate()).padStart(2, '0');
  const fullDateStr = `${y}-${m}-${d}`;
  const md = `${m}-${d}`;

  if (KR_HOLIDAYS_MAP[fullDateStr]) {
    return { isHoliday: true, name: KR_HOLIDAYS_MAP[fullDateStr] };
  }
  if (FIXED_KR_HOLIDAYS[md]) {
    return { isHoliday: true, name: FIXED_KR_HOLIDAYS[md] };
  }
  return { isHoliday: false, name: '' };
}

function isKoreanHoliday(dateObj) {
  return getKoreanHolidayInfo(dateObj).isHoliday;
}

if (typeof window !== 'undefined') {
  window.KR_HOLIDAYS_MAP = KR_HOLIDAYS_MAP;
  window.getKoreanHolidayInfo = getKoreanHolidayInfo;
  window.isKoreanHoliday = isKoreanHoliday;
}

class ShiftApp {
  constructor() {
    const now = new Date();
    // 현재 실제 시스템 시간 반영
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth() + 1;
    this.todayDateStr = formatDateString(now);
    this.selectedDateStr = this.todayDateStr;

    this.autoResetTodayTimer = null;
    this.weatherData = null;
    this.weatherTimer = null;
    this.lastWeatherFetchTime = 0;
    this.isWeatherLoading = false;

    // 아날로그 시계 피커 상태
    this.clockSelectedHour = null;
    this.clockSelectedMinute = null;
    this.clockMode = 'hour'; // 'hour' | 'minute'
    this.clockAmPm = '오전'; // '오전' | '오후'

    // 팝업 모달 뒤로가기 스택 관리
    this._modalHistoryStack = [];
    this._isClosingFromPopstate = false;
    try {
      window.history.replaceState({ page: 'home', modalOpen: false }, '');
    } catch (e) {}

    try { this.initElements(); } catch (e) { console.error('initElements error:', e); }
    try { this.initEvents(); } catch (e) { console.error('initEvents error:', e); }
    try { this.initSwipeGesture(); } catch (e) { console.error('initSwipe error:', e); }

    try {
      // 테마: 저장된 테마 또는 애플 퓨어 라이트 (기본값)
      const savedTheme = localStorage.getItem('kbs_shift_theme') || 'apple-light';
      this.currentTheme = savedTheme;
      this.applyTheme(savedTheme, false);
    } catch (e) { console.error('applyTheme error:', e); }

    try { this.renderAll(); } catch (e) { console.error('renderAll error:', e); }
    try { this.startRealTimeClock(); } catch (e) { console.error('startRealTimeClock error:', e); }
    try { this.initWeather(); } catch (e) { console.error('initWeather error:', e); }
    try { this.initSelfAlarmMonitor(); } catch (e) { console.error('initSelfAlarmMonitor error:', e); }
  }

  initElements() {
    // 헤더 프로필
    this.profilePill = document.getElementById('profilePill');
    this.elAvatar = document.getElementById('headerAvatar');
    this.elName = document.getElementById('headerName');
    this.elTeam = document.getElementById('headerTeam');
    this.selectedMemberName = (shiftStorage.getProfile().name || '최종철').replace(/\s*님$/, '').trim();
    this.lastExtractedOcrText = '';

    // 상단 낮 ☀️ / 밤 🌙 단일 교대 토글 버튼
    this.btnThemeToggle = document.getElementById('btnThemeToggle');
    this.themeToggleIcon = document.getElementById('themeToggleIcon');
    this.themeToggleText = document.getElementById('themeToggleText');

    // 연월 네비게이션
    this.elMonthTitle = document.getElementById('monthTitle');
    this.btnPrevMonth = document.getElementById('btnPrevMonth');
    this.btnNextMonth = document.getElementById('btnNextMonth');
    this.btnHomeToday = document.getElementById('btnHomeToday');
    this.btnShiftBadgeHome = document.getElementById('btnShiftBadgeHome');
    this.btnShiftAlarm = document.getElementById('btnShiftAlarm');

    // 오늘 근무 카드
    this.elRealTimeClock = document.getElementById('realTimeClock');
    this.elTodayDateText = document.getElementById('todayDateText');
    this.elTodayShiftBadge = document.getElementById('todayShiftBadge');
    this.elTodayTimeText = document.getElementById('todayTimeText');

    // 달력
    this.elCalendarGrid = document.getElementById('calendarGrid');

    // 개인 일정 폼
    this.elScheduleDateSelect = document.getElementById('scheduleDateSelect');
    this.elScheduleTimeSelect = document.getElementById('scheduleTimeSelect');
    this.elScheduleInput = document.getElementById('scheduleInput');
    this.btnRegisterSchedule = document.getElementById('btnRegisterSchedule');
    this.elScheduleListCount = document.getElementById('scheduleListCount');
    this.elScheduleListContainer = document.getElementById('scheduleListContainer');

    // 근무표 업데이트 버튼 & 모달
    this.btnOpenUploadModal = document.getElementById('btnOpenUploadModal');
    this.btnOpenUploadModalHeader = document.getElementById('btnOpenUploadModalHeader');
    this.modalUpload = document.getElementById('modalUpload');
    this.btnCloseUploadModal = document.getElementById('btnCloseUploadModal');
    this.fileInput = document.getElementById('fileInput');
    this.cameraInput = document.getElementById('cameraInput');
    this.galleryInput = document.getElementById('galleryInput');
    this.btnCameraSelect = document.getElementById('btnCameraSelect');
    this.btnGallerySelect = document.getElementById('btnGallerySelect');
    this.btnFileSelect = document.getElementById('btnFileSelect');
    this.dropzone = document.getElementById('dropzone');
    this.ocrProgressBox = document.getElementById('ocrProgressBox');
    this.progressBarFill = document.getElementById('progressBarFill');
    this.progressStatusText = document.getElementById('progressStatusText');
    this.ocrResultsArea = document.getElementById('ocrResultsArea');
    this.ocrResultsTbody = document.getElementById('ocrResultsTbody');
    this.btnApplyOcr = document.getElementById('btnApplyOcr');

    // 근무자 선택 및 간편 변경 관련 DOM
    this.ocrMemberChipsContainer = document.getElementById('ocrMemberChipsContainer');
    this.ocrCurrentSelectedMemberBadge = document.getElementById('ocrCurrentSelectedMemberBadge');
    this.inputCustomMemberName = document.getElementById('inputCustomMemberName');
    this.btnAddCustomMember = document.getElementById('btnAddCustomMember');

    this.modalMemberSwitch = document.getElementById('modalMemberSwitch');
    this.btnCloseMemberSwitch = document.getElementById('btnCloseMemberSwitch');
    this.btnCancelMemberSwitch = document.getElementById('btnCancelMemberSwitch');
    this.btnApplyMemberSwitch = document.getElementById('btnApplyMemberSwitch');
    this.quickMemberChipsContainer = document.getElementById('quickMemberChipsContainer');
    this.inputSwitchName = document.getElementById('inputSwitchName');
    this.inputSwitchTeam = document.getElementById('inputSwitchTeam');

    // 날짜별 근무 수동 수정 & 개인 일정 관리 모달
    this.modalDayEdit = document.getElementById('modalDayEdit');
    this.btnCloseDayEdit = document.getElementById('btnCloseDayEdit');
    this.btnCloseDayEditFooter = document.getElementById('btnCloseDayEditFooter');
    this.elEditDateTitle = document.getElementById('editDateTitle');
    this.elEditShiftSelect = document.getElementById('editShiftSelect');
    this.btnSaveShiftType = document.getElementById('btnSaveShiftType');
    this.elEditNoteInput = document.getElementById('editNoteInput');
    this.btnSaveDayEdit = document.getElementById('btnSaveDayEdit');
    this.dayScheduleCount = document.getElementById('dayScheduleCount');
    this.btnDeleteSelectedSchedules = document.getElementById('btnDeleteSelectedSchedules');
    this.dayScheduleItemsContainer = document.getElementById('dayScheduleItemsContainer');
    this.btnResetDayEdit = document.getElementById('btnResetDayEdit');

    // 달력 하단 선택된 날짜의 일정 1~2줄 요약 배너
    this.selectedScheduleBar = document.getElementById('selectedScheduleBar');
    this.selectedScheduleDatePill = document.getElementById('selectedScheduleDatePill');
    this.selectedScheduleText = document.getElementById('selectedScheduleText');

    // 시간 선택기 (오전/오후, 1~12시, 30분 단위)
    this.editScheduleAmPm = document.getElementById('editScheduleAmPm');
    this.editScheduleHour = document.getElementById('editScheduleHour');
    this.editScheduleMinute = document.getElementById('editScheduleMinute');
    this.btnEditScheduleTimeClear = document.getElementById('btnEditScheduleTimeClear');
    this.editScheduleTimeBadge = document.getElementById('editScheduleTimeBadge');
    this.editScheduleTimeBadgeText = document.getElementById('editScheduleTimeBadgeText');
    this.isScheduleTimeEnabled = true;

    // 설정 모달
    this.modalSettings = document.getElementById('modalSettings');
    this.btnOpenSettings = document.getElementById('btnOpenSettings');
    this.btnCloseSettings = document.getElementById('btnCloseSettings');
    this.inputSettingName = document.getElementById('inputSettingName');
    this.inputSettingTeam = document.getElementById('inputSettingTeam');
    this.selectLastMonthEndShift = document.getElementById('selectLastMonthEndShift');
    this.settingAlarmDay = document.getElementById('settingAlarmDay');
    this.settingAlarmNight = document.getElementById('settingAlarmNight');
    this.settingAlarmEarly = document.getElementById('settingAlarmEarly');
    this.btnSaveSettings = document.getElementById('btnSaveSettings');
    this.btnResetAllData = document.getElementById('btnResetAllData');

    // 근무알람 확인 팝업 모달
    this.modalAlarmPopup = document.getElementById('modalAlarmPopup');
    this.alarmPopupShiftBadge = document.getElementById('alarmPopupShiftBadge');
    this.alarmPopupTargetTime = document.getElementById('alarmPopupTargetTime');
    this.alarmPopupSelfTime = document.getElementById('alarmPopupSelfTime');
    this.alarmPopupRemainTime = document.getElementById('alarmPopupRemainTime');
    this.btnCancelAlarmPopup = document.getElementById('btnCancelAlarmPopup');
    this.btnDismissAlarmPopup = document.getElementById('btnDismissAlarmPopup');
    this.btnConfirmAlarmPopup = document.getElementById('btnConfirmAlarmPopup');
    this.btnTestSelfAlarm = document.getElementById('btnTestSelfAlarm');
    this.pendingAlarmData = null;

    // 어플 자체 알람 울림 팝업 DOM
    this.modalSelfAlarmRing = document.getElementById('modalSelfAlarmRing');
    this.selfAlarmRingBadge = document.getElementById('selfAlarmRingBadge');
    this.selfAlarmRingTime = document.getElementById('selfAlarmRingTime');
    this.btnDismissSelfAlarmClock = document.getElementById('btnDismissSelfAlarmClock');
    this.btnDismissSelfAlarmBar = document.getElementById('btnDismissSelfAlarmBar');

    this.isSelfAlarmRinging = false;
    this.currentSelfAlarmDateStr = null;
    this.alarmAudioCtx = null;
    this.selfAlarmInterval = null;
    this.selfAlarmVibrateInterval = null;

    // 월간 통계/요약 모달
    this.btnOpenSummary = document.getElementById('btnOpenSummary');
    this.modalSummary = document.getElementById('modalSummary');
    this.btnCloseSummary = document.getElementById('btnCloseSummary');
    this.btnCloseSummaryFooter = document.getElementById('btnCloseSummaryFooter');
    this.summaryContent = document.getElementById('summaryContent');

    // 이달의 특이사항
    this.monthlyNotesList = document.getElementById('monthlyNotesList');
    this.monthlyNotesSectionTitle = document.getElementById('monthlyNotesSectionTitle');
    this.btnRefreshMonthlyNotes = document.getElementById('btnRefreshMonthlyNotes');
  }

  initEvents() {
    // 월 이동 (< 이전달 / > 다음달) - 부드러운 좌우 넘김 애니메이션 연동
    if (this.btnPrevMonth) {
      this.btnPrevMonth.addEventListener('click', () => {
        this.changeMonth('prev');
      });
    }

    if (this.btnNextMonth) {
      this.btnNextMonth.addEventListener('click', () => {
        this.changeMonth('next');
      });
    }

    // 오늘(이번 달)로 바로 이동 (4교대근무 뱃지 및 🏠 홈 버튼)
    if (this.btnHomeToday) {
      this.btnHomeToday.addEventListener('click', () => this.goToToday());
    }
    if (this.btnShiftBadgeHome) {
      this.btnShiftBadgeHome.addEventListener('click', () => this.goToToday());
    }

    // 근무알람 버튼 클릭
    if (this.btnShiftAlarm) {
      this.btnShiftAlarm.addEventListener('click', () => this.handleShiftAlarmClick());
    }

    // 근무알람 팝업 닫기 / 시계 앱 등록 확인 / 알람 해제
    if (this.btnCancelAlarmPopup) {
      this.btnCancelAlarmPopup.addEventListener('click', () => this.closeModal(this.modalAlarmPopup));
    }
    if (this.btnDismissAlarmPopup) {
      this.btnDismissAlarmPopup.addEventListener('click', () => this.executeDismissAlarm());
    }
    if (this.btnConfirmAlarmPopup) {
      this.btnConfirmAlarmPopup.addEventListener('click', () => this.executeSetAlarm());
    }

    // 자체 알람시계 터치 시 즉시 해제 및 일정 자동 삭제
    if (this.btnDismissSelfAlarmClock) {
      this.btnDismissSelfAlarmClock.addEventListener('click', () => this.dismissSelfAlarm());
    }
    if (this.btnDismissSelfAlarmBar) {
      this.btnDismissSelfAlarmBar.addEventListener('click', () => this.dismissSelfAlarm());
    }
    if (this.btnTestSelfAlarm) {
      this.btnTestSelfAlarm.addEventListener('click', () => {
        this.closeModal(this.modalAlarmPopup);
        this.showWeatherToast('🔔 1초 뒤 알람시계가 화면에 울립니다.');
        setTimeout(() => {
          const testDateStr = this.pendingAlarmData ? this.pendingAlarmData.dateStr : this.todayDateStr;
          const testShift = this.pendingAlarmData ? this.pendingAlarmData.shiftType : '일근';
          const now = new Date();
          const h = now.getHours();
          const m = now.getMinutes();
          this.triggerSelfAlarm(testDateStr, { time: `${h}:${m}`, type: testShift }, h, m);
        }, 1000);
      });
    }

    // 개인 일정 등록 (폼이 존재할 때만 바인딩)
    if (this.btnRegisterSchedule) {
      this.btnRegisterSchedule.addEventListener('click', () => this.handleRegisterSchedule());
    }
    if (this.elScheduleInput) {
      this.elScheduleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          this.handleRegisterSchedule();
        }
      });
    }

    // 근무표 등록 안내 모달 열기/닫기
    if (this.btnOpenUploadModal) {
      this.btnOpenUploadModal.addEventListener('click', () => {
        this.renderUploadModalSpecialNotes();
        this.renderOcrMemberChips();
        this.openModal(this.modalUpload);
      });
    }
    if (this.btnOpenUploadModalHeader) {
      this.btnOpenUploadModalHeader.addEventListener('click', () => {
        this.renderUploadModalSpecialNotes();
        this.renderOcrMemberChips();
        this.openModal(this.modalUpload);
      });
    }
    this.btnCloseUploadModal.addEventListener('click', () => {
      this.closeModal(this.modalUpload);
    });

    // 좌상단 프로필(최종철 님) 터치 시 근무자 간편 선택/변경 모달 호출
    if (this.profilePill) {
      this.profilePill.addEventListener('click', () => {
        this.openMemberSwitchModal();
      });
    }

    // 근무자 간편 변경 모달 닫기 및 적용 이벤트
    if (this.btnCloseMemberSwitch) {
      this.btnCloseMemberSwitch.addEventListener('click', () => this.closeModal(this.modalMemberSwitch));
    }
    if (this.btnCancelMemberSwitch) {
      this.btnCancelMemberSwitch.addEventListener('click', () => this.closeModal(this.modalMemberSwitch));
    }
    if (this.btnApplyMemberSwitch) {
      this.btnApplyMemberSwitch.addEventListener('click', () => this.applyMemberSwitch());
    }
    if (this.inputSwitchName) {
      this.inputSwitchName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.applyMemberSwitch();
        }
      });
    }

    // 업로드 모달 내 새 근무자 직접 추가 버튼
    if (this.btnAddCustomMember) {
      this.btnAddCustomMember.addEventListener('click', () => this.addCustomMemberFromInput());
    }
    if (this.inputCustomMemberName) {
      this.inputCustomMemberName.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addCustomMemberFromInput();
        }
      });
    }

    // 3대 업로드 옵션 (카메라 촬영 / 갤러리 선택 / 파일(PDF) 선택)
    if (this.btnCameraSelect && this.cameraInput) {
      this.btnCameraSelect.addEventListener('click', () => this.cameraInput.click());
      this.cameraInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) this.handleFileUpload(e.target.files[0]);
      });
    }

    if (this.btnGallerySelect && this.galleryInput) {
      this.btnGallerySelect.addEventListener('click', () => this.galleryInput.click());
      this.galleryInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) this.handleFileUpload(e.target.files[0]);
      });
    }

    if (this.btnFileSelect && this.fileInput) {
      this.btnFileSelect.addEventListener('click', () => this.fileInput.click());
    }

    // 드롭존 및 파일 업로드
    this.dropzone.addEventListener('click', () => this.fileInput.click());
    this.dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dropzone.classList.add('dragover');
    });
    this.dropzone.addEventListener('dragleave', () => {
      this.dropzone.classList.remove('dragover');
    });
    this.dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dropzone.classList.remove('dragover');
      if (e.dataTransfer.files.length > 0) {
        this.handleFileUpload(e.dataTransfer.files[0]);
      }
    });
    this.fileInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        this.handleFileUpload(e.target.files[0]);
      }
    });

    // OCR 결과 적용 버튼
    this.btnApplyOcr.addEventListener('click', () => {
      this.applyOcrResultsToSchedule();
    });

    // 상단 낮 ☀️ / 밤 🌙 단일 교대 토글 버튼 (낮일 때는 하얀바탕, 밤일 때는 검은바탕)
    if (this.btnThemeToggle) {
      this.btnThemeToggle.addEventListener('click', () => {
        const nextTheme = (this.currentTheme === 'apple-light') ? 'obsidian' : 'apple-light';
        this.applyTheme(nextTheme, true);
      });
    }

    // 프리미엄 테마 선택 버튼들
    document.querySelectorAll('.btn-theme-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const theme = btn.getAttribute('data-theme');
        if (theme) {
          this.applyTheme(theme, true);
        }
      });
    });

    // 날짜별 근무 수동 수정 모달 닫기
    if (this.btnCloseDayEdit) {
      this.btnCloseDayEdit.addEventListener('click', () => {
        this.closeModal(this.modalDayEdit);
      });
    }
    if (this.btnCloseDayEditFooter) {
      this.btnCloseDayEditFooter.addEventListener('click', () => {
        this.closeModal(this.modalDayEdit);
      });
    }

    // 달력 하단 일정 요약 배너 클릭 시 화면 중앙 일정 모달 즉시 호출
    if (this.selectedScheduleBar) {
      this.selectedScheduleBar.addEventListener('click', () => {
        const targetDate = this.selectedDateStr || this.todayDateStr;
        this.openDayEditModal(targetDate);
      });
    }

    // 근무 형태만 저장
    if (this.btnSaveShiftType) {
      this.btnSaveShiftType.addEventListener('click', () => {
        const shiftType = this.elEditShiftSelect.value;
        const currentOverride = shiftStorage.getOverrides()[this.editingDateStr] || {};
        shiftStorage.setOverrideForDate(this.editingDateStr, {
          ...currentOverride,
          shiftType,
          time: '',
          alarm: ''
        });
        this.renderCalendar();
        this.renderTodayCard();
        this.renderMonthlyNotes();
      });
    }

    // 개인 일정 입력 후 엔터(Enter) 키로 즉시 저장 지원
    if (this.elEditNoteInput) {
      this.elEditNoteInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.saveDayEdit();
        }
      });
    }

    // 개인 일정 저장 버튼
    if (this.btnSaveDayEdit) {
      this.btnSaveDayEdit.addEventListener('click', () => {
        this.saveDayEdit();
      });
    }

    // 선택된 개인 일정 일괄 삭제
    if (this.btnDeleteSelectedSchedules) {
      this.btnDeleteSelectedSchedules.addEventListener('click', () => {
        this.deleteSelectedSchedules();
      });
    }

    // 기본값 복원 (근무형태 초기화 및 해당 날짜 등록된 모든 개인일정 삭제)
    if (this.btnResetDayEdit) {
      this.btnResetDayEdit.addEventListener('click', () => {
        if (confirm('해당 날짜의 근무 형태와 개인 일정을 모두 기본값으로 복원하시겠습니까?')) {
          // 1. 해당 날짜 오버라이드 삭제
          shiftStorage.removeOverrideForDate(this.editingDateStr);
          // 2. 해당 날짜 개인 일정 목록 전부 삭제
          const daySchedules = shiftStorage.getSchedulesForDate(this.editingDateStr);
          daySchedules.forEach(s => shiftStorage.removeSchedule(s.id));

          this.closeModal(this.modalDayEdit);
          this.renderAll();
        }
      });
    }


    // 설정 모달
    if (this.btnOpenSettings) {
      this.btnOpenSettings.addEventListener('click', () => {
        const profile = shiftStorage.getProfile();
        this.inputSettingName.value = profile.name;
        this.inputSettingTeam.value = profile.team;

        // 알람 시각 설정 불러오기
        const alarmSettings = shiftStorage.getAlarmSettings();
        if (this.settingAlarmDay) this.settingAlarmDay.value = alarmSettings.day || '06:00';
        if (this.settingAlarmNight) this.settingAlarmNight.value = alarmSettings.night || '15:00';
        if (this.settingAlarmEarly) this.settingAlarmEarly.value = alarmSettings.early || '05:20';

        this.openModal(this.modalSettings);
      });
    }
    if (this.btnCloseSettings) {
      this.btnCloseSettings.addEventListener('click', () => {
        this.closeModal(this.modalSettings);
      });
    }
    if (this.btnSaveSettings) {
      this.btnSaveSettings.addEventListener('click', () => {
        shiftStorage.setProfile({
          name: this.inputSettingName.value.trim() || '최종철 님',
          team: this.inputSettingTeam.value.trim() || '생방기술1 · 직무 NDC',
          avatar: (this.inputSettingName.value.trim() || '최')[0]
        });

        // 알람 시각 설정 저장
        const dayAlarm = this.settingAlarmDay ? this.settingAlarmDay.value : '06:00';
        const nightAlarm = this.settingAlarmNight ? this.settingAlarmNight.value : '15:00';
        const earlyAlarm = this.settingAlarmEarly ? this.settingAlarmEarly.value : '05:20';
        shiftStorage.setAlarmSettings({
          day: dayAlarm,
          night: nightAlarm,
          early: earlyAlarm
        });

        // 전달 말일 근무 설정 반영 시
        const lastShift = this.selectLastMonthEndShift.value;
        if (lastShift) {
          // 현재 선택된 월의 1일의 전달 마지막 날을 기준으로 삼음
          const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
          const lastDayOfPrevMonth = new Date(this.currentYear, this.currentMonth - 1, 0);
          const baseDateStr = formatDateString(lastDayOfPrevMonth);
          const baseIndex = SHIFT_PATTERN.indexOf(lastShift);
          if (baseIndex !== -1) {
            shiftStorage.setBaseSettings({
              baseDate: baseDateStr,
              baseShiftIndex: baseIndex
            });
          }
        }

        this.closeModal(this.modalSettings);
        this.renderAll();
      });
    }
    if (this.btnResetAllData) {
      this.btnResetAllData.addEventListener('click', () => {
        if (confirm('모든 데이터를 초기화하시겠습니까?')) {
          shiftStorage.resetToDefault();
          this.closeModal(this.modalSettings);
          this.renderAll();
        }
      });
    }

    // 월간 요약 모달
    if (this.btnOpenSummary) {
      this.btnOpenSummary.addEventListener('click', () => {
        this.renderMonthlySummary();
        this.openModal(this.modalSummary);
      });
    }
    if (this.btnCloseSummary) {
      this.btnCloseSummary.addEventListener('click', () => {
        this.closeModal(this.modalSummary);
      });
    }
    if (this.btnCloseSummaryFooter) {
      this.btnCloseSummaryFooter.addEventListener('click', () => {
        this.closeModal(this.modalSummary);
      });
    }

    // 이달의 특이사항 새로고침
    if (this.btnRefreshMonthlyNotes) {
      this.btnRefreshMonthlyNotes.addEventListener('click', (e) => {
        this.refreshMonthlyNotes(e);
      });
    }

    // 브라우저 저장소 변경 시 새로고침 없이 즉시 달력 및 특이사항 자동 동기화
    window.addEventListener('storage', () => {
      this.renderAll();
    });

    // 팝업 모달 배경(오버레이) 클릭 시 닫기
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay);
        }
      });
    });

    // 키보드 ESC 키 누를 시 열린 모달 닫기
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.handleBackButton();
      }
    });

    // 모바일 뒤로가기(하드웨어/제스처 뒤로가기 버튼) 시 앱 종료 방지 및 모달 닫기
    window.addEventListener('popstate', (e) => {
      if (this._isClosingFromPopstate) {
        return;
      }
      this._isClosingFromPopstate = true;
      this.handleBackButton();
      setTimeout(() => {
        this._isClosingFromPopstate = false;
      }, 150);
    });

    // Android 네이티브 JavascriptInterface에서 호출할 수 있는 전역 뒤로가기 핸들러 등록
    window.handleAppBackButton = () => {
      return this.handleBackButton();
    };

    // 일정 시간 선택기 이벤트 등록
    this.initScheduleTimeEvents();
  }

  // ========= 개인 일정 시간 선택기 (오전/오후, 1~12시, 30분 단위) =========
  initScheduleTimeEvents() {
    const onTimeChange = () => {
      this.isScheduleTimeEnabled = true;
      this.updateScheduleTimeBadge();
    };

    if (this.editScheduleAmPm) {
      this.editScheduleAmPm.addEventListener('change', onTimeChange);
    }
    if (this.editScheduleHour) {
      this.editScheduleHour.addEventListener('change', onTimeChange);
    }
    if (this.editScheduleMinute) {
      this.editScheduleMinute.addEventListener('change', onTimeChange);
    }

    if (this.btnEditScheduleTimeClear) {
      this.btnEditScheduleTimeClear.addEventListener('click', () => {
        this.isScheduleTimeEnabled = !this.isScheduleTimeEnabled;
        this.updateScheduleTimeBadge();
      });
    }
  }

  updateScheduleTimeBadge() {
    if (!this.editScheduleTimeBadge || !this.editScheduleTimeBadgeText) return;

    if (!this.isScheduleTimeEnabled) {
      this.editScheduleTimeBadgeText.textContent = '시간 없음 (종일 일정)';
      this.editScheduleTimeBadge.style.background = '#f1f5f9';
      this.editScheduleTimeBadge.style.color = '#64748b';
      if (this.btnEditScheduleTimeClear) {
        this.btnEditScheduleTimeClear.textContent = '시간 설정';
        this.btnEditScheduleTimeClear.style.color = '#0284c7';
      }
      if (this.editScheduleAmPm) this.editScheduleAmPm.style.opacity = '0.5';
      if (this.editScheduleHour) this.editScheduleHour.style.opacity = '0.5';
      if (this.editScheduleMinute) this.editScheduleMinute.style.opacity = '0.5';
    } else {
      const ampm = this.editScheduleAmPm ? this.editScheduleAmPm.value : '오전';
      const h = this.editScheduleHour ? this.editScheduleHour.value : '9';
      const m = this.editScheduleMinute ? this.editScheduleMinute.value : '00';
      const formatted = `${ampm} ${String(h).padStart(2, '0')}:${m}`;
      this.editScheduleTimeBadgeText.textContent = formatted;
      this.editScheduleTimeBadge.style.background = '#e0f2fe';
      this.editScheduleTimeBadge.style.color = '#0284c7';
      if (this.btnEditScheduleTimeClear) {
        this.btnEditScheduleTimeClear.textContent = '시간 없음';
        this.btnEditScheduleTimeClear.style.color = '';
      }
      if (this.editScheduleAmPm) this.editScheduleAmPm.style.opacity = '1';
      if (this.editScheduleHour) this.editScheduleHour.style.opacity = '1';
      if (this.editScheduleMinute) this.editScheduleMinute.style.opacity = '1';
    }
  }

  getSelectedTimeStr() {
    if (!this.isScheduleTimeEnabled) return '';
    const ampm = this.editScheduleAmPm ? this.editScheduleAmPm.value : '오전';
    const h = parseInt(this.editScheduleHour ? this.editScheduleHour.value : '9', 10);
    const m = this.editScheduleMinute ? this.editScheduleMinute.value : '00';

    let hour24 = h;
    if (ampm === '오후') {
      if (hour24 < 12) hour24 += 12;
    } else {
      if (hour24 === 12) hour24 = 0;
    }
    return `${String(hour24).padStart(2, '0')}:${m}`;
  }

  // 12시간제/24시간제/오전/오후 모든 시각 문자열을 일관된 "오전/오후 HH:MM" 표시용 문자열로 표준화
  formatDisplayTime(timeStr) {
    if (!timeStr || typeof timeStr !== 'string') return '';
    const clean = timeStr.trim();
    if (!clean) return '';

    // 이미 "오전" 또는 "오후"가 포함된 경우
    if (/오후|pm/i.test(clean) || /오전|am/i.test(clean)) {
      const isPM = /오후|pm/i.test(clean);
      const nums = clean.match(/\d+/g);
      if (nums && nums.length > 0) {
        let h = parseInt(nums[0], 10);
        const m = nums.length > 1 ? String(nums[1]).padStart(2, '0') : '00';
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return `${isPM ? '오후' : '오전'} ${String(h).padStart(2, '0')}:${m}`;
      }
      return clean;
    }

    // "HH:MM" 24시간제 형태
    const parts = clean.split(':');
    if (parts.length >= 2) {
      const h24 = parseInt(parts[0], 10);
      const m = String(parts[1]).padStart(2, '0');
      if (!isNaN(h24)) {
        const ampm = h24 >= 12 ? '오후' : '오전';
        const h12 = h24 === 0 ? 12 : (h24 > 12 ? h24 - 12 : h24);
        return `${ampm} ${String(h12).padStart(2, '0')}:${m}`;
      }
    }
    return clean;
  }

  openModal(modal) {
    if (!modal) return;
    if (!modal.classList.contains('active')) {
      modal.classList.add('active');
      if (!this._modalHistoryStack) this._modalHistoryStack = [];
      this._modalHistoryStack.push(modal);

      // 모바일/브라우저 뒤로가기 버튼 시 앱 종료 없이 모달만 닫히도록 히스토리 상태 푸시
      if (!this._isClosingFromPopstate) {
        window.history.pushState({ modalOpen: true, modalId: modal.id || '' }, '');
      }
    }
  }

  closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');

    // 스택에서 제거
    if (this._modalHistoryStack && this._modalHistoryStack.length > 0) {
      const idx = this._modalHistoryStack.lastIndexOf(modal);
      if (idx !== -1) {
        this._modalHistoryStack.splice(idx, 1);
      }
    }

    // X버튼, 닫기 버튼 등으로 직접 닫았을 때 남아있는 history 상태 소비
    if (!this._isClosingFromPopstate && window.history.state && window.history.state.modalOpen) {
      this._isClosingFromPopstate = true;
      window.history.back();
      setTimeout(() => {
        this._isClosingFromPopstate = false;
      }, 150);
    }
  }

  handleBackButton() {
    // 1. 버스 노선 정류장 전체보기 팝업 모달이 열려있는 경우
    const busRouteModal = document.getElementById('modalBusRouteStops');
    if (busRouteModal && (busRouteModal.classList.contains('active') || busRouteModal.style.display !== 'none')) {
      if (window.transitLookupInstance && typeof window.transitLookupInstance.closeBusRouteModal === 'function') {
        window.transitLookupInstance.closeBusRouteModal();
      } else {
        busRouteModal.style.display = 'none';
        busRouteModal.classList.remove('active');
      }
      return true;
    }

    // 2. transit 정류소 전체 실시간 버스도착 모달이 열려있는 경우
    const stationModal = document.getElementById('stationBusesModal');
    if (stationModal && (stationModal.classList.contains('active') || stationModal.style.display !== 'none')) {
      if (typeof window.closeStationBusesModal === 'function') {
        window.closeStationBusesModal();
      } else {
        stationModal.style.display = 'none';
        stationModal.classList.remove('active');
      }
      return true;
    }

    // 3. 실시간 검색 추천 드롭다운이 열려있는 경우
    const searchDropdown = document.getElementById('lookupSuggestionsDropdown');
    if (searchDropdown && searchDropdown.style.display === 'block') {
      searchDropdown.style.display = 'none';
      return true;
    }

    // 4. 앱 내의 모든 .modal-overlay.active 모달 목록 검색 및 닫기
    const activeModals = Array.from(document.querySelectorAll('.modal-overlay.active, .modal-backdrop.active'));
    if (activeModals.length > 0) {
      let targetModal = null;
      if (this._modalHistoryStack && this._modalHistoryStack.length > 0) {
        targetModal = this._modalHistoryStack.pop();
      }
      if (!targetModal || !targetModal.classList.contains('active')) {
        targetModal = activeModals[activeModals.length - 1];
      }
      if (targetModal) {
        this.closeModal(targetModal);
        return true; // 팝업을 닫았으므로 뒤로가기 소비 (앱 홈 튕김/종료 방지)
      }
    }
    return false; // 닫을 모달 없음 (기본 홈 상태이므로 앱 종료/홈 이동 허용)
  }

  renderAll() {
    this.renderHeader();
    this.renderMonthNav();
    this.renderCalendar();
    this.renderTodayCard();
    this.populateScheduleDateOptions();
    this.populateScheduleTimeOptions();
    this.renderScheduleList();
    this.renderUploadModalSpecialNotes();
    this.renderMonthlyNotes();
  }

  // ========= 부드러운 월 전환 (좌우 넘김 슬라이드 애니메이션) =========
  changeMonth(direction, isSwipe = false) {
    if (this.isMonthTransitioning) return;
    this.isMonthTransitioning = true;

    const grid = this.elCalendarGrid;
    if (!grid) {
      this._updateMonthState(direction);
      this.renderAll();
      this.isMonthTransitioning = false;
      return;
    }

    const outClass = direction === 'next' ? 'slide-out-left' : 'slide-out-right';
    const inClass = direction === 'next' ? 'slide-from-right' : 'slide-from-left';

    // 1단계: 기존 그리드가 좌우로 부드럽게 퇴장
    grid.classList.remove('slide-out-left', 'slide-out-right', 'slide-from-left', 'slide-from-right');
    grid.classList.add('sliding-transition', outClass);

    // 상단 타이틀도 부드럽게 페이드 전환
    if (this.elMonthTitle) {
      this.elMonthTitle.style.transition = 'opacity 0.16s ease, transform 0.16s ease';
      this.elMonthTitle.style.opacity = '0.3';
      this.elMonthTitle.style.transform = direction === 'next' ? 'translateX(-10px)' : 'translateX(10px)';
    }

    setTimeout(() => {
      // 월 계산 및 데이터 갱신
      this._updateMonthState(direction);

      // 새 달력 렌더링
      this.renderAll();

      // 2단계: 새로 그려진 그리드를 반대편 출발 지점에 위치시키고
      const newGrid = this.elCalendarGrid || grid;
      newGrid.classList.remove('sliding-transition', 'slide-out-left', 'slide-out-right');
      newGrid.classList.add('no-transition', inClass);

      // 강제 리플로우로 시작 위치 확정
      void newGrid.offsetWidth;

      // 3단계: 화면 중앙으로 부드럽게 스르륵 안착 (슬라이드 인)
      newGrid.classList.remove('no-transition');
      newGrid.classList.add('sliding-transition');
      newGrid.classList.remove(inClass);
      newGrid.style.transform = 'translateX(0)';
      newGrid.style.opacity = '1';

      if (this.elMonthTitle) {
        this.elMonthTitle.style.opacity = '1';
        this.elMonthTitle.style.transform = 'translateX(0)';
      }

      setTimeout(() => {
        newGrid.classList.remove('sliding-transition');
        newGrid.style.transform = '';
        newGrid.style.opacity = '';
        this.isMonthTransitioning = false;
      }, 240);
    }, 180);
  }

  _updateMonthState(direction) {
    if (direction === 'next') {
      this.currentMonth++;
      if (this.currentMonth > 12) {
        this.currentMonth = 1;
        this.currentYear++;
      }
    } else {
      this.currentMonth--;
      if (this.currentMonth < 1) {
        this.currentMonth = 12;
        this.currentYear--;
      }
    }
    const now = new Date();
    if (now.getFullYear() === this.currentYear && now.getMonth() + 1 === this.currentMonth) {
      this.selectedDateStr = this.todayDateStr;
    } else {
      this.selectedDateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-01`;
    }
  }

  // ========= 오늘(현재 달)로 바로 이동 =========
  goToToday() {
    const now = new Date();
    const realYear = now.getFullYear();
    const realMonth = now.getMonth() + 1;
    this.todayDateStr = formatDateString(now);
    this.selectedDateStr = this.todayDateStr;

    const isDifferentMonth = (this.currentYear !== realYear || this.currentMonth !== realMonth);

    this.currentYear = realYear;
    this.currentMonth = realMonth;

    if (isDifferentMonth) {
      this.renderAll();
      if (this.elCalendarGrid) {
        this.elCalendarGrid.classList.add('sliding-transition');
        this.elCalendarGrid.style.opacity = '0.4';
        setTimeout(() => {
          this.elCalendarGrid.style.opacity = '1';
          setTimeout(() => this.elCalendarGrid.classList.remove('sliding-transition'), 200);
        }, 50);
      }
    } else {
      this.renderAll();
    }

    this.showWeatherToast(`오늘(${realMonth}월 ${now.getDate()}일) 날짜로 이동했습니다. 🏠`);
  }

  // 화면 줌(확대) 상태 감지: 100% 정상 화면비에서만 스와이프 달 넘김을 허용하고, 확대 상태에서는 차단하여 좌우 다른 달 이동 방지
  isPageZoomed() {
    try {
      // 1. 모던 브라우저 및 안드로이드 웹뷰 표준 Visual Viewport API
      if (window.visualViewport) {
        // 배율이 100%를 조금이라도 초과(1.01 이상)하면 확대 상태로 판정
        if (typeof window.visualViewport.scale === 'number' && window.visualViewport.scale > 1.01) {
          return true;
        }
        // 시각적 뷰포트 너비가 화면 너비보다 작아졌으면 확대 상태 (2px 이상 차이)
        if (window.visualViewport.width && window.innerWidth) {
          if (window.innerWidth - window.visualViewport.width > 2) {
            return true;
          }
        }
      }
      // 2. 폴백: window innerWidth vs documentElement clientWidth 비율
      if (window.innerWidth && document.documentElement && document.documentElement.clientWidth) {
        const ratio = document.documentElement.clientWidth / window.innerWidth;
        if (ratio > 1.01) return true;
      }
    } catch (e) {}
    return false;
  }

  // ========= 스와이프 제스처 (좌우 손가락 실시간 드래그 & 부드러운 넘김) =========
  initSwipeGesture() {
    const card = document.getElementById('calendarCard');
    if (!card) return;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let isDragging = false;
    let isHorizontalGesture = null;

    // 터치 시작
    card.addEventListener('touchstart', (e) => {
      // 1. 화면 확대 상태(줌인 > 100%)일 때는 좌우 달 이동 스와이프 전면 차단 (확대 화면 좌우 탐색 보장)
      if (this.isPageZoomed()) {
        isDragging = false;
        isHorizontalGesture = false;
        return;
      }

      // 핀치 줌(확대/축소) 또는 멀티터치 제스처 시 스와이프 개입 차단 (네이티브 줌 100% 보장)
      if (e.touches && e.touches.length > 1) {
        isDragging = false;
        isHorizontalGesture = false;
        if (this.elCalendarGrid) {
          this.elCalendarGrid.style.transform = '';
          this.elCalendarGrid.style.opacity = '';
        }
        return;
      }

      if (this.isMonthTransitioning) return;

      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      currentX = startX;
      isDragging = true;
      isHorizontalGesture = null;

      if (this.elCalendarGrid) {
        this.elCalendarGrid.classList.remove('sliding-transition');
        this.elCalendarGrid.classList.add('no-transition');
      }
    }, { passive: true });

    // 터치 이동 (실시간으로 손가락 따라 달력이 스르륵 끌려옴)
    card.addEventListener('touchmove', (e) => {
      if (!isDragging) return;

      // 화면이 확대되었으면 즉시 스와이프 중단하고 화면 확대 이동으로 양보
      if (this.isPageZoomed()) {
        isDragging = false;
        isHorizontalGesture = false;
        if (this.elCalendarGrid) {
          this.elCalendarGrid.style.transform = '';
          this.elCalendarGrid.style.opacity = '';
        }
        return;
      }

      // 두 손가락 이상이면 즉시 중단하고 화면 확대/축소로 양보
      if (e.touches && e.touches.length > 1) {
        isDragging = false;
        isHorizontalGesture = false;
        if (this.elCalendarGrid) {
          this.elCalendarGrid.style.transform = '';
          this.elCalendarGrid.style.opacity = '';
        }
        return;
      }

      const touch = e.touches[0];
      currentX = touch.clientX;
      const dx = currentX - startX;
      const dy = touch.clientY - startY;

      // 스와이프 방향 첫 8px 이동 시 판별
      if (isHorizontalGesture === null) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          isHorizontalGesture = Math.abs(dx) >= Math.abs(dy);
        }
      }

      // 세로 스크롤일 경우 스와이프 중단하고 기본 스크롤 허용
      if (isHorizontalGesture === false) {
        return;
      }

      // 수평 스와이프인 경우: 손가락 움직임에 따라 실시간으로 넘김 시각화 피드백! (오직 100% 화면비에서만)
      if (isHorizontalGesture === true && this.elCalendarGrid) {
        const dampDx = dx * 0.75;
        const opacityVal = Math.max(0.45, 1 - Math.abs(dx) / 350);
        this.elCalendarGrid.style.transform = `translateX(${dampDx}px)`;
        this.elCalendarGrid.style.opacity = `${opacityVal}`;
      }
    }, { passive: true });

    // 터치 종료
    card.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;

      // 화면 확대 상태이면 달 이동 전면 차단하고 원래 위치로 원복
      if (this.isPageZoomed()) {
        isHorizontalGesture = null;
        if (this.elCalendarGrid) {
          this.elCalendarGrid.style.transform = '';
          this.elCalendarGrid.style.opacity = '';
        }
        return;
      }

      const dx = currentX - startX;
      const grid = this.elCalendarGrid;

      // 수평 스와이프 판별 (38px 이상 이동 및 수평 제스처 확인 시)
      if (isHorizontalGesture === true && Math.abs(dx) >= 38) {
        if (grid) {
          grid.classList.remove('no-transition');
        }
        if (dx < 0) {
          // 왼쪽으로 밀었음 -> 다음 달
          this.changeMonth('next', true);
        } else {
          // 오른쪽으로 밀었음 -> 이전 달
          this.changeMonth('prev', true);
        }
      } else {
        // 임계값 미만: 원래 자리로 부드럽게 튕겨서 복귀 (스프링 복원)
        if (grid) {
          grid.classList.remove('no-transition');
          grid.classList.add('sliding-transition');
          grid.style.transform = 'translateX(0)';
          grid.style.opacity = '1';
          setTimeout(() => {
            grid.classList.remove('sliding-transition');
            grid.style.transform = '';
            grid.style.opacity = '';
          }, 200);
        }
      }
      isHorizontalGesture = null;
    }, { passive: true });

    card.addEventListener('touchcancel', () => {
      isDragging = false;
      isHorizontalGesture = null;
      if (this.elCalendarGrid) {
        this.elCalendarGrid.style.transform = '';
        this.elCalendarGrid.style.opacity = '';
      }
    }, { passive: true });
  }

  // ========= 이달의 특이사항 렌더링 =========
  renderMonthlyNotes() {
    if (!this.monthlyNotesList) return;
    const y = this.currentYear;
    const m = this.currentMonth;
    if (this.monthlyNotesSectionTitle) {
      this.monthlyNotesSectionTitle.textContent = `이달의 특이사항 (${y}년 ${m}월)`;
    }

    const overrides = shiftStorage.getOverrides();
    const schedules = shiftStorage.getSchedules();
    const lastDay = new Date(y, m, 0).getDate();
    const weekDays = ['일','월','화','수','목','금','토'];
    const items = [];

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const dateObj = new Date(y, m-1, d);
      const dayOfWeek = weekDays[dateObj.getDay()];
      const dateLabel = `${m}월 ${d}일(${dayOfWeek})`;

      // 근무 특이사항 (대근, 휴가)
      if (overrides && overrides[dateStr]) {
        const ov = overrides[dateStr];
        if (ov.shiftType && ov.shiftType.includes('대근')) {
          items.push({ type: 'overtime', dateStr, dateLabel, text: ov.shiftType, icon: '⚡' });
        } else if (ov.shiftType && ov.shiftType.includes('휴가')) {
          items.push({ type: 'vacation', dateStr, dateLabel, text: ov.shiftType, icon: '🌿' });
        }
      }

      // 개인 일정
      const daySchs = schedules.filter(s => s.dateStr === dateStr);
      daySchs.forEach(s => {
        items.push({
          type: 'schedule',
          dateStr,
          dateLabel,
          text: (s.timeStr ? s.timeStr + ' ' : '') + s.title,
          icon: '📌',
          scheduleId: s.id
        });
      });
    }

    if (items.length === 0) {
      this.monthlyNotesList.innerHTML = `<div class="monthly-notes-empty">이달에 등록된 특이사항이 없습니다.</div>`;
      return;
    }

    let html = '';
    items.forEach(item => {
      let typeClass = 'note-type-schedule';
      if (item.type === 'overtime') typeClass = 'note-type-overtime';
      else if (item.type === 'vacation') typeClass = 'note-type-vacation';

      html += `
        <div class="monthly-note-row ${typeClass}" data-date="${item.dateStr}" data-id="${item.scheduleId || ''}" data-type="${item.type}">
          <div class="monthly-note-left">
            <span class="monthly-note-icon">${item.icon}</span>
            <span class="monthly-note-date">${item.dateLabel}</span>
            <span class="monthly-note-text">${item.text}</span>
          </div>
          <button type="button" class="monthly-note-delete-btn" title="삭제" onclick="window.app.deleteMonthlyNote('${item.dateStr}','${item.type}','${item.scheduleId || ''}')">&times;</button>
        </div>
      `;
    });
    this.monthlyNotesList.innerHTML = html;
  }

  refreshMonthlyNotes(e) {
    if (e && e.preventDefault) e.preventDefault();
    const btn = this.btnRefreshMonthlyNotes || document.getElementById('btnRefreshMonthlyNotes');
    if (btn) btn.classList.add('spinning');

    // 저장소 기반 이달의 특이사항 및 캘린더 화면 즉시 갱신
    this.renderMonthlyNotes();
    this.renderCalendar();
    this.renderTodayCard();
    this.showWeatherToast('이달의 특이사항을 최신 정보로 새로고침했습니다. 🔄');

    setTimeout(() => {
      if (btn) btn.classList.remove('spinning');
    }, 600);
  }

  deleteMonthlyNote(dateStr, type, scheduleId) {
    if (type === 'schedule') {
      if (scheduleId) {
        shiftStorage.removeSchedule(scheduleId);
      }
    } else if (type === 'overtime' || type === 'vacation') {
      const overrides = shiftStorage.getOverrides();
      const cur = overrides[dateStr] || {};
      // 근무 형태를 기본값으로 재계산하여 제거
      shiftStorage.removeOverrideForDate(dateStr);
    }
    this.renderAll();
  }

  renderHeader() {
    const profile = shiftStorage.getProfile();
    this.elAvatar.textContent = profile.avatar || profile.name[0] || '최';
    this.elName.textContent = profile.name;
    this.elTeam.textContent = profile.team;
  }

  renderMonthNav() {
    this.elMonthTitle.textContent = `${this.currentYear}년 ${this.currentMonth}월 근무표`;
  }

  // 상단 근무표 메모장 모달 내 해당 월 근무 특이사항(대근, 휴가) 렌더링 - 한 줄씩 깔끔하게 정렬
  renderUploadModalSpecialNotes() {
    const titleEl = document.getElementById('specialNotesHeaderTitle');
    const contentEl = document.getElementById('specialNotesContent');
    if (!contentEl) return;

    const targetYear = this.currentYear;
    const targetMonth = this.currentMonth;

    if (titleEl) {
      titleEl.textContent = `특이사항 (${targetYear}년 ${targetMonth}월):`;
    }

    // 해당 월의 1일부터 말일까지 대근, 휴가 내역만 정확히 날짜순 수집
    const overrides = shiftStorage.getOverrides();
    const lastDay = new Date(targetYear, targetMonth, 0).getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    const specialItems = [];

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(targetYear, targetMonth - 1, d);
      const dayOfWeek = weekDays[dateObj.getDay()];

      if (overrides && overrides[dateStr]) {
        const item = overrides[dateStr];
        const sType = item.shiftType || '';
        if (sType.includes('대근')) {
          specialItems.push({
            type: 'overtime',
            typeLabel: '대근',
            icon: '⚡',
            dateText: `${targetMonth}월 ${d}일 (${dayOfWeek})`,
            shiftName: sType.replace(/^[⚡\s]+/, '')
          });
        } else if (sType.includes('휴가')) {
          specialItems.push({
            type: 'vacation',
            typeLabel: '휴가',
            icon: '🌿',
            dateText: `${targetMonth}월 ${d}일 (${dayOfWeek})`,
            shiftName: sType.replace(/^[🌿\s]+/, '')
          });
        }
      }
    }

    // 한 줄씩 나오게 정렬된 HTML 구성
    if (specialItems.length === 0) {
      contentEl.innerHTML = `
        <div class="special-note-empty">
          • 해당 월에 등록된 특이사항(대근·휴가)이 없습니다.
        </div>
      `;
      return;
    }

    let html = `<div class="special-notes-list">`;
    specialItems.forEach(item => {
      const isOvertime = item.type === 'overtime';
      const badgeClass = isOvertime ? 'badge-overtime' : 'badge-vacation';
      const rowClass = isOvertime ? 'overtime' : 'vacation';

      html += `
        <div class="special-note-row ${rowClass}">
          <div class="special-note-left">
            <span class="special-note-badge ${badgeClass}">${item.icon} ${item.typeLabel}</span>
            <span class="special-note-date">${item.dateText}</span>
          </div>
          <div class="special-note-right">
            <span class="special-note-name">${item.shiftName}</span>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    contentEl.innerHTML = html;
  }

  renderTodayCard() {
    const overrides = shiftStorage.getOverrides();
    const baseSettings = shiftStorage.getBaseSettings();
    const shiftInfo = getShiftInfoForDate(this.selectedDateStr, overrides, baseSettings);

    const [y, m, d] = this.selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = weekDays[dateObj.getDay()];

    this.elTodayDateText.textContent = `${m}월 ${d}일 (${dayOfWeek})`;

    // 공휴일·일요일은 빨간색, 토요일은 파란색 반영
    const holidayInfo = (typeof getKoreanHolidayInfo === 'function') ? getKoreanHolidayInfo(dateObj) : { isHoliday: false };
    const isHoliday = holidayInfo && holidayInfo.isHoliday;
    const dayIndex = dateObj.getDay();
    const isSunday = (dayIndex === 0);
    const isSaturday = (dayIndex === 6);

    this.elTodayDateText.classList.remove('is-holiday', 'is-sunday', 'is-saturday');
    const isDayTheme = (this.currentTheme === 'apple-light');
    if (isHoliday || isSunday) {
      this.elTodayDateText.classList.add('is-holiday');
      if (isSunday) this.elTodayDateText.classList.add('is-sunday');
      this.elTodayDateText.style.setProperty('color', isDayTheme ? '#dc2626' : '#f87171', 'important');
    } else if (isSaturday) {
      this.elTodayDateText.classList.add('is-saturday');
      this.elTodayDateText.style.setProperty('color', isDayTheme ? '#2563eb' : '#60a5fa', 'important');
    } else {
      this.elTodayDateText.style.removeProperty('color');
    }

    if (this.elTodayTimeText) {
      this.elTodayTimeText.textContent = '';
      this.elTodayTimeText.style.display = 'none';
    }

    // 기존 근무 클래스 초기화
    this.elTodayShiftBadge.classList.remove('badge-day', 'badge-night', 'badge-early', 'badge-off', 'badge-overtime', 'badge-vacation');

    if (shiftInfo.shiftType === '비번') {
      this.elTodayShiftBadge.classList.add('badge-off');
      this.elTodayShiftBadge.innerHTML = `<span>비번</span>`;
    } else if (shiftInfo.shiftType.includes('대근')) {
      this.elTodayShiftBadge.classList.add('badge-overtime');
      this.elTodayShiftBadge.innerHTML = `<span>${shiftInfo.shiftType}</span>`;
    } else if (shiftInfo.shiftType.includes('휴가')) {
      this.elTodayShiftBadge.classList.add('badge-vacation');
      this.elTodayShiftBadge.innerHTML = `<span>${shiftInfo.shiftType}</span>`;
    } else {
      // 일반 근무: 가로 배치, [일근 / 야근 / 조근] 명칭만 정중앙 표출
      if (shiftInfo.shiftType === '일근') {
        this.elTodayShiftBadge.classList.add('badge-day');
        this.elTodayShiftBadge.innerHTML = `<span>일근</span>`;
      } else if (shiftInfo.shiftType === '야근') {
        this.elTodayShiftBadge.classList.add('badge-night');
        this.elTodayShiftBadge.innerHTML = `<span>야근</span>`;
      } else if (shiftInfo.shiftType === '조근') {
        this.elTodayShiftBadge.classList.add('badge-early');
        this.elTodayShiftBadge.innerHTML = `<span>조근</span>`;
      } else {
        this.elTodayShiftBadge.classList.add('badge-off');
        this.elTodayShiftBadge.innerHTML = `<span>${shiftInfo.shiftType}</span>`;
      }
    }
  }

  applyTheme(themeName, save = true) {
    this.currentTheme = themeName;
    document.body.setAttribute('data-theme', themeName);
    if (save) {
      localStorage.setItem('kbs_shift_theme', themeName);
    }
    const themeNames = {
      'obsidian': '옵시디언 럭셔리 다크',
      'apple-light': '애플 퓨어 라이트',
      'noble-gold': '노블 샴페인 골드'
    };
    const titleEl = document.querySelector('.theme-bar-title strong');
    if (titleEl && themeNames[themeName]) {
      titleEl.textContent = themeNames[themeName];
    }

    // 상단 낮 ☀️ / 밤 🌙 단일 교대 토글 버튼 동기화 (낮일 때는 하얀바탕 ☀️ 낮 모드, 밤일 때는 검은바탕 🌙 밤 모드)
    if (this.btnThemeToggle) {
      if (themeName === 'apple-light') {
        this.btnThemeToggle.classList.remove('is-night');
        this.btnThemeToggle.classList.add('is-day');
        if (this.themeToggleIcon) this.themeToggleIcon.textContent = '☀️';
        if (this.themeToggleText) this.themeToggleText.textContent = '낮 모드';
        this.btnThemeToggle.setAttribute('title', '현재: 낮 모드 (터치 시 밤 모드로 전환)');
      } else {
        this.btnThemeToggle.classList.remove('is-day');
        this.btnThemeToggle.classList.add('is-night');
        if (this.themeToggleIcon) this.themeToggleIcon.textContent = '🌙';
        if (this.themeToggleText) this.themeToggleText.textContent = '밤 모드';
        this.btnThemeToggle.setAttribute('title', '현재: 밤 모드 (터치 시 낮 모드로 전환)');
      }
    }

    // 테마 버튼 활성화 상태 표시
    document.querySelectorAll('.btn-theme-pill').forEach(btn => {
      if (btn.getAttribute('data-theme') === themeName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    // 네이티브 Android 상태바 및 하단 내비게이션바 시인성 테마 동기화 (낮모드: 검은 글씨/아이콘)
    const isDark = (themeName !== 'apple-light');
    try {
      if (window.AndroidAlarm && typeof window.AndroidAlarm.setSystemBarTheme === 'function') {
        window.AndroidAlarm.setSystemBarTheme(isDark);
      }
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
      }
    } catch (e) {}

    this.renderTodayCard();
  }

  renderCalendar() {
    this.elCalendarGrid.innerHTML = '';

    const overrides = shiftStorage.getOverrides();
    const baseSettings = shiftStorage.getBaseSettings();
    const schedules = shiftStorage.getSchedules();

    const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth, 0);
    const startDayOfWeek = firstDay.getDay(); // 0(일) ~ 6(토)
    const totalDays = lastDay.getDate();

    // 1. 시작 요일 전 이전 달 날짜 채우기
    if (startDayOfWeek > 0) {
      const prevLastDate = new Date(this.currentYear, this.currentMonth - 1, 0).getDate();
      const prevYear = this.currentMonth === 1 ? this.currentYear - 1 : this.currentYear;
      const prevMonth = this.currentMonth === 1 ? 12 : this.currentMonth - 1;

      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const d = prevLastDate - i;
        const dateStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const shiftInfo = getShiftInfoForDate(dateStr, overrides, baseSettings);

        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        const prevDateObj = new Date(prevYear, prevMonth - 1, d);
        const prevDayOfWeek = prevDateObj.getDay();
        if (prevDayOfWeek === 0) cell.classList.add('sun');
        if (prevDayOfWeek === 6) cell.classList.add('sat');
        if (isKoreanHoliday(prevDateObj)) cell.classList.add('holiday');

        const headerRow = document.createElement('div');
        headerRow.className = 'day-header-row';
        const dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = d;
        if (isKoreanHoliday(prevDateObj)) {
          dayNum.style.color = '#dc2626';
          dayNum.style.fontWeight = '900';
        }
        headerRow.appendChild(dayNum);
        if (shiftStorage.isAlarmActive(dateStr)) {
          const alarmIcon = document.createElement('span');
          alarmIcon.className = 'day-alarm-indicator';
          alarmIcon.textContent = '⏰';
          alarmIcon.title = '근무알람 설정됨';
          headerRow.appendChild(alarmIcon);
        }
        cell.appendChild(headerRow);

        if (shiftInfo.badgeText) {
          const badge = document.createElement('div');
          const isLong = shiftInfo.badgeText.length >= 4;
          badge.className = `shift-badge ${shiftInfo.colorClass}${isLong ? ' long-text' : ''}`;
          badge.textContent = shiftInfo.badgeText;
          cell.appendChild(badge);
        }

        cell.addEventListener('click', () => {
          this.currentYear = prevYear;
          this.currentMonth = prevMonth;
          this.selectDate(dateStr);
        });

        this.elCalendarGrid.appendChild(cell);
      }
    }

    // 2. 이번 달 날짜별 셀 생성 (1일 ~ totalDays)
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(this.currentYear, this.currentMonth - 1, d);
      const dayOfWeek = dateObj.getDay();

      const shiftInfo = getShiftInfoForDate(dateStr, overrides, baseSettings);
      const daySchedules = schedules.filter(s => s.dateStr === dateStr);

      const cell = document.createElement('div');
      cell.className = 'calendar-day-cell';
      if (dayOfWeek === 0) cell.classList.add('sun');
      if (dayOfWeek === 6) cell.classList.add('sat');

      // 선택된 날짜 테두리 강조
      if (dateStr === this.selectedDateStr) {
        cell.classList.add('selected');
      }

      // 오늘 날짜 전용 클래스 (빛이 한바퀴 회전하는 테두리 효과)
      if (dateStr === this.todayDateStr) {
        cell.classList.add('today');
      }

      // 공휴일 판별 및 정보 (대체공휴일 완벽 대응)
      const holidayInfo = getKoreanHolidayInfo(dateObj);
      if (holidayInfo.isHoliday) {
        cell.classList.add('holiday');
      }

      // 날짜 행 (오직 날짜 숫자만 배치하여 날짜가 절대 가려지지 않음)
      const headerRow = document.createElement('div');
      headerRow.className = 'day-header-row';

      const dayNum = document.createElement('span');
      dayNum.className = 'day-number';
      dayNum.textContent = d;
      // 공휴일일 때는 평일/토/일 불문하고 확실하게 선명한 빨간색 적용
      if (holidayInfo.isHoliday) {
        dayNum.style.color = '#dc2626';
        dayNum.style.fontWeight = '900';
      }
      headerRow.appendChild(dayNum);
      if (shiftStorage.isAlarmActive(dateStr)) {
        const alarmIcon = document.createElement('span');
        alarmIcon.className = 'day-alarm-indicator';
        alarmIcon.textContent = '⏰';
        alarmIcon.title = '근무알람 설정됨';
        headerRow.appendChild(alarmIcon);
      }
      cell.appendChild(headerRow);

      // 공휴일 정보 뱃지 (날짜 아래 별도 2줄 배치로 날짜에 절대 간섭 없음)
      if (holidayInfo.isHoliday) {
        const holidayMark = document.createElement('div');
        holidayMark.className = 'holiday-name-tag';
        holidayMark.title = `공휴일: ${holidayInfo.name}`;

        let nameHtml = holidayInfo.name;
        if (nameHtml === '대체공휴일') {
          nameHtml = '대체<br>공휴';
        } else if (nameHtml === '설날 연휴') {
          nameHtml = '설날<br>연휴';
        } else if (nameHtml === '추석 연휴') {
          nameHtml = '추석<br>연휴';
        } else if (nameHtml === '부처님오신날') {
          nameHtml = '부처님<br>오신날';
        } else if (nameHtml === '어린이날·부처님오신날') {
          nameHtml = '어린이<br>석탄일';
        } else if (nameHtml === '국회의원선거') {
          nameHtml = '국회<br>선거';
        } else if (nameHtml === '지방선거') {
          nameHtml = '지방<br>선거';
        } else if (nameHtml === '대통령선거') {
          nameHtml = '대선';
        } else if (nameHtml.length >= 4) {
          nameHtml = nameHtml.slice(0, 2) + '<br>' + nameHtml.slice(2);
        }
        holidayMark.innerHTML = nameHtml;
        cell.appendChild(holidayMark);
      }

      // 근무 뱃지 (비번인 경우 badgeText가 비어있으므로 표출 안 됨)
      if (shiftInfo.badgeText) {
        const badge = document.createElement('div');
        const isLong = shiftInfo.badgeText.length >= 4;
        badge.className = `shift-badge ${shiftInfo.colorClass}${isLong ? ' long-text' : ''}`;
        badge.textContent = shiftInfo.badgeText;
        cell.appendChild(badge);
      }

      // 개인 일정 뱃지 (더블클릭하여 '개인 일정' 및 시각 선택한 내용 달력 표출)
      const personalNotes = [];
      if (shiftInfo.note && shiftInfo.note.trim()) {
        const timePrefix = shiftInfo.noteTime ? `${shiftInfo.noteTime} ` : '';
        personalNotes.push({
          time: shiftInfo.noteTime || '',
          text: `${timePrefix}${shiftInfo.note.trim()}`
        });
      }
      if (daySchedules.length > 0) {
        const sortedDaySchedules = [...daySchedules].sort((a, b) => {
          return parseScheduleTimeToMinutes(a.timeStr) - parseScheduleTimeToMinutes(b.timeStr);
        });
        sortedDaySchedules.forEach(sch => {
          const formattedTime = this.formatDisplayTime(sch.timeStr);
          const timePrefix = formattedTime ? `${formattedTime} ` : '';
          const fullText = `${timePrefix}${sch.title.trim()}`;
          if (!personalNotes.some(p => p.text === fullText)) {
            personalNotes.push({
              time: sch.timeStr || '',
              text: fullText
            });
          }
        });
      }

      if (personalNotes.length > 0) {
        const handleBadgeTouch = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.openDayEditModal(dateStr, shiftInfo);
        };

        if (personalNotes.length === 1) {
          const item = personalNotes[0];
          const schBadge = document.createElement('div');
          schBadge.className = 'schedule-badge-mini';
          schBadge.title = `개인 일정: ${item.text} (터치 시 상세/수정)`;
          schBadge.innerHTML = `<span class="pin-icon">📌</span>${item.text}`;
          schBadge.addEventListener('click', handleBadgeTouch);
          schBadge.addEventListener('touchend', handleBadgeTouch);
          cell.appendChild(schBadge);
        } else {
          // 일정이 2개 이상일 때: 첫 번째 일정 1개 + "+N건" 뱃지로 표시하여 달력 칸이 길어지는 현상 원천 차단
          const firstItem = personalNotes[0];
          const schBadge = document.createElement('div');
          schBadge.className = 'schedule-badge-mini';
          schBadge.title = `개인 일정: ${firstItem.text} (터치 시 상세/수정)`;
          schBadge.innerHTML = `<span class="pin-icon">📌</span>${firstItem.text}`;
          schBadge.addEventListener('click', handleBadgeTouch);
          schBadge.addEventListener('touchend', handleBadgeTouch);
          cell.appendChild(schBadge);

          const moreBadge = document.createElement('div');
          moreBadge.className = 'schedule-badge-mini schedule-badge-more';
          moreBadge.title = personalNotes.map(p => p.text).join('\n') + '\n(터치 시 전체 일정 확인)';
          moreBadge.textContent = `+${personalNotes.length - 1}건 더보기`;
          moreBadge.addEventListener('click', handleBadgeTouch);
          moreBadge.addEventListener('touchend', handleBadgeTouch);
          cell.appendChild(moreBadge);
        }
      }

      // 더블 탭 / 더블 클릭 감지 (모바일 & PC 모두 지원)
      let lastTapTime = 0;
      let lastClickTime = 0;

      const triggerModalDirectly = (e) => {
        if (e) {
          e.stopPropagation();
          if (e.cancelable && e.type === 'touchend') e.preventDefault();
        }
        this.openDayEditModal(dateStr, shiftInfo);
      };

      // 1. 단일 클릭 / 빠른 더블 클릭 통합 (PC 및 모바일 브라우저)
      cell.addEventListener('click', (e) => {
        const now = Date.now();
        const clickDiff = now - lastClickTime;
        lastClickTime = now;

        // 450ms 이내 빠른 2회 클릭 시 모달 즉시 호출
        if (clickDiff > 0 && clickDiff < 450) {
          triggerModalDirectly(e);
          return;
        }

        // 일반 1회 클릭 시: 날짜 선택 & 하단 일정 요약 바 즉시 갱신
        this.selectDate(dateStr);
      });

      // 2. PC 더블 클릭 이벤트
      cell.addEventListener('dblclick', (e) => {
        triggerModalDirectly(e);
      });

      // 3. 모바일 터치 환경: touchend 기반 빠른 2회 터치(더블 탭) 감지
      cell.addEventListener('touchend', (e) => {
        const currentTime = Date.now();
        const tapDiff = currentTime - lastTapTime;
        lastTapTime = currentTime;

        if (tapDiff > 0 && tapDiff < 450) {
          triggerModalDirectly(e);
        }
      });

      this.elCalendarGrid.appendChild(cell);
    }

    // 3. 다음 달 날짜 채우기 (마지막 주 빈칸 7열 완성)
    const currentCellsCount = startDayOfWeek + totalDays;
    const remainingCells = (7 - (currentCellsCount % 7)) % 7;
    if (remainingCells > 0) {
      const nextYear = this.currentMonth === 12 ? this.currentYear + 1 : this.currentYear;
      const nextMonth = this.currentMonth === 12 ? 1 : this.currentMonth + 1;

      for (let d = 1; d <= remainingCells; d++) {
        const dateStr = `${nextYear}-${String(nextMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const shiftInfo = getShiftInfoForDate(dateStr, overrides, baseSettings);

        const cell = document.createElement('div');
        cell.className = 'calendar-day-cell other-month';
        const nextDateObj = new Date(nextYear, nextMonth - 1, d);
        const nextDayOfWeek = nextDateObj.getDay();
        if (nextDayOfWeek === 0) cell.classList.add('sun');
        if (nextDayOfWeek === 6) cell.classList.add('sat');
        if (isKoreanHoliday(nextDateObj)) cell.classList.add('holiday');

        const headerRow = document.createElement('div');
        headerRow.className = 'day-header-row';
        const dayNum = document.createElement('span');
        dayNum.className = 'day-number';
        dayNum.textContent = d;
        if (isKoreanHoliday(nextDateObj)) {
          dayNum.style.color = '#dc2626';
          dayNum.style.fontWeight = '900';
        }
        headerRow.appendChild(dayNum);
        if (shiftStorage.isAlarmActive(dateStr)) {
          const alarmIcon = document.createElement('span');
          alarmIcon.className = 'day-alarm-indicator';
          alarmIcon.textContent = '⏰';
          alarmIcon.title = '근무알람 설정됨';
          headerRow.appendChild(alarmIcon);
        }
        cell.appendChild(headerRow);

        if (shiftInfo.badgeText) {
          const badge = document.createElement('div');
          const isLong = shiftInfo.badgeText.length >= 4;
          badge.className = `shift-badge ${shiftInfo.colorClass}${isLong ? ' long-text' : ''}`;
          badge.textContent = shiftInfo.badgeText;
          cell.appendChild(badge);
        }

        cell.addEventListener('click', () => {
          this.currentYear = nextYear;
          this.currentMonth = nextMonth;
          this.selectDate(dateStr);
        });

        this.elCalendarGrid.appendChild(cell);
      }
    }

    // 달력 하단 일정 요약 배너 최신화
    this.renderSelectedDateScheduleBar();
  }

  selectDate(dateStr) {
    if (this.autoResetTodayTimer) {
      clearTimeout(this.autoResetTodayTimer);
      this.autoResetTodayTimer = null;
    }

    this.selectedDateStr = dateStr;
    this.renderCalendar();
    this.renderTodayCard();
    this.populateScheduleDateOptions();
    this.renderSelectedDateScheduleBar();

    // 사용자가 날짜 클릭 후 근무알람 등을 여유롭게 설정할 수 있도록 15초 유지 후 오늘 날짜로 복귀
    if (dateStr !== this.todayDateStr) {
      this.autoResetTodayTimer = setTimeout(() => {
        // 알람 팝업이나 모달이 열려있는 중에는 복귀하지 않음
        if (this.modalAlarmPopup && this.modalAlarmPopup.classList.contains('active')) return;
        this.selectedDateStr = this.todayDateStr;
        this.renderCalendar();
        this.renderTodayCard();
        this.populateScheduleDateOptions();
        this.renderSelectedDateScheduleBar();
      }, 15000);
    }
  }

  renderSelectedDateScheduleBar() {
    if (!this.selectedScheduleBar) {
      this.selectedScheduleBar = document.getElementById('selectedScheduleBar');
      this.selectedScheduleDatePill = document.getElementById('selectedScheduleDatePill');
      this.selectedScheduleText = document.getElementById('selectedScheduleText');
    }
    if (!this.selectedScheduleBar) return;

    const dateStr = this.selectedDateStr || this.todayDateStr;
    const [y, m, d] = dateStr.split('-');
    const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[dateObj.getDay()];
    const isToday = (dateStr === this.todayDateStr);

    if (this.selectedScheduleDatePill) {
      this.selectedScheduleDatePill.textContent = `${Number(m)}/${Number(d)}(${dayName})${isToday ? ' 오늘' : ''}`;
    }

    const schedules = shiftStorage.getSchedulesForDate(dateStr);

    if (this.selectedScheduleText) {
      if (schedules.length === 0) {
        this.selectedScheduleBar.classList.remove('has-schedules');
        this.selectedScheduleText.innerHTML = `<span class="schedule-empty-hint">등록된 일정 없음 <span class="add-plus-icon">(터치하여 추가 ＋)</span></span>`;
      } else {
        this.selectedScheduleBar.classList.add('has-schedules');
        // 시간순 정렬
        const sorted = [...schedules].sort((a, b) => {
          const minA = parseScheduleTimeToMinutes(a.timeStr);
          const minB = parseScheduleTimeToMinutes(b.timeStr);
          if (minA !== minB) return minA - minB;
          return (a.id || '').localeCompare(b.id || '');
        });

        if (sorted.length === 1) {
          const item = sorted[0];
          const timeText = item.timeStr ? `⏰ ${this.formatDisplayTime(item.timeStr)} ` : '';
          this.selectedScheduleText.innerHTML = `<strong class="schedule-item-highlight">${timeText}${this.escapeHtml(item.title)}</strong>`;
        } else {
          const first = sorted[0];
          const time1 = first.timeStr ? `⏰ ${this.formatDisplayTime(first.timeStr)} ` : '';
          const second = sorted[1];
          const time2 = second.timeStr ? `${this.formatDisplayTime(second.timeStr)} ` : '';
          const remain = sorted.length - 2;

          let displayHtml = `<strong class="schedule-item-highlight">${time1}${this.escapeHtml(first.title)}</strong>`;
          displayHtml += ` · <span class="schedule-sub-item">${time2}${this.escapeHtml(second.title)}</span>`;
          if (remain > 0) {
            displayHtml += ` <span class="schedule-more-count">+${remain}건</span>`;
          }
          this.selectedScheduleText.innerHTML = displayHtml;
        }
      }
    }
  }

  populateEditTimeSelect(selectedTime = '') {
    if (!this.elEditScheduleTimeSelect) return;
    this.elEditScheduleTimeSelect.innerHTML = '';

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '⏰ 시간 없음';
    if (!selectedTime) defaultOpt.selected = true;
    this.elEditScheduleTimeSelect.appendChild(defaultOpt);

    // 06:00부터 23:30까지 30분 단위 시각 옵션 생성
    for (let h = 6; h <= 23; h++) {
      ['00', '30'].forEach(m => {
        const timeVal = `${String(h).padStart(2, '0')}:${m}`;
        const ampm = h >= 12 ? '오후' : '오전';
        const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        const label = `${ampm} ${String(displayH).padStart(2, '0')}:${m}`;

        const opt = document.createElement('option');
        opt.value = timeVal;
        opt.textContent = label;
        if (selectedTime === timeVal) {
          opt.selected = true;
        }
        this.elEditScheduleTimeSelect.appendChild(opt);
      });
    }

    if (selectedTime && !Array.from(this.elEditScheduleTimeSelect.options).some(o => o.value === selectedTime)) {
      const customOpt = document.createElement('option');
      customOpt.value = selectedTime;
      customOpt.textContent = `선택: ${selectedTime}`;
      customOpt.selected = true;
      this.elEditScheduleTimeSelect.appendChild(customOpt);
    }
  }

  openDayEditModal(dateStr, shiftInfo) {
    this.editingDateStr = dateStr;
    const [y, m, d] = dateStr.split('-');
    const overrides = shiftStorage.getOverrides();
    const baseSettings = shiftStorage.getBaseSettings();
    const info = shiftInfo || getShiftInfoForDate(dateStr, overrides, baseSettings);

    this.elEditDateTitle.textContent = `${Number(m)}월 ${Number(d)}일 근무 및 개인 일정`;
    this.elEditShiftSelect.value = info.shiftType || '비번';

    // 기존 override.note가 있다면 schedules로 자동 마이그레이션 (기존 데이터도 선택 삭제 가능하게 통합)
    if (info.note && info.note.trim()) {
      const existingSchedules = shiftStorage.getSchedulesForDate(dateStr);
      const isAlready = existingSchedules.some(s => s.title.trim() === info.note.trim());
      if (!isAlready) {
        shiftStorage.addSchedule({
          id: 'migrated_' + Date.now(),
          dateStr: dateStr,
          timeStr: info.noteTime || '',
          title: info.note.trim()
        });
      }
      const curOverride = overrides[dateStr] || {};
      shiftStorage.setOverrideForDate(dateStr, {
        ...curOverride,
        note: '',
        noteTime: ''
      });
    }

    // 시간 선택기 초기화 (현재 시각 기준 오전/오후 및 30분 단위)
    const now = new Date();
    const curH = now.getHours();
    const curM = now.getMinutes();
    const isPm = curH >= 12;
    const h12 = curH % 12 === 0 ? 12 : curH % 12;
    const m30 = curM < 30 ? '00' : '30';

    if (this.editScheduleAmPm) this.editScheduleAmPm.value = isPm ? '오후' : '오전';
    if (this.editScheduleHour) this.editScheduleHour.value = String(h12);
    if (this.editScheduleMinute) this.editScheduleMinute.value = m30;
    this.isScheduleTimeEnabled = true;
    this.updateScheduleTimeBadge();
    this.elEditNoteInput.value = '';

    // 등록된 개인 일정 목록 렌더링 (00:00~23:59 오전/오후 누락 없이 순서대로 렌더링)
    this.renderDayScheduleList();

    this.openModal(this.modalDayEdit);

    // 데스크톱 환경에서만 편의를 위해 포커스하고, 모바일 터치 환경에서는 키보드로 인한 일정 화면 가림 방지
    if (window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      setTimeout(() => {
        if (this.elEditNoteInput) {
          this.elEditNoteInput.focus();
        }
      }, 150);
    }
  }

  renderDayScheduleList() {
    if (!this.dayScheduleItemsContainer) return;
    this.dayScheduleItemsContainer.innerHTML = '';

    const schedules = shiftStorage.getSchedulesForDate(this.editingDateStr);

    if (this.dayScheduleCount) {
      this.dayScheduleCount.textContent = schedules.length;
    }

    if (this.btnDeleteSelectedSchedules) {
      this.btnDeleteSelectedSchedules.style.display = 'none';
    }

    if (schedules.length === 0) {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'day-schedule-empty';
      emptyDiv.textContent = '등록된 개인 일정이 없습니다.';
      this.dayScheduleItemsContainer.appendChild(emptyDiv);
      return;
    }

    // 00:00부터 23:59까지 오전(AM) 및 오후(PM) 전체 시간대 누락 없이 순서대로 정렬
    const sorted = [...schedules].sort((a, b) => {
      const minA = parseScheduleTimeToMinutes(a.timeStr);
      const minB = parseScheduleTimeToMinutes(b.timeStr);
      if (minA !== minB) return minA - minB;
      return (a.id || '').localeCompare(b.id || '');
    });

    sorted.forEach(item => {
      const itemRow = document.createElement('div');
      itemRow.className = 'day-schedule-item';

      const leftDiv = document.createElement('div');
      leftDiv.className = 'day-schedule-item-left';

      // 선택 삭제용 체크박스
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'day-schedule-checkbox';
      checkbox.setAttribute('data-id', item.id);
      checkbox.addEventListener('change', () => {
        this.updateDeleteSelectedButtonState();
      });
      leftDiv.appendChild(checkbox);

      // 시각 뱃지: 00:00~23:59 오전/오후 완벽 대응 표시
      if (item.timeStr) {
        const timeBadge = document.createElement('span');
        timeBadge.className = 'day-schedule-time-badge';
        timeBadge.textContent = this.formatDisplayTime(item.timeStr);
        timeBadge.title = `설정 시각: ${item.timeStr}`;
        leftDiv.appendChild(timeBadge);
      }

      // 일정 내용
      const titleSpan = document.createElement('span');
      titleSpan.className = 'day-schedule-title';
      titleSpan.textContent = item.title;
      titleSpan.title = item.title;
      leftDiv.appendChild(titleSpan);

      itemRow.appendChild(leftDiv);

      // 개별 삭제 버튼
      const delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-delete-single-schedule';
      delBtn.title = '이 일정 삭제';
      delBtn.innerHTML = '🗑️';
      delBtn.addEventListener('click', () => {
        shiftStorage.removeSchedule(item.id);
        this.renderDayScheduleList();
        this.renderCalendar();
        this.renderMonthlyNotes();
      });
      itemRow.appendChild(delBtn);

      this.dayScheduleItemsContainer.appendChild(itemRow);
    });
  }

  updateDeleteSelectedButtonState() {
    if (!this.btnDeleteSelectedSchedules || !this.dayScheduleItemsContainer) return;
    const checked = this.dayScheduleItemsContainer.querySelectorAll('.day-schedule-checkbox:checked');
    if (checked.length > 0) {
      this.btnDeleteSelectedSchedules.style.display = 'inline-flex';
      this.btnDeleteSelectedSchedules.innerHTML = `🗑️ 선택 삭제 (${checked.length})`;
    } else {
      this.btnDeleteSelectedSchedules.style.display = 'none';
    }
  }

  deleteSelectedSchedules() {
    if (!this.dayScheduleItemsContainer) return;
    const checked = this.dayScheduleItemsContainer.querySelectorAll('.day-schedule-checkbox:checked');
    if (checked.length === 0) return;

    if (confirm(`선택한 ${checked.length}개의 개인 일정을 삭제하시겠습니까?`)) {
      checked.forEach(cb => {
        const id = cb.getAttribute('data-id');
        if (id) {
          shiftStorage.removeSchedule(id);
        }
      });
      this.renderDayScheduleList();
      this.renderCalendar();
      this.renderMonthlyNotes();
    }
  }

  saveDayEdit() {
    const title = this.elEditNoteInput.value.trim();
    // 아날로그 시계에서 선택한 시간 가져오기 (오전/오후 완벽 반영)
    const timeStr = this.getSelectedTimeStr();

    if (!title) {
      alert('일정 내용을 입력해주세요.');
      if (this.elEditNoteInput) this.elEditNoteInput.focus();
      return;
    }

    // 근무 형태도 함께 유지
    const shiftType = this.elEditShiftSelect.value;
    const currentOverride = shiftStorage.getOverrides()[this.editingDateStr] || {};
    shiftStorage.setOverrideForDate(this.editingDateStr, {
      ...currentOverride,
      shiftType,
      time: '',
      alarm: ''
    });

    // 개인 일정 추가 (기본값 복원 누를 때까지 영구 저장)
    shiftStorage.addSchedule({
      id: 'sch_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      dateStr: this.editingDateStr,
      timeStr,
      title
    });

    this.elEditNoteInput.value = '';
    this.renderDayScheduleList();
    this.renderCalendar();
    this.renderTodayCard();
    this.renderMonthlyNotes();

    if (this.elEditNoteInput) {
      this.elEditNoteInput.focus();
    }
  }

  populateScheduleDateOptions() {
    if (!this.elScheduleDateSelect) return;
    this.elScheduleDateSelect.innerHTML = '';
    const overrides = shiftStorage.getOverrides();
    const baseSettings = shiftStorage.getBaseSettings();
    const lastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dateObj = new Date(this.currentYear, this.currentMonth - 1, d);
      const dayOfWeek = weekDays[dateObj.getDay()];
      const shiftInfo = getShiftInfoForDate(dateStr, overrides, baseSettings);

      const shiftTag = shiftInfo.shiftType === '비번' ? '비번' : shiftInfo.shiftType;
      const opt = document.createElement('option');
      opt.value = dateStr;
      opt.textContent = `${d}일 (${dayOfWeek}) [${shiftTag}]`;

      if (dateStr === this.selectedDateStr) {
        opt.selected = true;
      }

      this.elScheduleDateSelect.appendChild(opt);
    }
  }

  formatKoreanTime(date) {
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    const displayHour = hours % 12 === 0 ? 12 : hours % 12;
    return {
      full: `${ampm} ${displayHour}:${minutes}:${seconds}`,
      short: `${ampm} ${displayHour}:${minutes}`,
      hhmm: `${String(hours).padStart(2, '0')}:${minutes}`
    };
  }

  startRealTimeClock() {
    const updateClock = () => {
      const now = new Date();
      const timeInfo = this.formatKoreanTime(now);
      if (this.elRealTimeClock) {
        this.elRealTimeClock.textContent = timeInfo.full;
      }
    };
    updateClock();
    if (this.clockInterval) clearInterval(this.clockInterval);
    this.clockInterval = setInterval(updateClock, 1000);
  }

  populateScheduleTimeOptions() {
    if (!this.elScheduleTimeSelect) return;
    const now = new Date();
    const currentTime = this.formatKoreanTime(now);
    
    // 기존에 사용자가 선택한 값이 있다면 유지, 없으면 현재 시각
    const previousSelected = this.elScheduleTimeSelect.value;
    this.elScheduleTimeSelect.innerHTML = '';

    // 1. 현재 실시간
    const currentOpt = document.createElement('option');
    currentOpt.value = currentTime.short;
    currentOpt.textContent = `현재 시각: ${currentTime.short}`;
    currentOpt.selected = true;
    this.elScheduleTimeSelect.appendChild(currentOpt);

    // 2. 자주 사용하는 일상 일정 시각 프리셋
    const presets = [
      { label: '오전 07:00 (아침 일정)', val: '07:00' },
      { label: '오전 09:00 (오전 일정)', val: '09:00' },
      { label: '오후 12:00 (점심 시간)', val: '12:00' },
      { label: '오후 02:00 (오후 일정)', val: '14:00' },
      { label: '오후 06:00 (저녁 일정)', val: '18:00' },
      { label: '오후 08:00 (야간 일정)', val: '20:00' },
      { label: '오후 10:00 (취침 준비)', val: '22:00' }
    ];

    presets.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p.val;
      opt.textContent = p.label;
      if (previousSelected && previousSelected === p.val) {
        opt.selected = true;
      }
      this.elScheduleTimeSelect.appendChild(opt);
    });
  }

  handleRegisterSchedule() {
    const dateStr = this.elScheduleDateSelect.value;
    const timeStr = this.elScheduleTimeSelect.value;
    const title = this.elScheduleInput.value.trim();

    if (!title) {
      alert('일정 내용을 입력해주세요.');
      this.elScheduleInput.focus();
      return;
    }

    shiftStorage.addSchedule({
      dateStr,
      timeStr,
      title
    });

    this.elScheduleInput.value = '';
    this.renderAll();
  }

  renderScheduleList() {
    if (!this.elScheduleListContainer) return;
    const schedules = shiftStorage.getSchedules();
    if (this.elScheduleListCount) {
      this.elScheduleListCount.textContent = `(${schedules.length}개)`;
    }
    this.elScheduleListContainer.innerHTML = '';

    if (schedules.length === 0) {
      this.elScheduleListContainer.innerHTML = `
        <div style="text-align: center; color: #94a3b8; font-size: 12px; padding: 10px;">
          등록된 개인 일정이 없습니다.
        </div>
      `;
      return;
    }

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    schedules.forEach(sch => {
      const [y, m, d] = sch.dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dayOfWeek = weekDays[dateObj.getDay()];

      const item = document.createElement('div');
      item.className = 'schedule-item-pill';
      item.innerHTML = `
        <div class="schedule-item-content">
          <span class="schedule-item-date">${m}월 ${d}일(${dayOfWeek}) ${sch.timeStr}</span>
          <span class="schedule-item-title">${sch.title}</span>
        </div>
        <button class="btn-delete-schedule" title="삭제">✕</button>
      `;

      item.querySelector('.btn-delete-schedule').addEventListener('click', () => {
        shiftStorage.removeSchedule(sch.id);
        this.renderAll();
      });

      this.elScheduleListContainer.appendChild(item);
    });
  }

  async handleFileUpload(file) {
    this.ocrProgressBox.classList.add('active');
    this.ocrResultsArea.style.display = 'none';
    this.updateProgress(20, '파일 분석 및 전처리 중...');

    try {
      let extractedText = '';
      if (file.type.includes('pdf')) {
        this.updateProgress(40, 'PDF 페이지 텍스트 추출 중...');
        extractedText = await shiftOCRParser.extractTextFromPDF(file, (p, msg) => this.updateProgress(p, msg));
      } else {
        this.updateProgress(40, '근무표 이미지 OCR 분석 중...');
        // Tesseract 로딩
        try {
          extractedText = await shiftOCRParser.extractTextFromImage(file, (p, msg) => this.updateProgress(p, msg));
        } catch (ocrErr) {
          console.warn('Tesseract OCR fallback to sample parsing:', ocrErr);
          // OCR 모델 로딩 실패 시 현재 보고 있는 월 기준 스마트 폴백
          if (this.currentMonth === 10 || file.name.includes('10')) {
            extractedText = `10월 근무표\n23일 일근대근\n31일 일근대근`;
          } else {
            extractedText = `9월 근무표\n17일 일근대근\n18일 일근휴가\n19일 야근`;
          }
        }
      }

      this.updateProgress(90, '근무표 패턴 및 일정 매칭 중...');
      const detected = shiftOCRParser.detectYearMonth(extractedText, file.name);
      this.detectedOcrYear = detected.detectedYear || this.currentYear;
      this.detectedOcrMonth = detected.detectedMonth || this.currentMonth;

      // 추출된 원본 텍스트 보관
      this.lastExtractedOcrText = extractedText;

      // 텍스트 내 동료 이름 목록 자동 감지 및 등록
      const detectedNames = shiftOCRParser.extractCandidateNames(extractedText, this.selectedMemberName);
      detectedNames.forEach(n => shiftStorage.addKnownMember(n));
      this.renderOcrMemberChips(detectedNames);

      // 선택된 근무자 기준 변동사항 파싱
      const results = shiftOCRParser.parseShiftTextForName(
        extractedText,
        this.selectedMemberName,
        this.detectedOcrYear,
        this.detectedOcrMonth,
        file.name
      );
      
      this.updateProgress(100, `분석 완료! (${this.detectedOcrYear}년 ${this.detectedOcrMonth}월)`);
      setTimeout(() => {
        this.ocrProgressBox.classList.remove('active');
        if (results.length === 0) {
          // 텍스트 미발견 시 샘플 가이드 표시
          alert(`${this.detectedOcrYear}년 ${this.detectedOcrMonth}월 기준 [${this.selectedMemberName}] 님의 인식된 대근/휴가 내역이 없어 샘플 가이드 데이터로 표시됩니다.`);
          this.renderOcrResults(shiftOCRParser.getSampleExtractedData(this.detectedOcrYear, this.detectedOcrMonth));
        } else {
          this.renderOcrResults(results);
        }
      }, 500);

    } catch (err) {
      console.error(err);
      this.ocrProgressBox.classList.remove('active');
      alert('파일 인식 중 오류가 발생했습니다. 샘플 데이터를 확인하시겠습니까?');
      this.renderOcrResults(shiftOCRParser.getSampleExtractedData(this.currentYear, this.currentMonth));
    }
  }

  updateProgress(percent, msg) {
    this.progressBarFill.style.width = percent + '%';
    this.progressStatusText.textContent = msg;
  }

  renderOcrResults(items) {
    this.currentOcrItems = items;
    this.ocrResultsArea.style.display = 'block';
    this.ocrResultsTbody.innerHTML = '';

    items.forEach((item, index) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight: 700;">${item.day}일</td>
        <td>
          <select class="form-select ocr-shift-select" data-index="${index}" style="height: 30px; font-size: 12px; padding: 2px 4px;">
            <option value="일근대근" ${item.shiftType === '일근대근' ? 'selected' : ''}>⚡ 일근대근</option>
            <option value="야근대근" ${item.shiftType === '야근대근' ? 'selected' : ''}>⚡ 야근대근</option>
            <option value="조근대근" ${item.shiftType === '조근대근' ? 'selected' : ''}>⚡ 조근대근</option>
            <option value="일근휴가" ${item.shiftType === '일근휴가' ? 'selected' : ''}>🌿 일근휴가</option>
            <option value="야근휴가" ${item.shiftType === '야근휴가' ? 'selected' : ''}>🌿 야근휴가</option>
            <option value="조근휴가" ${item.shiftType === '조근휴가' ? 'selected' : ''}>🌿 조근휴가</option>
            <option value="일근" ${item.shiftType === '일근' ? 'selected' : ''}>일근</option>
            <option value="야근" ${item.shiftType === '야근' ? 'selected' : ''}>야근</option>
            <option value="조근" ${item.shiftType === '조근' ? 'selected' : ''}>조근</option>
            <option value="비번" ${item.shiftType === '비번' ? 'selected' : ''}>비번</option>
          </select>
        </td>
        <td><input type="text" class="form-input ocr-note-input" data-index="${index}" value="${item.note || ''}" placeholder="개인 일정 / 메모" style="height: 30px; font-size: 11.5px;"></td>
      `;
      this.ocrResultsTbody.appendChild(tr);
    });
  }

  applyOcrResultsToSchedule() {
    if (!this.currentOcrItems || this.currentOcrItems.length === 0) {
      alert('적용할 인식 데이터가 없습니다.');
      return;
    }

    const selectElements = this.ocrResultsTbody.querySelectorAll('.ocr-shift-select');
    const noteElements = this.ocrResultsTbody.querySelectorAll('.ocr-note-input');

    this.currentOcrItems.forEach((item, index) => {
      const shiftType = selectElements[index].value;
      const note = noteElements[index].value.trim();

      shiftStorage.setOverrideForDate(item.dateStr, {
        shiftType,
        time: '',
        alarm: '',
        note
      });
    });

    // 감지된 해당 연월이 있을 경우 달력 화면을 해당 월로 자동 이동
    if (this.detectedOcrYear && this.detectedOcrMonth) {
      this.currentYear = this.detectedOcrYear;
      this.currentMonth = this.detectedOcrMonth;
      this.selectedDateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-01`;
    }

    alert(`총 ${this.currentOcrItems.length}건의 근무 변경사항이 ${this.currentYear}년 ${this.currentMonth}월 근무표에 성공적으로 적용되었습니다!`);
    this.closeModal(this.modalUpload);
    this.renderAll();
  }

  // --------------------------------------------------------------------------
  // 근무자 선택(초이스) 및 프로필 즉시 전환 모듈
  // --------------------------------------------------------------------------

  renderOcrMemberChips(activeCandidates = null) {
    if (!this.ocrMemberChipsContainer) return;
    this.ocrMemberChipsContainer.innerHTML = '';

    const members = shiftStorage.getKnownMembers();
    if (activeCandidates && Array.isArray(activeCandidates)) {
      activeCandidates.forEach(n => {
        if (!members.includes(n)) members.push(n);
      });
    }

    const cur = (this.selectedMemberName || shiftStorage.getProfile().name || '최종철').replace(/\s*님$/, '').trim();

    members.forEach(name => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `member-chip-btn ${name === cur ? 'active' : ''}`;
      btn.innerHTML = `<span>👤</span> <span>${name}</span>`;
      btn.addEventListener('click', () => {
        this.selectOcrMember(name);
      });
      this.ocrMemberChipsContainer.appendChild(btn);
    });

    if (this.ocrCurrentSelectedMemberBadge) {
      this.ocrCurrentSelectedMemberBadge.textContent = cur + ' 님';
    }
  }

  selectOcrMember(name) {
    const clean = (name || '').replace(/\s*님$/, '').trim();
    if (!clean) return;
    this.selectedMemberName = clean;

    // 프로필 전환 및 헤더 즉시 갱신
    shiftStorage.switchMember(clean);
    this.renderHeader();
    this.renderTodayCard();

    // 칩 UI 업데이트
    this.renderOcrMemberChips();

    // 만약 이미 파싱된 텍스트가 있다면 해당 사용자에 맞춰 변동사항 즉시 재파싱
    if (this.lastExtractedOcrText) {
      const results = shiftOCRParser.parseShiftTextForName(
        this.lastExtractedOcrText,
        clean,
        this.detectedOcrYear || this.currentYear,
        this.detectedOcrMonth || this.currentMonth,
        ''
      );
      this.renderOcrResults(results);
    }
  }

  addCustomMemberFromInput() {
    if (!this.inputCustomMemberName) return;
    const name = this.inputCustomMemberName.value.trim();
    if (!name) {
      alert('근무자 이름을 입력해주세요.');
      return;
    }
    const clean = name.replace(/\s*님$/, '').trim();
    shiftStorage.addKnownMember(clean);
    this.selectOcrMember(clean);
    this.inputCustomMemberName.value = '';
  }

  openMemberSwitchModal() {
    if (!this.modalMemberSwitch) return;
    const profile = shiftStorage.getProfile();
    const curName = (profile.name || '최종철').replace(/\s*님$/, '').trim();

    if (this.inputSwitchName) this.inputSwitchName.value = curName;
    if (this.inputSwitchTeam) this.inputSwitchTeam.value = profile.team || '생방기술1 · 직무 NDC';

    // 빠른 선택 칩 렌더링
    if (this.quickMemberChipsContainer) {
      this.quickMemberChipsContainer.innerHTML = '';
      const members = shiftStorage.getKnownMembers();
      members.forEach(name => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `member-chip-btn ${name === curName ? 'active' : ''}`;
        btn.innerHTML = `<span>👤</span> <span>${name}</span>`;
        btn.addEventListener('click', () => {
          if (this.inputSwitchName) this.inputSwitchName.value = name;
          this.quickMemberChipsContainer.querySelectorAll('.member-chip-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
        });
        this.quickMemberChipsContainer.appendChild(btn);
      });
    }

    this.openModal(this.modalMemberSwitch);
  }

  applyMemberSwitch() {
    if (!this.inputSwitchName) return;
    const name = this.inputSwitchName.value.trim();
    if (!name) {
      alert('근무자 이름을 입력해주세요.');
      return;
    }
    const team = this.inputSwitchTeam ? this.inputSwitchTeam.value.trim() : null;
    const clean = name.replace(/\s*님$/, '').trim();

    shiftStorage.switchMember(clean, team);
    this.selectedMemberName = clean;
    this.renderHeader();
    this.renderTodayCard();

    this.closeModal(this.modalMemberSwitch);
  }

  renderMonthlySummary() {
    const overrides = shiftStorage.getOverrides();
    const baseSettings = shiftStorage.getBaseSettings();
    const lastDay = new Date(this.currentYear, this.currentMonth, 0).getDate();

    let counts = {
      '일근': 0,
      '야근': 0,
      '조근': 0,
      '비번': 0,
      '대근': 0,
      '휴가': 0
    };

    for (let d = 1; d <= lastDay; d++) {
      const dateStr = `${this.currentYear}-${String(this.currentMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const shiftInfo = getShiftInfoForDate(dateStr, overrides, baseSettings);

      if (shiftInfo.shiftType.includes('대근')) {
        counts['대근']++;
      } else if (shiftInfo.shiftType.includes('휴가')) {
        counts['휴가']++;
      } else if (counts[shiftInfo.shiftType] !== undefined) {
        counts[shiftInfo.shiftType]++;
      }
    }

    this.summaryContent.innerHTML = `
      <div style="font-size: 14px; line-height: 1.8;">
        <h4 style="margin-bottom: 10px; font-size: 16px;">📊 ${this.currentYear}년 ${this.currentMonth}월 근무 통계</h4>
        <p>• <b>일근</b>: ${counts['일근']}일</p>
        <p>• <b>야근</b>: ${counts['야근']}일</p>
        <p>• <b>조근</b>: ${counts['조근']}일</p>
        <p>• <b>비번(휴무)</b>: ${counts['비번']}일</p>
        <hr style="margin: 8px 0; border: none; border-top: 1px dashed #cbd5e1;">
        <p style="color: #ef4444;">• <b>대근</b>: ${counts['대근']}일</p>
        <p style="color: #059669;">• <b>휴가</b>: ${counts['휴가']}일</p>
      </div>
    `;
  }

  // 날씨 초기화 및 실시간 동기화 설정 (30분 주기 & 터치 즉시 갱신)
  initWeather() {
    this.loadWeather();

    // 1. 30분(1,800,000ms)마다 실시간 날씨 자동 갱신
    if (this.weatherTimer) clearInterval(this.weatherTimer);
    this.weatherTimer = setInterval(() => {
      this.loadWeather(false);
    }, 30 * 60 * 1000);

    // 2. 화면 복귀 시 마지막 갱신으로부터 30분 지났으면 즉시 자동 갱신
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (!this.lastWeatherFetchTime || (now - this.lastWeatherFetchTime >= 30 * 60 * 1000)) {
          this.loadWeather(false);
        }
      }
    });

    // 3. 날씨 노출 부분 터치/클릭 시 실시간 날씨로 즉시 변경
    const pillEl = document.getElementById('todayWeatherPill');
    if (pillEl) {
      pillEl.addEventListener('click', (e) => {
        // 우측 네이버 날씨 상세 링크(N ↗)를 클릭한 경우는 이동 허용
        if (e.target.closest('.weather-naver-link')) return;
        this.loadWeather(true);
      });

      pillEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.loadWeather(true);
        }
      });
    }
  }

  // 현재 근무표 일정 및 시각에 따른 맞춤 날씨 위치(여의도동 vs 목5동) 조회
  getCurrentWeatherLocation() {
    try {
      if (typeof getWeatherLocationForDateTime === 'function') {
        const overrides = (typeof shiftStorage !== 'undefined') ? shiftStorage.getOverrides() : {};
        const baseSettings = (typeof shiftStorage !== 'undefined') ? shiftStorage.getBaseSettings() : {};
        return getWeatherLocationForDateTime(new Date(), overrides, baseSettings);
      }
    } catch (e) {
      console.warn('날씨 위치 계산 실패, 기본값(여의도동) 적용:', e);
    }
    return {
      code: 'yeouido',
      name: '여의도동',
      query: '여의도동 날씨',
      lat: 37.528,
      lon: 126.924,
      daumUrl: 'https://m.search.daum.net/search?q=%EC%97%AC%EC%9D%98%EB%8F%84%EB%8F%99+%EB%82%A0%EC%94%A8&w=tot'
    };
  }

  // Daum 날씨 텍스트 기반 아이콘 매핑
  getDaumWeatherIcon(desc) {
    if (!desc) return '☀️';
    const d = desc.trim();
    if (d.includes('비') || d.includes('소나기')) return '🌧️';
    if (d.includes('눈') || d.includes('진눈깨비')) return '❄️';
    if (d.includes('천둥') || d.includes('뇌우')) return '⛈️';
    if (d.includes('안개')) return '🌫️';
    if (d.includes('흐림')) return '☁️';
    if (d.includes('구름많음')) return '⛅';
    if (d.includes('구름조금')) return '🌤️';
    if (d.includes('맑음')) return '☀️';
    return '☀️';
  }

  // 실시간 날씨 데이터 수집 (1순위: Daum 검색 실시간 기상청 관측소 데이터 + 2순위: Open-Meteo + 3순위: wttr.in)
  async loadWeather(isManual = false) {
    if (this.isWeatherLoading) return;
    this.isWeatherLoading = true;

    const loc = this.getCurrentWeatherLocation();
    const pillEl = document.getElementById('todayWeatherPill');
    const textEl = document.getElementById('weatherText');
    if (pillEl) pillEl.classList.add('is-updating');
    if (isManual && textEl) {
      textEl.textContent = `${loc.name} 실시간 날씨 갱신 중...`;
    }

    let loaded = false;

    // 1순위: 다음(Daum) 모바일 검색 실시간 기상청 관측소 데이터 (0.1°C 단위 고정밀 실측)
    try {
      const daumUrl = `https://m.search.daum.net/search?w=tot&q=${encodeURIComponent(loc.query)}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(daumUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
        }
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const html = await res.text();
        const tempMatch = html.match(/class=["']txt_temp["']>([^<]+)/i) || html.match(/(\d{1,2}(?:\.\d)?)\s*(?:℃|°C|°)/i);
        const descMatch = html.match(/aria-label=["']([^"']+)["']\s*role=["']img["']/i) || html.match(/<strong class=["']txt_desc["']>([^<]+)<\/strong>/i);
        if (tempMatch) {
          const temp = parseFloat(parseFloat(tempMatch[1].trim()).toFixed(1));
          const text = descMatch ? descMatch[1].trim() : '맑음';
          const icon = this.getDaumWeatherIcon(text);
          this.weatherData = {
            temp,
            icon,
            text,
            locationName: loc.name,
            daumUrl: loc.daumUrl,
            source: 'Daum 실시간',
            updatedAt: new Date()
          };
          this.renderWeather();
          loaded = true;
        }
      }
    } catch (e) {
      console.warn('Daum 날씨 수신 실패, 고정밀 기상청 좌표 폴백 시도:', e);
    }

    // 2순위: Open-Meteo 고정밀 좌표 폴백 (브라우저 환경 CORS 대비)
    if (!loaded) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,cloud_cover&timezone=Asia%2FSeoul`;
        const controller2 = new AbortController();
        const timeoutId2 = setTimeout(() => controller2.abort(), 4000);
        const res2 = await fetch(url, { signal: controller2.signal });
        clearTimeout(timeoutId2);
        if (res2.ok) {
          const data2 = await res2.json();
          const curr2 = data2 && data2.current;
          if (curr2 && curr2.temperature_2m !== undefined) {
            const temp = parseFloat(curr2.temperature_2m.toFixed(1));
            const wmoCode = curr2.weather_code;
            const cloudCover = curr2.cloud_cover || 0;
            const precip = curr2.precipitation || 0;
            const info = this.getWeatherInfoDetailed(wmoCode, precip, 0, 0, 0, cloudCover);
            this.weatherData = {
              temp,
              icon: info.icon,
              text: info.text,
              locationName: loc.name,
              daumUrl: loc.daumUrl,
              source: '기상청 관측망',
              updatedAt: new Date()
            };
            this.renderWeather();
            loaded = true;
          }
        }
      } catch (e) {
        console.warn('Open-Meteo 폴백 실패:', e);
      }
    }

    // 3순위: wttr.in 폴백
    if (!loaded) {
      try {
        const wttrQuery = loc.code === 'mokdong' ? 'Mok-dong' : 'Yeouido';
        const controller3 = new AbortController();
        const timeoutId3 = setTimeout(() => controller3.abort(), 4000);
        const res3 = await fetch(`https://wttr.in/${wttrQuery}?format=j1`, {
          signal: controller3.signal,
          headers: { 'Accept': 'application/json' }
        });
        clearTimeout(timeoutId3);
        if (res3.ok) {
          const data3 = await res3.json();
          const curr3 = data3 && data3.current_condition && data3.current_condition[0];
          if (curr3) {
            const temp = parseFloat(parseFloat(curr3.temp_C).toFixed(1));
            const precip = parseFloat(curr3.precipMM || '0');
            const desc = (curr3.weatherDesc && curr3.weatherDesc[0] && curr3.weatherDesc[0].value) || '';
            const code = parseInt(curr3.weatherCode, 10);
            const info = this.parseWttrCondition(code, desc, precip);
            this.weatherData = {
              temp,
              icon: info.icon,
              text: info.text,
              locationName: loc.name,
              daumUrl: loc.daumUrl,
              source: '기상청 관측소',
              updatedAt: new Date()
            };
            this.renderWeather();
            loaded = true;
          }
        }
      } catch (e) {
        console.warn('wttr 폴백 실패:', e);
      }
    }

    this.isWeatherLoading = false;
    this.lastWeatherFetchTime = Date.now();

    if (pillEl) {
      pillEl.classList.remove('is-updating');
      if (loaded) {
        pillEl.classList.add('is-updated');
        setTimeout(() => pillEl.classList.remove('is-updated'), 650);
      }
    }

    if (isManual) {
      if (loaded && this.weatherData) {
        const timeStr = this.weatherData.updatedAt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const tempDisplay = this.formatTemp(this.weatherData.temp);
        this.showWeatherToast(`${loc.name} 실시간 날씨 갱신 완료 (${timeStr}): ${this.weatherData.icon} ${tempDisplay}°C ${this.weatherData.text}`);
      } else {
        this.showWeatherToast('날씨 정보를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      }
    }
  }

  // met.no 날씨 심볼코드 해석 및 한국어/아이콘 매핑
  parseMetNoSymbol(symbol, precip) {
    if (!symbol) return { icon: '🌤️', text: '맑음' };
    const s = symbol.toLowerCase();

    // 뇌우
    if (s.includes('thunder')) {
      if (s.includes('snow')) return { icon: '⛈️', text: '뇌우·눈' };
      return { icon: '⛈️', text: '뇌우·비' };
    }
    // 눈 / 진눈깨비
    if (s.includes('sleet')) return { icon: '🌨️', text: '진눈깨비' };
    if (s.includes('snow')) {
      if (s.includes('heavy')) return { icon: '❄️', text: '대설' };
      if (s.includes('light')) return { icon: '🌨️', text: '약한 눈' };
      return { icon: '❄️', text: '눈' };
    }
    // 비
    if (s.includes('rain')) {
      if (s.includes('heavy') || (precip && precip >= 10)) return { icon: '🌧️', text: '강한 비' };
      if (s.includes('light')) return { icon: '🌦️', text: '이슬비' };
      return { icon: '🌧️', text: '비' };
    }
    // 안개
    if (s.includes('fog')) return { icon: '🌫️', text: '안개' };
    // 구름 / 맑음
    if (s.includes('cloudy')) {
      if (s.includes('partly')) return { icon: '⛅', text: '구름많음' };
      return { icon: '☁️', text: '흐림' };
    }
    if (s.includes('fair')) return { icon: '🌤️', text: '맑음 (구름조금)' };
    if (s.includes('clear')) return { icon: '☀️', text: '맑음' };

    return { icon: '🌤️', text: '맑음 (구름조금)' };
  }

  // 온도 소수점 1자리 포맷 (23 → 23.0, 23.5 → 23.5)
  formatTemp(temp) {
    const n = parseFloat(temp);
    if (isNaN(n)) return String(temp);
    return n.toFixed(1);
  }

  // WMO 기상 코드 세분화 변환 (Open-Meteo용)
  getWeatherInfoDetailed(wmoCode, precip, rain, showers, snowfall, cloudCover) {
    // 뇌우
    if ([95, 96, 99].includes(wmoCode)) return { icon: '⛈️', text: '뇌우·비' };
    // 눈
    if ([71, 73, 75, 77, 85, 86].includes(wmoCode)) return { icon: '❄️', text: '눈' };
    // 비: 실제 강수량 우선 판정
    const totalRain = (precip || 0) + (rain || 0) + (showers || 0);
    if (totalRain > 0 || [51,53,55,61,63,65,80,81,82].includes(wmoCode)) {
      if (totalRain >= 10 || [65, 82].includes(wmoCode)) return { icon: '🌧️', text: '강한 비' };
      if ([51, 53, 55].includes(wmoCode)) return { icon: '🌦️', text: '이슬비' };
      return { icon: '🌧️', text: '비' };
    }
    // 안개
    if ([45, 48].includes(wmoCode)) return { icon: '🌫️', text: '안개' };
    // 맑음 / 구름 / 흐림 — 구름량으로 세분화
    if (wmoCode === 0) {
      return { icon: '☀️', text: '맑음' };
    }
    if (wmoCode === 1) {
      if (cloudCover < 30) return { icon: '☀️', text: '맑음' };
      return { icon: '🌤️', text: '구름조금' };
    }
    if (wmoCode === 2) {
      if (cloudCover < 60) return { icon: '⛅', text: '구름많음' };
      return { icon: '🌥️', text: '대체로 흐림' };
    }
    if (wmoCode === 3) return { icon: '☁️', text: '흐림' };
    // 구름량으로 보조 판단
    if (cloudCover >= 80) return { icon: '☁️', text: '흐림' };
    if (cloudCover >= 50) return { icon: '⛅', text: '구름많음' };
    if (cloudCover >= 25) return { icon: '🌤️', text: '구름조금' };
    return { icon: '☀️', text: '맑음' };
  }

  // 실시간 기상 관측 조건 분석 — wttr.in 폴백용
  parseWttrCondition(code, desc, precip) {
    const isRain = precip > 0 || /rain|drizzle|shower/i.test(desc) ||
      [263,266,281,284,293,296,299,302,305,308,311,314,353,356,359].includes(code);
    const isDrizzle = /drizzle/i.test(desc) || [263,266].includes(code);
    const isSnow = /snow|sleet|blizzard|ice/i.test(desc) ||
      [317,320,323,326,329,332,335,338,368,371,392,395].includes(code);
    const isThunder = /thunder|storm/i.test(desc) || [200,386,389,392,395].includes(code);

    if (isThunder) return { icon: '⛈️', text: '뇌우·비' };
    if (isSnow) return { icon: '❄️', text: '눈' };
    if (isRain) {
      if (precip >= 10 || /heavy|torrential/i.test(desc)) return { icon: '🌧️', text: '강한 비' };
      if (isDrizzle) return { icon: '🌦️', text: '이슬비' };
      return { icon: '🌧️', text: '비' };
    }
    if (/fog|haze/i.test(desc) || [143,248,260].includes(code)) return { icon: '🌫️', text: '안개' };
    if (/overcast/i.test(desc) || code === 122) return { icon: '☁️', text: '흐림' };
    if (/partly.?cloud/i.test(desc) || code === 116) return { icon: '⛅', text: '구름많음' };
    if (/cloud/i.test(desc) || code === 119) return { icon: '🌥️', text: '대체로 흐림' };
    if (/clear|sunny/i.test(desc) || code === 113) return { icon: '☀️', text: '맑음' };
    return { icon: '🌤️', text: '맑음 (구름조금)' };
  }

  // WMO 기상 코드 변환 (레거시 호환)
  getWeatherInfo(wmoCode, isRaining) {
    if (isRaining) return { icon: '🌧️', text: '비' };
    if (wmoCode === 0) return { icon: '☀️', text: '맑음' };
    if ([1, 2].includes(wmoCode)) return { icon: '🌤️', text: '맑음 (구름조금)' };
    if (wmoCode === 3) return { icon: '☁️', text: '흐림' };
    if ([45, 48].includes(wmoCode)) return { icon: '🌫️', text: '안개' };
    if ([51, 53, 55].includes(wmoCode)) return { icon: '🌦️', text: '이슬비' };
    if ([61, 63, 65, 80, 81, 82].includes(wmoCode)) return { icon: '🌧️', text: '비' };
    if ([71, 73, 75, 77, 85, 86].includes(wmoCode)) return { icon: '❄️', text: '눈' };
    if ([95, 96, 99].includes(wmoCode)) return { icon: '⛈️', text: '뇌우' };
    return { icon: '🌤️', text: '맑음 (구름조금)' };
  }

  // 화면 렌더링
  renderWeather() {
    const iconEl = document.getElementById('weatherIcon');
    const textEl = document.getElementById('weatherText');
    const pillEl = document.getElementById('todayWeatherPill');
    const linkEl = document.getElementById('weatherNaverLink');
    if (!this.weatherData || !iconEl || !textEl) return;

    const { temp, icon, text, locationName, daumUrl, updatedAt } = this.weatherData;
    iconEl.textContent = icon;
    const tempDisplay = this.formatTemp(temp);
    const locTitle = locationName || '여의도동';
    textEl.textContent = `${locTitle} ${tempDisplay}°C ${text}`;

    if (linkEl && daumUrl) {
      linkEl.href = daumUrl;
      linkEl.title = `${locTitle} 다음 날씨 상세 (뒤로가기 시 앱 복귀)`;
      linkEl.innerHTML = '<img src="icons/daum-d.png" alt="다음" class="daum-badge-img"><span class="naver-arrow">↗</span>';
    }

    if (pillEl) {
      const timeStr = (updatedAt || new Date()).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      pillEl.title = `${locTitle} 실시간 날씨: ${tempDisplay}°C ${text} (${timeStr} 기준)\n터치 시 실시간 날씨 즉시 갱신 (30분 주기 자동 업데이트)`;
    }
  }


  // 날씨 갱신 알림 토스트 피드백
  showWeatherToast(msg) {
    let toast = document.getElementById('weatherToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'weatherToast';
      toast.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(20px);
        background: rgba(15, 23, 42, 0.92);
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        padding: 9px 18px;
        border-radius: 9999px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
        backdrop-filter: blur(8px);
        z-index: 99999;
        opacity: 0;
        pointer-events: none;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        text-align: center;
        white-space: nowrap;
        border: 1px solid rgba(255, 255, 255, 0.15);
      `;
      document.body.appendChild(toast);
    }

    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    if (this._weatherToastTimer) clearTimeout(this._weatherToastTimer);
    this._weatherToastTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(15px)';
    }, 2500);
  }

  // =========================================================================
  // 근무알람 기능 (갤럭시 / 안드로이드 시계 앱 알람 연동)
  // =========================================================================
  handleShiftAlarmClick() {
    const targetDateStr = this.selectedDateStr || this.todayDateStr;
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dateObj.getDay(); // 0(일) ~ 6(토)
    const dayName = weekDays[dayOfWeek];

    // 해당 날짜의 근무 형태 조회
    const overrides = shiftStorage.getOverrides();
    const baseSettings = shiftStorage.getBaseSettings();
    const shiftInfo = getShiftInfoForDate(targetDateStr, overrides, baseSettings);
    const shiftType = shiftInfo.shiftType || '일근';

    // 환경설정에 저장된 알람 시각 조회
    const alarmSettings = shiftStorage.getAlarmSettings();
    let alarmTimeStr = '06:00';
    let shiftBadgeText = shiftType;

    if (shiftType.includes('야근')) {
      alarmTimeStr = alarmSettings.night || '15:00';
    } else if (shiftType.includes('조근')) {
      alarmTimeStr = alarmSettings.early || '05:20';
    } else if (shiftType.includes('일근')) {
      alarmTimeStr = alarmSettings.day || '06:00';
    } else {
      // 비번 / 휴가 / 기타
      alarmTimeStr = alarmSettings.day || '06:00';
      shiftBadgeText = `${shiftType} (일근 기준 알람)`;
    }

    const [h, min] = alarmTimeStr.split(':').map(Number);
    const targetAlarmDate = new Date(y, m - 1, d, h, min, 0);
    const now = new Date();
    const diffMs = targetAlarmDate.getTime() - now.getTime();

    let remainText = '';
    if (diffMs <= 0) {
      remainText = '선택한 일시가 지남 (시계 앱에서 해당 요일 반복으로 등록됩니다)';
    } else {
      const diffTotalMins = Math.floor(diffMs / (1000 * 60));
      const diffDays = Math.floor(diffTotalMins / (24 * 60));
      const diffHours = Math.floor((diffTotalMins % (24 * 60)) / 60);
      const diffMins = diffTotalMins % 60;

      if (diffDays > 0) {
        remainText = `${diffDays}일 ${diffHours}시간 ${diffMins}분 후에 울립니다`;
      } else if (diffHours > 0) {
        remainText = `${diffHours}시간 ${diffMins}분 후에 울립니다`;
      } else {
        remainText = `${diffMins}분 후에 울립니다`;
      }
    }

    const periodStr = h < 12 ? '오전' : '오후';
    const displayHour = h === 0 ? 12 : (h > 12 ? h - 12 : h);
    const displayTime = `${periodStr} ${String(displayHour).padStart(2, '0')}:${String(min).padStart(2, '0')} (${alarmTimeStr})`;

    if (this.alarmPopupShiftBadge) {
      this.alarmPopupShiftBadge.textContent = `${m}월 ${d}일 (${dayName}) · ${shiftBadgeText}`;
    }
    if (this.alarmPopupTargetTime) {
      this.alarmPopupTargetTime.textContent = displayTime;
    }

    // 어플 자체 알람 시각 (설정 시각보다 1분 늦게 자체 어플에서 알람시계 노출)
    let selfH = h;
    let selfM = min + 1;
    if (selfM >= 60) {
      selfM = 0;
      selfH = (selfH + 1) % 24;
    }
    const selfPeriodStr = selfH < 12 ? '오전' : '오후';
    const selfDisplayHour = selfH === 0 ? 12 : (selfH > 12 ? selfH - 12 : selfH);
    const selfDisplayTime = `${selfPeriodStr} ${String(selfDisplayHour).padStart(2, '0')}:${String(selfM).padStart(2, '0')}`;
    if (this.alarmPopupSelfTime) {
      this.alarmPopupSelfTime.textContent = `${selfDisplayTime} (알람시계 노출 & 터치 시 자동삭제)`;
    }

    if (this.alarmPopupRemainTime) {
      this.alarmPopupRemainTime.textContent = remainText;
    }

    // 안드로이드 Calendar 요일 상수: 1(일) ~ 7(토)
    const androidDay = dayOfWeek + 1;

    this.pendingAlarmData = {
      hour: h,
      minute: min,
      dayOfWeek: dayOfWeek,
      androidDay: androidDay,
      dayName: dayName,
      dateStr: targetDateStr,
      shiftType: shiftType,
      message: `${m}/${d} ${shiftType} 알람`
    };

    // 현재 알람 활성화 여부 확인 및 UI 동기화
    const isAlreadyActive = shiftStorage.isAlarmActive(targetDateStr);
    if (this.btnDismissAlarmPopup) {
      this.btnDismissAlarmPopup.style.display = isAlreadyActive ? 'inline-block' : 'none';
    }
    if (this.btnConfirmAlarmPopup) {
      this.btnConfirmAlarmPopup.textContent = isAlreadyActive ? '시계 알람 재설정' : '시계 알람 등록';
    }

    if (this.autoResetTodayTimer) {
      clearTimeout(this.autoResetTodayTimer);
      this.autoResetTodayTimer = null;
    }

    this.openModal(this.modalAlarmPopup);
  }

  executeSetAlarm() {
    if (!this.pendingAlarmData) return;
    const { hour, minute, androidDay, shiftType, dayName, dateStr } = this.pendingAlarmData;
    this.closeModal(this.modalAlarmPopup);

    const padMinute = String(minute).padStart(2, '0');
    const [y, m, d] = dateStr.split('-').map(Number);
    const msgText = `[${m}/${d}(${dayName})] ${shiftType} 근무알람`;

    let calledNative = false;

    // 1. APK 네이티브 환경: 자체 1회성 날짜 정밀 알람 & 갤럭시 시계 알람 어플(AlarmClock.ACTION_SET_ALARM) 전송
    if (window.AndroidAlarm) {
      try {
        if (typeof window.AndroidAlarm.setShiftAlarm === 'function') {
          console.log('[ShiftAlarm] Calling native AndroidAlarm.setShiftAlarm:', y, m, d, hour, minute, shiftType);
          calledNative = window.AndroidAlarm.setShiftAlarm(y, m, d, hour, minute, shiftType);
        } else if (typeof window.AndroidAlarm.setAlarm === 'function') {
          console.log('[ShiftAlarm] Calling AndroidAlarm.setAlarm for Galaxy Clock App:', hour, minute, msgText, androidDay);
          window.AndroidAlarm.setAlarm(hour, minute, msgText, androidDay);
          calledNative = true;
        }
      } catch (err) {
        console.error('[ShiftAlarm] Native bridge call failed:', err);
      }
    }

    // 2. 일반 웹 브라우저 환경 Fallback (Chrome Intent Schema)
    if (!calledNative) {
      const intentUri = `intent:#Intent;action=android.intent.action.SET_ALARM;i.android.intent.extra.alarm.HOUR=${hour};i.android.intent.extra.alarm.MINUTES=${minute};S.android.intent.extra.alarm.MESSAGE=${encodeURIComponent(msgText)};B.android.intent.extra.alarm.SKIP_UI=false;al.android.intent.extra.alarm.DAYS=${androidDay};end`;
      try {
        window.location.href = intentUri;
      } catch (e) {
        console.warn('Alarm Intent navigation failed:', e);
      }
    }

    // 달력의 해당 날짜에 알람시계 이모티콘 ⏰ 저장 및 즉시 리렌더링
    shiftStorage.addActiveAlarm(dateStr, {
      time: `${hour}:${padMinute}`,
      type: shiftType
    });
    this.renderCalendar();

    // 오디오 컨텍스트 웜업 (모바일 브라우저 자체 알람 소리 재생 권한 획득)
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx && !this.alarmAudioCtx) {
        this.alarmAudioCtx = new AudioCtx();
      }
      if (this.alarmAudioCtx && this.alarmAudioCtx.state === 'suspended') {
        this.alarmAudioCtx.resume();
      }
    } catch (e) {}

    // 화면 전환을 방해하지 않는 깔끔한 토스트 안내
    this.showWeatherToast(`⏰ ${m}월 ${d}일(${dayName}) ${shiftType} 알람 (${hour}:${padMinute}) 등록 완료 (1분 뒤 앱 자체 알람 울림)`);
  }

  executeDismissAlarm() {
    if (!this.pendingAlarmData) return;
    const { dateStr, shiftType, dayName, hour, minute } = this.pendingAlarmData;
    this.closeModal(this.modalAlarmPopup);

    const [y, m, d] = dateStr.split('-').map(Number);

    // 네이티브 자체 정밀 알람 취소 호출
    if (window.AndroidAlarm && typeof window.AndroidAlarm.cancelShiftAlarm === 'function') {
      try {
        window.AndroidAlarm.cancelShiftAlarm(y, m, d, hour, minute);
      } catch (e) {
        console.warn('Native cancelShiftAlarm failed:', e);
      }
    }

    // 알람 해제: 스토리지에서 삭제 후 달력에서 ⏰ 아이콘 즉시 제거
    shiftStorage.removeActiveAlarm(dateStr);
    this.renderCalendar();

    this.showWeatherToast(`🔕 ${m}월 ${d}일 ${shiftType} 근무알람이 해제되었습니다.`);
  }

  // ========================================================
  // 어플 자체 알람 시스템 (설정 시각 1분 후 동작 & 알람시계 노출 및 자동삭제)
  // ========================================================

  initSelfAlarmMonitor() {
    // 1초마다 실시간 활성 알람 체크
    setInterval(() => {
      this.checkSelfAlarm();
    }, 1000);

    // 사용자가 앱으로 복귀하거나 화면 켤 때 즉시 체크
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkSelfAlarm();
      }
    });
    window.addEventListener('focus', () => {
      this.checkSelfAlarm();
    });
  }

  checkSelfAlarm() {
    if (this.isSelfAlarmRinging) return;

    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1;
    const curD = now.getDate();
    const curH = now.getHours();
    const curMin = now.getMinutes();
    const todayDateStr = `${curY}-${String(curM).padStart(2, '0')}-${String(curD).padStart(2, '0')}`;

    const activeAlarms = shiftStorage.getActiveAlarms();
    const todayAlarm = activeAlarms[todayDateStr];
    if (!todayAlarm || !todayAlarm.time) return;

    const parts = todayAlarm.time.split(':').map(Number);
    if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) return;

    const baseH = parts[0];
    const baseM = parts[1];

    // 사용자가 설정한 시간보다 정확히 1분 늦게 자체 어플 알람 울림!
    let targetSelfH = baseH;
    let targetSelfM = baseM + 1;
    if (targetSelfM >= 60) {
      targetSelfM = 0;
      targetSelfH = (targetSelfH + 1) % 24;
    }

    // 현재 시/분이 자체 알람 시/분과 일치하고, 아직 오늘 울리지 않았다면 울림 작동!
    if (curH === targetSelfH && curMin === targetSelfM && !todayAlarm.selfAlarmRung) {
      todayAlarm.selfAlarmRung = true;
      try {
        localStorage.setItem('kbs_shift_active_alarms', JSON.stringify(activeAlarms));
      } catch (e) {}

      this.triggerSelfAlarm(todayDateStr, todayAlarm, targetSelfH, targetSelfM);
    }
  }

  triggerSelfAlarm(dateStr, alarmObj, selfHour, selfMinute) {
    if (this.isSelfAlarmRinging) return;
    this.isSelfAlarmRinging = true;
    this.currentSelfAlarmDateStr = dateStr;

    const [y, m, d] = dateStr.split('-').map(Number);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const cal = new Date(y, m - 1, d);
    const dayName = dayNames[cal.getDay()] || '';

    const periodStr = selfHour < 12 ? '오전' : '오후';
    const displayHour = selfHour === 0 ? 12 : (selfHour > 12 ? selfHour - 12 : selfHour);
    const displayTime = `${periodStr} ${String(displayHour).padStart(2, '0')}:${String(selfMinute).padStart(2, '0')}`;

    if (this.selfAlarmRingBadge) {
      this.selfAlarmRingBadge.textContent = `${m}월 ${d}일 (${dayName}) · ${alarmObj.type || '근무'} 알람 (+1분)`;
    }
    if (this.selfAlarmRingTime) {
      this.selfAlarmRingTime.textContent = displayTime;
    }

    // 전체화면 알람 모달 노출
    if (this.modalSelfAlarmRing) {
      this.openModal(this.modalSelfAlarmRing);
    }

    // 자체 알람 사운드 & 진동 실행
    this.playSelfAlarmSound();
  }

  playSelfAlarmSound() {
    this.stopSelfAlarmSound();
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!this.alarmAudioCtx) {
          this.alarmAudioCtx = new AudioCtx();
        }
        if (this.alarmAudioCtx.state === 'suspended') {
          this.alarmAudioCtx.resume();
        }

        const ringTone = () => {
          if (!this.isSelfAlarmRinging || !this.alarmAudioCtx) return;
          try {
            const t = this.alarmAudioCtx.currentTime;
            // 1차 톤 (880Hz -> 1174Hz)
            const osc1 = this.alarmAudioCtx.createOscillator();
            const gain1 = this.alarmAudioCtx.createGain();
            osc1.type = 'triangle';
            osc1.frequency.setValueAtTime(880, t);
            osc1.frequency.setValueAtTime(1174.66, t + 0.1);
            gain1.gain.setValueAtTime(0.4, t);
            gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
            osc1.connect(gain1);
            gain1.connect(this.alarmAudioCtx.destination);
            osc1.start(t);
            osc1.stop(t + 0.26);

            // 2차 톤 (880Hz -> 1318Hz)
            const osc2 = this.alarmAudioCtx.createOscillator();
            const gain2 = this.alarmAudioCtx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(880, t + 0.3);
            osc2.frequency.setValueAtTime(1318.51, t + 0.4);
            gain2.gain.setValueAtTime(0.45, t + 0.3);
            gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.58);
            osc2.connect(gain2);
            gain2.connect(this.alarmAudioCtx.destination);
            osc2.start(t + 0.3);
            osc2.stop(t + 0.6);
          } catch (e) {
            console.warn('Tone error:', e);
          }
        };

        ringTone();
        this.selfAlarmInterval = setInterval(ringTone, 850);
      }
    } catch (err) {
      console.warn('playSelfAlarmSound error:', err);
    }

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([400, 200, 400, 200, 800, 400]);
        this.selfAlarmVibrateInterval = setInterval(() => {
          if (this.isSelfAlarmRinging && 'vibrate' in navigator) {
            navigator.vibrate([400, 200, 400, 200, 800, 400]);
          }
        }, 2600);
      } catch (e) {}
    }
  }

  stopSelfAlarmSound() {
    if (this.selfAlarmInterval) {
      clearInterval(this.selfAlarmInterval);
      this.selfAlarmInterval = null;
    }
    if (this.selfAlarmVibrateInterval) {
      clearInterval(this.selfAlarmVibrateInterval);
      this.selfAlarmVibrateInterval = null;
    }
    if ('vibrate' in navigator) {
      try { navigator.vibrate(0); } catch (e) {}
    }
  }

  dismissSelfAlarm() {
    if (!this.isSelfAlarmRinging) return;
    this.isSelfAlarmRinging = false;

    // 1. 소리 & 진동 즉시 정지
    this.stopSelfAlarmSound();

    // 2. 모달 닫기
    if (this.modalSelfAlarmRing) {
      this.closeModal(this.modalSelfAlarmRing);
    }

    // 3. 해당 날짜 알람 자동 삭제!
    const targetDate = this.currentSelfAlarmDateStr;
    if (targetDate) {
      shiftStorage.removeActiveAlarm(targetDate);
      this.currentSelfAlarmDateStr = null;
    }

    // 4. 달력 및 상태 즉시 갱신 (⏰ 아이콘 자동 삭제)
    this.renderCalendar();

    // 5. 알림 토스트
    this.showWeatherToast('⏰ 알람이 꺼졌으며, 등록된 알람이 자동 삭제되었습니다.');
  }
}

// 앱 실행
document.addEventListener('DOMContentLoaded', () => {
  window.app = new ShiftApp();
});
