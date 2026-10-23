const STORAGE_KEYS = {
  PROFILE: 'shift_app_profile',
  BASE_SETTINGS: 'shift_app_base_settings',
  OVERRIDES: 'shift_app_overrides',
  SCHEDULES: 'shift_app_schedules',
  ALARM_SETTINGS: 'shift_app_alarm_settings',
  ACTIVE_ALARMS: 'shift_app_active_alarms',
  KNOWN_MEMBERS: 'shift_app_known_members'
};

// 기본 알람 설정 (일근 06:00, 야근 15:00, 조근 05:20)
const DEFAULT_ALARM_SETTINGS = {
  day: '06:00',
  night: '15:00',
  early: '05:20'
};

// 스크린샷과 1:1로 일치하는 기본 초기 데이터
const DEFAULT_INITIAL_DATA = {
  profile: {
    name: '최종철 님',
    team: '생방기술1 · 직무 NDC',
    avatar: '최'
  },
  baseSettings: {
    baseDate: '2026-09-02',
    baseShiftIndex: 0 // 2026-09-02: '일근' (이에 따라 9/1은 비번, 8/31은 조근)
  },
  overrides: {
    '2026-09-17': {
      shiftType: '일근대근',
      time: '',
      alarm: '',
      note: ''
    },
    '2026-09-18': {
      shiftType: '일근휴가',
      time: '',
      alarm: '',
      note: ''
    },
    '2026-09-19': {
      shiftType: '야근',
      time: '',
      alarm: '',
      note: ''
    },
    // 10월 근무표 스크린샷 1:1 반영 (23일, 31일 일근대근)
    '2026-10-23': {
      shiftType: '일근대근',
      time: '',
      alarm: '',
      note: ''
    },
    '2026-10-31': {
      shiftType: '일근대근',
      time: '',
      alarm: '',
      note: ''
    }
  },
  schedules: []
};

function parseScheduleTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return 9999;
  const clean = timeStr.trim();
  if (!clean) return 9999;

  let isPM = false;
  let isAM = false;
  if (/오후|pm/i.test(clean)) isPM = true;
  if (/오전|am/i.test(clean)) isAM = true;

  const nums = clean.match(/\d+/g);
  if (!nums || nums.length === 0) return 9999;

  let hours = parseInt(nums[0], 10);
  let minutes = nums.length > 1 ? parseInt(nums[1], 10) : 0;

  if (isPM) {
    if (hours < 12) hours += 12;
  } else if (isAM) {
    if (hours === 12) hours = 0;
  }
  hours = Math.max(0, Math.min(23, hours));
  minutes = Math.max(0, Math.min(59, minutes));

  return hours * 60 + minutes;
}

