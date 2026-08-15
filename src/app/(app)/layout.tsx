import Header from '@/components/Header';
import Footer from '@/components/Footer';
import FeedbackWidget from '@/components/FeedbackWidget';
import ZoBeacon from '@/components/ZoBeacon';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#fff', color: '#111827' }}>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <FeedbackWidget />
      {/* THE SENSE ORGAN, law #116. It existed in this template and was
          imported by NOTHING, which is exactly why zo_product_metrics held zero
          rows and /purpose read every product `unmeasured`. A sense organ wired
          into nothing is not an instrument, it is a decoration. Rendered here so
          every product born from this template can prove it served a human,
          with no edit to purpose.py and no human touching a dict. */}
      <ZoBeacon />
    </div>
  );
}
