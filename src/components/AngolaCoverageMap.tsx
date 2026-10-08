import React, { useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  Pin,
  useAdvancedMarkerRef,
} from '@vis.gl/react-google-maps';
import { MapPin, ShieldCheck, Zap, Headphones, MessageCircle, Globe } from 'lucide-react';

interface CoverageHub {
  id: string;
  city: string;
  province: string;
  position: { lat: number; lng: number };
  isHeadquarters?: boolean;
  deliverySpeed: string;
  paymentMethods: string;
}

const ANGOLA_COVERAGE_HUBS: CoverageHub[] = [
  {
    id: 'luanda-hq',
    city: 'Luanda (Central VICY SHOP)',
    province: 'Província de Luanda, Angola',
    position: { lat: -8.839, lng: 13.2894 },
    isHeadquarters: true,
    deliverySpeed: 'Entrega Imediata (3 a 10 min)',
    paymentMethods: 'Multicaixa Express · PayPay · Unitel Money',
  },
  {
    id: 'benguela',
    city: 'Benguela & Lobito',
    province: 'Província de Benguela, Angola',
    position: { lat: -12.5763, lng: 13.4055 },
    deliverySpeed: 'Atendimento Online 24/7',
    paymentMethods: 'Multicaixa Express · PayPay · Unitel Money',
  },
  {
    id: 'huambo',
    city: 'Huambo',
    province: 'Província do Huambo, Angola',
    position: { lat: -12.7761, lng: 15.7392 },
    deliverySpeed: 'Atendimento Online 24/7',
    paymentMethods: 'Multicaixa Express · PayPay · Unitel Money',
  },
  {
    id: 'lubango',
    city: 'Lubango',
    province: 'Província da Huíla, Angola',
    position: { lat: -14.9172, lng: 13.4925 },
    deliverySpeed: 'Atendimento Online 24/7',
    paymentMethods: 'Multicaixa Express · PayPay · Unitel Money',
  },
  {
    id: 'cabinda',
    city: 'Cabinda',
    province: 'Província de Cabinda, Angola',
    position: { lat: -5.55, lng: 12.2 },
    deliverySpeed: 'Atendimento Online 24/7',
    paymentMethods: 'Multicaixa Express · PayPay · Unitel Money',
  },
];

interface HubMarkerProps {
  hub: CoverageHub;
  isSelected: boolean;
  onSelect: (id: string | null) => void;
  ordersWhatsAppUrl: string;
}

