import { nanoid } from 'nanoid';
import type {
  Company,
  DocumentType,
  ChecklistTemplate,
  ProductionDocument,
  ProductionChecklistItem,
  AppSettings,
} from '../types';

const now = () => new Date().toISOString();

// ─── Companies ────────────────────────────────────────────────
export const SEED_COMPANIES: Company[] = [
  {
    id: 'comp-1', name: 'PENA FLORESTAL', cnpj: '12.345.678/0001-90',
    city: 'Santarém', state: 'PA', contactName: 'Carlos Pena',
    phone: '(93) 98765-4321', email: 'carlos@penaflorestal.com.br',
    status: 'active', notes: 'Empresa do setor madeireiro.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: 'comp-2', name: 'J. L. TRANSPORTES', cnpj: '23.456.789/0001-01',
    city: 'Belém', state: 'PA', contactName: 'José Lima',
    phone: '(91) 99876-5432', email: 'jose@jltransportes.com.br',
    status: 'active', notes: 'Frota de 45 veículos.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: 'comp-3', name: 'LAR BRASIL', cnpj: '34.567.890/0001-12',
    city: 'Manaus', state: 'AM', contactName: 'Ana Souza',
    phone: '(92) 98654-3210', email: 'ana@larbrasil.com.br',
    status: 'active', notes: 'Rede de varejo doméstico.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: 'comp-4', name: 'ARATI', cnpj: '45.678.901/0001-23',
    city: 'Santarém', state: 'PA', contactName: 'Paulo Arati',
    phone: '(93) 97654-3210', email: 'paulo@arati.com.br',
    status: 'active', notes: 'Indústria de alimentos.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: 'comp-5', name: 'RIBEIRO', cnpj: '56.789.012/0001-34',
    city: 'Itaituba', state: 'PA', contactName: 'Marcos Ribeiro',
    phone: '(93) 96543-2109', email: 'marcos@ribeiro.com.br',
    status: 'active', notes: 'Comércio atacadista.',
    createdAt: now(), updatedAt: now(),
  },
  {
    id: 'comp-6', name: 'RIO TAPAJÓS SHOPPING', cnpj: '67.890.123/0001-45',
    city: 'Santarém', state: 'PA', contactName: 'Fernanda Costa',
    phone: '(93) 95432-1098', email: 'fernanda@riotapajos.com.br',
    status: 'active', notes: 'Centro comercial com 120 lojas.',
    createdAt: now(), updatedAt: now(),
  },
];

// ─── Document Types ───────────────────────────────────────────
export const SEED_DOCUMENT_TYPES: DocumentType[] = [
  { id: 'doc-1', name: 'Programa de Gerenciamento de Riscos', acronym: 'PGR', category: 'Gestão de Riscos', description: 'Documento que identifica, avalia e controla os riscos ocupacionais.', periodicity: 'Anual', defaultResponsible: 'Dr. Ricardo Alves', status: 'active', createdAt: now(), updatedAt: now() },
  { id: 'doc-2', name: 'Laudo Técnico das Condições Ambientais de Trabalho', acronym: 'LTCAT', category: 'Previdenciário', description: 'Avalia a exposição dos trabalhadores a agentes nocivos.', periodicity: 'Bienal', defaultResponsible: 'Eng. Maria Santos', status: 'active', createdAt: now(), updatedAt: now() },
  { id: 'doc-3', name: 'Programa de Controle Médico de Saúde Ocupacional', acronym: 'PCMSO', category: 'Saúde Ocupacional', description: 'Programa médico de prevenção e acompanhamento da saúde dos trabalhadores.', periodicity: 'Anual', defaultResponsible: 'Dr. Ricardo Alves', status: 'active', createdAt: now(), updatedAt: now() },
  { id: 'doc-4', name: 'Laudo de Insalubridade e Periculosidade', acronym: 'LIP', category: 'Laudo Técnico', description: 'Avalia o direito a adicionais de insalubridade e periculosidade.', periodicity: 'Bienal', defaultResponsible: 'Eng. Maria Santos', status: 'active', createdAt: now(), updatedAt: now() },
  { id: 'doc-5', name: 'Análise Ergonômica do Trabalho', acronym: 'AET', category: 'Ergonomia', description: 'Análise das condições ergonômicas dos postos de trabalho.', periodicity: 'Bienal', defaultResponsible: 'Esp. Carla Mendes', status: 'active', createdAt: now(), updatedAt: now() },
  { id: 'doc-6', name: 'Plano de Emergência e Controle de Incêndio', acronym: 'PECI', category: 'Emergência', description: 'Planejamento de ações de prevenção, combate a incêndio e evacuação.', periodicity: 'Anual', defaultResponsible: 'Tec. João Ferreira', status: 'active', createdAt: now(), updatedAt: now() },
];

