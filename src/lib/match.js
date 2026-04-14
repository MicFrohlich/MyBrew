const SLIDER_MAP = {
  casual:    { sweet: 'sweetness', strength: 'intensity', milk: 'body' },
  exploring: { acidity: 'acidity', body: 'body', roast: 'intensity' },
  expert:    { acidity: 'acidity', body: 'body' }
};

function sliderComponent(level, sliders, bean) {
  const map = SLIDER_MAP[level] || {};
  const keys = Object.keys(map).filter(k => sliders[k] !== undefined);
  if (keys.length === 0) return null;
  let total = 0;
  for (const k of keys) {
    const prefTen = sliders[k] / 10;
    const beanVal = bean[map[k]] ?? 5;
    const diff = Math.abs(prefTen - beanVal);
    total += Math.max(0, 1 - diff / 10);
  }
  return total / keys.length;
}

function flavorComponent(flavors, bean) {
  if (!flavors?.length || !bean.flavors?.length) return null;
  const norm = s => s.toLowerCase();
  const userSet = flavors.map(norm);
  const beanSet = bean.flavors.map(norm);
  const overlap = userSet.filter(u => beanSet.some(b => b.includes(u) || u.includes(b))).length;
  return Math.min(overlap / Math.max(userSet.length, 1), 1);
}

export function matchScore(tasteProfile, bean) {
  if (!tasteProfile || !bean) return 75;
  const parts = [];
  const slider = sliderComponent(tasteProfile.level, tasteProfile.sliders || {}, bean);
  if (slider !== null) parts.push(slider);
  const flavor = flavorComponent(tasteProfile.flavors, bean);
  if (flavor !== null) parts.push(flavor);
  if (parts.length === 0) return 75;
  const avg = parts.reduce((a, b) => a + b, 0) / parts.length;
  return Math.round(avg * 100);
}
