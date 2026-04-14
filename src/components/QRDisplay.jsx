import { QRCodeSVG } from 'qrcode.react';

export default function QRDisplay({ value, size = 220 }) {
  return (
    <div style={{
      padding: 20, background: '#fff', borderRadius: 16,
      display: 'inline-block', margin: '0 auto'
    }}>
      <QRCodeSVG value={value} size={size} level="M" />
    </div>
  );
}
