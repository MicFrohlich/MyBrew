import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useCafes } from '../../hooks/useCafes.js';
import { useTranslation } from 'react-i18next';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function MapView() {
  const { cafes, loading } = useCafes();
  const { t } = useTranslation();
  if (loading) return <div style={{ padding: 24 }}>{t('common.loading')}</div>;
  const first = cafes.find(c => c.lat && c.lng);
  const center = first ? [Number(first.lat), Number(first.lng)] : [-26.2, 28.04];

  return (
    <div style={{ height: 'calc(100vh - 72px)' }}>
      <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {cafes.filter(c => c.lat && c.lng).map(c => (
          <Marker key={c.id} position={[Number(c.lat), Number(c.lng)]}>
            <Popup>
              <strong>{c.name}</strong><br/>
              <span style={{ fontSize: 12 }}>{c.addr}</span>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
