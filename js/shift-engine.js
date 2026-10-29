// 4조 3교대 근무 계산 엔진
// 기본 패턴 순서: 일근 -> 야근 -> 조근 -> 비번 (4일 주기)
const SHIFT_PATTERN = ['일근', '야근', '조근', '비번'];

// 교대근무 기준 정보 (근무 시각 제거 - 일근/야근/조근/비번 명칭만 유지)
const SHIFT_STANDARDS = {
  '일근': {
    code: 'X',
    name: '일근',
    defaultTime: '',
    colorClass: 'shift-day',
    badgeText: '일근'
  },
  '야근': {
    code: 'M',
    name: '야근',
    defaultTime: '',
    colorClass: 'shift-night',
    badgeText: '야근'
  },
  '조근': {
    code: '/',
    name: '조근',
    defaultTime: '',
    colorClass: 'shift-early',
    badgeText: '조근'
  },
  '비번': {
    code: 'O',
    name: '비번',
    defaultTime: '',
    colorClass: 'shift-off',
    badgeText: ''
  }
};

// 기준일 기본값: 2026-09-02가 '일근' (index 0)
// 이에 따라 2026-09-01은 '비번'(index 3), 2026-08-31은 '조근'(index 2)이 됨
const DEFAULT_BASE_DATE = '2026-09-02';
const DEFAULT_BASE_SHIFT_INDEX = 0; // '일근'

/**
 * 날짜 문자열(YYYY-MM-DD)로부터 자정 기준 Date 객체 생성 (로컬 타임존 일관성 유지)
 */
function parseDateString(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day, 0, 0, 0, 0);
}

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환
 */
function formatDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * 특정 날짜의 기본 4조3교대 근무를 계산
 * @param {string} targetDateStr - 'YYYY-MM-DD'
 * @param {string} baseDateStr - 기준일 'YYYY-MM-DD'
 * @param {number} baseShiftIndex - 기준일의 근무 인덱스 (0: 일근, 1: 야근, 2: 조근, 3: 비번)
 * @returns {string} '일근' | '야근' | '조근' | '비번'
 */
function calculateBaseShift(targetDateStr, baseDateStr = DEFAULT_BASE_DATE, baseShiftIndex = DEFAULT_BASE_SHIFT_INDEX) {
  const target = parseDateString(targetDateStr);
  const base = parseDateString(baseDateStr);

  const diffTime = target.getTime() - base.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let index = (baseShiftIndex + diffDays) % 4;
  if (index < 0) {
    index += 4;
  }

  return SHIFT_PATTERN[index];
}

/**
 * 전달 마지막 날의 근무로부터 이번 달 1일의 근무를 계산
 * @param {string} lastMonthEndShift - 전달 마지막 날의 근무 ('일근' | '야근' | '조근' | '비번')
 * @returns {string} 이번 달 1일의 근무
 */
function getNextShiftFromPrevious(lastMonthEndShift) {
  const idx = SHIFT_PATTERN.indexOf(lastMonthEndShift);
  if (idx === -1) return '일근';
  return SHIFT_PATTERN[(idx + 1) % 4];
}

/**
 * 특정 날짜의 최종 근무 정보 (대근/휴가 오버라이드 포함) 산출
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @param {Object} overrides - { [dateStr]: { shiftType: '일근대근' | '일근휴가' ..., time: '09:00 ~ 18:00 (대근)', note: '대근' } }
 * @param {Object} baseSettings - { baseDate, baseShiftIndex }
 */
