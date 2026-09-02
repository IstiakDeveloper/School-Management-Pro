import { Head } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  Menu,
  X,
  BookOpen,
  Award,
  Users,
  Star,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Bell,
  Trophy,
  Globe,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Facebook,
  Youtube,
  Instagram,
  Clock,
  CheckCircle2,
  Leaf,
} from 'lucide-react';

export default function Welcome() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'প্রচ্ছদ', href: '#home' },
    { name: 'আমাদের সম্পর্কে', href: '#about' },
    { name: 'একাডেমিক', href: '#academic' },
    { name: 'নোটিশ', href: '#notice' },
    { name: 'গ্যালারি', href: '#gallery' },
    { name: 'যোগাযোগ', href: '#contact' },
  ];

  const features = [
    {
      icon: BookOpen,
      title: 'আধুনিক শিক্ষা',
      description: 'সর্বাধুনিক পাঠ্যক্রম ও শিক্ষা পদ্ধতি',
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      icon: Users,
      title: 'অভিজ্ঞ শিক্ষক',
      description: 'যোগ্য ও অভিজ্ঞ শিক্ষকমণ্ডলী',
      gradient: 'from-teal-500 to-cyan-500',
    },
    {
      icon: Trophy,
      title: 'সেরা ফলাফল',
      description: 'ধারাবাহিক সফলতার ঐতিহ্য',
      gradient: 'from-lime-500 to-green-500',
    },
    {
      icon: Globe,
      title: 'স্মার্ট ক্লাস',
      description: 'আধুনিক প্রযুক্তি সমৃদ্ধ শিক্ষা',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const programs = [
    { name: 'প্লে গ্রুপ', duration: '১ বছর', age: '৩-৪ বছর', icon: Sparkles },
    { name: 'নার্সারি', duration: '১ বছর', age: '৪-৫ বছর', icon: Star },
    { name: 'প্রথম শ্রেণি', duration: '১ বছর', age: '৫-৬ বছর', icon: BookOpen },
    { name: 'দ্বিতীয় শ্রেণি', duration: '১ বছর', age: '৬-৭ বছর', icon: GraduationCap },
    { name: 'তৃতীয় শ্রেণি', duration: '১ বছর', age: '৭-৮ বছর', icon: Award },
    { name: 'চতুর্থ শ্রেণি', duration: '১ বছর', age: '৮-৯ বছর', icon: Trophy },
    { name: 'পঞ্চম শ্রেণি', duration: '১ বছর', age: '৯-১০ বছর', icon: Leaf },
  ];

  const notices = [
    {
      title: 'বার্ষিক পরীক্ষার সময়সূচি প্রকাশ',
      date: '১৫ ডিসেম্বর, ২০২৫',
      type: 'পরীক্ষা',
      color: 'bg-red-500',
    },
    {
      title: 'নতুন ভর্তি চলছে ২০২৬ শিক্ষাবর্ষে',
      date: '১০ ডিসেম্বর, ২০২৫',
      type: 'ভর্তি',
      color: 'bg-emerald-500',
    },
    {
      title: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
      date: '০৫ ডিসেম্বর, ২০২৫',
      type: 'ইভেন্ট',
      color: 'bg-teal-500',
    },
    {
      title: 'অভিভাবক সভা আয়োজন',
      date: '০১ ডিসেম্বর, ২০২৫',
      type: 'সভা',
      color: 'bg-lime-500',
    },
  ];

  const achievements = [
    { count: '৫০০+', label: 'শিক্ষার্থী', icon: Users },
    { count: '৩০+', label: 'শিক্ষক', icon: GraduationCap },
    { count: '১৫+', label: 'বছরের অভিজ্ঞতা', icon: Award },
    { count: '৯৮%', label: 'পাশের হার', icon: Trophy },
  ];

  return (
    <>
      <Head title="মৌসুমী বিদ্যানিকেতন - উকিলপাড়া, নওগাঁ" />

      {/* Custom Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800;900&display=swap');

        .bengali-font {
          font-family: 'Hind Siliguri', sans-serif;
        }

        .heading-font {
          font-family: 'Playfair Display', serif;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white bengali-font">
        {/* Header */}
        <motion.header
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className={`fixed top-0 w-full z-50 transition-all duration-300 ${
            scrolled
              ? 'bg-slate-950/95 backdrop-blur-xl border-b border-emerald-500/20 shadow-2xl shadow-emerald-500/10'
              : 'bg-transparent'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="relative">
                  <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all overflow-hidden border border-emerald-500/20">
                    <img src="/logo.png" alt="মৌসুমী বিদ্যানিকেতন" className="w-full h-full object-contain" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity -z-10" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    মৌসুমী বিদ্যানিকেতন
                  </h1>
                  <p className="text-xs text-gray-400">উকিলপাড়া, নওগাঁ</p>
                </div>
              </motion.div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex gap-8">
                {navigation.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-sm font-medium hover:text-emerald-400 transition-colors relative group"
                  >
                    {item.name}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-full transition-all duration-300" />
                  </motion.a>
                ))}
              </nav>

              {/* Login & Mobile Menu */}
              <div className="flex items-center gap-4">
                <motion.a
                  href="/login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full hover:shadow-lg hover:shadow-emerald-500/50 transition-all font-medium"
                >
                  <span className="text-sm">লগইন</span>
                </motion.a>

                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-900/95 backdrop-blur-xl border-t border-emerald-500/20"
            >
              <div className="px-4 py-4 space-y-3">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 hover:text-emerald-400 transition-colors"
                  >
                    {item.name}
                  </a>
                ))}
                <a
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full font-medium"
                >
                  <span className="text-sm">লগইন</span>
                </a>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* Hero Section */}
        <section id="home" className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15)_0%,transparent_65%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwxODUsMTI5LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 backdrop-blur-sm rounded-full border border-emerald-500/20"
                >
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-sm">শিক্ষায় এগিয়ে, সেবায় অগ্রণী</span>
                </motion.div>

                <div className="space-y-4">
                  <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-lime-400 bg-clip-text text-transparent heading-font">
                      মৌসুমী
                    </span>
                    <br />
                    <span className="text-white">বিদ্যানিকেতন</span>
                  </h1>
                  <div className="flex items-center gap-2 text-xl text-gray-300">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                    <span>উকিলপাড়া, নওগাঁ</span>
                  </div>
                </div>

                <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
                  আধুনিক শিক্ষা ব্যবস্থা, যোগ্য শিক্ষক এবং সুন্দর পরিবেশে আপনার সন্তানের উজ্জ্বল ভবিষ্যৎ গড়ুন।
                  আমরা প্রতিশ্রুতিবদ্ধ মানসম্মত শিক্ষা প্রদানে।
                </p>

                <div className="flex flex-wrap gap-4">
                  <motion.a
                    href="#admission"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-medium flex items-center gap-2 hover:shadow-xl hover:shadow-emerald-500/50 transition-all"
                  >
                    ভর্তির আবেদন করুন
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.a>
                  <motion.a
                    href="#about"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white/5 backdrop-blur-sm rounded-xl font-medium border border-emerald-500/20 hover:bg-emerald-500/10 transition-all"
                  >
                    আরও জানুন
                  </motion.a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                  {achievements.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="text-center group"
                    >
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl mb-2 group-hover:scale-110 transition-transform">
                        <stat.icon className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {stat.count}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Right Content - Illustration */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative hidden lg:block"
              >
                <div className="relative">
                  {/* Main Circle with Gradient */}
                  <div className="relative w-full aspect-square">
                    <motion.div
                      animate={{
                        rotate: 360,
                      }}
                      transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-600/20 blur-3xl"
                    />
                    <div className="relative w-full h-full rounded-full bg-white/5 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center">
                      <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-600/30 backdrop-blur-sm border border-emerald-500/20 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50">
                          <BookOpen className="w-24 h-24" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Icons */}
                  {[
                    { Icon: Trophy, position: 'top-10 -left-10', delay: 0, color: 'from-lime-500 to-green-500' },
                    { Icon: Award, position: 'top-20 -right-10', delay: 0.2, color: 'from-emerald-500 to-teal-500' },
                    { Icon: Star, position: 'bottom-20 -left-10', delay: 0.4, color: 'from-teal-500 to-cyan-500' },
                    { Icon: GraduationCap, position: 'bottom-10 -right-10', delay: 0.6, color: 'from-green-500 to-emerald-500' },
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        y: [0, -10, 0],
                      }}
                      transition={{
                        delay: 1 + item.delay,
                        y: {
                          duration: 2 + index * 0.5,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        },
                      }}
                      className={`absolute ${item.position} w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-xl`}
                    >
                      <item.Icon className="w-8 h-8 text-white" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-emerald-400/50 rounded-full flex justify-center p-2">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                কেন <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">আমাদের</span>{' '}
                বেছে নেবেন?
              </h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                আধুনিক শিক্ষা ব্যবস্থা এবং সর্বোচ্চ মানের সুবিধা সহ আমরা প্রদান করি সম্পূর্ণ শিক্ষার পরিবেশ
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -10 }}
                  className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-500/30 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Gradient Background on Hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

                  <div className={`relative w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="relative text-xl font-bold mb-2">{feature.title}</h3>
                  <p className="relative text-gray-400 text-sm">{feature.description}</p>

                  <div className="relative mt-4 flex items-center text-emerald-400 text-sm font-medium group-hover:gap-2 transition-all">
                    <span>বিস্তারিত</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Section */}
        <section id="academic" className="py-20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1)_0%,transparent_65%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-teal-400 to-lime-400 bg-clip-text text-transparent">একাডেমিক</span>{' '}
                কার্যক্রম
              </h2>
              <p className="text-gray-400 text-lg">প্লে গ্রুপ থেকে পঞ্চম শ্রেণি পর্যন্ত সম্পূর্ণ শিক্ষা কার্যক্রম</p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {programs.map((program, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="relative group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-teal-500/50 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Gradient Border Effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-lime-500/0 group-hover:from-teal-500/20 group-hover:to-lime-500/20 transition-all rounded-2xl" />

                  <div className="relative flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-lime-500 rounded-xl flex items-center justify-center shadow-lg">
                        <program.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{program.name}</h3>
                        <p className="text-sm text-gray-400">বয়স: {program.age}</p>
                      </div>
                    </div>
                    <div className="px-3 py-1 bg-teal-500/20 rounded-full text-sm border border-teal-500/30">
                      {program.duration}
                    </div>
                  </div>

                  <div className="relative space-y-2 text-sm text-gray-400">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>আধুনিক পাঠ্যক্রম</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                      <span>ডিজিটাল ক্লাসরুম</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-lime-400" />
                      <span>পরীক্ষা ও মূল্যায়ন</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Notice Board */}
        <section id="notice" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Notice Board */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="lg:col-span-2"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/50">
                    <Bell className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-bold">সর্বশেষ নোটিশ</h2>
                </div>

                <div className="space-y-4">
                  {notices.map((notice, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ x: 10 }}
                      className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 ${notice.color} rounded-lg flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-semibold group-hover:text-emerald-400 transition-colors">
                              {notice.title}
                            </h3>
                            <span className={`px-3 py-1 ${notice.color} rounded-full text-xs font-medium whitespace-nowrap`}>
                              {notice.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{notice.date}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-6 w-full py-4 bg-white/5 backdrop-blur-sm rounded-xl font-medium border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all"
                >
                  সকল নোটিশ দেখুন
                </motion.button>
              </motion.div>

              {/* Quick Links & Contact */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                {/* Quick Links */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-yellow-400" />
                    দ্রুত লিংক
                  </h3>
                  <div className="space-y-2">
                    {['অনলাইন ভর্তি', 'ফলাফল দেখুন', 'পরীক্ষার রুটিন', 'অভিভাবক পোর্টাল', 'লাইব্রেরি'].map(
                      (link, index) => (
                        <motion.a
                          key={index}
                          href="#"
                          whileHover={{ x: 5 }}
                          className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all group"
                        >
                          <span className="text-sm">{link}</span>
                          <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-400 transition-colors" />
                        </motion.a>
                      )
                    )}
                  </div>
                </div>

                {/* Contact Info Card */}
                <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-2xl p-6 border border-emerald-500/20">
                  <h3 className="text-xl font-bold mb-4">যোগাযোগ</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">ফোন নম্বর</p>
                        <a
                          href="tel:01713758424"
                          className="font-medium hover:text-emerald-400 transition-colors"
                        >
                          ০১৭১৩-৭৫৮৪২৪
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-teal-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">ঠিকানা</p>
                        <p className="font-medium">উকিলপাড়া, নওগাঁ</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-lime-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-lime-400" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">ইমেইল</p>
                        <a
                          href="mailto:info@mousumi.edu.bd"
                          className="font-medium hover:text-lime-400 transition-colors text-sm"
                        >
                          info@mousumi.edu.bd
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Gallery Preview */}
        <section id="gallery" className="py-20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1)_0%,transparent_65%)] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                আমাদের <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">ক্যাম্পাস</span>
              </h2>
              <p className="text-gray-400 text-lg">শিক্ষার সুন্দর পরিবেশ এবং আধুনিক সুবিধাদি</p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {[
                { title: 'ক্লাসরুম', emoji: '🏫', gradient: 'from-emerald-500/20 to-teal-500/20' },
                { title: 'লাইব্রেরি', emoji: '📚', gradient: 'from-teal-500/20 to-cyan-500/20' },
                { title: 'ল্যাবরেটরি', emoji: '🔬', gradient: 'from-lime-500/20 to-green-500/20' },
                { title: 'খেলার মাঠ', emoji: '⚽', gradient: 'from-green-500/20 to-emerald-500/20' },
                { title: 'কম্পিউটার ল্যাব', emoji: '💻', gradient: 'from-emerald-500/20 to-teal-500/20' },
                { title: 'অডিটোরিয়াম', emoji: '🎭', gradient: 'from-teal-500/20 to-lime-500/20' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="relative group aspect-square bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-emerald-500/50 transition-all cursor-pointer"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity`} />
                  <div className="relative h-full flex flex-col items-center justify-center p-6">
                    <div className="text-6xl mb-4 group-hover:scale-110 transition-transform">{item.emoji}</div>
                    <h3 className="text-xl font-bold text-center">{item.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/50 transition-all inline-flex items-center gap-2"
              >
                সম্পূর্ণ গ্যালারি দেখুন
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-emerald-500/20"
            >
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Left Side - Contact Info */}
                <div>
                  <h2 className="text-4xl font-bold mb-6">
                    আমাদের সাথে{' '}
                    <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      যোগাযোগ
                    </span>{' '}
                    করুন
                  </h2>
                  <p className="text-gray-400 mb-8">
                    আপনার যেকোনো প্রশ্ন বা তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন। আমরা সর্বদা আপনার সেবায় প্রস্তুত।
                  </p>

                  <div className="space-y-6">
                    {[
                      { Icon: Phone, label: 'ফোন করুন', value: '০১৭১৩-৭৫৮৪২৪', href: 'tel:01713758424', color: 'from-emerald-500 to-teal-500' },
                      { Icon: MapPin, label: 'ঠিকানা', value: 'উকিলপাড়া, নওগাঁ', color: 'from-teal-500 to-cyan-500' },
                      { Icon: Mail, label: 'ইমেইল', value: 'info@mousumi.edu.bd', href: 'mailto:info@mousumi.edu.bd', color: 'from-lime-500 to-green-500' },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ x: 10 }}
                        className="flex items-center gap-4 group"
                      >
                        <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-110 transition-transform`}>
                          <item.Icon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-400">{item.label}</p>
                          {item.href ? (
                            <a href={item.href} className="text-lg font-medium hover:text-emerald-400 transition-colors">
                              {item.value}
                            </a>
                          ) : (
                            <p className="text-lg font-medium">{item.value}</p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right Side - Contact Form */}
                <div>
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">আপনার নাম</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                        placeholder="নাম লিখুন"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">ফোন নম্বর</label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                        placeholder="০১XXXXXXXXX"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">বিষয়</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors text-white placeholder:text-gray-500"
                        placeholder="বিষয় লিখুন"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">বার্তা</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 focus:border-emerald-500 focus:outline-none transition-colors text-white placeholder:text-gray-500 resize-none"
                        placeholder="আপনার বার্তা লিখুন"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl font-medium hover:shadow-xl hover:shadow-emerald-500/50 transition-all"
                    >
                      বার্তা পাঠান
                    </motion.button>
                  </form>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-emerald-500/20 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNiwxODUsMTI5LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40 pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              {/* Logo & Info */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white rounded-xl p-1 flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden border border-emerald-500/20">
                    <img src="/logo.png" alt="মৌসুমী বিদ্যানিকেতন" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                      মৌসুমী বিদ্যানিকেতন
                    </h3>
                    <p className="text-sm text-gray-400">উকিলপাড়া, নওগাঁ</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                  শিক্ষায় এগিয়ে, সেবায় অগ্রণী। আমরা প্রতিশ্রুতিবদ্ধ মানসম্মত শিক্ষা প্রদানে এবং আপনার সন্তানের উজ্জ্বল
                  ভবিষ্যৎ গড়তে।
                </p>
              </div>

              {/* Quick Links */}
              <div>
                <h4 className="font-semibold mb-4">দ্রুত লিংক</h4>
                <ul className="space-y-2">
                  {['প্রচ্ছদ', 'আমাদের সম্পর্কে', 'একাডেমিক', 'নোটিশ', 'যোগাযোগ'].map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h4 className="font-semibold mb-4">যোগাযোগ</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li>উকিলপাড়া, নওগাঁ</li>
                  <li>
                    <a href="tel:01713758424" className="hover:text-emerald-400 transition-colors">
                      ০১৭১৩-৭৫৮৪২৪
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@mousumi.edu.bd" className="hover:text-emerald-400 transition-colors">
                      info@mousumi.edu.bd
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-emerald-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">© ২০২৫ মৌসুমী বিদ্যানিকেতন। সর্বস্বত্ব সংরক্ষিত।</p>
              <div className="flex gap-4">
                {[
                  { Icon: Facebook, href: '#' },
                  { Icon: Youtube, href: '#' },
                  { Icon: Instagram, href: '#' },
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-lg flex items-center justify-center border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40 transition-all"
                  >
                    <social.Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
