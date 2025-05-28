export default function Home() {
  return (
    <section
      style={{
        minHeight: "600px",
        background: "var(--color-background)",
      }}
      className="w-full relative overflow-hidden flex items-center justify-center py-8"
    >
      {/* Başlık: Tek satır, optik olarak tamamen eşit ve hizalı */}
      <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
        <div style={{ display: 'inline-flex', alignItems: 'baseline', whiteSpace: 'nowrap', height: '100px' }}>
          <span
            style={{
              fontFamily: 'var(--font-abril)',
              color: 'var(--color-white)',
              fontWeight: 700,
              fontSize: '100px',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            Discover
          </span>
          <svg
            viewBox="0 0 800 110"
            width="auto"
            height="100px"
            style={{ display: 'inline-block', verticalAlign: 'baseline', margin: '0 0.13em' }}
          >
            <text
              x="0"
              y="92"
              fontFamily="Abril Fatface, serif"
              fontSize="100"
              stroke="white"
              strokeWidth="2"
              fill="transparent"
              fontWeight="700"
              alignmentBaseline="baseline"
              dominantBaseline="baseline"
            >
              The Purity
            </text>
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-abril)',
              color: 'var(--color-white)',
              fontWeight: 700,
              fontSize: '100px',
              lineHeight: 1,
              display: 'inline-block',
            }}
          >
            Of Nature
          </span>
        </div>
      </div>

      {/* Sol altta açıklama ve buton */}
      <div className="absolute left-16 bottom-20 z-30 max-w-xs md:max-w-md sm:static sm:mt-8 sm:left-0 sm:bottom-0">
        <p className="text-[var(--color-foreground)] mb-8 text-base md:text-lg">
          Discover olive oil products crafted with care and nature's purity. Elevate your daily rituals with selections that nourish, protect, and celebrate the essence of real, natural living.
        </p>
        <button
          className="bg-[var(--color-primaryButton)] text-white font-semibold px-8 py-3 rounded-md shadow hover:bg-lime-600 transition w-fit"
        >
          Shop Now
        </button>
      </div>

      {/* Ortada: Oval Çerçeveli Görsel */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="w-[420px] h-[500px] rounded-[50%/45%] border-4 border-[#dbe6c4] overflow-hidden flex items-center justify-center bg-[#dbe6c4] shadow-lg md:w-[320px] md:h-[380px] sm:w-[220px] sm:h-[240px]">
          <img
            src="/olive-bottles.jpg"
            alt="Zeytinyağı Şişeleri"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Sağda: Kemerli Çerçeveli Görsel */}
      <div className="absolute right-24 top-1/2 -translate-y-1/2 z-10 md:right-4 sm:static sm:mt-8">
        <div className="w-[260px] h-[360px] rounded-t-[130px] rounded-b-[50px] border-4 border-[#dbe6c4] overflow-hidden flex items-center justify-center bg-[#dbe6c4] shadow-lg md:w-[180px] md:h-[240px] sm:w-[120px] sm:h-[160px]">
          <img
            src="/olive-hand.jpg"
            alt="Zeytin Dalı"
            className="object-cover w-full h-full"
          />
        </div>
      </div>

      {/* Responsive için mobilde elemanları alt alta diz */}
      <style>{`
        @media (max-width: 900px) {
          h1 { font-size: 2.2rem !important; }
        }
        @media (max-width: 640px) {
          section { flex-direction: column !important; }
          h1 { position: static !important; transform: none !important; text-align: center !important; font-size: 1.5rem !important; margin-bottom: 1rem; }
        }
      `}</style>
    </section>
  );
} 