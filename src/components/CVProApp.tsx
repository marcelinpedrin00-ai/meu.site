import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  FileText,
  Download,
  Check,
  ArrowRight,
  Layers,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Globe,
  Plus,
  Trash2,
  Copy,
  Eye,
  Settings,
  Shield,
  CreditCard,
  CheckCircle2,
  Clock,
  Upload,
  X,
  Edit3,
  Printer,
  MessageCircle,
} from 'lucide-react';

export interface ResumeExperience {
  title: string;
  company: string;
  period: string;
  description: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface ResumeDocument {
  id: string;
  title: string;
  updatedAt: string;
  templateId: string;
  accentColor: string;
  fontFamily: 'sans' | 'serif' | 'mono';
  spacing: 'compact' | 'normal' | 'spacious';
  photoDataUrl?: string;
  fullName: string;
  role: string;
  email: string;
  phone: string;
  location: string;
  professionalSummary: string;
  experiences: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  languages: string[];
  courses: string[];
  certifications: string[];
  additionalInfo?: string;
}

const DEFAULT_RESUME: ResumeDocument = {
  id: 'cv-default-1',
  title: 'Currículo Executivo Principal',
  updatedAt: new Date().toISOString().slice(0, 10),
  templateId: 'tpl-moderno',
  accentColor: '#10B981',
  fontFamily: 'sans',
  spacing: 'normal',
  fullName: 'Mateus Agostinho',
  role: 'Gestor de Operações & Projetos',
  email: 'mateus.agostinho@email.ao',
  phone: '+244 923 450 812',
  location: 'Talatona, Luanda — Angola',
  professionalSummary:
    'Profissional com mais de 6 anos de experiência em gestão operacional, planeamento estratégico e liderança de equipas multidisciplinares em Angola. Histórico comprovado na otimização de processos logísticos, redução de custos e entrega de projetos corporativos de alto impacto.',
  experiences: [
    {
      title: 'Gestor de Operações Sénior',
      company: 'Grupo Atlântico Logística Angola',
      period: '2022 — Presente',
      description:
        'Coordenação de operações diárias com equipa de 25 colaboradores, implementação de indicadores de desempenho (KPIs) e aumento da eficiência de entrega em 32%.',
    },
    {
      title: 'Analista de Projetos & Processos',
      company: 'Soluções Empresariais Luanda',
      period: '2019 — 2022',
      description:
        'Elaboração de relatórios executivos, controlo orçamental em Kwanzas e acompanhamento de contratos com fornecedores nacionais e internacionais.',
    },
  ],
  education: [
    {
      degree: 'Licenciatura em Gestão de Empresas',
      institution: 'Universidade Agostinho Neto (UAN)',
      year: '2019',
    },
  ],
  skills: [
    'Gestão de Projetos',
    'Liderança de Equipas',
    'Planeamento Estratégico',
    'Excel Avançado & Power BI',
    'Negociação com Fornecedores',
    'Controlo Orçamental',
  ],
  languages: ['Português (Nativo)', 'Inglês (Profissional)', 'Espanhol (Intermédio)'],
  courses: ['Gestão Ágil de Projetos (PMI / Scrum)', 'Liderança Executiva e Finanças'],
  certifications: ['Certificação Profissional em Gestão Operacional'],
  additionalInfo: 'Disponibilidade imediata para Luanda e deslocações interprovinciais.',
};

const GENERATION_STEPS = [
  'Analisando suas informações...',
  'Organizando seu currículo...',
  'Aplicando o design...',
  'Finalizando...',
  'Seu currículo está pronto!',
];

const HERO_DEMO_STEPS = [
  'Analisando informações...',
  'Organizando currículo...',
  'Aplicando modelo...',
  'Currículo pronto!',
];

function formatKzAmount(val: number): string {
  return `${Number(val || 0).toLocaleString('pt-AO')} Kz`;
}

export const CVProApp: React.FC = () => {
  const [activeNav, setActiveNav] = useState<
    'home' | 'creator' | 'editor' | 'templates' | 'pricing' | 'how' | 'dashboard' | 'admin'
  >('home');

  // Saved Resumes in LocalStorage (Auto-Save)
  const [resumes, setResumes] = useState<ResumeDocument[]>(() => {
    try {
      const saved = localStorage.getItem('cvpro_angola_resumes_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return [DEFAULT_RESUME];
  });

  const [currentResumeId, setCurrentResumeId] = useState<string>(() => resumes[0]?.id || 'cv-default-1');
  const currentResume =
    resumes.find((r) => r.id === currentResumeId) || resumes[0] || DEFAULT_RESUME;

  // User Profile State
  const [userProfile, setUserProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    planSlug: 'gratuito' | 'curriculo' | 'profissional' | 'personalizado' | 'premium';
    planName: string;
    downloadsCount: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('cvpro_angola_user_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      name: 'Mateus Agostinho',
      email: 'mateus.agostinho@email.ao',
      phone: '923 450 812',
      planSlug: 'premium',
      planName: 'Premium (20.000 Kz)',
      downloadsCount: 3,
    };
  });

  // Server state (Plans, Templates, Payments, Users)
  const [serverData, setServerData] = useState<any>(null);

  // Hero Demo Animation Counter
  const [heroStepIndex, setHeroStepIndex] = useState(0);

  // AI Creator Form State
  const [formFullName, setFormFullName] = useState(currentResume.fullName);
  const [formPhone, setFormPhone] = useState(currentResume.phone);
  const [formEmail, setFormEmail] = useState(currentResume.email);
  const [formLocation, setFormLocation] = useState(currentResume.location);
  const [formRole, setFormRole] = useState(currentResume.role);
  const [formObjective, setFormObjective] = useState(currentResume.professionalSummary);
  const [formExperience, setFormExperience] = useState(
    currentResume.experiences.map((e) => `${e.title} - ${e.company} (${e.period}): ${e.description}`).join('\n')
  );
  const [formEducation, setFormEducation] = useState(
    currentResume.education.map((ed) => `${ed.degree} - ${ed.institution} (${ed.year})`).join('\n')
  );
  const [formSkills, setFormSkills] = useState(currentResume.skills.join(', '));
  const [formLanguages, setFormLanguages] = useState(currentResume.languages.join(', '));
  const [formCourses, setFormCourses] = useState(currentResume.courses.join(', '));
  const [formCertifications, setFormCertifications] = useState(
    currentResume.certifications.join(', ')
  );
  const [formAdditional, setFormAdditional] = useState(currentResume.additionalInfo || '');
  const [formPhoto, setFormPhoto] = useState<string | undefined>(currentResume.photoDataUrl);

  // Generation Progress Modal
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepIdx, setGenStepIdx] = useState(0);

  // Template Preview Modal
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);

  // Plan Checkout Modal
  const [selectedPlanForPurchase, setSelectedPlanForPurchase] = useState<any | null>(null);
  const [payMethod, setPayMethod] = useState<'EXPRESS' | 'PAYPAY' | 'UNITEL MONEY'>('EXPRESS');
  const [payRefInput, setPayRefInput] = useState('');
  const [paymentSubmittedMsg, setPaymentSubmittedMsg] = useState<string | null>(null);

  // Admin Price Edit State
  const [editingPlanPrices, setEditingPlanPrices] = useState<Record<string, number>>({});

  const printRef = useRef<HTMLDivElement>(null);

