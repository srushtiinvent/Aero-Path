import { type ChangeEvent, type ReactNode, useEffect, useMemo, useState, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowLeftRight, ArrowRight, BadgeCheck, CalendarDays, Check, ChevronDown,
  Building2, ChevronLeft, CircleHelp, CloudSun, Compass, CreditCard, Filter,
  Globe2, Heart, House, Luggage, MapPin, Menu, Moon, Plane, Plus, Search, ShieldCheck,
  FileUp, LogOut, MessageCircle, Send, SlidersHorizontal, Sparkles, SunMedium,
  Upload, UserRound, UsersRound, X, Zap,
} from 'lucide-react';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import worldGeoJson from './data/world.json';

const queryClient = new QueryClient();

type Flight = {
  id: string; airline: string; code: string; from: string; to: string;
  depart: string; arrive: string; duration: string; stops: string;
  stopNote: string; price: number; cabin: string; tint: string; badge?: string;
};

const flights: Flight[] = [
  { id: 'aurora-1', airline: 'Aurora Air', code: 'AA', from: 'SFO', to: 'JFK', depart: '7:40 AM', arrive: '4:12 PM', duration: '5h 32m', stops: 'Nonstop', stopNote: 'Direct flight', price: 382, cabin: 'Main Cabin', tint: '#e5b65f', badge: 'Best overall' },
  { id: 'pacific-2', airline: 'Pacific Skies', code: 'PS', from: 'SFO', to: 'JFK', depart: '9:15 AM', arrive: '6:01 PM', duration: '5h 46m', stops: 'Nonstop', stopNote: 'Direct flight', price: 347, cabin: 'Economy', tint: '#6c9ea0' },
  { id: 'northstar-3', airline: 'Northstar', code: 'NS', from: 'SFO', to: 'JFK', depart: '11:55 AM', arrive: '9:02 PM', duration: '6h 07m', stops: 'Nonstop', stopNote: 'Direct flight', price: 419, cabin: 'Main Cabin', tint: '#d78d7f' },
  { id: 'aurora-4', airline: 'Aurora Air', code: 'AA', from: 'SFO', to: 'JFK', depart: '2:20 PM', arrive: '11:01 PM', duration: '5h 41m', stops: 'Nonstop', stopNote: 'Direct flight', price: 298, cabin: 'Economy', tint: '#e5b65f' },
  { id: 'atlas-5', airline: 'Atlas & Co.', code: 'AC', from: 'SFO', to: 'JFK', depart: '6:10 AM', arrive: '3:18 PM', duration: '7h 08m', stops: '1 stop', stopNote: 'Denver · 58m layover', price: 264, cabin: 'Economy', tint: '#8b91b9' },
];

const savedSeed = new Set(['aurora-1']);

function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5" data-testid="brand-aeropath">
      <div className="relative grid size-9 place-items-center rounded-[12px] bg-[#e7b95d] text-[#18323c] shadow-[0_6px_14px_rgba(229,182,95,.2)]">
        <Plane size={18} strokeWidth={2.4} className="-rotate-12" />
        <span className="absolute -right-1 -top-1 size-2 rounded-full bg-[#ef907c]" />
      </div>
      {!compact && <span className="brand-name text-[20px] font-bold tracking-[-.04em]">aeropath</span>}
    </div>
  );
}

