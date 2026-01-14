import Link from 'next/link';
import { Activity, Zap, BarChart3, Code, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  const features = [
    {
      icon: Zap,
      title: 'API Testing',
      description:
        'Test your REST APIs with an intuitive interface. Configure methods, headers, and request bodies in seconds.',
    },
    {
      icon: Activity,
      title: 'Automated Monitoring',
      description:
        'Automatic health checks every minute. Get instant alerts when your APIs go down or slow down.',
    },
    {
      icon: BarChart3,
      title: 'Visual Dashboards',
      description:
        'Track response times, uptime percentages, and performance trends with clean, actionable charts.',
    },
    {
      icon: Code,
      title: 'Open-Source & Lightweight',
      description:
        'No bloat, no enterprise complexity. Just a simple, powerful tool built for developers.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Activity className="w-6 h-6 text-indigo-600" strokeWidth={2.5} />
              <span className="text-lg font-semibold text-gray-900">
                API Sentinel
              </span>
            </div>
            <Link
              href="/dashboard/api-management"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      {/* <section className="relative overflow-hidden min-h-screen px-8 flex items-center"> */}
      <section className="relative overflow-hidden min-h-screen px-8 flex items-center">
        {/* ===== BACKGROUND LAYER ===== */}
        <div className="absolute inset-0  overflow-hidden">
          <Image
            src="/hero-bg.jpeg"
            alt="Hero background"
            fill
            priority
            className="object-cover opacity-120"
          />

          {/* Gradient overlay (softens image) */}
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/70 via-white/70 to-purple-50/70" />

          {/* Organic blobs */}
          <div className="absolute -top-40 -left-40 w-[520px] h-[420px] bg-indigo-400/30 blur-[150px] rounded-[60%_40%_70%_30%]" />
          <div className="absolute top-1/4 -right-40 w-[480px] h-[380px] bg-purple-400/30 blur-[150px] rounded-[40%_60%_30%_70%]" />
          <div className="absolute bottom-[-200px] left-1/4 w-[520px] h-[420px] bg-sky-300/30 blur-[180px] rounded-[55%_45%_65%_35%]" />

          {/* Subtle grid */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,#e5e7eb_1px,transparent_0)] [background-size:24px_24px] opacity-20" />
        </div>




        {/* Floating UI Cards (Decorative) */}

        {/* <div className="absolute top-20 left-14 hidden lg:block w-72 p-4 glass bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-200">
          <div className="h-2 w-20 bg-indigo-300 rounded mb-3" />
          <div className="h-2 w-full bg-gray-200 rounded mb-2" />
          <div className="h-2 w-3/4 bg-gray-200 rounded" />
        </div>

        <div className="absolute bottom-24 right-16 hidden lg:block w-80 p-5 glass bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-200">
          <div className="h-24 bg-indigo-100 rounded-lg mb-3" />
          <div className="h-2 w-24 bg-purple-300 rounded" />
        </div>


        <div className="absolute top-[45%] left-24 hidden xl:block w-64 p-4 glass bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-3 h-3 bg-green-500 rounded-full" />
            <div className="h-2 w-24 bg-gray-300 rounded" />
          </div>
          <div className="h-2 w-full bg-gray-200 rounded mb-2" />
          <div className="h-2 w-3/4 bg-gray-200 rounded" />
        </div>

        <div className="absolute bottom-28 left-[20%] hidden xl:block w-72 p-4 glass bg-white/80 backdrop-blur-md rounded-xl shadow-xl border border-gray-200">
          <div className="space-y-2">
            <div className="h-2 w-full bg-gray-200 rounded" />
            <div className="h-2 w-5/6 bg-gray-200 rounded" />
            <div className="h-2 w-2/3 bg-gray-200 rounded" />
          </div>
        </div> */}

        {/* Hero Content */}
        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Monitor & Test APIs — Without the Bloat
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            A lightweight, beginner-friendly platform for testing, monitoring,
            and visualizing the health of your REST APIs. Track uptime, response
            times, and get instant alerts when things go wrong.
          </p>
          <Link
            href="/dashboard/api-management"
            className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section className="py-20 px-8 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 border border-gray-200 hover:border-indigo-200 hover:shadow-lg transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="py-12 px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity
                className="w-5 h-5 text-indigo-600"
                strokeWidth={2.5}
              />
              <span className="font-semibold text-gray-900">
                API Sentinel
              </span>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 API Sentinel. Open-source and lightweight.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