  // Auto-save resumes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cvpro_angola_resumes_v1', JSON.stringify(resumes));
    } catch {
      // ignore
    }
  }, [resumes]);

  useEffect(() => {
    try {
      localStorage.setItem('cvpro_angola_user_v1', JSON.stringify(userProfile));
    } catch {
      // ignore
    }
  }, [userProfile]);

  // Fetch Backend CVPro state
  const fetchCvProState = async () => {
    try {
      const res = await fetch('/api/cvpro/state');
      if (res.ok) {
        const data = await res.json();
        setServerData(data);
        const priceMap: Record<string, number> = {};
        for (const p of data.plans || []) {
          priceMap[p.id] = p.priceKz;
        }
        setEditingPlanPrices(priceMap);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCvProState();
  }, []);

  // Cycle Hero Live Demo steps every 1.8s
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroStepIndex((prev) => (prev + 1) % HERO_DEMO_STEPS.length);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const updateCurrentResume = (patch: Partial<ResumeDocument>) => {
    setResumes((prev) =>
      prev.map((r) =>
        r.id === currentResume.id
          ? { ...r, ...patch, updatedAt: new Date().toISOString().slice(0, 10) }
          : r
      )
    );
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'form' | 'editor') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (target === 'form') setFormPhoto(reader.result);
        else updateCurrentResume({ photoDataUrl: reader.result });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGenerateResumeWithAi = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setGenStepIdx(0);

    const stepInterval = setInterval(() => {
      setGenStepIdx((prev) => Math.min(GENERATION_STEPS.length - 1, prev + 1));
    }, 550);

    try {
      const response = await fetch('/api/cvpro/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formFullName,
          phone: formPhone,
          email: formEmail,
          location: formLocation,
          role: formRole,
          objective: formObjective,
          experienceText: formExperience,
          educationText: formEducation,
          skillsText: formSkills,
          languagesText: formLanguages,
          coursesText: formCourses,
          certificationsText: formCertifications,
          additionalInfo: formAdditional,
        }),
      });

      const data = await response.json();
      setTimeout(() => {
        clearInterval(stepInterval);
        setGenStepIdx(GENERATION_STEPS.length - 1);

        const aiResume = data?.resume || {};
        const newDoc: ResumeDocument = {
          id: `cv-${Date.now()}`,
          title: `Currículo — ${aiResume.role || formRole || 'Profissional'}`,
          updatedAt: new Date().toISOString().slice(0, 10),
          templateId: currentResume.templateId || 'tpl-moderno',
          accentColor: currentResume.accentColor || '#10B981',
          fontFamily: currentResume.fontFamily || 'sans',
          spacing: 'normal',
          photoDataUrl: formPhoto,
          fullName: aiResume.fullName || formFullName,
          role: aiResume.role || formRole,
          email: aiResume.email || formEmail,
          phone: aiResume.phone || formPhone,
          location: aiResume.location || formLocation,
          professionalSummary: aiResume.professionalSummary || formObjective,
          experiences: aiResume.experiences || [],
          education: aiResume.education || [],
          skills: aiResume.skills || [],
          languages: aiResume.languages || [],
          courses: aiResume.courses || [],
          certifications: aiResume.certifications || [],
          additionalInfo: aiResume.additionalInfo || formAdditional,
        };

        setResumes((prev) => [newDoc, ...prev]);
        setCurrentResumeId(newDoc.id);
        setUserProfile((u) => ({ ...u, name: newDoc.fullName || u.name }));
        setIsGenerating(false);
        setActiveNav('editor');
      }, 1600);
    } catch {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setActiveNav('editor');
    }
  };

  // High-Quality Print / PDF Export with User's Name in Filename
  const handleDownloadPdf = (docToExport: ResumeDocument = currentResume) => {
    const cleanName = (docToExport.fullName || 'Curriculo_CVPro')
      .replace(/[^a-zA-Z0-9À-ÿ\s_-]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const originalTitle = document.title;
    document.title = `Curriculo_${cleanName}`;

    setUserProfile((u) => ({ ...u, downloadsCount: u.downloadsCount + 1 }));

    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  const handleDuplicateResume = (doc: ResumeDocument) => {
    const copy: ResumeDocument = {
      ...doc,
      id: `cv-${Date.now()}`,
      title: `${doc.title} (Cópia)`,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setResumes((prev) => [copy, ...prev]);
    setCurrentResumeId(copy.id);
  };

  const handleDeleteResume = (id: string) => {
    if (resumes.length <= 1) return;
    const remaining = resumes.filter((r) => r.id !== id);
    setResumes(remaining);
    if (currentResumeId === id && remaining[0]) {
      setCurrentResumeId(remaining[0].id);
    }
  };

  const handleSubmitPlanPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForPurchase) return;

    const res = await fetch('/api/cvpro/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userName: userProfile.name,
        userEmail: userProfile.email,
        userPhone: userProfile.phone,
        planSlug: selectedPlanForPurchase.slug,
        method: payMethod,
        transactionRef: payRefInput,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      setPaymentSubmittedMsg(data.message);
      fetchCvProState();

      // Also offer WhatsApp notification to 934413108
      const waMsg =
        `Olá CVPro Angola! Solicitei a ativação do plano *${selectedPlanForPurchase.name}* (${formatKzAmount(selectedPlanForPurchase.priceKz)}).\n` +
        `Nome: ${userProfile.name}\n` +
        `Telefone: ${userProfile.phone}\n` +
        `Método: ${payMethod}\n` +
        `Ref/Comprovativo: ${payRefInput || data.payment?.referenceCode}`;
      const link = document.createElement('a');
      link.href = `https://wa.me/244934413108?text=${encodeURIComponent(waMsg)}`;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleAdminUpdatePlanPrice = async (planId: string) => {
    const newPrice = editingPlanPrices[planId];
    if (!newPrice) return;
    const res = await fetch(`/api/cvpro/admin/plans/${planId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceKz: newPrice }),
    });
    if (res.ok) {
      const updated = await res.json();
      setServerData(updated);
    }
  };

  const handleAdminConfirmPayment = async (paymentId: string, status: string) => {
    const res = await fetch(`/api/cvpro/admin/payments/${paymentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setServerData(updated);
      const confirmedPay = updated.payments?.find((p: any) => p.id === paymentId);
      if (status === 'Confirmado' && confirmedPay) {
        setUserProfile((u) => ({
          ...u,
          planSlug: confirmedPay.planSlug,
          planName: `${confirmedPay.planName} (${formatKzAmount(confirmedPay.amountKz)})`,
        }));
      }
    }
  };

  const plans = serverData?.plans || [
    {
      id: 'plan-1000',
      slug: 'curriculo',
      name: 'Currículo',
      priceKz: 1000,
      badge: 'Básico',
      highlightText: 'Ideal para criar e baixar 1 currículo rápido',
      ctaLabel: 'CRIAR CURRÍCULO — 1.000 Kz',
      unlimitedDownloads: false,
      unlimitedPdf: false,
      highlighted: false,
      features: [
        'Criação de currículo',
        'IA para organizar informações',
        'Modelo profissional',
        'Editor de currículo',
        'Exportação em PDF',
        'Download do currículo',
      ],
    },
    {
      id: 'plan-5000',
      slug: 'profissional',
      name: 'Profissional',
      priceKz: 5000,
      badge: 'Evolução',
      highlightText: 'Mais modelos e personalização visual',
      ctaLabel: 'ESCOLHER PLANO — 5.000 Kz',
      unlimitedDownloads: false,
      unlimitedPdf: false,
      highlighted: false,
      features: [
        'Tudo do currículo de 1.000 Kz',
        'Mais modelos profissionais',
        'IA avançada',
        'Mais opções de personalização',
        'Personalização visual, cores e tipografia',
        'Organização avançada',
        'Exportação e download em PDF',
      ],
    },
    {
      id: 'plan-10000',
      slug: 'personalizado',
      name: 'Personalizado',
      priceKz: 10000,
      badge: 'Destaque',
      highlightText: 'Tudo do plano Profissional + Personalização completa',
      ctaLabel: 'ESCOLHER PLANO — 10.000 Kz',
      unlimitedDownloads: false,
      unlimitedPdf: false,
      highlighted: true,
      features: [
        'Tudo do plano Profissional + Personalização completa',
        'Personalização avançada de cores, tipografia e layout',
        'Personalização das seções e ajustes especiais',
        'IA premium adaptada ao perfil profissional',
        'Exportação em PDF de alta resolução',
      ],
    },
    {
      id: 'plan-20000',
      slug: 'premium',
      name: 'Premium',
      priceKz: 20000,
      badge: 'DOWNLOAD ILIMITADO · PDF ILIMITADO',
      highlightText: 'Gerar, personalizar e baixar quantas vezes quiser',
      ctaLabel: 'ESCOLHER PLANO — 20.000 Kz',
      unlimitedDownloads: true,
      unlimitedPdf: true,
      highlighted: true,
      features: [
        'Tudo do plano de 10.000 Kz',
        'Todos os modelos premium',
        'Personalização avançada e IA premium',
        'PDF ILIMITADO & DOWNLOAD ILIMITADO',
        'Gerar e baixar quantas vezes quiser',
        'Trocar modelos quantas vezes quiser',
      ],
    },
  ];

  const templates = serverData?.templates || [
    {
      id: 'tpl-moderno',
      name: 'Luanda Moderno',
      category: 'Moderno',
      accentColor: '#10B981',
      description: 'Cabeçalho dinâmico com destaque executivo e leitura rápida.',
      active: true,
    },
    {
      id: 'tpl-minimalista',
      name: 'Minimalista Clean',
      category: 'Minimalista',
      accentColor: '#0F172A',
      description: 'Foco total no conteúdo e tipografia limpa com espaço negativo.',
      active: true,
    },
    {
      id: 'tpl-executivo',
      name: 'Executivo Sénior',
      category: 'Executivo',
      accentColor: '#1E3A8A',
      description: 'Estrutura clássica para cargos de direção, banca e engenharia.',
      active: true,
    },
    {
      id: 'tpl-corporativo',
      name: 'Corporativo Talatona',
      category: 'Corporativo',
      accentColor: '#047857',
      description: 'Alinhamento corporativo ideal para multinacionais e consultorias.',
      active: true,
    },
    {
      id: 'tpl-criativo',
      name: 'Estúdio Criativo',
      category: 'Criativo',
      accentColor: '#7C3AED',
      description: 'Destaque visual moderno para design, marketing e comunicação.',
      active: true,
    },
    {
      id: 'tpl-tecnologia',
      name: 'Tech & Software',
      category: 'Tecnologia',
      accentColor: '#0284C7',
      description: 'Grelha técnica otimizada para TI, engenharia e projetos.',
      active: true,
    },
    {
      id: 'tpl-elegante',
      name: 'Elegante Editorial',
      category: 'Elegante',
      accentColor: '#9A3412',
      description: 'Tipografia refinada para perfis jurídicos, académicos e saúde.',
      active: true,
    },
  ];

  // Reusable Live A4 Resume Renderer
  const renderResumeSheet = (doc: ResumeDocument) => {
    const fontClass =
      doc.fontFamily === 'serif'
        ? 'font-serif'
        : doc.fontFamily === 'mono'
        ? 'font-mono'
        : 'font-sans';
    const spacingClass =
      doc.spacing === 'compact'
        ? 'space-y-3 p-6'
        : doc.spacing === 'spacious'
        ? 'space-y-6 p-10'
        : 'space-y-4 p-8';

    const isSidebarLayout =
      doc.templateId === 'tpl-moderno' || doc.templateId === 'tpl-criativo';

    return (
      <div
        ref={printRef}
        className={`bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-200 max-w-[794px] mx-auto w-full ${fontClass} print:shadow-none print:border-none print:rounded-none`}
      >
        {/* Top Accent Banner */}
        <div
          style={{ backgroundColor: doc.accentColor }}
          className="h-3 w-full rounded-t-xl print:rounded-none"
        />

        <div className={spacingClass}>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 pb-4" style={{ borderColor: doc.accentColor }}>
            <div className="flex items-center gap-4">
              {doc.photoDataUrl && (
                <img
                  src={doc.photoDataUrl}
                  alt={doc.fullName}
                  className="w-20 h-20 rounded-full object-cover border-2 shrink-0"
                  style={{ borderColor: doc.accentColor }}
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  {doc.fullName || 'Seu Nome Completo'}
                </h1>
                <p
                  className="text-base font-bold mt-0.5"
                  style={{ color: doc.accentColor }}
                >
                  {doc.role || 'Cargo / Área Profissional'}
                </p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-1 sm:text-right font-mono-tabular">
              {doc.phone && <p>{doc.phone}</p>}
              {doc.email && <p>{doc.email}</p>}
              {doc.location && <p>{doc.location}</p>}
            </div>
          </div>

          {/* Body Grid */}
          <div className={isSidebarLayout ? 'grid grid-cols-1 md:grid-cols-12 gap-6 pt-2' : 'space-y-5 pt-2'}>
            {/* Main Column */}
            <div className={isSidebarLayout ? 'md:col-span-8 space-y-5' : 'space-y-5'}>
              {/* Summary */}
              {doc.professionalSummary && (
                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider mb-1.5"
                    style={{ color: doc.accentColor }}
                  >
                    Objetivo & Perfil Profissional
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {doc.professionalSummary}
                  </p>
                </section>
              )}

              {/* Experience */}
              {doc.experiences.length > 0 && (
                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider mb-2.5"
                    style={{ color: doc.accentColor }}
                  >
                    Experiência Profissional
                  </h2>
                  <div className="space-y-3.5">
                    {doc.experiences.map((exp, idx) => (
                      <div key={idx} className="border-l-2 pl-3" style={{ borderColor: doc.accentColor }}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <h3 className="text-sm font-bold text-slate-900">{exp.title}</h3>
                          <span className="text-xs font-semibold text-slate-500 font-mono-tabular">
                            {exp.period}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600">{exp.company}</p>
                        <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {doc.education.length > 0 && (
                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider mb-2"
                    style={{ color: doc.accentColor }}
                  >
                    Formação Académica
                  </h2>
                  <div className="space-y-2">
                    {doc.education.map((ed, idx) => (
                      <div key={idx} className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{ed.degree}</p>
                          <p className="text-xs text-slate-600">{ed.institution}</p>
                        </div>
                        <span className="text-xs font-semibold text-slate-500 font-mono-tabular">
                          {ed.year}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Secondary / Sidebar Column */}
            <div className={isSidebarLayout ? 'md:col-span-4 space-y-5 bg-slate-50 p-4 rounded-lg' : 'grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-slate-200'}>
              {/* Skills */}
              {doc.skills.length > 0 && (
                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider mb-2"
                    style={{ color: doc.accentColor }}
                  >
                    Competências
                  </h2>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {doc.skills.map((sk, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: doc.accentColor }}
                        />
                        <span>{sk}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Languages */}
              {doc.languages.length > 0 && (
                <section>
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider mb-2"
                    style={{ color: doc.accentColor }}
                  >
                    Idiomas
                  </h2>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {doc.languages.map((lang, i) => (
                      <li key={i}>{lang}</li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Courses & Certifications */}
              {(doc.courses.length > 0 || doc.certifications.length > 0) && (
                <section className="sm:col-span-2">
                  <h2
                    className="text-xs font-extrabold uppercase tracking-wider mb-2"
                    style={{ color: doc.accentColor }}
                  >
                    Cursos & Certificações
                  </h2>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {[...doc.courses, ...doc.certifications].map((c, i) => (
                      <li key={i}>• {c}</li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col relative">
      {/* Subtle Neon Green Atmospheric Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[850px] h-[380px] bg-[#00FF66]/10 blur-[150px] rounded-full z-0 print:hidden"
      />

      {/* ========================================================= */}
      {/* NAVBAR (Strict 3-Zone Contract: Brand — Links — Actions) */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-md border-b border-white/10 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* ESQUERDA: CVPro Angola */}
          <button
            onClick={() => setActiveNav('home')}
            className="text-xl font-extrabold tracking-tight font-display text-white whitespace-nowrap shrink-0 cursor-pointer"
          >
            CVPro <span className="text-[#00FF66]">Angola</span>
          </button>

          {/* CENTRO: Início, Criar currículo, Modelos, Preços, Como funciona */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
            <button
              onClick={() => setActiveNav('home')}
              className={`hover:text-[#00FF66] transition-colors whitespace-nowrap cursor-pointer ${
                activeNav === 'home' ? 'text-[#00FF66]' : ''
              }`}
            >
              Início
            </button>
            <button
              onClick={() => setActiveNav('creator')}
              className={`hover:text-[#00FF66] transition-colors whitespace-nowrap cursor-pointer ${
                activeNav === 'creator' || activeNav === 'editor' ? 'text-[#00FF66]' : ''
              }`}
            >
              Criar currículo
            </button>
            <button
              onClick={() => setActiveNav('templates')}
              className={`hover:text-[#00FF66] transition-colors whitespace-nowrap cursor-pointer ${
                activeNav === 'templates' ? 'text-[#00FF66]' : ''
              }`}
            >
              Modelos
            </button>
            <button
              onClick={() => setActiveNav('pricing')}
              className={`hover:text-[#00FF66] transition-colors whitespace-nowrap cursor-pointer ${
                activeNav === 'pricing' ? 'text-[#00FF66]' : ''
              }`}
            >
              Preços
            </button>
            <button
              onClick={() => setActiveNav('how')}
              className={`hover:text-[#00FF66] transition-colors whitespace-nowrap cursor-pointer ${
                activeNav === 'how' ? 'text-[#00FF66]' : ''
              }`}
            >
              Como funciona
            </button>
          </nav>

          {/* DIREITA: Entrar (Dashboard/ADM) + Criar agora (Verde Neon) */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveNav('dashboard')}
              className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-colors whitespace-nowrap cursor-pointer"
            >
              Entrar · Painel
            </button>
            <button
              onClick={() => setActiveNav('admin')}
              className="hidden sm:inline-flex px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-colors whitespace-nowrap cursor-pointer"
              title="Área Administrativa"
            >
              ADM
            </button>
            <button
              onClick={() => setActiveNav('creator')}
              className="px-4 py-2 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] text-xs font-bold transition-all whitespace-nowrap shadow-[0_0_20px_rgba(0,255,102,0.35)] cursor-pointer"
            >
              Criar agora
            </button>
          </div>
        </div>

        {/* Mobile Quick Sub-bar */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 overflow-x-auto border-t border-white/5 bg-[#080B0A] text-xs">
          {[
            { id: 'home', label: 'Início' },
            { id: 'creator', label: 'Criar' },
            { id: 'editor', label: 'Editor' },
            { id: 'templates', label: 'Modelos' },
            { id: 'pricing', label: 'Preços' },
            { id: 'dashboard', label: 'Dashboard' },
            { id: 'admin', label: 'ADM' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveNav(t.id as any)}
              className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap ${
                activeNav === t.id ? 'bg-[#00FF66] text-[#050505]' : 'text-slate-400'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* ========================================================= */}
      {/* AI GENERATION PROGRESS OVERLAY */}
      {/* ========================================================= */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-6">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0F0D] border border-[#00FF66]/40 p-8 text-center space-y-6 shadow-[0_0_50px_rgba(0,255,102,0.2)]">
            <div className="w-14 h-14 rounded-2xl bg-[#00FF66]/15 border border-[#00FF66]/40 flex items-center justify-center mx-auto text-[#00FF66]">
              <Sparkles className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-[#00FF66] tracking-wider uppercase">
                MOTOR DE IA CVPRO ANGOLA
              </p>
              <h3 className="text-xl font-extrabold text-white font-display">
                {GENERATION_STEPS[genStepIdx]}
              </h3>
            </div>
            <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div
                style={{
                  width: `${Math.round(((genStepIdx + 1) / GENERATION_STEPS.length) * 100)}%`,
                }}
                className="h-full bg-[#00FF66] transition-all duration-300 shadow-[0_0_15px_#00FF66]"
              />
            </div>
            <p className="text-xs text-slate-400">
              Do zero ao currículo profissional em segundos.
            </p>
          </div>
        </div>
      )}

      <main className="flex-1 relative z-10">
        {/* ========================================================= */}
        {/* VIEW 1: HOME (HERO + LIVE DEMO + COMO FUNCIONA + MODELOS + PREÇOS) */}
        {/* ========================================================= */}
        {activeNav === 'home' && (
          <div>
            {/* HERO SECTION */}
            <section className="py-12 sm:py-20 border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  {/* Left: Hero Copy & Primary CTAs */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#00FF66]">
                      <Sparkles className="w-4 h-4" />
                      <span>Do zero ao currículo profissional em segundos.</span>
                    </div>

                    <h1
                      className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.08]"
                      style={{ textWrap: 'balance' }}
                    >
                      Seu currículo profissional.{' '}
                      <span className="text-[#00FF66] drop-shadow-[0_0_25px_rgba(0,255,102,0.4)] block mt-1">
                        Pronto em segundos.
                      </span>
                    </h1>

                    <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-xl">
                      Crie um currículo profissional, moderno e pronto para enviar para empresas em
                      poucos segundos. A nossa Inteligência Artificial corrige erros, melhora a
                      escrita e aplica o design ideal automaticamente.
                    </p>

                    <div className="flex flex-wrap items-center gap-4 pt-2">
                      <button
                        onClick={() => setActiveNav('creator')}
                        className="py-4 px-8 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] font-extrabold text-sm transition-all flex items-center gap-2 shadow-[0_0_30px_rgba(0,255,102,0.45)] cursor-pointer whitespace-nowrap"
                      >
                        <span>CRIAR MEU CURRÍCULO</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveNav('templates')}
                        className="py-4 px-7 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                      >
                        VER MODELOS
                      </button>
                    </div>

                    <p className="text-xs text-slate-400">
                      Grátis para começar · Rápido · Profissional
                    </p>
                  </div>

                  {/* Right: DEMONSTRAÇÃO DO HERO (Animated Live Creation Preview) */}
                  <div className="lg:col-span-6">
                    <div className="rounded-2xl bg-[#0A0E0C] border border-[#00FF66]/35 p-6 shadow-[0_0_45px_rgba(0,255,102,0.15)] space-y-5">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3.5">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
                          <span className="text-xs font-bold text-[#00FF66]">
                            {HERO_DEMO_STEPS[heroStepIndex]}
                          </span>
                        </div>
                        <span className="text-xs font-mono-tabular text-slate-400">
                          IA Ativa · {((heroStepIndex + 1) * 25)}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                        <div
                          style={{ width: `${(heroStepIndex + 1) * 25}%` }}
                          className="h-full bg-[#00FF66] transition-all duration-500 shadow-[0_0_12px_#00FF66]"
                        />
                      </div>

                      {/* Live Mini Resume Preview Card */}
                      <div className="rounded-xl bg-white text-slate-900 p-5 shadow-lg space-y-3">
                        <div className="flex items-center justify-between border-b-2 border-emerald-500 pb-3">
                          <div>
                            <p className="text-base font-extrabold text-slate-900">
                              {currentResume.fullName}
                            </p>
                            <p className="text-xs font-bold text-emerald-600">
                              {currentResume.role}
                            </p>
                          </div>
                          <span className="text-[11px] font-mono-tabular text-slate-500">
                            Luanda, Angola
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 line-clamp-2">
                          {currentResume.professionalSummary}
                        </p>
                        <div className="grid grid-cols-2 gap-3 pt-1">
                          <div className="p-2.5 rounded-lg bg-slate-100">
                            <p className="text-[10px] font-extrabold text-emerald-700 uppercase">
                              Experiência Estruturada
                            </p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5 truncate">
                              {currentResume.experiences[0]?.title}
                            </p>
                          </div>
                          <div className="p-2.5 rounded-lg bg-slate-100">
                            <p className="text-[10px] font-extrabold text-emerald-700 uppercase">
                              Exportação Pronta
                            </p>
                            <p className="text-xs font-bold text-slate-800 mt-0.5">
                              PDF A4 Alta Definição
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span>Salvamento automático ativo</span>
                        <button
                          onClick={() => setActiveNav('editor')}
                          className="text-[#00FF66] font-semibold hover:underline cursor-pointer"
                        >
                          Abrir no Editor em Tempo Real →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* COMO FUNCIONA (3 PASSOS) */}
            <section className="py-16 border-b border-white/10 bg-[#080B0A]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-10">
                  <p className="text-xs font-bold text-[#00FF66]">SIMPLES E RÁPIDO</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Como funciona o CVPro Angola
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      step: '01',
                      title: 'Preencha seus dados',
                      desc: 'Informe apenas os seus dados essenciais, experiência e formação num formulário intuitivo.',
                    },
                    {
                      step: '02',
                      title: 'A IA cria seu currículo',
                      desc: 'A nossa IA corrige erros de português, melhora a escrita e estrutura o seu perfil profissional em segundos.',
                    },
                    {
                      step: '03',
                      title: 'Baixe e envie',
                      desc: 'Personalize cores ou troque de modelo num clique e exporte o PDF pronto para enviar às empresas.',
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="p-6 rounded-2xl bg-[#0A0E0C] border border-white/10 hover:border-[#00FF66]/40 transition-all"
                    >
                      <span className="text-2xl font-extrabold text-[#00FF66] font-mono-tabular">
                        {item.step}
                      </span>
                      <h3 className="text-lg font-extrabold text-white mt-3">{item.title}</h3>
                      <p className="text-sm text-slate-400 mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* DESTAQUE PLANO PREMIUM 20.000 KZ NA HOME */}
            <section className="py-16 border-b border-white/10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-gradient-to-r from-[#0A140F] via-[#0B1912] to-[#0A0E0C] border border-[#00FF66]/50 p-8 sm:p-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 shadow-[0_0_45px_rgba(0,255,102,0.15)]">
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-extrabold text-[#00FF66]">
                      <span>DOWNLOAD ILIMITADO</span>
                      <span aria-hidden="true">·</span>
                      <span>PDF ILIMITADO</span>
                      <span aria-hidden="true">·</span>
                      <span>TODOS OS MODELOS PREMIUM</span>
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                      Plano Premium Completo — 20.000 Kz
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      Gere quantos currículos quiser com IA premium, troque entre os 7 modelos
                      executivos sem limites e faça downloads em PDF ilimitados para todas as
                      vagas.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 shrink-0">
                    <button
                      onClick={() => {
                        const prem = plans.find((p: any) => p.slug === 'premium') || plans[3];
                        setSelectedPlanForPurchase(prem);
                        setPaymentSubmittedMsg(null);
                      }}
                      className="py-4 px-7 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] font-extrabold text-sm transition-all shadow-[0_0_25px_rgba(0,255,102,0.4)] cursor-pointer whitespace-nowrap"
                    >
                      ESCOLHER PLANO — 20.000 Kz
                    </button>
                    <button
                      onClick={() => setActiveNav('pricing')}
                      className="py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 text-white font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                    >
                      Comparar Todos os Planos
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: CRIADOR DE CURRÍCULO COM IA */}
        {/* ========================================================= */}
        {activeNav === 'creator' && (
          <section className="py-10">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl bg-[#0A0E0C] border border-[#00FF66]/35 p-6 sm:p-8 shadow-[0_0_40px_rgba(0,255,102,0.12)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5 mb-6">
                  <div>
                    <p className="text-xs font-bold text-[#00FF66]">
                      PASSO 1 · INFORME OS SEUS DADOS ESSENCIAIS
                    </p>
                    <h2 className="text-2xl font-extrabold text-white mt-1">
                      Criar Currículo Profissional com IA
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      A IA organiza as suas informações, corrige erros de português e melhora a
                      escrita automaticamente.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveNav('editor')}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#00FF66] whitespace-nowrap cursor-pointer"
                  >
                    Ir direto ao Editor →
                  </button>
                </div>

                <form onSubmit={handleGenerateResumeWithAi} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Nome completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formFullName}
                        onChange={(e) => setFormFullName(e.target.value)}
                        placeholder="Ex: Mateus Agostinho"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Cargo / área profissional pretendida *
                      </label>
                      <input
                        type="text"
                        required
                        value={formRole}
                        onChange={(e) => setFormRole(e.target.value)}
                        placeholder="Ex: Contabilista Sénior / Engenheiro Informático"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Telefone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+244 923 000 000"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white font-mono-tabular focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="nome@email.ao"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Localização *
                      </label>
                      <input
                        type="text"
                        required
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        placeholder="Luanda, Angola"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Experiência profissional (empresas, cargos ou atividades realizadas) *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={formExperience}
                      onChange={(e) => setFormExperience(e.target.value)}
                      placeholder="Descreva brevemente onde trabalhou e o que fazia. A IA irá transformar em tópicos executivos..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Formação académica *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formEducation}
                        onChange={(e) => setFormEducation(e.target.value)}
                        placeholder="Ex: Licenciatura em Gestão — UAN (2020)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Competências (separadas por vírgula) *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={formSkills}
                        onChange={(e) => setFormSkills(e.target.value)}
                        placeholder="Ex: Liderança, Excel Avançado, Contabilidade, Comunicação"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Idiomas *
                      </label>
                      <input
                        type="text"
                        required
                        value={formLanguages}
                        onChange={(e) => setFormLanguages(e.target.value)}
                        placeholder="Português, Inglês"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Cursos (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formCourses}
                        onChange={(e) => setFormCourses(e.target.value)}
                        placeholder="Ex: Gestão de Projetos, Informática"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Certificações (Opcional)
                      </label>
                      <input
                        type="text"
                        value={formCertifications}
                        onChange={(e) => setFormCertifications(e.target.value)}
                        placeholder="Ex: Ordem dos Contabilistas, Cisco"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Objetivo profissional (Opcional — a IA pode criar por si)
                      </label>
                      <input
                        type="text"
                        value={formObjective}
                        onChange={(e) => setFormObjective(e.target.value)}
                        placeholder="Deixe em branco para a IA redigir automaticamente..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-sm text-white focus:outline-none focus:border-[#00FF66]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                        Foto de Perfil (Opcional)
                      </label>
                      <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-xs text-slate-300 cursor-pointer hover:border-[#00FF66]">
                        <Upload className="w-4 h-4 text-[#00FF66]" />
                        <span>{formPhoto ? 'Foto carregada com sucesso' : 'Carregar fotografia'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handlePhotoUpload(e, 'form')}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="pt-3">
                    <button
                      type="submit"
                      className="w-full py-4 px-8 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(0,255,102,0.4)] cursor-pointer"
                    >
                      <Sparkles className="w-5 h-5" />
                      <span>GERAR MEU CURRÍCULO</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* VIEW 3: EDITOR DE CURRÍCULO EM TEMPO REAL (3 COLUNAS) */}
        {/* ========================================================= */}
        {activeNav === 'editor' && (
          <section className="py-6">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6">
              {/* Top Editor Toolbar */}
              <div className="mb-6 p-4 rounded-2xl bg-[#0A0E0C] border border-white/10 flex flex-wrap items-center justify-between gap-4 print:hidden">
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#00FF66]" />
                  <div>
                    <h2 className="text-base font-extrabold text-white">
                      Editor Profissional em Tempo Real
                    </h2>
                    <p className="text-xs text-slate-400">
                      Salvamento automático ativo · Plano atual: {userProfile.planName}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setActiveNav('creator')}
                    className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#00FF66]" />
                    <span>Regerar com IA</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPdf(currentResume)}
                    className="px-5 py-2.5 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] text-xs font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.35)] cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>BAIXAR CURRÍCULO EM PDF</span>
                  </button>
                </div>
              </div>

              {/* 3-Column Editor Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* LADO ESQUERDO: Conteúdo e Seções */}
                <div className="lg:col-span-3 rounded-2xl bg-[#0A0E0C] border border-white/10 p-4 space-y-4 max-h-[82vh] overflow-y-auto print:hidden">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00FF66]">
                    Conteúdo do Currículo
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Nome Completo</label>
                      <input
                        type="text"
                        value={currentResume.fullName}
                        onChange={(e) => updateCurrentResume({ fullName: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#050706] border border-white/15 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">Cargo / Título</label>
                      <input
                        type="text"
                        value={currentResume.role}
                        onChange={(e) => updateCurrentResume({ role: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#050706] border border-white/15 text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 mb-1">Telefone</label>
                        <input
                          type="text"
                          value={currentResume.phone}
                          onChange={(e) => updateCurrentResume({ phone: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg bg-[#050706] border border-white/15 text-white font-mono-tabular"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">Localização</label>
                        <input
                          type="text"
                          value={currentResume.location}
                          onChange={(e) => updateCurrentResume({ location: e.target.value })}
                          className="w-full px-2.5 py-2 rounded-lg bg-[#050706] border border-white/15 text-white"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">E-mail</label>
                      <input
                        type="text"
                        value={currentResume.email}
                        onChange={(e) => updateCurrentResume({ email: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#050706] border border-white/15 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">Objetivo Profissional</label>
                      <textarea
                        rows={3}
                        value={currentResume.professionalSummary}
                        onChange={(e) =>
                          updateCurrentResume({ professionalSummary: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#050706] border border-white/15 text-white"
                      />
                    </div>

                    {/* Experience Editor */}
                    <div className="pt-2 border-t border-white/10 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">Experiência</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateCurrentResume({
                              experiences: [
                                ...currentResume.experiences,
                                {
                                  title: 'Novo Cargo',
                                  company: 'Nome da Empresa',
                                  period: '2024 — Presente',
                                  description: 'Descrição das responsabilidades e resultados.',
                                },
                              ],
                            })
                          }
                          className="text-[#00FF66] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar
                        </button>
                      </div>
                      {currentResume.experiences.map((exp, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-[#050706] border border-white/10 space-y-1.5"
                        >
                          <input
                            type="text"
                            value={exp.title}
                            onChange={(e) => {
                              const next = [...currentResume.experiences];
                              next[idx] = { ...exp, title: e.target.value };
                              updateCurrentResume({ experiences: next });
                            }}
                            className="w-full px-2 py-1 rounded bg-white/5 text-white font-semibold"
                            placeholder="Cargo"
                          />
                          <div className="grid grid-cols-2 gap-1.5">
                            <input
                              type="text"
                              value={exp.company}
                              onChange={(e) => {
                                const next = [...currentResume.experiences];
                                next[idx] = { ...exp, company: e.target.value };
                                updateCurrentResume({ experiences: next });
                              }}
                              className="w-full px-2 py-1 rounded bg-white/5 text-slate-300"
                              placeholder="Empresa"
                            />
                            <input
                              type="text"
                              value={exp.period}
                              onChange={(e) => {
                                const next = [...currentResume.experiences];
                                next[idx] = { ...exp, period: e.target.value };
                                updateCurrentResume({ experiences: next });
                              }}
                              className="w-full px-2 py-1 rounded bg-white/5 text-slate-300"
                              placeholder="Período"
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={exp.description}
                            onChange={(e) => {
                              const next = [...currentResume.experiences];
                              next[idx] = { ...exp, description: e.target.value };
                              updateCurrentResume({ experiences: next });
                            }}
                            className="w-full px-2 py-1 rounded bg-white/5 text-slate-300"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Skills & Languages */}
                    <div className="pt-2 border-t border-white/10">
                      <label className="block text-slate-400 mb-1">
                        Competências (separadas por vírgula)
                      </label>
                      <input
                        type="text"
                        value={currentResume.skills.join(', ')}
                        onChange={(e) =>
                          updateCurrentResume({
                            skills: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#050706] border border-white/15 text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 mb-1">
                        Idiomas (separados por vírgula)
                      </label>
                      <input
                        type="text"
                        value={currentResume.languages.join(', ')}
                        onChange={(e) =>
                          updateCurrentResume({
                            languages: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#050706] border border-white/15 text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* CENTRO: Preview do Currículo em Tempo Real */}
                <div className="lg:col-span-6 overflow-x-auto">
                  {renderResumeSheet(currentResume)}
                </div>

                {/* LADO DIREITO: Modelos, Cores, Tipografia, Espaçamento */}
                <div className="lg:col-span-3 rounded-2xl bg-[#0A0E0C] border border-white/10 p-4 space-y-5 print:hidden">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00FF66] mb-2.5">
                      Trocar Modelo Instantaneamente
                    </h3>
                    <div className="space-y-1.5">
                      {templates.map((tpl: any) => (
                        <button
                          key={tpl.id}
                          onClick={() =>
                            updateCurrentResume({
                              templateId: tpl.id,
                              accentColor: tpl.accentColor,
                            })
                          }
                          className={`w-full px-3 py-2 rounded-xl text-left text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                            currentResume.templateId === tpl.id
                              ? 'bg-[#00FF66]/20 border border-[#00FF66] text-white'
                              : 'bg-[#050706] border border-white/10 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span>{tpl.name}</span>
                          <span className="text-[10px] text-slate-400">{tpl.category}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00FF66] mb-2">
                      Cor Principal do Currículo
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        '#10B981',
                        '#0F172A',
                        '#1E3A8A',
                        '#0284C7',
                        '#7C3AED',
                        '#9A3412',
                        '#be123c',
                      ].map((hex) => (
                        <button
                          key={hex}
                          onClick={() => updateCurrentResume({ accentColor: hex })}
                          style={{ backgroundColor: hex }}
                          className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer ${
                            currentResume.accentColor === hex
                              ? 'border-white scale-110'
                              : 'border-transparent'
                          }`}
                          aria-label={`Cor ${hex}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00FF66] mb-2">
                      Tipografia
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'sans', label: 'Moderna' },
                        { id: 'serif', label: 'Executiva' },
                        { id: 'mono', label: 'Técnica' },
                      ].map((f) => (
                        <button
                          key={f.id}
                          onClick={() => updateCurrentResume({ fontFamily: f.id as any })}
                          className={`py-2 rounded-lg border font-semibold cursor-pointer ${
                            currentResume.fontFamily === f.id
                              ? 'bg-[#00FF66] text-[#050505] border-[#00FF66]'
                              : 'bg-[#050706] text-slate-300 border-white/10'
                          }`}
                        >
                          {f.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#00FF66] mb-2">
                      Espaçamento
                    </h3>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {[
                        { id: 'compact', label: 'Compacto' },
                        { id: 'normal', label: 'Normal' },
                        { id: 'spacious', label: 'Amplo' },
                      ].map((sp) => (
                        <button
                          key={sp.id}
                          onClick={() => updateCurrentResume({ spacing: sp.id as any })}
                          className={`py-2 rounded-lg border font-semibold cursor-pointer ${
                            currentResume.spacing === sp.id
                              ? 'bg-[#00FF66] text-[#050505] border-[#00FF66]'
                              : 'bg-[#050706] text-slate-300 border-white/10'
                          }`}
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* VIEW 4: PÁGINA DE MODELOS */}
        {/* ========================================================= */}
        {activeNav === 'templates' && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <p className="text-xs font-bold text-[#00FF66]">DESIGN RECRUTADOR-FRIENDLY</p>
                <h2 className="text-3xl font-extrabold text-white mt-1">
                  Modelos de Currículo Profissionais
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Troque de modelo a qualquer momento sem perder os seus dados.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates
                  .filter((t: any) => t.active !== false)
                  .map((tpl: any) => (
                    <div
                      key={tpl.id}
                      className="rounded-2xl bg-[#0A0E0C] border border-white/10 hover:border-[#00FF66]/50 transition-all p-5 flex flex-col justify-between space-y-5"
                    >
                      <div>
                        {/* Mini Visual Representation of the Template */}
                        <div className="rounded-xl bg-white p-4 text-slate-900 space-y-2.5 mb-4 shadow-md">
                          <div
                            className="h-2.5 rounded-full w-full"
                            style={{ backgroundColor: tpl.accentColor }}
                          />
                          <div className="flex justify-between items-center border-b pb-2">
                            <div>
                              <div className="h-3 w-32 bg-slate-800 rounded" />
                              <div
                                className="h-2 w-20 rounded mt-1"
                                style={{ backgroundColor: tpl.accentColor }}
                              />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500">
                              {tpl.category}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="h-2 w-full bg-slate-200 rounded" />
                            <div className="h-2 w-5/6 bg-slate-200 rounded" />
                            <div className="h-2 w-4/6 bg-slate-200 rounded" />
                          </div>
                        </div>

                        <span className="text-xs font-semibold text-[#00FF66]">
                          Categoria: {tpl.category}
                        </span>
                        <h3 className="text-lg font-extrabold text-white mt-0.5">{tpl.name}</h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 pt-3 border-t border-white/10">
                        <button
                          onClick={() => setPreviewTemplate(tpl)}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Visualizar</span>
                        </button>
                        <button
                          onClick={() => {
                            updateCurrentResume({
                              templateId: tpl.id,
                              accentColor: tpl.accentColor,
                            });
                            setActiveNav('creator');
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] text-xs font-extrabold cursor-pointer"
                        >
                          Usar este modelo
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* VIEW 5: PÁGINA DE PREÇOS + TABELA DE COMPARAÇÃO */}
        {/* ========================================================= */}
        {activeNav === 'pricing' && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
              <div>
                <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
                  <p className="text-xs font-bold text-[#00FF66] uppercase tracking-wider">
                    PLANOS TRANSPARENTES EM KWANZAS (KZ / AOA)
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                    Escolha o plano ideal para a sua carreira
                  </h2>
                  <p className="text-sm text-slate-400">
                    Desde um currículo único por 1.000 Kz até ao Plano Premium de 20.000 Kz com
                    DOWNLOAD ILIMITADO e PDF ILIMITADO.
                  </p>
                </div>

                {/* 4 Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {plans.map((plan: any) => {
                    const isPremium20k = plan.slug === 'premium';
                    const isCustom10k = plan.slug === 'personalizado';
                    return (
                      <div
                        key={plan.id}
                        className={`rounded-2xl p-6 flex flex-col justify-between border transition-all ${
                          isPremium20k
                            ? 'bg-gradient-to-b from-[#0D1F15] to-[#0A0E0C] border-[#00FF66] shadow-[0_0_35px_rgba(0,255,102,0.2)]'
                            : isCustom10k
                            ? 'bg-[#0A0E0C] border-[#00FF66]/60'
                            : 'bg-[#0A0E0C] border-white/10'
                        }`}
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#00FF66]">
                              {plan.name}
                            </span>
                            {isPremium20k && (
                              <span className="text-[10px] font-extrabold text-[#00FF66]">
                                MAIS ESCOLHIDO
                              </span>
                            )}
                          </div>

                          <div>
                            <p className="text-3xl font-extrabold text-[#00FF66] font-mono-tabular">
                              {formatKzAmount(plan.priceKz)}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{plan.highlightText}</p>
                          </div>

                          {isPremium20k && (
                            <div className="p-2.5 rounded-xl bg-[#00FF66]/15 border border-[#00FF66]/40 text-center">
                              <p className="text-xs font-extrabold text-[#00FF66]">
                                DOWNLOAD ILIMITADO · PDF ILIMITADO
                              </p>
                            </div>
                          )}

                          <ul className="space-y-2.5 pt-2 border-t border-white/10 text-xs text-slate-200">
                            {plan.features.map((feat: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <Check className="w-4 h-4 text-[#00FF66] shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-6 mt-6 border-t border-white/10">
                          <button
                            onClick={() => {
                              setSelectedPlanForPurchase(plan);
                              setPaymentSubmittedMsg(null);
                            }}
                            className={`w-full py-3.5 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                              isPremium20k || isCustom10k
                                ? 'bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] shadow-[0_0_20px_rgba(0,255,102,0.3)]'
                                : 'bg-white/10 hover:bg-[#00FF66] hover:text-[#050505] text-white'
                            }`}
                          >
                            {plan.ctaLabel}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TABELA DE COMPARAÇÃO MODERNA */}
              <div className="rounded-2xl bg-[#0A0E0C] border border-white/15 overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <h3 className="text-xl font-extrabold text-white">
                    Tabela de Comparação de Planos
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Compare todos os recursos incluídos em 1.000 Kz, 5.000 Kz, 10.000 Kz e 20.000 Kz.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-[#050706] text-xs font-extrabold">
                        <th className="py-4 px-5 text-slate-300">RECURSOS INCLUÍDOS</th>
                        <th className="py-4 px-5 text-center text-white font-mono-tabular">
                          Currículo
                          <span className="block text-[#00FF66]">1.000 Kz</span>
                        </th>
                        <th className="py-4 px-5 text-center text-white font-mono-tabular">
                          Profissional
                          <span className="block text-[#00FF66]">5.000 Kz</span>
                        </th>
                        <th className="py-4 px-5 text-center text-white bg-[#00FF66]/5 font-mono-tabular">
                          Personalizado
                          <span className="block text-[#00FF66]">10.000 Kz</span>
                        </th>
                        <th className="py-4 px-5 text-center text-white bg-[#00FF66]/10 font-mono-tabular">
                          Premium
                          <span className="block text-[#00FF66]">20.000 Kz</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10 text-xs">
                      {[
                        {
                          feature: 'Criação de currículo e Editor em tempo real',
                          c1: 'Sim',
                          c5: 'Sim',
                          c10: 'Sim',
                          c20: 'Sim',
                        },
                        {
                          feature: 'Nível da Inteligência Artificial',
                          c1: 'IA Essencial',
                          c5: 'IA Avançada',
                          c10: 'IA Premium Adaptada',
                          c20: 'IA Premium Ilimitada',
                        },
                        {
                          feature: 'Modelos Profissionais Disponíveis',
                          c1: 'Básico',
                          c5: 'Mais Modelos',
                          c10: 'Todos + Layout Custom',
                          c20: 'Todos os 7 Modelos Premium',
                        },
                        {
                          feature: 'Personalização Completa (Cores, Tipografia, Seções)',
                          c1: 'Básica',
                          c5: 'Visual + Cores',
                          c10: 'Personalização Completa',
                          c20: 'Personalização Completa Ilimitada',
                        },
                        {
                          feature: 'Exportação e Download em PDF',
                          c1: '1 Currículo',
                          c5: 'Incluído',
                          c10: 'Alta Resolução',
                          c20: 'DOWNLOAD ILIMITADO · PDF ILIMITADO',
                        },
                      ].map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02]">
                          <td className="py-3.5 px-5 font-semibold text-white">{row.feature}</td>
                          <td className="py-3.5 px-5 text-center text-slate-300">{row.c1}</td>
                          <td className="py-3.5 px-5 text-center text-slate-300">{row.c5}</td>
                          <td className="py-3.5 px-5 text-center font-semibold text-white bg-[#00FF66]/5">
                            {row.c10}
                          </td>
                          <td className="py-3.5 px-5 text-center font-extrabold text-[#00FF66] bg-[#00FF66]/10">
                            {row.c20}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* VIEW 6: PÁGINA COMO FUNCIONA */}
        {/* ========================================================= */}
        {activeNav === 'how' && (
          <section className="py-16">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
              <div className="text-center space-y-3">
                <p className="text-xs font-bold text-[#00FF66]">VELOCIDADE + IA + SIMPLICIDADE</p>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Do zero ao currículo profissional em segundos.
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    num: '01',
                    title: 'Preencha seus dados',
                    text: 'Insira o seu nome, contacto, experiência e formação. Não precisa preocupar-se com a formatação.',
                  },
                  {
                    num: '02',
                    title: 'A IA cria seu currículo',
                    text: 'O motor inteligente corrige erros gramaticais, melhora o objetivo profissional e organiza cada secção.',
                  },
                  {
                    num: '03',
                    title: 'Baixe e envie',
                    text: 'Exporte imediatamente para um ficheiro PDF limpo e adequado para impressão ou envio por e-mail e WhatsApp.',
                  },
                ].map((s) => (
                  <div
                    key={s.num}
                    className="p-7 rounded-2xl bg-[#0A0E0C] border border-[#00FF66]/30 space-y-3"
                  >
                    <span className="text-3xl font-extrabold text-[#00FF66] font-mono-tabular">
                      {s.num}
                    </span>
                    <h3 className="text-xl font-extrabold text-white">{s.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button
                  onClick={() => setActiveNav('creator')}
                  className="py-4 px-8 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] font-extrabold text-sm shadow-[0_0_25px_rgba(0,255,102,0.4)] cursor-pointer"
                >
                  CRIAR MEU CURRÍCULO AGORA
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* VIEW 7: DASHBOARD DO USUÁRIO ("Olá, [Nome]") */}
        {/* ========================================================= */}
        {activeNav === 'dashboard' && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
                <div>
                  <p className="text-xs font-bold text-[#00FF66]">ÁREA DO USUÁRIO CVPRO ANGOLA</p>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                    Olá, {userProfile.name}
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-4 py-2 rounded-xl bg-[#0A0E0C] border border-[#00FF66]/40 text-xs">
                    <span className="text-slate-400">Plano Atual: </span>
                    <strong className="text-[#00FF66]">{userProfile.planName}</strong>
                    {userProfile.planSlug === 'premium' && (
                      <span className="ml-2 text-white font-bold">· Downloads ilimitados</span>
                    )}
                  </div>
                </div>
              </div>

              {/* 6 Dashboard Action Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl bg-[#0A0E0C] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <FileText className="w-6 h-6 text-[#00FF66] mb-3" />
                    <h3 className="text-base font-extrabold text-white">Meus currículos</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {resumes.length} currículo(s) guardados com salvamento automático.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav('editor')}
                    className="text-xs font-bold text-[#00FF66] hover:underline text-left cursor-pointer"
                  >
                    Abrir Editor →
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A0E0C] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <Sparkles className="w-6 h-6 text-[#00FF66] mb-3" />
                    <h3 className="text-base font-extrabold text-white">Criar currículo</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Gere um novo currículo adaptado a uma nova vaga em segundos.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav('creator')}
                    className="text-xs font-bold text-[#00FF66] hover:underline text-left cursor-pointer"
                  >
                    Criar Novo com IA →
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A0E0C] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <Layers className="w-6 h-6 text-[#00FF66] mb-3" />
                    <h3 className="text-base font-extrabold text-white">Modelos</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      7 modelos executivos, modernos e minimalistas prontos a usar.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveNav('templates')}
                    className="text-xs font-bold text-[#00FF66] hover:underline text-left cursor-pointer"
                  >
                    Explorar Modelos →
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A0E0C] border border-[#00FF66]/40 flex flex-col justify-between space-y-4">
                  <div>
                    <CreditCard className="w-6 h-6 text-[#00FF66] mb-3" />
                    <h3 className="text-base font-extrabold text-white">Meu plano</h3>
                    <p className="text-xs text-slate-300 mt-1 font-semibold">
                      {userProfile.planName}
                    </p>
                    {userProfile.planSlug === 'premium' && (
                      <p className="text-xs text-[#00FF66] font-extrabold mt-1">
                        Downloads ilimitados · PDF ilimitado
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveNav('pricing')}
                    className="text-xs font-bold text-[#00FF66] hover:underline text-left cursor-pointer"
                  >
                    Ver Planos & Preços →
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A0E0C] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <Download className="w-6 h-6 text-[#00FF66] mb-3" />
                    <h3 className="text-base font-extrabold text-white">Downloads</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {userProfile.downloadsCount} exportações PDF realizadas.
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadPdf(currentResume)}
                    className="text-xs font-bold text-[#00FF66] hover:underline text-left cursor-pointer"
                  >
                    Baixar Currículo Atual em PDF →
                  </button>
                </div>

                <div className="p-6 rounded-2xl bg-[#0A0E0C] border border-white/10 flex flex-col justify-between space-y-4">
                  <div>
                    <Settings className="w-6 h-6 text-[#00FF66] mb-3" />
                    <h3 className="text-base font-extrabold text-white">Configurações</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      {userProfile.email} · {userProfile.phone}
                    </p>
                  </div>
                  <span className="text-xs text-emerald-400 font-semibold">
                    Conta sincronizada
                  </span>
                </div>
              </div>

              {/* Saved Resumes List (Edit, Duplicate, Delete, Change Template, Download PDF) */}
              <div className="rounded-2xl bg-[#0A0E0C] border border-white/10 p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-extrabold text-white">
                    Meus Currículos Guardados
                  </h3>
                  <button
                    onClick={() => setActiveNav('creator')}
                    className="px-4 py-2 rounded-xl bg-[#00FF66] text-[#050505] text-xs font-extrabold cursor-pointer"
                  >
                    + Criar Currículo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resumes.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 rounded-xl bg-[#050706] border border-white/10 flex flex-col justify-between gap-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-extrabold text-white">{doc.title}</h4>
                          <p className="text-xs text-[#00FF66] font-semibold">{doc.role}</p>
                          <p className="text-[11px] text-slate-400 font-mono-tabular mt-1">
                            Atualizado em: {doc.updatedAt}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => {
                            setCurrentResumeId(doc.id);
                            setActiveNav('editor');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDuplicateResume(doc)}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 cursor-pointer"
                        >
                          Duplicar
                        </button>
                        <button
                          onClick={() => handleDownloadPdf(doc)}
                          className="px-3 py-1.5 rounded-lg bg-[#00FF66]/20 hover:bg-[#00FF66]/30 text-xs font-bold text-[#00FF66] cursor-pointer"
                        >
                          Baixar PDF
                        </button>
                        {resumes.length > 1 && (
                          <button
                            onClick={() => handleDeleteResume(doc.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs text-red-300 cursor-pointer"
                          >
                            Excluir
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* VIEW 8: ÁREA ADMINISTRATIVA (CVPRO ADM) */}
        {/* ========================================================= */}
        {activeNav === 'admin' && (
          <section className="py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold text-[#00FF66]">PAINEL ADMINISTRATIVO SAAAS</p>
                  <h2 className="text-2xl font-extrabold text-white mt-1">
                    Gestão CVPro Angola
                  </h2>
                </div>
              </div>

              {/* Statistics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-[#0A0E0C] border border-white/10">
                  <p className="text-xs text-slate-400">Usuários Registados</p>
                  <p className="text-2xl font-extrabold text-white font-mono-tabular mt-1">
                    {serverData?.users?.length || 2}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0A0E0C] border border-white/10">
                  <p className="text-xs text-slate-400">Currículos Gerados com IA</p>
                  <p className="text-2xl font-extrabold text-[#00FF66] font-mono-tabular mt-1">
                    {serverData?.resumesCreatedTotal || 14}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0A0E0C] border border-white/10">
                  <p className="text-xs text-slate-400">Modelos Ativos</p>
                  <p className="text-2xl font-extrabold text-white font-mono-tabular mt-1">
                    {templates.filter((t: any) => t.active !== false).length}
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-[#0A0E0C] border border-white/10">
                  <p className="text-xs text-slate-400">Pagamentos Registados</p>
                  <p className="text-2xl font-extrabold text-white font-mono-tabular mt-1">
                    {serverData?.payments?.length || 2}
                  </p>
                </div>
              </div>

              {/* Manage Plan Prices in Kz */}
              <div className="rounded-2xl bg-[#0A0E0C] border border-white/10 p-6 space-y-4">
                <h3 className="text-base font-extrabold text-white">
                  Gerenciar Planos e Alterar Preços (Kz / AOA)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {plans.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-4 rounded-xl bg-[#050706] border border-white/10 space-y-3"
                    >
                      <p className="text-sm font-extrabold text-white">{p.name}</p>
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          Preço em Kz
                        </label>
                        <input
                          type="number"
                          value={editingPlanPrices[p.id] ?? p.priceKz}
                          onChange={(e) =>
                            setEditingPlanPrices({
                              ...editingPlanPrices,
                              [p.id]: Number(e.target.value),
                            })
                          }
                          className="w-full px-3 py-2 rounded-lg bg-[#0A0E0C] border border-white/15 text-sm text-[#00FF66] font-bold font-mono-tabular"
                        />
                      </div>
                      <button
                        onClick={() => handleAdminUpdatePlanPrice(p.id)}
                        className="w-full py-2 rounded-lg bg-[#00FF66] text-[#050505] text-xs font-extrabold cursor-pointer"
                      >
                        Atualizar Preço
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payments Verification Table */}
              <div className="rounded-2xl bg-[#0A0E0C] border border-white/10 p-6 space-y-4">
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    Ver Pagamentos & Confirmar Liberação de Planos
                  </h3>
                  <p className="text-xs text-slate-400">
                    Os planos só são liberados após confirmação real do pagamento.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="py-3 px-4">REF</th>
                        <th className="py-3 px-4">USUÁRIO</th>
                        <th className="py-3 px-4">PLANO</th>
                        <th className="py-3 px-4 text-right">VALOR</th>
                        <th className="py-3 px-4">MÉTODO / COMPROVATIVO</th>
                        <th className="py-3 px-4">ESTADO</th>
                        <th className="py-3 px-4 text-right">AÇÃO ADM</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {(serverData?.payments || []).map((pay: any) => (
                        <tr key={pay.id}>
                          <td className="py-3 px-4 font-mono-tabular font-bold text-[#00FF66]">
                            {pay.referenceCode}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-bold text-white">{pay.userName}</p>
                            <p className="text-slate-400 font-mono-tabular">{pay.userPhone}</p>
                          </td>
                          <td className="py-3 px-4 font-semibold text-white">{pay.planName}</td>
                          <td className="py-3 px-4 text-right font-mono-tabular font-bold text-[#00FF66]">
                            {formatKzAmount(pay.amountKz)}
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-slate-300">
                            {pay.method} · {pay.transactionRef}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`font-bold ${
                                pay.status === 'Confirmado'
                                  ? 'text-[#00FF66]'
                                  : pay.status === 'Recusado'
                                  ? 'text-red-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {pay.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <div className="inline-flex gap-2">
                              <button
                                onClick={() => handleAdminConfirmPayment(pay.id, 'Confirmado')}
                                className="px-3 py-1.5 rounded-lg bg-[#00FF66] text-[#050505] font-extrabold cursor-pointer"
                              >
                                Confirmar & Liberar Plano
                              </button>
                              <button
                                onClick={() => handleAdminConfirmPayment(pay.id, 'Recusado')}
                                className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 font-semibold cursor-pointer"
                              >
                                Recusar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* ========================================================= */}
      {/* MODAL: PREVIEW TEMPLATE */}
      {/* ========================================================= */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl bg-[#0A0E0C] border border-[#00FF66]/40 p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-[#00FF66]">
                  {previewTemplate.category}
                </span>
                <h3 className="text-lg font-extrabold text-white">{previewTemplate.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    updateCurrentResume({
                      templateId: previewTemplate.id,
                      accentColor: previewTemplate.accentColor,
                    });
                    setPreviewTemplate(null);
                    setActiveNav('editor');
                  }}
                  className="px-4 py-2 rounded-xl bg-[#00FF66] text-[#050505] text-xs font-extrabold cursor-pointer"
                >
                  Usar este modelo
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="p-2 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="max-h-[75vh] overflow-y-auto">
              {renderResumeSheet({
                ...currentResume,
                templateId: previewTemplate.id,
                accentColor: previewTemplate.accentColor,
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PLAN PAYMENT CHECKOUT (ANGOLA KZ) */}
      {/* ========================================================= */}
      {selectedPlanForPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0A0E0C] border border-[#00FF66]/40 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <span className="text-xs font-bold text-[#00FF66]">PAGAMENTO EM KWANZAS (AOA)</span>
                <h3 className="text-lg font-extrabold text-white">
                  Plano {selectedPlanForPurchase.name} —{' '}
                  {formatKzAmount(selectedPlanForPurchase.priceKz)}
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlanForPurchase(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {paymentSubmittedMsg ? (
              <div className="space-y-4 text-center py-3">
                <Clock className="w-12 h-12 text-[#00FF66] mx-auto" />
                <p className="text-sm font-bold text-white leading-relaxed">
                  {paymentSubmittedMsg}
                </p>
                <button
                  onClick={() => setSelectedPlanForPurchase(null)}
                  className="w-full py-3 rounded-xl bg-[#00FF66] text-[#050505] text-xs font-extrabold cursor-pointer"
                >
                  Entendi
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitPlanPayment} className="space-y-4 text-xs">
                <div className="p-3.5 rounded-xl bg-[#050706] border border-white/10 space-y-1.5">
                  <p className="text-slate-300">
                    Conta para transferência (Express / PayPay / Unitel Money):
                  </p>
                  <p className="text-sm font-extrabold text-[#00FF66] font-mono-tabular">
                    934 413 108 — Vicente (Ref PayPay: 10116 · Unitel: 00930)
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Seu Nome *</label>
                  <input
                    type="text"
                    required
                    value={userProfile.name}
                    onChange={(e) => setUserProfile({ ...userProfile, name: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Seu Telefone *</label>
                  <input
                    type="text"
                    required
                    value={userProfile.phone}
                    onChange={(e) => setUserProfile({ ...userProfile, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-white font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Método utilizado</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['EXPRESS', 'PAYPAY', 'UNITEL MONEY'] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPayMethod(m)}
                        className={`py-2 rounded-lg border font-bold cursor-pointer ${
                          payMethod === m
                            ? 'bg-[#00FF66] text-[#050505] border-[#00FF66]'
                            : 'bg-[#050706] text-slate-300 border-white/10'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">
                    Nº do Comprovativo / Referência da Operação *
                  </label>
                  <input
                    type="text"
                    required
                    value={payRefInput}
                    onChange={(e) => setPayRefInput(e.target.value)}
                    placeholder="Ex: Comprovativo Express enviado"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#050706] border border-white/15 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#00FF66] hover:bg-[#00E55C] text-[#050505] font-extrabold text-xs cursor-pointer"
                >
                  CONFIRMAR ENVIO DO PAGAMENTO ({formatKzAmount(selectedPlanForPurchase.priceKz)})
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-white/10 py-8 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            <strong className="text-white">CVPro Angola</strong> — Do zero ao currículo
            profissional em segundos.
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://wa.me/244934413108"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00FF66] font-bold hover:underline"
            >
              Suporte WhatsApp: 934 413 108
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
