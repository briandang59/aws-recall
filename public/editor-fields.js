import {SERVICE_GROUPS,getService,searchServices,TAG_GROUPS,MAX_TAGS,tagLabel,suggestedTags} from './shared/catalog.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g,c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export function serviceOptions(selected = '') {
  return SERVICE_GROUPS.map(group => `<optgroup label="${esc(group.label)}">${group.items.map(([id,label]) => `<option value="${esc(id)}"${selected === id ? ' selected' : ''}>${esc(id === label ? id : `${id} · ${label}`)}</option>`).join('')}</optgroup>`).join('');
}
export function serviceResults(selected,query = '') {
  const matches = searchServices(query), ids = new Set(matches.map(s => s.id));
  return `<p class="service-results-count" role="status">${matches.length} dịch vụ / chủ đề</p><div role="listbox" aria-label="Dịch vụ AWS" id="service-options">${matches.length ? SERVICE_GROUPS.map(group => {
    const items = group.items.filter(([id]) => ids.has(id));
    return items.length ? `<div class="service-option-group" role="group" aria-label="${esc(group.label)}"><p>${esc(group.label)}</p>${items.map(([id,label]) => `<button type="button" role="option" aria-selected="${id === selected}" class="service-option${id === selected ? ' selected' : ''}" data-action="select-service" data-service="${esc(id)}"><span><strong>${esc(id)}</strong><small>${esc(label)}</small></span><span aria-hidden="true">${id === selected ? '✓' : ''}</span></button>`).join('')}</div>` : '';
  }).join('') : '<p class="service-no-results">Chưa tìm thấy. Thử tên viết tắt như ALB, DNS, SSM hoặc chọn “Dịch vụ / chủ đề khác”.</p>'}</div>`;
}
export function serviceField(selected) {
  const current = getService(selected);
  return `<div class="form-field service-picker"><span id="service-field-label">Dịch vụ / chủ đề AWS <small>Có tìm kiếm</small></span><input type="hidden" name="service" value="${esc(selected)}"><button type="button" id="service-trigger" class="service-trigger" data-action="service-picker" aria-labelledby="service-field-label service-selected-label" aria-expanded="false" aria-controls="service-panel"><span id="service-selected-label">${esc(selected)}</span><span aria-hidden="true">⌄</span></button><small class="service-selection-group" id="service-selection-group">${esc(current?.groupLabel || '')}</small><div id="service-panel" class="service-panel" hidden><input type="search" id="service-search" placeholder="Tìm EC2, ALB, DNS, lưu trữ…" aria-label="Tìm dịch vụ AWS" autocomplete="off" maxlength="100"><div id="service-results">${serviceResults(selected)}</div></div></div>`;
}
function choice(tag,label,selected) {
  const active = selected.some(t => t.toLowerCase() === tag.toLowerCase());
  return `<button type="button" class="tag-choice${active ? ' is-selected' : ''}" data-action="toggle-tag" data-tag="${esc(tag)}" aria-pressed="${active}"${!active && selected.length >= MAX_TAGS ? ' disabled' : ''}><span aria-hidden="true">${active ? '✓' : '+'}</span> ${esc(label)}</button>`;
}
export function tagChoices(tags,service) {
  const groups = TAG_GROUPS.filter(g => ['exam','domains','study'].includes(g.id));
  const suggestions = suggestedTags(service);
  return `<div class="selected-tags" aria-label="Nhãn đã chọn">${tags.length ? tags.map(tag => `<button type="button" class="selected-tag" data-action="toggle-tag" data-tag="${esc(tag)}" aria-label="Bỏ nhãn ${esc(tagLabel(tag))}">${esc(tagLabel(tag))}<span aria-hidden="true">×</span></button>`).join('') : '<span class="tag-empty">Chọn nhãn bên dưới hoặc nhập nhãn riêng.</span>'}</div>${groups.map(g => `<div class="tag-preset-group"><p>${esc(g.label)}</p><div class="tag-choices">${g.tags.map(([tag,label]) => choice(tag,label,tags)).join('')}</div></div>`).join('')}${suggestions.length ? `<div class="tag-preset-group"><p>Gợi ý cho ${esc(service)}</p><div class="tag-choices">${suggestions.map(tag => choice(tag,tagLabel(tag),tags)).join('')}</div></div>` : ''}<details id="more-tags" class="more-tags"><summary>Thêm nhãn chủ đề kỹ thuật</summary><div class="tag-choices">${TAG_GROUPS.find(g => g.id === 'topics').tags.map(([tag,label]) => choice(tag,label,tags)).join('')}</div></details>`;
}
export function tagsField(tags,service) {
  return `<section class="tags-picker" aria-labelledby="tags-field-label"><div class="tags-picker-heading"><span id="tags-field-label">Nhãn học tập</span><small id="tag-count" aria-live="polite">${tags.length}/${MAX_TAGS} nhãn</small></div><div id="tag-presets">${tagChoices(tags,service)}</div><label class="form-field custom-tags-field"><span>Nhập hoặc sửa nhãn riêng <small>Ngăn cách bằng dấu phẩy</small></span><input id="tags-input" name="tags" value="${esc(tags.join(', '))}" placeholder="Ví dụ: đề-thi-thử-1, cần-xem-lại" maxlength="400" autocomplete="off"></label></section>`;
}
