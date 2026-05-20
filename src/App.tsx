import {
  Anchor,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  HandHeart,
  Heart,
  HelpCircle,
  Instagram,
  Map as MapIcon,
  MapPin,
  Menu,
  MessageCircle,
  Send,
  ShieldCheck,
  Sprout,
  Users,
  X
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import React, { useEffect, useState } from 'react';


type Registration = {
  id: number;
  firstName: string;
  lastName: string;
  createdAt: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function apiFetch(path: string, options: RequestInit = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}
function getOrCreateVisitId() {
  const key = 'public-site-visit-id';
  const existingId = sessionStorage.getItem(key);

  if (existingId) {
    return existingId;
  }

  const newId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(key, newId);
  return newId;
}

function trackVisitOnce(page: string) {
  const normalizedPage = page.split('#')[0] || '/';

  apiFetch('/api/visit', {
    method: 'POST',
    body: JSON.stringify({
      page: normalizedPage,
      visitId:
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    })
  }).catch(() => undefined);
}
// --- Components ---

const Countdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +targetDate - +new Date();
    let timeLeft = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      };
    }

    return timeLeft;
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const TimeUnit = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center justify-center w-20 md:w-32 py-2 md:py-3 shrink-0">
      <span className="text-3xl md:text-5xl font-serif font-bold text-brand-red">{value.toString().padStart(2, '0')}</span>
      <span className="text-[10px] md:text-xs uppercase tracking-widest text-brand-gray font-medium mt-1 uppercase">{label}</span>
    </div>
  );

  return (
    <div className="inline-flex w-fit max-w-full divide-x divide-brand-charcoal/10 bg-white/55 backdrop-blur-md rounded-2xl border border-brand-charcoal/5 shadow-sm overflow-hidden">
      <TimeUnit value={timeLeft.days} label="Днів" />
      <TimeUnit value={timeLeft.hours} label="Годин" />
      <TimeUnit value={timeLeft.minutes} label="Хвилин" />
      <TimeUnit value={timeLeft.seconds} label="Секунд" />
    </div>
  );
};

const RegistrationForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ firstName: '', lastName: '' });
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });

  const validateForm = () => {
    const errors = { firstName: '', lastName: '' };

    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();

    if (!firstName) {
      errors.firstName = 'Будь ласка, введіть ім’я.';
    } else if (firstName.length < 2) {
      errors.firstName = 'Ім’я має містити щонайменше 2 символи.';
    } else if (firstName.length > 30) {
      errors.firstName = 'Ім’я не може бути довшим за 30 символів.';
    }

    if (!lastName) {
      errors.lastName = 'Будь ласка, введіть прізвище.';
    } else if (lastName.length < 2) {
      errors.lastName = 'Прізвище має містити щонайменше 2 символи.';
    } else if (lastName.length > 40) {
      errors.lastName = 'Прізвище не може бути довшим за 40 символів.';
    }

    setFieldErrors(errors);

    return !errors.firstName && !errors.lastName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setStatus('loading');

    try {
      await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        })
      });
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зареєструватися. Спробуйте ще раз.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-serif mb-2">Дякуємо за реєстрацію!</h3>
        <p className="text-brand-gray">Чекаємо на вас 13 червня.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6 max-w-md mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-brand-gray mb-2">Ім’я</label>
          <input 
            type="text"
            minLength={2}
            maxLength={30}
            className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors bg-white/50 ${
              fieldErrors.firstName
                ? 'border-brand-red focus:border-brand-red'
                : 'border-brand-charcoal/10 focus:border-brand-red'
            }`}
            placeholder="Ваше ім’я"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              setFieldErrors({ ...fieldErrors, firstName: '' });
            }}
          />
          {fieldErrors.firstName && (
            <p className="text-sm text-brand-red mt-2">{fieldErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-brand-gray mb-2">Прізвище</label>
          <input 
            type="text"
            minLength={2}
            maxLength={40}
            className={`w-full px-4 py-3 rounded-lg border outline-none transition-colors bg-white/50 ${
              fieldErrors.lastName
                ? 'border-brand-red focus:border-brand-red'
                : 'border-brand-charcoal/10 focus:border-brand-red'
            }`}
            placeholder="Ваше прізвище"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
              setFieldErrors({ ...fieldErrors, lastName: '' });
            }}
          />
          {fieldErrors.lastName && (
            <p className="text-sm text-brand-red mt-2">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      {error && <p className="text-sm text-brand-red text-center">{error}</p>}

      <button 
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-4 bg-brand-red text-white font-medium rounded-lg hover:bg-opacity-90 transition-all shadow-lg shadow-brand-red/20 flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {status === 'loading' ? 'Обробка...' : (
          <>
            Зареєструватися <ChevronRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
};

const ScrollingText = () => {
  const text = "ПОКЛОНІННЯ · WORSHIP ✦ ЄДНІСТЬ · UNITY ✦ ЛОНДОН · LONDON 2026 ✦ УКРАЇНА · UKRAINE ✦ РАЗОМ · TOGETHER ✦ МОЛИТВА · PRAYER ✦ ";
  
  return (
    <div className="bg-brand-red py-4 overflow-hidden whitespace-nowrap flex border-y border-white/10">
      <motion.div 
        animate={{ x: [0, -1035] }} // Adjust based on text length
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="flex"
      >
        <span className="text-white font-bold text-lg md:text-xl uppercase tracking-widest px-4">{text}</span>
        <span className="text-white font-bold text-lg md:text-xl uppercase tracking-widest px-4">{text}</span>
        <span className="text-white font-bold text-lg md:text-xl uppercase tracking-widest px-4">{text}</span>
      </motion.div>
    </div>
  );
};

const Section = ({ id, heading, className, children, dark = false, airy = true }: { 
  id?: string, 
  heading?: string, 
  className?: string, 
  children: React.ReactNode, 
  dark?: boolean,
  airy?: boolean
}) => (
  <section id={id} className={`relative ${airy ? 'py-20 md:py-32' : 'py-16'} ${dark ? 'bg-brand-charcoal text-white' : ''} ${className}`}>
    <div className="max-w-7xl mx-auto px-6">
      {heading && (
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl lg:text-5xl font-serif text-center mb-16 md:mb-24"
        >
          {heading}
        </motion.h2>
      )}
      {children}
    </div>
  </section>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-[9999] transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-lg shadow-sm py-3' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex flex-col">
            <span className={`text-xl font-serif font-bold transition-colors ${scrolled ? 'text-brand-red' : 'text-brand-charcoal'}`}>
              Молитва за Україну
            </span>
            <span className="text-[10px] uppercase tracking-tighter text-brand-gray font-medium -mt-1">London 2026</span>
          </div>

          <div className="hidden md:flex gap-8 items-center text-sm font-medium">
            <a href="#about" className="hover:text-brand-red transition-colors">Хто ми?</a>
            <a href="#details" className="hover:text-brand-red transition-colors">Де і коли</a>
            <a href="#programe" className="hover:text-brand-red transition-colors">Програма</a>
            <a href="#register" className="px-6 py-2.5 bg-brand-red text-white rounded-full hover:bg-opacity-90 transition-all">Реєстрація</a>
          </div>

          <button className="md:hidden" onClick={() => setIsOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[99999] w-screen h-screen bg-white flex flex-col p-10 md:hidden"
          >
            <div className="flex justify-end">
              <button onClick={() => setIsOpen(false)}>
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="flex flex-col gap-8 text-2xl font-serif mt-12">
              <a href="#about" onClick={() => setIsOpen(false)}>Хто ми?</a>
              <a href="#details" onClick={() => setIsOpen(false)}>Деталі події</a>
              <a href="#programe" onClick={() => setIsOpen(false)}>Програма</a>
              <a href="#register" onClick={() => setIsOpen(false)} className="text-brand-red font-bold underline decoration-brand-rose underline-offset-8">
                Зареєструватися
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- App ---

const OldPublicSite = () => {
  const EVENT_DATE = new Date('2026-06-13T18:00:00');

useEffect(() => {
  trackVisitOnce('/');
}, []);

  return (
    <main className="overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-24 pb-20">
<div className="absolute inset-0 z-0">
  <div className="absolute inset-0 bg-gradient-to-r from-brand-white/85 via-brand-white/35 to-transparent z-10" />
<div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-white/45 z-10" />
  <img 
    src="/images/hero-prayer-ukraine.png" 
    alt="Prayer background" 
    className="w-full h-full object-cover grayscale opacity-90 max-md:object-[30%_center]" 
  />

  <div className="ukrainian-pattern absolute inset-0 z-0 opacity-30" />
</div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
          <div className="max-w-3xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-rose/30 text-brand-red rounded-full text-sm font-medium mb-8 border border-brand-red/10"
            >
              <Heart className="w-4 h-4 fill-brand-red" />
              Разом у молитві
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold tracking-tight leading-[1.1] mb-8"
            >
              Ісус Христос — <br />
              <span className="text-brand-red">дорога, правда і життя</span> <br />для України
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 1 }}
              className="text-xl md:text-2xl text-brand-gray font-serif italic mb-10"
            >
              Вечір молитви за Україну
            </motion.p>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-y-4 gap-x-12 mb-12 text-brand-charcoal/80 font-medium"
            >
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-brand-red" />
                <span>13 червня</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-brand-red" />
                <span>18:00</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-brand-red" />
                <span>East London Tabernacle, Mile End</span>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mb-16 inline-block max-w-full"
            >
              <Countdown targetDate={EVENT_DATE} />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-6 items-start sm:items-center"
            >
              <a href="#register" className="px-10 py-5 bg-brand-red text-white text-lg font-bold rounded-xl hover:bg-brand-red-light transition-all shadow-2xl shadow-brand-red/30">
                Зареєструватися
              </a>
            </motion.div>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-12 text-brand-gray italic font-serif text-2xl md:text-3xl"
            >
              &ldquo;Я — дорога, правда і життя&rdquo; — Івана 14:6
            </motion.p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <Section id="about" heading="Хто ми?" className="bg-white">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-24">
          <div>
            <p className="text-xl leading-relaxed text-brand-gray mb-8">
              Ми — українці в Британії. Ми далеко від дому, але наші серця — з Україною. 
              13 червня ми збираємося разом, щоб молитися за наш народ, за мир, за воїнів, 
              за сім’ї, за церкви і за майбутнє України. 
            </p>
            <p className="text-xl leading-relaxed text-brand-gray">
              Це не конференція і не концерт. Це вечір молитви, поклоніння і єдності.
            </p>
          </div>
          <div className="relative">
            <div className="aspect-square bg-brand-rose/20 rounded-3xl overflow-hidden shadow-inner">
               <img src="/images/hero-prayer-ukraine.png" className="w-full h-full object-cover opacity-60 mix-blend-multiply" />
            </div>
            <div className="absolute -bottom-8 -right-8 p-8 bg-brand-red text-white rounded-2xl shadow-xl max-w-xs">
              <p className="font-serif italic text-lg">“Одна молитва може змінити історію цілого народу.”</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Молитва", desc: "Стаємо перед Богом за Україну.", icon: HandHeart },
            { title: "Єдність", desc: "Українські церкви з різних міст Британії разом.", icon: Users },
            { title: "Надія", desc: "Віримо, що Христос є відповіддю для України.", icon: Anchor }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-2xl border border-brand-charcoal/5 bg-brand-white hover:shadow-xl hover:shadow-brand-red/5 transition-all group"
            >
              <item.icon className="w-12 h-12 text-brand-red mb-6 group-hover:scale-110 transition-transform" />
              <h3 className="text-2xl font-serif font-bold mb-4">{item.title}</h3>
              <p className="text-brand-gray leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <ScrollingText />

      {/* Theme Section */}
      <Section heading="Дорога. Правда. Життя." className="bg-brand-white overflow-hidden">
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-brand-red/20 -z-10" />
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {[
              { title: "Дорога", desc: "Коли Україна шукає шлях вперед, ми віримо, що Христос веде.", icon: Compass },
              { title: "Правда", desc: "У час болю, страху і неправди ми тримаємося Божої істини.", icon: ShieldCheck },
              { title: "Життя", desc: "Ми молимося за життя, відновлення, мир і спасіння для України.", icon: Sprout }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="flex flex-col items-center bg-brand-white"
              >
                <div className="w-20 h-20 rounded-full bg-brand-rose/20 border border-brand-red/10 flex items-center justify-center text-brand-red shadow-sm mb-8">
                   <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-6">{item.title}</h3>
                <p className="text-brand-gray leading-relaxed max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Details Section */}
      <Section id="details" heading="Деталі вечора" className="bg-white">
        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          <div className="space-y-10">
            <div className="flex gap-6 items-start">
              <div className="mt-1 p-3 bg-brand-rose/30 rounded-lg"><Calendar className="w-6 h-6 text-brand-red" /></div>
              <div>
                <h4 className="text-lg font-bold mb-1">Дата та час</h4>
                <p className="text-brand-gray text-xl">13 червня · 18:00</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="mt-1 p-3 bg-brand-rose/30 rounded-lg"><MapPin className="w-6 h-6 text-brand-red" /></div>
              <div>
                <h4 className="text-lg font-bold mb-1">Місце проведення</h4>
                <p className="text-brand-gray text-xl">East London Tabernacle Baptist Church</p>
                <p className="text-brand-gray mt-2">15 Burdett Road, Mile End, London E3 4TU</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="mt-1 p-3 bg-brand-rose/30 rounded-lg"><Send className="w-6 h-6 text-brand-red" /></div>
              <div>
                <h4 className="text-lg font-bold mb-1">Як дістатися</h4>
                <p className="text-brand-gray text-xl">Tube: Mile End Station</p>
                <p className="text-brand-gray mt-2">Лише 7 хвилин пішки від станції</p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="mt-1 p-3 bg-brand-rose/30 rounded-lg"><CheckCircle2 className="w-6 h-6 text-brand-red" /></div>
              <div>
                <h4 className="text-lg font-bold mb-1">Умови участі</h4>
                <p className="text-brand-gray text-xl font-bold">Вхід вільний</p>
                <p className="text-brand-gray mt-2 italic">Будь ласка, зареєструйтеся заздалегідь</p>
              </div>
            </div>

            <div className="pt-6">
              <a 
                href="https://maps.google.com/?q=East+London+Tabernacle+Mile+End" 
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 border-2 border-brand-charcoal font-bold rounded-xl hover:bg-brand-charcoal hover:text-white transition-all"
              >
                <MapIcon className="w-5 h-5" /> Відкрити карту
              </a>
            </div>
          </div>

          <div className="bg-brand-white rounded-3xl overflow-hidden h-[400px] md:h-auto border border-brand-charcoal/5 shadow-inner">
            <iframe
              title="East London Tabernacle Baptist Church map"
              src="https://www.google.com/maps?q=East%20London%20Tabernacle%20Baptist%20Church%2015%20Burdett%20Road%20London%20E3%204TU&output=embed"
              className="w-full h-full border-0 grayscale-[20%]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>

      {/* Programme Section */}
      <Section id="programe" heading="Що буде увечері?" className="bg-brand-white">
        <div className="max-w-2xl mx-auto">
          <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-red/10">
            {[
              { time: "18:00", title: "Двері відкриваються, реєстрація", desc: "Час для підготовки та вітання гостей." },
              { time: "18:30", title: "Відкриття вечора", desc: "Вступне слово та початок молитовного чування." },
              { time: "", title: "Поклоніння", desc: "Спільні співи та прославлення Господа." },
              { time: "", title: "Слово Боже", desc: "Проповідь та духовна настанова." },
              { time: "", title: "Спільна молитва за Україну", desc: "Молитва за мир, військових та кожну сім’ю." },
              { time: "20:00", title: "Завершення: Чай і спілкування", desc: "Час для єднання та особистих розмов." }
            ].map((item, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative pl-10 pb-12 last:pb-0"
              >
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-white border-2 border-brand-red shadow-sm z-10" />
                {item.time && <span className="text-brand-red font-bold text-sm tracking-widest">{item.time}</span>}
                <h3 className={`text-xl font-serif font-bold ${item.time ? 'mt-1' : ''}`}>{item.title}</h3>
                <p className="mt-2 text-brand-gray">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-16 p-8 bg-white/50 backdrop-blur rounded-2xl border border-brand-charcoal/5 text-center">
            <p className="text-brand-gray italic font-serif text-lg">“Прийди як є. Нічого особливого не потрібно.”</p>
          </div>
        </div>
      </Section>

      {/* Unity Section */}
      <Section className="bg-white border-y border-brand-charcoal/5">
        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-serif mb-8">Церкви разом за Україну</h2>
          <p className="text-xl text-brand-gray max-w-2xl mx-auto mb-16">
            Різні міста. Різні деномінації. Одна молитва — за Україну.
          </p>
          
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 text-xl md:text-2xl font-serif text-brand-gray/50 italic">
            <span>London</span>
            <span className="text-brand-red/30">/</span>
            <span>Manchester</span>
            <span className="text-brand-red/30">/</span>
            <span>Birmingham</span>
            <span className="text-brand-red/30">/</span>
            <span>Bristol</span>
            <span className="text-brand-red/30">/</span>
            <span>Leeds</span>
            <span className="text-brand-red/30">/</span>
            <span className="text-brand-charcoal/80">та інші</span>
          </div>
        </div>
      </Section>

      {/* Registration Section */}
      <Section id="register" heading="Зареєструйся" className="bg-brand-rose/10">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl shadow-brand-red/10 border border-white">
            <p className="text-center text-brand-gray mb-10 text-lg">
              Заповни коротку форму, щоб ми могли краще підготуватися до вечора.
            </p>
            <RegistrationForm />
          </div>
        </div>
      </Section>

      {/* FAQ Section */}
      <Section heading="Поширені питання" className="bg-white">
        <div className="max-w-3xl mx-auto grid gap-6">
          {[
            { q: "Чи потрібно платити за вхід?", a: "Ні, вхід вільний. Ми будемо раді бачити кожного." },
            { q: "Чи потрібно реєструватися?", a: "Так, це допомагає нам підготувати комфортне місце для кожного гостя." },
            { q: "Чи можна прийти з друзями?", a: "Так, обов’язково! Чим більше нас буде у спільній молитві, тим краще." },
            { q: "Якою мовою буде вечір?", a: "Переважно українською, з можливими частинами англійською для наших друзів британців." }
          ].map((item, i) => (
            <div key={i} className="p-8 bg-brand-white rounded-2xl border border-brand-charcoal/5">
              <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-brand-red" />
                {item.q}
              </h3>
              <p className="text-brand-gray ml-8 leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Final CTA */}
<section className="py-32 relative overflow-hidden bg-brand-charcoal text-white text-center">
  <div className="absolute inset-0 opacity-10 blur-sm pointer-events-none">
    <img
      src="/images/hero-prayer-ukraine.png"
      className="w-full h-full object-cover"
    />
  </div>

  <div className="max-w-7xl mx-auto px-6 relative z-10">
    <h2 className="text-4xl md:text-6xl font-serif font-bold mb-12">
      13 червня. Лондон. <br /> Молитва за Україну.
    </h2>

    <div className="flex flex-col items-center gap-10">
      <div className="max-w-full overflow-x-auto">
        <Countdown targetDate={EVENT_DATE} />
      </div>

      <a
        href="#register"
        className="inline-block px-12 py-6 bg-brand-red text-white text-xl font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-2xl shadow-brand-red/20 active:scale-95"
      >
        Зареєструватися зараз
      </a>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="bg-white py-20 border-t border-brand-charcoal/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
            <div>
              <div className="flex flex-col mb-4">
                <span className="text-2xl font-serif font-bold text-brand-red">
                  Вечір молитви за Україну
                </span>
                <span className="text-xs uppercase tracking-widest text-brand-gray font-medium">Лондон 2026</span>
              </div>
              <p className="text-brand-gray font-serif italic text-lg leading-tight">
                “Ісус Христос — дорога, <br /> правда і життя”
              </p>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex gap-6">
                <a href="#" className="p-3 bg-brand-rose/20 rounded-full text-brand-red hover:bg-brand-red hover:text-white transition-all">
                  <Instagram className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-brand-rose/20 rounded-full text-brand-red hover:bg-brand-red hover:text-white transition-all">
                  <Send className="w-6 h-6" />
                </a>
                <a href="#" className="p-3 bg-brand-rose/20 rounded-full text-brand-red hover:bg-brand-red hover:text-white transition-all">
                  <MessageCircle className="w-6 h-6" />
                </a>
              </div>
              <div className="flex flex-wrap gap-4 text-brand-gray text-sm font-medium">
                <span>#молитвазаукраїну</span>
                <span>#prayforukraine</span>
                <span>#вечірмолитви</span>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-brand-charcoal/5 text-center text-brand-gray text-sm">
            &copy; 2026 Вечір молитви за Україну. Всі права захищені.
          </div>
        </div>
      </footer>
    </main>
  );
};



const NewRegistrationForm = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ firstName: '', lastName: '' });
  const [formData, setFormData] = useState({ firstName: '', lastName: '' });

  const validateForm = () => {
    const errors = { firstName: '', lastName: '' };
    const firstName = formData.firstName.trim();
    const lastName = formData.lastName.trim();

    if (!firstName) errors.firstName = 'Будь ласка, введіть ім’я.';
    else if (firstName.length < 2) errors.firstName = 'Ім’я має містити щонайменше 2 символи.';
    else if (firstName.length > 30) errors.firstName = 'Ім’я не може бути довшим за 30 символів.';

    if (!lastName) errors.lastName = 'Будь ласка, введіть прізвище.';
    else if (lastName.length < 2) errors.lastName = 'Прізвище має містити щонайменше 2 символи.';
    else if (lastName.length > 40) errors.lastName = 'Прізвище не може бути довшим за 40 символів.';

    setFieldErrors(errors);
    return !errors.firstName && !errors.lastName;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setStatus('loading');

    try {
      await apiFetch('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        })
      });
      setStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не вдалося зареєструватися. Спробуйте ще раз.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[2rem] border border-[#B7EFFF]/20 bg-[#B7EFFF]/10 p-10 text-center"
      >
        <CheckCircle2 className="mx-auto mb-5 h-12 w-12 text-[#B7EFFF]" />
        <h3 className="mb-2 font-['Unbounded'] text-2xl font-black text-white">Дякуємо за реєстрацію!</h3>
        <p className="font-['Inter'] text-[#8A9AAF]">Чекаємо на вас 13 червня.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4 md:space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="mb-2 block font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#B7EFFF]/80">Ім’я</label>
          <input
            type="text"
            minLength={2}
            maxLength={30}
            className={`w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 font-['Inter'] text-base text-white outline-none transition placeholder:text-[#8A9AAF]/60 md:px-5 md:py-4 ${
              fieldErrors.firstName ? 'border-[#B7EFFF]' : 'border-white/10 focus:border-[#B7EFFF]/70'
            }`}
            placeholder="Ваше ім’я"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              setFieldErrors({ ...fieldErrors, firstName: '' });
            }}
          />
          {fieldErrors.firstName && <p className="mt-2 text-sm text-[#B7EFFF]">{fieldErrors.firstName}</p>}
        </div>

        <div>
          <label className="mb-2 block font-['Inter'] text-xs font-semibold uppercase tracking-[0.16em] text-[#B7EFFF]/80">Прізвище</label>
          <input
            type="text"
            minLength={2}
            maxLength={40}
            className={`w-full rounded-2xl border bg-white/[0.04] px-4 py-3.5 font-['Inter'] text-base text-white outline-none transition placeholder:text-[#8A9AAF]/60 md:px-5 md:py-4 ${
              fieldErrors.lastName ? 'border-[#B7EFFF]' : 'border-white/10 focus:border-[#B7EFFF]/70'
            }`}
            placeholder="Ваше прізвище"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
              setFieldErrors({ ...fieldErrors, lastName: '' });
            }}
          />
          {fieldErrors.lastName && <p className="mt-2 text-sm text-[#B7EFFF]">{fieldErrors.lastName}</p>}
        </div>
      </div>

      {error && <p className="text-center text-sm text-[#B7EFFF]">{error}</p>}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-[#B7EFFF] px-5 py-[1.1rem] font-['Inter'] text-[13px] font-bold uppercase tracking-[0.16em] text-[#0A0E14] transition hover:scale-[1.01] hover:bg-white disabled:opacity-60 md:px-8 md:py-5 md:text-sm md:tracking-[0.18em]"
      >
        {status === 'loading' ? 'Обробка...' : <>Зареєструватися <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></>}
      </button>
    </form>
  );
};


const NewCountdown = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculate = () => {
      const difference = +targetDate - +new Date();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  const units = [
    ['Днів', timeLeft.days],
    ['Годин', timeLeft.hours],
    ['Хвилин', timeLeft.minutes],
    ['Секунд', timeLeft.seconds]
  ];

  return (
    <div className="grid w-full grid-cols-2 overflow-hidden rounded-[2rem] border border-[#B7EFFF]/20 bg-white/[0.035] shadow-2xl shadow-black/25 backdrop-blur md:grid-cols-4">
      {units.map(([label, value]) => (
        <div key={label.toString()} className="border-b border-r border-white/10 p-6 text-center last:border-r-0 md:border-b-0 md:p-8">
          <p className="font-['Bebas_Neue'] text-6xl leading-none tracking-wide text-[#B7EFFF] md:text-7xl">{String(value).padStart(2, '0')}</p>
          <p className="mt-2 font-['Inter'] text-xs font-semibold uppercase tracking-[0.22em] text-[#8A9AAF]">{label}</p>
        </div>
      ))}
    </div>
  );
};

const PublicSite = () => {
  const EVENT_DATE = new Date('2026-06-13T18:00:00');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    trackVisitOnce('/');
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;

    const scrollY = window.scrollY;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyPosition = document.body.style.position;
    const previousBodyTop = document.body.style.top;
    const previousBodyWidth = document.body.style.width;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.style.position = previousBodyPosition;
      document.body.style.top = previousBodyTop;
      document.body.style.width = previousBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  const menuLinks = [
    { href: '#about', label: 'Хто ми?' },
    { href: '#details', label: 'Де і коли?' },
    { href: '#programme', label: 'Програма' },
    { href: '#register', label: 'Реєстрація' }
  ];

  const cardClass = "rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 shadow-2xl shadow-black/20 backdrop-blur";

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0A0E14] font-['Inter'] text-white">
      <nav className={`fixed left-0 top-0 z-[9999] w-full transition-all duration-300 ${scrolled ? 'border-b border-white/10 bg-[#0A0E14]/90 py-4 backdrop-blur-xl' : 'py-7'}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
          <a href="#" className="flex flex-col">
            <span className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.16em] text-[#B7EFFF]/80">Молитва за Україну</span>
            <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8A9AAF]">Лондон 13.06</span>
          </a>

          <div className="hidden items-center gap-8 font-['Inter'] text-sm font-semibold text-white/75 md:flex">
            {menuLinks.slice(0, 3).map((item) => (
              <a key={item.href} href={item.href} className="transition hover:text-[#B7EFFF]">{item.label}</a>
            ))}
            <a href="#register" className="rounded-full bg-[#B7EFFF] px-6 py-3 text-[#0A0E14] transition hover:bg-white">Реєстрація</a>
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-7 w-7 text-[#B7EFFF]" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.25 }}
            className="fixed left-0 right-0 top-0 z-[99999] flex w-screen flex-col overflow-hidden bg-[#0A0E14] p-8 pb-[calc(2rem+env(safe-area-inset-bottom))] md:hidden"
            style={{
              height: 'calc(100dvh + 180px)',
              minHeight: 'calc(100vh + 180px)',
              bottom: '-180px',
              backgroundColor: '#0A0E14',
              overscrollBehavior: 'none'
            }}
          >
            <div className="flex justify-end">
              <button onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <X className="h-8 w-8 text-[#B7EFFF]" />
              </button>
            </div>

            <div className="mt-14 flex flex-col gap-8 font-['Unbounded'] text-3xl font-black">
              {menuLinks.map((item) => (
                <a key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="text-white transition hover:text-[#B7EFFF]">
                  {item.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="relative min-h-[100svh] overflow-hidden pt-28 md:min-h-screen md:pt-32">
        <div className="absolute inset-0">
          <img
            src="/images/hero-prayer-ukraine.png"
            alt="Prayer background"
            className="h-full w-full object-cover opacity-[0.88] grayscale max-md:object-[68%_center]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0E14]/88 via-[#0A0E14]/62 to-[#0A0E14]/24" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E14]/18 via-transparent to-[#0A0E14]/90" />
          <div className="absolute right-[-12%] top-[18%] h-[34rem] w-[34rem] rounded-full bg-[#B7EFFF]/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl gap-8 px-6 pb-8 lg:min-h-[calc(100vh-8rem)] lg:items-center lg:gap-12 lg:py-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="flex min-h-[calc(100svh-8.5rem)] flex-col lg:min-h-0 lg:block lg:-translate-y-8 xl:-translate-y-10">
            <div className="pt-[5vh] sm:pt-[8vh] lg:pt-0">
            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{ fontFamily: '"Unbounded", "Inter", system-ui, sans-serif', fontWeight: 900 }}
              className="max-w-[92vw] text-[clamp(2.55rem,10.4vw,4rem)] uppercase leading-[1.16] tracking-[-0.03em] max-md:mx-auto max-md:text-center sm:text-[clamp(3rem,7vw,4.8rem)] lg:max-w-4xl lg:text-[clamp(3.95rem,4.75vw,5.1rem)] lg:leading-[1.1] lg:tracking-[-0.045em]"
            >
              <span className="mb-1 block whitespace-nowrap text-[0.66em] sm:text-[0.78em] lg:mb-2 lg:text-[0.92em]">Ісус Христос —</span>
              <span className="block text-[#B7EFFF]">дорога,<br />правда і життя</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              style={{ fontFamily: '"Unbounded", "Inter", system-ui, sans-serif', fontWeight: 900 }}
              className="mt-6 max-w-[88vw] text-[1.25rem] uppercase leading-[1.25] tracking-[-0.01em] text-white/25 max-md:mx-auto max-md:text-center sm:text-3xl md:max-w-2xl md:text-4xl"
            >
              Вечір молитви за Україну
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 max-w-2xl font-['Inter'] text-lg leading-8 text-[#8A9AAF] md:text-xl"
            >
              Українські церкви у Великобританії разом у поклонінні, молитві та надії для України.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-7 flex flex-wrap gap-4 lg:hidden"
            >
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/80">
                <Calendar className="h-4 w-4 text-[#B7EFFF]" /> 13 червня
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/80">
                <Clock className="h-4 w-4 text-[#B7EFFF]" /> 18:00
              </div>
              <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-white/80">
                <MapPin className="h-4 w-4 text-[#B7EFFF]" /> East London Tabernacle
              </div>
            </motion.div>

            </div>

            <div className="mt-auto flex flex-col gap-4 pb-2 pt-8 sm:flex-row sm:items-center lg:mt-10 lg:gap-6 lg:pb-0 lg:pt-0">
              <a href="#register" className="rounded-full bg-[#B7EFFF] px-8 py-4 text-center font-['Inter'] text-sm font-bold uppercase tracking-[0.16em] text-[#0A0E14] transition hover:scale-[1.02] hover:bg-white">
                Зареєструватись
              </a>
              <a href="#programme" className="rounded-full border border-white/15 px-8 py-4 text-center font-['Inter'] text-sm font-bold uppercase tracking-[0.16em] text-white/80 transition hover:border-[#B7EFFF] hover:text-[#B7EFFF]">
                Подивитись програму
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="relative hidden lg:block"
          >
            <div className="rounded-[2.5rem] border border-[#B7EFFF]/20 bg-[#111720]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur">
              <p className="mb-5 font-['Inter'] text-xs font-semibold uppercase tracking-[0.18em] text-[#B7EFFF]/80">13 червня · Лондон</p>
              <p className="font-['Unbounded'] text-3xl font-black uppercase leading-[1.15] text-white">Молитва за Україну</p>
              <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-8">
                <div>
                  <p className="font-['Bebas_Neue'] text-6xl leading-none text-[#B7EFFF]">13</p>
                  <p className="text-sm text-[#8A9AAF]">червня</p>
                </div>
                <div>
                  <p className="font-['Bebas_Neue'] text-6xl leading-none text-[#B7EFFF]">18:00</p>
                  <p className="text-sm text-[#8A9AAF]">початок</p>
                </div>
              </div>
              <p className="mt-7 border-t border-white/10 pt-6 font-['Inter'] text-sm font-semibold uppercase tracking-[0.16em] text-[#B7EFFF]/80">East London Tabernacle</p>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="about" className="relative bg-[#0A0E14] px-6 py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <div>
            <p className="mb-5 font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Хто ми?</p>
            <h2 className="font-['Unbounded'] text-4xl font-black uppercase leading-[1.12] tracking-[-0.04em] text-white md:text-6xl">
              Одна молитва. <span className="text-[#B7EFFF]">Одна надія.</span>
            </h2>
          </div>
          <div className="space-y-7 text-lg leading-8 text-[#8A9AAF] md:text-xl">
            <p>
              Ми — українці в Британії. Ми далеко від дому, але наші серця — з Україною. 13 червня ми збираємося разом, щоб молитися за наш народ, за мир, за воїнів, за сім’ї, за церкви і за майбутнє України.
            </p>
            <p className="text-white/80">
              Це не конференція і не концерт. Це вечір молитви, поклоніння і єдності.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-16 grid max-w-7xl gap-5 md:grid-cols-3">
          {[
            { title: 'Молитва', text: 'Стаємо перед Богом за Україну.', icon: HandHeart },
            { title: 'Єдність', text: 'Українські церкви з різних міст Британії разом.', icon: Users },
            { title: 'Надія', text: 'Віримо, що Христос є відповіддю для України.', icon: Anchor }
          ].map((item) => (
            <div key={item.title} className={cardClass}>
              <item.icon className="mb-7 h-10 w-10 text-[#B7EFFF]" />
              <h3 className="mb-4 font-['Unbounded'] text-xl font-black uppercase text-white">{item.title}</h3>
              <p className="text-[#8A9AAF]">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden border-y border-white/10 bg-[#B7EFFF] py-5 text-[#0A0E14]">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="flex whitespace-nowrap font-['Unbounded'] text-xl font-black uppercase tracking-[-0.03em] md:text-3xl"
        >
          <span className="px-4">ПОКЛОНІННЯ · МОЛИТВА · ЄДНІСТЬ · УКРАЇНА · ЛОНДОН · НАДІЯ · </span>
          <span className="px-4">ПОКЛОНІННЯ · МОЛИТВА · ЄДНІСТЬ · УКРАЇНА · ЛОНДОН · НАДІЯ · </span>
          <span className="px-4">ПОКЛОНІННЯ · МОЛИТВА · ЄДНІСТЬ · УКРАЇНА · ЛОНДОН · НАДІЯ · </span>
        </motion.div>
      </section>

      <section className="bg-[#111720] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <p className="mb-5 text-center font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Дорога. Правда. Життя.</p>
          <h2 className="mx-auto mb-16 max-w-4xl text-center font-['Unbounded'] text-4xl font-black uppercase leading-[1.12] md:text-6xl">Христос — наша надія для України</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Дорога', desc: 'Коли Україна шукає шлях вперед, ми віримо, що Христос веде.', icon: Compass },
              { title: 'Правда', desc: 'У час болю, страху і неправди ми тримаємося Божої істини.', icon: ShieldCheck },
              { title: 'Життя', desc: 'Ми молимося за життя, відновлення, мир і спасіння для України.', icon: Sprout }
            ].map((item) => (
              <div key={item.title} className={cardClass}>
                <item.icon className="mb-7 h-10 w-10 text-[#B7EFFF]" />
                <h3 className="mb-4 font-['Unbounded'] text-xl font-black uppercase text-white">{item.title}</h3>
                <p className="leading-7 text-[#8A9AAF]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="details" className="bg-[#0A0E14] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-5 font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Де і коли?</p>
              <h2 className="font-['Unbounded'] text-4xl font-black uppercase leading-[1.12] md:text-6xl">Деталі вечора</h2>
            </div>
            <p className="max-w-xl text-[#8A9AAF]">Вхід вільний. Будь ласка, зареєструйтеся заздалегідь, щоб ми могли краще підготуватися.</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="grid gap-5">
              {[
                { title: 'Дата та час', text: '13 червня · 18:00', icon: Calendar },
                { title: 'Місце проведення', text: 'East London Tabernacle Baptist Church · 15 Burdett Road, Mile End, London E3 4TU', icon: MapPin },
                { title: 'Як дістатися', text: 'Mile End Station · приблизно 7 хвилин пішки', icon: Send },
                { title: 'Участь', text: 'Вхід вільний · реєстрація відкрита', icon: CheckCircle2 }
              ].map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-6">
                  <item.icon className="mb-5 h-7 w-7 text-[#B7EFFF]" />
                  <h3 className="mb-2 font-['Inter'] text-xs font-bold uppercase tracking-[0.18em] text-[#B7EFFF]/75">{item.title}</h3>
                  <p className="text-lg leading-7 text-white/85">{item.text}</p>
                </div>
              ))}
              <a href="https://maps.google.com/?q=East+London+Tabernacle+Mile+End" target="_blank" rel="noreferrer" className="inline-flex items-center justify-center gap-3 rounded-full border border-[#B7EFFF]/30 px-6 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.16em] text-[#B7EFFF] transition hover:bg-[#B7EFFF] hover:text-[#0A0E14]">
                <MapIcon className="h-5 w-5" /> Відкрити карту
              </a>
            </div>

            <div className="min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-[#0A0E14]">
              <iframe
                title="East London Tabernacle Baptist Church map"
                src="https://www.google.com/maps?q=East%20London%20Tabernacle%20Baptist%20Church%2015%20Burdett%20Road%20London%20E3%204TU&output=embed"
                className="h-full min-h-[420px] w-full border-0 grayscale-[35%] contrast-95 saturate-[0.75] brightness-[0.82]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      <section id="programme" className="bg-[#111720] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl">
          <p className="mb-5 text-center font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Програма вечора</p>
          <h2 className="mb-16 text-center font-['Unbounded'] text-4xl font-black uppercase leading-[1.12] md:text-6xl">13 червня</h2>

          <div className="space-y-5">
            {[
              ['18:00', 'Двері відкриваються, реєстрація', 'Час для підготовки та вітання гостей.'],
              ['18:30', 'Відкриття вечора', 'Вступне слово та початок молитовного чування.'],
              ['···', 'Поклоніння', 'Спільні співи та прославлення Господа.'],
              ['···', 'Слово Боже', 'Проповідь та духовна настанова.'],
              ['···', 'Спільна молитва за Україну', 'Молитва за мир, військових та кожну сім’ю.'],
              ['20:00', 'Завершення · чай і спілкування', 'Час для єднання та особистих розмов.']
            ].map(([time, title, desc]) => (
              <div key={`${time}-${title}`} className="grid gap-3 border-b border-white/10 py-5 md:grid-cols-[7rem_1fr] md:items-start md:gap-5">
                <span className="font-['Bebas_Neue'] text-5xl leading-none text-[#B7EFFF]">{time}</span>
                <span>
                  <span className="block font-['Inter'] text-lg font-semibold text-white/85 md:text-xl">{title}</span>
                  <span className="mt-2 block text-[#8A9AAF]">{desc}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="mt-16 rounded-[2rem] border border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-lg italic text-[#8A9AAF]">“Прийди як є. Нічого особливого не потрібно.”</p>
          </div>
        </div>
      </section>

      <section className="bg-[#0A0E14] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-['Unbounded'] text-4xl font-black uppercase leading-[1.12] md:text-6xl">Церкви разом за Україну</h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#8A9AAF]">Різні міста. Різні деномінації. Одна молитва — за Україну.</p>
          <div className="mt-14 flex flex-wrap justify-center gap-x-6 gap-y-4 font-['Bebas_Neue'] text-3xl tracking-wide text-[#8A9AAF]/60 md:text-5xl">
            <span>London</span><span className="text-[#B7EFFF]/50">/</span><span>Manchester</span><span className="text-[#B7EFFF]/50">/</span><span>Birmingham</span><span className="text-[#B7EFFF]/50">/</span><span>Bristol</span><span className="text-[#B7EFFF]/50">/</span><span>Leeds</span><span className="text-white">та інші</span>
          </div>
        </div>
      </section>

      <section id="register" className="relative overflow-hidden bg-[#111720] px-5 py-20 md:px-6 md:py-32">
        <div className="absolute left-[-10%] top-[-20%] h-[30rem] w-[30rem] rounded-full bg-[#B7EFFF]/10 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div className="min-w-0">
            <p className="mb-4 font-['Inter'] text-[11px] font-bold uppercase tracking-[0.22em] text-[#B7EFFF] md:text-xs">Реєстрація</p>
            <h2 className="max-w-full font-['Unbounded'] text-[clamp(1.62rem,7vw,2.2rem)] font-black uppercase leading-[1.16] tracking-[-0.035em] text-white md:text-6xl md:leading-[1.12]">
              <span className="block whitespace-nowrap">Зареєструйся</span>
              <span className="block">на вечір</span>
            </h2>
            <p className="mt-5 max-w-xl font-['Inter'] text-base leading-7 text-[#8A9AAF] md:mt-7 md:text-lg md:leading-8">
              Заповни коротку форму, щоб ми могли підготувати місце та краще організувати вечір.
            </p>
          </div>

          <div className="w-full min-w-0 rounded-[1.6rem] border border-[#B7EFFF]/20 bg-[#0A0E14]/80 p-5 shadow-2xl shadow-black/40 backdrop-blur md:rounded-[2rem] md:p-10">
            <NewRegistrationForm />
          </div>
        </div>
      </section>

      <section className="bg-[#0A0E14] px-6 py-24 text-center">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">До події залишилось</p>
          <h2 className="mb-12 font-['Unbounded'] text-4xl font-black uppercase leading-[1.12] tracking-[-0.04em] md:text-6xl">13 червня. Лондон.</h2>
          <NewCountdown targetDate={EVENT_DATE} />
          <a href="#register" className="mt-12 inline-flex rounded-full bg-[#B7EFFF] px-8 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.16em] text-[#0A0E14] transition hover:bg-white">
            Зареєструватись →
          </a>
        </div>
      </section>

      <section className="bg-[#111720] px-6 py-24 md:py-32">
        <div className="mx-auto max-w-3xl">
          <p className="mb-5 text-center font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Поширені питання</p>
          <h2 className="mb-14 text-center font-['Unbounded'] text-4xl font-black uppercase leading-[1.12] md:text-6xl">FAQ</h2>
          <div className="grid gap-5">
            {[
              { q: 'Чи потрібно платити за вхід?', a: 'Ні, вхід вільний. Ми будемо раді бачити кожного.' },
              { q: 'Чи потрібно реєструватися?', a: 'Так, це допомагає нам підготувати комфортне місце для кожного гостя.' },
              { q: 'Чи можна прийти з друзями?', a: 'Так, обов’язково! Чим більше нас буде у спільній молитві, тим краще.' },
              { q: 'Якою мовою буде вечір?', a: 'Переважно українською, з можливими частинами англійською для наших друзів британців.' }
            ].map((item) => (
              <div key={item.q} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-6">
                <h3 className="mb-3 flex items-center gap-3 font-['Inter'] text-lg font-bold text-white"><HelpCircle className="h-5 w-5 text-[#B7EFFF]" />{item.q}</h3>
                <p className="leading-7 text-[#8A9AAF]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0A0E14] px-6 py-24 text-center">
        <div className="mx-auto max-w-5xl">
          <p className="mb-5 font-['Inter'] text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Івана 14:6</p>
          <h2 className="font-['Unbounded'] text-4xl font-black uppercase leading-[1.05] tracking-[-0.04em] md:text-6xl">
            «Я — дорога, правда і життя»
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-[#8A9AAF]">
            У час болю та невідомості ми тримаємося Христа — джерела істини, життя і надії для України.
          </p>
          <a href="#register" className="mt-12 inline-flex rounded-full bg-[#B7EFFF] px-8 py-4 font-['Inter'] text-sm font-bold uppercase tracking-[0.16em] text-[#0A0E14] transition hover:bg-white">
            Зареєструватись →
          </a>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-[#0A0E14] px-6 py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-7 text-center">
          <p className="font-['Inter'] text-sm font-semibold uppercase tracking-[0.16em] text-[#B7EFFF]/80">Молитва за Україну · Лондон 13.06</p>
          <div className="flex gap-4">
            <a href="#" aria-label="Instagram" className="rounded-full border border-[#B7EFFF]/20 bg-white/[0.035] p-3 text-[#B7EFFF] transition hover:bg-[#B7EFFF] hover:text-[#0A0E14]"><Instagram className="h-5 w-5" /></a>
            <a href="#" aria-label="Telegram" className="rounded-full border border-[#B7EFFF]/20 bg-white/[0.035] p-3 text-[#B7EFFF] transition hover:bg-[#B7EFFF] hover:text-[#0A0E14]"><Send className="h-5 w-5" /></a>
            <a href="#" aria-label="WhatsApp" className="rounded-full border border-[#B7EFFF]/20 bg-white/[0.035] p-3 text-[#B7EFFF] transition hover:bg-[#B7EFFF] hover:text-[#0A0E14]"><MessageCircle className="h-5 w-5" /></a>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-[#8A9AAF]">
            <span>#молитвазаукраїну</span>
            <span>#prayforukraine</span>
            <span>#вечірмолитви</span>
          </div>
          <p className="text-sm text-[#8A9AAF]">© 2026 Вечір молитви за Україну. Всі права захищені.</p>
        </div>
      </footer>
    </main>
  );
};

const AdminPage = () => {
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(() => localStorage.getItem('adminToken') || '');
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [registeredCount, setRegisteredCount] = useState(0);
  const [visitCount, setVisitCount] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadStats = async (savedToken = token) => {
    if (!savedToken) return;
    setLoading(true);
    setError('');

    try {
      const data = await apiFetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${savedToken}` }
      });

      setRegistrations(data.registrations || []);
      setRegisteredCount(data.registeredCount || 0);
      setVisitCount(data.visitCount || 0);
    } catch {
      setError('Пароль неправильний або сесія завершилась. Увійдіть ще раз.');
      localStorage.removeItem('adminToken');
      setToken('');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [token]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const data = await apiFetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });

      localStorage.setItem('adminToken', data.token);
      setToken(data.token);
    } catch {
      setError('Неправильний пароль.');
    }
  };

  const downloadExcel = async () => {
    const response = await fetch(`${API_BASE}/api/admin/export`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      setError('Не вдалося завантажити Excel.');
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'registered-guests.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  if (!token) {
    return (
      <main className="min-h-screen bg-[#0A0E14] px-6 py-10 font-['Inter'] text-white">
        <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md items-center">
          <form onSubmit={handleLogin} className="w-full rounded-[2rem] border border-[#B7EFFF]/20 bg-[#111720]/80 p-8 shadow-2xl shadow-black/40 backdrop-blur md:p-10">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Admin</p>
            <h1 className="mb-4 font-['Unbounded'] text-3xl font-black uppercase leading-tight">Вхід до адмін-панелі</h1>
            <p className="mb-8 text-[#8A9AAF]">Введіть пароль, щоб побачити список зареєстрованих гостей.</p>

            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#B7EFFF]/80">Пароль</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-4 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-white outline-none transition placeholder:text-[#8A9AAF]/60 focus:border-[#B7EFFF]/70"
              placeholder="Введіть пароль"
            />

            {error && <p className="mb-4 text-sm text-[#B7EFFF]">{error}</p>}

            <button className="w-full rounded-2xl bg-[#B7EFFF] px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-[#0A0E14] transition hover:bg-white">
              Увійти
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0E14] px-6 py-10 font-['Inter'] text-white md:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-[#B7EFFF]">Вечір молитви за Україну</p>
            <h1 className="font-['Unbounded'] text-4xl font-black uppercase leading-tight md:text-5xl">Admin Dashboard</h1>
            <p className="mt-3 text-[#8A9AAF]">Реєстрації, відвідування сайту та експорт гостей.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => loadStats()} className="rounded-full border border-[#B7EFFF]/25 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#B7EFFF] transition hover:bg-[#B7EFFF] hover:text-[#0A0E14]">Оновити</button>
            <button onClick={downloadExcel} className="rounded-full bg-[#B7EFFF] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#0A0E14] transition hover:bg-white">Download Excel</button>
            <button onClick={() => { localStorage.removeItem('adminToken'); setToken(''); }} className="rounded-full border border-white/10 px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-white/70 transition hover:border-[#B7EFFF] hover:text-[#B7EFFF]">Вийти</button>
          </div>
        </div>

        <div className="mb-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-[#111720]/80 p-8 shadow-2xl shadow-black/20">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8A9AAF]">Зареєстровано людей</p>
            <p className="font-['Bebas_Neue'] text-7xl leading-none text-[#B7EFFF]">{registeredCount}</p>
          </div>
          <div className="rounded-[2rem] border border-white/10 bg-[#111720]/80 p-8 shadow-2xl shadow-black/20">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#8A9AAF]">Відвідувань сайту</p>
            <p className="font-['Bebas_Neue'] text-7xl leading-none text-[#B7EFFF]">{visitCount}</p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#111720]/80 shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
            <h2 className="font-['Unbounded'] text-xl font-black uppercase">Список зареєстрованих</h2>
            {loading && <span className="text-sm text-[#8A9AAF]">Завантаження...</span>}
          </div>

          {error && <p className="p-6 text-[#B7EFFF]">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0A0E14] text-xs uppercase tracking-[0.18em] text-[#8A9AAF]">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Ім’я</th>
                  <th className="px-6 py-4">Прізвище</th>
                  <th className="px-6 py-4">Дата реєстрації</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((person, index) => (
                  <tr key={person.id} className="border-t border-white/10">
                    <td className="px-6 py-4 text-[#8A9AAF]">{index + 1}</td>
                    <td className="px-6 py-4 font-semibold text-white">{person.firstName}</td>
                    <td className="px-6 py-4 font-semibold text-white">{person.lastName}</td>
                    <td className="px-6 py-4 text-[#8A9AAF]">{new Date(person.createdAt).toLocaleString('en-GB')}</td>
                  </tr>
                ))}

                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#8A9AAF]">Поки що немає зареєстрованих гостей.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
};

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '') || '/';

  if (path === '/invitations/admin') {
    return <AdminPage />;
  }

  if (path === '/old') {
    return <OldPublicSite />;
  }

  return <PublicSite />;
}
