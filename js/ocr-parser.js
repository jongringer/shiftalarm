// PDF 및 사진(이미지) 근무표 인식 및 분석 파서 모듈

class ShiftOCRParser {
  constructor() {
    this.tesseractReady = false;
    this.pdfjsReady = false;
  }

  /**
   * PDF/이미지 본문 텍스트 또는 파일명에서 근무표 해당 연월(Year/Month) 자동 감지
   * 예: "2026년 10월", "10월 근무표", "2026-10", "10월.pdf" 등
   */
  detectYearMonth(text, filename = '') {
    const now = new Date();
    let defaultYear = now.getFullYear();
    let defaultMonth = now.getMonth() + 1;

    // 0. [모바일 캘린더 스크린샷 특화] 상단 단독 "M월" 또는 "M월 D일에 추가" 패턴 (최우선 감지)
    const calHeaderRegex = /(?:^|\n|\r)\s*([1-9]|1[0-2])\s*월(?:\s*(?:검색|\🔍|\d+|일))?/i;
    const chMatch = calHeaderRegex.exec(text);
    if (chMatch) {
      const m = parseInt(chMatch[1], 10);
      if (m >= 1 && m <= 12) {
        return { detectedYear: defaultYear, detectedMonth: m };
      }
    }

    const addScheduleRegex = /([1-9]|1[0-2])\s*월\s*(\d{1,2})\s*일에\s*추가/i;
    const asMatch = addScheduleRegex.exec(text);
    if (asMatch) {
      const m = parseInt(asMatch[1], 10);
      if (m >= 1 && m <= 12) {
        return { detectedYear: defaultYear, detectedMonth: m };
      }
    }

    // 1. "YYYY년 M월" 또는 "YYYY.M월" 명시적 패턴 탐색
    const ymRegex = /(202[4-9]|203[0-9])\s*년?\s*[\.\-\/\s]?\s*([0-1]?\d)\s*월/i;
    const ymMatch = ymRegex.exec(text);
    if (ymMatch) {
      const y = parseInt(ymMatch[1], 10);
      const m = parseInt(ymMatch[2], 10);
      if (m >= 1 && m <= 12) {
        return { detectedYear: y, detectedMonth: m };
      }
    }

    // 2. "2026.10" 또는 "2026-10" 또는 "2026/10" 패턴 탐색
    const dotRegex = /(202[4-9]|203[0-9])\s*[\.\-\/]\s*([0-1]?\d)(?!\d)/;
    const dotMatch = dotRegex.exec(text);
    if (dotMatch) {
      const y = parseInt(dotMatch[1], 10);
      const m = parseInt(dotMatch[2], 10);
      if (m >= 1 && m <= 12) {
        return { detectedYear: y, detectedMonth: m };
      }
    }

    // 3. 본문 텍스트에서 "M월 근무표", "M월 교대", "M월 일정" 패턴 탐색
    const monthScheduleRegex = /([0-1]?\d)\s*월\s*(?:근무표|일정표|교대|스케줄|SCHEDULE|근무|표)/i;
    const msMatch = monthScheduleRegex.exec(text);
    if (msMatch) {
      const m = parseInt(msMatch[1], 10);
      if (m >= 1 && m <= 12) {
        return { detectedYear: defaultYear, detectedMonth: m };
      }
    }

    // 4. 본문에서 "M월 D일" 등장 빈도 분석 (예: 10월 5일, 10월 17일 등)
    const monthDayRegex = /([0-1]?\d)\s*월\s*(\d{1,2})\s*일/g;
    const monthCounts = {};
    let mdMatch;
    while ((mdMatch = monthDayRegex.exec(text)) !== null) {
      const m = parseInt(mdMatch[1], 10);
      if (m >= 1 && m <= 12) {
        monthCounts[m] = (monthCounts[m] || 0) + 1;
      }
    }
    let maxCount = 0;
    let mostFrequentMonth = null;
    for (const [m, count] of Object.entries(monthCounts)) {
      if (count > maxCount) {
        maxCount = count;
        mostFrequentMonth = parseInt(m, 10);
      }
    }
    if (mostFrequentMonth) {
      return { detectedYear: defaultYear, detectedMonth: mostFrequentMonth };
    }

    // 5. 파일명(filename)에서 연월 탐색 (예: "2026_10월_근무표.pdf", "10월.jpg")
    if (filename) {
      const fnYm = /(202[4-9]|203[0-9])\s*[\_\.\-\s]?\s*([0-1]?\d)\s*월?/i.exec(filename);
      if (fnYm) {
        const y = parseInt(fnYm[1], 10);
        const m = parseInt(fnYm[2], 10);
        if (m >= 1 && m <= 12) {
          return { detectedYear: y, detectedMonth: m };
        }
      }
      const fnM = /([0-1]?\d)\s*월/i.exec(filename);
      if (fnM) {
        const m = parseInt(fnM[1], 10);
        if (m >= 1 && m <= 12) {
          return { detectedYear: defaultYear, detectedMonth: m };
        }
      }
    }

    // 6. 본문에서 단독 "M월" 키워드 출현 탐색
    const simpleMonthRegex = /(?:^|\s|\(|\[)([1-9]|1[0-2])\s*월(?:\s|\)|\]|$)/g;
    let smMatch;
    const smCounts = {};
    while ((smMatch = simpleMonthRegex.exec(text)) !== null) {
      const m = parseInt(smMatch[1], 10);
      smCounts[m] = (smCounts[m] || 0) + 1;
    }
    let smMax = 0;
    let smBest = null;
    for (const [m, count] of Object.entries(smCounts)) {
      if (count > smMax) {
        smMax = count;
        smBest = parseInt(m, 10);
      }
    }
    if (smBest) {
      return { detectedYear: defaultYear, detectedMonth: smBest };
    }

    return { detectedYear: defaultYear, detectedMonth: defaultMonth };
  }