const HubMarker: React.FC<HubMarkerProps> = ({
  hub,
  isSelected,
  onSelect,
  ordersWhatsAppUrl,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={hub.position}
        title={hub.city}
        onClick={() => onSelect(isSelected ? null : hub.id)}
      >
        <Pin
          background={hub.isHeadquarters ? '#0066FF' : '#00A8FF'}
          borderColor={'#FFFFFF'}
          glyphColor={'#FFFFFF'}
          scale={hub.isHeadquarters ? 1.3 : 1.1}
        />
      </AdvancedMarker>

      {isSelected && marker && (
        <InfoWindow
          anchor={marker}
          maxWidth={260}
          onCloseClick={() => onSelect(null)}
        >
          <div className="p-1 text-slate-900 space-y-1.5 font-sans">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded bg-[#0066FF] text-white text-[10px] font-black uppercase">
                {hub.isHeadquarters ? 'SEDE CENTRAL' : 'COBERTURA'}
              </span>
              <span className="text-xs font-extrabold text-slate-900">
                {hub.city}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 font-semibold">
              {hub.province}
            </p>
            <p className="text-[11px] text-emerald-700 font-bold">
              ⚡ {hub.deliverySpeed}
            </p>
            <p className="text-[10px] text-slate-700 font-medium">
              💳 {hub.paymentMethods}
            </p>
            <a
              href={ordersWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center w-full px-3 py-1.5 rounded-md bg-[#0066FF] hover:bg-[#0055CC] text-white text-[11px] font-black uppercase tracking-wide no-underline"
            >
              Recarregar pelo WhatsApp
            </a>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

interface AngolaCoverageMapProps {
  ordersWhatsAppUrl: string;
  supportWhatsAppUrl: string;
}

export const AngolaCoverageMap: React.FC<AngolaCoverageMapProps> = ({
  ordersWhatsAppUrl,
  supportWhatsAppUrl,
}) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  const [selectedHubId, setSelectedHubId] = useState<string | null>('luanda-hq');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: -10.5,
    lng: 14.5,
  });
  const [mapZoom, setMapZoom] = useState<number>(6);

  const handleFocusHub = (hub: CoverageHub) => {
    setSelectedHubId(hub.id);
    setMapCenter(hub.position);
    setMapZoom(hub.isHeadquarters ? 11 : 9);
  };

  return (
    <section id="localizacao" className="max-w-5xl mx-auto px-3 sm:px-6 space-y-4 pt-2">
      <div className="rounded-2xl bg-[#040B1A] border-2 border-[#0088FF] shadow-[0_0_40px_rgba(0,136,255,0.35)] p-4 sm:p-8 space-y-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#0088FF]/40 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#0055FF]/25 border border-[#0088FF] text-[11px] font-black italic text-[#00B4FF] uppercase">
              <MapPin className="w-3.5 h-3.5 text-[#00A8FF]" />
              <span>LOCALIZAÇÃO & COBERTURA NACIONAL</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black italic uppercase tracking-tight font-display text-white">
              MAPA DE ATENDIMENTO <span className="text-[#0088FF]">VICY SHOP ANGOLA</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-semibold">
              Central de operações em Luanda com cobertura digital imediata em todas as 18 províncias de Angola.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <a
              href={ordersWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#0055FF] to-[#0088FF] hover:from-[#0066FF] hover:to-[#00A8FF] text-xs font-black italic text-white uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(0,136,255,0.45)]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pedidos: 934 413 108</span>
            </a>
            <a
              href={supportWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#071531] hover:bg-[#0B214A] border border-[#0088FF] text-xs font-black italic text-[#00B4FF] uppercase tracking-wider flex items-center gap-2"
            >
              <Headphones className="w-4 h-4" />
              <span>Suporte: 959 823 881</span>
            </a>
          </div>
        </div>

        {/* Quick Province Selector Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-black italic uppercase text-[#00A8FF] mr-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Ver no Mapa:</span>
          </span>
          {ANGOLA_COVERAGE_HUBS.map((hub) => {
            const active = selectedHubId === hub.id;
            return (
              <button
                key={hub.id}
                type="button"
                onClick={() => handleFocusHub(hub)}
                className={`px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black italic uppercase transition-all cursor-pointer border ${
                  active
                    ? 'bg-[#0066FF] border-white text-white shadow-[0_0_15px_rgba(0,136,255,0.6)]'
                    : 'bg-[#030712] border-[#0088FF]/60 text-slate-200 hover:border-[#00B4FF] hover:text-white'
                }`}
              >
                {hub.city}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => {
              setSelectedHubId('luanda-hq');
              setMapCenter({ lat: -10.5, lng: 14.5 });
              setMapZoom(6);
            }}
            className="px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-black italic uppercase bg-[#07132B] border border-[#0088FF]/40 text-[#00A8FF] hover:text-white cursor-pointer"
          >
            Ver Angola Inteira
          </button>
        </div>

        {/* Google Map Container with Explicit Height (CF2 & CF9 Compliant) */}
        <div className="w-full h-[380px] sm:h-[440px] rounded-2xl overflow-hidden border-2 border-[#0088FF] bg-[#030712] shadow-[0_0_30px_rgba(0,136,255,0.25)] relative">
          {apiKey ? (
            <APIProvider apiKey={apiKey} language="pt-PT" region="AO">
              <Map
                mapId="DEMO_MAP_ID"
                center={mapCenter}
                zoom={mapZoom}
                onCameraChanged={(ev) => {
                  setMapCenter(ev.detail.center);
                  setMapZoom(ev.detail.zoom);
                }}
                gestureHandling="cooperative"
                disableDefaultUI={false}
                internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                className="w-full h-full"
              >
                {ANGOLA_COVERAGE_HUBS.map((hub) => (
                  <HubMarker
                    key={hub.id}
                    hub={hub}
                    isSelected={selectedHubId === hub.id}
                    onSelect={setSelectedHubId}
                    ordersWhatsAppUrl={ordersWhatsAppUrl}
                  />
                ))}
              </Map>
            </APIProvider>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-2">
              <MapPin className="w-10 h-10 text-[#0088FF]" />
              <p className="text-sm font-black uppercase text-white">
                Mapa de Cobertura VICY SHOP — Luanda, Angola
              </p>
              <p className="text-xs text-slate-400 max-w-md">
                Atendimento online 24/7 em Luanda, Benguela, Huambo, Lubango, Cabinda e todas as províncias de Angola via Multicaixa Express, PayPay e Unitel Money.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#030712] border border-[#0088FF]/60 flex items-center gap-3">
            <MapPin className="w-6 h-6 text-[#00A8FF] shrink-0" />
            <div>
              <p className="text-xs font-black italic text-white uppercase">
                SEDE OPERACIONAL
              </p>
              <p className="text-[11px] font-bold text-[#00A8FF]">
                Luanda, Angola (Atendimento Digital)
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#030712] border border-[#0088FF]/60 flex items-center gap-3">
            <Zap className="w-6 h-6 text-[#00A8FF] shrink-0" />
            <div>
              <p className="text-xs font-black italic text-white uppercase">
                COBERTURA 18 PROVÍNCIAS
              </p>
              <p className="text-[11px] font-bold text-[#00A8FF]">
                Recargas instantâneas em todo o país
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#030712] border border-[#0088FF]/60 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#00A8FF] shrink-0" />
            <div>
              <p className="text-xs font-black italic text-white uppercase">
                PAGAMENTOS EM KWANZAS (KZ)
              </p>
              <p className="text-[11px] font-bold text-[#00A8FF]">
                Express · PayPay · Unitel Money
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
