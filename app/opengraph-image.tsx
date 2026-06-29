import { ImageResponse } from 'next/og';

// Site-wide default share image (homepage + any route without its own).
// Listing pages override this with the car/part/workshop photo.
export const alt =
  'RecarGarage — o ecossistema automóvel que liga compradores, vendedores de peças, oficinas e mecânicos. Disponível na Web, Android e iOS.';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Literal hexes mirror the design tokens in src/index.css — Satori (next/og)
// can't resolve Tailwind classes, so the brand palette is inlined here.
const NAVY_800 = '#0c386b';
const NAVY_950 = '#081d38';
const ORANGE = '#ef7c2c';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: NAVY_950,
          backgroundImage: `linear-gradient(135deg, ${NAVY_800}, ${NAVY_950})`,
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 118, fontWeight: 800, letterSpacing: '-0.04em', color: '#ffffff' }}>
          <span>Recar</span>
          <span style={{ color: ORANGE }}>Garage</span>
        </div>
        <div
          style={{
            marginTop: 22,
            fontSize: 38,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.85)',
            textAlign: 'center',
            maxWidth: 940,
            lineHeight: 1.3,
          }}
        >
          O ecossistema automóvel que liga compradores, vendedores de peças, oficinas e mecânicos
        </div>
        <div
          style={{
            marginTop: 44,
            fontSize: 30,
            fontWeight: 700,
            color: ORANGE,
            border: `2px solid ${ORANGE}`,
            borderRadius: 999,
            padding: '12px 36px',
          }}
        >
          Disponível na Web · Android · iOS
        </div>
        <div style={{ marginTop: 22, fontSize: 24, fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>
          recargarage.com
        </div>
      </div>
    ),
    { ...size },
  );
}
