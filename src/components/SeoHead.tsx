import React, { useEffect } from 'react';
import { Product } from '../types';

export type PublicRoutePath =
  | '/'
  | '/diamantes'
  | '/passe-de-nivel'
  | '/airdrop'
  | '/robux'
  | '/como-comprar'
  | '/suporte'
  | '/admin'
  | '/404';

interface SeoHeadProps {
  routePath: PublicRoutePath;
  products: Product[];
}

const ROUTE_META: Record<
  PublicRoutePath,
  { title: string; description: string; noindex?: boolean }
> = {
  '/': {
    title: 'VICY SHOP — Diamantes Free Fire e Robux em Angola (KZ)',
    description:
      'Compre Diamantes Free Fire, Assinaturas, Passe de Nível, Airdrop e Robux em Kwanzas (KZ) na VICY SHOP. Entrega rápida via Express, PayPay e Unitel Money.',
  },
  '/diamantes': {
    title: 'Comprar Diamantes Free Fire e Assinaturas em KZ | VICY SHOP',
    description:
      'Tabela de preços oficial de Diamantes Free Fire (65+13 a 5.600+1.120) e Assinaturas (Econômica, Semanal, Mensal e Passe Booyah) em Kwanzas em Angola.',
  },
  '/passe-de-nivel': {
    title: 'Promoção Passe de Nível Free Fire em Kwanzas | VICY SHOP',
    description:
      'Adquira o Passe de Nível Free Fire (Nível 6 ao Nível 30) a partir de 1.200 KZ em Angola com entrega rápida e pagamento por Multicaixa Express, PayPay e Unitel Money.',
  },
  '/airdrop': {
    title: 'Especial Airdrop Free Fire Mais Barato em KZ | VICY SHOP',
    description:
      'Tabela de preços Especial Airdrop Free Fire em Angola (1.500 Kz, 1.600 Kz, 1.800 Kz e 3.200 Kz). Recarregue diamantes e itens exclusivos sem risco de ban.',
  },
  '/robux': {
    title: 'Tabela de Preços Robux (Roblox) em Kwanzas | VICY SHOP',
    description:
      'Compre Robux em Angola de 40 a 4.500 Robux a partir de 900 KZ. Entrega rápida e segura via Express, PayPay e Unitel Money com suporte 24/7.',
  },
  '/como-comprar': {
    title: 'Como Comprar Diamantes Free Fire e Robux em Angola | VICY SHOP',
    description:
      'Veja o passo a passo para comprar Diamantes Free Fire e Robux em Kwanzas (KZ) na VICY SHOP usando Multicaixa Express, PayPay (10116) ou Unitel Money (00930).',
  },
  '/suporte': {
    title: 'Suporte Oficial 24/7 e Contactos WhatsApp | VICY SHOP Angola',
    description:
      'Fale com o suporte dedicado 24/7 da VICY SHOP no WhatsApp (+244 959 823 881) ou envie o seu pedido para +244 934 413 108.',
  },
  '/admin': {
    title: 'Painel Administrativo Privado | VICY SHOP',
    description: 'Área restrita de administração da VICY SHOP.',
    noindex: true,
  },
  '/404': {
    title: 'Página Não Encontrada (404) | VICY SHOP Angola',
    description:
      'A página que procura não foi encontrada. Volte à página inicial da VICY SHOP para ver as tabelas de Diamantes Free Fire e Robux em KZ.',
    noindex: true,
  },
};

