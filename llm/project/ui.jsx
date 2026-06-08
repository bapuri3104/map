/* ===== 만날지도 — UI components ===== */
const { useState, useEffect, useRef } = React;

/* ---- icons (simple line glyphs) ---- */
const Ic = {
  pin:   (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>,
  pinF:  (p)=> <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 22s7-5.8 7-11.5A7 7 0 1 0 5 10.5C5 16.2 12 22 12 22Z"/><circle cx="12" cy="10" r="2.5" fill="#fff"/></svg>,
  send:  (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  walk:  (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="13" cy="4.5" r="1.6"/><path d="M11 21l1.4-5.2-2.4-2 .8-4.3 3.2 1.2 1.6 2.4"/><path d="M9 21l1.8-3.6M14.6 13.1l2 1.3"/></svg>,
  subway:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="6" y="3.5" width="12" height="13" rx="3"/><path d="M6 11h12M9.5 16.5 7.5 20M14.5 16.5 16.5 20"/><circle cx="9.2" cy="13.4" r=".9" fill="currentColor" stroke="none"/><circle cx="14.8" cy="13.4" r=".9" fill="currentColor" stroke="none"/></svg>,
  bus:   (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><rect x="5" y="4" width="14" height="12.5" rx="3"/><path d="M5 11h14M8.5 16.5 7 20M15.5 16.5 17 20"/><circle cx="8.6" cy="13.6" r=".9" fill="currentColor" stroke="none"/><circle cx="15.4" cy="13.6" r=".9" fill="currentColor" stroke="none"/></svg>,
  transfer:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 8h11l-2.5-2.5M19 16H8l2.5 2.5"/></svg>,
  flag:  (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 21V4M6 4h11l-2 3.5L17 11H6"/></svg>,
  spark: (p)=> <svg viewBox="0 0 24 24" fill="currentColor" {...p}><path d="M12 2.5l1.7 5.3 5.3 1.7-5.3 1.7L12 16.5l-1.7-5.3L5 9.5l5.3-1.7L12 2.5Z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2Z" opacity=".7"/></svg>,
  me:    (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>,
  friend:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="9" cy="8" r="3"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3 3 0 0 1 0 5.6M21.5 20a6.5 6.5 0 0 0-4-6"/></svg>,
  check: (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12.5l4.5 4.5L19 6.5"/></svg>,
  chevL: (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M15 5l-7 7 7 7"/></svg>,
  arrowR:(p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  sun:   (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 3v2M5 8l1.5 1M19 8l-1.5 1M3 14h18M7 14a5 5 0 0 1 10 0"/><path d="M9 18h6M7 21h10" opacity=".6"/></svg>,
  clock: (p)=> <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg>,
};

const LINE_COLORS = {
  '5호선':'#8B50A4', '2호선':'#33A23D', '4호선':'#2C8BD0',
  '경의·중앙선':'#5BC4A8', '남산순환 02':'#1F9254',
};
function stepIcoClass(type){
  return { walk:'ico-walk', subway:'ico-subway', bus:'ico-bus', transfer:'ico-transfer', flag:'ico-flag' }[type] || 'ico-walk';
}

/* ---- condition chips (in chat bubble) ---- */
function ParsedConditions(){
  return (
    <div className="parsed">
      <div className="parsed-title">이렇게 이해했어요</div>
      <div className="parsed-grid">
        <div className="parsed-k">출발지 1</div>
        <div className="parsed-v"><span className="dot me"></span>목동</div>
        <div className="parsed-k">출발지 2</div>
        <div className="parsed-v"><span className="dot fr"></span>천호</div>
        <div className="parsed-k">목적</div>
        <div className="parsed-v">해돋이 보기 좋은 곳</div>
        <div className="parsed-k">이동 기준</div>
        <div className="parsed-v">대중교통</div>
      </div>
    </div>
  );
}

/* ---- summary chips + criteria (canvas top) ---- */
function CanvasTop({ criterion, onCriterion }){
  return (
    <div className="canvas-top">
      <div className="summary-row">
        <span className="summary-label">AI가 이해한 조건</span>
        <span className="chip"><span className="dot me"></span>목동 출발</span>
        <span className="chip"><span className="dot fr"></span>천호 출발</span>
        <span className="chip purpose">해돋이</span>
        <span className="chip mode">대중교통 기준</span>
      </div>
      <div className="criteria">
        {CRITERIA.map(c=>(
          <button key={c.key} className={'crit-btn'+(criterion===c.key?' active':'')} onClick={()=>onCriterion(c.key)}>
            {c.key==='ai' && <Ic.spark className="ai-spark" />}
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---- candidate card ---- */
function CandidateCard({ cand, rank, selected, onSelect }){
  const bal = balanceOf(Math.abs(cand.me.mins - cand.friend.mins));
  const diff = Math.abs(cand.me.mins - cand.friend.mins);
  return (
    <button className={'card'+(selected?' selected':'')} style={{animationDelay:(rank*70)+'ms'}} onClick={onSelect}>
      <div className="card-top">
        <span className="rank-badge">{rank+1}</span>
        <span className="card-name">{cand.name}</span>
      </div>
      <span className={'balance-tag '+bal.cls}>
        {bal.cls==='good' ? <Ic.check style={{width:12,height:12}}/> : null}
        {bal.label} · {diff}분 차
      </span>
      <div className="time-cols">
        <div className="time-col">
          <div className="tc-label"><span className="dot me" style={{width:7,height:7,borderRadius:'50%',background:'var(--travel-blue)'}}></span>나</div>
          <div className="tc-mins">{fmtMin(cand.me.mins)}</div>
          <div className="tc-sub">환승 {cand.me.transfers}회</div>
        </div>
        <div className="time-col">
          <div className="tc-label"><span className="dot fr" style={{width:7,height:7,borderRadius:'50%',background:'var(--friend)'}}></span>친구</div>
          <div className="tc-mins">{fmtMin(cand.friend.mins)}</div>
          <div className="tc-sub">환승 {cand.friend.transfers}회</div>
        </div>
      </div>
      <div className="card-reason">{cand.reason}</div>
    </button>
  );
}

/* ---- step list ---- */
function StepList({ steps, accent }){
  return (
    <div className="steps">
      {steps.map((s,i)=>(
        <div className="step" key={i} style={{animationDelay:(i*55)+'ms'}}>
          <div className="step-rail">
            <div className={'step-ico '+stepIcoClass(s.type)}>
              {s.type==='walk' && <Ic.walk/>}
              {s.type==='subway' && <Ic.subway/>}
              {s.type==='bus' && <Ic.bus/>}
              {s.type==='transfer' && <Ic.transfer/>}
              {s.type==='flag' && <Ic.flag/>}
            </div>
            <div className="step-line"></div>
          </div>
          <div className="step-body">
            <div className="step-main">
              {s.line && <span className="line-pill" style={{background:LINE_COLORS[s.line]||'#888'}}>{s.line}</span>}
              {s.main}
            </div>
            {s.sub && <div className="step-sub">{s.sub}</div>}
          </div>
          <div className="step-time">{s.time}</div>
        </div>
      ))}
    </div>
  );
}

/* ---- compare card (전체 tab) ---- */
function CompareCard({ cand }){
  const diff = Math.abs(cand.me.mins - cand.friend.mins);
  const bal = balanceOf(diff);
  const max = Math.max(cand.me.mins, cand.friend.mins);
  const bannerStyle = bal.cls==='good'
    ? {background:'#E8F6EE',color:'#1F9254'}
    : bal.cls==='mid' ? {background:'#FFF7E6',color:'#B7791F'} : {background:'#FDECEC',color:'#D24B4B'};
  return (
    <div className="compare-card">
      <div>
        <div className="cmp-row">
          <span className="cmp-leg"><Ic.me style={{width:14,height:14,color:'var(--travel-blue)'}}/> 나 · 목동역</span>
          <span className="cmp-mins" style={{color:'var(--travel-blue)'}}>{fmtMin(cand.me.mins)}</span>
        </div>
        <div className="cmp-bar-track" style={{marginTop:6}}><div className="cmp-bar me" style={{width:(cand.me.mins/max*100)+'%'}}></div></div>
        <div className="cmp-row" style={{marginTop:5,fontSize:11,color:'var(--gray)'}}><span>환승 {cand.me.transfers}회 · {cand.me.modes}</span></div>
      </div>
      <div>
        <div className="cmp-row">
          <span className="cmp-leg"><Ic.friend style={{width:14,height:14,color:'var(--friend-d)'}}/> 친구 · 천호역</span>
          <span className="cmp-mins" style={{color:'var(--friend-d)'}}>{fmtMin(cand.friend.mins)}</span>
        </div>
        <div className="cmp-bar-track" style={{marginTop:6}}><div className="cmp-bar fr" style={{width:(cand.friend.mins/max*100)+'%'}}></div></div>
        <div className="cmp-row" style={{marginTop:5,fontSize:11,color:'var(--gray)'}}><span>환승 {cand.friend.transfers}회 · {cand.friend.modes}</span></div>
      </div>
      <div className="diff-banner" style={bannerStyle}>
        {bal.cls==='good' && <Ic.check style={{width:14,height:14}}/>}
        시간 차이 {diff}분 · {bal.label}
      </div>
    </div>
  );
}

Object.assign(window, { Ic, ParsedConditions, CanvasTop, CandidateCard, StepList, CompareCard, LINE_COLORS });
