import type { Metadata } from "next";
import { Inter, Playfair_Display, Abril_Fatface } from "next/font/google";
import "./globals.css";
import { ReactNode } from "react";
import Header from "@/components/Header";
import { CartProvider } from "./contexts/CartContext";
import ReactQueryProvider from "./providers/ReactQueryProvider";
import { Toaster } from 'react-hot-toast';
import { EnhancedErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ui/Toast";
import { PWAInstallBanner } from "./components/PWAInstallBanner";
import { Analytics } from "./components/Analytics";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const abril = Abril_Fatface({
  variable: "--font-abril",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: {
    default: "CardioLive - Kaliteli Kardiyoloji Ürünleri",
    template: "%s | CardioLive"
  },
  description: "Kardiyoloji alanında en kaliteli ürünler ve profesyonel hizmetler. Stethoskop, tansiyon aleti, EKG cihazları ve daha fazlası.",
  keywords: ["kardiyoloji", "stethoskop", "tansiyon aleti", "EKG", "medical equipment"],
  authors: [{ name: "CardioLive" }],
  creator: "CardioLive",
  publisher: "CardioLive",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://cardiolive.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "CardioLive - Kaliteli Kardiyoloji Ürünleri",
    description: "Kardiyoloji alanında en kaliteli ürünler ve profesyonel hizmetler",
    url: "https://cardiolive.com",
    siteName: "CardioLive",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CardioLive - Kaliteli Kardiyoloji Ürünleri"
      }
    ],
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CardioLive - Kaliteli Kardiyoloji Ürünleri",
    description: "Kardiyoloji alanında en kaliteli ürünler ve profesyonel hizmetler",
    images: ["/og-image.jpg"],
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "CardioLive",
  },
  verification: {
    google: "your-google-verification-code",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${inter.variable} ${playfair.variable} ${abril.variable}`}>
      <head>
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Analytics />
        <EnhancedErrorBoundary>
          <ReactQueryProvider>
            <CartProvider>
              <ToastProvider>
                <Header />
                <PWAInstallBanner />
                <main>{children}</main>
                <Toaster 
                  position="top-right"
                  toastOptions={{
                    duration: 4000,
                    style: {
                      background: '#fff',
                      color: '#333',
                    },
                    success: {
                      style: {
                        background: '#10b981',
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
              </ToastProvider>
            </CartProvider>
          </ReactQueryProvider>
        </EnhancedErrorBoundary>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