  /**
   * 텍스트에서 날짜별 근무 변동사항(대근, 휴가, 교대) 스마트 추출
   * @param {string} text - 인식된 전체 텍스트
   * @param {number} targetYear - 기준 연도 (미지정 시 자동 감지)
   * @param {number} targetMonth - 기준 월 (미지정 시 자동 감지)
   * @param {string} filename - 업로드 파일명
   * @returns {Array} 추출된 변동 목록 [{ dateStr, originalDay, shiftType, note, confidence }]
   */
  parseShiftText(text, targetYear = null, targetMonth = null, filename = '') {
    // 연월이 명시되지 않은 경우 파일/본문에서 자동 감지
    if (!targetYear || !targetMonth) {
      const detected = this.detectYearMonth(text, filename);
      targetYear = targetYear || detected.detectedYear;
      targetMonth = targetMonth || detected.detectedMonth;
    }
    const results = [];
    const lines = text.split(/\r?\n/);

    // 정규식 패턴들
    // 1) 9월 17일 일근대근 / 9/17(목) 일근대근 / 17일: 일근대근
    const regex1 = /(?:(\d{1,2})[월\.\-\/])?\s*(\d{1,2})(?:일)?(?:\s*\([월화수목금토일]\))?[:\s\t\-\>]+([가-힣\w\s]+)/g;

    // 근무 키워드 사전 매핑
    const keywordMap = [
      { pattern: /일근대근|일근\s*대근/i, type: '일근대근', note: '일근 대근' },
      { pattern: /야근대근|야근\s*대근/i, type: '야근대근', note: '야근 대근' },
      { pattern: /조근대근|조근\s*대근/i, type: '조근대근', note: '조근 대근' },
      { pattern: /일근휴가|일근\s*휴가|연차\(일\)/i, type: '일근휴가', note: '일근 휴가' },
      { pattern: /야근휴가|야근\s*휴가|연차\(야\)/i, type: '야근휴가', note: '야근 휴가' },
      { pattern: /조근휴가|조근\s*휴가|연차\(조\)/i, type: '조근휴가', note: '조근 휴가' },
      { pattern: /휴가|연차|월차|공가|포상/i, type: '일근휴가', note: '휴가' },
      { pattern: /대근/i, type: '일근대근', note: '대근' },
      { pattern: /야근/i, type: '야근', note: '야근 근무' },
      { pattern: /조근/i, type: '조근', note: '조근 근무' },
      { pattern: /일근/i, type: '일근', note: '일근 근무' },
      { pattern: /비번|휴무/i, type: '비번', note: '비번' }
    ];

    lines.forEach((line) => {
      let match;
      while ((match = regex1.exec(line)) !== null) {
        let mMonth = match[1] ? parseInt(match[1], 10) : targetMonth;
        let day = parseInt(match[2], 10);
        let content = match[3].trim();

        if (day >= 1 && day <= 31 && mMonth === targetMonth) {
          for (const kw of keywordMap) {
            if (kw.pattern.test(content)) {
              const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              
              // 중복 방지
              const exists = results.find(r => r.dateStr === dateStr);
              if (!exists) {
                results.push({
                  dateStr,
                  day,
                  rawText: content,
                  shiftType: kw.type,
                  note: kw.note,
                  confidence: 90
                });
              }
              break;
            }
          }
        }
      }
    });

    // 2. 모바일 캘린더 그리드(스크린샷 포맷) 토큰 정밀 파싱
    // 날짜 번호(1~31) + 선택적 음력(예: 8.17, 8.24) + 근무 뱃지(일근대근, 야근, 조근 등)
    const mobileCalRegex = /(?:^|[\s\n\r])(\d{1,2})(?:\s+(?:\d{1,2}\.\d{1,2}))?\s*(일근대근|야근대근|조근대근|일근휴가|야근휴가|조근휴가|대근|휴가|연차|일근|야근|조근|비번)/g;
    let calMatch;
    let hasSeenDayOne = false; // 1일 이전의 전달 말일(27, 28, 29, 30) 스킵 플래그

    while ((calMatch = mobileCalRegex.exec(text)) !== null) {
      const day = parseInt(calMatch[1], 10);
      const kwStr = calMatch[2].trim();

      // 1일이 나오기 전의 20 이상 큰 날짜(전달 말일)는 스킵
      if (day === 1) {
        hasSeenDayOne = true;
      }
      if (!hasSeenDayOne && day > 15) {
        continue; // 이전달 날짜(예: 9월 27~30일) 스킵
      }

      if (day >= 1 && day <= 31) {
        let detectedType = '일근';
        let detectedNote = '';

        if (kwStr.includes('일근대근')) {
          detectedType = '일근대근';
          detectedNote = '일근 대근';
        } else if (kwStr.includes('야근대근')) {
          detectedType = '야근대근';
          detectedNote = '야근 대근';
        } else if (kwStr.includes('조근대근')) {
          detectedType = '조근대근';
          detectedNote = '조근 대근';
        } else if (kwStr.includes('일근휴가')) {
          detectedType = '일근휴가';
          detectedNote = '일근 휴가';
        } else if (kwStr.includes('야근휴가')) {
          detectedType = '야근휴가';
          detectedNote = '야근 휴가';
        } else if (kwStr.includes('조근휴가')) {
          detectedType = '조근휴가';
          detectedNote = '조근 휴가';
        } else if (kwStr.includes('대근')) {
          detectedType = '일근대근';
          detectedNote = '대근';
        } else if (kwStr.includes('휴가') || kwStr.includes('연차')) {
          detectedType = '일근휴가';
          detectedNote = '휴가';
        } else if (kwStr === '야근') {
          detectedType = '야근';
          detectedNote = '야근 근무';
        } else if (kwStr === '조근') {
          detectedType = '조근';
          detectedNote = '조근 근무';
        } else if (kwStr === '일근') {
          detectedType = '일근';
          detectedNote = '일근 근무';
        } else if (kwStr === '비번') {
          detectedType = '비번';
          detectedNote = '비번';
        }

        const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const existingIdx = results.findIndex(r => r.dateStr === dateStr);

        // 대근/휴가 등 변동 사항은 우선하여 덮어쓰거나 추가
        if (existingIdx !== -1) {
          if (detectedType.includes('대근') || detectedType.includes('휴가')) {
            results[existingIdx] = {
              dateStr,
              day,
              rawText: kwStr,
              shiftType: detectedType,
              note: detectedNote,
              confidence: 95
            };
          }
        } else {
          // 변동사항(대근/휴가)이거나, 일반 근무도 수집
          results.push({
            dateStr,
            day,
            rawText: kwStr,
            shiftType: detectedType,
            note: detectedNote,
            confidence: detectedType.includes('대근') ? 95 : 85
          });
        }
      }
    }

    // 3. 모바일 캘린더 내 개인 일정 메모 탐색 (예: "12 저녁 감자바위", "15 퇴직연금 개시 2년차")
    const memoRegex = /(?:^|[\s\n\r])(\d{1,2})\s*(?:일)?\s*([가-힣\w\s]{2,20}(?:감자바위|퇴직연금|모임|회식|약속|병원|생일))/g;
    let memoMatch;
    while ((memoMatch = memoRegex.exec(text)) !== null) {
      const day = parseInt(memoMatch[1], 10);
      const memoText = memoMatch[2].trim();
      const dateStr = `${targetYear}-${String(targetMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const item = results.find(r => r.dateStr === dateStr);
      if (item) {
        item.note = item.note ? `${item.note} / ${memoText}` : memoText;
      }
    }

    results.sort((a, b) => a.day - b.day);
    results.detectedYear = targetYear;
    results.detectedMonth = targetMonth;
    return results;
  }

  /**
   * PDF 파일로부터 텍스트 추출
   */
  async extractTextFromPDF(file, onProgress) {
    if (typeof pdfjsLib === 'undefined') {
      throw new Error('PDF.js 라이브러리가 로드되지 않았습니다.');
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      if (onProgress) {
        onProgress(Math.round((pageNum / pdf.numPages) * 100), `PDF ${pageNum}/${pdf.numPages} 페이지 분석 중...`);
      }
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      fullText += pageText + '\n';
    }

    return fullText;
  }

  /**
   * 이미지 파일로부터 OCR 텍스트 추출 (Tesseract.js)
   */
  async extractTextFromImage(fileOrBlob, onProgress) {
    if (typeof Tesseract === 'undefined') {
      throw new Error('Tesseract.js 라이브러리가 로드되지 않았습니다.');
    }

    const { createWorker } = Tesseract;
    const worker = await createWorker('kor+eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text' && onProgress) {
          onProgress(Math.round(m.progress * 100), `근무표 이미지 텍스트 인식 중... (${Math.round(m.progress * 100)}%)`);
        } else if (onProgress) {
          onProgress(30, 'OCR 언어 모델 로딩 및 전처리 중...');
        }
      }
    });

    const ret = await worker.recognize(fileOrBlob);
    await worker.terminate();
    return ret.data.text;
  }

  /**
   * 텍스트에서 한글 인명(근무자 이름 후보군) 자동 감지 및 추출
   * @param {string} text - OCR 또는 PDF 추출 전체 텍스트
   * @param {string} currentName - 현재 설정된 사용자 이름
   * @returns {Array<string>} 고유한 근무자 이름 목록 (예: ['최종철', '김철수', '이영희'])
   */
  extractCandidateNames(text, currentName = '최종철') {
    const candidates = new Set();
    const cleanCurrent = (currentName || '').replace(/\s*님$/, '').trim();
    if (cleanCurrent) candidates.add(cleanCurrent);

    if (!text || typeof text !== 'string') {
      return Array.from(candidates);
    }

    // 근무표 및 앱 불용어(인명이 아닌 단어) 리스트
    const stopwords = new Set([
      '근무', '일근', '야근', '조근', '비번', '휴가', '연차', '대근', '월차', '공가', '포상', '병가',
      '특이', '사항', '일정', '요일', '일자', '시간', '날짜', '교대', '스마트', '캘린더', '관리', '안내',
      '출근', '퇴근', '오전', '오후', '시계', '알람', '등록', '변경', '확인', '수정', '저장', '복원',
      '취소', '초기화', '새로', '고침', '여의도', '목동', '서울', '병원', '모임', '회식', '약속', '생일',
      '지하철', '정류장', '공휴일', '신정', '설날', '추석', '삼일절', '어린이', '현충일', '광복절', '개천절',
      '한글날', '성탄절', '이대병원', '양정고', '경인초', '직무', '생방', '기술', '모드', '날씨', '현재',
      '단독', '표출', '도착', '정보', '전광판', '이달', '월간', '통계', '선택', '인쇄', '자체', '울림'
    ]);

    // 1. "XXX 님", "XXX 팀장/선임/책임/과장/대리/사원/주임/부장" 명시적 호칭 패턴 (신뢰도 최우선)
    const titleRegex = /([가-힣]{2,4})\s*(?:님|팀장|선임|책임|과장|대리|사원|주임|부장|차장)/g;
    let match;
    while ((match = titleRegex.exec(text)) !== null) {
      const name = match[1].trim();
      if (!stopwords.has(name) && name.length >= 2 && name.length <= 4) {
        candidates.add(name);
      }
    }

    // 2. 한국 주요 성씨 기반 2~3글자 인명 패턴 (성씨 + 1~2자)
    const familyNames = '김|이|박|최|정|강|조|윤|장|임|한|오|서|신|권|황|안|송|류|홍|고|문|양|손|배|백|허|유|남|심|노|하|곽|성|차|주|우|구|전|민|진|지|엄|채|원|천|방|공|현|함|변|염|여|추|도|소|석|선|설|마|길|연|위|표|명|기|반|왕|금|옥|육|인|맹|제|탁|어';
    const nameRegex = new RegExp(`(?:^|[\\s\\n\\r,;:\\[\\]\\(/])(${familyNames})([가-힣]{1,2})(?=[\\s\\n\\r,;:\\]\\)/]|$)`, 'g');
    
    while ((match = nameRegex.exec(text)) !== null) {
      const fullName = (match[1] + match[2]).trim();
      if (!stopwords.has(fullName) && fullName.length >= 2 && fullName.length <= 3) {
        if (!/^(일근|야근|조근|비번|휴가|연차|대근)$/.test(fullName)) {
          candidates.add(fullName);
        }
      }
    }

    return Array.from(candidates);
  }

  /**
   * 특정 근무자(이름)에 특화된 근무 일정 파싱
   */
  parseShiftTextForName(text, targetName, targetYear = null, targetMonth = null, filename = '') {
    if (!targetName) {
      return this.parseShiftText(text, targetYear, targetMonth, filename);
    }

    const cleanName = targetName.replace(/\s*님$/, '').trim();
    const lines = text.split(/\r?\n/);
    
    // 대상 이름이 포함된 줄(Line)들을 우선 필터링
    const targetLines = lines.filter(line => line.includes(cleanName));

    if (targetLines.length > 0) {
      const userText = targetLines.join('\n');
      const results = this.parseShiftText(userText, targetYear, targetMonth, filename);
      if (results && results.length > 0) {
        return results;
      }
    }

    return this.parseShiftText(text, targetYear, targetMonth, filename);
  }

  /**
   * 데모/테스트용 샘플 데이터 생성
   * - 9월: 17일 일근대근, 18일 일근휴가, 19일 야근
   * - 10월: 모바일 캘린더 스크린샷 실제 포맷 (23일 일근대근, 31일 일근대근, 12일 저녁 감자바위, 15일 퇴직연금 개시 2년차 등)
   */
  getSampleExtractedData(year = 2026, month = 10) {
    if (month === 10) {
      return [
        {
          dateStr: `${year}-10-23`,
          day: 23,
          rawText: '23일(금) 일근대근',
          shiftType: '일근대근',
          time: '',
          note: '',
          confidence: 99
        },
        {
          dateStr: `${year}-10-31`,
          day: 31,
          rawText: '31일(토) 일근대근',
          shiftType: '일근대근',
          time: '',
          note: '',
          confidence: 99
        }
      ];
    }

    return [
      {
        dateStr: `${year}-${String(month).padStart(2, '0')}-17`,
        day: 17,
        rawText: '17일(목) 일근대근',
        shiftType: '일근대근',
        time: '',
        note: '',
        confidence: 99
      },
      {
        dateStr: `${year}-${String(month).padStart(2, '0')}-18`,
        day: 18,
        rawText: '18일(금) 일근휴가',
        shiftType: '일근휴가',
        time: '',
        note: '',
        confidence: 98
      },
      {
        dateStr: `${year}-${String(month).padStart(2, '0')}-19`,
        day: 19,
        rawText: '19일(토) 야근',
        shiftType: '야근',
        time: '',
        note: '',
        confidence: 95
      }
    ];
  }
}

const shiftOCRParser = new ShiftOCRParser();

