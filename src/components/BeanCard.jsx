import MatchBadge from './MatchBadge.jsx';
import { matchScore } from '../lib/match.js';

export default function BeanCard({ bean, tasteProfile }) {
  const score = tasteProfile ? matchScore(tasteProfile, bean) : null;
  return (
    <div className="cafe-card">
      <div className="cc-top">
        <div>
          <div className="cc-name">{bean.name}</div>
          <div className="cc-area">{bean.roasteries?.name} · {bean.origin} · {bean.process}</div>
        </div>
        {score !== null && <MatchBadge pct={score} />}
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
        {(bean.flavors || []).join(' · ')}
      </div>
      <div style={{ fontSize: 12, color: 'var(--amber)', marginTop: 6, fontWeight: 600 }}>{bean.price}</div>
    </div>
  );
}
