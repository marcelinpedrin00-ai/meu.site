import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Copy,
  Check,
  Upload,
  ArrowRight,
  ArrowLeft,
  MessageCircle,
  AlertCircle,
  Headphones,
} from 'lucide-react';
import { Product, PaymentMethod, StoreSettings } from '../types';

interface PurchaseModalProps {
  product: Product | null;
  settings: StoreSettings;
  onClose: () => void;
  onOrderSuccess: (orderNumber: string) => void;
}

export function formatKzNum(value: number): string {
  return Math.round(Number(value || 0))
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function formatKz(value: number): string {
  return `${formatKzNum(value)} KZ`;
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({
  product,
  settings,
  onClose,
  onOrderSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'payment' | 'proof' | 'done'>('form');
  const [customerName, setCustomerName] = useState('');
  const [freeFireId, setFreeFireId] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('EXPRESS');

  const [proofFileName, setProofFileName] = useState('');
  const [proofMimeType, setProofMimeType] = useState('');
  const [proofDataUrl, setProofDataUrl] = useState('');

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdOrder, setCreatedOrder] = useState<{
    orderNumber: string;
    totalPriceKz: number;
    productName: string;
    paymentMethod: PaymentMethod;
  } | null>(null);

  if (!product) return null;

  const isRobux = product.category === 'robux';
  const totalPriceKz = product.priceKz * quantity;

  // Sends order confirmation & player details to 934 413 108 as requested
  const buildWhatsAppMessageUrl = (orderNumberStr: string) => {
    const message =
      `👑 *NOVO PEDIDO CONFIRMADO — VICY SHOP* 👑\n\n` +
      `📋 *Pedido:* ${orderNumberStr}\n` +
      `👤 *Cliente:* ${customerName}\n` +
      `📞 *Telefone:* ${phone}\n` +
      `🎮 *ID no Jogo:* ${freeFireId}\n` +
      `🏷️ *Nickname:* ${nickname}\n` +
      `💎 *Produto Adquirido:* ${quantity}x ${product.name}\n` +
      `💰 *Valor Total:* ${formatKz(totalPriceKz)}\n` +
      `💳 *Método de Pagamento:* ${paymentMethod}\n\n` +
      `✅ Já efetuei o pagamento! Seguem todos os meus dados do jogo.`;
    return `https://wa.me/244934413108?text=${encodeURIComponent(message)}`;
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerName.trim() || !freeFireId.trim() || !nickname.trim() || !phone.trim()) {
      setError('Por favor, preencha todos os dados da sua conta no jogo e telefone.');
      return;
    }
    setStep('payment');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setError('Formato não suportado. Envie apenas JPG, JPEG, PNG ou PDF.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('O ficheiro excede o tamanho máximo de 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setProofFileName(file.name);
        setProofMimeType(file.type.toLowerCase());
        setProofDataUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!proofDataUrl || !proofFileName) {
      setError('É obrigatório anexar o comprovativo de pagamento (JPG, PNG ou PDF) antes de confirmar.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          freeFireId,
          nickname,
          phone,
          productId: product.id,
          quantity,
          paymentMethod,
          proofFileName,
          proofMimeType,
          proofDataUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Não foi possível registar o pedido.');
        setSubmitting(false);
        return;
      }

      const ordNum = data.order.orderNumber;
      setCreatedOrder({
        orderNumber: ordNum,
        totalPriceKz: data.order.totalPriceKz,
        productName: data.order.productName,
        paymentMethod: data.order.paymentMethod,
      });
      setStep('done');
      onOrderSuccess(ordNum);

      // Automatically open WhatsApp 934 413 108 with all player and game data
      const waLink = document.createElement('a');
      waLink.href = buildWhatsAppMessageUrl(ordNum);
      waLink.target = '_blank';
      waLink.rel = 'noopener noreferrer';
      document.body.appendChild(waLink);
      waLink.click();
      document.body.removeChild(waLink);
    } catch {
      setError('Erro de ligação ao servidor. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-[#050C1A] border-2 border-[#0088FF] shadow-[0_0_45px_rgba(0,136,255,0.4)] overflow-hidden my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#0088FF]/40 bg-gradient-to-r from-[#002266] via-[#0038A8] to-[#002266]">
          <div>
            <p className="text-xs text-[#00B4FF] font-extrabold tracking-wider uppercase">
              {step === 'form' && 'PASSO 1 DE 2 · DADOS DO JOGADOR'}
              {step === 'payment' && 'PASSO 2 DE 2 · PAGAMENTO + ENVIAR COMPROVATIVO'}
              {step === 'done' && 'PEDIDO CONFIRMADO · VICY SHOP'}
            </p>
            <h3 className="text-lg font-extrabold text-white font-display">
              {step === 'done' ? 'Confirmação VICY SHOP' : 'Finalizar Compra'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar janela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step !== 'done' && (
          <div className="px-6 py-3.5 bg-[#07142B] border-b border-[#0088FF]/30 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs text-slate-300">Produto selecionado</p>
              <p className="text-sm font-extrabold text-white truncate">{product.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-slate-300">Preço Total</p>
              <p className="text-base font-extrabold text-[#00A8FF] font-mono-tabular">
                {formatKz(totalPriceKz)}
              </p>
            </div>
          </div>
        )}

        <div className="p-6">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-sm text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'form' && (
            <form onSubmit={handleContinueToPayment} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-white mb-1.5">
                    Seu Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Edmilson Manuel"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-[#0088FF]/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00B4FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-white mb-1.5">
                    Número de Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: 923 000 000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-[#0088FF]/50 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00B4FF] font-mono-tabular"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold text-[#00B4FF] mb-1.5">
                    {isRobux ? 'ID / Usuário Roblox *' : 'ID da Conta Free Fire *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={freeFireId}
                    onChange={(e) => setFreeFireId(e.target.value)}
                    placeholder={isRobux ? 'Ex: PlayerRoblox_AO' : 'Ex: 2849104821'}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-[#0088FF]/60 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00B4FF] font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-[#00B4FF] mb-1.5">
                    Nickname no Jogo *
                  </label>
                  <input
                    type="text"
                    required
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder="Ex: VICY_GAMER"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#030712] border border-[#0088FF]/60 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-[#00B4FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Produto selecionado
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${product.name} (${formatKz(product.priceKz)})`}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#07142B] border border-[#0088FF]/30 text-sm text-white font-bold cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Quantidade
                  </label>
                  <div className="flex items-center rounded-xl bg-[#030712] border border-[#0088FF]/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-mono-tabular"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-sm font-extrabold text-white font-mono-tabular">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                      className="px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 transition-colors font-mono-tabular"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-white mb-2">
                  Método de Pagamento *
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {(['EXPRESS', 'PAYPAY', 'UNITEL MONEY'] as PaymentMethod[]).map((method) => {
                    const active = paymentMethod === method;
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2.5 px-2 sm:px-3 rounded-xl border-2 text-[11px] sm:text-xs font-extrabold transition-all text-center leading-tight cursor-pointer ${
                          active
                            ? 'bg-gradient-to-r from-[#0055FF] to-[#0088FF] border-[#00B4FF] text-white shadow-[0_0_20px_rgba(0,136,255,0.45)]'
                            : 'bg-[#030712] border-[#0088FF]/30 text-slate-300 hover:text-white'
                        }`}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#0055FF] to-[#0099FF] hover:from-[#0066FF] hover:to-[#00B4FF] text-white font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(0,136,255,0.5)] cursor-pointer"
                >
                  <span>CONTINUAR PAGAMENTO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#030712] border border-[#0088FF]/50 space-y-3.5">
                <div className="flex items-center justify-between border-b border-[#0088FF]/30 pb-2.5">
                  <span className="text-xs font-extrabold text-[#00B4FF]">
                    1. ENVIE O DINHEIRO PARA OS DADOS ABAIXO
                  </span>
                  <span className="text-xs text-white font-mono-tabular">
                    Método: {paymentMethod}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-[#07142B] border border-[#0088FF]/40 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-300">
                      Número Oficial (Express, PayPay e Unitel Money)
                    </p>
                    <p className="text-base font-extrabold text-[#00B4FF] font-mono-tabular mt-0.5">
                      📞 {settings.paymentPhone} — {settings.paymentRecipient}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard('934413108', 'phone')}
                    className="px-3 py-2 rounded-lg bg-[#0066FF] hover:bg-[#0088FF] text-white text-xs font-extrabold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'phone' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Nº</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-2.5 rounded-xl bg-[#07142B] border border-[#0088FF]/30 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-300">Ref. PayPay</p>
                      <p className="text-sm font-extrabold text-white font-mono-tabular">
                        {settings.paypayRef}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.paypayRef, 'paypay')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#00B4FF]"
                    >
                      {copiedKey === 'paypay' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#07142B] border border-[#0088FF]/30 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-300">Ref. Unitel Money</p>
                      <p className="text-sm font-extrabold text-white font-mono-tabular">
                        {settings.unitelMoneyRef}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(settings.unitelMoneyRef, 'unitel')}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-[#00B4FF]"
                    >
                      {copiedKey === 'unitel' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* MANDATORY PROOF UPLOAD RIGHT BEFORE CONFIRMATION */}
              <div className="p-4 rounded-xl bg-[#030712] border-2 border-[#0088FF] space-y-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-[#00B4FF] uppercase">
                    2. ANEXE O COMPROVATIVO DO ENVIO DO DINHEIRO (OBRIGATÓRIO) *
                  </p>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      proofFileName
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-400/50'
                    }`}
                  >
                    {proofFileName ? 'Anexado' : 'Obrigatório'}
                  </span>
                </div>

                <label
                  className={`block border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                    proofFileName
                      ? 'border-emerald-400 bg-emerald-500/10'
                      : 'border-[#0088FF] hover:border-[#00B4FF] bg-[#07142B]/60'
                  }`}
                >
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload
                      className={`w-6 h-6 ${proofFileName ? 'text-emerald-400' : 'text-[#00B4FF]'}`}
                    />
                    {proofFileName ? (
                      <p className="text-xs font-extrabold text-emerald-300">
                        ✅ Comprovativo carregado: {proofFileName} (Toque para alterar)
                      </p>
                    ) : (
                      <>
                        <p className="text-xs font-extrabold text-white">
                          📤 Toque aqui para enviar a foto/captura ou PDF do comprovativo *
                        </p>
                        <p className="text-[11px] text-slate-300">
                          Tem que mandar o comprovativo de que mandou o dinheiro antes de confirmar
                        </p>
                      </>
                    )}
                  </div>
                </label>

                {proofDataUrl && proofMimeType !== 'application/pdf' && (
                  <div className="p-2 rounded-xl bg-[#07142B] border border-emerald-400/40">
                    <img
                      src={proofDataUrl}
                      alt="Pré-visualização do comprovativo"
                      className="max-h-32 mx-auto rounded-lg object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('form')}
                  className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Voltar</span>
                </button>
                <button
                  type="submit"
                  disabled={submitting || !proofDataUrl}
                  className={`flex-1 py-3.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
                    proofDataUrl
                      ? 'bg-gradient-to-r from-[#0055FF] to-[#0099FF] hover:from-[#0066FF] hover:to-[#00B4FF] text-white shadow-[0_0_25px_rgba(0,136,255,0.5)] cursor-pointer'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>
                    {submitting
                      ? 'A CONFIRMAR...'
                      : proofDataUrl
                        ? 'CONFIRMAR PAGAMENTO E ENVIAR NO WHATSAPP'
                        : '🔒 ENVIE O COMPROVATIVO ACIMA PARA CONFIRMAR'}
                  </span>
                </button>
              </div>
            </form>
          )}

          {step === 'done' && createdOrder && (
            <div className="text-center space-y-5 py-2">
              <div className="w-16 h-16 rounded-2xl bg-[#0088FF]/20 border border-[#00B4FF] flex items-center justify-center mx-auto text-[#00B4FF]">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <p className="text-xs font-extrabold text-[#00B4FF]">
                  PEDIDO REGISTADO · {createdOrder.orderNumber}
                </p>
                <h4 className="text-xl font-extrabold text-white mt-1 font-display">
                  Pagamento enviado! O seu pedido está aguardando confirmação.
                </h4>
              </div>

              <div className="p-4 rounded-xl bg-[#030712] border border-[#0088FF]/50 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pedido:</span>
                  <span className="text-[#00B4FF] font-extrabold font-mono-tabular">
                    {createdOrder.orderNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ID no Jogo / Nickname:</span>
                  <span className="text-white font-bold font-mono-tabular">
                    {freeFireId} ({nickname})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Adquiriu:</span>
                  <span className="text-white font-bold">
                    {quantity}x {createdOrder.productName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total / Método:</span>
                  <span className="text-[#00B4FF] font-extrabold font-mono-tabular">
                    {formatKz(createdOrder.totalPriceKz)} · {createdOrder.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <a
                  href={buildWhatsAppMessageUrl(createdOrder.orderNumber)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0055FF] to-[#0099FF] text-white font-extrabold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_0_25px_rgba(0,136,255,0.45)]"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>ENVIAR DADOS NO WHATSAPP (934 413 108)</span>
                </a>
                <a
                  href="https://wa.me/244959823881"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-4 rounded-xl bg-[#07142B] border border-[#0088FF]/40 text-[#00B4FF] font-extrabold text-xs flex items-center justify-center gap-1.5"
                >
                  <Headphones className="w-4 h-4" />
                  <span>SUPORTE (959 823 881)</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
