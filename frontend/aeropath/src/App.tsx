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
import { motion } from 'framer-motion';
import worldGeoJson from './data/world.json';

const queryClient = new QueryClient();
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

type Flight = {
  id: string; airline: string; code: string; from: string; to: string;
  depart: string; arrive: string; duration: string; stops: string;
  stopNote: string; price: number | null; cabin: string; tint: string; badge?: string;
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
            <button data-nav-id="tracking" onClick={() => onNavigate('tracking')} className={`nav-link ${view === 'tracking' ? 'active' : ''}`} data-testid="nav-live-tracking"><Plane size={14} /> Live tracking</button>
            <button data-nav-id="map" onClick={() => onNavigate('map')} className={`nav-link ${view === 'map' ? 'active' : ''}`} data-testid="nav-travel-map"><Globe2 size={14} /> Travel map</button>
            <button data-nav-id="help" onClick={() => onNavigate('help')} className={`nav-link ${view === 'help' ? 'active' : ''}`} data-testid="nav-help"><CircleHelp size={14} /> Help</button>
          </nav>
          <AnimatedThemeToggler theme={theme} onToggle={onThemeToggle} />
          <button onClick={onAccount} className="profile-button" data-testid="button-profile"><UserRound size={16} /> Profile</button>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="grid size-10 place-items-center rounded-full border border-[#dfd8ca] md:hidden" aria-label="Open menu" data-testid="button-mobile-menu">{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
      </div>
      {menuOpen && <div className="border-t border-[#dfd8ca] bg-[#f8f5ee] px-5 py-4 md:hidden">
        <div className="grid gap-1">
          <button onClick={() => { onNavigate('home'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-home"><House size={15} /> Home</button>
          <button onClick={() => { onNavigate('add'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-add-trip"><Plus size={15} /> Add trip</button>
          <button onClick={() => { onNavigate('boarding'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-boarding-pass"><CreditCard size={15} /> Boarding pass</button>
          <button onClick={() => { onNavigate('tracking'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-live-tracking"><Plane size={15} /> Live tracking</button>
          <button onClick={() => { onNavigate('map'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-travel-map"><Globe2 size={15} /> Travel map</button>
          <button onClick={() => { onNavigate('help'); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-help"><CircleHelp size={15} /> Help</button>
          <button onClick={() => { onAccount(); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-profile"><UserRound size={15} /> Profile</button>
          <button onClick={() => { onThemeToggle(); setMenuOpen(false); }} className="mobile-nav-item" data-testid="mobile-nav-theme">{theme === 'light' ? <Moon size={15} /> : <SunMedium size={15} />} {theme === 'light' ? 'Dark theme' : 'Light theme'}</button>
        </div>
      </div>}
    </header>
  );
}

function SearchPanel({ onSearch }: { onSearch: (from: string, to: string, depart: string, returning: string) => void }) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [depart, setDepart] = useState('');
  const [returning, setReturning] = useState('');
  const [roundTrip, setRoundTrip] = useState(true);
  const [travellers, setTravellers] = useState('1 traveller · Economy');
  const [formError, setFormError] = useState('');
  const submitSearch = () => {
    const airportCode = (value: string) => value.match(/\(([A-Z]{3})\)$/)?.[1] || (/^[A-Z]{3}$/.test(value.trim()) ? value.trim() : '');
    if (!airportCode(from) || !airportCode(to)) { setFormError('Choose both airports from the suggestions so we can search the correct route.'); return; }
    if (!depart) { setFormError('Choose a departure date to search.'); return; }
    if (roundTrip && returning && returning < depart) { setFormError('Return date must be on or after the departure date.'); return; }
    setFormError('');
    onSearch(from, to, depart, roundTrip ? returning : '');
  };
  const swap = () => { setFrom(to); setTo(from); setFormError(''); };
  return (
    <section className="relative z-10 mx-auto -mt-1 max-w-[1120px] px-5 lg:px-0">
      <div className="search-card rounded-[22px] border border-[#e2dacc] bg-[#fffdf8] p-3 shadow-[0_18px_55px_rgba(37,62,65,.1)]">
        <div className="mb-2 flex items-center gap-3 px-2 pt-1 text-xs font-semibold text-[#6b7777]">
          <button onClick={() => setRoundTrip(true)} className={roundTrip ? 'trip-toggle active' : 'trip-toggle'} data-testid="toggle-round-trip">Round trip</button>
          <button onClick={() => setRoundTrip(false)} className={!roundTrip ? 'trip-toggle active' : 'trip-toggle'} data-testid="toggle-one-way">One way</button>
          <span className="ml-auto hidden items-center gap-1 text-[#7c8c89] sm:flex"><ShieldCheck size={14} /> Flexible booking</span>
        </div>
        <div className="grid gap-2 lg:grid-cols-[1.45fr_1.45fr_1.15fr_1.15fr_1.12fr_auto]">
          <AirportField label="From" value={from} onChange={setFrom} placeholder="Origin city or airport" testId="input-from">
            <button onClick={swap} className="swap-button" aria-label="Swap airports" data-testid="button-swap"><ArrowLeftRight size={15} /></button>
          </AirportField>
          <AirportField label="To" value={to} onChange={setTo} placeholder="Destination city or airport" testId="input-to" />
          <SearchField icon={<CalendarDays size={16} />} label="Depart" value={depart} onChange={setDepart} type="date" testId="input-depart" />
          <SearchField icon={<CalendarDays size={16} />} label="Return" value={returning} onChange={setReturning} disabled={!roundTrip} type="date" testId="input-return" />
          <label className="search-field">
            <span className="field-label"><Luggage size={15} /> Travellers</span>
            <select value={travellers} onChange={(e) => setTravellers(e.target.value)} data-testid="select-travellers" className="field-control cursor-pointer appearance-none bg-transparent pr-5">
              <option>1 traveller · Economy</option><option>2 travellers · Economy</option><option>1 traveller · Premium</option>
            </select><ChevronDown size={15} className="pointer-events-none absolute right-3 bottom-4 text-[#83908d]" />
          </label>
          <button type="button" onClick={submitSearch} className="search-submit" data-testid="button-search"><Search size={18} /><span className="lg:hidden">Find flights</span></button>
        </div>
        {formError && <p className="airport-error static-error" role="alert">{formError}</p>}
      </div>
    </section>
  );
}

function SearchField({ icon, label, value, onChange, placeholder, disabled, testId, type, children }: { icon: ReactNode; label: string; value: string; onChange: (value: string) => void; placeholder?: string; disabled?: boolean; testId: string; type?: string; children?: ReactNode }) {
  return <label className={`search-field ${disabled ? 'opacity-45' : ''}`}>
    <span className="field-label">{icon} {label}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled} type={type} className="field-control" data-testid={testId} />
    {children}
  </label>;
}

type AirportSuggestion = { iata: string; name: string; city?: string; country?: string };
function AirportField({ label, value, onChange, placeholder, testId, children }: { label: string; value: string; onChange: (value: string) => void; placeholder: string; testId: string; children?: ReactNode }) {
  const [results, setResults] = useState<AirportSuggestion[]>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    const term = value.trim();
    if (term.length < 2 || /\([A-Z]{3}\)$/.test(term)) { setResults([]); return; }
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/locations/autocomplete?keyword=${encodeURIComponent(term)}`);
        const data = await response.json().catch(() => ({})) as { locations?: AirportSuggestion[]; error?: string; detail?: string };
        if (!response.ok) throw new Error(data.detail || data.error || 'Airport search is unavailable.');
        setResults(data.locations || []); setError('');
      } catch (error) {
        setResults([]);
        setError(error instanceof Error ? error.message : 'Check the backend and AeroDataBox subscription.');
      }
    }, 300);
    return () => window.clearTimeout(timer);
  }, [value]);
  return <label className="search-field airport-field"><span className="field-label"><Plane size={16} /> {label}</span><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="field-control" data-testid={testId} />{children}{results.length > 0 && <span className="airport-suggestions">{results.map((airport) => <button type="button" key={airport.iata} onClick={() => { onChange(`${airport.city || airport.name} (${airport.iata})`); setResults([]); }}><strong>{airport.iata}</strong><span>{airport.city || airport.name}{airport.country ? ` · ${airport.country}` : ''}</span></button>)}</span>}{error && value.trim().length > 1 && <small className="airport-error">{error}</small>}</label>;
}

type HotelOffer = { id: string; name: string; area: string; rating: string; reviews: string; price: number | string; tint: string };
const fallbackHotels: HotelOffer[] = [
  { id: 'mumbai-house', name: 'The Bombay House', area: 'Colaba, Mumbai', rating: '4.8', reviews: '1,284', price: 118, tint: 'hotel-sand' },
  { id: 'sea-facing', name: 'Sea & Sky Retreat', area: 'Bandra West, Mumbai', rating: '4.6', reviews: '842', price: 96, tint: 'hotel-sea' },
  { id: 'garden-court', name: 'Garden Court Hotel', area: 'Fort, Mumbai', rating: '4.7', reviews: '619', price: 83, tint: 'hotel-coral' },
];

function HotelSearchPanel({ onSearch }: { onSearch: (destination: string, checkIn: string, checkOut: string, guests: string) => void }) {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 guests · 1 room');
  return <section className="relative z-10 mx-auto max-w-[1120px] px-5 lg:px-0">
    <div className="hotel-search-card search-card rounded-[22px] border border-[#e2dacc] bg-[#fffdf8] p-3 shadow-[0_18px_55px_rgba(37,62,65,.1)]">
      <div className="mb-2 flex items-center gap-1 px-2 pt-1 text-xs font-semibold text-[#6b7777]"><span className="search-card-note"><Building2 size={14} /> Find a stay that fits the trip</span><span className="ml-auto hidden items-center gap-1 text-[#7c8c89] sm:flex"><ShieldCheck size={14} /> Flexible booking</span></div>
      <div className="grid gap-2 lg:grid-cols-[1.55fr_1.15fr_1.15fr_1.15fr_auto]">
        <SearchField icon={<MapPin size={16} />} label="Destination" value={destination} onChange={setDestination} placeholder="City or neighbourhood" testId="input-hotel-destination" />
        <SearchField icon={<CalendarDays size={16} />} label="Check in" value={checkIn} onChange={setCheckIn} type="date" testId="input-hotel-check-in" />
        <SearchField icon={<CalendarDays size={16} />} label="Check out" value={checkOut} onChange={setCheckOut} type="date" testId="input-hotel-check-out" />
        <label className="search-field">
          <span className="field-label"><UsersRound size={15} /> Guests</span>
          <select value={guests} onChange={(e) => setGuests(e.target.value)} data-testid="select-hotel-guests" className="field-control cursor-pointer appearance-none bg-transparent pr-5">
            <option>2 guests · 1 room</option><option>1 guest · 1 room</option><option>4 guests · 2 rooms</option>
          </select><ChevronDown size={15} className="pointer-events-none absolute right-3 bottom-4 text-[#83908d]" />
        </label>
        <button onClick={() => destination && checkIn && checkOut && onSearch(destination, checkIn, checkOut, guests)} className="search-submit" data-testid="button-search-hotels"><Search size={18} /><span className="lg:hidden">Find stays</span></button>
      </div>
    </div>
  </section>;
}

function HotelResults({ search, hotels }: { search: { destination: string; checkIn: string; checkOut: string; guests: string }; hotels: HotelOffer[] }) {
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
        <div><h2 className="section-title">Good trips start<br /><em>before takeoff.</em></h2></div>
        <div className="grid gap-3 sm:grid-cols-3">
          <Feature icon={<Compass />} title="See the whole picture" copy="Clear fares, real timings, no clutter." />
          <Feature icon={<Heart />} title="Keep the maybes" copy="Save a few options and come back when ready." />
          <Feature icon={<Zap />} title="Move at your pace" copy="A faster search, a slower decision." />
        </div>
      </div>
    </section>
  </main>;
}

function AddTripView({ onSearch, searchError }: { onSearch: (from: string, to: string, depart: string, returning: string) => void; searchError: string }) {
  const [mode, setMode] = useState<'flight' | 'hotel'>('flight');
  const [hotelSearching, setHotelSearching] = useState(false);
  const [hotelSearch, setHotelSearch] = useState<{ destination: string; checkIn: string; checkOut: string; guests: string } | null>(null);
  const [hotelResults, setHotelResults] = useState<HotelOffer[]>([]);
  const [hotelError, setHotelError] = useState('');
  const searchHotels = async (destination: string, checkIn: string, checkOut: string, guests: string) => {
    setHotelSearch({ destination, checkIn, checkOut, guests });
    setHotelSearching(true);
    setHotelError('');
    try {
      const adults = Number(guests.match(/^\d+/)?.[0] || 1);
      const response = await fetch(`${apiBaseUrl}/hotels/search?city=${encodeURIComponent(destination)}&checkIn=${checkIn}&checkOut=${checkOut}&adults=${adults}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Hotel search failed');
      setHotelResults((data.hotels || []).map((hotel: { id?: string; name?: string; locality?: string; neighborhood?: string; starRating?: number; price?: string | number }, index: number) => ({
        id: hotel.id || `${hotel.name}-${index}`,
        name: hotel.name || 'Hotel',
        area: hotel.neighborhood || hotel.locality || destination,
        rating: hotel.starRating ? String(hotel.starRating) : '—',
        reviews: 'Live availability',
        price: hotel.price || '—',
        tint: ['hotel-sand', 'hotel-sea', 'hotel-coral'][index % 3] || 'hotel-sand',
      })));
    } catch {
      setHotelResults([]);
      setHotelError('Live hotel search needs the backend running at the VITE_API_BASE_URL address and an active Hotels4 RapidAPI subscription.');
    } finally {
      setHotelSearching(false);
    }
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
      {mode === 'flight' ? <><SearchPanel onSearch={onSearch} />{searchError && <p className="tracking-message" role="alert">{searchError}</p>}</> : <HotelSearchPanel onSearch={searchHotels} />}
      {mode === 'hotel' && hotelSearching && <div className="hotel-loading"><div className="skeleton h-5 w-44 rounded-full" /><div className="skeleton h-3 w-64 rounded-full" /></div>}
      {mode === 'hotel' && !hotelSearching && hotelError && <p className="tracking-message">{hotelError}</p>}
      {mode === 'hotel' && !hotelSearching && hotelSearch && !hotelError && <HotelResults search={hotelSearch} hotels={hotelResults} />}
    </div>
  </main>;
}

function BoardingPassView({ uploadedFile, onUpload, onRemove }: { uploadedFile: File | null; onUpload: (file: File) => void; onRemove: () => void }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState('');
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = ['image/png', 'image/jpeg'].includes(file.type) || /\.(png|jpe?g)$/i.test(file.name);
    if (!isPdf && !isImage) { setUploadError('Choose a PDF, PNG, or JPG boarding pass.'); return; }
    if (file.size > 8 * 1024 * 1024) { setUploadError('This file is larger than 8 MB. Choose a smaller boarding pass.'); return; }
    setUploadError('');
    onUpload(file);
    event.currentTarget.value = '';
  };
  useEffect(() => {
    if (!uploadedFile) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(uploadedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [uploadedFile]);
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
      {uploadError && <p className="tracking-message" role="alert">{uploadError}</p>}
      {uploadedFile ? <><div className="upload-success rise-in"><div className="upload-success-icon"><FileUp size={16} /></div><div><strong>{uploadedFile.name}</strong><span>Previewing the file you selected on this device.</span></div><button type="button" onClick={onRemove} aria-label="Remove uploaded boarding pass"><X size={16} /></button></div><section className="boarding-upload-preview rise-in" aria-label="Uploaded boarding pass preview">{uploadedFile.type === 'application/pdf' ? <iframe title={`Preview of ${uploadedFile.name}`} src={previewUrl || undefined} /> : <img src={previewUrl || undefined} alt={`Uploaded boarding pass: ${uploadedFile.name}`} />}<a href={previewUrl || undefined} download={uploadedFile.name}>Download boarding pass</a></section></> : <p className="secondary-copy mt-10">Upload a boarding pass to preview it here.</p>}
    </div>
  </main>;
}

type TrackedFlight = {
  flightNumber: string | null;
  airline: string;
  status: string;
  departure: { airport: string | null; scheduled: string | null; estimated: string | null; actual: string | null; terminal: string | null; gate: string | null };
  arrival: { airport: string | null; scheduled: string | null; estimated: string | null; actual: string | null; terminal: string | null; gate: string | null };
  aircraft: string | null;
  position: { latitude: number; longitude: number; altitude: number | null; speed: number | null; heading: number | null; updatedAt: string | null } | null;
};

const displayTime = (value: string | null) => value ? new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }).format(new Date(value)) : '—';

function FlightTrackingView() {
  const [flightNumber, setFlightNumber] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [flight, setFlight] = useState<TrackedFlight | null>(null);
  const [message, setMessage] = useState('Enter a flight number to see its current status.');
  const [loading, setLoading] = useState(false);

  const trackFlight = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!flightNumber.trim()) return;
    setLoading(true);
    setMessage('Checking the latest flight update…');
    setFlight(null);
    try {
      const response = await fetch(`${apiBaseUrl}/flights/track?flightNumber=${encodeURIComponent(flightNumber)}&date=${date}`);
      const body = await response.text();
      let data: { flights?: TrackedFlight[]; note?: string; error?: string; detail?: string };
      try {
        data = JSON.parse(body) as { flights?: TrackedFlight[]; note?: string; error?: string };
      } catch {
        throw new Error('The tracking server returned a web page instead of JSON. Start the backend on port 4000 and set VITE_API_BASE_URL to its /api URL.');
      }
      if (!response.ok) throw new Error(data.detail || data.error || 'Unable to track this flight.');
      if (!data.flights?.length) {
        setMessage(`No flight was found for ${flightNumber.toUpperCase()} on ${date}. Check the number and departure date.`);
      } else {
        setFlight(data.flights[0]);
        setMessage(data.note || 'Latest update received.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to connect to live tracking.');
    } finally {
      setLoading(false);
    }
  };

  return <main className="secondary-page tracking-page min-h-[calc(100dvh-74px)]">
    <div className="mx-auto max-w-[880px] px-5 py-14 lg:px-0 lg:py-20">
      <div className="eyebrow mb-4"><span className="eyebrow-dot" /> Follow the journey</div>
      <h1 className="results-title">Live flight <em>tracking.</em></h1>
      <p className="secondary-copy">Enter a flight number and its departure date for current status, timings, gate details, and position when live coverage is available.</p>
      <form className="tracking-search rise-in" onSubmit={trackFlight}>
        <label><span>Flight number</span><input value={flightNumber} onChange={(event) => setFlightNumber(event.target.value.toUpperCase())} placeholder="e.g. BA117" maxLength={8} required data-testid="input-track-flight-number" /></label>
        <label><span>Departure date</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required data-testid="input-track-date" /></label>
        <button className="primary-button" disabled={loading} data-testid="button-track-flight"><Plane size={16} /> {loading ? 'Tracking…' : 'Track flight'}</button>
      </form>
      <p className="tracking-message" role="status">{message}</p>
      {flight && <article className="tracking-card rise-in" data-testid="live-flight-result">
        <div className="tracking-card-head"><div><span className="section-kicker">{flight.airline}</span><h2>{flight.flightNumber || flightNumber.toUpperCase()}</h2></div><span className="tracking-status">{flight.status}</span></div>
        <div className="tracking-route"><div><span>Departure</span><strong>{flight.departure.airport || '—'}</strong><small>{displayTime(flight.departure.actual || flight.departure.estimated || flight.departure.scheduled)}</small><em>{flight.departure.gate ? `Gate ${flight.departure.gate}` : flight.departure.terminal ? `Terminal ${flight.departure.terminal}` : 'Gate pending'}</em></div><div className="tracking-line"><Plane size={19} /><span /></div><div className="text-right"><span>Arrival</span><strong>{flight.arrival.airport || '—'}</strong><small>{displayTime(flight.arrival.actual || flight.arrival.estimated || flight.arrival.scheduled)}</small><em>{flight.arrival.gate ? `Gate ${flight.arrival.gate}` : flight.arrival.terminal ? `Terminal ${flight.arrival.terminal}` : 'Gate pending'}</em></div></div>
        <div className="tracking-details"><span>Aircraft <strong>{flight.aircraft || 'Not available'}</strong></span>{flight.position ? <span>Live position <strong>{flight.position.latitude.toFixed(3)}, {flight.position.longitude.toFixed(3)}</strong></span> : <span>Live position <strong>Unavailable for this flight</strong></span>}</div>
      </article>}
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
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return <main className="secondary-page min-h-[calc(100dvh-74px)]">
    <div className="mx-auto max-w-[880px] px-5 py-14 lg:px-0 lg:py-20">
      <div className="eyebrow mb-4"><span className="eyebrow-dot" /> A little help, right this way</div>
      <h1 className="results-title">Travel planning, <em>without the guesswork.</em></h1>
      <p className="secondary-copy">A few quick answers for the moments when you want to keep moving.</p>
      <div className="help-list motion-help-list rise-in">{questions.map((question, index) => {
        const open = openIndex === index;
        return <motion.div layout key={question} className="help-item" animate={{ scale: open ? 1 : .985 }} transition={{ type: 'spring', stiffness: 280, damping: 28, mass: .9 }}>
          <button onClick={() => setOpenIndex(open ? null : index)} className="help-question" aria-expanded={open} aria-controls={`help-panel-${index}`} data-testid={`help-question-${index}`}><span>{question}</span><motion.span animate={{ rotate: open ? 180 : 0, scale: open ? 1.05 : 1 }} transition={{ type: 'spring', stiffness: 480, damping: 28 }}><ChevronDown size={16} /></motion.span></button>
          <motion.div id={`help-panel-${index}`} role="region" initial={false} animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }} transition={{ height: { type: 'spring', stiffness: 340, damping: 34, mass: .9 }, opacity: { duration: .2 } }} style={{ overflow: 'hidden' }}><motion.p animate={{ y: open ? 0 : -8 }} transition={{ type: 'spring', stiffness: 360, damping: 30 }} className="help-motion-answer">{answers[index]}</motion.p></motion.div>
        </motion.div>;
      })}</div>
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
  { id: 'ankara', city: 'Ankara', country: 'Türkiye', latitude: 39.933, longitude: 32.86 },
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
                preserveAspectRatio="none"
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

function ResultsView({ search, flights: searchFlights, saved, onToggleSave, onBack, onSelect }: { search: { from: string; to: string; depart: string; returning: string }; flights: Flight[]; saved: Set<string>; onToggleSave: (id: string) => void; onBack: () => void; onSelect: (flight: Flight) => void }) {
  const [sort, setSort] = useState('Recommended');
  const [stops, setStops] = useState('Any stops');
  const [maxPrice, setMaxPrice] = useState(600);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const hasPrices = searchFlights.some((flight) => flight.price !== null);
  const list = useMemo(() => searchFlights.filter((f) => (stops === 'Nonstop' ? f.stops === 'Nonstop' : true) && (f.price === null || f.price <= maxPrice) && (!favoritesOnly || saved.has(f.id))).sort((a, b) => sort === 'Price' ? (a.price ?? Number.POSITIVE_INFINITY) - (b.price ?? Number.POSITIVE_INFINITY) : sort === 'Duration' ? a.duration.localeCompare(b.duration) : 0), [searchFlights, sort, stops, maxPrice, favoritesOnly, saved]);
  return <main className="results-page min-h-[calc(100dvh-74px)]">
    <div className="mx-auto max-w-[1120px] px-5 py-7 lg:px-0 lg:py-10">
      <button onClick={onBack} className="back-link" data-testid="button-back-search"><ChevronLeft size={17} /> Edit search</button>
      <div className="mb-8 mt-5 flex flex-wrap items-end justify-between gap-5">
        <div className="rise-in"><div className="eyebrow mb-3"><span className="eyebrow-dot" /> Your next chapter</div><h1 className="results-title">{search.from.split(' (')[0]} <ArrowRight className="inline-block text-[#d58c78]" size={28} /> {search.to.split(' (')[0]}</h1><p className="mt-2 text-sm text-[#6b7777]">{search.depart}{search.returning ? ` · ${search.returning}` : ''} · <span className="font-semibold text-[#36545a]">{list.length} scheduled flights</span></p></div>
        <div className="flex items-center gap-2"><button onClick={() => setFavoritesOnly((current) => !current)} className={`filter-button ${favoritesOnly ? 'active' : ''}`} data-testid="button-filter-favorites"><Heart size={15} fill={favoritesOnly ? 'currentColor' : 'none'} /> {favoritesOnly ? 'Favourites' : 'All flights'}</button><label className="filter-select"><span>Sort by</span><select value={sort} onChange={(e) => setSort(e.target.value)} data-testid="select-sort"><option>Recommended</option><option>Price</option><option>Duration</option></select><ChevronDown size={14} /></label><button className="filter-button lg:hidden" data-testid="button-mobile-filters"><SlidersHorizontal size={16} /> Filters</button></div>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="filter-panel hidden lg:block">
          <div className="mb-5 flex items-center justify-between"><span className="font-bold text-[#21434b]">Refine</span><Filter size={16} className="text-[#7c8c89]" /></div>
          <div className="filter-group"><p>Stops</p>{['Any stops', 'Nonstop'].map((s) => <button key={s} onClick={() => setStops(s)} className={`filter-option ${stops === s ? 'selected' : ''}`} data-testid={`filter-${s.toLowerCase().replace(' ', '-')}`}><span className="radio-dot" />{s}<span className="ml-auto text-xs text-[#81908d]">{s === 'Nonstop' ? 4 : 5}</span></button>)}</div>
          {hasPrices && <div className="filter-group"><p>Price per traveller</p><div className="price-row"><span>$0</span><span>${maxPrice}</span></div><input type="range" min="250" max="600" step="10" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="price-range" data-testid="input-price-filter" /></div>}
          <div className="filter-group"><p>Cabin</p><button className="filter-option selected" data-testid="filter-economy"><span className="radio-dot" />Economy <Check size={14} className="ml-auto" /></button><button className="filter-option" data-testid="filter-premium"><span className="radio-dot" />Premium economy</button></div>
          <div className="filter-note"><CloudSun size={17} /><span>Live scheduled flights from AeroDataBox. Fare prices are not included.</span></div>
        </aside>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-[#6b7777]"><span><strong className="text-[#21434b]">{list.length}</strong> good options, sorted for you</span><span className="hidden items-center gap-1.5 sm:flex">Schedule data · fares are not provided by this API</span></div>
          {list.length === 0 ? <div className="empty-state"><div className="empty-icon"><CloudSun size={27} /></div><h2>No scheduled flights found</h2><p>Try another date or route. Availability comes from AeroDataBox and depends on its current coverage.</p><button onClick={() => { setMaxPrice(600); setStops('Any stops'); setFavoritesOnly(false); }} className="primary-button" data-testid="button-reset-filters">Reset filters</button></div> : list.map((flight, index) => <FlightCard key={flight.id} flight={flight} saved={saved.has(flight.id)} onToggleSave={onToggleSave} onSelect={onSelect} index={index} />)}
        </div>
      </div>
    </div>
  </main>;
}

function FlightCard({ flight, saved, onToggleSave, onSelect, index }: { flight: Flight; saved: boolean; onToggleSave: (id: string) => void; onSelect: (flight: Flight) => void; index: number }) {
  return <article className={`flight-card rise-in delay-${Math.min(index + 1, 4)}`} data-testid={`card-flight-${flight.id}`}>
    <div className="airline-mark" style={{ background: flight.tint }}><Plane size={18} /></div>
    <div className="flight-main"><div className="flight-route"><div><strong>{flight.depart}</strong><span>{flight.from}</span></div><div className="flight-line"><small>{flight.duration}</small><span><i /><i /><i /></span><small>{flight.stops}</small></div><div className="text-right"><strong>{flight.arrive}</strong><span>{flight.to}</span></div></div><div className="flight-meta"><span className="font-semibold text-[#36545a]">{flight.airline}</span><span className="hidden text-[#87918e] sm:inline">·</span><span>{flight.stopNote}</span>{flight.badge && <span className="deal-badge"><BadgeCheck size={13} /> {flight.badge}</span>}</div></div>
    <div className="flight-price"><button onClick={() => onToggleSave(flight.id)} className={`heart-button ${saved ? 'saved' : ''}`} aria-label={saved ? `Remove ${flight.airline} from saved trips` : `Save ${flight.airline}`} data-testid={`button-save-${flight.id}`}>{saved ? <Heart size={18} fill="currentColor" /> : <Heart size={18} />}</button><div><span>{flight.price === null ? 'fare' : 'from'}</span><strong>{flight.price === null ? '—' : `$${flight.price}`}</strong></div><button onClick={() => onSelect(flight)} className="select-button" data-testid={`button-select-${flight.id}`}>View flight <ArrowRight size={15} /></button></div>
  </article>;
}

function SavedView({ saved, onToggleSave, onSearch, onSelect }: { saved: Set<string>; onToggleSave: (id: string) => void; onSearch: () => void; onSelect: (flight: Flight) => void }) {
  const items = flights.filter((f) => saved.has(f.id));
  return <main className="saved-page min-h-[calc(100dvh-74px)]"><div className="mx-auto max-w-[1120px] px-5 py-12 lg:px-0 lg:py-16"><div className="mb-10 max-w-[600px]"><div className="eyebrow mb-3"><span className="eyebrow-dot" /> Your little shortlist</div><h1 className="results-title">Saved <em>for later.</em></h1><p className="mt-3 text-[16px] leading-7 text-[#687876]">Keep a few possibilities close while you figure out which one is calling.</p></div>{items.length === 0 ? <div className="empty-state max-w-[650px]"><div className="empty-icon"><Heart size={27} /></div><h2>Nothing saved yet</h2><p>When a flight catches your eye, tap the heart and it will wait here for you.</p><button onClick={onSearch} className="primary-button" data-testid="button-find-flights"><Search size={16} /> Find a flight</button></div> : <div className="grid gap-3">{items.map((flight, i) => <FlightCard key={flight.id} flight={flight} saved onToggleSave={onToggleSave} onSelect={() => onSelect(flight)} index={i} />)}</div>}</div></main>;
}

function AccountModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'create'>('signin');
  const [notice, setNotice] = useState('');
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const password = String(new FormData(event.currentTarget).get('password') || '');
    if (mode === 'create' && (!/^.{7,}$/.test(password) || (password.match(/\d/g) || []).length < 2 || !/[^A-Za-z0-9]/.test(password))) {
      setNotice('Password needs 7+ characters, at least two numbers, and one special character.');
      return;
    }
    setNotice('Firebase sign-in will be enabled after Firebase Web configuration is added. No account has been created yet.');
  };
  const staticPage = (name: 'terms' | 'privacy') => `${import.meta.env.BASE_URL}${name}.html`;
  return <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="Account"><div className="account-modal rise-in"><button onClick={onClose} className="modal-close" aria-label="Close account modal"><X size={18} /></button><div className="modal-art"><div className="grid size-12 place-items-center rounded-2xl bg-[#e7b95d] text-[#18323c]"><Plane size={23} className="-rotate-12" /></div><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#8e7350]">AeroPath account</p><p className="mt-1 font-serif text-[25px] leading-none text-[#21434b]">Keep the good options close.</p></div></div><div className="modal-tabs"><button onClick={() => { setMode('signin'); setNotice(''); }} className={mode === 'signin' ? 'active' : ''}>Sign in</button><button onClick={() => { setMode('create'); setNotice(''); }} className={mode === 'create' ? 'active' : ''}>Create account</button></div><form onSubmit={submit} className="grid gap-4">{mode === 'create' && <label className="modal-field"><span>Username</span><input name="username" type="text" placeholder="Choose a username" minLength={3} maxLength={30} required /></label>}<label className="modal-field"><span>Email address</span><input name="email" type="email" placeholder="you@example.com" required /></label><label className="modal-field"><span>Password</span><input name="password" type="password" placeholder="7+ characters, 1 symbol, 2 numbers" required minLength={7} /></label><button className="primary-button w-full justify-center" type="submit">{mode === 'signin' ? 'Sign in' : 'Create account'} <ArrowRight size={16} /></button></form>{notice && <p className="mt-4 text-center text-xs leading-5 text-[#bb715e]">{notice}</p>}<p className="mt-5 text-center text-xs leading-5 text-[#89938f]">By continuing, you agree to AeroPath's <a className="underline" href={staticPage('terms')} target="_blank" rel="noreferrer">terms</a> and <a className="underline" href={staticPage('privacy')} target="_blank" rel="noreferrer">privacy policy</a>.</p></div></div>;
}

function SelectedToast({ flight, onClose }: { flight: Flight; onClose: () => void }) {
  return <div className="selection-toast rise-in"><div className="grid size-9 place-items-center rounded-xl bg-[#dceae5] text-[#397b7b]"><Check size={17} /></div><div><strong>Nice choice.</strong><span>{flight.airline} · {flight.price === null ? 'fare unavailable' : `$${flight.price}`} · {flight.depart}</span></div><button onClick={onClose} aria-label="Close selection message" data-testid="button-close-selection"><X size={16} /></button></div>;
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
  const ask = async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || typing) return;
    setDraft('');
    setMessages((current) => [...current, { id: Date.now(), role: 'user', text: trimmed }]);
    setTyping(true);
    try {
      const response = await fetch(`${apiBaseUrl}/assistant/chat`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: trimmed }) });
      const data = await response.json() as { answer?: string; error?: string };
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: data.answer || data.error || 'I could not answer that just now.' }]);
    } catch {
      setMessages((current) => [...current, { id: Date.now() + 1, role: 'assistant', text: 'AeroGuide cannot reach the server right now. Please try again shortly.' }]);
    } finally {
      setTyping(false);
    }
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
  const [view, setView] = useState<'home' | 'add' | 'results' | 'saved' | 'boarding' | 'tracking' | 'help' | 'map'>('home');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [flightResults, setFlightResults] = useState<Flight[]>([]);
  const [boardingPass, setBoardingPass] = useState<File | null>(null);
  const [search, setSearch] = useState({ from: '', to: '', depart: '', returning: '' });
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
  const doSearch = async (from: string, to: string, depart: string, returning: string) => {
    const origin = from.match(/\(([A-Z]{3})\)$/)?.[1] || (/^[A-Z]{3}$/.test(from.trim()) ? from.trim() : '');
    const destination = to.match(/\(([A-Z]{3})\)$/)?.[1] || (/^[A-Z]{3}$/.test(to.trim()) ? to.trim() : '');
    if (!origin || !destination || !depart) { setSearchError('Select origin, destination, and departure date before searching.'); return; }
    setSearchError('');
    setSearching(true);
    try {
      const params = new URLSearchParams({ origin, destination, departureDate: depart });
      const response = await fetch(`${apiBaseUrl}/flights/search?${params}`);
      const body = await response.text();
      let data: { offers?: Array<{ id: string; flightNumber?: string; airline?: string; status?: string; departure: { iata: string; time?: string }; arrival: { iata: string; time?: string }; aircraft?: string }>; error?: string; detail?: string };
      try { data = JSON.parse(body) as typeof data; } catch { throw new Error('The flight server returned a web page. Check VITE_API_BASE_URL and make sure the backend is running.'); }
      if (!response.ok) throw new Error(data.detail || data.error || 'Flight search failed.');
      const formatTime = (value?: string) => {
        if (!value) return '—';
        const parsed = new Date(value);
        return Number.isNaN(parsed.getTime()) ? value : new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(parsed);
      };
      const results: Flight[] = (data.offers || []).map((offer, index) => ({
        id: offer.id || `${offer.flightNumber || 'flight'}-${index}`,
        airline: offer.airline || 'Unknown airline',
        code: offer.flightNumber?.slice(0, 2) || '—',
        from: offer.departure?.iata || origin,
        to: offer.arrival?.iata || destination,
        depart: formatTime(offer.departure?.time),
        arrive: formatTime(offer.arrival?.time),
        duration: 'Schedule',
        stops: 'Any stops',
        stopNote: `${offer.flightNumber || 'Flight'} · ${offer.status || 'Scheduled'}${offer.aircraft ? ` · ${offer.aircraft}` : ''}`,
        price: null,
        cabin: '—',
        tint: ['#e5b65f', '#6c9ea0', '#d78d7f', '#8b91b9'][index % 4],
      }));
      setSearch({ from, to, depart, returning });
      setFlightResults(results);
      setView('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'Unable to search flights.');
    } finally {
      setSearching(false);
    }
  };
  const toggleSave = (id: string) => setSaved((current) => { const next = new Set(current); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  const navigate = (next: string) => {
    setNavigationTarget(next);
    setTransitioning(true);
    window.setTimeout(() => {
       if (next === 'add') setView('add'); else if (next === 'results') setView('results'); else if (next === 'saved') setView('saved'); else if (next === 'boarding') setView('boarding'); else if (next === 'tracking') setView('tracking'); else if (next === 'help') setView('help'); else if (next === 'map') setView('map'); else setView('home');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTransitioning(false);
      setNavigationTarget(null);
    }, 1100);
  };
  return <div className={`noise min-h-[100dvh] ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>{booting ? <LoadingScreen /> : <><NavBar view={view} onNavigate={navigate} onAccount={() => setAccountOpen(true)} theme={theme} onThemeToggle={() => setTheme((current) => current === 'light' ? 'dark' : 'light')} navigationPulse={transitioning} navigationTarget={navigationTarget} />{searching ? <LoadingResults /> : view === 'home' ? <HomeView /> : view === 'add' ? <AddTripView onSearch={doSearch} searchError={searchError} /> : view === 'results' ? <ResultsView search={search} flights={flightResults} saved={saved} onToggleSave={toggleSave} onBack={() => navigate('add')} onSelect={setSelected} /> : view === 'boarding' ? <BoardingPassView uploadedFile={boardingPass} onUpload={setBoardingPass} onRemove={() => setBoardingPass(null)} /> : view === 'tracking' ? <FlightTrackingView /> : view === 'help' ? <HelpView /> : view === 'map' ? <TravelMapView /> : <SavedView saved={saved} onToggleSave={toggleSave} onSearch={() => navigate('add')} onSelect={setSelected} />}{selected && <SelectedToast flight={selected} onClose={() => setSelected(null)} />}{accountOpen && <AccountModal onClose={() => setAccountOpen(false)} />}<AssistantWidget /></>}</div>;
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
