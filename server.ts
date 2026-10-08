import express from 'express';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IS_VERCEL = process.env.VERCEL === '1' || Boolean(process.env.VERCEL);
const DATA_DIR = IS_VERCEL ? path.join(os.tmpdir(), 'vicy-data') : path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'vicy_database_v2.json');

// Security helpers: scrypt hashing so admin codes are NEVER stored in plain text
function hashSecret(secret: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(secret.toUpperCase(), usedSalt, 64).toString('hex');
  return { hash: derivedKey, salt: usedSalt };
}

function verifySecret(secret: string, storedHash: string, salt: string): boolean {
  try {
    const derivedKey = crypto.scryptSync(secret.toUpperCase(), salt, 64);
    const storedBuffer = Buffer.from(storedHash, 'hex');
    if (derivedKey.length !== storedBuffer.length) return false;
    return crypto.timingSafeEqual(derivedKey, storedBuffer);
  } catch {
    return false;
  }
}

function sanitizeText(input: unknown, maxLen = 400): string {
  if (typeof input !== 'string') return '';
  return input.replace(/[<>]/g, '').trim().slice(0, maxLen);
}

function formatDateParts(dateObj = new Date()): { date: string; time: string; iso: string } {
  const iso = dateObj.toISOString();
  const date = iso.slice(0, 10);
  const time = dateObj.toTimeString().slice(0, 5);
  return { date, time, iso };
}

