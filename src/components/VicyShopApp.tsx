import React, { useState, useEffect, useCallback } from 'react';
import {
  Zap,
  ShieldCheck,
  Gem,
  Headphones,
  Menu,
  X,
  MessageCircle,
  Lock,
  Crown,
  Gamepad2,
  ShoppingCart,
  Ticket,
  Clock,
  Settings,
  Instagram,
  Music2,
} from 'lucide-react';
import { Category, Product, StoreSettings } from '../types';
import { PurchaseModal, formatKzNum } from './PurchaseModal';
import { OrderTrackModal } from './OrderTrackModal';
import { AdminPanel } from './AdminPanel';
import { SeoHead, PublicRoutePath } from './SeoHead';
import { AngolaCoverageMap } from './AngolaCoverageMap';

const VALID_PUBLIC_PATHS: Record<string, { route: PublicRoutePath; sectionId?: string }> = {
  '/': { route: '/', sectionId: 'inicio' },
  '/diamantes': { route: '/diamantes', sectionId: 'tabela-diamantes' },
  '/passe-de-nivel': { route: '/passe-de-nivel', sectionId: 'tabela-passe-nivel' },
  '/airdrop': { route: '/airdrop', sectionId: 'tabela-airdrop' },
  '/robux': { route: '/robux', sectionId: 'tabela-robux' },
  '/como-comprar': { route: '/como-comprar', sectionId: 'como-comprar' },
  '/suporte': { route: '/suporte', sectionId: 'como-comprar' },
  '/admin': { route: '/admin' },
};

const SECTION_TO_PATH: Record<string, PublicRoutePath> = {
  inicio: '/',
  'tabela-diamantes': '/diamantes',
  'tabela-passe-nivel': '/passe-de-nivel',
  'tabela-airdrop': '/airdrop',
  'tabela-robux': '/robux',
  'como-comprar': '/como-comprar',
};

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'VICY SHOP',
  slogan: 'SEMPRE COM VOCÊ!',
  whatsappNumber: '+244 959 823 881',
  paymentPhone: '934 413 108',
  paymentRecipient: 'Vicente',
  paypayRef: '10116',
  unitelMoneyRef: '00930',
};

const AIRDROP_CRATE_IMAGE = '/src/assets/images/product_airdrop_crate_1791402112740.jpg';
const DIAMONDS_VAULT_IMAGE = '/src/assets/images/product_diamonds_pack_1791402094650.jpg';

