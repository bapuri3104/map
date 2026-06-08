/* ===== 만날지도 — App ===== */
const PREFILL = '나는 목동 살고 친구는 천호 사는데, 둘이 해돋이 보기 좋은 중간 지점이 어디야?';
let _mid = 0;
const nextId = ()=> ++_mid;
const DEMO = (/[?&]demo(=([a-z]+))?/.exec(location.search) || [])[2] || (/[?&]demo/.test(location.search) ? 'cards' : null);

function Brand(){
  return (
    <div className="chat-head">
      <div className="brand-mark">
        <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>
      </div>
      <div>
        <div className="brand-name">midspot</div>
        <div className="brand-sub">중간에서 만나요 · 지도 기반 장소 추천</div>
      </div>
    </div>
  );
}

function Message({ m }){
  return (
    <div className={'msg '+m.role}>
      {m.role==='ai' && (
        <div className="avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>
        </div>
      )}
      <div className="bubble">
        {m.text && <span>{m.text}</span>}
        {m.node==='parsed' && <ParsedConditions/>}
        {m.node==='pick' && <PickCard cand={candById(m.pick)}/>}
      </div>
    </div>
  );
}

function PickCard({ cand }){
  return (
    <div className="pickcard">
      <div className="pc-eyebrow">약속 장소 확정</div>
      <div className="pc-name">{cand.name}</div>
      <div className="pc-row">
        <div className="pc-pill"><div className="l">나 · 목동역</div><div className="v">{fmtMin(cand.me.mins)}</div></div>
        <div className="pc-pill"><div className="l">친구 · 천호역</div><div className="v">{fmtMin(cand.friend.mins)}</div></div>
      </div>
    </div>
  );
}

