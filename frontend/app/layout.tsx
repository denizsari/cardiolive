import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import ReactQueryProvider from './providers/ReactQueryProvider';
import { CartProvider } from './contexts/CartContext';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import { EnhancedErrorBoundary } from './components/ErrorBoundary';
import WhatsAppWidget from './components/WhatsAppWidget';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kardiyolive - Premium Zeytinyağı ve Doğal Ürünler',
  description: 'Ege\'nin en kaliteli zeytinlerinden elde edilen organik zeytinyağları ve doğal ürünler. Premium kalite, doğal lezzet.',
  keywords: 'zeytinyağı, organik, doğal, kardiyolive, zeytin, premium, kalite, sızma, soğuk sıkım',
  authors: [{ name: 'Kardiyolive' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Kardiyolive - Premium Zeytinyağı ve Doğal Ürünler',
    description: 'Ege\'nin en kaliteli zeytinlerinden elde edilen organik zeytinyağları ve doğal ürünler.',
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Kardiyolive',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kardiyolive - Premium Zeytinyağı',
    description: 'Ege\'nin en kaliteli zeytinlerinden elde edilen organik zeytinyağları.',
  },
  alternates: {
    canonical: 'https://kardiyolive.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* Ek Meta Etiketleri */}
        <meta name="theme-color" content="#70BB1B" />
        <meta name="msapplication-TileColor" content="#70BB1B" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kardiyolive" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.svg" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Preconnect for external resources */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* Critical CSS for above-the-fold content */}
        <style dangerouslySetInnerHTML={{
          __html: `
            .loading-placeholder {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `
        }} />
        
        {/* Google Analytics */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
          `}
        </Script>
      </head>
      <body className={`${inter.className} antialiased`}>
        <EnhancedErrorBoundary>
          <ReactQueryProvider>
            <CartProvider>
              <div className="min-h-screen bg-white">
                {children}
                <Toaster 
                  position="bottom-right"
                  toastOptions={{
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },
                    success: {
                      style: {
                        background: '#4ade80',
                        color: '#fff',
                      },
                    },
                    error: {
                      style: {
                        background: '#ef4444',
                        color: '#fff',
                      },
                    },
                  }}
                />
                
                {/* WhatsApp Widget - Global Floating */}
                <WhatsAppWidget
                  phoneNumber={process.env.NEXT_PUBLIC_WHATSAPP_NUMBER}
                  showPopup={true}
                  className="fixed bottom-6 right-6 z-50"
                />
              </div>
            </CartProvider>
          </ReactQueryProvider>
        </EnhancedErrorBoundary>
      </body>
    </html>
  );
}