const SAMPLE_PROOF_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="640" viewBox="0 0 500 640">
      <rect width="500" height="640" fill="#040914"/>
      <rect x="24" y="24" width="452" height="592" rx="16" fill="#071226" stroke="#0088FF" stroke-width="2"/>
      <text x="50" y="80" fill="#00A8FF" font-family="monospace" font-size="22" font-weight="bold">COMPROVATIVO VICY SHOP</text>
      <line x1="50" y1="105" x2="450" y2="105" stroke="#1E293B" stroke-width="2"/>
      <text x="50" y="150" fill="#94A3B8" font-family="sans-serif" font-size="16">Destinatário:</text>
      <text x="230" y="150" fill="#FFFFFF" font-family="monospace" font-size="16" font-weight="bold">Vicente (934 413 108)</text>
      <text x="50" y="195" fill="#94A3B8" font-family="sans-serif" font-size="16">Referência:</text>
      <text x="230" y="195" fill="#00A8FF" font-family="monospace" font-size="16">PayPay 10116 / Unitel 00930</text>
      <text x="50" y="240" fill="#94A3B8" font-family="sans-serif" font-size="16">Estado da Operação:</text>
      <text x="230" y="240" fill="#00A8FF" font-family="monospace" font-size="16" font-weight="bold">TRANSFERÊNCIA CONCLUÍDA</text>
      <rect x="50" y="290" width="400" height="110" rx="10" fill="#030710" stroke="#0066FF"/>
      <text x="70" y="330" fill="#94A3B8" font-family="sans-serif" font-size="14">Autenticação Digital VICY SHOP</text>
      <text x="70" y="365" fill="#FFFFFF" font-family="monospace" font-size="18">TX-AO-994820174-VICY</text>
    </svg>`
  );

function createInitialVicyDb() {
  // Fixed admin code "VICY" (case-insensitive)
  const initialCode = Buffer.from('56494359', 'hex').toString('utf8');
  const { hash, salt } = hashSecret(initialCode);
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
  const twoDaysAgoStr = new Date(now.getTime() - 2 * 86400000).toISOString().slice(0, 10);

  const imgDiamonds = '/src/assets/images/product_diamonds_pack_1791402094650.jpg';
  const imgAirdrop = '/src/assets/images/product_airdrop_crate_1791402112740.jpg';
  const imgLevelPass = '/src/assets/images/product_level_pass_1791402124233.jpg';
  const imgRobux = '/src/assets/images/product_robux_pack_1791402134408.jpg';

  const categories = [
    {
      id: 'cat-diamantes',
      slug: 'diamantes',
      name: 'Diamantes Free Fire',
      description: 'Recarregue seu Free Fire — Pacotes de Diamantes com Bónus.',
      game: 'Free Fire',
      active: true,
    },
    {
      id: 'cat-assinaturas',
      slug: 'promocoes',
      name: 'Assinaturas & Passe Booyah',
      description: 'Assinatura Econômica, Semanal, Mensal e Passe Booyah.',
      game: 'Free Fire',
      active: true,
    },
    {
      id: 'cat-passe-nivel',
      slug: 'passe_nivel',
      name: 'Passe de Nível',
      description: 'Promoção Passe de Nível Free Fire (Nível 6 ao Nível 30).',
      game: 'Free Fire',
      active: true,
    },
    {
      id: 'cat-airdrop',
      slug: 'airdrop',
      name: 'Airdrop',
      description: 'Tabela de Preços Especial Airdrop Free Fire (US$ e KZ).',
      game: 'Free Fire',
      active: true,
    },
    {
      id: 'cat-robux',
      slug: 'robux',
      name: 'Robux',
      description: 'Tabela de Preços Oficial de Robux (40 a 4.500 Robux).',
      game: 'Roblox',
      active: true,
    },
  ];

  // Strictly the exact products from the uploaded tables
  const products = [
    // TABELA DIAMANTES — RECARREGUE SEU FREE FIRE
    {
      id: 'prod-dimas-65',
      name: '65 + 13 DIAMANTES',
      category: 'diamantes',
      priceKz: 900,
      diamondsOrRobux: '65 + 13',
      levelLabel: '65|13',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 65 + 13 Diamantes (Total 78 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-dimas-100',
      name: '100 + 20 DIAMANTES',
      category: 'diamantes',
      priceKz: 1300,
      diamondsOrRobux: '100 + 20',
      levelLabel: '100|20',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 100 + 20 Diamantes (Total 120 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-dimas-200',
      name: '200 + 40 DIAMANTES',
      category: 'diamantes',
      priceKz: 2600,
      diamondsOrRobux: '200 + 40',
      levelLabel: '200|40',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 200 + 40 Diamantes (Total 240 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-dimas-310',
      name: '310 + 62 DIAMANTES',
      category: 'diamantes',
      priceKz: 3700,
      diamondsOrRobux: '310 + 62',
      levelLabel: '310|62',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 310 + 62 Diamantes (Total 372 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-dimas-520',
      name: '520 + 104 DIAMANTES',
      category: 'diamantes',
      priceKz: 5600,
      diamondsOrRobux: '520 + 104',
      levelLabel: '520|104',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 520 + 104 Diamantes (Total 624 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-dimas-1060',
      name: '1.060 + 212 DIAMANTES',
      category: 'diamantes',
      priceKz: 11500,
      diamondsOrRobux: '1.060 + 212',
      levelLabel: '1.060|212',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 1.060 + 212 Diamantes (Total 1.272 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-dimas-2180',
      name: '2.180 + 436 DIAMANTES',
      category: 'diamantes',
      priceKz: 23000,
      diamondsOrRobux: '2.180 + 436',
      levelLabel: '2.180|436',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 2.180 + 436 Diamantes (Total 2.616 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-dimas-5600',
      name: '5.600 + 1.120 DIAMANTES',
      category: 'diamantes',
      priceKz: 56000,
      diamondsOrRobux: '5.600 + 1.120',
      levelLabel: '5.600|1.120',
      image: imgDiamonds,
      description: 'Recarga Free Fire: 5.600 + 1.120 Diamantes (Total 6.720 Diamantes).',
      active: true,
      stockStatus: 'Disponível',
    },

    // TABELA ASSINATURAS — MAIS DIAMANTES, MAIS VANTAGENS
    {
      id: 'prod-assinatura-economica',
      name: 'ASSINATURA ECONÔMICA (47 💎)',
      category: 'promocoes',
      priceKz: 600,
      diamondsOrRobux: '47',
      levelLabel: 'ECONÔMICA',
      image: imgDiamonds,
      description: 'Assinatura Econômica Free Fire — 47 Diamantes.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-assinatura-semanal',
      name: 'ASSINATURA SEMANAL (340 💎)',
      category: 'promocoes',
      priceKz: 2600,
      diamondsOrRobux: '340',
      levelLabel: 'SEMANAL',
      image: imgDiamonds,
      description: 'Assinatura Semanal Free Fire — 340 Diamantes.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-assinatura-mensal',
      name: 'ASSINATURA MENSAL (1.800 💎)',
      category: 'promocoes',
      priceKz: 11500,
      diamondsOrRobux: '1.800',
      levelLabel: 'MENSAL',
      image: imgDiamonds,
      description: 'Assinatura Mensal Free Fire — 1.800 Diamantes.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-passe-booyah',
      name: 'PASSE BOOYAH',
      category: 'promocoes',
      priceKz: 1800,
      diamondsOrRobux: 'BOOYAH!',
      levelLabel: 'PASSE BOOYAH',
      image: imgLevelPass,
      description: 'Passe Booyah Free Fire — Mais vantagens e recompensas exclusivas.',
      active: true,
      stockStatus: 'Disponível',
    },

    // TABELA 1: PROMOÇÃO - PASSE DE NÍVEL
    {
      id: 'prod-nivel-6',
      name: 'PASSE NÍVEL 6',
      category: 'passe_nivel',
      priceKz: 1200,
      diamondsOrRobux: '120',
      levelLabel: 'PASSE NÍVEL 6',
      image: imgLevelPass,
      description: 'Promoção Passe de Nível 6 — 120 Diamantes Free Fire.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-nivel-10',
      name: 'PASSE NÍVEL 10',
      category: 'passe_nivel',
      priceKz: 1200,
      diamondsOrRobux: '200',
      levelLabel: 'PASSE NÍVEL 10',
      image: imgLevelPass,
      description: 'Promoção Passe de Nível 10 — 200 Diamantes Free Fire.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-nivel-15',
      name: 'PASSE NÍVEL 15',
      category: 'passe_nivel',
      priceKz: 1200,
      diamondsOrRobux: '200',
      levelLabel: 'PASSE NÍVEL 15',
      image: imgLevelPass,
      description: 'Promoção Passe de Nível 15 — 200 Diamantes Free Fire.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-nivel-20',
      name: 'PASSE NÍVEL 20',
      category: 'passe_nivel',
      priceKz: 1200,
      diamondsOrRobux: '200',
      levelLabel: 'PASSE NÍVEL 20',
      image: imgLevelPass,
      description: 'Promoção Passe de Nível 20 — 200 Diamantes Free Fire.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-nivel-25',
      name: 'PASSE NÍVEL 25',
      category: 'passe_nivel',
      priceKz: 1200,
      diamondsOrRobux: '200',
      levelLabel: 'PASSE NÍVEL 25',
      image: imgLevelPass,
      description: 'Promoção Passe de Nível 25 — 200 Diamantes Free Fire.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-nivel-30',
      name: 'PASSE NÍVEL 30',
      category: 'passe_nivel',
      priceKz: 2400,
      diamondsOrRobux: '350',
      levelLabel: 'PASSE NÍVEL 30',
      image: imgLevelPass,
      description: 'Promoção Passe de Nível 30 — 350 Diamantes Free Fire.',
      active: true,
      stockStatus: 'Disponível',
    },

    // TABELA 2: ESPECIAL AIRDROP FREE FIRE (Sem cards separados, apenas os itens da tabela)
    {
      id: 'prod-airdrop-1500',
      name: 'AIRDROP (US$ 0,99)',
      category: 'airdrop',
      priceKz: 1500,
      diamondsOrRobux: 'US$ 0,99',
      levelLabel: 'AIRDROP',
      image: imgAirdrop,
      description: 'Especial Airdrop Free Fire — Preço (US$): US$ 0,99 | Preço (KZ): 1.500 Kz.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-airdrop-1600',
      name: 'AIRDROP (US$ 1,03)',
      category: 'airdrop',
      priceKz: 1600,
      diamondsOrRobux: 'US$ 1,03',
      levelLabel: 'AIRDROP',
      image: imgAirdrop,
      description: 'Especial Airdrop Free Fire — Preço (US$): US$ 1,03 | Preço (KZ): 1.600 Kz.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-airdrop-1800',
      name: 'AIRDROP (US$ 1,14)',
      category: 'airdrop',
      priceKz: 1800,
      diamondsOrRobux: 'US$ 1,14',
      levelLabel: 'AIRDROP',
      image: imgAirdrop,
      description: 'Especial Airdrop Free Fire — Preço (US$): US$ 1,14 | Preço (KZ): 1.800 Kz.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-airdrop-3200',
      name: 'AIRDROP (US$ 2,29)',
      category: 'airdrop',
      priceKz: 3200,
      diamondsOrRobux: 'US$ 2,29',
      levelLabel: 'AIRDROP',
      image: imgAirdrop,
      description: 'Especial Airdrop Free Fire — Preço (US$): US$ 2,29 | Preço (KZ): 3.200 Kz.',
      active: true,
      stockStatus: 'Disponível',
    },

    // TABELA 3: TABELA DE PREÇOS ROBUX
    {
      id: 'prod-robux-40',
      name: '40 ROBUX',
      category: 'robux',
      priceKz: 900,
      diamondsOrRobux: '40',
      image: imgRobux,
      description: 'Pacote 40 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-robux-80',
      name: '80 ROBUX',
      category: 'robux',
      priceKz: 1500,
      diamondsOrRobux: '80',
      image: imgRobux,
      description: 'Pacote 80 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-robux-400',
      name: '400 ROBUX',
      category: 'robux',
      priceKz: 6500,
      diamondsOrRobux: '400',
      image: imgRobux,
      description: 'Pacote 400 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-robux-800',
      name: '800 ROBUX',
      category: 'robux',
      priceKz: 13000,
      diamondsOrRobux: '800',
      image: imgRobux,
      description: 'Pacote 800 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-robux-1200',
      name: '1.200 ROBUX',
      category: 'robux',
      priceKz: 20000,
      diamondsOrRobux: '1.200',
      image: imgRobux,
      description: 'Pacote 1.200 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-robux-1700',
      name: '1.700 ROBUX',
      category: 'robux',
      priceKz: 27000,
      diamondsOrRobux: '1.700',
      image: imgRobux,
      description: 'Pacote 1.700 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-robux-3150',
      name: '3.150 ROBUX',
      category: 'robux',
      priceKz: 47000,
      diamondsOrRobux: '3.150',
      image: imgRobux,
      description: 'Pacote 3.150 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
    {
      id: 'prod-robux-4500',
      name: '4.500 ROBUX',
      category: 'robux',
      priceKz: 67000,
      diamondsOrRobux: '4.500',
      image: imgRobux,
      description: 'Pacote 4.500 Robux — Entrega automática rápida e segura.',
      active: true,
      stockStatus: 'Disponível',
    },
  ];

  const orders = [
    {
      id: 'ord-1',
      orderNumber: '#VCY-000001',
      customerName: 'braulio_ff',
      freeFireId: '5910293811',
      nickname: 'BraulioKing',
      phone: '941 205 338',
      productId: 'prod-nivel-30',
      productName: 'PASSE NÍVEL 30',
      productCategory: 'passe_nivel',
      quantity: 1,
      unitPriceKz: 2400,
      totalPriceKz: 2400,
      paymentMethod: 'PAYPAY',
      proofId: 'proof-1',
      proofFileName: 'paypay_10116_braulio.jpg',
      proofMimeType: 'image/svg+xml',
      proofDataUrl: SAMPLE_PROOF_DATA_URL,
      date: twoDaysAgoStr,
      time: '17:45',
      createdAt: `${twoDaysAgoStr}T17:45:00.000Z`,
      status: 'Concluído',
    },
    {
      id: 'ord-2',
      orderNumber: '#VCY-000002',
      customerName: 'Celma Joaquim',
      freeFireId: 'Celma_Rblx99',
      nickname: 'Celma_Rblx99',
      phone: '936 772 910',
      productId: 'prod-robux-800',
      productName: '800 ROBUX',
      productCategory: 'robux',
      quantity: 1,
      unitPriceKz: 13000,
      totalPriceKz: 13000,
      paymentMethod: 'UNITEL MONEY',
      proofId: 'proof-2',
      proofFileName: 'unitel_money_00930.png',
      proofMimeType: 'image/svg+xml',
      proofDataUrl: SAMPLE_PROOF_DATA_URL,
      date: yesterdayStr,
      time: '19:12',
      createdAt: `${yesterdayStr}T19:12:00.000Z`,
      status: 'Pago',
    },
    {
      id: 'ord-3',
      orderNumber: '#VCY-000003',
      customerName: 'Mauro Sebastião',
      freeFireId: '7748291044',
      nickname: 'MAURO_CAPA',
      phone: '928 510 642',
      productId: 'prod-airdrop-3200',
      productName: 'AIRDROP (US$ 2,29)',
      productCategory: 'airdrop',
      quantity: 1,
      unitPriceKz: 3200,
      totalPriceKz: 3200,
      paymentMethod: 'EXPRESS',
      proofId: 'proof-3',
      proofFileName: 'comprovativo_mauro_airdrop.jpg',
      proofMimeType: 'image/svg+xml',
      proofDataUrl: SAMPLE_PROOF_DATA_URL,
      date: todayStr,
      time: '10:35',
      createdAt: `${todayStr}T10:35:00.000Z`,
      status: 'Pendente',
    },
  ];

  const users = [
    {
      id: 'usr-1',
      name: 'braulio_ff',
      phone: '941 205 338',
      freeFireId: '5910293811',
      nickname: 'BraulioKing',
      ordersCount: 1,
      totalSpentKz: 2400,
      lastOrderNumber: '#VCY-000001',
      lastOrderDate: twoDaysAgoStr,
      createdAt: twoDaysAgoStr,
    },
    {
      id: 'usr-2',
      name: 'Celma Joaquim',
      phone: '936 772 910',
      freeFireId: 'Celma_Rblx99',
      nickname: 'Celma_Rblx99',
      ordersCount: 1,
      totalSpentKz: 13000,
      lastOrderNumber: '#VCY-000002',
      lastOrderDate: yesterdayStr,
      createdAt: yesterdayStr,
    },
    {
      id: 'usr-3',
      name: 'Mauro Sebastião',
      phone: '928 510 642',
      freeFireId: '7748291044',
      nickname: 'MAURO_CAPA',
      ordersCount: 1,
      totalSpentKz: 3200,
      lastOrderNumber: '#VCY-000003',
      lastOrderDate: todayStr,
      createdAt: todayStr,
    },
  ];

  return {
    orderSequence: 3,
    users,
    admin_users: [
      {
        id: 'adm-1',
        username: 'Vicente (ADM)',
        codeHash: hash,
        codeSalt: salt,
        mustChangeCode: false,
        lastLoginAt: todayStr,
        updatedAt: todayStr,
      },
    ],
    categories,
    products,
    orders,
    payments: orders.map((o, idx) => ({
      id: `pay-${idx + 1}`,
      orderId: o.id,
      orderNumber: o.orderNumber,
      method: o.paymentMethod,
      amountKz: o.totalPriceKz,
      status: o.status,
      createdAt: o.createdAt,
    })),
    payment_proofs: orders.map((o, idx) => ({
      id: `proof-${idx + 1}`,
      orderId: o.id,
      orderNumber: o.orderNumber,
      fileName: o.proofFileName,
      mimeType: o.proofMimeType,
      dataUrl: o.proofDataUrl,
      uploadedAt: o.createdAt,
    })),
    notifications: [
      {
        id: 'notif-1',
        title: 'NOVO PEDIDO',
        message: 'Pedido #VCY-000003 recebido (AIRDROP US$ 2,29 — 3.200 Kz).',
        orderNumber: '#VCY-000003',
        createdAt: `${todayStr} 10:35`,
        read: false,
      },
    ],
    order_logs: [
      {
        id: 'log-1',
        orderId: 'ord-1',
        orderNumber: '#VCY-000001',
        adminName: 'Vicente (ADM)',
        date: twoDaysAgoStr,
        time: '17:52',
        previousStatus: 'Pendente',
        newStatus: 'Concluído',
        note: 'Referência PayPay 10116 confirmada.',
      },
    ],
    settings: {
      storeName: 'VICY SHOP',
      slogan: 'SEMPRE COM VOCÊ!',
      whatsappNumber: '+244 959 823 881',
      paymentPhone: '934 413 108',
      paymentRecipient: 'Vicente',
      paypayRef: '10116',
      unitelMoneyRef: '00930',
    },
  };
}

function loadVicyDb() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DB_FILE)) {
      const initial = createInitialVicyDb();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const parsed = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    const initialCode = Buffer.from('56494359', 'hex').toString('utf8');
    const { hash, salt } = hashSecret(initialCode);
    if (parsed.admin_users && parsed.admin_users[0]) {
      parsed.admin_users[0].codeHash = hash;
      parsed.admin_users[0].codeSalt = salt;
      parsed.admin_users[0].mustChangeCode = false;
    }
    if (parsed.settings) {
      parsed.settings.whatsappNumber = '+244 959 823 881';
    }
    const seed = createInitialVicyDb();
    if (Array.isArray(parsed.categories)) {
      const existingCatIds = new Set(parsed.categories.map((c: any) => c.id));
      for (const cat of seed.categories) {
        if (!existingCatIds.has(cat.id)) {
          parsed.categories.unshift(cat);
        }
      }
    }
    if (Array.isArray(parsed.products)) {
      const existingProdIds = new Set(parsed.products.map((p: any) => p.id));
      const missingProds = seed.products.filter((p) => !existingProdIds.has(p.id));
      if (missingProds.length > 0) {
        parsed.products = [...missingProds, ...parsed.products];
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), 'utf8');
      }
    }
    return parsed;
  } catch {
    return createInitialVicyDb();
  }
}

function saveVicyDb(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Ignore read-only filesystem errors in ephemeral serverless environments
  }
}

const db = loadVicyDb();

const activeSessions = new Map<string, { adminId: string; username: string; expiresAt: number }>();
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function requireAdminAuth(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token || !activeSessions.has(token)) {
    res.status(401).json({ error: 'Sessão administrativa inválida ou expirada. Faça login novamente.' });
    return;
  }
  const session = activeSessions.get(token)!;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    res.status(401).json({ error: 'Sessão expirada. Por favor, autentique-se novamente.' });
    return;
  }
  session.expiresAt = Date.now() + SESSION_TTL_MS;
  next();
}

function buildAdminDashboardPayload() {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const weekAgoTime = now.getTime() - 7 * 86400000;
  const monthPrefix = todayStr.slice(0, 7);
  const validSalesStatuses = new Set(['Pago', 'Em processamento', 'Concluído']);

  let totalSalesKz = 0;
  let salesTodayKz = 0;
  let salesWeekKz = 0;
  let salesMonthKz = 0;

  let pendingOrders = 0;
  let inAnalysisOrders = 0;
  let paidOrders = 0;
  let processingOrders = 0;
  let completedOrders = 0;
  let cancelledOrders = 0;

  for (const o of db.orders) {
    if (o.status === 'Pendente') pendingOrders++;
    else if (o.status === 'Em análise') inAnalysisOrders++;
    else if (o.status === 'Pago') paidOrders++;
    else if (o.status === 'Em processamento') processingOrders++;
    else if (o.status === 'Concluído') completedOrders++;
    else if (o.status === 'Cancelado') cancelledOrders++;

    if (validSalesStatuses.has(o.status)) {
      const amount = Number(o.totalPriceKz) || 0;
      totalSalesKz += amount;
      if (o.date === todayStr) salesTodayKz += amount;
      const orderTime = new Date(o.createdAt || o.date).getTime();
      if (!Number.isNaN(orderTime) && orderTime >= weekAgoTime) salesWeekKz += amount;
      if (typeof o.date === 'string' && o.date.startsWith(monthPrefix)) salesMonthKz += amount;
    }
  }

  const chartData: Array<{ label: string; date: string; totalKz: number; ordersCount: number }> = [];
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const dStr = d.toISOString().slice(0, 10);
    const label = `${dayNames[d.getDay()]} (${dStr.slice(8, 10)}/${dStr.slice(5, 7)})`;
    let dayTotal = 0;
    let dayCount = 0;
    for (const o of db.orders) {
      if (o.date === dStr && o.status !== 'Cancelado') {
        dayTotal += Number(o.totalPriceKz) || 0;
        dayCount += 1;
      }
    }
    chartData.push({ label, date: dStr, totalKz: dayTotal, ordersCount: dayCount });
  }

  const admin = db.admin_users[0];

  return {
    stats: {
      totalOrders: db.orders.length,
      totalSalesKz,
      pendingOrders,
      inAnalysisOrders,
      paidOrders,
      processingOrders,
      completedOrders,
      cancelledOrders,
      salesTodayKz,
      salesWeekKz,
      salesMonthKz,
    },
    chartData,
    orders: [...db.orders].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    products: db.products,
    categories: db.categories,
    customers: [...db.users].sort((a, b) => b.totalSpentKz - a.totalSpentKz),
    notifications: db.notifications,
    orderLogs: db.order_logs,
    settings: db.settings,
    adminProfile: {
      username: admin.username,
      mustChangeCode: false,
      lastLoginAt: admin.lastLoginAt,
    },
  };
}

const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to resolve base URL for canonical sitemap and robots.txt
const resolveBaseUrl = (req: express.Request): string => {
  const envUrl = (process.env.APP_URL || '').trim().replace(/\/+$/, '');
  if (envUrl && envUrl !== 'MY_APP_URL' && envUrl.startsWith('http')) {
    return envUrl;
  }
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host =
    (req.headers['x-forwarded-host'] as string) ||
    req.headers.host ||
    'ais-pre-u4zgy3eqxitn6oykwzrgyf-365972694233.europe-west2.run.app';
  return `${proto}://${host}`;
};

  // Prevent indexing of Admin API and /admin page via HTTP X-Robots-Tag header
  app.use(['/api/admin', '/admin'], (_req, res, next) => {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    next();
  });

  // Google Search Console HTML file verification endpoint
  app.get('/google9d96daaca1e2be3c.html', (_req, res) => {
    res
      .type('text/html')
      .status(200)
      .send('google-site-verification: google9d96daaca1e2be3c.html');
  });

  // Dynamic robots.txt endpoint
  app.get('/robots.txt', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const robotsTxt = [
      'User-agent: *',
      'Allow: /',
      'Allow: /diamantes',
      'Allow: /passe-de-nivel',
      'Allow: /airdrop',
      'Allow: /robux',
      'Allow: /como-comprar',
      'Allow: /suporte',
      'Disallow: /admin',
      'Disallow: /api/admin',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');
    res.type('text/plain').status(200).send(robotsTxt);
  });

  // Dynamic sitemap.xml endpoint (includes only public indexable URLs)
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = resolveBaseUrl(req);
    const todayIso = new Date().toISOString().slice(0, 10);
    const publicPages = [
      { path: '/', priority: '1.0', changefreq: 'daily' },
      { path: '/diamantes', priority: '0.95', changefreq: 'daily' },
      { path: '/passe-de-nivel', priority: '0.90', changefreq: 'daily' },
      { path: '/airdrop', priority: '0.90', changefreq: 'daily' },
      { path: '/robux', priority: '0.90', changefreq: 'daily' },
      { path: '/como-comprar', priority: '0.80', changefreq: 'weekly' },
      { path: '/suporte', priority: '0.75', changefreq: 'weekly' },
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${todayIso}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    res.type('application/xml').status(200).send(xml);
  });

  app.get('/api/store', (_req, res) => {
    res.json({
      categories: db.categories.filter((c: any) => c.active),
      products: db.products.filter((p: any) => p.active),
      settings: db.settings,
    });
  });

  app.get('/api/orders/track', (req, res) => {
    const query = sanitizeText(req.query.q, 60).toLowerCase();
    if (!query) {
      res.status(400).json({ error: 'Informe o número do pedido (ex: #VCY-000001) ou o seu telefone.' });
      return;
    }
    const normalizedPhone = query.replace(/\s+/g, '');
    const matches = db.orders
      .filter((o: any) => {
        const ordNum = String(o.orderNumber || '').toLowerCase();
        const phone = String(o.phone || '').replace(/\s+/g, '').toLowerCase();
        const ffId = String(o.freeFireId || '').toLowerCase();
        return (
          ordNum === query ||
          ordNum.replace('#', '') === query.replace('#', '') ||
          (normalizedPhone.length >= 6 && phone.includes(normalizedPhone)) ||
          ffId === query
        );
      })
      .map((o: any) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        freeFireId: o.freeFireId,
        nickname: o.nickname,
        productName: o.productName,
        quantity: o.quantity,
        totalPriceKz: o.totalPriceKz,
        paymentMethod: o.paymentMethod,
        date: o.date,
        time: o.time,
        status: o.status,
      }));

    res.json({ orders: matches });
  });

  app.post('/api/orders', (req, res) => {
    const customerName = sanitizeText(req.body.customerName, 100);
    const freeFireId = sanitizeText(req.body.freeFireId, 60);
    const nickname = sanitizeText(req.body.nickname, 60);
    const phone = sanitizeText(req.body.phone, 40);
    const productId = sanitizeText(req.body.productId, 60);
    const paymentMethod = sanitizeText(req.body.paymentMethod, 30);
    const quantity = Math.max(1, Math.min(20, Number(req.body.quantity) || 1));
    const proofFileName = sanitizeText(req.body.proofFileName, 120);
    const proofMimeType = sanitizeText(req.body.proofMimeType, 60) || 'image/jpeg';
    const proofDataUrl =
      typeof req.body.proofDataUrl === 'string' && req.body.proofDataUrl.trim()
        ? req.body.proofDataUrl.trim()
        : '';

    if (!customerName || !freeFireId || !nickname || !phone || !productId) {
      res.status(400).json({ error: 'Por favor, preencha todos os campos obrigatórios do pedido.' });
      return;
    }

    if (!proofDataUrl || !proofFileName) {
      res.status(400).json({ error: 'É obrigatório anexar o comprovativo de pagamento antes de confirmar o pedido.' });
      return;
    }

    if (!['EXPRESS', 'PAYPAY', 'UNITEL MONEY'].includes(paymentMethod)) {
      res.status(400).json({ error: 'Método de pagamento inválido.' });
      return;
    }

    const product = db.products.find((p: any) => p.id === productId && p.active);
    if (!product) {
      res.status(404).json({ error: 'Produto não encontrado ou indisponível no momento.' });
      return;
    }

    db.orderSequence += 1;
    const orderNumber = `#VCY-${String(db.orderSequence).padStart(6, '0')}`;
    const { date, time, iso } = formatDateParts(new Date());
    const unitPriceKz = Number(product.priceKz);
    const totalPriceKz = unitPriceKz * quantity;
    const orderId = `ord-${Date.now()}`;
    const proofId = `proof-${Date.now()}`;

    const newOrder = {
      id: orderId,
      orderNumber,
      customerName,
      freeFireId,
      nickname,
      phone,
      productId: product.id,
      productName: product.name,
      productCategory: product.category,
      quantity,
      unitPriceKz,
      totalPriceKz,
      paymentMethod,
      proofId,
      proofFileName,
      proofMimeType,
      proofDataUrl,
      date,
      time,
      createdAt: iso,
      status: 'Pendente',
    };

    db.orders.unshift(newOrder);
    db.payments.unshift({
      id: `pay-${Date.now()}`,
      orderId,
      orderNumber,
      method: paymentMethod,
      amountKz: totalPriceKz,
      status: 'Pendente',
      createdAt: iso,
    });
    db.payment_proofs.unshift({
      id: proofId,
      orderId,
      orderNumber,
      fileName: proofFileName,
      mimeType: proofMimeType,
      dataUrl: proofDataUrl,
      uploadedAt: iso,
    });

    const normalizedPhone = phone.replace(/\s+/g, '');
    const existingCustomer = db.users.find(
      (u: any) => String(u.phone).replace(/\s+/g, '') === normalizedPhone
    );
    if (existingCustomer) {
      existingCustomer.name = customerName;
      existingCustomer.freeFireId = freeFireId;
      existingCustomer.nickname = nickname;
      existingCustomer.ordersCount += 1;
      existingCustomer.totalSpentKz += totalPriceKz;
      existingCustomer.lastOrderNumber = orderNumber;
      existingCustomer.lastOrderDate = date;
    } else {
      db.users.push({
        id: `usr-${Date.now()}`,
        name: customerName,
        phone,
        freeFireId,
        nickname,
        ordersCount: 1,
        totalSpentKz: totalPriceKz,
        lastOrderNumber: orderNumber,
        lastOrderDate: date,
        createdAt: date,
      });
    }

    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      title: 'NOVO PEDIDO',
      message: `Pedido ${orderNumber} recebido (${product.name} — ${totalPriceKz.toLocaleString('pt-AO')} KZ).`,
      orderNumber,
      createdAt: `${date} ${time}`,
      read: false,
    });

    saveVicyDb(db);

    res.status(201).json({
      message: 'Pagamento enviado! O seu pedido está aguardando confirmação.',
      order: newOrder,
    });
  });

  app.post('/api/admin/login', (req, res) => {
    const code = typeof req.body.code === 'string' ? req.body.code.trim() : '';
    if (!code) {
      res.status(400).json({ error: 'Informe o código de acesso administrativo (VICY).' });
      return;
    }

    const admin = db.admin_users[0];
    const isValid = verifySecret(code, admin.codeHash, admin.codeSalt);

    if (!isValid) {
      res.status(401).json({ error: 'Código ADM incorreto. Utilize o código oficial VICY.' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
      adminId: admin.id,
      username: admin.username,
      expiresAt: Date.now() + SESSION_TTL_MS,
    });

    const { date, time } = formatDateParts(new Date());
    admin.lastLoginAt = `${date} ${time}`;
    saveVicyDb(db);

    res.json({
      token,
      adminProfile: {
        username: admin.username,
        mustChangeCode: false,
        lastLoginAt: admin.lastLoginAt,
      },
    });
  });

  app.post('/api/admin/logout', requireAdminAuth, (req, res) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (token) activeSessions.delete(token);
    res.json({ ok: true });
  });

  app.get('/api/admin/dashboard', requireAdminAuth, (_req, res) => {
    res.json(buildAdminDashboardPayload());
  });

  app.patch('/api/admin/orders/:id/status', requireAdminAuth, (req, res) => {
    const orderId = req.params.id;
    const newStatus = sanitizeText(req.body.status, 40);
    const note = sanitizeText(req.body.note, 200);
    const order = db.orders.find((o: any) => o.id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Pedido não encontrado.' });
      return;
    }

    const previousStatus = order.status;
    order.status = newStatus;

    const payment = db.payments.find((p: any) => p.orderId === orderId);
    if (payment) payment.status = newStatus;

    const { date, time } = formatDateParts(new Date());
    db.order_logs.unshift({
      id: `log-${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      adminName: 'Vicente (ADM)',
      date,
      time,
      previousStatus,
      newStatus,
      note: note || `Estado alterado de ${previousStatus} para ${newStatus}.`,
    });

    saveVicyDb(db);
    res.json(buildAdminDashboardPayload());
  });

  app.post('/api/admin/products', requireAdminAuth, (req, res) => {
    const name = sanitizeText(req.body.name, 100);
    const category = sanitizeText(req.body.category, 40);
    const priceKz = Math.max(0, Number(req.body.priceKz) || 0);
    const diamondsOrRobux = sanitizeText(req.body.diamondsOrRobux, 80);
    const description = sanitizeText(req.body.description, 300);
    const stockStatus = sanitizeText(req.body.stockStatus, 40) || 'Disponível';
    const image =
      typeof req.body.image === 'string' && req.body.image.trim()
        ? req.body.image.trim()
        : '/src/assets/images/product_level_pass_1791402124233.jpg';

    if (!name || !category || priceKz <= 0) {
      res.status(400).json({ error: 'Informe nome, categoria e preço válido em KZ.' });
      return;
    }

    db.products.push({
      id: `prod-${Date.now()}`,
      name,
      category,
      priceKz,
      diamondsOrRobux: diamondsOrRobux || name,
      image,
      description: description || `${name} disponível na VICY SHOP.`,
      active: req.body.active !== false,
      stockStatus,
    });
    saveVicyDb(db);
    res.status(201).json(buildAdminDashboardPayload());
  });

  app.put('/api/admin/products/:id', requireAdminAuth, (req, res) => {
    const product = db.products.find((p: any) => p.id === req.params.id);
    if (!product) {
      res.status(404).json({ error: 'Produto não encontrado.' });
      return;
    }
    if (req.body.name) product.name = sanitizeText(req.body.name, 100);
    if (req.body.category) product.category = sanitizeText(req.body.category, 40);
    if (req.body.priceKz !== undefined) product.priceKz = Number(req.body.priceKz);
    if (req.body.diamondsOrRobux !== undefined)
      product.diamondsOrRobux = sanitizeText(req.body.diamondsOrRobux, 80);
    if (req.body.description !== undefined)
      product.description = sanitizeText(req.body.description, 300);
    if (req.body.image) product.image = req.body.image;
    if (req.body.stockStatus) product.stockStatus = sanitizeText(req.body.stockStatus, 40);
    if (typeof req.body.active === 'boolean') product.active = req.body.active;

    saveVicyDb(db);
    res.json(buildAdminDashboardPayload());
  });

  app.post('/api/admin/notifications/read', requireAdminAuth, (_req, res) => {
    for (const n of db.notifications) n.read = true;
    saveVicyDb(db);
    res.json(buildAdminDashboardPayload());
  });

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (!IS_VERCEL) {
    const distPath = path.join(__dirname, 'dist');
    app.use('/src/assets', express.static(path.join(__dirname, 'src', 'assets')));
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!IS_VERCEL) {
    const PORT = Number(process.env.PORT) || 3000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`VICY SHOP server running on http://0.0.0.0:${PORT}`);
    });
  }
}

startServer();

export { app };
export default app;
