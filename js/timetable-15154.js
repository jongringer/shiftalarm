// ==========================================================================
// 정류소 '이대목동병원.목동6단지앞(15154)' 지선 6620번 / 간선 603번
// 최우선 기준 운행 시간표 데이터 및 계산 엔진
// 사용자 지침: 일반 포털 검색 값이나 평균 배차간격보다 아래 시간표를 최우선 적용
// ==========================================================================

const BUS_TIMETABLE_15154 = {
  // 1. 지선 6620번 버스
  '6620': {
    // 아침 06:00 ~ 08:00
    morning: {
      startH: 6, startM: 0,
      endH: 8, endM: 10,
      schedules: {
        mon: [
          { time: '06:12', min: '06:10', max: '06:12' },
          { time: '06:23', min: '06:22', max: '06:25' },
          { time: '06:41', min: '06:37', max: '06:45' },
          { time: '06:55', min: '06:53', max: '06:57' },
          { time: '07:13', min: '07:11', max: '07:15' },
          { time: '07:31', min: '07:28', max: '07:35' },
          { time: '07:50', min: '07:46', max: '07:55' }
        ],
        tue: [
          { time: '06:11', min: '06:08', max: '06:12' },
          { time: '06:25', min: '06:23', max: '06:25' },
          { time: '06:38', min: '06:37', max: '06:40' },
          { time: '06:55', min: '06:53', max: '06:57' },
          { time: '07:12', min: '07:09', max: '07:15' },
          { time: '07:31', min: '07:26', max: '07:36' },
          { time: '07:48', min: '07:46', max: '07:53' }
        ],
        wed: [
          { time: '06:10', min: '06:10', max: '06:12' },
          { time: '06:23', min: '06:21', max: '06:25' },
          { time: '06:38', min: '06:36', max: '06:40' },
          { time: '06:55', min: '06:53', max: '06:55' },
          { time: '07:11', min: '07:09', max: '07:13' },
          { time: '07:27', min: '07:23', max: '07:30' },
          { time: '07:47', min: '07:44', max: '07:50' }
        ],
        thu: [
          { time: '06:10', min: '06:08', max: '06:10' },
          { time: '06:23', min: '06:22', max: '06:25' },
          { time: '06:38', min: '06:38', max: '06:40' },
          { time: '06:55', min: '06:53', max: '06:58' },
          { time: '07:11', min: '07:11', max: '07:14' },
          { time: '07:30', min: '07:27', max: '07:33' },
          { time: '07:47', min: '07:46', max: '07:52' }
        ],
        fri: [
          { time: '06:10', min: '06:10', max: '06:12' },
          { time: '06:23', min: '06:22', max: '06:25' },
          { time: '06:39', min: '06:37', max: '06:40' },
          { time: '06:54', min: '06:53', max: '06:55' },
          { time: '07:11', min: '07:11', max: '07:14' },
          { time: '07:29', min: '07:27', max: '07:34' },
          { time: '07:49', min: '07:45', max: '07:52' }
        ],
        sat: [
          { time: '06:02', min: '05:58', max: '06:03' },
          { time: '06:22', min: '06:15', max: '06:27' },
          { time: '06:35', min: '06:34', max: '06:37' },
          { time: '06:50', min: '06:46', max: '06:54' },
          { time: '07:11', min: '07:07', max: '07:12' },
          { time: '07:29', min: '07:26', max: '07:31' },
          { time: '07:48', min: '07:42', max: '07:51' }
        ],
        sun: [
          { time: '06:19', min: '06:13', max: '06:23' },
          { time: '06:31', min: '06:30', max: '06:33' },
          { time: '06:44', min: '06:40', max: '06:52' },
          { time: '07:03', min: '07:00', max: '07:07' },
          { time: '07:22', min: '07:20', max: '07:25' },
          { time: '07:43', min: '07:38', max: '07:47' },
          { time: '07:58', min: '07:56', max: '08:00' }
        ]
      }
    },
    // 오후 14:00 ~ 17:00
    afternoon: {
      startH: 14, startM: 0,
      endH: 17, endM: 45,
      schedules: {
        mon: [
          { time: '14:09', min: '14:06', max: '14:15' },
          { time: '14:25', min: '14:21', max: '14:30' },
          { time: '14:42', min: '14:36', max: '14:47' },
          { time: '14:55', min: '14:50', max: '14:59' },
          { time: '15:11', min: '15:07', max: '15:17' },
          { time: '15:27', min: '15:25', max: '15:31' },
          { time: '15:41', min: '15:38', max: '15:46' },
          { time: '16:02', min: '15:56', max: '16:06' },
          { time: '16:15', min: '16:09', max: '16:17' },
          { time: '16:24', min: '16:22', max: '16:28' },
          { time: '16:37', min: '16:33', max: '16:46' },
          { time: '16:52', min: '16:50', max: '16:59' }
        ],
        tue: [
          { time: '14:03', min: '14:01', max: '14:07' },
          { time: '14:16', min: '14:11', max: '14:23' },
          { time: '14:32', min: '14:26', max: '14:37' },
          { time: '14:46', min: '14:42', max: '14:51' },
          { time: '15:01', min: '14:57', max: '15:07' },
          { time: '15:12', min: '15:09', max: '15:20' },
          { time: '15:28', min: '15:23', max: '15:35' },
          { time: '15:45', min: '15:40', max: '15:49' },
          { time: '15:57', min: '15:53', max: '16:04' },
          { time: '16:11', min: '16:06', max: '16:18' },
          { time: '16:26', min: '16:20', max: '16:30' },
          { time: '16:42', min: '16:37', max: '16:46' }
        ],
        wed: [
          { time: '14:10', min: '14:07', max: '14:15' },
          { time: '14:23', min: '14:18', max: '14:29' },
          { time: '14:39', min: '14:34', max: '14:46' },
          { time: '14:56', min: '14:52', max: '15:00' },
          { time: '15:11', min: '15:06', max: '15:14' },
          { time: '15:26', min: '15:23', max: '15:29' },
          { time: '15:44', min: '15:40', max: '15:50' },
          { time: '16:01', min: '15:58', max: '16:06' },
          { time: '16:14', min: '16:09', max: '16:20' },
          { time: '16:29', min: '16:24', max: '16:33' },
          { time: '16:48', min: '16:42', max: '16:53' },
          { time: '17:04', min: '16:58', max: '17:10' }
        ],
        thu: [
          { time: '14:03', min: '14:01', max: '14:09' },
          { time: '14:19', min: '14:15', max: '14:25' },
          { time: '14:31', min: '14:27', max: '14:36' },
          { time: '14:47', min: '14:41', max: '14:51' },
          { time: '15:00', min: '14:55', max: '15:05' },
          { time: '15:13', min: '15:09', max: '15:18' },
          { time: '15:24', min: '15:20', max: '15:29' },
          { time: '15:42', min: '15:38', max: '15:44' },
          { time: '15:57', min: '15:54', max: '16:02' },
          { time: '16:16', min: '16:11', max: '16:24' },
          { time: '16:33', min: '16:28', max: '16:40' },
          { time: '16:51', min: '16:46', max: '16:57' }
        ],
        fri: [
          { time: '14:18', min: '14:12', max: '14:25' },
          { time: '14:36', min: '14:28', max: '14:41' },
          { time: '14:55', min: '14:48', max: '14:59' },
          { time: '15:09', min: '15:03', max: '15:14' },
          { time: '15:23', min: '15:18', max: '15:28' },
          { time: '15:38', min: '15:33', max: '15:40' },
          { time: '15:53', min: '15:48', max: '16:00' },
          { time: '16:13', min: '16:06', max: '16:17' },
          { time: '16:26', min: '16:19', max: '16:31' },
          { time: '16:37', min: '16:34', max: '16:43' },
          { time: '16:57', min: '16:51', max: '17:03' },
          { time: '17:14', min: '17:06', max: '17:19' }
        ],
        sat: [
          { time: '14:08', min: '14:00', max: '14:14' },
          { time: '14:25', min: '14:18', max: '14:32' },
          { time: '14:48', min: '14:43', max: '14:52' },
          { time: '15:05', min: '14:57', max: '15:11' },
          { time: '15:24', min: '15:19', max: '15:31' },
          { time: '15:44', min: '15:40', max: '15:46' },
          { time: '16:03', min: '16:00', max: '16:08' },
          { time: '16:22', min: '16:15', max: '16:26' },
          { time: '16:40', min: '16:35', max: '16:42' },
          { time: '16:57', min: '16:52', max: '17:06' },
          { time: '17:21', min: '17:12', max: '17:30' },
          { time: '17:40', min: '17:36', max: '17:48' }
        ],
        sun: [
          { time: '14:06', min: '14:01', max: '14:12' },
          { time: '14:20', min: '14:17', max: '14:23' },
          { time: '14:34', min: '14:28', max: '14:39' },
          { time: '14:54', min: '14:47', max: '15:00' },
          { time: '15:14', min: '15:09', max: '15:20' },
          { time: '15:34', min: '15:30', max: '15:35' },
          { time: '15:53', min: '15:51', max: '15:55' },
          { time: '16:13', min: '16:11', max: '16:15' },
          { time: '16:33', min: '16:31', max: '16:35' },
          { time: '16:56', min: '16:50', max: '17:01' },
          { time: '17:19', min: '17:08', max: '17:19' },
          { time: '17:29', min: '17:28', max: '17:30' }
        ]
      }
    }
  },

  // 2. 간선 603번 버스
  '603': {
    // 아침 06:00 ~ 08:20
    morning: {
      startH: 6, startM: 0,
      endH: 8, endM: 30,
      schedules: {
        mon: [
          { time: '06:05', min: '06:05', max: '06:07' },
          { time: '06:17', min: '06:17', max: '06:18' },
          { time: '06:25', min: '06:25', max: '06:27' },
          { time: '06:34', min: '06:30', max: '06:35' },
          { time: '06:42', min: '06:40', max: '06:44' },
          { time: '06:55', min: '06:51', max: '06:57' },
          { time: '07:05', min: '07:02', max: '07:07' },
          { time: '07:16', min: '07:14', max: '07:18' },
          { time: '07:27', min: '07:27', max: '07:29' },
          { time: '07:41', min: '07:40', max: '07:41' },
          { time: '07:47', min: '07:47', max: '07:49' },
          { time: '07:56', min: '07:52', max: '07:59' }
        ],
        tue: [
          { time: '06:06', min: '06:03', max: '06:10' },
          { time: '06:18', min: '06:16', max: '06:19' },
          { time: '06:25', min: '06:22', max: '06:27' },
          { time: '06:34', min: '06:33', max: '06:37' },
          { time: '06:42', min: '06:40', max: '06:44' },
          { time: '06:52', min: '06:50', max: '06:55' },
          { time: '07:05', min: '07:02', max: '07:07' },
          { time: '07:18', min: '07:15', max: '07:21' },
          { time: '07:27', min: '07:25', max: '07:29' },
          { time: '07:40', min: '07:36', max: '07:41' },
          { time: '07:49', min: '07:45', max: '07:52' },
          { time: '07:58', min: '07:54', max: '08:02' }
        ],
        wed: [
          { time: '06:06', min: '06:05', max: '06:09' },
          { time: '06:17', min: '06:17', max: '06:18' },
          { time: '06:25', min: '06:22', max: '06:29' },
          { time: '06:32', min: '06:30', max: '06:35' },
          { time: '06:41', min: '06:40', max: '06:43' },
          { time: '06:54', min: '06:50', max: '06:58' },
          { time: '07:04', min: '07:02', max: '07:09' },
          { time: '07:16', min: '07:13', max: '07:18' },
          { time: '07:27', min: '07:25', max: '07:28' },
          { time: '07:40', min: '07:36', max: '07:42' },
          { time: '07:49', min: '07:47', max: '07:51' },
          { time: '08:00', min: '07:57', max: '08:03' }
        ],
        thu: [
          { time: '06:08', min: '06:04', max: '06:12' },
          { time: '06:17', min: '06:16', max: '06:17' },
          { time: '06:25', min: '06:25', max: '06:27' },
          { time: '06:34', min: '06:30', max: '06:35' },
          { time: '06:42', min: '06:40', max: '06:44' },
          { time: '06:54', min: '06:50', max: '06:58' },
          { time: '07:04', min: '07:02', max: '07:05' },
          { time: '07:16', min: '07:15', max: '07:19' },
          { time: '07:26', min: '07:25', max: '07:29' },
          { time: '07:37', min: '07:35', max: '07:39' },
          { time: '07:47', min: '07:43', max: '07:49' },
          { time: '07:56', min: '07:52', max: '08:01' }
        ],
        fri: [
          { time: '06:05', min: '06:02', max: '06:09' },
          { time: '06:17', min: '06:17', max: '06:18' },
          { time: '06:25', min: '06:22', max: '06:29' },
          { time: '06:34', min: '06:31', max: '06:36' },
          { time: '06:42', min: '06:40', max: '06:44' },
          { time: '06:51', min: '06:50', max: '06:55' },
          { time: '07:05', min: '07:02', max: '07:06' },
          { time: '07:16', min: '07:14', max: '07:17' },
          { time: '07:27', min: '07:25', max: '07:27' },
          { time: '07:36', min: '07:35', max: '07:38' },
          { time: '07:48', min: '07:42', max: '07:51' },
          { time: '07:59', min: '07:56', max: '08:03' }
        ],
        sat: [
          { time: '06:07', min: '06:07', max: '06:09' },
          { time: '06:19', min: '06:17', max: '06:19' },
          { time: '06:25', min: '06:24', max: '06:27' },
          { time: '06:37', min: '06:37', max: '06:37' },
          { time: '06:44', min: '06:40', max: '06:47' },
          { time: '06:57', min: '06:55', max: '06:58' },
          { time: '07:05', min: '07:04', max: '07:09' },
          { time: '07:18', min: '07:17', max: '07:21' },
          { time: '07:31', min: '07:27', max: '07:36' },
          { time: '07:48', min: '07:43', max: '07:52' },
          { time: '08:02', min: '07:56', max: '08:06' },
          { time: '08:15', min: '08:11', max: '08:20' }
        ],
        sun: [
          { time: '06:02', min: '06:00', max: '06:03' },
          { time: '06:10', min: '06:08', max: '06:14' },
          { time: '06:25', min: '06:20', max: '06:29' },
          { time: '06:37', min: '06:35', max: '06:39' },
          { time: '06:49', min: '06:47', max: '06:52' },
          { time: '07:01', min: '06:58', max: '07:04' },
          { time: '07:16', min: '07:14', max: '07:18' },
          { time: '07:27', min: '07:24', max: '07:29' },
          { time: '07:42', min: '07:40', max: '07:43' },
          { time: '07:53', min: '07:49', max: '07:59' },
          { time: '08:08', min: '08:03', max: '08:12' },
          { time: '08:22', min: '08:20', max: '08:27' }
        ]
      }
    },
    // 오후 14:40 ~ 17:40
    afternoon: {
      startH: 14, startM: 40,
      endH: 17, endM: 50,
      schedules: {
        mon: [
          { time: '14:56', min: '14:52', max: '14:56' },
          { time: '15:04', min: '15:01', max: '15:07' },
          { time: '15:14', min: '15:10', max: '15:18' },
          { time: '15:26', min: '15:26', max: '15:28' },
          { time: '15:38', min: '15:34', max: '15:40' },
          { time: '15:47', min: '15:45', max: '15:49' },
          { time: '15:52', min: '15:52', max: '15:54' },
          { time: '16:02', min: '16:00', max: '16:05' },
          { time: '16:11', min: '16:09', max: '16:14' },
          { time: '16:22', min: '16:19', max: '16:27' },
          { time: '16:36', min: '16:32', max: '16:38' },
          { time: '16:49', min: '16:43', max: '16:52' }
        ],
        tue: [
          { time: '14:50', min: '14:46', max: '14:54' },
          { time: '15:01', min: '14:58', max: '15:03' },
          { time: '15:14', min: '15:12', max: '15:16' },
          { time: '15:26', min: '15:23', max: '15:30' },
          { time: '15:39', min: '15:37', max: '15:40' },
          { time: '15:48', min: '15:43', max: '15:49' },
          { time: '15:56', min: '15:54', max: '15:58' },
          { time: '16:03', min: '16:03', max: '16:07' },
          { time: '16:11', min: '16:09', max: '16:14' },
          { time: '16:24', min: '16:20', max: '16:26' },
          { time: '16:33', min: '16:31', max: '16:36' },
          { time: '16:40', min: '16:39', max: '16:42' }
        ],
        wed: [
          { time: '14:59', min: '14:54', max: '15:02' },
          { time: '15:09', min: '15:05', max: '15:12' },
          { time: '15:15', min: '15:13', max: '15:19' },
          { time: '15:24', min: '15:23', max: '15:27' },
          { time: '15:39', min: '15:34', max: '15:43' },
          { time: '15:48', min: '15:44', max: '15:52' },
          { time: '16:00', min: '15:56', max: '16:03' },
          { time: '16:11', min: '16:09', max: '16:12' },
          { time: '16:18', min: '16:16', max: '16:20' },
          { time: '16:25', min: '16:25', max: '16:25' },
          { time: '16:36', min: '16:34', max: '16:38' },
          { time: '16:51', min: '16:47', max: '16:53' }
        ],
        thu: [
          { time: '14:49', min: '14:47', max: '14:52' },
          { time: '15:01', min: '14:58', max: '15:03' },
          { time: '15:11', min: '15:08', max: '15:14' },
          { time: '15:18', min: '15:16', max: '15:21' },
          { time: '15:28', min: '15:25', max: '15:30' },
          { time: '15:39', min: '15:34', max: '15:43' },
          { time: '15:49', min: '15:47', max: '15:52' },
          { time: '16:00', min: '15:56', max: '16:03' },
          { time: '16:13', min: '16:09', max: '16:16' },
          { time: '16:25', min: '16:21', max: '16:28' },
          { time: '16:34', min: '16:30', max: '16:38' },
          { time: '16:47', min: '16:43', max: '16:49' }
        ],
        fri: [
          { time: '14:54', min: '14:51', max: '14:56' },
          { time: '15:01', min: '14:59', max: '15:02' },
          { time: '15:10', min: '15:08', max: '15:12' },
          { time: '15:17', min: '15:16', max: '15:19' },
          { time: '15:28', min: '15:25', max: '15:32' },
          { time: '15:39', min: '15:36', max: '15:43' },
          { time: '15:49', min: '15:47', max: '15:52' },
          { time: '15:58', min: '15:57', max: '16:03' },
          { time: '16:12', min: '16:09', max: '16:17' },
          { time: '16:23', min: '16:20', max: '16:26' },
          { time: '16:31', min: '16:28', max: '16:35' },
          { time: '16:39', min: '16:36', max: '16:44' }
        ],
        sat: [
          { time: '14:59', min: '14:56', max: '15:02' },
          { time: '15:12', min: '15:09', max: '15:17' },
          { time: '15:25', min: '15:21', max: '15:30' },
          { time: '15:37', min: '15:33', max: '15:43' },
          { time: '15:54', min: '15:49', max: '15:58' },
          { time: '16:06', min: '16:03', max: '16:12' },
          { time: '16:20', min: '16:16', max: '16:27' },
          { time: '16:34', min: '16:31', max: '16:40' },
          { time: '16:47', min: '16:47', max: '16:51' },
          { time: '17:02', min: '16:56', max: '17:06' },
          { time: '17:20', min: '17:15', max: '17:24' },
          { time: '17:35', min: '17:31', max: '17:37' }
        ],
        sun: [
          { time: '14:48', min: '14:46', max: '14:54' },
          { time: '15:02', min: '15:01', max: '15:09' },
          { time: '15:17', min: '15:12', max: '15:21' },
          { time: '15:32', min: '15:27', max: '15:34' },
          { time: '15:46', min: '15:41', max: '15:49' },
          { time: '16:00', min: '15:58', max: '16:05' },
          { time: '16:12', min: '16:09', max: '16:14' },
          { time: '16:29', min: '16:23', max: '16:34' },
          { time: '16:45', min: '16:42', max: '16:47' },
          { time: '17:00', min: '16:58', max: '17:03' },
          { time: '17:14', min: '17:09', max: '17:17' },
          { time: '17:33', min: '17:28', max: '17:39' }
        ]
      }
    }
  }
};

