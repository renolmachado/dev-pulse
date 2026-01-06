import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'News Pulse - Your Daily News Feed';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `
              linear-gradient(rgba(138, 43, 226, 0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(138, 43, 226, 0.03) 1px, transparent 1px)
            `,
          backgroundSize: '60px 60px',
          display: 'flex',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138, 43, 226, 0.4) 0%, transparent 70%)',
          filter: 'blur(60px)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-150px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)',
          filter: 'blur(80px)',
          display: 'flex',
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          padding: '40px',
        }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100px',
            height: '100px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%)',
            marginBottom: '32px',
            boxShadow: '0 20px 60px rgba(139, 92, 246, 0.4)',
          }}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </svg>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
          }}>
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #ffffff 0%, #e2e8f0 50%, #cbd5e1 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              margin: 0,
              letterSpacing: '-2px',
              lineHeight: 1,
            }}>
            News Pulse
          </h1>

          <p
            style={{
              fontSize: '28px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              fontWeight: 400,
              letterSpacing: '0.5px',
            }}>
            Your Daily News Feed
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '16px',
            marginTop: '48px',
          }}>
          {['AI Summaries', 'Curated Content', 'Real-time Updates'].map((feature) => (
            <div
              key={feature}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                borderRadius: '999px',
                background: 'rgba(139, 92, 246, 0.15)',
                border: '1px solid rgba(139, 92, 246, 0.3)',
              }}>
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#a855f7',
                  display: 'flex',
                }}
              />
              <span
                style={{
                  fontSize: '18px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontWeight: 500,
                }}>
                {feature}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Accent Line */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, transparent 0%, #8b5cf6 50%, transparent 100%)',
          display: 'flex',
        }}
      />
    </div>,
    {
      ...size,
    }
  );
}
