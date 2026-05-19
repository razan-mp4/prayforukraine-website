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

const PublicSite = () => {
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
  <div className="absolute inset-0 bg-gradient-to-r from-brand-white/95 via-brand-white/60 to-brand-white/15 z-10" />
  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-brand-white/70 z-10" />

  <img 
    src="/images/hero-prayer-ukraine.png" 
    alt="Prayer background" 
    className="w-full h-full object-cover grayscale opacity-70 max-md:object-[30%_center]" 
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
      13 червня. Лондон. <br /> Одна молитва за Україну.
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
    } catch (err) {
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
      <main className="min-h-screen bg-brand-white flex items-center justify-center px-6">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-brand-red/10 border border-brand-charcoal/5 p-8 md:p-10">
          <p className="text-sm uppercase tracking-widest text-brand-red font-bold mb-3">Admin</p>
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-3">Вхід до адмін-панелі</h1>
          <p className="text-brand-gray mb-8">Введіть пароль, щоб побачити список зареєстрованих гостей.</p>

          <label className="block text-sm font-medium text-brand-gray mb-2">Пароль</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-brand-charcoal/10 focus:border-brand-red outline-none transition-colors bg-white/50 mb-4"
            placeholder="Введіть пароль"
          />

          {error && <p className="text-brand-red text-sm mb-4">{error}</p>}

          <button className="w-full py-4 bg-brand-red text-white font-bold rounded-xl hover:bg-brand-red-light transition-all">
            Увійти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-brand-white px-6 py-10 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
          <div>
            <p className="text-sm uppercase tracking-widest text-brand-red font-bold mb-3">Вечір молитви за Україну</p>
            <h1 className="text-4xl md:text-5xl font-serif font-bold">Admin Dashboard</h1>
            <p className="text-brand-gray mt-3">Реєстрації, відвідування сайту та експорт гостей.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button onClick={() => loadStats()} className="px-5 py-3 rounded-xl border border-brand-charcoal/10 bg-white hover:border-brand-red transition-all font-medium">
              Оновити
            </button>
            <button onClick={downloadExcel} className="px-5 py-3 rounded-xl bg-brand-red text-white hover:bg-brand-red-light transition-all font-bold">
              Download Excel
            </button>
            <button onClick={() => { localStorage.removeItem('adminToken'); setToken(''); }} className="px-5 py-3 rounded-xl border border-brand-charcoal/10 bg-white hover:border-brand-red transition-all font-medium">
              Вийти
            </button>
          </div>
        </div>

<div className="grid md:grid-cols-2 gap-6 mb-10">
  <div className="bg-white p-8 rounded-3xl border border-brand-charcoal/5 shadow-sm">
    <p className="text-brand-gray font-medium mb-2">Зареєстровано людей</p>
    <p className="text-5xl font-serif font-bold text-brand-red">{registeredCount}</p>
  </div>

  <div className="bg-white p-8 rounded-3xl border border-brand-charcoal/5 shadow-sm">
    <p className="text-brand-gray font-medium mb-2">Відвідувань сайту</p>
    <p className="text-5xl font-serif font-bold text-brand-red">{visitCount}</p>
  </div>
</div>

        <div className="bg-white rounded-3xl border border-brand-charcoal/5 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-brand-charcoal/5 flex items-center justify-between">
            <h2 className="text-2xl font-serif font-bold">Список зареєстрованих</h2>
            {loading && <span className="text-sm text-brand-gray">Завантаження...</span>}
          </div>

          {error && <p className="p-6 text-brand-red">{error}</p>}

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-brand-rose/10 text-sm uppercase tracking-widest text-brand-gray">
                <tr>
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">Ім’я</th>
                  <th className="px-6 py-4">Прізвище</th>
                  <th className="px-6 py-4">Дата реєстрації</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((person, index) => (
                  <tr key={person.id} className="border-t border-brand-charcoal/5">
                    <td className="px-6 py-4 text-brand-gray">{index + 1}</td>
                    <td className="px-6 py-4 font-medium">{person.firstName}</td>
                    <td className="px-6 py-4 font-medium">{person.lastName}</td>
                    <td className="px-6 py-4 text-brand-gray">{new Date(person.createdAt).toLocaleString('en-GB')}</td>
                  </tr>
                ))}

                {registrations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-brand-gray">
                      Поки що немає зареєстрованих гостей.
                    </td>
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

  return <PublicSite />;
}