/**
 * 대한민국 공휴일 판정 보조 함수
 */
function isBusKoreanHoliday(date) {
  if (typeof window !== 'undefined' && typeof window.isKoreanHoliday === 'function') {
    return window.isKoreanHoliday(date);
  }
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const md = `${m}-${d}`;
  const fixed = ['01-01', '03-01', '05-05', '06-06', '08-15', '10-03', '10-09', '12-25'];
  return fixed.includes(md);
}

/**
 * 요일 키 반환 (mon, tue, wed, thu, fri, sat, sun)
 */
function getBusDayKey(date) {
  if (isBusKoreanHoliday(date)) return 'sun';
  const day = date.getDay(); // 0(일) ~ 6(토)
  const map = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return map[day];
}

/**
 * 시:분 문자열을 0시 기준 분(Minute) 단위 숫자로 변환
 */
function busTimeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

/**
 * 15154 정류소 최우선 시간표 적용 대상인지 확인하고 예정 순번(next, next2) 계산
 * @param {string} routeNum 노선 번호 ('6620' | '603')
 * @param {string} arsId 정류소 번호 ('15-154' | '15154')
 * @param {Date} dateObj 현재 시각 객체
 * @returns {object|null}
 */
function getPriorityBusSchedule(routeNum, arsId, dateObj = new Date()) {
  const cleanArs = String(arsId || '').replace('-', '');
  if (cleanArs !== '15154') return null;

  const routeConfig = BUS_TIMETABLE_15154[routeNum];
  if (!routeConfig) return null;

  const curH = dateObj.getHours();
  const curM = dateObj.getMinutes();
  const curTotalMin = curH * 60 + curM;
  const curSec = dateObj.getSeconds();

  let targetPeriod = null;
  let periodName = '';

  // 1. 아침 시간대 매칭
  const mStart = routeConfig.morning.startH * 60 + routeConfig.morning.startM;
  const mEnd = routeConfig.morning.endH * 60 + routeConfig.morning.endM;
  if (curTotalMin >= mStart && curTotalMin <= mEnd) {
    targetPeriod = routeConfig.morning;
    periodName = '아침 우선시간표';
  }

  // 2. 오후 시간대 매칭
  if (!targetPeriod && routeConfig.afternoon) {
    const aStart = routeConfig.afternoon.startH * 60 + routeConfig.afternoon.startM;
    const aEnd = routeConfig.afternoon.endH * 60 + routeConfig.afternoon.endM;
    if (curTotalMin >= aStart && curTotalMin <= aEnd) {
      targetPeriod = routeConfig.afternoon;
      periodName = '오후 우선시간표';
    }
  }

  if (!targetPeriod) return null;

  const dayKey = getBusDayKey(dateObj);
  const list = targetPeriod.schedules[dayKey] || [];
  if (list.length === 0) return null;

  // 현재 시각 이후의 운행 시각 찾기 (-30초 진입 중 고려)
  const futureItems = list.filter(item => {
    const itemMin = busTimeToMinutes(item.time);
    const itemDiffSec = (itemMin - curTotalMin) * 60 - curSec;
    return itemDiffSec >= -30;
  });

  if (futureItems.length === 0) return null;

  const nowMs = dateObj.getTime();

  function buildScheduleInfo(item) {
    if (!item) return null;
    const targetMin = busTimeToMinutes(item.time);
    const diffSec = (targetMin - curTotalMin) * 60 - curSec;
    const finalSec = Math.max(0, diffSec);
    const targetTimeMs = nowMs + finalSec * 1000;

    return {
      time: item.time,
      diffSec: finalSec,
      targetTime: targetTimeMs,
      source: '공식운행시간표',
      periodName
    };
  }

  const next = buildScheduleInfo(futureItems[0]);
  const next2 = futureItems.length > 1 ? buildScheduleInfo(futureItems[1]) : null;

  return {
    isPriority: true,
    routeNum,
    periodName,
    dayKey,
    next,
    next2,
    allList: list
  };
}

// 전역 객체 노출 (Node/Browser 호환)
if (typeof window !== 'undefined') {
  window.BUS_TIMETABLE_15154 = BUS_TIMETABLE_15154;
  window.getPriorityBusSchedule = getPriorityBusSchedule;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUS_TIMETABLE_15154, getPriorityBusSchedule };
}