// ─── Checklist Templates ──────────────────────────────────────
const makeTemplate = (
  docId: string,
  items: { stage: string; description: string; weight?: number; isRequired?: boolean }[]
): ChecklistTemplate[] =>
  items.map((item, i) => ({
    id: nanoid(),
    documentTypeId: docId,
    stage: item.stage,
    description: item.description,
    order: i + 1,
    weight: item.weight ?? 1,
    isRequired: item.isRequired ?? true,
    status: 'active' as const,
    observations: '',
    createdAt: now(),
    updatedAt: now(),
  }));

export const SEED_CHECKLIST_TEMPLATES: ChecklistTemplate[] = [
  // PGR
  ...makeTemplate('doc-1', [
    { stage: 'Coleta de Dados', description: 'Solicitar dados cadastrais da empresa' },
    { stage: 'Coleta de Dados', description: 'Levantar setores e funções' },
    { stage: 'Coleta de Dados', description: 'Identificar GHEs ou grupos similares de exposição' },
    { stage: 'Levantamento', description: 'Levantar atividades executadas por função' },
    { stage: 'Análise', description: 'Identificar perigos e riscos ocupacionais' },
    { stage: 'Análise', description: 'Avaliar severidade e probabilidade dos riscos', weight: 2 },
    { stage: 'Análise', description: 'Classificar níveis de risco', weight: 2 },
    { stage: 'Elaboração', description: 'Elaborar inventário de riscos', weight: 2 },
    { stage: 'Elaboração', description: 'Elaborar plano de ação', weight: 2 },
    { stage: 'Integração', description: 'Integrar informações com PCMSO' },
    { stage: 'Revisão', description: 'Revisar conformidade com NR-01', weight: 2 },
    { stage: 'Revisão', description: 'Realizar validação técnica' },
    { stage: 'Emissão', description: 'Emitir documento final' },
    { stage: 'Entrega', description: 'Enviar ao cliente' },
  ]),
  // LTCAT
  ...makeTemplate('doc-2', [
    { stage: 'Coleta de Dados', description: 'Solicitar dados cadastrais da empresa' },
    { stage: 'Coleta de Dados', description: 'Levantar cargos, funções e setores' },
    { stage: 'Levantamento', description: 'Identificar agentes nocivos presentes' },
    { stage: 'Avaliação', description: 'Avaliar exposição ocupacional aos agentes', weight: 2 },
    { stage: 'Avaliação', description: 'Verificar fontes geradoras dos agentes' },
    { stage: 'Avaliação', description: 'Verificar medidas de controle existentes' },
    { stage: 'Avaliação', description: 'Analisar EPI e EPC utilizados' },
    { stage: 'Análise Legal', description: 'Verificar enquadramento previdenciário', weight: 2 },
    { stage: 'Análise Legal', description: 'Avaliar exposição conforme Decreto 3.048/1999', weight: 2 },
    { stage: 'Elaboração', description: 'Elaborar parecer técnico conclusivo' },
    { stage: 'Revisão', description: 'Revisar conclusão sobre aposentadoria especial', weight: 2 },
    { stage: 'Emissão', description: 'Emitir documento final' },
    { stage: 'Entrega', description: 'Enviar ao cliente' },
  ]),
  // PCMSO
  ...makeTemplate('doc-3', [
    { stage: 'Coleta de Dados', description: 'Solicitar dados da empresa' },
    { stage: 'Análise', description: 'Analisar PGR ou inventário de riscos' },
    { stage: 'Levantamento', description: 'Levantar cargos e funções existentes' },
    { stage: 'Planejamento', description: 'Definir exames ocupacionais por função', weight: 2 },
    { stage: 'Planejamento', description: 'Definir periodicidade dos exames', weight: 2 },
    { stage: 'Planejamento', description: 'Validar exames complementares necessários' },
    { stage: 'Revisão', description: 'Revisar critérios da NR-07', weight: 2 },
    { stage: 'Elaboração', description: 'Elaborar planejamento médico anual' },
    { stage: 'Elaboração', description: 'Revisar relatório analítico (quando aplicável)', isRequired: false },
    { stage: 'Validação', description: 'Validar com médico responsável', weight: 2 },
    { stage: 'Emissão', description: 'Emitir documento final' },
    { stage: 'Entrega', description: 'Enviar ao cliente' },
  ]),
  // LIP
  ...makeTemplate('doc-4', [
    { stage: 'Coleta de Dados', description: 'Solicitar dados da empresa' },
    { stage: 'Levantamento', description: 'Levantar funções e atividades' },
    { stage: 'Avaliação', description: 'Identificar exposição a agentes insalubres', weight: 2 },
    { stage: 'Avaliação', description: 'Identificar exposição a agentes perigosos', weight: 2 },
    { stage: 'Análise Legal', description: 'Avaliar critérios da NR-15 (Insalubridade)', weight: 2 },
    { stage: 'Análise Legal', description: 'Avaliar critérios da NR-16 (Periculosidade)', weight: 2 },
    { stage: 'Análise Legal', description: 'Verificar habitualidade e intermitência' },
    { stage: 'Avaliação', description: 'Analisar medidas de controle existentes' },
    { stage: 'Avaliação', description: 'Verificar EPI e EPC utilizados' },
    { stage: 'Elaboração', description: 'Elaborar parecer técnico' },
    { stage: 'Revisão', description: 'Revisar enquadramento legal final' },
    { stage: 'Emissão', description: 'Emitir documento final' },
    { stage: 'Entrega', description: 'Enviar ao cliente' },
  ]),
  // AET
  ...makeTemplate('doc-5', [
    { stage: 'Coleta de Dados', description: 'Solicitar dados da empresa' },
    { stage: 'Levantamento', description: 'Levantar setores avaliados' },
    { stage: 'Levantamento', description: 'Levantar funções avaliadas' },
    { stage: 'Análise', description: 'Realizar análise da demanda ergonômica', weight: 2 },
    { stage: 'Análise', description: 'Avaliar organização do trabalho', weight: 2 },
    { stage: 'Análise', description: 'Avaliar mobiliário e equipamentos' },
    { stage: 'Análise', description: 'Avaliar posturas e movimentos', weight: 2 },
    { stage: 'Ferramentas', description: 'Aplicar ferramentas ergonômicas (RULA, OWAS, etc.)', isRequired: false, weight: 2 },
    { stage: 'Análise', description: 'Avaliar fatores ambientais (iluminação, ruído, temperatura)' },
    { stage: 'Diagnóstico', description: 'Identificar riscos ergonômicos', weight: 2 },
    { stage: 'Diagnóstico', description: 'Elaborar diagnóstico ergonômico' },
    { stage: 'Recomendações', description: 'Elaborar recomendações técnicas', weight: 2 },
    { stage: 'Recomendações', description: 'Criar plano de ação ergonômico' },
    { stage: 'Revisão', description: 'Revisar conformidade com NR-17', weight: 2 },
    { stage: 'Emissão', description: 'Emitir documento final' },
    { stage: 'Entrega', description: 'Enviar ao cliente' },
  ]),
  // PECI
  ...makeTemplate('doc-6', [
    { stage: 'Coleta de Dados', description: 'Solicitar dados cadastrais e plantas da empresa' },
    { stage: 'Levantamento', description: 'Levantar layout, áreas e rotas de circulação' },
    { stage: 'Levantamento', description: 'Identificar pontos de risco de incêndio' },
    { stage: 'Levantamento', description: 'Inventariar equipamentos de combate a incêndio' },
    { stage: 'Levantamento', description: 'Levantar população fixa e flutuante' },
    { stage: 'Análise', description: 'Avaliar classes de incêndio predominantes', weight: 2 },
    { stage: 'Análise', description: 'Avaliar tempos de evacuação e rotas de fuga', weight: 2 },
    { stage: 'Análise', description: 'Identificar necessidades de treinamento de brigada' },
    { stage: 'Planejamento', description: 'Definir composição da brigada de incêndio', weight: 2 },
    { stage: 'Planejamento', description: 'Elaborar procedimentos de emergência' },
    { stage: 'Planejamento', description: 'Definir ponto de encontro e fluxo de evacuação' },
    { stage: 'Elaboração', description: 'Elaborar plantas de emergência e simbologia' },
    { stage: 'Elaboração', description: 'Elaborar plano de emergência final' },
    { stage: 'Revisão', description: 'Revisar conformidade com NR-23 e IT do CBM', weight: 2 },
    { stage: 'Emissão', description: 'Emitir documento final' },
    { stage: 'Entrega', description: 'Enviar ao cliente' },
  ]),
];

