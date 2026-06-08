/* ===== 만날지도 — Leaflet MapView ===== */
const SEOUL_CENTER = [37.547, 127.01];

const PIN_SVG = {
  me:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.2"/><path d="M5.8 20a6.2 6.2 0 0 1 12.4 0"/></svg>',
  fr:'<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="2.8"/><path d="M2.8 20a6 6 0 0 1 12 0"/><path d="M16 5.4a2.8 2.8 0 0 1 0 5.2"/></svg>',
};

function originIcon(o){
  const cls = o.key==='me' ? 'me' : 'fr';
  return L.divIcon({
    className:'origin-divicon',
    html:`<div class="mk mk-origin"><div class="mk-pin ${cls}">${PIN_SVG[o.key]}<span>${o.who} · ${o.name}</span></div><div class="mk-tail ${cls}"></div></div>`,
    iconSize:[1,1], iconAnchor:[34,40],
  });
}
function candIcon(rank, state, firstDrop){
  const drop = firstDrop ? ' leaflet-marker-drop' : '';
  return L.divIcon({
    className:'cand-divicon'+drop,
    html:`<div class="mk-cand ${state}"><span>${rank+1}</span></div>`,
    iconSize:[30,30], iconAnchor:[15,27],
  });
}
function timeBadge(leg, mins){
  const cls = leg==='me' ? 'me' : 'fr';
  const h=Math.floor(mins/60), mm=mins%60, t = h>0?`${h}시간 ${mm}분`:`${mm}분`;
  return L.divIcon({
    className:'badge-divicon',
    html:`<div class="route-time-badge ${cls}">${cls==='me'?'나':'친구'} ${t}</div>`,
    iconSize:[1,1], iconAnchor:[34,12],
  });
}

function MapView({ ready, order, selectedId, leg, chosenId }){
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const originMkRef = useRef({});
  const candMkRef = useRef({});
  const routeLayerRef = useRef(null);
  const placedRef = useRef(false);
  const bottomPad = ()=> Math.min(300, (document.querySelector('.sheet')?.offsetHeight || 150) + 28);

  /* init */
  useEffect(()=>{
    if(mapRef.current || !elRef.current || !window.L) return;
    const map = L.map(elRef.current, {
      center:SEOUL_CENTER, zoom:12, zoomControl:false,
      attributionControl:false, zoomSnap:.25,
    });
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom:19, subdomains:'abcd',
    }).addTo(map);
    L.control.zoom({ position:'bottomright' }).addTo(map);
    L.control.attribution({ position:'bottomleft', prefix:false })
      .addAttribution('© OpenStreetMap · © CARTO').addTo(map);
    routeLayerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    setTimeout(()=>map.invalidateSize(), 60);
  }, []);

  /* place markers once ready */
  useEffect(()=>{
    const map = mapRef.current;
    if(!map || !ready || placedRef.current) return;
    placedRef.current = true;
    map.invalidateSize();
    // origins
    Object.values(ORIGINS).forEach(o=>{
      const m = L.marker(o.coords, { icon:originIcon(o), zIndexOffset:500 }).addTo(map);
      originMkRef.current[o.key] = m;
    });
    // candidates (in current order)
    order.forEach((id, i)=>{
      const c = candById(id);
      const m = L.marker(c.coords, { icon:candIcon(i,'',true), zIndexOffset:100 }).addTo(map);
      candMkRef.current[id] = m;
    });
    // initial fit to everything (after layout settles)
    const pts = [...Object.values(ORIGINS).map(o=>o.coords), ...CANDIDATES.map(c=>c.coords)];
    setTimeout(()=>{
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(pts), { paddingTopLeft:[70,64], paddingBottomRight:[70,bottomPad()], maxZoom:13.5, animate:true, duration:.8 });
    }, 140);
  }, [ready]);

  /* update candidate marker numbers / states */
  useEffect(()=>{
    if(!placedRef.current) return;
    order.forEach((id,i)=>{
      const m = candMkRef.current[id]; if(!m) return;
      let state = '';
      if(id===chosenId) state='chosen sel';
      else if(id===selectedId) state='sel';
      m.setIcon(candIcon(i, state, false));
      m.setZIndexOffset(id===selectedId||id===chosenId ? 400 : 100);
    });
  }, [order, selectedId, chosenId]);

  /* draw routes + fit on selection / leg change */
  useEffect(()=>{
    const map = mapRef.current;
    if(!map || !placedRef.current) return;
    const rl = routeLayerRef.current;
    rl.clearLayers();
    const activeId = chosenId || selectedId;
    if(!activeId){
      const pts = [...Object.values(ORIGINS).map(o=>o.coords), ...CANDIDATES.map(c=>c.coords)];
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(pts), { paddingTopLeft:[70,64], paddingBottomRight:[70,bottomPad()], maxZoom:13.5, animate:true });
      return;
    }
    const r = ROUTES[activeId];
    const c = candById(activeId);
    const showMe = leg==='all' || leg==='me';
    const showFr = leg==='all' || leg==='friend';
    const legs = [];
    if(showMe) legs.push({ key:'me', path:r.me, color:'#5D88FF', mins:c.me.mins });
    if(showFr) legs.push({ key:'fr', path:r.fr, color:'#FF8A5A', mins:leg==='friend'?c.friend.mins:c.friend.mins });

    const fitPts = [c.coords];
    legs.forEach((lg, idx)=>{
      // white casing underneath
      L.polyline(lg.path, { color:'#fff', weight:9, opacity:.95, lineCap:'round', lineJoin:'round' }).addTo(rl);
      const line = L.polyline(lg.path, { color:lg.color, weight:5, opacity:.95, lineCap:'round', lineJoin:'round', dashArray:'1,11' }).addTo(rl);
      // animate draw
      const path = line._path;
      if(path && path.getTotalLength){
        const len = path.getTotalLength();
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
        // force reflow then animate
        path.getBoundingClientRect();
        path.style.transition = `stroke-dashoffset 1.05s ${idx*0.12}s cubic-bezier(.4,0,.2,1)`;
        requestAnimationFrame(()=>{ path.style.strokeDashoffset = 0; });
      }
      // time badge at ~60% of path
      const mid = lg.path[Math.max(1, Math.round(lg.path.length*0.5))];
      L.marker(mid, { icon:timeBadge(lg.key==='me'?'me':'fr', lg.mins), interactive:false, zIndexOffset:300 }).addTo(rl);
      lg.path.forEach(p=>fitPts.push(p));
    });
    // include origins per leg
    if(showMe) fitPts.push(ORIGINS.me.coords);
    if(showFr) fitPts.push(ORIGINS.friend.coords);
    map.invalidateSize();
    map.fitBounds(L.latLngBounds(fitPts), { paddingTopLeft:[90,72], paddingBottomRight:[90,bottomPad()], maxZoom:14, animate:true, duration:.7 });
  }, [selectedId, leg, chosenId]);

  return <div id="map" ref={elRef}></div>;
}

window.MapView = MapView;
