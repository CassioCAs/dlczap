import { callBackend } from '@/blink/backend'
export type GeneratedAgentConfig = {
  nome_agente: string;
  nome_empresa: string;
  segmento: string;
  regiao_horario: string;
  descricao_negocio: string;
  diferenciais: string;
  publico_alvo: string;
  sobre_empresa: string;
  produtos_servicos: string;
  papel_objetivo: string;
  estilo_comunicacao: string;
  apresentacao: string;
  ofertas: string;
  como_vender: string;
  objecoes: string;
  formas_pagamento: string;
  faq: string;
  politicas: string;
  posvenda_msg: string;
  pode_fazer: string;
  nao_pode_fazer: string;
};
export type BriefQuestion = {
  id: string;            // chave estável (ex: "produtos_precos")
  pergunta: string;      // pergunta curta, linguagem leiga
  porque: string;        // por que isso importa (1 frase)
  exemplo: string;       // exemplo concreto pra destravar o usuário
  campo: keyof GeneratedAgentConfig | "extra";
  obrigatoria: boolean;
};
export type BriefAnalysis = {
  pronto: boolean;                 // true se já dá pra gerar com qualidade
  resumo: string;                  // resumo de 1-2 linhas do que entendeu
  cobertura: number;               // 0-100
  perguntas: BriefQuestion[];      // perguntas críticas pendentes (máx 6)
};
export const analyzeBusinessBrief = (args:any={}) => callBackend('/api/rpc', {module:"src/lib/agent-ai.functions", name:"analyzeBusinessBrief",data:args.data})
export const generateAgentConfig = (args:any={}) => callBackend('/api/rpc', {module:"src/lib/agent-ai.functions", name:"generateAgentConfig",data:args.data})
