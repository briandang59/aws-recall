import {services,categories} from './atlas-data.js';
import {connections,keywords,relationTypes} from './atlas-map-data.js';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const service=id=>services.find(s=>s.id===id);
const name=id=>service(id).name.replace(/Amazon |AWS /g,'');
const W=1640,H=1090,NODE_W=277,NODE_H=23;
const palette=['#d98a31','#419a7b','#9172dc','#548bd3','#cd7277','#b269ac','#42a1a5','#7a7fc1','#b79b44','#88939f'];
const positions=new Map();
categories.forEach((c,i)=>services.filter(s=>s.category===c[0]).forEach((s,j)=>positions.set(s.id,{x:34+(i%5)*325,y:150+Math.floor(i/5)*470+j*27,color:palette[i]})));
export function mapPage(){return `<div class="content-header"><p class="eyebrow">THE BIG PICTURE · SERVICE RELATIONSHIP MAP</p><h1>Bản đồ liên kết <em>AWS</em></h1><p class="subtitle">Toàn bộ ${services.length} mục kiến thức trong 10 nhóm. Chọn một dịch vụ để lần theo các kết nối và hiểu vai trò của từng mũi tên.</p></div><section class="map-panel" aria-label="Bản đồ tương tác"><div class="map-toolbar"><label>Dịch vụ đang khám phá<select id="map-service" aria-label="Chọn dịch vụ trên bản đồ">${services.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('')}</select></label><label>Loại kết nối<select id="map-type" aria-label="Lọc loại kết nối"><option value="all">Tất cả loại kết nối</option>${Object.entries(relationTypes).map(([id,t])=>`<option value="${id}">${esc(t.label)}</option>`).join('')}</select></label><div class="map-zoom"><button data-map-zoom="out" class="outline-button" aria-label="Thu nhỏ bản đồ">−</button><output id="map-zoom-value" aria-live="polite"></output><button data-map-zoom="in" class="outline-button" aria-label="Phóng to bản đồ">+</button><button data-map-zoom="fit" class="outline-button">Vừa khung</button></div><button id="map-download" class="outline-button">↓ Tải SVG</button></div><div class="map-switches"><label><input id="map-all" type="checkbox"> Hiện cả các kết nối khác</label><p>Chọn nút bằng chuột hoặc Tab + Enter. Phóng to rồi cuộn để đọc rõ từng nhóm.</p></div><div class="map-viewport" id="map-viewport" tabindex="0" aria-label="Vùng bản đồ có thể cuộn ngang và dọc"><div id="map-drawing"></div></div><div class="map-legend">${Object.entries(relationTypes).map(([id,t])=>`<span class="relation-${id}"><i></i>${esc(t.label)}</span>`).join('')}<span>→ Chiều quan hệ · đọc giải thích bên dưới</span></div></section><div id="map-explanation" aria-live="polite"></div><div class="learning-note"><span>ⓘ</span><p>Bản đồ do AWS Atlas tự vẽ, minh họa những cách kết hợp tiêu biểu; không phải danh sách đầy đủ mọi tích hợp hoặc mẫu triển khai. Mỗi kết nối có mô tả điều kiện và nguồn. <a href="#sources">Xem nguồn biểu tượng & sơ đồ ↗</a></p></div>`;}