function App(){
  const [phase, setPhase] = useState(DEMO ? 'results' : 'intro');        // intro | thinking | results
  const [messages, setMessages] = useState(DEMO ? [
    { id:nextId(), role:'ai', text:'안녕하세요! 두 분의 출발지와 약속 목적을 알려 주시면, 실제 지도 위에서 중간 지점 후보를 비교해 드릴게요.' },
    { id:nextId(), role:'user', text:PREFILL },
    { id:nextId(), role:'ai', text:'요청을 이렇게 정리했어요.', node:'parsed' },
    { id:nextId(), role:'ai', text:'목동·천호의 한가운데를 기준으로 해돋이 명소 3곳을 지도에 표시했어요. 후보 카드를 누르면 두 사람의 이동 경로를 함께 볼 수 있어요.' },
  ] : [
    { id:nextId(), role:'ai', text:'안녕하세요! 두 분의 출발지와 약속 목적을 알려 주시면, 실제 지도 위에서 중간 지점 후보를 비교해 드릴게요.' },
  ]);
  const [typing, setTyping] = useState(false);
  const [input, setInput] = useState(DEMO ? '' : PREFILL);
  const [criterion, setCriterion] = useState('ai');
  const [selectedId, setSelectedId] = useState(DEMO==='detail' ? 'eungbong' : null);
  const [leg, setLeg] = useState(DEMO==='me' ? 'me' : 'all');
  const [chosenId, setChosenId] = useState(null);
  const [toast, setToast] = useState(null);

  const threadRef = useRef(null);
  const taRef = useRef(null);
  const toastTimer = useRef(null);

  const order = ORDERS[criterion];
  const ready = phase === 'results';

  useEffect(()=>{
    if(threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight;
  }, [messages, typing]);

  function showToast(txt){
    setToast(txt);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(()=>setToast(null), 2600);
  }
  function pushMsg(m){ setMessages(prev=>[...prev, { id:nextId(), ...m }]); }

  function autosize(){
    const ta = taRef.current; if(!ta) return;
    ta.style.height='auto'; ta.style.height = Math.min(ta.scrollHeight,120)+'px';
  }
  useEffect(autosize, []);


  function handleSend(){
    if(phase!=='intro' || !input.trim()) return;
    pushMsg({ role:'user', text:input.trim() });
    setInput('');
    setPhase('thinking');
    setTyping(true);
    setTimeout(()=>{
      pushMsg({ role:'ai', text:'요청을 이렇게 정리했어요. 잠시만요, 지도에서 중간 지점을 찾고 있어요…', node:'parsed' });
    }, 700);
    setTimeout(()=>{
      setTyping(false);
      setPhase('results');
      pushMsg({ role:'ai', text:'목동·천호의 한가운데를 기준으로 해돋이 명소 3곳을 지도에 표시했어요. 후보 카드를 누르면 두 사람의 이동 경로를 함께 볼 수 있어요.' });
      showToast('추천 후보 3곳을 지도에 표시했어요');
    }, 2100);
  }

  function handleCriterion(key){
    if(key===criterion) return;
    setCriterion(key);
    const c = CRITERIA.find(x=>x.key===key);
    showToast('‘'+c.label+'’ 기준으로 재정렬했어요');
    if(ready) pushMsg({ role:'ai', text:'‘'+c.label+'’ 기준으로 후보 순서를 다시 정렬했어요. '+c.note });
  }

  function handleSelect(id){
    setSelectedId(id);
    setLeg('all');
  }
  function handleBack(){
    setSelectedId(null);
    setLeg('all');
  }
  function handleReset(){
    setChosenId(null);
    setSelectedId(null);
    setLeg('all');
  }
  function handleChoose(id){
    setChosenId(id);
    const c = candById(id);
    pushMsg({ role:'ai', text:c.name+'(으)로 약속 장소를 정했어요! 두 분 모두 즐거운 해돋이 되시길 바라요.', node:'pick', pick:id });
    showToast(c.name+'(으)로 정했어요');
  }

  const activeId = chosenId || selectedId;
  const activeCand = activeId ? candById(activeId) : null;
  const detailOpen = !!activeId;

  return (
    <div className="app">
      {/* ===== chat ===== */}
      <div className="chat">
        <Brand/>
        <div className="thread" ref={threadRef}>
          {messages.map(m=> <Message key={m.id} m={m}/> )}
          {typing && (
            <div className="msg ai">
              <div className="avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>
              </div>
              <div className="bubble" style={{padding:0}}><div className="typing"><span></span><span></span><span></span></div></div>
            </div>
          )}
        </div>
        <div className="composer">
          <div className="composer-box">
            <textarea ref={taRef} className="composer-input" rows="1" value={input}
              placeholder={phase==='intro' ? '출발지 두 곳과 약속 목적을 알려 주세요' : '약속 장소를 정했어요'}
              disabled={phase!=='intro'}
              onChange={e=>{ setInput(e.target.value); autosize(); }}
              onKeyDown={e=>{ if(e.key==='Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); } }}/>
            <button className="send-btn" disabled={phase!=='intro' || !input.trim()} onClick={handleSend}><Ic.send/></button>
          </div>
          <div className="composer-hint">
            {phase==='intro' ? 'Enter 로 전송 · 두 출발지의 중간 지점을 지도에서 비교해요'
              : phase==='thinking' ? 'AI가 중간 지점을 분석하고 있어요…'
              : '오른쪽 지도에서 후보를 비교하고 장소를 정해 보세요'}
          </div>
        </div>
      </div>

      {/* ===== canvas ===== */}
      <div className={'canvas'+(ready?' ready':'')}>
        <CanvasTop criterion={criterion} onCriterion={handleCriterion}/>

        <div className="map-wrap">
          <MapView ready={ready} order={order} selectedId={selectedId} leg={leg} chosenId={chosenId}/>

          <div className={'map-legend'+(ready?' show':'')}>
            <div className="leg-item"><span className="leg-swatch" style={{background:'var(--travel-blue)'}}></span>나 · 목동 출발</div>
            <div className="leg-item"><span className="leg-swatch" style={{background:'var(--friend)'}}></span>친구 · 천호 출발</div>
          </div>

          <div className={'toast'+(toast?' show':'')}><Ic.check style={{width:14,height:14}}/>{toast}</div>

          {ready && (
            <div className="sheet">
              {detailOpen ? (
                <div className="sheet-body" key="detail">
                  <Detail cand={activeCand} order={order} leg={leg} setLeg={setLeg}
                    chosen={!!chosenId} onBack={handleBack} onReset={handleReset} onChoose={()=>handleChoose(activeCand.id)}/>
                </div>
              ) : (
                <div className="sheet-body" key="cards">
                  <div className="panel-head">
                    <div className="panel-title">추천 후보<span className="count">3곳</span></div>
                    <div className="sort-note">{CRITERIA.find(c=>c.key===criterion).label} 순 · 카드를 눌러 경로 비교</div>
                  </div>
                  <div className="cards" key={criterion}>
                    {order.map((id,i)=>(
                      <CandidateCard key={id} cand={candById(id)} rank={i}
                        selected={false} onSelect={()=>handleSelect(id)}/>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* empty overlay */}
        <div className="canvas-empty" style={{opacity:ready?0:1, pointerEvents:ready?'none':'auto'}}>
          <div className="ce-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--travel-blue)" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{width:28,height:28}}><path d="M9 19l-5.5 2.5V6.5L9 4m0 15 6-2.5M9 19V4m6 12.5L20.5 19V4l-5.5 2.5m0 10V6.5m0 0L9 4"/><circle cx="15" cy="9" r="1"/></svg>
          </div>
          <div>
            <div className="ce-title">대화를 시작하면 여기에 지도가 나타나요</div>
            <div className="ce-sub" style={{marginTop:6}}>왼쪽 입력창의 메시지를 보내 보세요. 두 출발지의 중간 지점 후보가 실제 지도 위에 표시됩니다.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ cand, order, leg, setLeg, chosen, onBack, onReset, onChoose }){
  const rank = order.indexOf(cand.id);
  return (
    <div className="detail">
      <div className="detail-head">
        {chosen
          ? <button className="back-btn" onClick={onReset}><Ic.chevL style={{width:15,height:15}}/>다시 고르기</button>
          : <button className="back-btn" onClick={onBack}><Ic.chevL style={{width:15,height:15}}/>후보 목록</button>}
        <span className="rank-badge" style={{width:22,height:22}}>{rank+1}</span>
        <span className="detail-name">{cand.name}</span>
        <span style={{fontSize:12,color:'var(--gray)'}}>{cand.area}</span>
      </div>
      <div className="detail-body">
        <div className="detail-left">
          <div className="leg-tabs">
            {[['all','전체'],['me','나'],['friend','친구']].map(([k,lab])=>(
              <button key={k} data-leg={k} className={'leg-tab'+(leg===k?' active':'')} onClick={()=>setLeg(k)}>{lab}</button>
            ))}
          </div>
          <CompareCard cand={cand}/>
          <button className={'primary-btn'+(chosen?' chosen':'')} onClick={chosen?undefined:onChoose}>
            {chosen ? <><Ic.check style={{width:16,height:16}}/>정해진 장소예요</> : <>이 장소로 정하기 <Ic.arrowR style={{width:15,height:15}}/></>}
          </button>
        </div>
        <div style={{flex:1,minWidth:0,display:'flex',flexDirection:'column'}}>
          {leg==='all'
            ? <AllHint cand={cand} setLeg={setLeg}/>
            : <StepList key={cand.id+leg} steps={leg==='me'?cand.me.steps:cand.friend.steps} accent={leg}/>}
        </div>
      </div>
    </div>
  );
}

function AllHint({ cand, setLeg }){
  return (
    <div className="steps" style={{display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center',gap:14,textAlign:'center'}}>
      <div style={{width:46,height:46,borderRadius:14,background:'var(--light-blue)',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <Ic.sun style={{width:24,height:24,color:'var(--travel-blue)'}}/>
      </div>
      <div style={{fontSize:13,fontWeight:600,color:'var(--dark-gray)',maxWidth:280,lineHeight:1.6,wordBreak:'keep-all'}}>
        지도 위에서 두 사람이 어느 방향에서 모이는지 한눈에 비교해 보세요.
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
        <button className="crit-btn" onClick={()=>setLeg('me')} style={{borderColor:'var(--travel-blue)',color:'var(--travel-blue)'}}>나의 상세 경로</button>
        <button className="crit-btn" onClick={()=>setLeg('friend')} style={{borderColor:'var(--friend)',color:'var(--friend-d)'}}>친구의 상세 경로</button>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