function getShiftInfoForDate(dateStr, overrides = {}, baseSettings = {}) {
  const baseDate = baseSettings.baseDate || DEFAULT_BASE_DATE;
  const baseShiftIndex = baseSettings.baseShiftIndex !== undefined ? baseSettings.baseShiftIndex : DEFAULT_BASE_SHIFT_INDEX;

  const baseShift = calculateBaseShift(dateStr, baseDate, baseShiftIndex);

  // 오버라이드(대근, 휴가, 수동변경) 확인
  if (overrides && overrides[dateStr]) {
    const override = overrides[dateStr];
    const shiftType = override.shiftType; // 예: '일근대근', '일근휴가', '야근', etc.
    
    let colorClass = 'shift-day';
    let timeText = override.time || '';
    let badgeText = '';

    if (shiftType.includes('대근')) {
      colorClass = 'shift-overtime'; // 빨간색
      badgeText = shiftType.replace(/^[⚡\s]+/, '');
    } else if (shiftType.includes('휴가')) {
      colorClass = 'shift-vacation'; // 녹색
      badgeText = shiftType.replace(/^[🌿\s]+/, '');
    } else if (shiftType === '야근' || shiftType.includes('야근')) {
      colorClass = 'shift-night';
      badgeText = '야근';
    } else if (shiftType === '조근' || shiftType.includes('조근')) {
      colorClass = 'shift-early';
      badgeText = '조근';
    } else if (shiftType === '비번' || shiftType === '') {
      colorClass = 'shift-off';
      badgeText = '';
    } else {
      colorClass = 'shift-day';
      badgeText = '일근';
    }

    return {
      dateStr,
      baseShift,
      shiftType,
      isOverride: true,
      colorClass,
      badgeText,
      timeText,
      note: override.note || '',
      noteTime: override.noteTime || ''
    };
  }

  // 기본 근무
  const standard = SHIFT_STANDARDS[baseShift];
  const isOff = baseShift === '비번';

  return {
    dateStr,
    baseShift,
    shiftType: baseShift,
    isOverride: false,
    colorClass: standard.colorClass,
    badgeText: isOff ? '' : standard.badgeText, // 비번은 미표시
    timeText: standard.defaultTime,
    note: '',
    noteTime: ''
  };
}

/**
 * 근무표 일정 및 현재 시각에 따라 최적의 출퇴근 기본 모드 결정 ('commute' | 'offwork')
 *
 * [사용자 정의 기준]
 * - 일근 : 전날부터 09시까지 출근모드, 13시부터 퇴근모드
 * - 야근 : 당일 07시부터 출근모드
 * - 조근 : 당일 05시부터 퇴근모드
 *
 * @param {Date} [currentDate=new Date()] - 대상 일시
 * @param {Object} [overrides={}] - 스토리지 오버라이드 데이터
 * @param {Object} [baseSettings={}] - 기준일 설정
 * @returns {'commute' | 'offwork'}
 */
function getCommuteModeForDateTime(currentDate = new Date(), overrides = {}, baseSettings = {}) {
  const d = new Date(currentDate);
  const hour = d.getHours();
  const minute = d.getMinutes();
  const currentMinutes = hour * 60 + minute;

  const todayStr = formatDateString(d);

  const nextDate = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
  const nextStr = formatDateString(nextDate);

  const getCategory = (dateStr) => {
    const info = getShiftInfoForDate(dateStr, overrides, baseSettings);
    const type = (info && (info.shiftType || info.baseShift)) || '';
    if (type.includes('일근')) return '일근';
    if (type.includes('야근')) return '야근';
    if (type.includes('조근')) return '조근';
    return '비번';
  };

  const todayCat = getCategory(todayStr);
  const nextCat = getCategory(nextStr);

  // 1. 오늘이 일근인 경우
  // 일근: 전날부터 09시까지 출근모드, 13시부터 퇴근모드
  if (todayCat === '일근') {
    if (currentMinutes < 13 * 60) {
      return 'commute';
    } else {
      if (nextCat === '일근' && currentMinutes >= 21 * 60) {
        return 'commute';
      }
      return 'offwork';
    }
  }

  // 2. 오늘이 야근인 경우
  // 야근: 당일 07시부터 출근모드
  if (todayCat === '야근') {
    if (currentMinutes >= 7 * 60) {
      return 'commute';
    } else {
      return 'offwork';
    }
  }

  // 3. 오늘이 조근인 경우
  // 조근: 당일 05시부터 퇴근모드
  if (todayCat === '조근') {
    if (currentMinutes < 5 * 60) {
      return 'commute';
    } else {
      if (nextCat === '일근' && currentMinutes >= 21 * 60) {
        return 'commute';
      }
      return 'offwork';
    }
  }

  // 4. 오늘이 비번 (또는 기타 휴무)인 경우
  // "일근 : 전날부터 09시까지 출근모드" 규칙에 따라 다음날이 일근이면 전날(비번일)은 출근모드 기본
  if (nextCat === '일근') {
    return 'commute';
  }

  return 'offwork';
}