class ShiftStorage {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.PROFILE)) {
      this.setProfile(DEFAULT_INITIAL_DATA.profile);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BASE_SETTINGS)) {
      this.setBaseSettings(DEFAULT_INITIAL_DATA.baseSettings);
    }
    
    // OVERRIDES 로드 및 9월·10월 기본 특이사항(대근, 휴가) 자동 보충 머지
    const storedOverridesRaw = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
    if (!storedOverridesRaw) {
      this.setOverrides(DEFAULT_INITIAL_DATA.overrides);
    } else {
      try {
        const storedOverrides = JSON.parse(storedOverridesRaw) || {};
        let updated = false;
        // 기본 9월 특이사항(17일, 18일) 및 10월 특이사항(23일, 31일)이 없으면 자동 채움
        for (const [k, v] of Object.entries(DEFAULT_INITIAL_DATA.overrides)) {
          if (!storedOverrides[k]) {
            storedOverrides[k] = v;
            updated = true;
          }
        }
        if (updated) {
          this.setOverrides(storedOverrides);
        }
      } catch (e) {
        this.setOverrides(DEFAULT_INITIAL_DATA.overrides);
      }
    }

    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULES)) {
      this.setSchedules(DEFAULT_INITIAL_DATA.schedules);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALARM_SETTINGS)) {
      this.setAlarmSettings(DEFAULT_ALARM_SETTINGS);
    }
  }

  getAlarmSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ALARM_SETTINGS);
      return data ? { ...DEFAULT_ALARM_SETTINGS, ...JSON.parse(data) } : DEFAULT_ALARM_SETTINGS;
    } catch (e) {
      return DEFAULT_ALARM_SETTINGS;
    }
  }

  setAlarmSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.ALARM_SETTINGS, JSON.stringify(settings));
  }

  getActiveAlarms() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ACTIVE_ALARMS);
      if (!data) return {};
      const alarms = JSON.parse(data);
      const now = Date.now();
      let changed = false;

      // 해당 날짜와 시각이 지난 만료된 알람 자동 삭제 처리
      for (const [dateStr, alarmObj] of Object.entries(alarms)) {
        if (!dateStr || !dateStr.includes('-')) continue;
        const [y, m, d] = dateStr.split('-').map(Number);
        if (!y || !m || !d) continue;

        let hour = 23, minute = 59;
        if (alarmObj && alarmObj.time && alarmObj.time.includes(':')) {
          const parts = alarmObj.time.split(':').map(Number);
          if (!isNaN(parts[0])) hour = parts[0];
          if (!isNaN(parts[1])) minute = parts[1];
        }

        const alarmTimestamp = new Date(y, m - 1, d, hour, minute, 0).getTime();
        // 자체 2차 알람(1분 늦게 울림) 및 사용자 터치 해제를 위해 2시간 이상 충분히 경과한 알람만 자동 정리
        const expireThreshold = alarmTimestamp + (2 * 60 * 60 * 1000);
        if (now >= expireThreshold) {
          delete alarms[dateStr];
          changed = true;
        }
      }

      if (changed) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE_ALARMS, JSON.stringify(alarms));
      }

      return alarms;
    } catch (e) {
      return {};
    }
  }

  isAlarmActive(dateStr) {
    const alarms = this.getActiveAlarms();
    return !!alarms[dateStr];
  }

  addActiveAlarm(dateStr, alarmData = {}) {
    const alarms = this.getActiveAlarms();
    alarms[dateStr] = {
      time: alarmData.time || '',
      type: alarmData.type || '',
      setAt: Date.now()
    };
    localStorage.setItem(STORAGE_KEYS.ACTIVE_ALARMS, JSON.stringify(alarms));
  }

  removeActiveAlarm(dateStr) {
    const alarms = this.getActiveAlarms();
    if (alarms[dateStr]) {
      delete alarms[dateStr];
      localStorage.setItem(STORAGE_KEYS.ACTIVE_ALARMS, JSON.stringify(alarms));
    }
  }

  getProfile() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return data ? JSON.parse(data) : DEFAULT_INITIAL_DATA.profile;
    } catch (e) {
      return DEFAULT_INITIAL_DATA.profile;
    }
  }

  setProfile(profile) {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }

  getKnownMembers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.KNOWN_MEMBERS);
      if (data) {
        const list = JSON.parse(data);
        if (Array.isArray(list) && list.length > 0) return list;
      }
      return ['최종철', '김철수', '이영희', '박민수'];
    } catch (e) {
      return ['최종철', '김철수', '이영희', '박민수'];
    }
  }

  setKnownMembers(members) {
    if (Array.isArray(members)) {
      localStorage.setItem(STORAGE_KEYS.KNOWN_MEMBERS, JSON.stringify(members));
    }
  }

  addKnownMember(name) {
    if (!name || typeof name !== 'string') return;
    const clean = name.replace(/\s*님$/, '').trim();
    if (!clean) return;
    const members = this.getKnownMembers();
    if (!members.includes(clean)) {
      members.push(clean);
      this.setKnownMembers(members);
    }
  }

  switchMember(name, team = null) {
    if (!name || typeof name !== 'string') return;
    const clean = name.replace(/\s*님$/, '').trim();
    if (!clean) return;
    this.addKnownMember(clean);
    const curProfile = this.getProfile();
    const updated = {
      name: clean + ' 님',
      team: (team !== null && team !== undefined) ? team : (curProfile.team || '생방기술1 · 직무 NDC'),
      avatar: clean[0] || '최'
    };
    this.setProfile(updated);
    return updated;
  }


  getBaseSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BASE_SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_INITIAL_DATA.baseSettings;
    } catch (e) {
      return DEFAULT_INITIAL_DATA.baseSettings;
    }
  }

  setBaseSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.BASE_SETTINGS, JSON.stringify(settings));
  }

  getOverrides() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OVERRIDES);
      return data ? JSON.parse(data) : DEFAULT_INITIAL_DATA.overrides;
    } catch (e) {
      return DEFAULT_INITIAL_DATA.overrides;
    }
  }

  setOverrides(overrides) {
    localStorage.setItem(STORAGE_KEYS.OVERRIDES, JSON.stringify(overrides));
  }

  setOverrideForDate(dateStr, overrideData) {
    const overrides = this.getOverrides();
    if (!overrideData) {
      delete overrides[dateStr];
    } else {
      overrides[dateStr] = overrideData;
    }
    this.setOverrides(overrides);
  }

  removeOverrideForDate(dateStr) {
    const overrides = this.getOverrides();
    delete overrides[dateStr];
    this.setOverrides(overrides);
  }

  getSchedules() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return data ? JSON.parse(data) : DEFAULT_INITIAL_DATA.schedules;
    } catch (e) {
      return DEFAULT_INITIAL_DATA.schedules;
    }
  }

  setSchedules(schedules) {
    localStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
  }

  addSchedule(schedule) {
    const schedules = this.getSchedules();
    const newSchedule = {
      id: 'sch-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
      ...schedule
    };
    schedules.push(newSchedule);
    // 날짜 및 00:00~23:59 시간순 정확한 정렬 (오전/오후 누락 없이 정렬)
    schedules.sort((a, b) => {
      if (a.dateStr !== b.dateStr) return a.dateStr.localeCompare(b.dateStr);
      const minA = parseScheduleTimeToMinutes(a.timeStr);
      const minB = parseScheduleTimeToMinutes(b.timeStr);
      if (minA !== minB) return minA - minB;
      return (a.id || '').localeCompare(b.id || '');
    });
    this.setSchedules(schedules);
    return newSchedule;
  }

  removeSchedule(id) {
    let schedules = this.getSchedules();
    schedules = schedules.filter(s => s.id !== id);
    this.setSchedules(schedules);
  }

  getSchedulesForDate(dateStr) {
    const schedules = this.getSchedules();
    const dayList = schedules.filter(s => s.dateStr === dateStr);
    return dayList.sort((a, b) => {
      const minA = parseScheduleTimeToMinutes(a.timeStr);
      const minB = parseScheduleTimeToMinutes(b.timeStr);
      if (minA !== minB) return minA - minB;
      return (a.id || '').localeCompare(b.id || '');
    });
  }

  resetToDefault() {
    this.setProfile(DEFAULT_INITIAL_DATA.profile);
    this.setBaseSettings(DEFAULT_INITIAL_DATA.baseSettings);
    this.setOverrides(DEFAULT_INITIAL_DATA.overrides);
    this.setSchedules(DEFAULT_INITIAL_DATA.schedules);
    this.setAlarmSettings(DEFAULT_ALARM_SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_ALARMS);
  }
}

// 전역 인스턴스 생성
const shiftStorage = new ShiftStorage();
