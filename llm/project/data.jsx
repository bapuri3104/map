/* ===== 만날지도 — data ===== */
const ORIGINS = {
  me:     { key:'me',  name:'목동',  station:'목동역',  who:'나',   coords:[37.5266, 126.8757] },
  friend: { key:'fr',  name:'천호',  station:'천호역',  who:'친구', coords:[37.5385, 127.1237] },
};

const CONDITIONS = {
  origins: ['목동 출발', '천호 출발'],
  purpose: '해돋이',
  mode: '대중교통 기준',
};

/* step type → icon key + colors handled in UI */
function S(type, line, main, sub, time){ return { type, line, main, sub, time }; }

const CANDIDATES = [
  {
    id:'namsan',
    name:'남산서울타워',
    area:'중구 · 도심',
    coords:[37.5512, 126.9882],
    reason:'서울 도심 전경과 일출을 한눈에. 전망대·케이블카 보유',
    me:{ mins:82, transfers:1, modes:'지하철+버스',
      steps:[
        S('walk', null, '목동역까지 도보', null, '4분'),
        S('subway','5호선','목동 → 충정로','8개 역 이동','17분'),
        S('transfer','2호선','충정로역 환승','5호선 → 2호선','4분'),
        S('subway','2호선','충정로 → 명동(을지로입구)','5개 역 이동','11분'),
        S('bus','남산순환 02','명동 → 남산서울타워','남산 순환버스','15분'),
        S('walk', null, '전망대까지 도보', null, '6분'),
      ]},
    friend:{ mins:65, transfers:2, modes:'지하철+버스',
      steps:[
        S('walk', null, '천호역까지 도보', null, '3분'),
        S('subway','5호선','천호 → 동대문역사문화공원','7개 역 이동','15분'),
        S('transfer','4호선','동대문역사문화공원 환승','5호선 → 4호선','4분'),
        S('subway','4호선','동대문 → 명동','3개 역 이동','6분'),
        S('bus','남산순환 02','명동 → 남산서울타워','남산 순환버스','15분'),
        S('walk', null, '전망대까지 도보', null, '6분'),
      ]},
  },
  {
    id:'eungbong',
    name:'응봉산 팔각정',
    area:'성동구 · 한강변',
    coords:[37.5486, 127.0205],
    reason:'한강 너머로 해가 뜨는 서울 대표 일출 명소. 두 출발지의 한가운데',
    me:{ mins:58, transfers:1, modes:'지하철',
      steps:[
        S('walk', null, '목동역까지 도보', null, '4분'),
        S('subway','5호선','목동 → 왕십리','12개 역 이동','25분'),
        S('transfer','경의·중앙선','왕십리역 환승','5호선 → 경의·중앙선','4분'),
        S('subway','경의·중앙선','왕십리 → 응봉','1개 역 이동','2분'),
        S('walk', null, '응봉산 팔각정까지 도보(등산)', null, '23분'),
      ]},
    friend:{ mins:49, transfers:1, modes:'지하철',
      steps:[
        S('walk', null, '천호역까지 도보', null, '3분'),
        S('subway','5호선','천호 → 왕십리','8개 역 이동','17분'),
        S('transfer','경의·중앙선','왕십리역 환승','5호선 → 경의·중앙선','4분'),
        S('subway','경의·중앙선','왕십리 → 응봉','1개 역 이동','2분'),
        S('walk', null, '응봉산 팔각정까지 도보(등산)', null, '23분'),
      ]},
  },
  {
    id:'achasan',
    name:'아차산 해맞이광장',
    area:'광진구 · 능선',
    coords:[37.5547, 127.0986],
    reason:'능선 너머 일출과 일망무제 조망. 친구는 가깝지만 나는 가장 멀어요',
    me:{ mins:78, transfers:0, modes:'지하철',
      steps:[
        S('walk', null, '목동역까지 도보', null, '4분'),
        S('subway','5호선','목동 → 아차산','26개 역 이동 (직통)','57분'),
        S('walk', null, '아차산역 → 해맞이광장(등산)', null, '17분'),
      ]},
    friend:{ mins:22, transfers:0, modes:'지하철',
      steps:[
        S('walk', null, '천호역까지 도보', null, '3분'),
        S('subway','5호선','천호 → 아차산','2개 역 이동','4분'),
        S('walk', null, '아차산역 → 해맞이광장(등산)', null, '15분'),
      ]},
  },
];

/* approximate transit-style polylines (illustrative, bend along roads/river) */
const ROUTES = {
  namsan:{
    me:[[37.5266,126.8757],[37.5300,126.9220],[37.5470,126.9450],[37.5600,126.9700],[37.5512,126.9882]],
    fr:[[37.5385,127.1237],[37.5660,127.0900],[37.5710,127.0400],[37.5620,127.0050],[37.5512,126.9882]],
  },
  eungbong:{
    me:[[37.5266,126.8757],[37.5310,126.9300],[37.5560,126.9700],[37.5610,127.0170],[37.5486,127.0205]],
    fr:[[37.5385,127.1237],[37.5610,127.0900],[37.5620,127.0380],[37.5486,127.0205]],
  },
  achasan:{
    me:[[37.5266,126.8757],[37.5350,126.9500],[37.5500,127.0100],[37.5570,127.0700],[37.5547,127.0986]],
    fr:[[37.5385,127.1237],[37.5480,127.1150],[37.5547,127.0986]],
  },
};

/* sort orders per comparison criterion */
const ORDERS = {
  ai:      ['namsan','eungbong','achasan'],
  middle:  ['eungbong','namsan','achasan'],
  transit: ['achasan','eungbong','namsan'],
  sunrise: ['eungbong','achasan','namsan'],
};

const CRITERIA = [
  { key:'ai',      label:'AI 추천',          note:'이동 균형·대중교통·해돋이 적합도를 종합했어요.' },
  { key:'middle',  label:'더 중간 지점 위주로', note:'두 사람의 이동 시간 차이가 적은 순서예요. 응봉산이 단 9분 차이로 가장 균형적이에요.' },
  { key:'transit', label:'대중교통 편한 곳',   note:'환승이 적고 도보가 짧은 순서예요. 아차산은 두 사람 모두 환승 없이 갈 수 있어요.' },
  { key:'sunrise', label:'해돋이 보기 좋은 곳', note:'일출 조망·분위기가 좋은 순서예요. 응봉산·아차산이 서울 대표 해맞이 명소예요.' },
];

function balanceOf(diff){
  if(diff <= 12) return { cls:'good', label:'이동 균형 좋음' };
  if(diff <= 30) return { cls:'mid',  label:'이동 균형 보통' };
  return { cls:'bad', label:'이동 부담 차이 큼' };
}
function fmtMin(m){
  const h=Math.floor(m/60), mm=m%60;
  return h>0 ? `${h}시간 ${mm}분` : `${mm}분`;
}
function candById(id){ return CANDIDATES.find(c=>c.id===id); }

Object.assign(window, {
  ORIGINS, CONDITIONS, CANDIDATES, ROUTES, ORDERS, CRITERIA,
  balanceOf, fmtMin, candById,
});