export const SeoHead: React.FC<SeoHeadProps> = ({ routePath, products }) => {
  useEffect(() => {
    const meta = ROUTE_META[routePath] || ROUTE_META['/'];
    const origin = window.location.origin;
    const cleanPath = routePath === '/404' ? window.location.pathname : routePath;
    const canonicalUrl = `${origin}${cleanPath === '/' ? '/' : cleanPath}`;

    // 1. Update Document Title
    document.title = meta.title;

    // 2. Update Meta Description
    const descEl = document.querySelector('meta[name="description"]');
    if (descEl) descEl.setAttribute('content', meta.description);

    // 3. Update Robots Meta (noindex on /admin and /404)
    const robotsEl = document.getElementById('meta-robots') || document.querySelector('meta[name="robots"]');
    if (robotsEl) {
      robotsEl.setAttribute(
        'content',
        meta.noindex
          ? 'noindex, nofollow, noarchive'
          : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
      );
    }

    // 4. Update Canonical Link
    const canonicalEl = document.getElementById('canonical-link') as HTMLLinkElement | null;
    if (canonicalEl) canonicalEl.href = canonicalUrl;

    // 5. Update Open Graph & Twitter tags
    const setMetaContent = (id: string, value: string) => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('content', value);
    };
    setMetaContent('og-title', meta.title);
    setMetaContent('og-description', meta.description);
    setMetaContent('og-url', canonicalUrl);
    setMetaContent('twitter-title', meta.title);
    setMetaContent('twitter-description', meta.description);

    // 6. Optional Google Search Console verification tag from env
    const gscCode = (import.meta.env.VITE_GOOGLE_SITE_VERIFICATION || '').trim();
    if (gscCode) {
      let gscMeta = document.querySelector('meta[name="google-site-verification"]');
      if (!gscMeta) {
        gscMeta = document.createElement('meta');
        gscMeta.setAttribute('name', 'google-site-verification');
        document.head.appendChild(gscMeta);
      }
      gscMeta.setAttribute('content', gscCode);
    }

    // 7. Optional Google Analytics 4 (gtag.js) from env
    const gaId = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
    if (gaId && !document.getElementById('ga-gtag-script')) {
      const s1 = document.createElement('script');
      s1.id = 'ga-gtag-script';
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`;
      document.head.appendChild(s1);

      const s2 = document.createElement('script');
      s2.text = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${gaId}');
      `;
      document.head.appendChild(s2);
    }

    // 8. Enrich Schema.org JSON-LD with live Product Offers
    const schemaEl = document.getElementById('schema-jsonld');
    if (schemaEl && !meta.noindex) {
      const productOffers = products.slice(0, 24).map((p, idx) => ({
        '@type': 'ListItem',
        position: idx + 1,
        item: {
          '@type': 'Product',
          name: `${p.name} — VICY SHOP`,
          description: p.description,
          image: `${origin}${p.image}`,
          brand: {
            '@type': 'Brand',
            name: 'VICY SHOP',
          },
          offers: {
            '@type': 'Offer',
            url: canonicalUrl,
            priceCurrency: 'AOA',
            price: String(p.priceKz),
            availability: 'https://schema.org/InStock',
            seller: {
              '@type': 'Organization',
              name: 'VICY SHOP',
            },
          },
        },
      }));

      const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'OnlineStore',
            '@id': `${origin}/#organization`,
            name: 'VICY SHOP',
            alternateName: 'VICY SHOP Angola — Sempre Com Você!',
            url: origin,
            logo: `${origin}/src/assets/images/vicy_hero_banner_1791402096927.jpg`,
            image: `${origin}/src/assets/images/vicy_hero_banner_1791402096927.jpg`,
            description:
              'Loja online profissional de Free Fire e Roblox em Angola. Venda de Diamantes, Assinaturas, Passe Booyah, Airdrops, Passe de Nível e Robux em Kwanzas (KZ).',
            telephone: '+244 959 823 881',
            currenciesAccepted: 'AOA',
            paymentAccepted: 'Multicaixa Express, PayPay, Unitel Money',
            priceRange: '600 KZ - 67.000 KZ',
            areaServed: {
              '@type': 'Country',
              name: 'Angola',
            },
            sameAs: ['https://www.instagram.com/vicyshop.oficial'],
          },
          {
            '@type': 'WebSite',
            '@id': `${origin}/#website`,
            url: origin,
            name: 'VICY SHOP — Diamantes Free Fire e Robux em Angola',
            inLanguage: 'pt-AO',
            publisher: {
              '@id': `${origin}/#organization`,
            },
          },
          ...(productOffers.length > 0
            ? [
                {
                  '@type': 'ItemList',
                  '@id': `${origin}/#catalog`,
                  name: 'Tabela Oficial de Preços VICY SHOP (Diamantes Free Fire, Assinaturas, Passe de Nível, Airdrop e Robux)',
                  itemListElement: productOffers,
                },
              ]
            : []),
          {
            '@type': 'FAQPage',
            '@id': `${origin}/#faq`,
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Como comprar Diamantes Free Fire e Robux na VICY SHOP em Angola?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Escolha o pacote desejado na tabela (Diamantes, Assinaturas, Passe de Nível, Airdrop ou Robux), clique em COMPRAR, preencha o seu ID do jogo e Nickname, efetue o pagamento via Multicaixa Express, PayPay (Ref: 10116) ou Unitel Money (Ref: 00930) para o número 934 413 108 (Vicente), anexe o comprovativo obrigatório e confirme no WhatsApp.',
                },
              },
              {
                '@type': 'Question',
                name: 'Quais são os métodos de pagamento aceites pela VICY SHOP?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'A VICY SHOP aceita pagamentos em Kwanzas (KZ) através de Multicaixa Express, PayPay (Referência: 10116) e Unitel Money (Referência: 00930) para o número oficial 934 413 108 (Vicente).',
                },
              },
              {
                '@type': 'Question',
                name: 'Qual é o contacto de Suporte 24/7 da VICY SHOP?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'O número oficial de Suporte 24/7 no WhatsApp é +244 959 823 881 e o WhatsApp de pagamentos/pedidos é +244 934 413 108.',
                },
              },
            ],
          },
        ],
      };

      schemaEl.textContent = JSON.stringify(jsonLd);
    }
  }, [routePath, products]);

  return null;
};