export function mountMap(container,params){
 let selected=service(params.get('node'))?params.get('node'):'ec2',type='all',showAll=false,zoom=1;
 const viewport=container.querySelector('#map-viewport'),drawing=container.querySelector('#map-drawing');
 const select=container.querySelector('#map-service');select.value=selected;
 function relevant(){return connections.filter(c=>(c.from===selected||c.to===selected)&&(type==='all'||c.type===type));}
 function svg(){
  const active=relevant(),neighbors=new Set([selected,...active.flatMap(c=>[c.from,c.to])]);
  const visible=connections.filter(c=>(type==='all'||c.type===type)&&(showAll||active.includes(c)));
  const backgrounds=categories.map((c,i)=>{const x=20+(i%5)*325,y=102+Math.floor(i/5)*470;return `<g><rect class="map-group" x="${x}" y="${y}" width="305" height="450" rx="14"/><rect x="${x+14}" y="${y+15}" width="5" height="15" rx="2" fill="${palette[i]}"/><text class="map-group-title" x="${x+27}" y="${y+27}">${esc(c[2])}</text><text class="map-group-count" x="${x+285}" y="${y+27}" text-anchor="end">${services.filter(s=>s.category===c[0]).length}</text></g>`;}).join('');
  const edgeMarkup=visible.map(c=>{
   const a=positions.get(c.from),b=positions.get(c.to),forward=b.x>a.x;
   let x1=a.x+(forward?NODE_W:0),y1=a.y+NODE_H/2,x2=b.x+(forward?0:NODE_W),y2=b.y+NODE_H/2;
   let d;
   if(a.x===b.x){x1=a.x+NODE_W;x2=x1;const lane=x1+10;d=`M${x1} ${y1} C${lane+5} ${y1} ${lane+5} ${y2} ${x2} ${y2}`;}
   else{const bend=Math.max(25,Math.abs(x2-x1)*.4);d=`M${x1} ${y1} C${x1+(forward?bend:-bend)} ${y1} ${x2+(forward?-bend:bend)} ${y2} ${x2} ${y2}`;}
   const current=active.includes(c);
   return `<g class="map-link${current?' is-active':''}" data-from="${c.from}" data-to="${c.to}"><title>${esc(service(c.from).name)} → ${esc(service(c.to).name)}: ${esc(c.description)}</title><path d="${d}" stroke="${relationTypes[c.type].color}" marker-end="url(#map-arrow-${c.type})"/></g>`;
  }).join('');
  const nodes=services.map(s=>{const p=positions.get(s.id),on=s.id===selected,connected=neighbors.has(s.id);return `<g class="map-node${on?' is-selected':''}${connected?' is-connected':''}" data-map-node="${s.id}" role="button" tabindex="0" aria-label="Khám phá kết nối của ${esc(s.name)}" aria-pressed="${on}"><title>${esc(s.name)} · ${esc(keywords[s.id].join(', '))}</title><rect x="${p.x}" y="${p.y}" width="${NODE_W}" height="${NODE_H}" rx="5"/><circle cx="${p.x+11}" cy="${p.y+11.5}" r="3" fill="${p.color}"/><text x="${p.x+22}" y="${p.y+15}">${esc(name(s.id))}</text>${on?`<text class="map-selected-mark" x="${p.x+NODE_W-10}" y="${p.y+15}" text-anchor="end">●</text>`:''}</g>`;}).join('');
  return `<svg id="knowledge-map" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="Bản đồ 72 mục dịch vụ AWS, đang xem kết nối của ${esc(service(selected).name)}"><defs>${Object.entries(relationTypes).map(([id,t])=>`<marker id="map-arrow-${id}" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0L7 3.5L0 7" fill="${t.color}"/></marker>`).join('')}</defs><rect class="map-canvas" width="${W}" height="${H}"/><text class="map-title" x="24" y="36">AWS ATLAS · SAA-C03 SERVICE MAP</text><text class="map-subtitle" x="24" y="63">${esc(service(selected).name)} · ${active.length} kết nối đang chọn · Tự vẽ / conceptual map · 11/11/2026</text>${backgrounds}${edgeMarkup}${nodes}<text class="map-subtitle" x="24" y="1070">Mũi tên chỉ quan hệ theo chú giải: dữ liệu, sự kiện, điều phối, bảo mật, giám sát/chi phí. Không phải tất cả là đường mạng trực tiếp.</text></svg>`;
 }
 function explanation(){
  const s=service(selected),edges=relevant();
  container.querySelector('#map-explanation').innerHTML=`<section class="map-selection"><div><p class="eyebrow">ĐANG KHÁM PHÁ</p><h2>${esc(s.name)}</h2><p>${esc(s.summary)}</p><div class="keyword-list">${keywords[s.id].map(k=>`<span lang="en">${esc(k)}</span>`).join('')}</div></div><button class="primary-button" data-service="${s.id}">Định nghĩa & cách hoạt động ↗</button></section><div class="section-heading"><div><h2>${edges.length} kết nối liên quan</h2><p>Mũi tên theo chiều từ trái sang phải trong từng mục. Bấm tên dịch vụ để tiếp tục lần theo bản đồ.</p></div></div><div class="map-connections">${edges.map((c,i)=>`<article class="connection-card relation-${c.type}"><div class="connection-heading"><span class="connection-number">${i+1}</span><button data-map-node="${c.from}">${esc(service(c.from).name)}</button><span aria-label="kết nối tới">→</span><button data-map-node="${c.to}">${esc(service(c.to).name)}</button></div><small>${esc(relationTypes[c.type].label)} · <span lang="en">${esc(relationTypes[c.type].english)}</span></small><p>${esc(c.description)}</p><a href="${esc(c.source)}" target="_blank" rel="noopener noreferrer">Kiểm chứng tại tài liệu AWS ↗</a></article>`).join('')||'<p class="result-note">Không có quan hệ thuộc loại này trong bản đồ biên soạn. Chọn “Tất cả loại kết nối” để xem các quan hệ còn lại.</p>'}</div>`;
 }
 function scale(){drawing.style.width=`${W*zoom}px`;drawing.style.height=`${H*zoom}px`;const graphic=drawing.querySelector('svg');if(graphic){graphic.style.width=`${W*zoom}px`;graphic.style.height=`${H*zoom}px`;}container.querySelector('#map-zoom-value').textContent=`${Math.round(zoom*100)}%`;}
 function update(){drawing.innerHTML=svg();scale();explanation();}
 function choose(id,focus=false){if(!service(id))return;selected=id;select.value=id;const hash=new URLSearchParams();hash.set('node',id);history.replaceState(null,'',`#map?${hash}`);update();if(focus)drawing.querySelector(`[data-map-node="${id}"]`)?.focus({preventScroll:true});}
 container.addEventListener('click',e=>{
  const node=e.target.closest('[data-map-node]');if(node){choose(node.dataset.mapNode,node.tagName.toLowerCase()==='g');return;}
  const action=e.target.closest('[data-map-zoom]')?.dataset.mapZoom;
  if(action){zoom=action==='fit'?Math.min(1,Math.max(.2,(viewport.clientWidth-20)/W)):Math.min(1.8,Math.max(.2,zoom+(action==='in'?.15:-.15)));scale();if(action==='fit'){viewport.scrollLeft=0;viewport.scrollTop=0;}}
 });
 container.addEventListener('keydown',e=>{const node=e.target.closest('g[data-map-node]');if(node&&(e.key==='Enter'||e.key===' ')){e.preventDefault();choose(node.dataset.mapNode,true);}});
 select.addEventListener('change',()=>choose(select.value));
 container.querySelector('#map-type').addEventListener('change',e=>{type=e.target.value;update();});
 container.querySelector('#map-all').addEventListener('change',e=>{showAll=e.target.checked;update();});
 container.querySelector('#map-download').addEventListener('click',()=>{
  const clone=drawing.querySelector('svg').cloneNode(true);clone.removeAttribute('style');
  clone.querySelectorAll('[style]').forEach(e=>e.removeAttribute('style'));
  const dark=document.documentElement.dataset.theme==='dark';
  const styles=document.createElementNS('http://www.w3.org/2000/svg','style');
  styles.textContent=`text{font-family:Arial,sans-serif}.map-canvas{fill:${dark?'#121620':'#f7f8fc'}}.map-group{fill:${dark?'#1a2030':'#ffffff'};stroke:${dark?'#38435a':'#e4deee'}}.map-title{fill:${dark?'#d6c4fa':'#7356a5'};font-size:20px;font-weight:bold}.map-subtitle{fill:${dark?'#aeb9cb':'#6b7285'};font-size:12px}.map-group-title{fill:${dark?'#e2e7f2':'#374151'};font-size:14px;font-weight:bold}.map-group-count{fill:#8b819e;font-size:11px}.map-node rect{fill:${dark?'#232b3d':'#f7f6fb'};stroke:${dark?'#39445b':'#e5dfed'}}.map-node text{fill:${dark?'#c4ccdb':'#5b5370'};font-size:11px}.map-node.is-selected rect{fill:${dark?'#443465':'#e8dcfa'};stroke:#a078dd;stroke-width:2}.map-node.is-connected rect{stroke:#a48bcc}.map-link path{fill:none;stroke-width:1.5;opacity:.16}.map-link.is-active path{opacity:.9;stroke-width:2}.map-edge-number{font-size:8px;fill:white}`;
  clone.insertBefore(styles,clone.firstChild);
  const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=`aws-atlas-overview-${selected}-${dark?'dark':'light'}.svg`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 zoom=Math.min(1,Math.max(.2,(viewport.clientWidth-20)/W));update();
}
