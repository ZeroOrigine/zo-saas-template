import Link from 'next/link';
import Card from '@/components/ui/Card';

export default function HomePage() {
  const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME ?? 'ZeroOrigine';

  const features = [
    {
      title: 'Authentication',
      description:
        'Email/password auth with Supabase. Session management, protected routes, and user profiles out of the box.',
    },
    {
      title: 'Payments',
      description:
        'Stripe integration with checkout, subscriptions, billing portal, and webhook handling. Start collecting revenue on day one.',
    },
    {
      title: 'Dashboard',
      description:
        'A clean, responsive dashboard ready for your core features. Built with Tailwind CSS for rapid customization.',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
          Build with {projectName}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
          The complete SaaS starter template. Authentication, payments,
          dashboard, and feedback — everything you need to launch faster.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/auth/signup"
            className="rounded-md bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Get Started Free
          </Link>
          <Link
            href="/pricing"
            className="rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-bold text-gray-900">
          Everything you need to launch
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-gray-600">
          Stop rebuilding the same infrastructure. Focus on what makes your
          product unique.
        </p>

        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card
              key={feature.title}
              title={feature.title}
              description={feature.description}
            >
              <div />
            </Card>
          ))}
        </div>
      </section>

      {/* Social proof placeholder */}
      <section className="border-y border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <p className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Trusted by builders worldwide
          </p>
          <div className="mt-8 flex items-center justify-center gap-12 opacity-40">
            <span className="text-2xl font-bold text-gray-400">Company A</span>
            <span className="text-2xl font-bold text-gray-400">Company B</span>
            <span className="text-2xl font-bold text-gray-400">Company C</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900">
          Ready to build with {projectName}?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-gray-600">
          Start for free. Upgrade when you need to. No credit card required.
        </p>
        <div className="mt-8">
          <Link
            href="/auth/signup"
            className="rounded-md bg-black px-8 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            Create Your Account
          </Link>
        </div>
      </section>
    </div>
  );
}
