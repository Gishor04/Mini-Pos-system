import './globals.css';
import Navbar from '@/components/layout/navbar';

export const metadata = {
  title: 'Mini POS System',
  description: 'Practical, fast point of sale application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F6F8] text-slate-900 flex flex-col md:flex-row overflow-x-hidden font-sans">
        <Navbar />
        <main className="flex-1 w-full min-w-0">
          {children}
        </main>
      </body>
    </html>
  );
}
