import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const dynamic = 'force-static'

export const alt = 'EzStampify | スタンプ作りに最適な無料画像編集ツール'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  // フォントはデフォルトのsans-serifを使用
  
  return new ImageResponse(
    (
      <div
        style={{
          background: '#06C755', // Primary Green
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: '"M PLUS Rounded 1c", sans-serif', // フォントがロードされていない場合はsans-serifにフォールバック
        }}
      >
        {/* Decorative Grid Pattern Background */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.2) 2px, transparent 2px)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '60px 100px',
            borderRadius: '40px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
          }}
        >
          {/* Logo & Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '20px' }}>
            {/* Smile Icon (SVG) */}
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#06C755"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M8 14s1.5 2 4 2 4-2 4-2" />
              <line x1="9" y1="9" x2="9.01" y2="9" />
              <line x1="15" y1="9" x2="15.01" y2="9" />
            </svg>
            <h1
              style={{
                fontSize: 80,
                fontWeight: 900,
                margin: 0,
                color: '#333',
                letterSpacing: '-0.02em',
              }}
            >
              EzStampify
            </h1>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 32,
              margin: 0,
              color: '#555',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            スタンプ作りに最適な無料画像編集ツール
          </p>

          {/* Features Badges */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '40px' }}>
            <div style={{ background: '#06C755', color: 'white', padding: '10px 24px', borderRadius: '50px', fontSize: 24, fontWeight: 'bold' }}>登録不要</div>
            <div style={{ background: '#06C755', color: 'white', padding: '10px 24px', borderRadius: '50px', fontSize: 24, fontWeight: 'bold' }}>ずっと無料</div>
            <div style={{ background: '#06C755', color: 'white', padding: '10px 24px', borderRadius: '50px', fontSize: 24, fontWeight: 'bold' }}>スマホ対応</div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