// ─── Production Documents (sample data) ──────────────────────
export const SEED_PRODUCTIONS: ProductionDocument[] = [];

// ─── Checklist items for sample productions ──────────────────
export const generateSeedChecklistItems = (): ProductionChecklistItem[] => [];

// ─── Settings ─────────────────────────────────────────────────
export const SEED_SETTINGS: AppSettings = {
  responsibles: [
    { id: 'resp-1', name: 'Eng. Maria Santos', role: 'Engenheira de Segurança', email: 'maria@sstdocpro.com.br', status: 'active' },
    { id: 'resp-2', name: 'Dr. Ricardo Alves', role: 'Médico do Trabalho', email: 'ricardo@sstdocpro.com.br', status: 'active' },
    { id: 'resp-3', name: 'Esp. Carla Mendes', role: 'Especialista em Ergonomia', email: 'carla@sstdocpro.com.br', status: 'active' },
    { id: 'resp-4', name: 'Tec. João Ferreira', role: 'Técnico de Segurança', email: 'joao@sstdocpro.com.br', status: 'active' },
  ],
  categories: ['Gestão de Riscos', 'Saúde Ocupacional', 'Previdenciário', 'Ergonomia', 'Laudo Técnico', 'Treinamento', 'Inspeção', 'Emergência', 'Segurança Operacional'],
  periodicities: ['Mensal', 'Trimestral', 'Semestral', 'Anual', 'Bienal', 'Admissional/Anual', 'Conforme NR', 'Por atividade', 'Conforme demanda', 'Contínuo'],
};