function AnimatedThemeToggler({ theme, onToggle }: { theme: 'light' | 'dark'; onToggle: () => void }) {
  const [ripple, setRipple] = useState<{ x: number; y: number; color: string } | null>(null);
  const handleToggle = (event: React.MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setRipple({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, color: theme === 'light' ? '#15343b' : '#fbf8f1' });
    onToggle();
    window.setTimeout(() => setRipple(null), 720);
  };
  return <>
    <button onClick={handleToggle} className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`} data-testid="button-theme-toggle">
      <span key={theme} className="theme-toggle-icon" aria-hidden="true">
        {theme === 'light' ? <Moon size={15} /> : <SunMedium size={15} />}
      </span>
    </button>
    {ripple && <span className="theme-ripple" style={{ left: ripple.x, top: ripple.y, backgroundColor: ripple.color }} aria-hidden="true" />}
  </>;
}

function NavBar({ view, onNavigate, onAccount, theme, onThemeToggle, navigationPulse, navigationTarget }: { view: string; onNavigate: (v: string) => void; onAccount: () => void; theme: 'light' | 'dark'; onThemeToggle: () => void; navigationPulse: boolean; navigationTarget: string | null }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);
  const [planeX, setPlaneX] = useState(0);

  useEffect(() => {
    if (navigationPulse && navigationTarget && rowRef.current) {
      const targetButton = rowRef.current.querySelector(`[data-nav-id="${navigationTarget}"]`) as HTMLElement | null;
      if (targetButton) {
        const targetRect = targetButton.getBoundingClientRect();
        const rowRect = rowRef.current.getBoundingClientRect();
        setPlaneX(targetRect.left - rowRect.left);
      }
    }
  }, [navigationPulse, navigationTarget]);

  return (
    <header className="site-header relative z-30 border-b border-[#dfd8ca] bg-[#f8f5ee]/90 backdrop-blur-xl">
      <div ref={rowRef} className="relative mx-auto flex h-[74px] max-w-[1240px] items-center justify-between px-5 lg:px-8">
        {navigationPulse && navigationTarget && (
          <span className="nav-flight-plane" style={{ ['--flight-target-x' as string]: `${planeX}px` }} aria-hidden="true"><Plane size={18} /></span>
        )}
        <button onClick={() => onNavigate('home')} aria-label="Go to AeroPath home" data-testid="button-logo"><Logo /></button>
        <div className="hidden items-center gap-6 md:flex">
          <nav className="main-nav relative flex items-center gap-7" aria-label="Main navigation">
            <button data-nav-id="home" onClick={() => onNavigate('home')} className={`nav-link ${view === 'home' ? 'active' : ''}`} data-testid="nav-home"><House size={14} /> Home</button>
            <button data-nav-id="add" onClick={() => onNavigate('add')} className={`nav-link ${view === 'add' || view === 'results' ? 'active' : ''}`} data-testid="nav-add-trip"><Plus size={14} /> Add trip</button>
            <button data-nav-id="boarding" onClick={() => onNavigate('boarding')} className={`nav-link ${view === 'boarding' ? 'active' : ''}`} data-testid="nav-boarding-pass"><CreditCard size={14} /> Boarding pass</button>
            <button data-nav-id="help" onClick={() => onNavigate('help')} className={`nav-link ${view === 'help' ? 'active' : ''}`} data-testid="nav-help"><CircleHelp size={14} /> Help</button>
            <button data-nav-id="map" onClick={() => onNavigate('map')} className={`nav-link ${view === 'map' ? 'active' : ''}`} data-testid="nav-travel-map"><Globe2 size={14} /> Travel map</button>
          </nav>
          <AnimatedThemeToggler theme={theme} onToggle={onThemeToggle} />
          <button onClick={onAccount} className="profile-button" data-testid="button-profile"><span className="profile-avatar">JM</span> Profile</button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-full border border-[#dfd8ca] md:hidden" aria-label="Open menu" data-testid="button-mobile-menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      {menuOpen && <div className="border-t border-[#dfd8ca] bg-[#f8f5ee] px-5 py-4 md:hidden">
        <div className="grid gap-1">
          <button onClick={() => { onNavigate('home'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-home"><House size={15} /> Home</button>
          <button onClick={() => { onNavigate('add'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-add-trip"><Plus size={15} /> Add trip</button>
          <button onClick={() => { onNavigate('boarding'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-boarding-pass"><CreditCard size={15} /> Boarding pass</button>
          <button onClick={() => { onNavigate('help'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-help"><CircleHelp size={15} /> Help</button>
          <button onClick={() => { onNavigate('map'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-travel-map"><Globe2 size={15} /> Travel map</button>
          <button onClick={() => { onAccount(); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-profile"><UserRound size={15} /> Profile</button>
          <button onClick={() => { onThemeToggle(); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-theme">{theme === 'light' ? <Moon size={15} /> : <SunMedium size={15} />} {theme === 'light' ? 'Dark theme' : 'Light theme'}</button>
        </div>
      </div>}
    </header>
  );
}

function SearchPanel({ onSearch }: { onSearch: (from: string, to: string, depart: string, returning: string) => void }) {
  const [from, setFrom] = useState('San Francisco (SFO)');
  const [to, setTo] = useState('New York (JFK)');
  const [depart, setDepart] = useState('Oct 18, 2026');
  const [returning, setReturning] = useState('Oct 25, 2026');
  const [roundTrip, setRoundTrip] = useState(true);
  const [travellers, setTravellers] = useState('1 traveller · Economy');
  const swap = () => { setFrom(to); setTo(from); };
  return (
    <section className="relative z-10 mx-auto -mt-1 max-w-[1120px] px-5 lg:px-0">
      <div className="search-card rounded-[22px] border border-[#e2dacc] bg-[#fffdf8] p-3 shadow-[0_18px_55px_rgba(37,62,65,.1)]">
        <div className="mb-2 flex items-center gap-3 px-2 pt-1 text-xs font-semibold text-[#6b7777]">
          <button onClick={() => setRoundTrip(true)} className={roundTrip ? 'trip-toggle active' : 'trip-toggle'} data-testid="toggle-round-trip">Round trip</button>
          <button onClick={() => setRoundTrip(false)} className={!roundTrip ? 'trip-toggle active' : 'trip-toggle'} data-testid="toggle-one-way">One way</button>
          <span className="ml-auto hidden items-center gap-1 text-[#7c8c89] sm:flex"><ShieldCheck size={14} /> Flexible booking</span>
        </div>
        <div className="grid gap-2 lg:grid-cols-[1.45fr_1.45fr_1.15fr_1.15fr_1.12fr_auto]">
          <SearchField icon={<Plane size={16} />} label="From" value={from} onChange={setFrom} placeholder="City or airport" testId="input-from">
            <button onClick={swap} className="swap-button" aria-label="Swap airports" data-testid="button-swap"><ArrowLeftRight size={15} /></button>
          </SearchField>
          <SearchField icon={<Plane size={16} />} label="To" value={to} onChange={setTo} placeholder="City or airport" testId="input-to" />
          <SearchField icon={<CalendarDays size={16} />} label="Depart" value={depart} onChange={setDepart} type="text" testId="input-depart" />
          <SearchField icon={<CalendarDays size={16} />} label="Return" value={returning} onChange={setReturning} disabled={!roundTrip} testId="input-return" />
          <label className="search-field">
            <span className="field-label"><Luggage size={15} /> Travellers</span>
            <select value={travellers} onChange={(e) => setTravellers(e.target.value)} data-testid="select-travellers" className="field-control cursor-pointer appearance-none bg-transparent pr-5">
              <option>1 traveller · Economy</option><option>2 travellers · Economy</option><option>1 traveller · Premium</option>
            </select><ChevronDown size={15} className="pointer-events-none absolute right-3 bottom-4 text-[#83908d]" />
          </label>
          <button onClick={() => onSearch(from, to, depart, returning)} className="search-submit" data-testid="button-search"><Search size={18} /><span className="lg:hidden">Find flights</span></button>
        </div>
      </div>
    </section>
  );
}

function SearchField({ icon, label, value, onChange, placeholder, disabled, testId, children }: { icon: ReactNode; label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean; testId: string; type?: string; children?: ReactNode }) {
  return <label className={`search-field ${disabled ? 'opacity-45' : ''}`}>
    <span className="field-label">{icon} {label}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} className="field-control" data-testid={testId} />
    {children}
  </label>;
}

const hotels = [
  { id: 'mumbai-house', name: 'The Bombay House', area: 'Colaba, Mumbai', rating: '4.8', reviews: '1,284', price: 118, tint: 'hotel-sand' },
  { id: 'sea-facing', name: 'Sea & Sky Retreat', area: 'Bandra West, Mumbai', rating: '4.6', reviews: '842', price: 96, tint: 'hotel-sea' },
  { id: 'garden-court', name: 'Garden Court Hotel', area: 'Fort, Mumbai', rating: '4.7', reviews: '619', price: 83, tint: 'hotel-coral' },
];

function HotelSearchPanel({ onSearch }: { onSearch: (destination: string, checkIn: string, checkOut: string, guests: string) => void }) {
  const [destination, setDestination] = useState('Mumbai');
  const [checkIn, setCheckIn] = useState('Oct 18, 2026');
  const [checkOut, setCheckOut] = useState('Oct 21, 2026');
  const [guests, setGuests] = useState('2 guests · 1 room');
  return <section className="relative z-10 mx-auto max-w-[1120px] px-5 lg:px-0">
    <div className="hotel-search-card search-card rounded-[22px] border border-[#e2dacc] bg-[#fffdf8] p-3 shadow-[0_18px_55px_rgba(37,62,65,.1)]">
      <div className="mb-2 flex items-center gap-1 px-2 pt-1 text-xs font-semibold text-[#6b7777]"><span className="search-card-note"><Building2 size={14} /> Find a stay that fits the trip</span><span className="ml-auto hidden items-center gap-1 text-[#7c8c89] sm:flex"><ShieldCheck size={14} /> Flexible booking</span></div>
      <div className="grid gap-2 lg:grid-cols-[1.55fr_1.15fr_1.15fr_1.15fr_auto]">
        <SearchField icon={<MapPin size={16} />} label="Destination" value={destination} onChange={setDestination} placeholder="City or neighbourhood" testId="input-hotel-destination" />
        <SearchField icon={<CalendarDays size={16} />} label="Check in" value={checkIn} onChange={setCheckIn} testId="input-hotel-check-in" />
        <SearchField icon={<CalendarDays size={16} />} label="Check out" value={checkOut} onChange={setCheckOut} testId="input-hotel-check-out" />
        <label className="search-field">
          <span className="field-label"><UsersRound size={15} /> Guests</span>
          <select value={guests} onChange={(e) => setGuests(e.target.value)} data-testid="select-hotel-guests" className="field-control cursor-pointer appearance-none bg-transparent pr-5">
            <option>2 guests · 1 room</option><option>1 guest · 1 room</option><option>4 guests · 2 rooms</option>
          </select><ChevronDown size={15} className="pointer-events-none absolute right-3 bottom-4 text-[#83908d]" />
        </label>
        <button onClick={() => onSearch(destination, checkIn, checkOut, guests)} className="search-submit" data-testid="button-search-hotels"><Search size={18} /><span className="lg:hidden">Find stays</span></button>
      </div>
    </div>
  </section>;
}

function HotelResults({ search }: { search: { destination: string; checkIn: string; checkOut: string; guests: string } }) {
  const [added, setAdded] = useState<string | null>(null);
  return <section className="hotel-results rise-in">
    <div className="hotel-results-heading"><div><p className="section-kicker">A few good places</p><h2>{search.destination} <em>stays.</em></h2><p>{search.checkIn} – {search.checkOut} · {search.guests}</p></div><span className="hotel-results-count">{hotels.length} stays</span></div>
    <div className="hotel-grid">{hotels.map((hotel, index) => <article key={hotel.id} className={`hotel-card rise-in delay-${index + 1}`}>
      <div className={`hotel-photo ${hotel.tint}`}><span className="hotel-photo-mark"><Building2 size={19} /></span><span className="hotel-photo-label">AeroPath stay</span></div>
      <div className="hotel-card-content"><div className="flex items-start justify-between gap-3"><div><h3>{hotel.name}</h3><p className="hotel-area">{hotel.area}</p></div><span className="hotel-rating"><span>★</span> {hotel.rating}</span></div><div className="hotel-card-bottom"><span className="hotel-price"><strong>${hotel.price}</strong> / night</span><button onClick={() => setAdded(added === hotel.id ? null : hotel.id)} className={`hotel-add ${added === hotel.id ? 'added' : ''}`} data-testid={`button-add-hotel-${hotel.id}`}>{added === hotel.id ? <Check size={14} /> : <Plus size={14} />} {added === hotel.id ? 'Added' : 'Add to trip'}</button></div><span className="hotel-reviews">{hotel.reviews} stays reviewed · free cancellation</span></div>
    </article>)}</div>
  </section>;
}

function HomeView() {
  return <main className="min-h-[calc(100dvh-74px)] overflow-hidden">
    <section className="hero-section relative">
      <div className="hero-orb orb-one" /><div className="hero-orb orb-two" />
      <div className="hero-dot-wash" aria-hidden="true" />
      <span className="hero-spark hero-spark-one" aria-hidden="true" />
      <span className="hero-spark hero-spark-two" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-[1240px] items-center gap-8 px-5 pb-32 pt-20 lg:grid-cols-[1.02fr_.98fr] lg:px-8 lg:pb-40 lg:pt-28">
        <div className="rise-in">
          <div className="eyebrow"><span className="eyebrow-dot" /> Travel, at a gentler pace</div>
          <h1 className="hero-title">Find the flight<br /><em>that feels right.</em></h1>
          <p className="hero-copy">A calmer way to get there. Compare your options without the noise, then save the ones worth dreaming about.</p>
        </div>
        <div className="relative hidden min-h-[340px] lg:block">
          <div className="route-art float-slow">
            <div className="hero-dot-pattern" aria-hidden="true" />
            <div className="sun-disc"><SunMedium size={30} /></div>
            <div className="cloud cloud-a" /><div className="cloud cloud-b" />
            <div className="route-dash" />
            <div className="route-dot dot-a" /><div className="route-dot dot-b" />
            <div className="route-plane"><Plane size={26} /></div>
          </div>
        </div>
      </div>
    </section>
    <TravelLoopDivider />
    <section className="mx-auto max-w-[1120px] px-5 pb-20 pt-24 lg:px-0">
      <div className="grid items-start gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div><p className="section-kicker">A little more human</p><h2 className="section-title">Good trips start<br /><em>before takeoff.</em></h2></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Feature icon={<Compass />} title="See the whole picture" copy="Clear fares, real timings, no clutter." />
          <Feature icon={<Heart />} title="Keep the maybes" copy="Save a few options and come back when ready." />
          <Feature icon={<Zap />} title="Move at your pace" copy="A faster search, a slower decision." />
        </div>
      </div>
    </section>
  </main>;
}

function AddTripView({ onSearch }: { onSearch: (from: string, to: string, depart: string, returning: string) => void }) {
  const [mode, setMode] = useState<'flight' | 'hotel'>('flight');
  const [hotelSearching, setHotelSearching] = useState(false);
  const [hotelSearch, setHotelSearch] = useState<{ destination: string; checkIn: string; checkOut: string; guests: string } | null>(null);
  const searchHotels = (destination: string, checkIn: string, checkOut: string, guests: string) => {
    setHotelSearch({ destination, checkIn, checkOut, guests });
    setHotelSearching(true);
    window.setTimeout(() => setHotelSearching(false), 500);
  };
  return <main className="add-trip-page min-h-[calc(100dvh-74px)]">
    <div className="mx-auto max-w-[1120px] px-5 py-14 lg:px-0 lg:py-20">
      <div className="add-trip-intro rise-in">
        <div className="eyebrow"><span className="eyebrow-dot" /> Plan something good</div>
        <h1 className="results-title">Where will you <em>go next?</em></h1>
        <p>Build a trip at your own pace. We’ll keep the details clear and the good options close.</p>
      </div>
      <div className="trip-type-toggle" role="tablist" aria-label="Choose what to add">
        <button onClick={() => { setMode('flight'); setHotelSearch(null); }} className={mode === 'flight' ? 'active' : ''} role="tab" aria-selected={mode === 'flight'} data-testid="tab-add-flight"><Plane size={16} /> Flight</button>
        <button onClick={() => setMode('hotel')} className={mode === 'hotel' ? 'active' : ''} role="tab" aria-selected={mode === 'hotel'} data-testid="tab-add-hotel"><Building2 size={16} /> Hotel</button>
      </div>
      {mode === 'flight' ? <SearchPanel onSearch={onSearch} /> : <HotelSearchPanel onSearch={searchHotels} />}
      {mode === 'hotel' && hotelSearching && <div className="hotel-loading"><div className="skeleton h-5 w-44 rounded-full" /><div className="skeleton h-3 w-64 rounded-full" /></div>}
      {mode === 'hotel' && !hotelSearching && hotelSearch && <HotelResults search={hotelSearch} />}
    </div>
  </main>;
}

function BoardingPassView() {
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setUploadedFile(file.name);
  };
  return <main className="secondary-page min-h-[calc(100dvh-74px)]">
    <div className="mx-auto max-w-[880px] px-5 py-14 lg:px-0 lg:py-20">
      <div className="eyebrow mb-4"><span className="eyebrow-dot" /> Ready when you are</div>
      <h1 className="results-title">Your next <em>boarding pass.</em></h1>
      <p className="secondary-copy">Keep the essentials close, without digging through an inbox.</p>
      <label className="upload-pass-button rise-in" data-testid="button-upload-boarding-pass">
        <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={handleUpload} />
        <Upload size={17} /> Upload boarding pass
        <span>PDF, PNG or JPG</span>
      </label>
      {uploadedFile && <div className="upload-success rise-in"><div className="upload-success-icon"><FileUp size={16} /></div><div><strong>{uploadedFile}</strong><span>Added to your trip · ready to view offline</span></div><Check size={17} /></div>}
      <article className="boarding-card rise-in">
        <div className="boarding-top"><div><span className="ticket-label">Aurora Air · AA 204</span><h2>San Francisco <ArrowRight size={22} /> New York</h2><span className="ticket-subtitle">Sunday, October 18, 2026 · Main Cabin</span></div><div className="ticket-status"><BadgeCheck size={15} /> Confirmed</div></div>
        <div className="boarding-route"><div><span>Departure</span><strong>7:40 AM</strong><small>SFO · Terminal 2</small></div><div className="ticket-line"><Plane size={18} /><span /></div><div className="text-right"><span>Arrival</span><strong>4:12 PM</strong><small>JFK · Terminal 5</small></div></div>
        <div className="boarding-bottom"><div className="barcode" aria-label="Boarding pass barcode">{Array.from({ length: 28 }, (_, i) => <i key={i} style={{ width: `${i % 4 === 0 ? 3 : 1}px` }} />)}</div><div className="ticket-meta"><span>Seat <strong>14A</strong></span><span>Group <strong>2</strong></span><span>Gate <strong>B18</strong></span></div></div>
      </article>
    </div>
  </main>;
}

function HelpView() {
  const questions = ['How do I save a flight?', 'Can I change a trip after I add it?', 'What does flexible booking mean?'];
  const answers = [
    'Tap the heart on any flight card. Your shortlist will stay close in Saved trips while you compare.',
    'Yes. Open Add trip whenever you want to create a fresh route and keep your existing plans untouched.',
    'It means your fare includes more flexibility if your plans shift. Look for the shield on eligible options.',
  ];
  const [openIndex, setOpenIndex] = useState(0);
  return <main className="secondary-page min-h-[calc(100dvh-74px)]">
    <div className="mx-auto max-w-[880px] px-5 py-14 lg:px-0 lg:py-20">
      <div className="eyebrow mb-4"><span className="eyebrow-dot" /> A little help, right this way</div>
      <h1 className="results-title">Travel planning, <em>without the guesswork.</em></h1>
      <p className="secondary-copy">A few quick answers for the moments when you want to keep moving.</p>
      <div className="help-list motion-help-list rise-in">{questions.map((question, index) => <div key={question} className={`help-item ${openIndex === index ? 'is-open' : ''}`}><button onClick={() => setOpenIndex(openIndex === index ? -1 : index)} className="help-question" aria-expanded={openIndex === index} data-testid={`help-question-${index}`}><span>{question}</span><ChevronDown size={16} /></button><div className="help-answer"><p>{answers[index]}</p></div></div>)}</div>
      <button className="primary-button mt-6" onClick={() => window.location.href = 'mailto:hello@aeropath.app'} data-testid="button-contact-help"><CircleHelp size={16} /> Contact the AeroPath team</button>
    </div>
  </main>;
}

function Feature({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return <div className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{copy}</p></div>;
}

type TravelCity = { id: string; city: string; country: string; latitude: number; longitude: number };

const travelCities: TravelCity[] = [
  { id: 'mumbai', city: 'Mumbai', country: 'India', latitude: 19.076, longitude: 72.878 },
  { id: 'delhi', city: 'New Delhi', country: 'India', latitude: 28.614, longitude: 77.209 },
  { id: 'bengaluru', city: 'Bengaluru', country: 'India', latitude: 12.972, longitude: 77.595 },
  { id: 'london', city: 'London', country: 'United Kingdom', latitude: 51.507, longitude: -0.128 },
  { id: 'paris', city: 'Paris', country: 'France', latitude: 48.857, longitude: 2.352 },
  { id: 'rome', city: 'Rome', country: 'Italy', latitude: 41.902, longitude: 12.496 },
  { id: 'amsterdam', city: 'Amsterdam', country: 'Netherlands', latitude: 52.368, longitude: 4.904 },
  { id: 'barcelona', city: 'Barcelona', country: 'Spain', latitude: 41.388, longitude: 2.17 },
  { id: 'berlin', city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405 },
  { id: 'istanbul', city: 'Istanbul', country: 'Türkiye', latitude: 41.008, longitude: 28.978 },
  { id: 'athens', city: 'Athens', country: 'Greece', latitude: 37.984, longitude: 23.728 },
  { id: 'lisbon', city: 'Lisbon', country: 'Portugal', latitude: 38.722, longitude: -9.139 },
  { id: 'new-york', city: 'New York', country: 'United States', latitude: 40.713, longitude: -74.006 },
  { id: 'los-angeles', city: 'Los Angeles', country: 'United States', latitude: 34.052, longitude: -118.244 },
  { id: 'san-francisco', city: 'San Francisco', country: 'United States', latitude: 37.775, longitude: -122.419 },
  { id: 'chicago', city: 'Chicago', country: 'United States', latitude: 41.878, longitude: -87.63 },
  { id: 'miami', city: 'Miami', country: 'United States', latitude: 25.761, longitude: -80.192 },
  { id: 'toronto', city: 'Toronto', country: 'Canada', latitude: 43.653, longitude: -79.383 },
  { id: 'vancouver', city: 'Vancouver', country: 'Canada', latitude: 49.282, longitude: -123.12 },
  { id: 'mexico-city', city: 'Mexico City', country: 'Mexico', latitude: 19.432, longitude: -99.133 },
  { id: 'sao-paulo', city: 'São Paulo', country: 'Brazil', latitude: -23.551, longitude: -46.633 },
  { id: 'rio-de-janeiro', city: 'Rio de Janeiro', country: 'Brazil', latitude: -22.906, longitude: -43.173 },
  { id: 'buenos-aires', city: 'Buenos Aires', country: 'Argentina', latitude: -34.604, longitude: -58.382 },
  { id: 'lima', city: 'Lima', country: 'Peru', latitude: -12.046, longitude: -77.043 },
  { id: 'santiago', city: 'Santiago', country: 'Chile', latitude: -33.449, longitude: -70.669 },
  { id: 'cape-town', city: 'Cape Town', country: 'South Africa', latitude: -33.925, longitude: 18.424 },
  { id: 'cairo', city: 'Cairo', country: 'Egypt', latitude: 30.044, longitude: 31.236 },
  { id: 'nairobi', city: 'Nairobi', country: 'Kenya', latitude: -1.292, longitude: 36.822 },
  { id: 'marrakesh', city: 'Marrakesh', country: 'Morocco', latitude: 31.629, longitude: -7.981 },
  { id: 'lagos', city: 'Lagos', country: 'Nigeria', latitude: 6.524, longitude: 3.379 },
  { id: 'dubai', city: 'Dubai', country: 'United Arab Emirates', latitude: 25.205, longitude: 55.271 },
  { id: 'doha', city: 'Doha', country: 'Qatar', latitude: 25.286, longitude: 51.533 },
  { id: 'riyadh', city: 'Riyadh', country: 'Saudi Arabia', latitude: 24.714, longitude: 46.675 },
  { id: 'tel-aviv', city: 'Tel Aviv', country: 'Israel', latitude: 32.085, longitude: 34.782 },
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', latitude: 35.676, longitude: 139.65 },
  { id: 'seoul', city: 'Seoul', country: 'South Korea', latitude: 37.566, longitude: 126.978 },
  { id: 'beijing', city: 'Beijing', country: 'China', latitude: 39.904, longitude: 116.408 },
  { id: 'shanghai', city: 'Shanghai', country: 'China', latitude: 31.23, longitude: 121.474 },
  { id: 'hong-kong', city: 'Hong Kong', country: 'China', latitude: 22.319, longitude: 114.169 },
  { id: 'singapore', city: 'Singapore', country: 'Singapore', latitude: 1.352, longitude: 103.82 },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', latitude: 13.756, longitude: 100.502 },
  { id: 'hanoi', city: 'Hanoi', country: 'Vietnam', latitude: 21.028, longitude: 105.834 },
  { id: 'bali', city: 'Denpasar', country: 'Indonesia', latitude: -8.65, longitude: 115.216 },
  { id: 'sydney', city: 'Sydney', country: 'Australia', latitude: -33.869, longitude: 151.209 },
  { id: 'melbourne', city: 'Melbourne', country: 'Australia', latitude: -37.814, longitude: 144.963 },
  { id: 'auckland', city: 'Auckland', country: 'New Zealand', latitude: -36.85, longitude: 174.764 },
  { id: 'istanbul-asia', city: 'Ankara', country: 'Türkiye', latitude: 39.933, longitude: 32.86 },
  { id: 'vienna', city: 'Vienna', country: 'Austria', latitude: 48.208, longitude: 16.373 },
  { id: 'prague', city: 'Prague', country: 'Czechia', latitude: 50.076, longitude: 14.438 },
  { id: 'zurich', city: 'Zurich', country: 'Switzerland', latitude: 47.376, longitude: 8.541 },
  { id: 'stockholm', city: 'Stockholm', country: 'Sweden', latitude: 59.329, longitude: 18.069 },
  { id: 'oslo', city: 'Oslo', country: 'Norway', latitude: 59.913, longitude: 10.752 },
  { id: 'reykjavik', city: 'Reykjavík', country: 'Iceland', latitude: 64.146, longitude: -21.942 },
];

type GeoRing = [number, number][];
type WorldMapGeometry = { type: 'Polygon'; coordinates: GeoRing[] } | { type: 'MultiPolygon'; coordinates: GeoRing[][] };
const projectPoint = ([longitude, latitude]: number[]) => `${((longitude + 180) / 360) * 1000},${((90 - latitude) / 180) * 500}`;
const geometryPath = (geometry: WorldMapGeometry) => {
  const rings = geometry.type === 'Polygon' ? geometry.coordinates : geometry.coordinates.flat();
  return rings.map((ring) => `${ring.map((point, index) => `${index === 0 ? 'M' : 'L'}${projectPoint(point)}`).join('')}Z`).join('');
};
const worldMapPaths = (worldGeoJson.features as unknown as Array<{ geometry: WorldMapGeometry }>).map((feature) => geometryPath(feature.geometry));

function TravelMapView() {
  const [pinned, setPinned] = useState<Set<string>>(new Set());
  const [pinnedRecords, setPinnedRecords] = useState<Record<string, TravelCity>>({});
  const [query, setQuery] = useState('');
  const [remoteResults, setRemoteResults] = useState<TravelCity[]>([]);
  const [searchingCities, setSearchingCities] = useState(false);
  const [showCityNames, setShowCityNames] = useState(true);

  const normalizedQuery = query.trim().toLocaleLowerCase();

  const localResults = normalizedQuery
    ? travelCities.filter((city) =>
        `${city.city} ${city.country}`.toLocaleLowerCase().includes(normalizedQuery),
      )
    : [];

  useEffect(() => {
    const searchTerm = query.trim();

    if (searchTerm.length < 2) {
      setRemoteResults([]);
      setSearchingCities(false);
      return;
    }

    const controller = new AbortController();
    setSearchingCities(true);

    fetch(
      `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&featuretype=city&q=${encodeURIComponent(searchTerm)}`,
      {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      },
    )
      .then((response) => (response.ok ? response.json() : []))
      .then(
        (
          results: Array<{
            place_id: number;
            lat: string;
            lon: string;
            name?: string;
            display_name?: string;
            address?: {
              city?: string;
              town?: string;
              village?: string;
              municipality?: string;
              country?: string;
            };
          }>,
        ) => {
          const cities = results
            .map((result) => ({
              id: `osm-${result.place_id}`,
              city:
                result.address?.city ||
                result.address?.town ||
                result.address?.village ||
                result.address?.municipality ||
                result.name ||
                searchTerm,
              country:
                result.address?.country ||
                result.display_name?.split(',').at(-1)?.trim() ||
                'Unknown country',
              latitude: Number(result.lat),
              longitude: Number(result.lon),
            }))
            .filter(
              (city) =>
                Number.isFinite(city.latitude) &&
                Number.isFinite(city.longitude),
            );

          setRemoteResults(cities);
        },
      )
      .catch(() => {
        if (!controller.signal.aborted) setRemoteResults([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setSearchingCities(false);
      });

    return () => controller.abort();
  }, [query]);

  const searchResults = [...localResults, ...remoteResults]
    .filter(
      (city, index, cities) =>
        cities.findIndex(
          (candidate) =>
            candidate.city.toLocaleLowerCase() === city.city.toLocaleLowerCase() &&
            candidate.country === city.country,
        ) === index,
    )
    .slice(0, 7);

  const pinnedCities = Object.values(pinnedRecords).filter((city) =>
    pinned.has(city.id),
  );

  const pinnedCountries = new Set(
    pinnedCities.map((city) => city.country),
  );
  
  const totalCountries = 195;
  const worldTravelPercent = Math.round(
    (pinnedCountries.size / totalCountries) * 100,
  );

  const addPin = (place: TravelCity) => {
    setPinned((current) => new Set(current).add(place.id));
    setPinnedRecords((current) => ({ ...current, [place.id]: place }));
  };

  const togglePin = (place: TravelCity) => {
    setPinned((current) => {
      const next = new Set(current);

      if (next.has(place.id)) {
        next.delete(place.id);
      } else {
        next.add(place.id);
      }

      return next;
    });

    setPinnedRecords((current) => {
      if (pinned.has(place.id)) {
        const next = { ...current };
        delete next[place.id];
        return next;
      }

      return { ...current, [place.id]: place };
    });
  };

  return (
    <main className="travel-map-page min-h-[calc(100dvh-74px)]">
      <div className="mx-auto max-w-[1120px] px-5 py-12 lg:px-0 lg:py-16">
        <div className="travel-map-intro rise-in">
          <div className="eyebrow">
            <span className="eyebrow-dot" /> Your world, in little dots
          </div>
          <h1 className="results-title">
            See how far you’ve <em>travelled.</em>
          </h1>
          <p>
            Pin the cities and countries that have become part of your story.
            There’s no right way to map a life.
          </p>
        </div>

        <div className="travel-map-layout">
          <section className="world-map-card rise-in" aria-label="Your travel map">
            <div className="world-map-head">
              <div>
                <span className="section-kicker">My travel map</span>
                <h2>
                  {pinned.size} {pinned.size === 1 ? 'place' : 'places'} pinned
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCityNames((current) => !current)}
                  className="map-name-toggle"
                >
                  {showCityNames ? 'Hide names' : 'Show names'}
                </button>

                <div className="text-right">
                  <span className="travel-percent">
                    {pinnedCountries.size}{' '}
                    {pinnedCountries.size === 1 ? 'country' : 'countries'}
                  </span>
                  <p className="world-progress">
                    {worldTravelPercent}% of the world explored
                  </p>
                </div>
              </div>
            </div>

            <div className="world-map-visual">
              <svg
                className="world-map-svg"
                viewBox="0 0 1000 500"
                role="img"
                aria-label="Accurate world map with pinned travel cities"
              >
                <path
                  className="map-graticule"
                  d="M0 250H1000M0 125H1000M0 375H1000M250 0V500M500 0V500M750 0V500"
                />
                {worldMapPaths.map((path, index) => (
                  <path key={index} className="country-shape" d={path} />
                ))}
              </svg>

              {pinnedCities.map((place) => {
                const left = `${((place.longitude + 180) / 360) * 100}%`;
                const top = `${((90 - place.latitude) / 180) * 100}%`;

                return (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => togglePin(place)}
                    className="map-pin pinned"
                    style={{
                      position: 'absolute',
                      left,
                      top,
                      width: 28,
                      height: 28,
                      padding: 0,
                      border: 0,
                      background: 'transparent',
                      transform: 'translate(-50%, -50%)',
                      overflow: 'visible',
                    }}
                    aria-label={`Unpin ${place.city}, ${place.country}`}
                    data-testid={`map-pin-${place.id}`}
                  >
                    <span
                      className="map-pin-dot"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%) scale(0.58)',
                      }}
                    >
                      <MapPin size={13} fill="currentColor" />
                    </span>

                    {showCityNames && (
                      <span
                        className="map-pin-label"
                        style={{
                          position: 'absolute',
                          left: 25,
                          top: '50%',
                          transform: 'translateY(-50%) scale(0.78)',
                          transformOrigin: 'left center',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {place.city}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          <aside className="travel-places-card rise-in delay-1">
            <div className="travel-places-heading">
              <div>
                <span className="section-kicker">Find a place</span>
                <h2>Search the world.</h2>
              </div>
              <Globe2 size={20} />
            </div>

            <div className="city-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search any city or country"
                aria-label="Search any city or country"
                data-testid="input-travel-city"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="Clear city search"
                  data-testid="button-clear-travel-search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {query && (
              <div
                className="city-search-results"
                role="listbox"
                aria-label="City search results"
              >
                {searchingCities && searchResults.length === 0 ? (
                  <p className="city-search-empty">Searching the world…</p>
                ) : searchResults.length > 0 ? (
                  searchResults.map((place) => (
                    <button
                      key={place.id}
                      type="button"
                      onClick={() => {
                        addPin(place);
                        setQuery('');
                      }}
                      className="city-result"
                      data-testid={`search-result-${place.id}`}
                    >
                      <span className="place-status">
                        <MapPin size={13} />
                      </span>
                      <span>
                        <strong>{place.city}</strong>
                        <small>{place.country}</small>
                      </span>
                      <span className="place-action">
                        {pinned.has(place.id) ? 'Pinned' : 'Add'}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="city-search-empty">
                    No city found. Try another spelling.
                  </p>
                )}
              </div>
            )}

            <div className="pinned-heading">
              <span className="section-kicker">Pinned cities</span>
              <span>{pinnedCities.length}</span>
            </div>

            {pinnedCities.length > 0 ? (
              <div className="travel-place-list">
                {pinnedCities.map((place) => (
                  <button
                    key={place.id}
                    type="button"
                    onClick={() => togglePin(place)}
                    className="travel-place pinned"
                    data-testid={`button-place-${place.id}`}
                  >
                    <span className="place-status">
                      <Check size={13} />
                    </span>
                    <span>
                      <strong>{place.city}</strong>
                      <small>{place.country}</small>
                    </span>
                    <span className="place-action">Remove</span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="pinned-empty">
                Search for a city above and it will appear here.
              </p>
            )}

            <p className="map-attribution">
              Map data: Natural Earth · City search: OpenStreetMap
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TravelLoopDivider() {
  const ribbonText = 'TAKE THE SCENIC ROUTE ✦ AEROPATH ✦ ';

  return (
    <section className="travel-loop-divider" aria-label="Take the scenic route with AeroPath">
      <svg className="wavy-ribbon" viewBox="0 -36 1440 252" preserveAspectRatio="none" role="img" aria-label="AeroPath scenic route ribbon">
        <defs>
          <path
            id="aeropath-ribbon-path"
            d="M-120 92 C0 172 120 172 240 92 S480 12 600 92 S840 172 960 92 S1200 12 1320 92 S1560 172 1680 92"
          />
          <path
            id="aeropath-ribbon-lower-edge"
            d="M-120 128 C0 208 120 208 240 128 S480 48 600 128 S840 208 960 128 S1200 48 1320 128 S1560 208 1680 128 L1680 216 L-120 216 Z"
          />
        </defs>
        <rect className="ribbon-upper-background" x="-120" y="-36" width="1800" height="252" />
        <use href="#aeropath-ribbon-lower-edge" className="ribbon-lower-background" />
        <use href="#aeropath-ribbon-path" className="wavy-ribbon-band" />
        <text className="wavy-ribbon-text">
          <textPath href="#aeropath-ribbon-path" startOffset="0%">
            <animate attributeName="startOffset" from="0%" to="-50%" dur="24s" repeatCount="indefinite" />
            {ribbonText.repeat(10)}
          </textPath>
        </text>
      </svg>
    </section>
  );
}

function LoadingScreen({ overlay = false, message = 'Finding your way' }: { overlay?: boolean; message?: string }) {
  return <div className={`flight-loading ${overlay ? 'flight-loading-overlay' : ''}`} role="status" aria-live="polite">
    <div className="loading-stage" aria-label={message}>
      <div className="loading-orbit-ring"><span className="loading-plane"><Plane size={27} /></span></div>
      <p className="loading-brand-text">AeroPath</p>
      <span className="loading-dots"><i /><i /><i /></span>
    </div>
  </div>;
}

function LoadingResults() {
  return <LoadingScreen overlay message="Finding the right route" />;
}

function ResultsView({ search, saved, onToggleSave, onBack, onSelect }: { search: { from: string; to: string; depart: string; returning: string }; saved: Set<string>; onToggleSave: (id: string) => void; onBack: () => void; onSelect: (flight: Flight) => void }) {
  const [sort, setSort] = useState('Recommended');
  const [stops, setStops] = useState('Any stops');
  const [maxPrice, setMaxPrice] = useState(600);
  const list = useMemo(() => flights.filter((f) => (stops === 'Nonstop' ? f.stops === 'Nonstop' : true) && f.price <= maxPrice).sort((a, b) => sort === 'Price' ? a.price - b.price : sort === 'Duration' ? a.duration.localeCompare(b.duration) : (a.id === 'aurora-1' ? -1 : b.id === 'aurora-1' ? 1 : 0)), [sort, stops, maxPrice]);
  return <main className="results-page min-h-[calc(100dvh-74px)]">
    <div className="mx-auto max-w-[1120px] px-5 py-7 lg:px-0 lg:py-10">
      <button onClick={onBack} className="back-link" data-testid="button-back-search"><ChevronLeft size={17} /> Edit search</button>
      <div className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-5">
        <div className="rise-in"><div className="eyebrow mb-3"><span className="eyebrow-dot" /> Your next chapter</div><h1 className="results-title">{search.from.split(' (')[0]} <ArrowRight className="inline-block text-[#d58c78]" size={28} /> {search.to.split(' (')[0]}</h1><p className="mt-2 text-sm text-[#6b7777]">{search.depart} · {search.returning} · <span className="font-semibold text-[#36545a]">48 flights</span></p></div>
        <div className="flex items-center gap-2"><label className="filter-select"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)} data-testid="select-sort"><option>Recommended</option><option>Price</option><option>Duration</option></select><ChevronDown size={14} /></label><button className="filter-button lg:hidden" data-testid="button-mobile-filters"><SlidersHorizontal size={16} /> Filters</button></div>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="filter-panel hidden lg:block">
          <div className="mb-5 flex items-center justify-between"><span className="font-bold text-[#21434b]">Refine</span><Filter size={16} className="text-[#7c8c89]" /></div>
          <div className="filter-group"><p>Stops</p>{['Any stops', 'Nonstop'].map((s) => <button key={s} onClick={() => setStops(s)} className={`filter-option ${stops === s ? 'selected' : ''}`} data-testid={`filter-${s.toLowerCase().replace(' ', '-')}`}><span className="radio-dot" />{s}<span className="ml-auto text-xs text-[#81908d]">{s === 'Nonstop' ? 4 : 5}</span></button>)}</div>
          <div className="filter-group"><p>Price per traveller</p><div className="price-row"><span>$0</span><span>${maxPrice}</span></div><input type="range" min="250" max="600" step="10" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="price-range" data-testid="input-price-filter" /></div>
          <div className="filter-group"><p>Cabin</p><button className="filter-option selected" data-testid="filter-economy"><span className="radio-dot" />Economy <Check size={14} className="ml-auto" /></button><button className="filter-option" data-testid="filter-premium"><span className="radio-dot" />Premium economy</button></div>
          <div className="filter-note"><CloudSun size={17} /><span>Prices are kind to your calendar — no overnight flights here.</span></div>
        </aside>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[#6b7777]"><span><strong className="text-[#21434b]">{list.length}</strong> good options, sorted for you</span><span className="hidden items-center gap-1.5 sm:flex"><ShieldCheck size={15} className="text-[#5d9994]" /> No hidden fees</span></div>
          {list.length === 0 ? <div className="empty-state"><div className="empty-icon"><CloudSun size={27} /></div><h2>A little too specific</h2><p>Try widening your price range or bringing one-stop flights back into the mix.</p><button onClick={() => { setMaxPrice(600); setStops('Any stops'); }} className="primary-button" data-testid="button-reset-filters">Reset filters</button></div> : list.map((flight, index) => <FlightCard key={flight.id} flight={flight} saved={saved.has(flight.id)} onToggleSave={onToggleSave} onSelect={onSelect} index={index} />)}
        </div>
      </div>
    </div>
  </main>;
}

function FlightCard({ flight, saved, onToggleSave, onSelect, index }: { flight: Flight; saved: boolean; onToggleSave: (id: string) => void; onSelect: (flight: Flight) => void; index: number }) {
  return <article className={`flight-card rise-in delay-${Math.min(index + 1, 4)}`} data-testid={`card-flight-${flight.id}`}>
    <div className="airline-mark" style={{ background: flight.tint }}><Plane size={18} /></div>
    <div className="flight-main"><div className="flight-route"><div><strong>{flight.depart}</strong><span>{flight.from}</span></div><div className="flight-line"><small>{flight.duration}</small><span><i /><i /><i /></span><small>{flight.stops}</small></div><div className="text-right"><strong>{flight.arrive}</strong><span>{flight.to}</span></div></div><div className="flight-meta"><span className="font-semibold text-[#36545a]">{flight.airline}</span><span className="hidden text-[#87918e] sm:inline">·</span><span>{flight.stopNote}</span>{flight.badge && <span className="deal-badge"><BadgeCheck size={13} /> {flight.badge}</span>}</div></div>
    <div className="flight-price"><button onClick={() => onToggleSave(flight.id)} className={`heart-button ${saved ? 'saved' : ''}`} aria-label={saved ? `Remove ${flight.airline} from saved trips` : `Save ${flight.airline}`} data-testid={`button-save-${flight.id}`}>{saved ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}</button><div><span>from</span><strong>${flight.price}</strong></div><button onClick={() => onSelect(flight)} className="select-button" data-testid={`button-select-${flight.id}`}>View flight <ArrowRight size={15} /></button></div>
  </article>;
}

function SavedView({ saved, onToggleSave, onSearch, onSelect }: { saved: Set<string>; onToggleSave: (id: string) => void; onSearch: () => void; onSelect: (flight: Flight) => void }) {
  const items = flights.filter((f) => saved.has(f.id));
  return <main className="saved-page min-h-[calc(100dvh-74px)]"><div className="mx-auto max-w-[1120px] px-5 py-12 lg:px-0 lg:py-16"><div className="mb-10 max-w-[600px]"><div className="eyebrow mb-3"><span className="eyebrow-dot" /> Your little shortlist</div><h1 className="results-title">Saved <em>for later.</em></h1><p className="mt-3 text-[16px] leading-7 text-[#687876]">Keep a few possibilities close while you figure out which one is calling.</p></div>{items.length === 0 ? <div className="empty-state max-w-[650px]"><div className="empty-icon"><Heart size={27} /></div><h2>Nothing saved yet</h2><p>When a flight catches your eye, tap the heart and it will wait here for you.</p><button onClick={onSearch} className="primary-button" data-testid="button-find-flights"><Search size={16} /> Find a flight</button></div> : <div className="grid gap-3">{items.map((flight, i) => <FlightCard key={flight.id} flight={flight} saved onToggleSave={onToggleSave} onSelect={() => onSelect(flight)} index={i} />)}</div>}</div></main>;
}

function AccountModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [submitted, setSubmitted] = useState(false);
  const [loggedOut, setLoggedOut] = useState(false);
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Account"><div className="account-modal rise-in"><button onClick={onClose} className="modal-close" aria-label="Close account modal" data-testid="button-close-account"><X size={18} /></button><div className="modal-art"><div className="grid size-12 place-items-center rounded-2xl bg-[#e7b95d] text-[#18323c]"><Plane size={23} className="-rotate-12" /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#8e7350]">AeroPath profile</p><p className="mt-1 font-serif text-[25px] leading-none text-[#21434b]">Keep the good options close.</p></div></div>{loggedOut ? <div className="modal-success"><div className="success-icon"><LogOut size={22} /></div><h2>You are logged out.</h2><p>Your saved details are safely tucked away.</p><button onClick={onClose} className="primary-button" data-testid="button-finish-logout">Done</button></div> : submitted ? <div className="modal-success"><div className="success-icon"><Check size={24} /></div><h2>{mode === 'signin' ? 'Welcome back.' : 'You are on your way.'}</h2><p>{mode === 'signin' ? 'Your saved trips are waiting for you.' : 'Your new AeroPath account is ready.'}</p><button onClick={onClose} className="primary-button" data-testid="button-finish-account">Continue</button></div> : <><div className="modal-tabs"><button onClick={() => setMode('signin')} className={mode === 'signin' ? 'active' : ''} data-testid="tab-signin">Sign in</button><button onClick={() => setMode('create')} className={mode === 'create' ? 'active' : ''} data-testid="tab-create">Create account</button></div><form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="grid gap-4"><label className="modal-field"><span>Email address</span><input type="email" placeholder="you@example.com" required data-testid="input-account-email" /></label><label className="modal-field"><span>Password</span><input type="password" placeholder="At least 8 characters" required minLength={8} data-testid="input-account-password" /></label><button className="primary-button w-full justify-center" type="submit" data-testid="button-submit-account">{mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button><div className="relative my-1 text-center text-xs text-[#91a09b]"><span className="relative z-10 bg-[#fffdf8] px-3">or continue with</span><span className="absolute left-0 right-0 top-1/2 border-t border-[#e7dfd2]" /></div><button type="button" className="social-button" onClick={() => setSubmitted(true)} data-testid="button-continue-google"><span className="google-mark">G</span> Continue with Google</button></form><p className="mt-5 text-center text-xs leading-5 text-[#89938f]">By continuing, you agree to AeroPath's <button className="underline">terms</button> and <button className="underline">privacy policy</button>.</p><button className="logout-button" onClick={() => setLoggedOut(true)} data-testid="button-logout"><LogOut size={15} /> Log out</button></>}</div></div>;
}

function SelectedToast({ flight, onClose }: { flight: Flight; onClose: () => void }) {
  return <div className="selection-toast rise-in"><div className="grid size-9 place-items-center rounded-xl bg-[#dceae5] text-[#397b7b]"><Check size={17} /></div><div><strong>Nice choice.</strong><span>{flight.airline} · ${flight.price} · {flight.depart}</span></div><button onClick={onClose} aria-label="Close selection message" data-testid="button-close-selection"><X size={16} /></button></div>;
}

type AssistantMessage = { id: number; role: 'assistant' | 'user'; text: string };

function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { id: 1, role: 'assistant', text: 'Hi, I’m AeroGuide. Want help finding a flight that feels right?' },
  ]);
  const suggestions = ['Find the calmest flight', 'What does flexible booking mean?'];
  const replyFor = (question: string) => {
    const prompt = question.toLowerCase();
    if (prompt.includes('calm') || prompt.includes('flight')) return 'Aurora Air is a good place to start: it’s nonstop, has a comfortable morning departure, and is marked Best overall.';
    if (prompt.includes('flexible')) return 'Flexible booking means the fare gives you more room to change plans. Look for the shield on eligible options.';
    return 'I can help compare flights, explain fare details, or keep your trip planning simple. Try asking about a route or flexible booking.';
  };
  const ask = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || typing) return;
    setDraft('');
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: trimmed }]);
    setTyping(true);
    window.setTimeout(() => {
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: replyFor(trimmed) }]);
      setTyping(false);
    }, 550);
  };
  return <div className={`assistant-widget ${open ? 'is-open' : ''}`}>
    {open && <section className="assistant-panel rise-in" role="dialog" aria-label="AeroGuide assistant">
      <div className="assistant-header"><div className="assistant-title"><span className="assistant-icon"><Sparkles size={15} /></span><div><strong>AeroGuide</strong><span>Travel help, right this way</span></div></div><button onClick={() => setOpen(false)} className="assistant-close" aria-label="Close assistant" data-testid="button-close-assistant"><X size={16} /></button></div>
      <div className="assistant-messages">{messages.map((message) => <div className={`assistant-message ${message.role}`} key={message.id}>{message.role === 'assistant' && <Sparkles size={12} />}{message.text}</div>)}{typing && <div className="assistant-message assistant typing"><i /><i /><i /></div>}</div>
      {messages.length === 1 && <div className="assistant-suggestions">{suggestions.map((suggestion) => <button key={suggestion} onClick={() => ask(suggestion)} data-testid={`assistant-suggestion-${suggestion.startsWith('Find') ? 'flight' : 'flexible'}`}>{suggestion}</button>)}</div>}
      <form className="assistant-input-row" onSubmit={(event) => { event.preventDefault(); ask(draft); }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Ask about your trip..." aria-label="Ask AeroGuide" data-testid="input-assistant" /><button type="submit" aria-label="Send message" data-testid="button-send-assistant"><Send size={15} /></button></form>
    </section>}
    <button onClick={() => setOpen((current) => !current)} className="assistant-trigger" aria-expanded={open} aria-label={open ? 'Close AeroGuide' : 'Open AeroGuide'} data-testid="button-open-assistant"><span className="assistant-trigger-icon">{open ? <X size={18} /> : <MessageCircle size={18} />}</span><span className="assistant-trigger-label">Ask AeroGuide</span></button>
  </div>;
}

function Home() {
  const [view, setView] = useState<'home' | 'add' | 'results' | 'saved' | 'boarding' | 'help' | 'map'>('home');
  const [searching, setSearching] = useState(false);
  const [search, setSearch] = useState({ from: 'San Francisco (SFO)', to: 'New York (JFK)', depart: 'Oct 18, 2026', returning: 'Oct 25, 2026' });
  const [saved, setSaved] = useState<Set<string>>(savedSeed);
  const [accountOpen, setAccountOpen] = useState(false);
  const [selected, setSelected] = useState<Flight | null>(null);
  const [booting, setBooting] = useState(true);
  const [transitioning, setTransitioning] = useState(false);
  const [navigationTarget, setNavigationTarget] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light';
    const savedTheme = window.localStorage.getItem('aeropath-theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  });
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem('aeropath-theme', theme);
  }, [theme]);
  useEffect(() => {
    const timer = window.setTimeout(() => setBooting(false), 900);
    return () => window.clearTimeout(timer);
  }, []);
  const doSearch = (from: string, to: string, depart: string, returning: string) => { setSearch({ from, to, depart, returning }); setSearching(true); window.setTimeout(() => { setSearching(false); setView('results'); }, 700); };
  const toggleSave = (id: string) => setSaved((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const navigate = (next: string) => {
    setNavigationTarget(next);
    setTransitioning(true);
    window.setTimeout(() => {
       if (next === 'add') setView('add'); else if (next === 'results') setView('results'); else if (next === 'saved') setView('saved'); else if (next === 'boarding') setView('boarding'); else if (next === 'help') setView('help'); else if (next === 'map') setView('map'); else setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTransitioning(false);
      setNavigationTarget(null);
    }, 1100);
  };
  return <div className={`noise min-h-[100dvh] ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>{booting ? <LoadingScreen /> : <><NavBar view={view} onNavigate={navigate} onAccount={() => setAccountOpen(true)} theme={theme} onThemeToggle={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} navigationPulse={transitioning} navigationTarget={navigationTarget} />{searching ? <LoadingResults /> : view === 'home' ? <HomeView /> : view === 'add' ? <AddTripView onSearch={doSearch} /> : view === 'results' ? <ResultsView search={search} saved={saved} onToggleSave={toggleSave} onBack={() => navigate('add')} onSelect={setSelected} /> : view === 'boarding' ? <BoardingPassView /> : view === 'help' ? <HelpView /> : view === 'map' ? <TravelMapView /> : <SavedView saved={saved} onToggleSave={toggleSave} onSearch={() => navigate('add')} onSelect={setSelected} />}{selected && <SelectedToast flight={selected} onClose={() => setSelected(null)} />}{accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}<AssistantWidget /></>}</div>;
}

function Router() {
  return <Switch><Route path="/" component={Home} /><Route component={NotFound} /></Switch>;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><RoutedErrorBoundary><Router /></RoutedErrorBoundary></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