/**
 * 근무표 일정 및 현재 시각에 따라 현재 위치(목5동 vs 여의도동) 결정
 *
 * [사용자 정의 규칙]
 * - 일근 : 06시부터 17시까지는 여의도동 날씨, 이후는 목5동 날씨. 익일 야근 15시까지 목5동.
 * - 야근 : 15시부터 여의도동 날씨 (15시 이전은 목5동)
 * - 조근 : 06시까지 여의도동 날씨, 이후 목5동 날씨
 * - 비번 : 목5동 날씨
 *
 * @param {Date} [currentDate=new Date()]
 * @param {Object} [overrides={}]
 * @param {Object} [baseSettings={}]
 * @returns {{ code: 'yeouido'|'mokdong', name: '여의도동'|'목5동', query: string, lat: number, lon: number, daumUrl: string }}
 */
function getWeatherLocationForDateTime(currentDate = new Date(), overrides = {}, baseSettings = {}) {
  const d = new Date(currentDate);
  const hour = d.getHours();
  const minute = d.getMinutes();
  const currentMinutes = hour * 60 + minute;
  const todayStr = formatDateString(d);

  const getCategory = (dateStr) => {
    const info = getShiftInfoForDate(dateStr, overrides, baseSettings);
    const type = (info && (info.shiftType || info.baseShift)) || '';
    if (type.includes('일근')) return '일근';
    if (type.includes('야근')) return '야근';
    if (type.includes('조근')) return '조근';
    return '비번';
  };

  const todayCat = getCategory(todayStr);

  let isYeouido = false;

  if (todayCat === '일근') {
    // 일근 : 06시부터 17시까지는 여의도동, 이후는 목5동
    if (currentMinutes >= 6 * 60 && currentMinutes < 17 * 60) {
      isYeouido = true;
    } else {
      isYeouido = false;
    }
  } else if (todayCat === '야근') {
    // 야근 : 15시부터 여의도동, 15시 이전(익일 야근 15시까지)은 목5동
    if (currentMinutes >= 15 * 60) {
      isYeouido = true;
    } else {
      isYeouido = false;
    }
  } else if (todayCat === '조근') {
    // 조근 : 06시까지 여의도동, 이후 목5동
    if (currentMinutes < 6 * 60) {
      isYeouido = true;
    } else {
      isYeouido = false;
    }
  } else {
    // 비번 : 목5동 날씨
    isYeouido = false;
  }

  if (isYeouido) {
    return {
      code: 'yeouido',
      name: '여의도동',
      query: '여의도동 날씨',
      lat: 37.528,
      lon: 126.924,
      daumUrl: 'https://m.search.daum.net/search?q=%EC%97%AC%EC%9D%98%EB%8F%84%EB%8F%99+%EB%82%A0%EC%94%A8&w=tot'
    };
  } else {
    return {
      code: 'mokdong',
      name: '목5동',
      query: '목5동 날씨',
      lat: 37.535,
      lon: 126.885,
      daumUrl: 'https://m.search.daum.net/search?q=%EB%AA%A95%EB%8F%99+%EB%82%A0%EC%94%A8&w=tot'
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SHIFT_PATTERN,
    SHIFT_STANDARDS,
    DEFAULT_BASE_DATE,
    DEFAULT_BASE_SHIFT_INDEX,
    parseDateString,
    formatDateString,
    calculateBaseShift,
    getNextShiftFromPrevious,
    getShiftInfoForDate,
    getCommuteModeForDateTime,
    getWeatherLocationForDateTime
  };
}
