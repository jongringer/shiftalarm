// ==========================================================================
// 실시간 정류장 ID(5자리) 및 정류소·지하철역 실시간 도착정보 조회 엔진
// - 서울시 버스 TOPIS (getStationByUid, getStationByName) 직결
// - 서울교통공사/서울시 지하철 실시간 도착정보 (realtimeStationArrival) 직결
// - 숫자 5자리 입력 즉시 해당 정류소 다음·다다음 버스 실시간 카운트다운
// - '선유' 검색 시 '선유도역(9호선)' 및 버스정류소 실시간 추천
// - 낮 모드(애플 라이트) 및 밤 모드(옵시디언 다크) 완벽 일체화 디자인
// ==========================================================================

(function() {
  'use strict';

  // 수도권 주요 지하철역 및 호선 데이터베이스
  const SUBWAY_STATIONS = [
    { name: '선유도', lines: ['9호선'] },
    { name: '당산', lines: ['2호선', '9호선'] },
    { name: '영등포구청', lines: ['2호선', '5호선'] },
    { name: '신목동', lines: ['9호선'] },
    { name: '목동', lines: ['5호선'] },
    { name: '오목교', lines: ['5호선'] },
    { name: '여의도', lines: ['5호선', '9호선'] },
    { name: '국회의사당', lines: ['9호선'] },
    { name: '샛강', lines: ['9호선', '신림선'] },
    { name: '노량진', lines: ['1호선', '9호선'] },
    { name: '신길', lines: ['1호선', '5호선'] },
    { name: '영등포', lines: ['1호선'] },
    { name: '영등포시장', lines: ['5호선'] },
    { name: '문래', lines: ['2호선'] },
    { name: '신도림', lines: ['1호선', '2호선'] },
    { name: '대림', lines: ['2호선', '7호선'] },
    { name: '구로', lines: ['1호선'] },
    { name: '합정', lines: ['2호선', '6호선'] },
    { name: '홍대입구', lines: ['2호선', '공항철도', '경의중앙선'] },
    { name: '신촌', lines: ['2호선'] },
    { name: '이대', lines: ['2호선'] },
    { name: '아현', lines: ['2호선'] },
    { name: '충정로', lines: ['2호선', '5호선'] },
    { name: '시청', lines: ['1호선', '2호선'] },
    { name: '서울역', lines: ['1호선', '4호선', '공항철도', '경의중앙선'] },
    { name: '용산', lines: ['1호선', '경의중앙선'] },
    { name: '마포', lines: ['5호선'] },
    { name: '공덕', lines: ['5호선', '6호선', '공항철도', '경의중앙선'] },
    { name: '여의나루', lines: ['5호선'] },
    { name: '마포구청', lines: ['6호선'] },
    { name: '망원', lines: ['6호선'] },
    { name: '상수', lines: ['6호선'] },
    { name: '광흥창', lines: ['6호선'] },
    { name: '염창', lines: ['9호선'] },
    { name: '등촌', lines: ['9호선'] },
    { name: '증미', lines: ['9호선'] },
    { name: '가양', lines: ['9호선'] },
    { name: '양천향교', lines: ['9호선'] },
    { name: '마곡나루', lines: ['9호선', '공항철도'] },
    { name: '신방화', lines: ['9호선'] },
    { name: '공항시장', lines: ['9호선'] },
    { name: '김포공항', lines: ['5호선', '9호선', '공항철도', '김포골드', '서해선'] },
    { name: '개화', lines: ['9호선'] },
    { name: '노들', lines: ['9호선'] },
    { name: '흑석', lines: ['9호선'] },
    { name: '동작', lines: ['4호선', '9호선'] },
    { name: '구반포', lines: ['9호선'] },
    { name: '신반포', lines: ['9호선'] },
    { name: '고속터미널', lines: ['3호선', '7호선', '9호선'] },
    { name: '사평', lines: ['9호선'] },
    { name: '신논현', lines: ['9호선', '신분당선'] },
    { name: '언주', lines: ['9호선'] },
    { name: '선정릉', lines: ['9호선', '수인분당선'] },
    { name: '삼성중앙', lines: ['9호선'] },
    { name: '봉은사', lines: ['9호선'] },
    { name: '종합운동장', lines: ['2호선', '9호선'] },
    { name: '삼전', lines: ['9호선'] },
    { name: '석촌고분', lines: ['9호선'] },
    { name: '석촌', lines: ['8호선', '9호선'] },
    { name: '송파나루', lines: ['9호선'] },
    { name: '한성백제', lines: ['9호선'] },
    { name: '올림픽공원', lines: ['5호선', '9호선'] },
    { name: '둔촌오륜', lines: ['9호선'] },
    { name: '중앙보훈병원', lines: ['9호선'] },
    { name: '강남', lines: ['2호선', '신분당선'] },
    { name: '역삼', lines: ['2호선'] },
    { name: '선릉', lines: ['2호선', '수인분당선'] },
    { name: '삼성', lines: ['2호선'] },
    { name: '잠실', lines: ['2호선', '8호선'] },
    { name: '서초', lines: ['2호선'] },
    { name: '교대', lines: ['2호선', '3호선'] },
    { name: '방배', lines: ['2호선'] },
    { name: '사당', lines: ['2호선', '4호선'] },
    { name: '낙성대', lines: ['2호선'] },
    { name: '서울대입구', lines: ['2호선'] },
    { name: '봉천', lines: ['2호선'] },
    { name: '신림', lines: ['2호선', '신림선'] },
    { name: '신대방', lines: ['2호선'] },
    { name: '구로디지털단지', lines: ['2호선'] },
    { name: '을지로입구', lines: ['2호선'] },
    { name: '을지로3가', lines: ['2호선', '3호선'] },
    { name: '을지로4가', lines: ['2호선', '5호선'] },
    { name: '동대문역사문화공원', lines: ['2호선', '4호선', '5호선'] },
    { name: '왕십리', lines: ['2호선', '5호선', '수인분당선', '경의중앙선'] },
    { name: '성수', lines: ['2호선'] },
    { name: '건대입구', lines: ['2호선', '7호선'] },
    { name: '종로3가', lines: ['1호선', '3호선', '5호선'] },
    { name: '광화문', lines: ['5호선'] },
    { name: '서대문', lines: ['5호선'] },
    { name: '까치산', lines: ['2호선', '5호선'] },
    { name: '화곡', lines: ['5호선'] },
    { name: '우장산', lines: ['5호선'] },
    { name: '발산', lines: ['5호선'] },
    { name: '마곡', lines: ['5호선'] },
    { name: '송정', lines: ['5호선'] },
    { name: '신정', lines: ['5호선'] },
    { name: '신정네거리', lines: ['2호선'] },
    { name: '양천구청', lines: ['2호선'] },
    { name: '도림천', lines: ['2호선'] }
  ];

  // 주요 버스 노선 데이터베이스 (버스 번호 검색 지원)
  // 주요 버스 노선 데이터베이스 (버스 번호 검색 시 전체 정류소 스크롤 팝업 지원)
  const POPULAR_BUS_ROUTES = [
    {
      routeNo: '603',
      routeType: '간선버스',
      badgeClass: 'badge-blue',
      summary: '신월동 ↔ 목동역 ↔ 당산역 ↔ 서울역/시청',
      stops: [
        { arsId: '15383', stNm: '신월동기점', dir: '기점 출발' },
        { arsId: '15150', stNm: '양천보건소', dir: '목동역 방면' },
        { arsId: '15162', stNm: '목동역.홍익병원', dir: '목동역 7번출구' },
        { arsId: '15152', stNm: '목동5단지C상가', dir: '이대목동병원 방면' },
        { arsId: '15153', stNm: '목동6단지앞', dir: '이대목동병원 방면' },
        { arsId: '15154', stNm: '이대목동병원.목동6단지앞', dir: '선유도/당산역 방면' },
        { arsId: '19210', stNm: '선유도역1번출구', dir: '당산역 방면' },
        { arsId: '19176', stNm: '당산역삼성래미안아파트 (당산역버스정류장)', dir: '귀가/신월동 방면' },
        { arsId: '19175', stNm: '당산역 (2호선·9호선)', dir: '영등포시장 방면' },
        { arsId: '19208', stNm: '영등포시장역', dir: '영등포 방면' },
        { arsId: '19102', stNm: '영등포역 (1호선)', dir: '신길역 방면' },
        { arsId: '19230', stNm: '신길역', dir: '여의도/마포 방면' },
        { arsId: '14167', stNm: '마포역 (5호선)', dir: '공덕역 방면' },
        { arsId: '14169', stNm: '공덕역 (5·6호선)', dir: '충정로 방면' },
        { arsId: '13140', stNm: '충정로역 (2·5호선)', dir: '서울역 방면' },
        { arsId: '02007', stNm: '서울역버스환승센터 (1·4호선)', dir: '시청/종로 방면' },
        { arsId: '02128', stNm: '시청앞.덕수궁 (회차)', dir: '회차 지점' }
      ]
    },
    {
      routeNo: '6620',
      routeType: '지선버스',
      badgeClass: 'badge-green',
      summary: '양천공영차고지 ↔ 목동 ↔ 당산역 ↔ 영등포구청',
      stops: [
        { arsId: '15385', stNm: '양천공영차고지', dir: '기점 출발' },
        { arsId: '15217', stNm: '신정현대아파트', dir: '신정동 방면' },
        { arsId: '15161', stNm: '목동역 (5호선)', dir: '오목교/목동단지 방면' },
        { arsId: '15152', stNm: '목동5단지C상가', dir: '이대병원 방면' },
        { arsId: '15153', stNm: '목동6단지앞', dir: '양천차고지/당산 방면' },
        { arsId: '15154', stNm: '이대목동병원.목동6단지앞', dir: '당산역 방면' },
        { arsId: '15160', stNm: '신목초등학교입구', dir: '선유도 방면' },
        { arsId: '19210', stNm: '선유도역1번출구', dir: '당산역 방면' },
        { arsId: '19176', stNm: '당산역삼성래미안아파트 (당산역버스정류장)', dir: '귀가/양천차고지 방면' },
        { arsId: '19175', stNm: '당산역 (2호선·9호선)', dir: '영등포구청 방면' },
        { arsId: '19225', stNm: '영등포구청역 (2·5호선)', dir: '영등포구청 방면' },
        { arsId: '19729', stNm: '영등포구청.우리은행', dir: '문래역 방면' },
        { arsId: '19194', stNm: '문래역 (2호선)', dir: '회차 지점' }
      ]
    },
    {
      routeNo: '6637',
      routeType: '지선버스',
      badgeClass: 'badge-green',
      summary: '광명시 ↔ 개봉역 ↔ 목동단지 ↔ 영등포구청역',
      stops: [
        { arsId: '38001', stNm: '노온사동차고지 (광명)', dir: '광명시 기점' },
        { arsId: '38054', stNm: '광명사거리역 (7호선)', dir: '개봉역 방면' },
        { arsId: '17172', stNm: '개봉역 (1호선)', dir: '고척동 방면' },
        { arsId: '17180', stNm: '고척시장', dir: '목동역 방면' },
        { arsId: '15161', stNm: '목동역 (5호선)', dir: '오목교 방면' },
        { arsId: '15155', stNm: '오목교역.청학스포츠타운', dir: '목동단지 방면' },
        { arsId: '15156', stNm: '경인초교.목동5·6단지사잇길', dir: '오목교·광명 방면' },
        { arsId: '15158', stNm: '양정고등학교', dir: '영등포구청역 방면' },
        { arsId: '15153', stNm: '목동6단지앞', dir: '이대목동병원 방면' },
        { arsId: '15154', stNm: '이대목동병원.목동6단지앞', dir: '영등포 방면' },
        { arsId: '19170', stNm: '당산동진로아파트', dir: '영등포구청 방면' },
        { arsId: '19729', stNm: '영등포구청.우리은행 (영등포구청6637버스)', dir: '목동·광명 방면' },
        { arsId: '19225', stNm: '영등포구청역 (2·5호선)', dir: '회차 지점' }
      ]
    },
    {
      routeNo: '양천01',
      routeType: '마을버스',
      badgeClass: 'badge-town',
      summary: '당산역 ↔ 선유도역 ↔ 이대목동병원 ↔ 목동역',
      stops: [
        { arsId: '19176', stNm: '당산역삼성래미안아파트 (당산역버스정류장)', dir: '목동역 방면' },
        { arsId: '19210', stNm: '선유도역1번출구', dir: '목동 방면' },
        { arsId: '19215', stNm: '안양천입구', dir: '이대목동병원 방면' },
        { arsId: '15154', stNm: '이대목동병원.목동6단지앞', dir: '당산역/목동 방면' },
        { arsId: '15153', stNm: '목동6단지아파트', dir: '파리공원 방면' },
        { arsId: '15152', stNm: '목동5단지아파트', dir: '파리공원 방면' },
        { arsId: '15157', stNm: '파리공원', dir: '목동이대병원입구 방면' },
        { arsId: '15165', stNm: '목동이대병원입구', dir: '오목교역 방면' },
        { arsId: '15155', stNm: '오목교역 (5호선)', dir: '목동역 방면' },
        { arsId: '15161', stNm: '목동역 (5호선)', dir: '종점' }
      ]
    },
    {
      routeNo: '양천02',
      routeType: '마을버스',
      badgeClass: 'badge-town',
      summary: '오목교역 ↔ 경인초교 ↔ 양정고 ↔ 이대목동병원',
      stops: [
        { arsId: '15155', stNm: '오목교역 (5호선)', dir: '기점' },
        { arsId: '15168', stNm: '현대백화점목동점', dir: '경인초교 방면' },
        { arsId: '15156', stNm: '경인초교.목동5·6단지사잇길', dir: '오목교역 방면' },
        { arsId: '15158', stNm: '양정고등학교', dir: '목동단지 방면' },
        { arsId: '15159', stNm: '목동6단지후문', dir: '이대목동병원 방면' },
        { arsId: '15154', stNm: '이대목동병원.목동6단지앞', dir: '종점' }
      ]
    },
    {
      routeNo: '700',
      routeType: '부천버스',
      badgeClass: 'badge-sky',
      summary: '부천 상동 ↔ 부천역 ↔ 목동 ↔ 당산역 ↔ 여의도',
      stops: [
        { arsId: '15153', stNm: '목동6단지앞', dir: '당산역 방면' },
        { arsId: '15154', stNm: '이대목동병원.목동6단지앞', dir: '당산역 방면' },
        { arsId: '19176', stNm: '당산역삼성래미안아파트 (당산역버스정류장)', dir: '부천 방면' },
        { arsId: '19175', stNm: '당산역 (2호선·9호선)', dir: '여의도 방면' }
      ]
    }
  ];

  // 수도권 및 출퇴근 핵심 지역 주요 버스 정류소 데이터베이스 (오프라인/즉시 검색 지원)
  const LOCAL_POPULAR_STATIONS = [
    // [선유도 일대 정류소]
    { arsId: '19210', stNm: '선유도역1번출구', keywords: ['선유', '선유도', '선유도역', '19210', '양천01', '603'] },
    { arsId: '19212', stNm: '선유도역.롯데홈쇼핑', keywords: ['선유', '선유도', '선유도역', '19212', '롯데홈쇼핑', '당산방면'] },
    { arsId: '19211', stNm: '선유도역', keywords: ['선유', '선유도', '선유도역', '19211', '염창방면'] },
    { arsId: '19141', stNm: '양평한신아파트.선유도역', keywords: ['선유', '선유도', '선유도역', '19141', '양평한신'] },
    { arsId: '19213', stNm: '선유고등학교', keywords: ['선유', '선유고', '선유고등학교', '19213'] },
    { arsId: '19214', stNm: '선유중학교', keywords: ['선유', '선유중', '선유중학교', '19214'] },
    { arsId: '19284', stNm: '선유도공원입구', keywords: ['선유', '선유도', '선유도공원', '19284'] },

    // [목동 / 양천 / 경인 일대 정류소]
    { arsId: '15158', stNm: '양정고등학교', keywords: ['양정', '양정고', '15158', '6637', '양천02', '목동'] },
    { arsId: '15156', stNm: '경인초교.목동아파트5.6단지사잇길', keywords: ['경인', '경인초', '15156', '6637', '양천02', '목동'] },
    { arsId: '15154', stNm: '이대목동병원.목동6단지앞', keywords: ['이대', '이대목동병원', '15154', '목동6단지', '양천01', '603', '6620', '6637'] },
    { arsId: '15153', stNm: '목동6단지앞', keywords: ['목동', '목동6단지', '15153', '양천01', '603', '6620'] },
    { arsId: '15155', stNm: '목동5단지C상가.목동운동장', keywords: ['목동', '목동5단지', '15155', '목동운동장'] },
    { arsId: '15160', stNm: '신목초등학교입구', keywords: ['신목', '신목초', '15160', '목동', '603'] },
    { arsId: '15161', stNm: '월촌중학교', keywords: ['월촌', '월촌중', '15161', '목동'] },
    { arsId: '15282', stNm: '목동운동장남문.야구장.아이스링크', keywords: ['목동', '목동운동장', '15282'] },
    { arsId: '15283', stNm: '목동아파트5단지', keywords: ['목동', '목동5단지', '15283'] },

    // [당산 일대 정류소]
    { arsId: '19175', stNm: '당산역', keywords: ['당산', '당산역', '19175', '2호선', '9호선'] },
    { arsId: '19176', stNm: '당산역삼성래미안아파트', keywords: ['당산', '당산역', '당산역버스정류장', '19176', '삼성래미안', '603', '6620', '양천01'] },
    { arsId: '19173', stNm: '당산역1번출구', keywords: ['당산', '당산역', '19173', '1번출구'] },
    { arsId: '19218', stNm: '당산역2번출구', keywords: ['당산', '당산역', '19218', '2번출구'] },

    // [영등포구청 일대 정류소]
    { arsId: '19729', stNm: '영등포구청.우리은행', keywords: ['영등포구청', '영등포구청6637', '영등포구청6637버스', '19729', '6637'] },

    // [여의도 / 국회 일대 정류소]
    { arsId: '19143', stNm: '국회의사당역', keywords: ['국회', '국회의사당', '19143', '9호선'] },
    { arsId: '19144', stNm: '여의도순복음교회', keywords: ['여의도', '순복음교회', '19144'] },
    { arsId: '19145', stNm: '국회의사당', keywords: ['국회', '국회의사당', '19145'] },
    { arsId: '19156', stNm: '여의도역', keywords: ['여의도', '여의도역', '19156', '5호선', '9호선'] }
  ];

  // 9호선 선유도역 공식 시간표 데이터 (당산·여의도·중앙보훈병원 방면 일반열차)
  const SEONYUDO_WEEKDAY_TIMETABLE = {
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
    24: [7, 18, 30, 43, 56]
  };

  const SEONYUDO_WEEKEND_TIMETABLE = {
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
    23: [11, 27, 41, 55]
  };

  class TransitLookupController {
    constructor() {
      this.busApiKey = '0f40f3c7a3220ef7d0f45825f4364e47d05d10fa087632a03db7c8c2222aae63';
      this.subwayApiKey = '476a79484b6a6f6e3833504f4f6d4e';

      this.currentType = 'bus'; // 'bus' | 'subway'
      this.currentId = '15158';   // 디폴트로 15158(양정고등학교) 선택
      this.currentName = '양정고등학교';
      this.lastBusData = null;
      this.lastSubwayData = null;
      this.userInitiatedScroll = false; // 오직 사용자가 직접 터치/클릭했을 때만 스크롤 허용!

      this.filterType = 'all'; // 'all' | 'town' | 'blue' | 'green' | 'red'
      this.sortType = 'arrival'; // 'arrival' | 'number'

      this.autoRefreshInterval = 15;
      this.refreshCountdown = 15;
      this.tickerTimer = null;
      this.debounceTimer = null;
      this.isFetching = false;

      this.cache = {
        bus: {},
        subway: {}
      };
      this.showAllDangsanRoutes = false; // 당산역(19176) 기본 603·6620 2개 표출 및 전체보기 토글 플래그
      window.transitLookupInstance = this;

      this.initDom();
      this.initEvents();
      this.renderQuickChips();

      // 디폴트로 15158(양정고등학교) 자동 로딩 (초기 스크롤 방지)
      this.loadDefaultStation();
    }

    loadDefaultStation() {
      // 1순위 기본값: 15158 (양정고등학교) - 사용자가 직접 선택할 때만 스크롤되도록 플래그 false 유지
      this.userInitiatedScroll = false;
      setTimeout(() => {
        this.lookupBusByArs('15158', '양정고등학교');
      }, 60);
    }

    initDom() {
      this.section = document.getElementById('transitLookupSection');
      this.inputQuery = document.getElementById('inputTransitQuery');
      this.btnClearQuery = document.getElementById('btnClearLookupQuery');
      this.btnSearch = document.getElementById('btnExecLookupSearch');
      this.dropdown = document.getElementById('lookupSuggestionsDropdown');
      this.chipsContainer = document.getElementById('quickChipsContainer');
      this.resultContainer = document.getElementById('lookupResultContainer');
      this.btnRefresh = document.getElementById('btnLookupRefresh');
      this.liveBadge = document.getElementById('transitLookupLiveBadge');
    }

    initEvents() {
      if (!this.inputQuery) return;

      // 실시간 입력 감지
      this.inputQuery.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        if (this.btnClearQuery) {
          this.btnClearQuery.style.display = val ? 'flex' : 'none';
        }

        // 5자리 숫자 입력 시 즉시 자동 조회
        const cleanDigits = val.replace(/[^0-9]/g, '');
        if (cleanDigits.length === 5 && val === cleanDigits) {
          this.hideSuggestions();
          this.lookupBusByArs(cleanDigits);
          return;
        }

        // 텍스트 검색 시 자동완성 디바운스
        clearTimeout(this.debounceTimer);
        if (val.length >= 1) {
          this.debounceTimer = setTimeout(() => {
            this.handleAutocomplete(val);
          }, 180);
        } else {
          this.hideSuggestions();
        }
      });

      // 엔터 키 입력 시 조회
      this.inputQuery.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSearch();
        } else if (e.key === 'Escape') {
          this.hideSuggestions();
        }
      });

      // 검색 버튼 클릭
      if (this.btnSearch) {
        this.btnSearch.addEventListener('click', () => {
          this.executeSearch();
        });
      }

      // 입력 지우기 버튼
      if (this.btnClearQuery) {
        this.btnClearQuery.addEventListener('click', () => {
          this.inputQuery.value = '';
          this.btnClearQuery.style.display = 'none';
          this.hideSuggestions();
          this.inputQuery.focus();
        });
      }

      // 상단 새로고침 버튼
      if (this.btnRefresh) {
        this.btnRefresh.addEventListener('click', () => {
          this.refreshCurrent();
        });
      }

      // 외부 클릭 시 드롭다운 닫기
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.lookup-search-container')) {
          this.hideSuggestions();
        }
      });
    }

    // ==========================================
    // 화면 자동 스크롤: 사용자가 직접 선택했을 때만 1회 즉각 이동
    // (위로 다시 올린 상태에서는 절대 자동으로 내려가지 않음)
    // ==========================================
    scrollToResult(smooth = true) {
      setTimeout(() => {
        const target = document.querySelector('.lookup-cards-container') ||
                       document.querySelector('.seonyudo-timetable-card') ||
                       document.querySelector('.lookup-board-wrap') ||
                       document.getElementById('lookupResultContainer');
        if (target) {
          const rect = target.getBoundingClientRect();
          const targetY = window.pageYOffset + rect.top - 16;
          window.scrollTo({
            top: Math.max(0, targetY),
            behavior: smooth ? 'smooth' : 'auto'
          });
        }
      }, 30);
    }

    // ==========================================
    // 버스 노선 정류장 전체보기 팝업 모달 관리 (사용자 요청)
    // ==========================================
    ensureBusRouteModal() {
      if (document.getElementById('modalBusRouteStops')) return;

      const modalHtml = `
        <div class="modal-overlay modal-bus-route-overlay" id="modalBusRouteStops" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.75); backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px); z-index:100000; justify-content:center; align-items:center; padding:12px;">
          <div class="modal-container bus-route-stops-modal" style="background:#ffffff; width:100%; max-width:480px; max-height:85vh; border-radius:22px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.4); display:flex; flex-direction:column; overflow:hidden; border:1px solid #cbd5e1;">
            
            <div class="modal-header" style="background:linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color:#ffffff; padding:14px 16px; display:flex; justify-content:space-between; align-items:center;">
              <div style="min-width:0; flex:1;">
                <h4 id="modalBusRouteTitle" style="font-size:16px; font-weight:900; margin:0; display:flex; align-items:center; gap:8px;">
                  <span class="modal-bus-route-badge badge-blue">603번</span> 간선버스
                </h4>
                <p id="modalBusRouteSummary" style="font-size:11.5px; color:#94a3b8; margin:4px 0 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                  신월동 ↔ 당산역 ↔ 서울역
                </p>
              </div>
              <button type="button" class="modal-close-btn" onclick="window.transitLookupInstance.closeBusRouteModal()" style="background:rgba(255,255,255,0.15); border:none; color:#ffffff; font-size:16px; width:32px; height:32px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;">✕</button>
            </div>

            <div style="padding:9px 14px; background:#f1f5f9; border-bottom:1px solid #e2e8f0; font-size:12px; color:#334155; font-weight:700; display:flex; align-items:center; gap:6px;">
              <span>💡</span>
              <span>정류장을 선택하면 해당 정류장의 실시간 도착정보가 열립니다.</span>
            </div>

            <div class="modal-body" id="modalBusRouteStopsList" style="padding:14px; overflow-y:auto; flex:1; max-height:55vh; display:flex; flex-direction:column; gap:8px; background:#f8fafc;">
            </div>

            <div class="modal-footer" style="padding:10px 16px; background:#ffffff; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-size:11px; color:#64748b;">서울시 TOPIS 실시간 연동</span>
              <button type="button" class="btn-primary" onclick="window.transitLookupInstance.closeBusRouteModal()" style="background:#0284c7; color:#ffffff; border:none; padding:7px 18px; border-radius:10px; font-weight:800; font-size:13px; cursor:pointer;">닫기</button>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);

      const modalEl = document.getElementById('modalBusRouteStops');
      if (modalEl) {
        modalEl.addEventListener('click', (e) => {
          if (e.target === modalEl) this.closeBusRouteModal();
        });
      }
    }

    openBusRouteModal(routeNo) {
      const cleanNo = String(routeNo || '').replace(/번$|버스$/, '').trim();
      const route = POPULAR_BUS_ROUTES.find(r => r.routeNo === cleanNo || r.routeNo === routeNo);
      if (!route) {
        this.searchByNameAndShowResults(routeNo);
        return;
      }

      this.ensureBusRouteModal();
      const modal = document.getElementById('modalBusRouteStops');
      if (!modal) return;

      const headerTitle = document.getElementById('modalBusRouteTitle');
      const headerSummary = document.getElementById('modalBusRouteSummary');
      const stopsContainer = document.getElementById('modalBusRouteStopsList');

      if (headerTitle) {
        headerTitle.innerHTML = `<span class="modal-bus-route-badge ${route.badgeClass}">${route.routeNo}번</span> ${route.routeType} 전체 정류장`;
      }
      if (headerSummary) {
        headerSummary.textContent = `${route.summary} (총 ${route.stops.length}개 정류소)`;
      }

      if (stopsContainer) {
        const stopsHtml = route.stops.map((stop, idx) => {
          const isDangsan = String(stop.arsId).includes('19176');
          const isGuchung = String(stop.arsId).includes('19729');
          const isHighlight = isDangsan || isGuchung;
          return `
            <div class="route-stop-timeline-item ${isHighlight ? 'stop-highlight' : ''}" 
                 onclick="window.transitLookupInstance.selectStopFromModal('${stop.arsId}', '${this.escapeHtml(stop.stNm)}')">
              <div class="stop-node-wrap">
                <span class="stop-node-seq">${idx + 1}</span>
              </div>
              <div class="stop-info-body">
                <div class="stop-name-row">
                  <strong class="stop-name">${this.escapeHtml(stop.stNm)}</strong>
                  <span class="stop-ars-pill">ARS ${stop.arsId}</span>
                </div>
                <div class="stop-dir-row">
                  <span class="stop-dir-tag">${this.escapeHtml(stop.dir || '운행 방면')}</span>
                  <span class="stop-action-btn">도착정보 보기 ➔</span>
                </div>
              </div>
            </div>
          `;
        }).join('');

        stopsContainer.innerHTML = stopsHtml;
      }

      modal.style.display = 'flex';
      modal.classList.add('active');

      // 모바일/브라우저 뒤로가기 버튼 히스토리 연동
      if (!this._isClosingModalFromPopstate) {
        window.history.pushState({ modalOpen: true, modalId: 'modalBusRouteStops' }, '');
      }
    }

    closeBusRouteModal() {
      const modal = document.getElementById('modalBusRouteStops');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
      }
      if (!this._isClosingModalFromPopstate && window.history.state && window.history.state.modalOpen) {
        this._isClosingModalFromPopstate = true;
        window.history.back();
        setTimeout(() => {
          this._isClosingModalFromPopstate = false;
        }, 150);
      }
    }

    selectStopFromModal(arsId, stNm) {
      this.closeBusRouteModal();
      this.userInitiatedScroll = true;
      setTimeout(() => {
        this.lookupBusByArs(arsId, stNm);
        this.scrollToResult();
      }, 50);
    }

    toggleDangsanRoutes() {
      this.showAllDangsanRoutes = !this.showAllDangsanRoutes;
      if (this.lastBusData && this.currentId) {
        this.renderBusBoard(this.currentId, this.currentName, this.lastBusData);
      }
    }

    executeSearch() {
      const val = this.inputQuery.value.trim();
      if (!val) {
        this.inputQuery.focus();
        return;
      }

      this.userInitiatedScroll = true; // 사용자 직접 검색 시 스크롤 허용!
      this.hideSuggestions();

      // 1. 숫자 5자리인 경우 -> 버스 ARS 즉시 조회
      const cleanDigits = val.replace(/[^0-9]/g, '');
      if (cleanDigits.length === 5) {
        this.lookupBusByArs(cleanDigits);
        this.scrollToResult();
        return;
      }

      // 1-1. 버스 번호 검색인 경우 (예: "603", "6620", "6637", "양천01", "603번" 등) -> 팝업 모달로 전 정류장 스크롤 노출!
      const normalizedRouteNo = val.replace(/번$|버스$/, '').trim();
      const matchedRoute = POPULAR_BUS_ROUTES.find(r => r.routeNo === val || r.routeNo === normalizedRouteNo);
      if (matchedRoute) {
        this.openBusRouteModal(matchedRoute.routeNo);
        return;
      }

      // 2. 지하철역 단독 정확 매칭 검사
      const cleanSubwayName = val.replace(/역$/, '').trim();
      const exactSubway = SUBWAY_STATIONS.find(s => s.name === cleanSubwayName || s.name === val);
      if (exactSubway && (val.endsWith('역') || val === exactSubway.name)) {
        this.lookupSubway(exactSubway.name);
        this.scrollToResult();
        return;
      }

      // 3. 문자열 키워드 검색 ("선유", "당산", "목동" 등 다중 매칭 지원)
      this.searchByNameAndShowResults(val);
    }

    async searchByNameAndShowResults(query) {
      this.showLoading(`'${query}' 관련 지하철역, 버스노선 및 정류소 검색 중...`);
      this.scrollToResult();

      try {
        const cleanQuery = query.trim();
        const cleanSubway = cleanQuery.replace(/역$/, '').trim();

        // 1. 버스 노선 번호 매칭 (예: 603, 6620, 6637, 양천01 등)
        const matchedRoutes = POPULAR_BUS_ROUTES.filter(r => 
          r.routeNo === cleanQuery || cleanQuery.includes(r.routeNo) || r.routeNo.includes(cleanQuery)
        );

        // 2. 지하철역 매칭
        const subwayMatches = SUBWAY_STATIONS.filter(s => 
          s.name.includes(cleanSubway) || cleanSubway.includes(s.name)
        );

        // 3. 내장 인기 정류소 DB 매칭 (오프라인 100% 보장: 선유, 당산, 목동 등)
        const localMatches = LOCAL_POPULAR_STATIONS.filter(p => 
          p.keywords.some(k => k.includes(cleanQuery) || cleanQuery.includes(k)) ||
          p.stNm.includes(cleanQuery) || p.arsId.includes(cleanQuery)
        );

        // 4. 버스 노선 매칭이 있는 경우 해당 노선의 경유 정류소도 목록에 보강
        const routeStops = [];
        matchedRoutes.forEach(r => {
          r.stops.forEach(s => {
            if (!routeStops.some(rs => rs.arsId === s.arsId) && !localMatches.some(lm => lm.arsId === s.arsId)) {
              routeStops.push({ arsId: s.arsId, stNm: s.stNm, routeBadge: `${r.routeNo}번 경유` });
            }
          });
        });

        // 5. 공공 TOPIS API 정류소 검색 (실시간 온라인 보완)
        let onlineBusMatches = [];
        try {
          const fetched = await this.fetchStationsByName(cleanQuery);
          if (Array.isArray(fetched)) {
            onlineBusMatches = fetched.filter(b => b.arsId && b.arsId !== '0');
          }
        } catch (e) {}

        // 중복 제거 및 병합 (로컬 DB + 노선 경유 정류소 우선)
        const mergedBusList = [...localMatches, ...routeStops];
        onlineBusMatches.forEach(ob => {
          if (!mergedBusList.some(m => m.arsId === ob.arsId)) {
            mergedBusList.push({ arsId: ob.arsId, stNm: ob.stNm });
          }
        });

        const totalResultsCount = matchedRoutes.length + subwayMatches.length + mergedBusList.length;

        if (totalResultsCount === 0) {
          this.showError(`'${query}'에 해당하는 버스 노선, 지하철역, 정류소를 찾을 수 없습니다. 버스 번호(예: 603, 6620)나 정류장 5자리 번호를 확인해 주세요.`);
          return;
        }

        // 단 1개 정류소만 정확 매칭된 경우 즉시 진입
        if (subwayMatches.length === 1 && mergedBusList.length === 0 && matchedRoutes.length === 0) {
          await this.lookupSubway(subwayMatches[0].name);
          this.scrollToResult();
          return;
        }
        if (subwayMatches.length === 0 && mergedBusList.length === 1 && matchedRoutes.length === 0) {
          const single = mergedBusList[0];
          await this.lookupBusByArs(single.arsId, single.stNm);
          this.scrollToResult();
          return;
        }

        // 결과 목록 카드 렌더링
        this.renderSearchResultsList(query, subwayMatches, mergedBusList, matchedRoutes);
        this.scrollToResult();
      } catch (err) {
        this.showError('검색 중 오류가 발생했습니다: ' + err.message);
      }
    }

    // ==========================================
    // 검색 결과 목록 카드 렌더링 (다중 검색 시)
    // ==========================================
    renderSearchResultsList(query, subways, busStations, matchedRoutes = []) {
      if (!this.resultContainer) return;

      const totalCount = (matchedRoutes ? matchedRoutes.length : 0) + subways.length + busStations.length;

      let html = `
        <div class="lookup-board-wrap">
          <div class="lookup-board-header search-results-header">
            <div class="station-meta-info">
              <div class="station-name-row">
                <span class="station-icon">🔍</span>
                <h4 class="station-title">'${this.escapeHtml(query)}' 검색 결과</h4>
                <span class="station-ars-badge station-ars-badge-blue">${totalCount}곳 발견</span>
              </div>
              <p class="search-result-desc">확인하고 싶은 버스 노선, 정류소 또는 지하철역을 누르면 실시간 전광판이 열립니다.</p>
            </div>
          </div>
          <div class="search-results-grid">
      `;

      // 1. 버스 노선 검색 결과 (사용자 요청: 버스 번호 검색)
      if (matchedRoutes && matchedRoutes.length > 0) {
        matchedRoutes.forEach(r => {
          html += `
            <div class="search-item-card card-route-highlight" style="cursor:pointer;" onclick="window.transitLookupInstance.openBusRouteModal('${r.routeNo}')">
              <div class="card-left">
                <span class="card-type-badge ${r.badgeClass}">🚍 ${r.routeNo}번</span>
                <div class="card-title-group">
                  <span class="card-title"><strong>${r.routeNo}번 ${r.routeType}</strong></span>
                  <span class="badge-sub-highlight">${r.summary}</span>
                </div>
              </div>
              <div class="card-right">
                <button type="button" class="btn-primary" style="background:#0284c7; color:#fff; border:none; padding:4px 10px; border-radius:6px; font-size:11px; font-weight:800; pointer-events:none;">정류장 전체보기 ➔</button>
              </div>
            </div>
          `;
          if (r.stops && r.stops.length > 0) {
            r.stops.forEach(st => {
              const formattedArs = this.formatArsId(st.arsId);
              html += `
                <button type="button" class="search-item-card card-bus-type" data-type="bus" data-ars="${st.arsId}" data-name="${this.escapeHtml(st.stNm)}">
                  <div class="card-left">
                    <span class="card-type-badge badge-bus">🚏 ${r.routeNo} 정류소</span>
                    <div class="card-title-group">
                      <span class="card-title">${this.escapeHtml(st.stNm)}</span>
                      <span class="card-ars-label">ARS ${formattedArs} · ${st.dir}</span>
                    </div>
                  </div>
                  <div class="card-right">
                    <span class="station-ars-badge station-ars-badge-blue">${st.arsId}</span>
                    <span class="card-arrow">›</span>
                  </div>
                </button>
              `;
            });
          }
        });
      }

      // 2. 지하철역 결과
      if (subways.length > 0) {
        subways.forEach(s => {
          const lineBadges = s.lines.map(line => `<span class="badge-subway-line badge-${this.getSubwayLineClass(line)}">${line}</span>`).join(' ');
          const isSeonyu = (s.name === '선유도');
          html += `
            <button type="button" class="search-item-card card-subway-type" data-type="subway" data-name="${s.name}">
              <div class="card-left">
                <span class="card-type-badge badge-subway">🚇 지하철</span>
                <div class="card-title-group">
                  <span class="card-title"><strong>${s.name}역</strong></span>
                  ${isSeonyu ? `<span class="badge-sub-highlight">당산방면 시간표 직결</span>` : ''}
                </div>
              </div>
              <div class="card-right">
                ${lineBadges}
                <span class="card-arrow">›</span>
              </div>
            </button>
          `;
        });
      }

      // 3. 버스 정류소 결과
      if (busStations.length > 0) {
        busStations.forEach(b => {
          const formattedArs = this.formatArsId(b.arsId);
          html += `
            <button type="button" class="search-item-card card-bus-type" data-type="bus" data-ars="${b.arsId}" data-name="${this.escapeHtml(b.stNm)}">
              <div class="card-left">
                <span class="card-type-badge badge-bus">🚏 정류소</span>
                <div class="card-title-group">
                  <span class="card-title">${this.escapeHtml(b.stNm)}</span>
                  <span class="card-ars-label">ARS ${formattedArs}</span>
                </div>
              </div>
              <div class="card-right">
                <span class="station-ars-badge station-ars-badge-blue">${b.arsId}</span>
                <span class="card-arrow">›</span>
              </div>
            </button>
          `;
        });
      }

      html += `
          </div>
        </div>
      `;

      this.resultContainer.innerHTML = html;

      // 카드 클릭 이벤트 바인딩
      this.resultContainer.querySelectorAll('.search-item-card').forEach(card => {
        card.addEventListener('click', () => {
          this.userInitiatedScroll = true; // 사용자 직접 선택 시 스크롤 허용!
          const type = card.getAttribute('data-type');
          if (type === 'subway') {
            const name = card.getAttribute('data-name');
            this.inputQuery.value = name + '역';
            this.lookupSubway(name);
          } else if (type === 'bus') {
            const ars = card.getAttribute('data-ars');
            const name = card.getAttribute('data-name');
            this.inputQuery.value = ars;
            this.lookupBusByArs(ars, name);
          }
          this.scrollToResult();
        });
      });
    }

    // ==========================================
    // 실시간 자동완성 (추천 목록) 드롭다운
    // ==========================================
    async handleAutocomplete(query) {
      if (!this.dropdown) return;
      const cleanQuery = query.trim();
      const cleanSubway = cleanQuery.replace(/역$/, '').trim();

      // 1. 버스 노선 추천 (사용자 요청: 버스 번호로도 검색)
      const matchedRoutes = POPULAR_BUS_ROUTES.filter(r => 
        r.routeNo === cleanQuery || cleanQuery.includes(r.routeNo) || r.routeNo.includes(cleanQuery)
      );

      // 2. 지하철역 추천 필터링 (최대 4개)
      const subways = SUBWAY_STATIONS.filter(s => 
        s.name.includes(cleanSubway) || cleanSubway.includes(s.name)
      ).slice(0, 4);

      // 3. 내장 핵심 정류소 DB에서 키워드 매칭 (선유, 당산, 목동, 양정, 경인 등 즉시 반응)
      const localMatches = LOCAL_POPULAR_STATIONS.filter(p => 
        p.keywords.some(k => k.includes(cleanQuery) || cleanQuery.includes(k)) ||
        p.stNm.includes(cleanQuery) || p.arsId.includes(cleanQuery)
      );

      // 4. 온라인 버스 정류소 실시간 API 검색 (비동기)
      let onlineBusStations = [];
      try {
        const fetched = await this.fetchStationsByName(cleanQuery);
        if (Array.isArray(fetched)) {
          onlineBusStations = fetched.filter(b => b.arsId && b.arsId !== '0');
        }
      } catch (e) {}

      // 로컬 DB와 온라인 검색 병합 (로컬 DB 우선 순위)
      const mergedBuses = [...localMatches];
      onlineBusStations.forEach(ob => {
        if (!mergedBuses.some(m => m.arsId === ob.arsId)) {
          mergedBuses.push({ arsId: ob.arsId, stNm: ob.stNm });
        }
      });

      const displayBuses = mergedBuses.slice(0, 8);

      if (matchedRoutes.length === 0 && subways.length === 0 && displayBuses.length === 0) {
        this.hideSuggestions();
        return;
      }

      let html = '';

      // 버스 노선 섹션
      if (matchedRoutes.length > 0) {
        html += `<div class="suggestion-group-title">🚍 버스 노선 (${matchedRoutes.length})</div>`;
        matchedRoutes.forEach(r => {
          html += `
            <div class="suggestion-item suggestion-route" data-type="route" data-route="${r.routeNo}">
              <div class="sugg-left">
                <span class="sugg-icon">🚍</span>
                <div class="sugg-subway-info">
                  <span class="sugg-name"><strong>${r.routeNo}번 버스</strong></span>
                  <span class="sugg-tag-highlight">${r.summary}</span>
                </div>
              </div>
              <div class="sugg-right">
                <span class="bus-badge ${r.badgeClass}">${r.routeType}</span>
              </div>
            </div>
          `;
        });
      }

      // 지하철역 섹션
      if (subways.length > 0) {
        html += `<div class="suggestion-group-title">🚇 지하철역 (${subways.length})</div>`;
        subways.forEach(s => {
          const lineBadges = s.lines.map(line => `<span class="badge-subway-line badge-${this.getSubwayLineClass(line)}">${line}</span>`).join(' ');
          const isSeonyu = (s.name === '선유도');
          html += `
            <div class="suggestion-item suggestion-subway" data-type="subway" data-name="${s.name}">
              <div class="sugg-left">
                <span class="sugg-icon">🚇</span>
                <div class="sugg-subway-info">
                  <span class="sugg-name"><strong>${s.name}역</strong></span>
                  ${isSeonyu ? `<span class="sugg-tag-highlight">당산방면 시간표 직결</span>` : ''}
                </div>
              </div>
              <div class="sugg-right">${lineBadges}</div>
            </div>
          `;
        });
      }

      // 버스 정류소 섹션
      if (displayBuses.length > 0) {
        html += `<div class="suggestion-group-title">🚏 버스 정류소 (${displayBuses.length})</div>`;
        displayBuses.forEach(b => {
          const formattedArs = this.formatArsId(b.arsId);
          html += `
            <div class="suggestion-item suggestion-bus" data-type="bus" data-ars="${b.arsId}" data-name="${this.escapeHtml(b.stNm)}">
              <div class="sugg-left">
                <span class="sugg-icon">🚏</span>
                <div class="sugg-bus-info">
                  <span class="sugg-name">${this.escapeHtml(b.stNm)}</span>
                  <span class="sugg-ars">ARS ${formattedArs}</span>
                </div>
              </div>
              <div class="sugg-right">
                <span class="sugg-badge-ars">${b.arsId}</span>
              </div>
            </div>
          `;
        });
      }

      this.dropdown.innerHTML = html;
      this.dropdown.style.display = 'block';

      // 드롭다운 클릭 이벤트 바인딩
      this.dropdown.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
          this.userInitiatedScroll = true; // 사용자 직접 선택 시 스크롤 허용!
          const type = item.getAttribute('data-type');
          if (type === 'route') {
            const routeNo = item.getAttribute('data-route');
            this.inputQuery.value = routeNo;
            this.hideSuggestions();
            this.openBusRouteModal(routeNo);
            return;
          } else if (type === 'subway') {
            const name = item.getAttribute('data-name');
            this.inputQuery.value = name + '역';
            this.hideSuggestions();
            this.lookupSubway(name);
          } else if (type === 'bus') {
            const ars = item.getAttribute('data-ars');
            const name = item.getAttribute('data-name');
            this.inputQuery.value = ars;
            this.hideSuggestions();
            this.lookupBusByArs(ars, name);
          }
          this.scrollToResult();
        });
      });
    }

    hideSuggestions() {
      if (this.dropdown) {
        this.dropdown.style.display = 'none';
        this.dropdown.innerHTML = '';
      }
    }

    // ==========================================
    // 버스 실시간 도착정보 조회 (ARS 5자리)
    // ==========================================
    async lookupBusByArs(arsId, customName = '') {
      const cleanArs = String(arsId).replace(/[^0-9]/g, '');
      if (cleanArs.length !== 5) {
        this.showError('올바른 5자리 정류장 번호를 입력해 주세요 (예: 15154)');
        return;
      }

      this.currentType = 'bus';
      this.currentId = cleanArs;
      this.refreshCountdown = this.autoRefreshInterval;
      this.showLoading(`🚏 ARS [${cleanArs}] 실시간 버스 도착정보 수신 중...`);

      try {
        const busItems = await this.fetchBusArrivalByUid(cleanArs);
        this.lastBusData = busItems;

        if (!busItems || busItems.length === 0) {
          this.showEmptyBus(cleanArs, customName);
          return;
        }

        const matchedLocal = LOCAL_POPULAR_STATIONS.find(s => s.arsId === cleanArs);
        const resolvedName = customName || (busItems[0] && busItems[0].stNm) || (matchedLocal && matchedLocal.stNm) || `정류소 (${this.formatArsId(cleanArs)})`;
        this.currentName = resolvedName;

        // 최근 기록 저장
        this.saveRecentHistory('bus', cleanArs, resolvedName);
        this.renderQuickChips();

        // 버스 전광판 렌더링
        this.renderBusBoard(cleanArs, resolvedName, busItems);
        this.startTicker();
      } catch (err) {
        this.showError(`버스 도착 정보를 불러오지 못했습니다: ${err.message}`);
      }
    }

    // ==========================================
    // 지하철 실시간 도착정보 조회 (역 이름)
    // ==========================================
    async lookupSubway(stationName) {
      const cleanName = stationName.replace(/역$/, '').trim();
      if (!cleanName) return;

      this.currentType = 'subway';
      this.currentId = cleanName;
      this.currentName = cleanName + '역';
      this.refreshCountdown = this.autoRefreshInterval;

      // 9호선 선유도역의 경우 당산방면 공식 시간표를 0초 딜레이로 즉시 먼저 표출!
      if (cleanName === '선유도') {
        this.saveRecentHistory('subway', cleanName, '선유도역');
        this.renderQuickChips();
        this.renderSubwayBoard(cleanName, this.lastSubwayData || []);
        this.startTicker();
      } else {
        this.showLoading(`🚇 [${cleanName}역] 실시간 열차 운행정보 수신 중...`);
      }

      try {
        const arrivals = await this.fetchSubwayRealtime(cleanName);
        this.lastSubwayData = arrivals;

        if (!arrivals || arrivals.length === 0) {
          if (cleanName !== '선유도') {
            this.showEmptySubway(cleanName);
            return;
          }
        }

        // 최근 기록 저장
        this.saveRecentHistory('subway', cleanName, cleanName + '역');
        this.renderQuickChips();

        // 지하철 전광판 렌더링
        this.renderSubwayBoard(cleanName, arrivals || []);
        this.startTicker();
      } catch (err) {
        if (cleanName === '선유도') {
          // 선유도역은 API 지연/실패 시에도 공식 시간표로 정상 운행 정보 지속 제공
          this.renderSubwayBoard(cleanName, this.lastSubwayData || []);
          this.startTicker();
        } else {
          this.showError(`지하철 도착 정보를 불러오지 못했습니다: ${err.message}`);
        }
      }
    }

    isWeekendOrHoliday(date = new Date()) {
      if (typeof window !== 'undefined' && window.transitManager && typeof window.transitManager.isWeekendOrHoliday === 'function') {
        return window.transitManager.isWeekendOrHoliday(date);
      }
      const day = date.getDay();
      if (day === 0 || day === 6) return true;
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const md = `${m}-${d}`;
      const fixed = ['01-01','03-01','05-05','06-06','08-15','10-03','10-09','12-25'];
      return fixed.includes(md);
    }

    getSeonyudoUpcomingTrains(now = new Date(), count = 4) {
      const isHoliday = this.isWeekendOrHoliday(now);
      const schedule = isHoliday ? SEONYUDO_WEEKEND_TIMETABLE : SEONYUDO_WEEKDAY_TIMETABLE;
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
            let dest = '중앙보훈병원';
            if (h === 24 && !isHoliday) {
              if (m === 18) dest = '삼전(종착)';
              else if (m === 30) dest = '신논현(종착)';
              else if (m === 43) dest = '동작(종착)';
              else if (m === 56) dest = '당산(종착) 막차';
            } else if (h === 23 && isHoliday) {
              if (m === 27) dest = '신논현(종착)';
              else if (m === 41) dest = '동작(종착)';
              else if (m === 55) dest = '당산(종착) 막차';
            }

            const displayH = (h === 24) ? '00' : String(h).padStart(2, '0');
            const displayM = String(m).padStart(2, '0');

            results.push({
              departureTime: `${displayH}:${displayM}`,
              endStationName: dest,
              sec: Math.max(0, diffSec),
              remainMinutes: Math.floor(Math.max(0, diffSec) / 60),
              remainSeconds: Math.max(0, diffSec) % 60,
              targetTime: nowMs + Math.max(0, diffSec) * 1000
            });
            if (results.length >= count) break;
          }
        }
        if (results.length >= count) break;
      }

      // 심야 첫차 처리 (새벽 1시~4시)
      if (results.length === 0 && (rawH >= 1 && rawH < 5)) {
        const firstH = hours[0];
        const firstM = schedule[firstH][0];
        const displayH = String(firstH).padStart(2, '0');
        const displayM = String(firstM).padStart(2, '0');
        const firstTrainMin = firstH * 60 + firstM;
        const diffSec = (firstTrainMin - (rawH * 60 + now.getMinutes())) * 60 - currentSec;
        results.push({
          departureTime: `${displayH}:${displayM}`,
          endStationName: '중앙보훈병원',
          sec: Math.max(0, diffSec),
          remainMinutes: Math.floor(Math.max(0, diffSec) / 60),
          remainSeconds: Math.max(0, diffSec) % 60,
          targetTime: nowMs + Math.max(0, diffSec) * 1000,
          isFirstTrain: true
        });
      }

      return results;
    }

    // ==========================================
    // 실시간 갱신 & 티커
    // ==========================================
    refreshCurrent() {
      this.userInitiatedScroll = false; // 자동 갱신 시에는 화면 스크롤 금지
      if (this.btnRefresh) this.btnRefresh.classList.add('spinning');
      const finish = () => {
        if (this.btnRefresh) {
          setTimeout(() => this.btnRefresh.classList.remove('spinning'), 500);
        }
      };

      if (this.currentType === 'bus' && this.currentId) {
        this.lookupBusByArs(this.currentId, this.currentName).finally(finish);
      } else if (this.currentType === 'subway' && this.currentId) {
        this.lookupSubway(this.currentId).finally(finish);
      } else {
        finish();
      }
    }

    startTicker() {
      if (this.tickerTimer) clearInterval(this.tickerTimer);
      this.tickerTimer = setInterval(() => {
        this.tickCountdowns();
      }, 1000);
    }

    stopTicker() {
      if (this.tickerTimer) {
        clearInterval(this.tickerTimer);
        this.tickerTimer = null;
      }
    }

    tickCountdowns() {
      const now = Date.now();

      // 초 단위 실시간 카운트다운 엘리먼트들 갱신
      const liveEls = document.querySelectorAll('#lookupResultContainer .live-bus-sec');
      liveEls.forEach(el => {
        const targetTime = parseInt(el.getAttribute('data-target-time'), 10);
        if (!targetTime || isNaN(targetTime)) return;

        const remainSec = Math.max(0, Math.floor((targetTime - now) / 1000));
        const walkSec = 300;
        const catchClass = (remainSec >= walkSec) ? 'transit-catchable' : 'transit-uncatchable';
        if (remainSec <= 0) {
          el.innerHTML = `<span class="tag-arrive-now transit-uncatchable">⚡ 곧 도착</span>`;
        } else if (remainSec < 60) {
          el.innerHTML = `<span class="tag-arrive-imminent ${catchClass}">${remainSec}초 후</span>`;
        } else {
          const m = Math.floor(remainSec / 60);
          const s = remainSec % 60;
          const sStr = s < 10 ? '0' + s : s;
          el.innerHTML = `<span class="${catchClass}"><span class="transit-time-min">${m}분</span> <span class="transit-time-sec">${sStr}초 후</span></span>`;
        }
      });

      // 자동 새로고침 카운트다운
      if (this.refreshCountdown > 0) {
        this.refreshCountdown--;
      }

      const countdownEl = document.getElementById('lookupAutoRefreshCountdown');
      if (countdownEl) {
        countdownEl.textContent = `${this.refreshCountdown}초`;
      }

      if (this.refreshCountdown <= 0) {
        this.refreshCountdown = this.autoRefreshInterval;
        if (!document.hidden && !this.isFetching) {
          this.silentRefresh();
        }
      }
    }

    async silentRefresh() {
      if (this.isFetching) return;
      this.isFetching = true;
      try {
        if (this.currentType === 'bus' && this.currentId) {
          const items = await this.fetchBusArrivalByUid(this.currentId);
          if (items && items.length > 0) {
            this.lastBusData = items;
            this.renderBusBoard(this.currentId, this.currentName, items, true);
          }
        } else if (this.currentType === 'subway' && this.currentId) {
          const arrivals = await this.fetchSubwayRealtime(this.currentId);
          if (arrivals && arrivals.length > 0) {
            this.lastSubwayData = arrivals;
            this.renderSubwayBoard(this.currentId, arrivals, true);
          }
        }
      } catch (e) {
        // 조용히 대기
      } finally {
        this.isFetching = false;
      }
    }

    // ==========================================
    // 렌더링: 버스 도착 전광판
    // ==========================================
    renderBusBoard(arsId, stationName, busList, isSilent = false) {
      if (!this.resultContainer) return;

      const formattedArs = this.formatArsId(arsId);
      const currentTimeStr = new Date().toLocaleTimeString('ko-KR', { hour12: false });
      const nowMs = Date.now();

      // 필터링 적용
      let filtered = [...busList];
      // 19729 영등포구청 정류소: 6637 버스만 단독 노출 (사용자 요청)
      if (String(arsId).includes('19729')) {
        filtered = filtered.filter(b => b.rtNm === '6637');
      } else {
        if (this.filterType === 'town') {
          filtered = filtered.filter(b => b.routeType === '마을' || (b.rtNm && b.rtNm.includes('마을')) || (b.rtNm && b.rtNm.startsWith('양천')));
        } else if (this.filterType === 'blue') {
          filtered = filtered.filter(b => b.routeType === '간선' || (b.routeType && b.routeType.includes('간선')));
        } else if (this.filterType === 'green') {
          filtered = filtered.filter(b => b.routeType === '지선' || (b.routeType && b.routeType.includes('지선')));
        } else if (this.filterType === 'red') {
          filtered = filtered.filter(b => b.routeType === '광역' || b.routeType === '직행' || (b.routeType && b.routeType.includes('광역')));
        }
      }

      // 정렬 및 필터 적용: 당산역(19176) 정류소 조회 시 기본 603, 6620 2개만 표출 (사용자 요청)
      const isDangsanTarget = (String(arsId).includes('19176') || String(stationName).includes('당산'));
      let dangsanHiddenCount = 0;
      if (isDangsanTarget) {
        if (!this.showAllDangsanRoutes) {
          const onlyPriority = filtered.filter(b => b.rtNm === '603' || b.rtNm === '6620');
          dangsanHiddenCount = filtered.length - onlyPriority.length;
          filtered = onlyPriority;
        }
      }

      const getDangsanPriorityRank = (rtNm) => {
        const clean = String(rtNm || '').trim();
        if (clean === '603') return 1;
        if (clean === '6620') return 2;
        return 999;
      };

      if (this.sortType === 'arrival') {
        filtered.sort((a, b) => {
          if (isDangsanTarget) {
            const pA = getDangsanPriorityRank(a.rtNm);
            const pB = getDangsanPriorityRank(b.rtNm);
            if (pA !== pB) return pA - pB;
          }
          const tA = parseInt(a.traTime1, 10) || 999999;
          const tB = parseInt(b.traTime1, 10) || 999999;
          return tA - tB;
        });
      } else {
        filtered.sort((a, b) => {
          if (isDangsanTarget) {
            const pA = getDangsanPriorityRank(a.rtNm);
            const pB = getDangsanPriorityRank(b.rtNm);
            if (pA !== pB) return pA - pB;
          }
          return (a.rtNm || '').localeCompare(b.rtNm || '', undefined, { numeric: true });
        });
      }

      // 버스 카드 목록 생성
      let cardsHtml = '';
      if (filtered.length === 0) {
        cardsHtml = `
          <div class="lookup-no-results">
            <span>선택한 필터에 해당하는 운행 버스가 없습니다.</span>
          </div>
        `;
      } else {
        cardsHtml = filtered.map(bus => {
          const badgeClass = this.getBusBadgeClass(bus.routeType, bus.rtNm);
          const routeTypeMap = { '1': '공항버스', '2': '마을버스', '3': '간선버스', '4': '지선버스', '5': '순환버스', '6': '광역버스' };
          let typeName = routeTypeMap[bus.routeType] || bus.routeType;
          if (!typeName || /^\d+$/.test(String(typeName).trim())) {
            typeName = this.guessRouteType(bus.rtNm);
          }
          const nextStop = bus.nxtStn ? `${bus.nxtStn} 방면` : '운행 노선';

          // 첫 번째 버스 도착정보
          const tra1 = parseInt(bus.traTime1, 10);
          const targetTime1 = (!isNaN(tra1) && tra1 > 0) ? (nowMs + tra1 * 1000) : null;
          const busMsg1 = bus.arrmsg1 || '운행 정보 없음';
          const plate1 = this.formatPlateHighlight(bus.plainNo1);
          const isTerm1 = busMsg1.includes('종료') || busMsg1.includes('대기') || busMsg1.includes('출발');

          // 두 번째 버스 도착정보
          const tra2 = parseInt(bus.traTime2, 10);
          const targetTime2 = (!isNaN(tra2) && tra2 > 0) ? (nowMs + tra2 * 1000) : null;
          const busMsg2 = bus.arrmsg2 || '도착 예정 없음';
          const plate2 = this.formatPlateHighlight(bus.plainNo2);

          const busZoomKey = 'lookup_bus_' + bus.rtNm;
          const savedBoost = (typeof window !== 'undefined' && window.transitManager)
            ? window.transitManager.getFontBoostForKey(busZoomKey)
            : parseInt(localStorage.getItem('transit_time_boost_' + busZoomKey) || '0', 10);
          const styleBoost = (savedBoost > 0) ? `--time-font-boost:${savedBoost}px;` : '';

          return `
            <div class="lookup-bus-card" data-zoom-key="${busZoomKey}" data-zoom-name="${bus.rtNm}번" style="${styleBoost}">
              <!-- 상단 헤더: 노선 번호 + 노선 유형 + 도착시간 줌 컨트롤 (+ / ↺) -->
              <div class="bus-card-top-header">
                <div class="bus-route-main-info">
                  <span class="bus-badge ${badgeClass}">${bus.rtNm}</span>
                  <span class="bus-type-tag">${typeName}</span>
                </div>
                <div class="bus-time-zoom-ctrl">
                  <button type="button" class="btn-time-zoom-btn btn-time-zoom-plus" onclick="window.transitManager && window.transitManager.increaseTimeFontSize(event, '${busZoomKey}')" title="${bus.rtNm}번 도착시간 글씨 확대" aria-label="${bus.rtNm}번 도착시간 글씨 확대">
                    <span class="zoom-btn-icon">＋</span>
                  </button>
                  <button type="button" class="btn-time-zoom-btn btn-time-zoom-reset" onclick="window.transitManager && window.transitManager.resetTimeFontSize(event, '${busZoomKey}')" title="${bus.rtNm}번 도착시간 글씨 원래대로 복귀" aria-label="${bus.rtNm}번 도착시간 글씨 원래대로 복귀">
                    <span class="zoom-btn-icon">↺</span>
                  </button>
                </div>
              </div>

              <!-- 하단 도착 정보: 다음 버스 & 다다음 버스 와이드 블록 -->
              <div class="bus-card-arrival-list">
                <!-- 다음 버스 -->
                <div class="bus-arrival-block first-bus-block">
                  <div class="arr-main-info">
                    <span class="arr-badge arr-first">다음</span>
                    ${targetTime1 ? `
                      <span class="live-bus-sec" data-target-time="${targetTime1}">
                        ${this.formatSecondsHtml(tra1)}
                      </span>
                    ` : `
                      <span class="arr-text-raw ${isTerm1 ? 'arr-status-ended' : ''}">${this.cleanArrivalMsg(busMsg1)}</span>
                    `}
                  </div>
                  <div class="arr-sub-info">
                    <div class="arr-sub-left">
                      ${plate1 ? `<span class="arr-plate-no ${badgeClass === 'badge-green' ? 'arr-plate-green' : ''}">${plate1}</span>` : ''}
                      <span class="arr-stops-cnt">${this.extractStationCount(busMsg1) || '정류소 진입/운행중'}</span>
                      ${bus.reride_Num1 === '1' || bus.busType1 === '1' ? `<span class="badge-low-bus">저상</span>` : ''}
                    </div>
                    ${targetTime1 ? `<span class="arr-eta-time">도착 예정: <strong class="eta-clock">${this.formatEtaTime(targetTime1)}</strong></span>` : ''}
                  </div>
                </div>

                <!-- 다다음 버스 -->
                <div class="bus-arrival-block second-bus-block">
                  <div class="arr-main-info">
                    <span class="arr-badge arr-second">다다음</span>
                    ${targetTime2 ? `
                      <span class="live-bus-sec" data-target-time="${targetTime2}">
                        ${this.formatSecondsHtml(tra2)}
                      </span>
                    ` : `
                      <span class="arr-text-raw secondary">${this.cleanArrivalMsg(busMsg2)}</span>
                    `}
                  </div>
                  <div class="arr-sub-info">
                    <div class="arr-sub-left">
                      ${plate2 ? `<span class="arr-plate-no ${badgeClass === 'badge-green' ? 'arr-plate-green' : ''}">${plate2}</span>` : ''}
                      <span class="arr-stops-cnt">${this.extractStationCount(busMsg2) || '차기 순번 운행중'}</span>
                    </div>
                    ${targetTime2 ? `<span class="arr-eta-time">도착 예정: <strong class="eta-clock">${this.formatEtaTime(targetTime2)}</strong></span>` : ''}
                  </div>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }

      const boardHtml = `
        <div class="lookup-board-wrap lookup-selected-station-sector">
          <!-- 특정 정류장 헤더: 정류장 번호와 정류장 이름을 선명하게 노출 -->
          <div class="lookup-bus-station-header">
            <div class="station-meta-left">
              <span class="station-ars-badge">🚏 ${formattedArs}</span>
              <h3 class="station-name-text">${this.escapeHtml(stationName)}</h3>
            </div>
            <div class="station-meta-right">
              ${isDangsanTarget ? `
                <button type="button" id="btnToggleDangsanRoutes" class="btn-dangsan-view-toggle ${this.showAllDangsanRoutes ? 'active' : ''}">
                  ${this.showAllDangsanRoutes ? '603·6620만 보기 ▲' : `전체보기 (+${dangsanHiddenCount}) ▼`}
                </button>
              ` : `
                <span class="station-route-count"><strong>${busList.length}개</strong> 노선</span>
              `}
              <span class="station-auto-ticker">🔄 <strong id="lookupAutoRefreshCountdown">${this.refreshCountdown}초</strong></span>
            </div>
          </div>

          <!-- 버스 번호 및 도착 예정 시각 카드 (동일 섹터 내 통합) -->
          <div class="lookup-cards-container">
            ${cardsHtml}
          </div>
        </div>
      `;

      this.resultContainer.innerHTML = boardHtml;
      if (this.userInitiatedScroll) {
        this.scrollToResult();
        this.userInitiatedScroll = false;
      }

      // 당산역 전체보기 토글 버튼 이벤트 바인딩
      const btnDangsanToggle = document.getElementById('btnToggleDangsanRoutes');
      if (btnDangsanToggle) {
        btnDangsanToggle.addEventListener('click', () => {
          this.toggleDangsanRoutes();
        });
      }

      // 필터 버튼 이벤트 바인딩
      this.resultContainer.querySelectorAll('.btn-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          this.filterType = btn.getAttribute('data-filter');
          this.renderBusBoard(arsId, stationName, busList);
        });
      });

      // 정렬 토글 이벤트 바인딩
      const btnSort = document.getElementById('btnToggleSort');
      if (btnSort) {
        btnSort.addEventListener('click', () => {
          this.sortType = (this.sortType === 'arrival') ? 'number' : 'arrival';
          this.renderBusBoard(arsId, stationName, busList);
        });
      }
    }

    // ==========================================
    // 렌더링: 지하철 실시간 운행 전광판
    // ==========================================
    renderSubwayBoard(stationName, arrivals, isSilent = false) {
      if (!this.resultContainer) return;

      const currentTimeStr = new Date().toLocaleTimeString('ko-KR', { hour12: false });
      const safeArrivals = Array.isArray(arrivals) ? arrivals : [];

      // 상행(내선)과 하행(외선)으로 그룹화
      const upTrains = safeArrivals.filter(a => a.updnLine === '상행' || a.updnLine === '내선');
      const downTrains = safeArrivals.filter(a => a.updnLine === '하행' || a.updnLine === '외선');

      const renderTrainGroup = (title, list, icon) => {
        if (!list || list.length === 0) {
          return `
            <div class="subway-direction-box">
              <div class="subway-dir-header">
                <span class="dir-icon">${icon}</span>
                <span class="dir-title">${title}</span>
              </div>
              <div class="subway-empty-msg">실시간 운행 중인 열차가 없습니다.</div>
            </div>
          `;
        }

        // 실시간 열차 최대 2대 (다음 열차, 다다음 열차)만 간결하게 노출
        const trainsHtml = list.slice(0, 2).map((item, idx) => {
          const isExpress = item.btrainSttus === '급행' || (item.trainLineNm && item.trainLineNm.includes('급행'));
          const isFirst = (idx === 0);
          const arriveMsg = item.arvlMsg2 || item.arvlMsg3 || '도착 대기';
          const lineNm = item.trainLineNm || (item.bstatnNm ? `${item.bstatnNm}행` : '열차');

          return `
            <div class="subway-train-item ${isFirst ? 'is-next-train' : ''}">
              <div class="train-seq-badge ${isFirst ? 'seq-first' : 'seq-second'}">
                ${isFirst ? '다음 열차' : '다다음 열차'}
              </div>
              <div class="train-destination">
                <span class="train-head">${this.escapeHtml(lineNm)}</span>
                ${isExpress ? `<span class="badge-express-train">⚡ 급행</span>` : `<span class="badge-normal-train">일반</span>`}
              </div>
              <div class="train-arrival-status">
                <span class="train-msg ${this.isImminentSubway(arriveMsg) ? 'status-imminent' : ''}">${this.escapeHtml(arriveMsg)}</span>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div class="subway-direction-box">
            <div class="subway-dir-header">
              <span class="dir-icon">${icon}</span>
              <span class="dir-title">${title}</span>
              <span class="dir-count">다음 2대</span>
            </div>
            <div class="subway-train-list">
              ${trainsHtml}
            </div>
          </div>
        `;
      };

      // 🚇 9호선 선유도역 전용: 실시간 열차 최우선 표출 + 다음/다다음 딱 2대만 노출!
      if (stationName === '선유도') {
        const isHoliday = this.isWeekendOrHoliday(new Date());
        const seonyudoSchedule = this.getSeonyudoUpcomingTrains(new Date(), 2);
        const nowMs = Date.now();

        // 상행 열차: 실시간 데이터 우선 매핑 (부족분은 시간표로 보완하여 딱 2대)
        const combinedUpRows = [];

        if (upTrains && upTrains.length > 0) {
          upTrains.slice(0, 2).forEach((tr, idx) => {
            const isFirst = (idx === 0);
            const isExpress = tr.btrainSttus === '급행' || (tr.trainLineNm && tr.trainLineNm.includes('급행'));
            const arriveMsg = tr.arvlMsg2 || tr.arvlMsg3 || '운행중';
            const lineNm = tr.trainLineNm || (tr.bstatnNm ? `${tr.bstatnNm}행` : '중앙보훈병원행');
            const rawSec = parseInt(tr.barvlDt, 10);
            const targetTime = (!isNaN(rawSec) && rawSec > 0) ? (nowMs + rawSec * 1000) : null;

            combinedUpRows.push(`
              <div class="timetable-train-row ${isFirst ? 'is-next-immediate' : ''}">
                <div class="tt-left">
                  <span class="tt-seq-tag ${isFirst ? 'seq-first' : 'seq-second'}">${isFirst ? '다음 열차' : '다다음 열차'}</span>
                  <span class="badge-live-train" style="background:#ef4444; color:#fff; font-size:11px; font-weight:800; padding:2px 6px; border-radius:4px; margin-right:4px;">⚡ 실시간</span>
                  ${isExpress ? `<span class="badge-express-train">⚡ 급행</span>` : `<span class="badge-normal-train">일반</span>`}
                  <span class="tt-dest-text">${this.escapeHtml(lineNm)}</span>
                </div>
                <div class="tt-right">
                  ${targetTime ? `
                    <span class="live-bus-sec" data-target-time="${targetTime}">
                      ${this.formatSecondsHtml(rawSec)}
                    </span>
                  ` : `
                    <span class="train-msg ${this.isImminentSubway(arriveMsg) ? 'status-imminent' : ''}" style="font-weight:800; font-size:15px; color:#0284c7;">
                      ${this.escapeHtml(arriveMsg)}
                    </span>
                  `}
                </div>
              </div>
            `);
          });
        }

        // 실시간 열차가 2대 미만인 경우 시간표 열차로 보완하여 총 2대 구성
        if (combinedUpRows.length < 2 && seonyudoSchedule.length > 0) {
          for (const tr of seonyudoSchedule) {
            if (combinedUpRows.length >= 2) break;
            const isFirst = (combinedUpRows.length === 0);
            combinedUpRows.push(`
              <div class="timetable-train-row ${isFirst ? 'is-next-immediate' : ''}">
                <div class="tt-left">
                  <span class="tt-seq-tag ${isFirst ? 'seq-first' : 'seq-second'}">${isFirst ? '다음 열차' : '다다음 열차'}</span>
                  <span class="tt-dep-time"><strong>${tr.departureTime}</strong></span>
                  <span class="badge-normal-train">일반</span>
                  <span class="tt-dest-text">${this.escapeHtml(tr.endStationName)}행</span>
                </div>
                <div class="tt-right">
                  <span class="live-bus-sec" data-target-time="${tr.targetTime}">
                    ${this.formatSecondsHtml(tr.sec)}
                  </span>
                </div>
              </div>
            `);
          }
        }

        let upcomingHtml = '';
        if (combinedUpRows.length > 0) {
          upcomingHtml = combinedUpRows.join('');
        } else {
          upcomingHtml = `<div class="subway-empty-msg">오늘 운행이 종료되었습니다 (첫차 05:34).</div>`;
        }

        // 전체 시간표 테이블 생성
        const scheduleData = isHoliday ? SEONYUDO_WEEKEND_TIMETABLE : SEONYUDO_WEEKDAY_TIMETABLE;
        const currentHour = new Date().getHours();
        const fullRowsHtml = Object.keys(scheduleData).map(hStr => {
          const h = Number(hStr);
          const isCurH = (h === currentHour || (h === 24 && currentHour === 0));
          const dispH = (h === 24) ? '00' : String(h).padStart(2, '0');
          const minList = scheduleData[h].map(m => String(m).padStart(2, '0')).join(' · ');
          return `
            <div class="full-schedule-row ${isCurH ? 'cur-hour-row' : ''}">
              <span class="f-hour">${dispH}시</span>
              <span class="f-mins">${minList}</span>
            </div>
          `;
        }).join('');

        const subwayZoomKey = 'lookup_subway_seonyudo';
        const savedSubBoost = (typeof window !== 'undefined' && window.transitManager)
          ? window.transitManager.getFontBoostForKey(subwayZoomKey)
          : parseInt(localStorage.getItem('transit_time_boost_' + subwayZoomKey) || '0', 10);
        const subStyleBoost = (savedSubBoost > 0) ? `--time-font-boost:${savedSubBoost}px;` : '';

        const boardHtml = `
          <div class="lookup-board-wrap" data-zoom-key="${subwayZoomKey}" data-zoom-name="선유도역" style="${subStyleBoost}">
            <!-- 선유도역 정보 헤더 -->
            <div class="lookup-board-header subway-theme-header">
              <div class="station-meta-info">
                <div class="station-name-row">
                  <span class="station-icon">🚇</span>
                  <h4 class="station-title">9호선 선유도역</h4>
                  <span class="station-ars-badge" style="background:#c89d5c;">실시간 도착정보 우선</span>
                  <span class="badge-dangsan-target">당산역 방면 1정거장(2분)</span>
                  <div class="bus-time-zoom-ctrl" style="margin-left:auto;">
                    <button type="button" class="btn-time-zoom-btn btn-time-zoom-plus" onclick="window.transitManager && window.transitManager.increaseTimeFontSize(event, '${subwayZoomKey}')" title="선유도역 도착시간 글씨 확대" aria-label="선유도역 도착시간 글씨 확대">
                      <span class="zoom-btn-icon">＋</span>
                    </button>
                    <button type="button" class="btn-time-zoom-btn btn-time-zoom-reset" onclick="window.transitManager && window.transitManager.resetTimeFontSize(event, '${subwayZoomKey}')" title="선유도역 도착시간 글씨 원래대로 복귀" aria-label="선유도역 도착시간 글씨 원래대로 복귀">
                      <span class="zoom-btn-icon">↺</span>
                    </button>
                  </div>
                </div>
                <div class="station-sub-row">
                  <span class="station-route-count">실시간 열차 우선 매핑 (다음 2대 노출)</span>
                  <span class="station-update-time">수신: ${currentTimeStr}</span>
                  <span class="station-auto-ticker">🔄 <strong id="lookupAutoRefreshCountdown">${this.refreshCountdown}초</strong> 갱신</span>
                </div>
              </div>
            </div>

            <!-- 1. 당산방면 일반열차 (실시간 우선 2대 노출) -->
            <div class="seonyudo-timetable-card">
              <div class="timetable-header-row">
                <div class="tt-title-wrap">
                  <span class="tt-icon">🧭</span>
                  <h4 class="tt-title">당산 · 여의도 · 중앙보훈병원 방면 열차 (다음 2대)</h4>
                </div>
                <span class="badge-tt-mode">실시간 우선</span>
              </div>

              <div class="timetable-train-list">
                ${upcomingHtml}
              </div>

              <!-- 오늘 전체 시간표 펼치기 토글 버튼 -->
              <button type="button" class="btn-toggle-timetable" id="btnToggleSeonyudoTimetable">
                📋 당산방면 공식 시간표 전체보기 (${isHoliday ? '주말·공휴일' : '평일'}) <span id="toggleTtArrow">펼치기 ▼</span>
              </button>
              <div class="seonyudo-full-schedule-box" id="seonyudoFullScheduleBox" style="display: none;">
                <div class="full-schedule-header">
                  <span>9호선 선유도역 → 당산·중앙보훈병원 방면 (${isHoliday ? '주말·공휴일' : '평일'})</span>
                </div>
                <div class="full-schedule-list">
                  ${fullRowsHtml}
                </div>
              </div>
            </div>

            <!-- 2. 하행 (신목동 · 개화 방면) 열차 운행 현황 (최대 2대) -->
            <div class="subway-board-grid">
              ${renderTrainGroup('하행 (신목동·가양·개화 방면)', downTrains, '⬇️')}
            </div>
          </div>
        `;

        this.resultContainer.innerHTML = boardHtml;
        if (this.userInitiatedScroll) {
          this.scrollToResult();
          this.userInitiatedScroll = false;
        }

        // 토글 버튼 이벤트 바인딩
        const btnToggle = document.getElementById('btnToggleSeonyudoTimetable');
        const scheduleBox = document.getElementById('seonyudoFullScheduleBox');
        const arrowSpan = document.getElementById('toggleTtArrow');
        if (btnToggle && scheduleBox) {
          btnToggle.addEventListener('click', () => {
            const isHidden = (scheduleBox.style.display === 'none');
            scheduleBox.style.display = isHidden ? 'block' : 'none';
            if (arrowSpan) arrowSpan.textContent = isHidden ? '접기 ▲' : '펼치기 ▼';
          });
        }
        return;
      }

      // 일반 지하철역 전광판 렌더링
      const subwayStationKey = 'lookup_subway_' + stationName;
      const savedStationBoost = (typeof window !== 'undefined' && window.transitManager)
        ? window.transitManager.getFontBoostForKey(subwayStationKey)
        : parseInt(localStorage.getItem('transit_time_boost_' + subwayStationKey) || '0', 10);
      const stationStyleBoost = (savedStationBoost > 0) ? `--time-font-boost:${savedStationBoost}px;` : '';

      const boardHtml = `
        <div class="lookup-board-wrap" data-zoom-key="${subwayStationKey}" data-zoom-name="${this.escapeHtml(stationName)}역" style="${stationStyleBoost}">
          <!-- 지하철역 정보 헤더 -->
          <div class="lookup-board-header subway-theme-header">
            <div class="station-meta-info">
              <div class="station-name-row">
                <span class="station-icon">🚇</span>
                <h4 class="station-title">${this.escapeHtml(stationName)}역</h4>
                <span class="station-ars-badge subway-badge-tag">실시간 열차 운행정보</span>
                <div class="bus-time-zoom-ctrl" style="margin-left:auto;">
                  <button type="button" class="btn-time-zoom-btn btn-time-zoom-plus" onclick="window.transitManager && window.transitManager.increaseTimeFontSize(event, '${subwayStationKey}')" title="${this.escapeHtml(stationName)}역 도착시간 글씨 확대" aria-label="${this.escapeHtml(stationName)}역 도착시간 글씨 확대">
                    <span class="zoom-btn-icon">＋</span>
                  </button>
                  <button type="button" class="btn-time-zoom-btn btn-time-zoom-reset" onclick="window.transitManager && window.transitManager.resetTimeFontSize(event, '${subwayStationKey}')" title="${this.escapeHtml(stationName)}역 도착시간 글씨 원래대로 복귀" aria-label="${this.escapeHtml(stationName)}역 도착시간 글씨 원래대로 복귀">
                    <span class="zoom-btn-icon">↺</span>
                  </button>
                </div>
              </div>
              <div class="station-sub-row">
                <span class="station-route-count">실시간 열차 <strong>${safeArrivals.length}대 감지</strong></span>
                <span class="station-update-time">수신: ${currentTimeStr}</span>
                <span class="station-auto-ticker">🔄 <strong id="lookupAutoRefreshCountdown">${this.refreshCountdown}초</strong> 갱신</span>
              </div>
            </div>
          </div>

          <!-- 상행/하행 방향별 열차 도착 안내 -->
          <div class="subway-board-grid">
            ${renderTrainGroup('상행 / 내선 방면', upTrains, '⬆️')}
            ${renderTrainGroup('하행 / 외선 방면', downTrains, '⬇️')}
          </div>
        </div>
      `;

      this.resultContainer.innerHTML = boardHtml;
      if (this.userInitiatedScroll) {
        this.scrollToResult();
        this.userInitiatedScroll = false;
      }
    }

    // ==========================================
    // 최근 검색 / 빠른 선택 칩 (3대 핵심 거점 단독 줄 분리)
    // ==========================================
    renderQuickChips() {
      if (!this.chipsContainer) return;

      const history = this.getRecentHistory();
      
      // 최상위 5대 핵심 거점 (각 항목이 독립된 1행을 차지하는 와이드 카드)
      // 1: 15158 양정고 (6637 영등포구청역 방면)
      // 2: 19729 영등포구청6637버스 (양정고 다음 배치, 6637 단독 노출)
      // 3: 19176 당산역버스정류장 (603 · 6620 귀가 방면)
      // 4: 15156 경인초교 (당산역 다음 배치, 6637 오목교방면)
      // 5: 9호선 선유도역 (실시간 우선 및 시간표)
      const topPriorityCards = [
        {
          type: 'bus',
          id: '15158',
          name: '양정고등학교',
          badgeText: '🚏 15158',
          badgeClass: 'badge-blue',
          titleText: '양정고등학교',
          routeTag: '6637 영등포구청역 방면',
          statusText: '영등포구청역 방향'
        },
        {
          type: 'bus',
          id: '19729',
          name: '영등포구청.우리은행',
          badgeText: '🚏 19729',
          badgeClass: 'badge-blue',
          titleText: '영등포구청6637버스',
          routeTag: '6637 목동방면 (6637 전용)',
          statusText: '영등포구청'
        },
        {
          type: 'bus',
          id: '19176',
          name: '당산역삼성래미안아파트',
          badgeText: '🚏 19176',
          badgeClass: 'badge-blue',
          titleText: '당산역버스정류장',
          routeTag: '603 · 6620 방면',
          statusText: '당산역'
        },
        {
          type: 'bus',
          id: '15156',
          name: '경인초교',
          badgeText: '🚏 15156',
          badgeClass: 'badge-blue',
          titleText: '경인초교 · 목동5·6단지',
          routeTag: '6637 오목교방면',
          statusText: '오목교방면'
        },
        {
          type: 'subway',
          id: '선유도',
          name: '선유도역',
          badgeText: '🚇 9호선',
          badgeClass: 'badge-line-9',
          titleText: '선유도역',
          routeTag: '당산방면 실시간 & 시간표',
          statusText: '실시간 즉시 확인',
          isSubwayAccent: true
        }
      ];

      // 4대 핵심 거점 수직 스택 카드 HTML (모두 깔끔하게 2줄 통일)
      const priorityStackHtml = topPriorityCards.map(p => {
        const isActive = (this.currentId === p.id);
        return `
          <button type="button" class="quick-priority-card ${p.type === 'bus' ? 'chip-prio-bus' : 'chip-prio-subway'} ${isActive ? 'is-active-target' : ''}"
                  data-type="${p.type}" data-id="${p.id}" data-name="${this.escapeHtml(p.name)}">
            <div class="prio-card-left">
              <div class="prio-line-1">
                <span class="prio-tag-badge ${p.badgeClass}">${p.badgeText}</span>
                <strong class="prio-name">${p.titleText}</strong>
              </div>
              <div class="prio-line-2">
                <span class="${p.type === 'bus' ? 'prio-route-tag' : 'prio-subway-tag'}">${p.routeTag}</span>
              </div>
            </div>
            <div class="prio-card-right">
              <span class="prio-status-text ${p.isSubwayAccent ? 'prio-text-accent' : ''}">${p.statusText}</span>
              <span class="prio-chevron">›</span>
            </div>
          </button>
        `;
      }).join('');

      // 기타 보조 추천 및 최근 검색 칩들
      const otherDefaultChips = [
        { type: 'bus', id: '15154', name: '이대목동병원' },
        { type: 'subway', id: '당산', name: '당산역(2·9)' },
        { type: 'bus', id: '19210', name: '선유도역1번' },
        { type: 'bus', id: '19212', name: '선유도역' }
      ];

      // 최근 검색 기록 중 상위 4개와 중복되지 않는 항목들 필터링
      const filteredHistory = history.filter(h => h.id !== '15158' && h.id !== '15156' && h.id !== '선유도' && h.id !== '19176');
      const secondaryMerged = [...filteredHistory];
      otherDefaultChips.forEach(def => {
        if (!secondaryMerged.some(m => m.type === def.type && m.id === def.id)) {
          secondaryMerged.push(def);
        }
      });

      const secondaryChipsHtml = secondaryMerged.slice(0, 6).map(chip => {
        const isBus = (chip.type === 'bus');
        const icon = isBus ? '🚏' : '🚇';
        const label = isBus ? `[${chip.id}] ${chip.name}` : `${chip.name}`;
        return `
          <button type="button" class="quick-chip-btn ${isBus ? 'chip-bus' : 'chip-subway'}"
                  data-type="${chip.type}" data-id="${chip.id}" data-name="${this.escapeHtml(chip.name)}">
            <span class="chip-icon">${icon}</span>
            <span class="chip-text">${label}</span>
          </button>
        `;
      }).join('');

      // 전체 빠른 선택 컨테이너 렌더링
      this.chipsContainer.innerHTML = `
        <div class="quick-priority-column">
          ${priorityStackHtml}
        </div>
        <div class="quick-sub-chips-row">
          <span class="quick-chips-sublabel">추천·최근:</span>
          <div class="quick-chips-scroll-sub">
            ${secondaryChipsHtml}
          </div>
        </div>
      `;

      // 1. 상위 4대 핵심 카드 클릭 이벤트 (사용자가 직접 클릭할 때만 스크롤 허용)
      this.chipsContainer.querySelectorAll('.quick-priority-card').forEach(card => {
        card.addEventListener('click', () => {
          this.userInitiatedScroll = true; // 사용자가 직접 선택했을 때만 스크롤 활성화!
          this.chipsContainer.querySelectorAll('.quick-priority-card').forEach(c => c.classList.remove('is-active-target'));
          card.classList.add('is-active-target');

          const type = card.getAttribute('data-type');
          const id = card.getAttribute('data-id');
          const name = card.getAttribute('data-name');
          if (type === 'bus') {
            this.inputQuery.value = id;
            if (this.btnClearQuery) this.btnClearQuery.style.display = 'flex';
            this.lookupBusByArs(id, name);
          } else {
            this.inputQuery.value = name;
            if (this.btnClearQuery) this.btnClearQuery.style.display = 'flex';
            this.lookupSubway(id);
          }
          this.scrollToResult();
        });
      });

      // 2. 보조 칩 클릭 이벤트 (사용자가 직접 클릭할 때만 스크롤 허용)
      this.chipsContainer.querySelectorAll('.quick-chip-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.userInitiatedScroll = true; // 사용자가 직접 선택했을 때만 스크롤 활성화!
          const type = btn.getAttribute('data-type');
          const id = btn.getAttribute('data-id');
          const name = btn.getAttribute('data-name');
          if (type === 'bus') {
            this.inputQuery.value = id;
            if (this.btnClearQuery) this.btnClearQuery.style.display = 'flex';
            this.lookupBusByArs(id, name);
          } else {
            this.inputQuery.value = name;
            if (this.btnClearQuery) this.btnClearQuery.style.display = 'flex';
            this.lookupSubway(id);
          }
          this.scrollToResult();
        });
      });
    }

    getRecentHistory() {
      try {
        const raw = localStorage.getItem('shift_recent_transits');
        return raw ? JSON.parse(raw) : [];
      } catch (e) {
        return [];
      }
    }

    saveRecentHistory(type, id, name) {
      try {
        let history = this.getRecentHistory();
        history = history.filter(h => !(h.type === type && h.id === id));
        history.unshift({ type, id, name });
        if (history.length > 8) history = history.slice(0, 8);
        localStorage.setItem('shift_recent_transits', JSON.stringify(history));
      } catch (e) {}
    }

    // ==========================================
    // API 통신 레이어 (직결 + 프록시 안전 fallback)
    // ==========================================

    // 1. 서울시 정류소명 검색 API
    async fetchStationsByName(name) {
      const cleanName = String(name).trim();
      const directUrl = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByName?serviceKey=${this.busApiKey}&stSrch=${encodeURIComponent(cleanName)}&resultType=json`;

      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(directUrl, { cache: 'no-store', signal: controller.signal });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          const items = data?.msgBody?.itemList;
          if (Array.isArray(items)) return items;
        }
      } catch (e) {}

      // CORS fallback
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
        const res = await fetch(proxyUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const items = data?.msgBody?.itemList;
          if (Array.isArray(items)) return items;
        }
      } catch (e) {}

      return [];
    }

    // 2. ARS별 전체 버스 도착정보 API (getStationByUid)
    async fetchBusArrivalByUid(arsId) {
      const cleanArs = String(arsId).replace(/[^0-9]/g, '');
      const directUrl = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid?serviceKey=${this.busApiKey}&arsId=${cleanArs}&resultType=json`;

      // 1차 Direct
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(directUrl, { cache: 'no-store', signal: controller.signal });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          const items = data?.msgBody?.itemList;
          if (Array.isArray(items)) {
            this.cache.bus[cleanArs] = items;
            return items;
          }
        }
      } catch (e) {}

      // 2차 CORS 프록시
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
        const res = await fetch(proxyUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const items = data?.msgBody?.itemList;
          if (Array.isArray(items)) {
            this.cache.bus[cleanArs] = items;
            return items;
          }
        }
      } catch (e) {}

      return this.cache.bus[cleanArs] || [];
    }

    // 3. 지하철 실시간 도착정보 API (realtimeStationArrival)
    async fetchSubwayRealtime(stationName) {
      const cleanName = stationName.replace(/역$/, '').trim();
      const directUrl = `http://swopenAPI.seoul.go.kr/api/subway/${this.subwayApiKey}/json/realtimeStationArrival/0/10/${encodeURIComponent(cleanName)}`;

      // 1차 Direct
      try {
        const controller = new AbortController();
        const tid = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(directUrl, { cache: 'no-store', signal: controller.signal });
        clearTimeout(tid);
        if (res.ok) {
          const data = await res.json();
          if (data && data.realtimeArrivalList) {
            this.cache.subway[cleanName] = data.realtimeArrivalList;
            return data.realtimeArrivalList;
          }
          console.warn('[TransitLookup] 지하철 실시간 데이터 없음:', cleanName, data?.code || data?.errorMessage?.code);
          return [];
        }
      } catch (e) {
        console.warn('[TransitLookup] 지하철 직결 실패, 프록시 시도:', e?.message || e);
      }

      // 2차 CORS 프록시
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`;
        const res = await fetch(proxyUrl, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.realtimeArrivalList) {
            this.cache.subway[cleanName] = data.realtimeArrivalList;
            return data.realtimeArrivalList;
          }
        }
      } catch (e) {}

      return this.cache.subway[cleanName] || [];
    }

    // ==========================================
    // UI 상태 헬퍼 함수들
    // ==========================================
    showLoading(text) {
      if (!this.resultContainer) return;
      this.resultContainer.innerHTML = `
        <div class="lookup-state-box">
          <div class="lookup-spinner"></div>
          <div class="lookup-state-text">${this.escapeHtml(text)}</div>
        </div>
      `;
    }

    showError(text) {
      if (!this.resultContainer) return;
      this.resultContainer.innerHTML = `
        <div class="lookup-state-box lookup-error-state">
          <div class="state-icon">⚠️</div>
          <div class="lookup-state-text error-msg">${this.escapeHtml(text)}</div>
          <button type="button" class="btn-state-retry" onclick="window.transitLookup && window.transitLookup.executeSearch()">다시 시도</button>
        </div>
      `;
    }

    showEmptyBus(arsId, customName) {
      if (!this.resultContainer) return;
      const formattedArs = this.formatArsId(arsId);
      this.resultContainer.innerHTML = `
        <div class="lookup-state-box">
          <div class="state-icon">🚏</div>
          <div class="lookup-state-title">
            <span class="station-ars-badge station-ars-badge-blue">ARS ${formattedArs}</span>
            <span class="empty-station-name">${this.escapeHtml(customName || '정류소 정보')}</span>
          </div>
          <div class="lookup-state-text">현재 운행 중인 버스가 없거나 정류장 번호를 다시 확인해 주세요.</div>
        </div>
      `;
    }

    showEmptySubway(stationName) {
      if (!this.resultContainer) return;
      this.resultContainer.innerHTML = `
        <div class="lookup-state-box">
          <div class="state-icon">🚇</div>
          <div class="lookup-state-title">${this.escapeHtml(stationName)}역 운행 정보</div>
          <div class="lookup-state-text">현재 실시간 운행 중인 열차 도착 정보를 수신할 수 없습니다 (심야 시간 등).</div>
        </div>
      `;
    }

    // ==========================================
    // 유틸리티 및 포맷터
    // ==========================================
    formatEtaTime(ts) {
      if (!ts) return '';
      const d = new Date(ts);
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    }

    formatArsId(ars) {
      const s = String(ars).replace(/[^0-9]/g, '');
      if (s.length === 5) return `${s.slice(0, 2)}-${s.slice(2)}`;
      return s;
    }

    formatSecondsHtml(sec, walkSec = 300) {
      const catchClass = (sec >= walkSec) ? 'transit-catchable' : 'transit-uncatchable';
      if (!sec || isNaN(sec) || sec <= 0) return `<span class="tag-arrive-now transit-uncatchable">⚡ 곧 도착</span>`;
      if (sec < 60) return `<span class="tag-arrive-imminent ${catchClass}">${sec}초 후</span>`;
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      const sStr = s < 10 ? '0' + s : s;
      return `<span class="${catchClass}"><span class="transit-time-min">${m}분</span> <span class="transit-time-sec">${sStr}초 후</span></span>`;
    }

    formatPlateHighlight(plate) {
      if (!plate) return '';
      const str = String(plate).trim();
      const m = str.match(/^(.*?)(\d{4})$/);
      if (m) {
        return `🚌 <strong class="plate-digit">${m[2]}</strong>`;
      }
      return `🚌 ${str}`;
    }

    cleanArrivalMsg(msg) {
      if (!msg) return '정보 없음';
      return msg.replace(/\[\d+번째\s*전\]/g, '').trim();
    }

    extractStationCount(msg) {
      if (!msg) return '';
      const m = msg.match(/\[(\d+번째\s*전)\]/);
      return m ? m[1] : '';
    }

    getBusBadgeClass(routeType, rtNm) {
      const t = String(routeType || '').trim();
      const n = String(rtNm || '').trim();

      // 1. 핵심 주요 버스 우선 매핑 (오분류 원천 방지)
      // 🔵 603번: 파란색 (간선버스)
      if (n === '603') return 'badge-blue';

      // 🩵 700번 부천버스: 연한 하늘색
      if (n === '700' || n.includes('부천') || n === '부천700') return 'badge-sky';

      // 🌿 6637, 6620번: 옅은 초록색 (지선버스)
      if (n === '6637' || n === '6620') return 'badge-green';

      // 🌲 양천01 등 마을버스: 짙은 초록색
      if (n.startsWith('양천') || t === '2' || t.includes('마을') || n.includes('마을')) return 'badge-town';

      // ✈️ 공항버스: routeType 1 또는 6000번대 공항리무진 (6001~6030, 6100~6300 등 4자리) -> 브라운 색
      if (t === '1' || t.includes('공항') || n.includes('공항') || /^60\d{2}$/.test(n) || /^61\d{2}$/.test(n) || /^62\d{2}$/.test(n) || /^63\d{2}$/.test(n)) {
        return 'badge-airport';
      }

      // 마을버스 (기타 일반)
      if (t === '2' || t.includes('마을')) return 'badge-town';

      // 지선버스: 4자리 지선버스 또는 routeType 4 -> 옅은 초록색
      if (t === '4' || t.includes('지선') || /^[1-7]\d{3}$/.test(n)) return 'badge-green';

      // 간선버스: 3자리 간선버스 또는 routeType 3 -> 파란색
      if (t === '3' || t.includes('간선') || /^\d{3}$/.test(n)) return 'badge-blue';

      // 광역버스: 9로 시작하는 4자리 또는 routeType 6 -> 빨간색
      if (t === '6' || t.includes('광역') || t.includes('직행') || /^9\d{3}$/.test(n)) return 'badge-red';

      return (n.length === 4) ? 'badge-green' : 'badge-green';
    }

    guessRouteType(rtNm) {
      if (!rtNm) return '일반';
      const n = String(rtNm).trim();
      if (n === '603') return '간선버스';
      if (n === '700' || n.includes('부천')) return '부천버스';
      if (n === '6637' || n === '6620') return '지선버스';
      if (n.startsWith('양천') || n.includes('마을')) return '마을버스';
      if (n.startsWith('60') && n.length === 4) return '공항버스';
      if (n.includes('공항')) return '공항버스';
      if (n.length === 3) return '간선버스';
      if (n.length === 4) return '지선버스';
      return '일반버스';
    }

    getSubwayLineClass(lineName) {
      if (lineName.includes('1호선')) return 'line-1';
      if (lineName.includes('2호선')) return 'line-2';
      if (lineName.includes('3호선')) return 'line-3';
      if (lineName.includes('4호선')) return 'line-4';
      if (lineName.includes('5호선')) return 'line-5';
      if (lineName.includes('6호선')) return 'line-6';
      if (lineName.includes('7호선')) return 'line-7';
      if (lineName.includes('8호선')) return 'line-8';
      if (lineName.includes('9호선')) return 'line-9';
      if (lineName.includes('신분당')) return 'line-sinbundang';
      if (lineName.includes('공항')) return 'line-airport';
      return 'line-default';
    }

    isImminentSubway(msg) {
      if (!msg) return false;
      return msg.includes('진입') || msg.includes('도착') || msg.includes('출발') || msg.includes('곧');
    }

    escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }
  }

  // DOM 로드 완료 시 인스턴스 초기화
  document.addEventListener('DOMContentLoaded', () => {
    window.transitLookup = new TransitLookupController();
  });

})();