export const VicyShopApp: React.FC = () => {
  const [view, setView] = useState<'store' | 'admin' | '404'>(() => {
    const p = window.location.pathname.replace(/\/+$/, '') || '/';
    if (p === '/admin') return 'admin';
    if (!VALID_PUBLIC_PATHS[p]) return '404';
    return 'store';
  });
  const [routePath, setRoutePath] = useState<PublicRoutePath>(() => {
    const p = window.location.pathname.replace(/\/+$/, '') || '/';
    return VALID_PUBLIC_PATHS[p]?.route || '/404';
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [trackModalOpen, setTrackModalOpen] = useState(false);
  const [lastOrderNumber, setLastOrderNumber] = useState('');

  const fetchStoreData = useCallback(async () => {
    try {
      const res = await fetch('/api/store');
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        if (data.settings) setSettings(data.settings);
      }
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    fetchStoreData();
  }, [fetchStoreData]);

  useEffect(() => {
    const handlePopState = () => {
      const p = window.location.pathname.replace(/\/+$/, '') || '/';
      if (p === '/admin') {
        setView('admin');
        setRoutePath('/admin');
      } else if (VALID_PUBLIC_PATHS[p]) {
        setView('store');
        setRoutePath(VALID_PUBLIC_PATHS[p].route);
        const secId = VALID_PUBLIC_PATHS[p].sectionId;
        if (secId) {
          setTimeout(() => {
            document.getElementById(secId)?.scrollIntoView({ behavior: 'smooth' });
          }, 80);
        }
      } else {
        setView('404');
        setRoutePath('/404');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const targetPath = SECTION_TO_PATH[id] || '/';
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    setView('store');
    setRoutePath(targetPath);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const openAdminView = () => {
    window.history.pushState({}, '', '/admin');
    setRoutePath('/admin');
    setView('admin');
  };

  if (view === 'admin') {
    return (
      <>
        <SeoHead routePath="/admin" products={products} />
        <AdminPanel
          onBackToStore={() => {
            window.history.pushState({}, '', '/');
            setRoutePath('/');
            fetchStoreData();
            setView('store');
          }}
          onStoreUpdated={fetchStoreData}
        />
      </>
    );
  }

  if (view === '404') {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-6 text-center">
        <SeoHead routePath="/404" products={products} />
        <div className="max-w-md w-full rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] shadow-[0_0_45px_rgba(0,136,255,0.35)] p-8 space-y-5">
          <Crown className="w-12 h-12 text-[#00A8FF] mx-auto drop-shadow-[0_0_15px_#00A8FF]" />
          <h1 className="text-4xl font-black italic uppercase font-display text-white">
            ERRO <span className="text-[#0088FF]">404</span>
          </h1>
          <p className="text-sm text-slate-300 font-semibold leading-relaxed">
            A página que tentou aceder não existe ou foi movida. Volte à página inicial da{' '}
            <strong className="text-white">VICY SHOP</strong> para ver as tabelas de Diamantes
            Free Fire, Assinaturas, Passe de Nível, Airdrop e Robux.
          </p>
          <button
            type="button"
            onClick={() => {
              window.history.pushState({}, '', '/');
              setRoutePath('/');
              setView('store');
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-xs font-black italic text-white uppercase tracking-wider shadow-[0_0_20px_rgba(0,136,255,0.5)] cursor-pointer"
          >
            VOLTAR À PÁGINA INICIAL DA VICY SHOP
          </button>
        </div>
      </div>
    );
  }

  const diamondProducts = products.filter((p) => p.category === 'diamantes');
  const subscriptionProducts = products.filter((p) => p.category === 'promocoes');
  const levelPassProducts = products.filter((p) => p.category === 'passe_nivel');
  const airdropProducts = products.filter((p) => p.category === 'airdrop');
  const robuxProducts = products.filter((p) => p.category === 'robux');

  // Support number: 959 823 881
  const supportWhatsAppUrl =
    'https://wa.me/244959823881?text=' +
    encodeURIComponent('Olá Suporte VICY SHOP (959 823 881)! Preciso de atendimento.');

  // Orders/Payment WhatsApp number: 934 413 108
  const ordersWhatsAppUrl =
    'https://wa.me/244934413108?text=' +
    encodeURIComponent('Olá VICY SHOP (934 413 108)! Quero fazer uma recarga.');

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col relative overflow-x-hidden">
      <SeoHead routePath={routePath} products={products} />
      {/* Ambient Electric Blue Background Glows matching the reference tables */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[420px] rounded-full bg-[#0066FF]/20 blur-[140px]" />
        <div className="absolute top-[35%] -left-32 w-[500px] h-[500px] rounded-full bg-[#0088FF]/15 blur-[130px]" />
        <div className="absolute bottom-10 -right-32 w-[550px] h-[550px] rounded-full bg-[#0055FF]/15 blur-[140px]" />
      </div>

      {/* ========================================================= */}
      {/* TOP NAVIGATION BAR */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#04091A]/90 backdrop-blur-md border-b-2 border-[#0088FF]/60 shadow-[0_4px_25px_rgba(0,136,255,0.25)]">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Lockup */}
          <a
            href="#inicio"
            className="flex items-center gap-1.5 text-xl sm:text-3xl font-black italic tracking-tight uppercase font-display whitespace-nowrap shrink-0"
          >
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] drop-shadow-[0_0_8px_#00A8FF]" />
            <span className="text-white drop-shadow-[0_2px_10px_rgba(255,255,255,0.3)]">
              VICY
            </span>
            <span className="text-[#0088FF] drop-shadow-[0_0_12px_#0088FF]">SHOP</span>
          </a>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-xs font-extrabold uppercase tracking-wider text-white">
            <button
              onClick={() => scrollToSection('inicio')}
              className="hover:text-[#00A8FF] transition-colors whitespace-nowrap cursor-pointer"
            >
              Início
            </button>
            <button
              onClick={() => scrollToSection('tabela-diamantes')}
              className="hover:text-[#00A8FF] transition-colors whitespace-nowrap cursor-pointer"
            >
              Diamantes
            </button>
            <button
              onClick={() => scrollToSection('tabela-passe-nivel')}
              className="hover:text-[#00A8FF] transition-colors whitespace-nowrap cursor-pointer"
            >
              Passe de Nível
            </button>
            <button
              onClick={() => scrollToSection('tabela-airdrop')}
              className="hover:text-[#00A8FF] transition-colors whitespace-nowrap cursor-pointer"
            >
              Especial Airdrop
            </button>
            <button
              onClick={() => scrollToSection('tabela-robux')}
              className="hover:text-[#00A8FF] transition-colors whitespace-nowrap cursor-pointer"
            >
              Robux
            </button>
            <button
              onClick={() => scrollToSection('como-comprar')}
              className="hover:text-[#00A8FF] transition-colors whitespace-nowrap cursor-pointer"
            >
              Como Comprar
            </button>
            <button
              onClick={() => scrollToSection('localizacao')}
              className="hover:text-[#00A8FF] transition-colors whitespace-nowrap cursor-pointer"
            >
              Mapa Angola
            </button>
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00B4FF] hover:text-white transition-colors whitespace-nowrap flex items-center gap-1"
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Suporte: 959 823 881</span>
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setTrackModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-[#07132B] hover:bg-[#0C1F44] border border-[#0088FF]/60 text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white transition-colors whitespace-nowrap cursor-pointer"
            >
              Meu Pedido
            </button>
            <button
              onClick={openAdminView}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-white transition-all flex items-center gap-1.5 whitespace-nowrap shadow-[0_0_15px_rgba(0,136,255,0.45)] cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>ADM</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="lg:hidden p-2 rounded-lg bg-[#07132B] border border-[#0088FF]/60 text-white"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#04091A] border-b-2 border-[#0088FF]/60 px-4 py-3 space-y-2">
            <div className="grid grid-cols-2 gap-2 text-xs font-extrabold uppercase">
              <button
                onClick={() => scrollToSection('inicio')}
                className="p-2.5 rounded-lg bg-[#07132B] border border-[#0088FF]/30 text-left text-white"
              >
                Início
              </button>
              <button
                onClick={() => scrollToSection('tabela-diamantes')}
                className="p-2.5 rounded-lg bg-[#07132B] border border-[#0088FF]/30 text-left text-[#00A8FF]"
              >
                Tabela Diamantes
              </button>
              <button
                onClick={() => scrollToSection('tabela-passe-nivel')}
                className="p-2.5 rounded-lg bg-[#07132B] border border-[#0088FF]/30 text-left text-[#00A8FF]"
              >
                Passe de Nível
              </button>
              <button
                onClick={() => scrollToSection('tabela-airdrop')}
                className="p-2.5 rounded-lg bg-[#07132B] border border-[#0088FF]/30 text-left text-[#00A8FF]"
              >
                Tabela Airdrop
              </button>
              <button
                onClick={() => scrollToSection('tabela-robux')}
                className="p-2.5 rounded-lg bg-[#07132B] border border-[#0088FF]/30 text-left text-[#00A8FF]"
              >
                Tabela Robux
              </button>
              <button
                onClick={() => scrollToSection('localizacao')}
                className="p-2.5 rounded-lg bg-[#07132B] border border-[#0088FF]/30 text-left text-[#00A8FF]"
              >
                Mapa Angola
              </button>
              <a
                href={supportWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 rounded-lg bg-[#0055FF]/20 border border-[#0088FF] text-center text-[#00B4FF]"
              >
                Suporte: 959 823 881
              </a>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 relative z-10 space-y-10 sm:space-y-12 py-6 sm:py-8">
        {/* ========================================================= */}
        {/* HERO BANNER (IMAGE 4: VICY SHOP LOGO + 4 PILLARS) */}
        {/* ========================================================= */}
        <section id="inicio" className="max-w-5xl mx-auto px-3 sm:px-6">
          <div className="rounded-2xl bg-gradient-to-b from-[#07142E] via-[#040B1A] to-[#030712] border-2 border-[#0088FF] shadow-[0_0_45px_rgba(0,136,255,0.35)] p-5 sm:p-10 text-center space-y-6 relative overflow-hidden">
            {/* Crown + VICY SHOP Emblem */}
            <div className="inline-flex flex-col items-center">
              <Crown className="w-11 h-11 sm:w-12 sm:h-12 text-[#00A8FF] drop-shadow-[0_0_15px_#00A8FF] mb-1" />
              <h1 className="text-4xl sm:text-6xl font-black italic tracking-tight uppercase font-display leading-none">
                <span className="text-white drop-shadow-[0_4px_16px_rgba(255,255,255,0.35)]">
                  VICY
                </span>{' '}
                <span className="text-[#0088FF] drop-shadow-[0_0_22px_#0088FF]">
                  SHOP
                </span>
              </h1>
              <p className="mt-2 text-[11px] sm:text-sm font-black italic text-[#00B4FF] tracking-widest uppercase">
                ★ SEMPRE COM VOCÊ! · SUA CONTA MAIS FORTE COM A GENTE! ★
              </p>
            </div>

            {/* 4 Pillars Bar from Image 4 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 bg-[#040A18]/90 border-2 border-[#0088FF]/80 rounded-xl p-3 sm:p-3.5 shadow-[0_0_25px_rgba(0,136,255,0.25)]">
              <div className="flex items-center justify-center gap-2 py-2 border-b md:border-b-0 md:border-r border-[#0088FF]/30">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0 drop-shadow-[0_0_8px_#00A8FF]" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black italic text-white leading-tight uppercase">
                    RECARGAS
                  </p>
                  <p className="text-[11px] sm:text-xs font-extrabold italic text-[#00A8FF] leading-tight uppercase">
                    DE DIAMANTES
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-2 border-b md:border-b-0 md:border-r border-[#0088FF]/30">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0 drop-shadow-[0_0_8px_#00A8FF]" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black italic text-white leading-tight uppercase">
                    CONTAS
                  </p>
                  <p className="text-[11px] sm:text-xs font-extrabold italic text-[#00A8FF] leading-tight uppercase">
                    FREE FIRE
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-2 md:border-r border-[#0088FF]/30">
                <Ticket className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0 drop-shadow-[0_0_8px_#00A8FF]" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black italic text-white leading-tight uppercase">
                    PASSES
                  </p>
                  <p className="text-[11px] sm:text-xs font-extrabold italic text-[#00A8FF] leading-tight uppercase">
                    BOOYAH
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 py-2">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0 drop-shadow-[0_0_8px_#00A8FF]" />
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-black italic text-white leading-tight uppercase">
                    SEGURANÇA
                  </p>
                  <p className="text-[11px] sm:text-xs font-extrabold italic text-[#00A8FF] leading-tight uppercase">
                    GARANTIDA
                  </p>
                </div>
              </div>
            </div>

            {/* Symmetrical Fast Action Buttons */}
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center justify-center gap-2.5 sm:gap-3 pt-1">
              <button
                onClick={() => scrollToSection('tabela-diamantes')}
                className="col-span-2 sm:col-span-1 px-4 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-xs sm:text-sm font-black italic text-white uppercase tracking-wider shadow-[0_0_20px_rgba(0,136,255,0.5)] cursor-pointer text-center"
              >
                💎 Diamantes & Assinaturas
              </button>
              <button
                onClick={() => scrollToSection('tabela-passe-nivel')}
                className="px-3 sm:px-5 py-3 rounded-xl bg-[#071531] hover:bg-[#0B214A] border-2 border-[#0088FF] text-[11px] sm:text-sm font-black italic text-[#00B4FF] uppercase tracking-wider cursor-pointer text-center"
              >
                🎮 Passe de Nível
              </button>
              <button
                onClick={() => scrollToSection('tabela-airdrop')}
                className="px-3 sm:px-5 py-3 rounded-xl bg-[#071531] hover:bg-[#0B214A] border-2 border-[#0088FF] text-[11px] sm:text-sm font-black italic text-[#00B4FF] uppercase tracking-wider cursor-pointer text-center"
              >
                👑 Tabela Airdrop
              </button>
              <button
                onClick={() => scrollToSection('tabela-robux')}
                className="col-span-2 sm:col-span-1 px-4 sm:px-5 py-3 rounded-xl bg-[#071531] hover:bg-[#0B214A] border-2 border-[#0088FF] text-xs sm:text-sm font-black italic text-white uppercase tracking-wider cursor-pointer text-center"
              >
                ◈ Tabela Robux
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TABELA DIAMANTES & ASSINATURAS FREE FIRE */}
        {/* ========================================================= */}
        <section id="tabela-diamantes" className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4">
          <div className="rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] shadow-[0_0_40px_rgba(0,136,255,0.35)] p-3.5 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
              {/* LEFT PANEL: DIAMANTES — RECARREGUE SEU FREE FIRE */}
              <div className="lg:col-span-7 rounded-2xl bg-[#030712] border-2 border-[#0088FF] p-3 sm:p-5 space-y-3.5 shadow-[0_0_30px_rgba(0,136,255,0.25)]">
                {/* Header */}
                <div className="flex items-center justify-center gap-3 pb-2 border-b border-[#0088FF]/40">
                  <Gem className="w-8 h-8 sm:w-10 sm:h-10 text-[#00A8FF] drop-shadow-[0_0_12px_#00A8FF] shrink-0" />
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight font-display text-white leading-none">
                      DIAMANTES
                    </h2>
                    <p className="text-[10px] sm:text-xs font-black italic uppercase tracking-widest text-[#00A8FF] mt-0.5">
                      RECARREGUE SEU FREE FIRE
                    </p>
                  </div>
                </div>

                {/* Column Header Pill (5 - 4 - 3 proportions so COMPRAR never clips) */}
                <div className="grid grid-cols-12 items-center px-2.5 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-[#071839] via-[#0B285E] to-[#071839] border border-[#0088FF] text-[10px] sm:text-xs font-black uppercase tracking-wider text-white">
                  <span className="col-span-5 text-left">QUANTIDADE</span>
                  <span className="col-span-4 text-center">PREÇO</span>
                  <span className="col-span-3 text-center">COMPRAR</span>
                </div>

                {/* 8 Diamond Rows */}
                <div className="space-y-2.5">
                  {diamondProducts.map((dm) => {
                    const parts = (dm.diamondsOrRobux || '').split('+');
                    const baseAmount = parts[0]?.trim() || dm.diamondsOrRobux;
                    const bonusAmount = parts[1]?.trim() || '';
                    return (
                      <div
                        key={dm.id}
                        onClick={() => setSelectedProduct(dm)}
                        className="grid grid-cols-12 items-center rounded-xl bg-[#050E22] hover:bg-[#081A3E] border-2 border-[#0088FF]/70 hover:border-[#00B4FF] transition-all cursor-pointer overflow-hidden group shadow-[0_0_15px_rgba(0,136,255,0.2)]"
                      >
                        {/* Quantity with White Base + Electric Blue Bonus (col-span-5) */}
                        <div className="col-span-5 flex items-center gap-1.5 sm:gap-2.5 pl-2.5 pr-1 sm:px-4 py-2.5 sm:py-3 min-w-0">
                          <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8FF] shrink-0 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_#00A8FF]" />
                          <span className="text-xs sm:text-xl font-black italic font-mono-tabular whitespace-nowrap leading-none">
                            <span className="text-white">{baseAmount}</span>
                            {bonusAmount && (
                              <span className="text-[#00A8FF]"> + {bonusAmount}</span>
                            )}
                          </span>
                        </div>

                        {/* Price Capsule (col-span-4) */}
                        <div className="col-span-4 py-2.5 sm:py-3 px-1 sm:px-2 text-center bg-gradient-to-r from-[#0044CC]/50 via-[#0066FF]/65 to-[#0044CC]/50 border-x border-[#0088FF]/50">
                          <span className="text-xs sm:text-lg font-black italic text-white font-mono-tabular whitespace-nowrap drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]">
                            {formatKzNum(dm.priceKz)} Kz
                          </span>
                        </div>

                        {/* Centered Buy Button (col-span-3) */}
                        <div className="col-span-3 px-1.5 sm:px-2.5 py-1.5 flex items-center justify-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(dm);
                            }}
                            className="w-full py-1.5 sm:py-2 px-1.5 sm:px-3 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-[10px] sm:text-xs font-black italic text-white uppercase tracking-wide text-center whitespace-nowrap shadow-[0_0_12px_rgba(0,136,255,0.45)] cursor-pointer"
                          >
                            COMPRAR
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT PANEL: ASSINATURAS — MAIS DIAMANTES, MAIS VANTAGENS */}
              <div className="lg:col-span-5 rounded-2xl bg-[#030712] border-2 border-[#0088FF] p-3 sm:p-5 space-y-3.5 shadow-[0_0_30px_rgba(0,136,255,0.25)]">
                {/* Header */}
                <div className="flex items-center justify-center gap-3 pb-2 border-b border-[#0088FF]/40">
                  <Ticket className="w-8 h-8 sm:w-10 sm:h-10 text-[#00A8FF] drop-shadow-[0_0_12px_#00A8FF] shrink-0" />
                  <div className="text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tight font-display text-white leading-none">
                      ASSINATURAS
                    </h2>
                    <p className="text-[10px] sm:text-xs font-black italic uppercase tracking-wider text-[#00A8FF] mt-0.5">
                      MAIS DIAMANTES, MAIS VANTAGENS
                    </p>
                  </div>
                </div>

                {/* 4 Subscription / Pass Cards */}
                <div className="space-y-3">
                  {subscriptionProducts.map((sub) => {
                    const isGold =
                      sub.id.includes('mensal') || sub.id.includes('booyah');
                    const isBooyah = sub.id.includes('booyah');
                    const titleLabel = sub.levelLabel || sub.name;
                    return (
                      <div
                        key={sub.id}
                        onClick={() => setSelectedProduct(sub)}
                        className="rounded-xl bg-[#050E22] hover:bg-[#081A3E] border-2 border-[#0088FF] hover:border-[#00B4FF] p-3.5 transition-all cursor-pointer shadow-[0_0_20px_rgba(0,136,255,0.2)] space-y-3 group"
                      >
                        <div className="flex items-center justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center border-2 shrink-0 ${
                                isGold
                                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                                  : 'bg-[#0055FF]/25 border-[#00A8FF] text-[#00A8FF] shadow-[0_0_15px_rgba(0,168,255,0.35)]'
                              }`}
                            >
                              {isBooyah ? (
                                <Ticket className="w-5 h-5" />
                              ) : (
                                <Crown className="w-5 h-5" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-base sm:text-lg font-black italic uppercase text-white tracking-wide leading-tight truncate">
                                {titleLabel}
                              </h3>
                              {!isBooyah ? (
                                <div className="inline-flex items-center gap-1 text-sm sm:text-base font-black italic text-white font-mono-tabular mt-0.5">
                                  <Gem className="w-3.5 h-3.5 text-[#00A8FF] shrink-0" />
                                  <span>{sub.diamondsOrRobux}</span>
                                </div>
                              ) : (
                                <p className="text-[11px] font-bold italic text-amber-300">
                                  Passe Oficial Free Fire
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0044CC] to-[#0088FF] border border-[#00B4FF] text-right shrink-0 shadow-[0_0_15px_rgba(0,136,255,0.4)]">
                            <span className="text-sm sm:text-lg font-black italic text-white font-mono-tabular whitespace-nowrap">
                              {formatKzNum(sub.priceKz)} Kz
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(sub);
                          }}
                          className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-xs font-black italic text-white uppercase tracking-wider text-center shadow-[0_0_12px_rgba(0,136,255,0.4)] cursor-pointer"
                        >
                          COMPRAR AGORA
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Trust Strip matching the Diamantes Table */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl bg-[#030712] border-2 border-[#0088FF] p-3.5">
              <div className="flex items-center gap-2.5 border-r border-[#0088FF]/30 pr-2">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                  <p className="text-white">ENTREGA</p>
                  <p className="text-[#00A8FF]">RÁPIDA</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 lg:border-r border-[#0088FF]/30 pr-2">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                  <p className="text-white">100% SEGURO</p>
                  <p className="text-[#00A8FF]">SEM RISCO DE BAN</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 border-r border-[#0088FF]/30 pr-2">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                  <p className="text-white">SUPORTE</p>
                  <p className="text-[#00A8FF]">24/7</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                  <p className="text-white">CONFIANÇA É</p>
                  <p className="text-[#00A8FF]">A NOSSA MARCA!</p>
                </div>
              </div>
            </div>

            {/* Footer Row of Diamantes Poster */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs sm:text-sm font-black italic uppercase">
              <a
                href={ordersWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-white hover:text-[#00A8FF]"
              >
                <div className="w-9 h-9 rounded-full bg-[#0055FF]/30 border-2 border-white flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span>FAÇA JÁ SUA RECARGA!</span>
              </a>

              <div className="text-center">
                <p className="text-lg sm:text-xl font-black italic font-display">
                  <span className="text-white">VICY </span>
                  <span className="text-[#0088FF]">SHOP</span>
                </p>
                <p className="text-[11px] text-[#00A8FF]">SEMPRE COM VOCÊ!</p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-[#0088FF] block text-[10px]">INSTAGRAM</span>
                  <span className="text-white not-italic font-bold">@vicyshop.oficial</span>
                </div>
                <div>
                  <span className="text-[#0088FF] block text-[10px]">TIKTOK</span>
                  <span className="text-white not-italic font-bold">VicyD7</span>
                </div>
              </div>
            </div>

            <p className="text-center text-xs sm:text-sm font-black italic tracking-widest uppercase border-t border-[#0088FF]/30 pt-3">
              A SUA SATISFAÇÃO É A NOSSA <span className="text-[#0088FF]">MISSÃO!</span>
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TABELA 1: PROMOÇÃO - PASSE DE NÍVEL (IMAGE 1) */}
        {/* ========================================================= */}
        <section id="tabela-passe-nivel" className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4">
          {/* Header Banner */}
          <div className="flex items-center justify-center gap-2.5 sm:gap-3 text-center">
            <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-[#00A8FF] drop-shadow-[0_0_10px_#00A8FF] shrink-0" />
            <h2 className="text-xl sm:text-4xl font-black italic tracking-tight uppercase font-display">
              <span className="text-white">PROMOÇÃO - </span>
              <span className="text-[#0088FF] drop-shadow-[0_0_15px_#0088FF]">
                PASSE DE NÍVEL
              </span>
            </h2>
            <Gem className="w-6 h-6 sm:w-7 sm:h-7 text-[#00A8FF] drop-shadow-[0_0_10px_#00A8FF] shrink-0" />
          </div>

          {/* Neon Table */}
          <div className="rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] shadow-[0_0_35px_rgba(0,136,255,0.35)] overflow-hidden">
            <table className="w-full border-collapse table-fixed sm:table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-[#071738] via-[#0A2458] to-[#071738] border-b-2 border-[#0088FF] text-[10px] sm:text-base font-black italic uppercase tracking-wider text-white">
                  <th className="w-[34%] sm:w-auto py-3 sm:py-4 px-2 sm:px-6 text-left border-r border-[#0088FF]/30">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0088FF] shrink-0" />
                      <span className="truncate">PASSE DE NÍVEL</span>
                    </div>
                  </th>
                  <th className="w-[22%] sm:w-auto py-3 sm:py-4 px-1.5 sm:px-6 text-center border-r border-[#0088FF]/30">
                    <div className="inline-flex items-center justify-center gap-1 sm:gap-2">
                      <Gem className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-[#00A8FF] shrink-0 hidden sm:inline" />
                      <span>DIAMANTES</span>
                    </div>
                  </th>
                  <th className="w-[22%] sm:w-auto py-3 sm:py-4 px-1.5 sm:px-6 text-center border-r border-[#0088FF]/30">
                    <div className="inline-flex items-center justify-center gap-1 sm:gap-2">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white hidden sm:flex items-center justify-center text-[10px] font-black not-italic">
                        KZ
                      </span>
                      <span>PREÇO</span>
                    </div>
                  </th>
                  <th className="w-[22%] sm:w-auto py-3 sm:py-4 px-1.5 sm:px-6 text-center">
                    COMPRAR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0088FF]/25 text-xs sm:text-lg font-extrabold italic">
                {levelPassProducts.map((lp) => (
                  <tr
                    key={lp.id}
                    onClick={() => setSelectedProduct(lp)}
                    className="hover:bg-[#0066FF]/15 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 sm:py-3.5 px-2 sm:px-6 text-white border-r border-[#0088FF]/25 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                        <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#0088FF] shrink-0 group-hover:scale-110 transition-transform" />
                        <span className="truncate">{lp.name}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-3.5 px-1.5 sm:px-6 text-center text-white border-r border-[#0088FF]/25 font-mono-tabular whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1">
                        <span>{lp.diamondsOrRobux}</span>
                        <Gem className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00A8FF] shrink-0" />
                      </div>
                    </td>
                    <td className="py-3 sm:py-3.5 px-1.5 sm:px-6 text-center text-[#0088FF] border-r border-[#0088FF]/25 font-mono-tabular font-black whitespace-nowrap drop-shadow-[0_0_8px_rgba(0,136,255,0.4)]">
                      {formatKzNum(lp.priceKz)} Kz
                    </td>
                    <td className="py-2.5 sm:py-3 px-1.5 sm:px-6 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(lp);
                        }}
                        className="w-full sm:w-auto px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-[10px] sm:text-xs font-black italic text-white uppercase tracking-wide shadow-[0_0_15px_rgba(0,136,255,0.45)] cursor-pointer"
                      >
                        COMPRAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 4 Badges Strip below Passe de Nível Table */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] p-3.5 sm:p-4 shadow-[0_0_25px_rgba(0,136,255,0.25)]">
            <div className="flex items-center gap-2.5 border-r border-[#0088FF]/30 pr-2">
              <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#0088FF] shrink-0" />
              <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                <p className="text-white">ENTREGA</p>
                <p className="text-[#0088FF]">RÁPIDA</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 lg:border-r border-[#0088FF]/30 pr-2">
              <Lock className="w-6 h-6 sm:w-7 sm:h-7 text-[#0088FF] shrink-0" />
              <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                <p className="text-white">100% SEGURO</p>
                <p className="text-[#0088FF]">E CONFIÁVEL</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 border-r border-[#0088FF]/30 pr-2">
              <Headphones className="w-6 h-6 sm:w-7 sm:h-7 text-[#0088FF] shrink-0" />
              <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                <p className="text-white">SUPORTE</p>
                <p className="text-[#0088FF]">DEDICADO</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Settings className="w-6 h-6 sm:w-7 sm:h-7 text-[#0088FF] shrink-0" />
              <div className="text-[11px] sm:text-xs font-black italic uppercase leading-tight">
                <p className="text-white">CONFIANÇA</p>
                <p className="text-[#0088FF]">E QUALIDADE</p>
              </div>
            </div>
          </div>

          {/* Socials Bar (Instagram & TikTok) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] p-3.5 shadow-[0_0_25px_rgba(0,136,255,0.25)]">
            <div className="flex items-center justify-center gap-3 sm:border-r border-[#0088FF]/35 py-1">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                <Instagram className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black italic text-[#0088FF] uppercase leading-none">
                  INSTAGRAM
                </p>
                <p className="text-sm sm:text-base font-extrabold text-white">
                  @vicyshop.oficial
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 py-1">
              <div className="w-9 h-9 rounded-xl bg-black border border-white/25 flex items-center justify-center text-[#00A8FF] shrink-0">
                <Music2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black italic text-[#0088FF] uppercase leading-none">
                  TIKTOK
                </p>
                <p className="text-sm sm:text-base font-extrabold text-white">
                  VicyDark007
                </p>
              </div>
            </div>
          </div>

          {/* WhatsApp Contacts Bar (Pedidos 934 413 108 & Suporte 959 823 881) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] p-3.5 shadow-[0_0_25px_rgba(0,136,255,0.25)]">
            <a
              href={ordersWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 sm:border-r border-[#0088FF]/35 py-1 hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white shrink-0">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black italic text-[#0088FF] uppercase leading-none">
                  WHATSAPP PAGAMENTOS / PEDIDOS
                </p>
                <p className="text-lg sm:text-xl font-black text-white font-mono-tabular">
                  +244 934413108
                </p>
              </div>
            </a>

            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-3 py-1 hover:opacity-90 transition-opacity"
            >
              <div className="w-10 h-10 rounded-full bg-[#0088FF] border-2 border-white flex items-center justify-center text-white shrink-0">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-black italic text-[#00B4FF] uppercase leading-none">
                  WHATSAPP SUPORTE OFICIAL
                </p>
                <p className="text-lg sm:text-xl font-black text-white font-mono-tabular">
                  +244 959 823 881
                </p>
              </div>
            </a>
          </div>

          <p className="text-center text-xs sm:text-sm font-black italic tracking-widest uppercase pt-1">
            <span className="text-[#0088FF]">VICY SHOP</span> - QUALIDADE, COMPROMISSO E CONFIANÇA!
          </p>
        </section>

        {/* ========================================================= */}
        {/* TABELA 2: ESPECIAL AIRDROP FREE FIRE (IMAGE 2) */}
        {/* ========================================================= */}
        <section id="tabela-airdrop" className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4 pt-2">
          <div className="rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] shadow-[0_0_40px_rgba(0,136,255,0.35)] p-4 sm:p-8 space-y-6">
            {/* Top Banner Header of Airdrop Poster */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-[#0088FF]/40 pb-6">
              <div className="space-y-2 text-center md:text-left">
                <div className="inline-block px-5 py-2 rounded-xl bg-gradient-to-r from-[#071839] via-[#0B2558] to-[#071839] border-2 border-[#0088FF] shadow-[0_0_20px_rgba(0,136,255,0.35)]">
                  <p className="text-lg sm:text-xl font-black italic text-white uppercase tracking-wider leading-none">
                    ESPECIAL
                  </p>
                  <p className="text-3xl sm:text-5xl font-black italic text-[#0088FF] uppercase tracking-tight font-display drop-shadow-[0_0_15px_#0088FF]">
                    AIRDROP
                  </p>
                  <p className="text-xs font-extrabold italic text-white flex items-center justify-center md:justify-start gap-1.5 mt-1">
                    <Gem className="w-3.5 h-3.5 text-[#00A8FF]" />
                    <span>AIRDROP FREE FIRE</span>
                    <Gem className="w-3.5 h-3.5 text-[#00A8FF]" />
                  </p>
                </div>

                <div className="pt-2">
                  <p className="text-lg sm:text-2xl font-black italic text-white uppercase leading-tight">
                    DIAMANTES MAIS
                  </p>
                  <p className="text-2xl sm:text-3xl font-black italic text-[#0088FF] uppercase leading-tight drop-shadow-[0_0_12px_#0088FF]">
                    BARATOS
                  </p>
                  <p className="text-sm sm:text-base font-black italic text-white uppercase">
                    PARA SUA CONTA!
                  </p>
                </div>
              </div>

              {/* Crate Showcase */}
              <div className="w-full md:w-72 rounded-2xl overflow-hidden border-2 border-[#0088FF] bg-[#030712] shadow-[0_0_25px_rgba(0,136,255,0.35)]">
                <img
                  src={AIRDROP_CRATE_IMAGE}
                  alt="Caixa Especial Airdrop Free Fire em Angola — VICY SHOP"
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  className="w-full h-44 object-cover"
                />
              </div>
            </div>

            {/* Middle Components: Left Description Box + Right x299 Timer Box */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
              <div className="md:col-span-5 rounded-xl bg-[#07132B] border-2 border-[#0088FF]/80 p-4 flex items-start gap-3">
                <Gem className="w-8 h-8 text-[#00A8FF] shrink-0 mt-0.5 drop-shadow-[0_0_8px_#00A8FF]" />
                <p className="text-xs sm:text-sm text-white leading-relaxed font-semibold">
                  Aproveite ofertas com excelente custo-benefício e consiga{' '}
                  <span className="text-[#00A8FF] font-extrabold">diamantes</span> por um
                  preço acessível. Além dos diamantes, alguns airdrops podem incluir{' '}
                  <span className="text-[#00A8FF] font-extrabold">
                    skins, emotes, tickets
                  </span>{' '}
                  e outros itens exclusivos, dependendo da oferta disponível.
                </p>
              </div>

              <div className="md:col-span-7 rounded-xl bg-[#07132B] border-2 border-[#0088FF]/80 p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 z-10">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#030712] border border-[#0088FF] text-xs sm:text-sm font-black text-white font-mono-tabular">
                    <Clock className="w-4 h-4 text-[#00A8FF]" />
                    <span>11:28:49</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-black italic text-[#00A8FF] uppercase">
                    SUA CONTA MAIS FORTE COM A GENTE! 👑
                  </span>
                </div>

                <div className="my-3 flex items-center justify-center gap-4 z-10">
                  <img
                    src={DIAMONDS_VAULT_IMAGE}
                    alt="Pacote x299 Diamantes Free Fire em Kwanzas — VICY SHOP Angola"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                    className="w-24 h-20 rounded-xl object-cover border border-[#0088FF]"
                  />
                  <div>
                    <p className="text-xs font-black italic text-white uppercase">
                      FREE FIRE
                    </p>
                    <p className="text-3xl sm:text-4xl font-black italic text-[#0088FF] font-mono-tabular drop-shadow-[0_0_12px_#0088FF]">
                      x299 💎
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* PARABÉNS Reward Strip Component */}
            <div className="rounded-xl bg-[#061024] border-2 border-[#0088FF]/80 p-4 space-y-3">
              <div className="flex items-center justify-center gap-2 text-sm sm:text-base font-black italic text-white uppercase tracking-widest">
                <Crown className="w-4 h-4 text-[#00A8FF]" />
                <span>PARABÉNS</span>
                <Crown className="w-4 h-4 text-[#00A8FF]" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto">
                <div className="p-2.5 rounded-lg bg-gradient-to-b from-red-900/60 to-[#030712] border border-red-500/50 text-center">
                  <Ticket className="w-5 h-5 text-red-400 mx-auto" />
                  <span className="block text-[11px] font-black text-white mt-1">
                    TICKETS · x6
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-b from-purple-900/60 to-[#030712] border border-purple-500/50 text-center">
                  <Gamepad2 className="w-5 h-5 text-purple-300 mx-auto" />
                  <span className="block text-[11px] font-black text-white mt-1">
                    EMOTE RARO
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-b from-blue-900/60 to-[#030712] border border-[#0088FF]/60 text-center">
                  <Crown className="w-5 h-5 text-[#00A8FF] mx-auto" />
                  <span className="block text-[11px] font-black text-white mt-1">
                    SKIN / PET
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-gradient-to-b from-[#0055FF]/50 to-[#030712] border border-[#00A8FF] text-center">
                  <Gem className="w-5 h-5 text-[#00A8FF] mx-auto" />
                  <span className="block text-[11px] font-black text-[#00B4FF] mt-1">
                    DIAMANTES · x299
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    if (airdropProducts[0]) setSelectedProduct(airdropProducts[0]);
                  }}
                  className="px-8 py-2 rounded-lg bg-gradient-to-b from-white to-slate-300 text-slate-950 text-xs font-black uppercase tracking-wider cursor-pointer"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (airdropProducts[0]) setSelectedProduct(airdropProducts[0]);
                  }}
                  className="px-8 py-2 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#0088FF] border border-[#00A8FF] text-white text-xs font-black uppercase tracking-wider shadow-[0_0_12px_rgba(0,136,255,0.45)] cursor-pointer"
                >
                  EQUIPAR
                </button>
              </div>
            </div>

            {/* 👑 TABELA DE PREÇOS: (AIRDROP TABLE FROM IMAGE 2) */}
            <div className="space-y-0">
              <div className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-t-xl bg-gradient-to-r from-[#081A3E] to-[#0D2B66] border-2 border-b-0 border-[#0088FF]">
                <Crown className="w-5 h-5 text-[#00A8FF]" />
                <h3 className="text-sm sm:text-xl font-black italic text-white uppercase tracking-wider font-display">
                  TABELA DE PREÇOS:
                </h3>
              </div>

              <div className="rounded-b-xl rounded-tr-xl bg-[#030712] border-2 border-[#0088FF] shadow-[0_0_30px_rgba(0,136,255,0.3)] overflow-hidden">
                <table className="w-full border-collapse table-fixed sm:table-auto">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#071839] via-[#0B285E] to-[#071839] border-b-2 border-[#0088FF] text-[10px] sm:text-base font-black italic uppercase tracking-wider text-white">
                      <th className="w-[26%] sm:w-auto py-3 sm:py-3.5 px-2 sm:px-6 text-left border-r border-[#0088FF]/30">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8FF] shrink-0" />
                          <span>AIRDROP</span>
                        </div>
                      </th>
                      <th className="w-[24%] sm:w-auto py-3 sm:py-3.5 px-1.5 sm:px-6 text-center border-r border-[#0088FF]/30">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white hidden sm:flex items-center justify-center text-[10px] font-black not-italic">
                            $
                          </span>
                          <span>PREÇO (US$)</span>
                        </div>
                      </th>
                      <th className="w-[26%] sm:w-auto py-3 sm:py-3.5 px-1.5 sm:px-6 text-center border-r border-[#0088FF]/30">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-white hidden sm:flex items-center justify-center text-[10px] font-black not-italic">
                            Kz
                          </span>
                          <span>PREÇO (KZ)</span>
                        </div>
                      </th>
                      <th className="w-[24%] sm:w-auto py-3 sm:py-3.5 px-1.5 sm:px-6 text-center">
                        COMPRAR
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#0088FF]/25 text-xs sm:text-2xl font-black italic">
                    {airdropProducts.map((ad) => (
                      <tr
                        key={ad.id}
                        onClick={() => setSelectedProduct(ad)}
                        className="hover:bg-[#0066FF]/15 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 sm:py-4 px-2 sm:px-6 text-white border-r border-[#0088FF]/25 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 sm:gap-2.5">
                            <Gem className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A8FF] shrink-0" />
                            <span>AIRDROP</span>
                          </div>
                        </td>
                        <td className="py-3.5 sm:py-4 px-1.5 sm:px-6 text-center text-[#0088FF] border-r border-[#0088FF]/25 font-mono-tabular whitespace-nowrap drop-shadow-[0_0_8px_rgba(0,136,255,0.4)]">
                          {ad.diamondsOrRobux}
                        </td>
                        <td className="py-3.5 sm:py-4 px-1.5 sm:px-6 text-center text-white border-r border-[#0088FF]/25 font-mono-tabular whitespace-nowrap bg-[#0055FF]/20">
                          {formatKzNum(ad.priceKz)} Kz
                        </td>
                        <td className="py-2.5 sm:py-3 px-1.5 sm:px-6 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProduct(ad);
                            }}
                            className="w-full sm:w-auto px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-[10px] sm:text-xs font-black italic text-white uppercase tracking-wide shadow-[0_0_15px_rgba(0,136,255,0.45)] cursor-pointer"
                          >
                            COMPRAR
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom 4 Trust Badges + Footer of Airdrop Poster */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-[#030712] border border-[#0088FF]/60 flex items-center gap-2.5">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <span className="text-[11px] sm:text-xs font-black italic text-white uppercase">
                  ENTREGA RÁPIDA
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#030712] border border-[#0088FF]/60 flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <span className="text-[11px] sm:text-xs font-black italic text-white uppercase">
                  100% SEGURO SEM RISCO DE BAN
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#030712] border border-[#0088FF]/60 flex items-center gap-2.5">
                <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <span className="text-[11px] sm:text-xs font-black italic text-white uppercase">
                  SUPORTE 24/7 (959 823 881)
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#030712] border border-[#0088FF]/60 flex items-center gap-2.5">
                <Gem className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A8FF] shrink-0" />
                <span className="text-[11px] sm:text-xs font-black italic text-white uppercase">
                  CONFIANÇA É A NOSSA MARCA!
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#0088FF]/30 text-xs sm:text-sm font-black italic uppercase">
              <a
                href={ordersWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-white hover:text-[#00A8FF]"
              >
                <MessageCircle className="w-5 h-5 text-[#00A8FF]" />
                <span>FAÇA JÁ SUA RECARGA!</span>
              </a>
              <span className="text-[#0088FF]">VICY SHOP · SEMPRE COM VOCÊ!</span>
              <span className="text-white bg-[#0055FF]/30 border border-[#0088FF] px-3 py-1 rounded-lg">
                OBRIGADO PELA PREFERÊNCIA! 👑
              </span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* TABELA 3: TABELA DE PREÇOS ROBUX (IMAGE 3) */}
        {/* ========================================================= */}
        <section id="tabela-robux" className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4 pt-2">
          <div className="text-center space-y-2">
            <p className="text-xl sm:text-3xl font-black italic text-white uppercase tracking-wider font-display">
              TABELA DE PREÇOS
            </p>
            <h2 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tight font-display text-[#0066FF] drop-shadow-[0_0_25px_#0066FF]">
              ROBUX
            </h2>

            {/* Top 3 Pill Strip from Image 3 */}
            <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-2.5 rounded-xl bg-[#040B1A] border-2 border-[#0088FF] text-[11px] sm:text-xs font-black italic uppercase">
              <span className="flex items-center gap-1.5 text-white">
                <Zap className="w-4 h-4 text-[#00A8FF]" /> ENTREGA RÁPIDA
              </span>
              <span className="text-[#0088FF]">|</span>
              <span className="flex items-center gap-1.5 text-white">
                <ShieldCheck className="w-4 h-4 text-[#00A8FF]" /> 100% SEGURO
              </span>
              <span className="text-[#0088FF]">|</span>
              <span className="flex items-center gap-1.5 text-white">
                <Gem className="w-4 h-4 text-[#00A8FF]" /> CONFIANÇA É A NOSSA MARCA!
              </span>
            </div>
          </div>

          {/* Robux Table Container */}
          <div className="rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] shadow-[0_0_40px_rgba(0,136,255,0.35)] overflow-hidden">
            <table className="w-full border-collapse table-fixed sm:table-auto">
              <thead>
                <tr className="bg-gradient-to-r from-[#003399] via-[#0055FF] to-[#003399] border-b-2 border-[#0088FF] text-xs sm:text-lg font-black italic uppercase tracking-wider text-white">
                  <th className="w-[33%] sm:w-auto py-3.5 sm:py-4 px-2 sm:px-6 text-center border-r border-white/25">
                    PACOTE
                  </th>
                  <th className="w-[38%] sm:w-auto py-3.5 sm:py-4 px-2 sm:px-6 text-center border-r border-white/25">
                    PREÇO DE VENDA (KZ)
                  </th>
                  <th className="w-[29%] sm:w-auto py-3.5 sm:py-4 px-2 sm:px-6 text-center">
                    COMPRAR
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#0088FF]/25 text-sm sm:text-2xl font-black italic">
                {robuxProducts.map((rb) => (
                  <tr
                    key={rb.id}
                    onClick={() => setSelectedProduct(rb)}
                    className="hover:bg-[#0066FF]/15 transition-colors cursor-pointer"
                  >
                    <td className="py-3 sm:py-3.5 px-2 sm:px-6 text-center text-white border-r border-[#0088FF]/25 font-mono-tabular whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-1.5 sm:gap-2.5">
                        <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-gradient-to-b from-white to-slate-300 text-slate-950 flex items-center justify-center text-[10px] sm:text-xs font-black not-italic shadow shrink-0">
                          ◈
                        </span>
                        <span>{rb.diamondsOrRobux}</span>
                      </div>
                    </td>
                    <td className="py-3 sm:py-3.5 px-2 sm:px-6 text-center text-[#0077FF] border-r border-[#0088FF]/25 font-mono-tabular whitespace-nowrap drop-shadow-[0_0_10px_rgba(0,119,255,0.45)]">
                      {formatKzNum(rb.priceKz)} KZ
                    </td>
                    <td className="py-2.5 sm:py-3 px-2 sm:px-6 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProduct(rb);
                        }}
                        className="w-full sm:w-auto px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-[10px] sm:text-xs font-black italic text-white uppercase tracking-wide shadow-[0_0_15px_rgba(0,136,255,0.45)] cursor-pointer"
                      >
                        COMPRAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom Bar of Robux Table */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] p-3.5 sm:p-4 shadow-[0_0_25px_rgba(0,136,255,0.25)]">
            <div className="flex items-center gap-2.5 border-r border-[#0088FF]/30 pr-2">
              <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#0088FF] shrink-0" />
              <div className="text-[11px] font-black italic uppercase leading-tight">
                <p className="text-white">ENTREGA AUTOMÁTICA</p>
                <p className="text-[#0088FF]">RÁPIDA E SEGURA</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 lg:border-r border-[#0088FF]/30 pr-2">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#0088FF] shrink-0" />
              <div className="text-[11px] font-black italic uppercase leading-tight">
                <p className="text-white">100% SEGURO</p>
                <p className="text-[#0088FF]">SEM RISCO DE BAN</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 border-r border-[#0088FF]/30 pr-2">
              <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-[#0088FF] shrink-0" />
              <div className="text-[11px] font-black italic uppercase leading-tight">
                <p className="text-white">SUPORTE 24/7</p>
                <p className="text-[#0088FF]">959 823 881</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-[#0088FF] shrink-0" />
              <div className="text-[11px] font-black italic uppercase leading-tight">
                <p className="text-white">VICY SHOP</p>
                <p className="text-[#0088FF]">SEMPRE COM VOCÊ!</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SEO CONTENT: COMO COMPRAR & PERGUNTAS FREQUENTES (ANGOLA) */}
        {/* ========================================================= */}
        <section id="como-comprar" className="max-w-5xl mx-auto px-3 sm:px-6 space-y-6 pt-2">
          <div className="rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] shadow-[0_0_35px_rgba(0,136,255,0.3)] p-5 sm:p-8 space-y-6">
            <div className="text-center space-y-1.5">
              <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight font-display text-white">
                COMO COMPRAR NA <span className="text-[#0088FF]">VICY SHOP ANGOLA</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-semibold max-w-2xl mx-auto">
                Recarregue Diamantes Free Fire, Assinaturas, Passe Booyah, Passe de Nível,
                Especial Airdrop e Robux em Kwanzas (KZ) com total segurança.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <article className="p-4 rounded-xl bg-[#030712] border border-[#0088FF]/60 space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#0055FF]/30 border border-[#0088FF] text-[11px] font-black text-[#00B4FF]">
                  PASSO 1
                </span>
                <h3 className="text-sm sm:text-base font-black italic uppercase text-white">
                  Escolha o Pacote
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Selecione o pacote nas tabelas de Diamantes Free Fire, Assinaturas, Passe de
                  Nível, Airdrop ou Robux e clique em <strong>COMPRAR</strong>.
                </p>
              </article>

              <article className="p-4 rounded-xl bg-[#030712] border border-[#0088FF]/60 space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#0055FF]/30 border border-[#0088FF] text-[11px] font-black text-[#00B4FF]">
                  PASSO 2
                </span>
                <h3 className="text-sm sm:text-base font-black italic uppercase text-white">
                  Informe o ID do Jogo
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Digite o seu nome, telefone, ID da conta Free Fire (ou utilizador Roblox) e o
                  seu Nickname corretamente.
                </p>
              </article>

              <article className="p-4 rounded-xl bg-[#030712] border border-[#0088FF]/60 space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#0055FF]/30 border border-[#0088FF] text-[11px] font-black text-[#00B4FF]">
                  PASSO 3
                </span>
                <h3 className="text-sm sm:text-base font-black italic uppercase text-white">
                  Pague e Anexe o Comprovativo
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Transfira via <strong>Multicaixa Express, PayPay (10116)</strong> ou{' '}
                  <strong>Unitel Money (00930)</strong> para <strong>934 413 108 (Vicente)</strong>{' '}
                  e anexe o comprovativo obrigatório.
                </p>
              </article>

              <article className="p-4 rounded-xl bg-[#030712] border border-[#0088FF]/60 space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded bg-[#0055FF]/30 border border-[#0088FF] text-[11px] font-black text-[#00B4FF]">
                  PASSO 4
                </span>
                <h3 className="text-sm sm:text-base font-black italic uppercase text-white">
                  Confirmação no WhatsApp
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Clique em Confirmar Pagamento para enviar os dados do pedido para o WhatsApp{' '}
                  <strong>934 413 108</strong> e receber a sua recarga rapidamente.
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GOOGLE MAPS: MAPA DE ATENDIMENTO & COBERTURA ANGOLA */}
        {/* ========================================================= */}
        <AngolaCoverageMap
          ordersWhatsAppUrl={ordersWhatsAppUrl}
          supportWhatsAppUrl={supportWhatsAppUrl}
        />
      </main>

      {/* ========================================================= */}
      {/* FOOTER */}
      {/* ========================================================= */}
      <footer className="bg-[#02050E] border-t-2 border-[#0088FF]/60 pt-8 pb-24 sm:pb-10 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <p className="text-xl font-black italic uppercase font-display text-white">
              VICY <span className="text-[#0088FF]">SHOP</span>
            </p>
            <p className="text-xs font-extrabold italic text-[#00A8FF]">
              CONFIANÇA É A NOSSA MARCA! · VICY SHOP, SEMPRE COM VOCÊ!
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-extrabold uppercase">
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#07142E] border border-[#0088FF] text-[#00B4FF] hover:text-white transition-colors"
            >
              🎧 Suporte WhatsApp: 959 823 881
            </a>
            <a
              href={ordersWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-lg bg-[#0055FF]/25 border border-[#0088FF] text-white hover:text-[#00A8FF] transition-colors"
            >
              📲 Pagamentos / Pedidos: 934 413 108
            </a>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* FLOATING WHATSAPP SUPPORT BUTTON (959 823 881) */}
      {/* ========================================================= */}
      <a
        href={supportWhatsAppUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-40 py-2.5 px-4 sm:py-3 sm:px-5 rounded-full bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] border-2 border-[#00B4FF] text-white font-black italic uppercase tracking-wider text-[11px] sm:text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(0,136,255,0.65)] transition-transform hover:scale-105"
      >
        <Headphones className="w-4 h-4 shrink-0" />
        <span>Suporte · 959 823 881</span>
      </a>

      {/* MODALS */}
      {selectedProduct && (
        <PurchaseModal
          product={selectedProduct}
          settings={settings}
          onClose={() => setSelectedProduct(null)}
          onOrderSuccess={(ordNum) => setLastOrderNumber(ordNum)}
        />
      )}

      {trackModalOpen && (
        <OrderTrackModal
          initialQuery={lastOrderNumber}
          onClose={() => setTrackModalOpen(false)}
        />
      )}
    </div>
  );
};
