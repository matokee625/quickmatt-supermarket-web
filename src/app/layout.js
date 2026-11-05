import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { BranchProvider } from '@/context/BranchContext';
import { OrderProvider } from '@/context/OrderContext';
import { ToastProvider } from '@/context/ToastContext';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://quickmatt-supermarket-web.vercel.app'),
  title: {
    default: 'Reubenquickmatt supermarket | Fresh & Easy Online Shopping & Fast Delivery',
    template: '%s | Reubenquickmatt supermarket',
  },
  description:
    'Reubenquickmatt supermarket Kenya. Shop fresh groceries, butchery, bakery, dairy, and household essentials online with Lipa na M-Pesa.',
  keywords: [
    'Reubenquickmatt supermarket',
    'Reubenquickmatt',
    'Reuben quickmatt supermarket',
    'Reuben quickmart',
    'Quickmart',
    'online grocery Kenya',
    'supermarket delivery Kenya',
  ],
  authors: [{ name: 'Reubenquickmatt supermarket' }],
  creator: 'Reubenquickmatt supermarket',
  publisher: 'Reubenquickmatt supermarket',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    url: 'https://quickmart.co.ke',
    siteName: 'Quickmart Supermarket Kenya',
    title: 'Quickmart Supermarket Kenya | Fresh & Easy Online Groceries',
    description:
      'Order fresh groceries, bakery deli items, butchery cuts, and household essentials online with 45-min delivery across Nairobi & Kenya.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Quickmart Supermarket Kenya Aisles and Fresh Groceries',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quickmart Supermarket Kenya | Fresh & Easy',
    description: 'Fast 45-minute supermarket grocery delivery in Nairobi & Kenya.',
    creator: '@QuickmartKenya',
    images: ['https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop'],
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

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'GroceryStore',
  name: 'Quickmart Supermarket Kenya',
  image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1200&auto=format&fit=crop',
  '@id': 'https://quickmart.co.ke',
  url: 'https://quickmart.co.ke',
  telephone: '+254 709 123 000',
  priceRange: 'KSh',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Argwings Kodhek Road, Kilimani',
    addressLocality: 'Nairobi',
    addressRegion: 'Nairobi County',
    postalCode: '00100',
    addressCountry: 'KE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -1.2921,
    longitude: 36.8219,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '06:00',
      closes: '23:00',
    },
  ],
  paymentAccepted: ['Cash', 'M-Pesa', 'Credit Card', 'Debit Card'],
  currenciesAccepted: 'KES',
  hasMerchantReturnPolicy: {
    '@type': 'MerchantReturnPolicy',
    returnPolicyCategory: 'https://schema.org/RefundTypeRefund',
    merchantReturnDays: 7,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-[#F2F2F2] text-gray-900 selection:bg-[#E31E24] selection:text-white`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <ToastProvider>
          <AuthProvider>
            <BranchProvider>
              <CartProvider>
                <OrderProvider>
                  <div className="flex flex-col min-h-screen">
                    <Navbar />
                    <main className="flex-1">{children}</main>
                    <Footer />
                  </div>
                </OrderProvider>
              </CartProvider>
            </BranchProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
