// server/native/domain.ts
import * as external0 from "qrcode";
import * as external1 from "buffer";
import * as external2 from "@noble/hashes/sha2.js";
import * as external3 from "@noble/hashes/hmac.js";
var publicRoutes = { "/api/public/google-callback": "src/routes/api/public/google-callback", "/api/public/whatsapp-webhook": "src/routes/api/public/whatsapp-webhook", "/api/public/billing/webhook": "src/routes/api/public/billing/webhook", "/api/public/hooks/process-campaigns": "src/routes/api/public/hooks/process-campaigns", "/api/public/v1/$": "src/routes/api/public/v1/$" };
var rpcAllowlist = { "src/lib/agent-ai.functions": ["analyzeBusinessBrief", "generateAgentConfig"], "src/lib/billing.functions": ["getBillingWebhookInfo", "listRecentBillingEvents"], "src/lib/campaigns.functions": ["listCampaigns", "getCampaign", "listAvailableTags", "previewAudience", "saveCampaign", "deleteCampaign", "startCampaign", "pauseCampaign", "cancelCampaign"], "src/lib/checkout.functions": ["createCheckoutCompany"], "src/lib/credits.functions": ["getMyCredits", "adminGrantCredits"], "src/lib/csat.functions": ["sendCsat", "submitCsat", "getCsatByToken"], "src/lib/evolution.functions": ["connectWhatsapp", "checkWhatsappStatus", "disconnectWhatsapp", "sendWhatsappText", "setContactIaActive", "testAiReply"], "src/lib/financeiro.functions": ["enableFinanceiro", "finKpis", "listLancamentos", "listCategorias", "upsertLancamento", "marcarPago", "deleteLancamento", "upsertCategoria", "deleteCategoria", "finStatus"], "src/lib/google.functions": ["startGoogleOAuth", "disconnectGoogle", "createGoogleCalendarEvent"], "src/lib/integrations.functions": ["listWebhooks", "saveWebhook", "deleteWebhook", "listWebhookLogs", "listApiTokens", "createApiToken", "revokeApiToken"], "src/lib/master.functions": ["masterKpis", "listMasterSubscriptions", "listCompanies", "suspendCompany", "extendTrial", "createCompanyWithOwner", "listPlansBasic", "getSuperAdminEmails", "setSuperAdminEmails", "resetCompanyOwnerPassword", "getCompanyDetails"], "src/lib/plan.functions": ["getPlanUsage", "createContact", "importContacts"], "src/lib/security.functions": ["listAuditLog", "exportLgpd"], "src/lib/team.functions": ["listTeam", "inviteMember", "setMemberActive", "setMemberRole"], "src/lib/templates.functions": ["listTemplates", "saveTemplate", "deleteTemplate", "saveBusinessHours", "getBusinessHours"] };
var factories = {
  "src/lib/agent-ai.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.generateAgentConfig = exports.analyzeBusinessBrief = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    const FIELDS = [
      "nome_agente",
      "nome_empresa",
      "segmento",
      "regiao_horario",
      "descricao_negocio",
      "diferenciais",
      "publico_alvo",
      "sobre_empresa",
      "produtos_servicos",
      "papel_objetivo",
      "estilo_comunicacao",
      "apresentacao",
      "ofertas",
      "como_vender",
      "objecoes",
      "formas_pagamento",
      "faq",
      "politicas",
      "posvenda_msg",
      "pode_fazer",
      "nao_pode_fazer"
    ];
    function extractJson(raw) {
      const trimmed = (raw || "").trim().replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "");
      try {
        return JSON.parse(trimmed);
      } catch {
      }
      const m = trimmed.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          return JSON.parse(m[0]);
        } catch {
        }
      }
      throw new Error("A IA n\xE3o retornou JSON v\xE1lido. Tente novamente.");
    }
    exports.analyzeBusinessBrief = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const desc = (d?.descricao || "").trim();
      if (desc.length < 10)
        throw new Error("Conte um pouco mais sobre o neg\xF3cio.");
      return {
        descricao: desc.slice(0, 8e3),
        respostas: d?.respostas && typeof d.respostas === "object" ? d.respostas : {}
      };
    }).handler(async ({ data }) => {
      const { lovableAiChat } = await Promise.resolve().then(() => __importStar(require2("src/lib/lovable-ai.server")));
      const respostasTxt = Object.entries(data.respostas).filter(([, v]) => v && String(v).trim()).map(([k, v]) => `- ${k}: ${v}`).join("\n");
      const system = `Voc\xEA \xE9 um Product Manager s\xEAnior + consultor de vendas, especialista em montar agentes de WhatsApp para pequenos neg\xF3cios brasileiros (donos leigos, topo de funil).

Sua tarefa: ANALISAR a descri\xE7\xE3o do neg\xF3cio e identificar o que FALTA para um agente atender bem sem dar respostas tortas.

Pense como PRD: o agente precisa saber NO M\xCDNIMO:
1) O que vende (produtos/servi\xE7os com pre\xE7o ou faixa de pre\xE7o)
2) Como o cliente recebe/recebe atendimento (entrega, retirada, agendamento, online)
3) Regi\xE3o e hor\xE1rio de atendimento
4) Formas de pagamento
5) Pol\xEDtica b\xE1sica (troca, cancelamento, garantia)
6) O que o agente N\xC3O pode prometer/fazer
7) Diferencial / motivo pra comprar dali
8) Pr\xF3ximo passo da venda (agendar? pedir endere\xE7o? enviar link?)

REGRAS DAS PERGUNTAS:
- Fa\xE7a NO M\xC1XIMO 6 perguntas \u2014 s\xF3 as CR\xCDTICAS que faltam.
- Linguagem de gente, n\xE3o de formul\xE1rio. O dono \xE9 leigo, topo de funil.
- Cada pergunta tem um EXEMPLO concreto, plaus\xEDvel pro segmento dele, pra destravar.
- NUNCA pergunte coisa que j\xE1 est\xE1 clara na descri\xE7\xE3o ou nas respostas anteriores.
- Se o neg\xF3cio \xE9 simples e j\xE1 tem o essencial (produtos + como vender + regi\xE3o OU hor\xE1rio), marque "pronto: true" e devolva perguntas: [].
- Se faltar pouco mas cr\xEDtico (ex: pre\xE7os, formas de pagamento), marque "pronto: false".

Responda APENAS JSON v\xE1lido neste formato:
{
  "pronto": boolean,
  "resumo": "string curta do que entendeu do neg\xF3cio",
  "cobertura": number,   // 0-100, quanto da info essencial j\xE1 temos
  "perguntas": [
    {
      "id": "snake_case_estavel",
      "pergunta": "pergunta curta em PT-BR",
      "porque": "1 frase de por que isso importa pro atendimento",
      "exemplo": "exemplo concreto e espec\xEDfico pro segmento",
      "campo": "uma das chaves: nome_empresa|segmento|regiao_horario|produtos_servicos|formas_pagamento|politicas|diferenciais|publico_alvo|como_vender|nao_pode_fazer|ofertas|extra",
      "obrigatoria": boolean
    }
  ]
}`;
      const user = `DESCRI\xC7\xC3O DO NEG\xD3CIO:
${data.descricao}

${respostasTxt ? `RESPOSTAS J\xC1 DADAS PELO DONO:
${respostasTxt}` : ""}

Analise e devolva o JSON.`;
      const raw = await lovableAiChat([
        { role: "system", content: system },
        { role: "user", content: user }
      ], { provider: "gemini", model: "google/gemini-2.5-flash" });
      const parsed = extractJson(raw);
      const perguntas = Array.isArray(parsed?.perguntas) ? parsed.perguntas.slice(0, 6).map((q, i) => ({
        id: String(q?.id || `q_${i}`).slice(0, 60),
        pergunta: String(q?.pergunta || "").slice(0, 240),
        porque: String(q?.porque || "").slice(0, 240),
        exemplo: String(q?.exemplo || "").slice(0, 320),
        campo: typeof q?.campo === "string" ? q.campo : "extra",
        obrigatoria: !!q?.obrigatoria
      })).filter((q) => q.pergunta) : [];
      const analysis = {
        pronto: !!parsed?.pronto && perguntas.filter((p) => p.obrigatoria).length === 0,
        resumo: String(parsed?.resumo || "").slice(0, 400),
        cobertura: Math.max(0, Math.min(100, Number(parsed?.cobertura) || 0)),
        perguntas
      };
      return analysis;
    });
    exports.generateAgentConfig = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      if (!d?.descricao || d.descricao.trim().length < 20) {
        throw new Error("Descreva seu neg\xF3cio com pelo menos algumas frases (m\xEDn. 20 caracteres).");
      }
      return {
        descricao: d.descricao.trim().slice(0, 8e3),
        respostas: d?.respostas && typeof d.respostas === "object" ? d.respostas : {}
      };
    }).handler(async ({ data }) => {
      const { lovableAiChat } = await Promise.resolve().then(() => __importStar(require2("src/lib/lovable-ai.server")));
      const { buildSystemPrompt } = await Promise.resolve().then(() => __importStar(require2("src/lib/ai-prompt")));
      const respostasTxt = Object.entries(data.respostas).filter(([, v]) => v && String(v).trim()).map(([k, v]) => `- ${k}: ${v}`).join("\n");
      const system = `Voc\xEA \xE9 um Product Manager s\xEAnior + copywriter de vendas, montando um AGENTE DE WHATSAPP para um pequeno neg\xF3cio brasileiro.

Voc\xEA recebe: (1) descri\xE7\xE3o livre do dono (leigo) e (2) respostas dele para perguntas espec\xEDficas.
Sua tarefa: gerar a configura\xE7\xE3o COMPLETA do agente, no padr\xE3o de um PRD enxuto e ACION\xC1VEL \u2014 nada gen\xE9rico, nada "bl\xE1-bl\xE1 de IA".

Responda APENAS com JSON v\xE1lido (sem markdown), com EXATAMENTE estas chaves (todas strings, PT-BR):
${FIELDS.map((f) => `- ${f}`).join("\n")}

DIRETRIZES (siga \xE0 risca):
- "nome_agente": curto, humano, brasileiro (ex: Lia, Bia, Tom, Rafa). N\xE3o use "Assistente", "Bot", "IA".
- "papel_objetivo": 1-2 frases. O QUE o agente faz e PRA QUE (qualificar, vender, agendar).
- "estilo_comunicacao": tom espec\xEDfico pro segmento (ex: padaria de bairro = caloroso e direto; cl\xEDnica = cordial e seguro).
- "apresentacao": 1\xAA mensagem real que o agente envia. Curta, humana, 1 emoji s\xF3 se combinar. Nada de "Ol\xE1! Como posso ajud\xE1-lo hoje?".
- "sobre_empresa": par\xE1grafo curto que o agente pode usar quando o cliente perguntar "quem \xE9 voc\xEAs".
- "produtos_servicos": liste itens com pre\xE7o/faixa SEMPRE que o dono informou. Se n\xE3o informou, use categorias e marque "(consultar)". NUNCA invente pre\xE7o.
- "como_vender": passo a passo NUMERADO (3-6 passos) espec\xEDfico desse neg\xF3cio \u2014 n\xE3o gen\xE9rico. Ex: "1. Pergunte se \xE9 retirada ou entrega. 2. Se entrega, pe\xE7a CEP..."
- "objecoes": 3-5 obje\xE7\xF5es REAIS daquele segmento + resposta curta cada. Ex: "T\xE1 caro" \u2192 resposta concreta.
- "faq": 4-6 perguntas que clientes daquele segmento REALMENTE fazem + resposta direta.
- "politicas": troca, cancelamento, garantia, prazo \u2014 coerentes com o segmento. Se o dono n\xE3o falou, escreva uma pol\xEDtica padr\xE3o razo\xE1vel e marcada como "(confirmar com o time)".
- "posvenda_msg": mensagem curta de p\xF3s-venda alinhada ao tom.
- "pode_fazer": lista (1 por linha) do que o agente pode prometer/fazer.
- "nao_pode_fazer": lista (1 por linha) do que N\xC3O pode \u2014 inclua sempre "N\xE3o inventar pre\xE7o, prazo ou pol\xEDtica que n\xE3o esteja aqui" e "N\xE3o fechar venda sem confirmar dado essencial (endere\xE7o, hor\xE1rio, forma de pagamento)".
- "ofertas": s\xF3 preencha se o dono mencionou promo\xE7\xE3o/cupom. Sen\xE3o, "".
- "formas_pagamento": s\xF3 o que o dono disse (ou "(consultar)").
- Use "" (string vazia) quando faltar info \u2014 NUNCA omita chaves.
- N\xC3O invente: pre\xE7o, endere\xE7o, hor\xE1rio, telefone, prazo, estoque. Se faltar, deixe vazio ou marque "(consultar)".

Retorne S\xD3 o JSON.`;
      const user = `DESCRI\xC7\xC3O DO DONO:
${data.descricao}

${respostasTxt ? `RESPOSTAS ESPEC\xCDFICAS DO DONO:
${respostasTxt}` : ""}

Gere o JSON do agente.`;
      const raw = await lovableAiChat([
        { role: "system", content: system },
        { role: "user", content: user }
      ], { provider: "gemini", model: "google/gemini-2.5-flash" });
      const parsed = extractJson(raw);
      const config = {};
      for (const k of FIELDS) {
        const v = parsed?.[k];
        config[k] = typeof v === "string" ? v : v == null ? "" : String(v);
      }
      const promptPreview = buildSystemPrompt(config, {
        responderEmPartes: true,
        produtos: []
      });
      return { config, promptPreview };
    });
  },
  "src/lib/lovable-ai.server": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.lovableAiChat = lovableAiChat;
    const client_1 = require2("@/blink/client");
    async function lovableAiChat(messages, modelOrConfig = "gemini-2.5-flash") {
      const cfg = typeof modelOrConfig === "string" ? { provider: "gemini", model: modelOrConfig } : modelOrConfig;
      const provider = (cfg.provider || "gemini").toLowerCase();
      const defaults = {
        openai: "openai/gpt-4o-mini",
        anthropic: "anthropic/claude-sonnet-4-5",
        gemini: "google/gemini-2.5-flash"
      };
      const legacyModels = {
        "gpt-4o-mini": "openai/gpt-4o-mini",
        "gpt-4o": "openai/gpt-4o",
        "gpt-4.1-mini": "openai/gpt-4.1-mini",
        "claude-3-5-haiku-latest": "anthropic/claude-haiku-4-5",
        "claude-3-5-sonnet-latest": "anthropic/claude-sonnet-4-5"
      };
      let model = cfg.model || defaults[provider] || "openai/gpt-4.1-mini";
      model = legacyModels[model] || model;
      if (!model.includes("/") && defaults[provider])
        model = `${provider === "gemini" ? "google" : provider}/${model}`;
      const result = await client_1.blink.ai.generateText({ messages, model });
      return result.text.trim();
    }
  },
  "src/lib/ai-prompt": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PART_SEPARATOR = void 0;
    exports.buildSystemPrompt = buildSystemPrompt;
    exports.parseAiOutput = parseAiOutput;
    exports.classifyStagePromptInstruction = classifyStagePromptInstruction;
    exports.PART_SEPARATOR = "|||";
    const DEFAULT_STAGES = [
      { nome: "Conversas", tipo: "normal" },
      { nome: "Negociando", tipo: "normal" },
      { nome: "Ganho", tipo: "ganho" },
      { nome: "Perda", tipo: "perda" }
    ];
    function describeTom(tom) {
      const n = typeof tom === "number" ? tom : 70;
      if (n <= 25)
        return "tom mais s\xE9rio e contido";
      if (n <= 55)
        return "tom equilibrado, atencioso";
      if (n <= 80)
        return "tom caloroso e simp\xE1tico";
      return "tom muito caloroso, pr\xF3ximo, quase de amigo";
    }
    function describeFormalidade(f) {
      const n = typeof f === "number" ? f : 40;
      if (n <= 25)
        return "linguagem informal (voc\xEA, oi, beleza)";
      if (n <= 55)
        return "linguagem semi-formal (voc\xEA, com cordialidade)";
      if (n <= 80)
        return "linguagem formal (senhor/senhora, prezado)";
      return "linguagem muito formal (cerimoniosa)";
    }
    function describeTamanho(t) {
      switch ((t || "curtas").toLowerCase()) {
        case "longas":
          return "respostas mais longas e explicativas quando fizer sentido";
        case "medias":
        case "m\xE9dias":
          return "respostas de tamanho m\xE9dio";
        default:
          return "respostas curtas, no estilo WhatsApp";
      }
    }
    function describePersonalidade(p) {
      switch ((p || "padrao").toLowerCase()) {
        case "extrovertido":
          return "personalidade EXTROVERTIDA: animado, entusiasmado, usa exclama\xE7\xF5es com naturalidade, transmite energia positiva sem soar artificial";
        case "serio":
        case "s\xE9rio":
          return "personalidade S\xC9RIA: postura profissional, objetivo, direto ao ponto, sem brincadeiras, transmite compet\xEAncia e seguran\xE7a";
        case "divertido":
          return "personalidade DIVERTIDA: bem-humorado, leve, pode fazer brincadeiras inteligentes sem perder o profissionalismo";
        case "consultivo":
          return "personalidade CONSULTIVA: age como especialista/consultor, faz perguntas inteligentes, recomenda com fundamento";
        case "amigavel":
        case "amig\xE1vel":
          return "personalidade AMIG\xC1VEL: acolhedor, pr\xF3ximo, demonstra interesse genu\xEDno, parece um amigo prestativo";
        default:
          return "personalidade EQUILIBRADA: simp\xE1tico sem exageros, profissional sem ser frio";
      }
    }
    function describeFoco(f) {
      switch ((f || "ambos").toLowerCase()) {
        case "vendas":
          return "FOCO PRINCIPAL = VENDAS. Qualifique, gere interesse e conduza pro fechamento. N\xE3o seja agressivo, mas n\xE3o perca oportunidade.";
        case "suporte":
          return "FOCO PRINCIPAL = SUPORTE. Resolva problemas e tire d\xFAvidas com clareza e paci\xEAncia. N\xE3o force venda.";
        default:
          return "FOCO H\xCDBRIDO: identifique a inten\xE7\xE3o. Se for d\xFAvida/problema \u2192 resolva primeiro. Se for interesse de compra \u2192 conduza pra venda. Fa\xE7a os dois com naturalidade.";
      }
    }
    function describeEmojis(intensidade, legacy) {
      const i = (intensidade || (legacy === false ? "nenhum" : "pouco")).toLowerCase();
      switch (i) {
        case "nenhum":
          return "NUNCA use emojis";
        case "moderado":
          return "use emojis com frequ\xEAncia moderada (1 por mensagem quando combinar)";
        case "muito":
          return "use emojis com liberdade pra dar vida \xE0 conversa, sem exagerar";
        default:
          return "use no m\xE1ximo 1 emoji ocasional, s\xF3 quando combinar muito";
      }
    }
    function describeProatividade(p) {
      const n = typeof p === "number" ? p : 50;
      if (n <= 25)
        return "seja REATIVO: s\xF3 responda o que o cliente perguntar, n\xE3o antecipe ofertas";
      if (n <= 60)
        return "seja MODERADAMENTE PROATIVO: sugira o pr\xF3ximo passo quando fizer sentido";
      return "seja MUITO PROATIVO: antecipe necessidades, sugira upsell/cross-sell, conduza ativamente pro fechamento";
    }
    function montaPersonalidade(c) {
      return [
        describePersonalidade(c.personalidade),
        describeTom(c.tom),
        describeFormalidade(c.formalidade),
        describeTamanho(c.tamanho_resposta),
        describeEmojis(c.emoji_intensidade, c.usar_emojis),
        describeProatividade(c.proatividade),
        c.usar_girias ? "pode usar g\xEDrias leves do cotidiano brasileiro" : "evite g\xEDrias e express\xF5es muito informais",
        c.pode_brincar ? "pode fazer brincadeiras pontuais e leves" : "evite brincadeiras",
        c.chamar_por_nome === false ? "N\xC3O chame o cliente pelo nome a cada mensagem" : "chame o cliente pelo nome quando souber, sem repetir em toda mensagem",
        c.perguntar_uma_por_vez === false ? "" : "fa\xE7a SEMPRE uma pergunta por vez (nunca dispare v\xE1rias juntas)"
      ].filter(Boolean).join("; ");
    }
    function buildSystemPrompt(c, opts) {
      const partes = opts?.responderEmPartes ?? c.responder_em_partes ?? true;
      const stages = opts?.stages && opts.stages.length > 0 ? opts.stages : DEFAULT_STAGES;
      const produtos = opts?.produtos ?? [];
      const personalidade = montaPersonalidade(c);
      const produtosBloco = produtos.length ? "PRODUTOS / SERVI\xC7OS (cat\xE1logo real \u2014 use SOMENTE estes pre\xE7os/itens):\n" + produtos.map((p) => {
        const preco = p.preco !== void 0 && p.preco !== null && p.preco !== "" ? ` \u2014 R$ ${p.preco}` : "";
        const desc = p.descricao ? ` (${p.descricao})` : "";
        return `\u2022 ${p.nome}${preco}${desc}`;
      }).join("\n") : "";
      const stageNames = stages.map((s) => s.nome).join(" | ");
      const stagesFinaisNomes = stages.filter((s) => s.tipo === "ganho" || s.tipo === "perda").map((s) => s.nome);
      const blocos = [
        `Voc\xEA \xE9 ${c.nome_agente || "um atendente virtual"}, atendendo no WhatsApp da empresa ${c.nome_empresa || "(empresa)"}.`,
        c.apresentacao ? `Como se apresenta na primeira mensagem: ${c.apresentacao}` : "",
        `Objetivo: ${c.papel_objetivo || "atender clientes com cordialidade, descobrir o que precisam e ajudar a fechar a venda."}`,
        describeFoco(c.foco_atendimento),
        `Personalidade: ${personalidade}.`,
        c.evitar_palavras ? `PALAVRAS / EXPRESS\xD5ES PROIBIDAS (nunca use): ${c.evitar_palavras}` : "",
        c.assinar_mensagens ? `Assine a primeira mensagem do dia com "\u2014 ${c.nome_agente || "Atendente"}".` : "",
        c.estilo_comunicacao ? `Estilo de comunica\xE7\xE3o extra: ${c.estilo_comunicacao}` : "",
        c.segmento ? `Segmento da empresa: ${c.segmento}.` : "",
        c.sobre_empresa ? `Sobre a empresa:
${c.sobre_empresa}` : "",
        c.descricao_negocio ? `Descri\xE7\xE3o do neg\xF3cio:
${c.descricao_negocio}` : "",
        c.diferenciais ? `Diferenciais:
${c.diferenciais}` : "",
        c.publico_alvo ? `P\xFAblico-alvo: ${c.publico_alvo}` : "",
        c.regiao_horario ? `Regi\xE3o / hor\xE1rio de atendimento: ${c.regiao_horario}` : "",
        c.produtos_servicos ? `Produtos/servi\xE7os (descri\xE7\xE3o livre):
${c.produtos_servicos}` : "",
        produtosBloco,
        c.ofertas ? `OFERTAS ATIVAS:
${c.ofertas}` : "",
        c.cupom ? `Cupom dispon\xEDvel: ${c.cupom} (s\xF3 ofere\xE7a quando fizer sentido pra fechar)` : "",
        c.formas_pagamento ? `Formas de pagamento aceitas: ${c.formas_pagamento}` : "",
        c.ticket_medio ? `Ticket m\xE9dio de refer\xEAncia: ${c.ticket_medio}` : "",
        c.como_vender ? `COMO VENDER (passo a passo de vendas da empresa):
${c.como_vender}` : "",
        c.objecoes ? `OBJE\xC7\xD5ES COMUNS E COMO RESPONDER:
${c.objecoes}` : "",
        c.faq ? `FAQ:
${c.faq}` : "",
        c.politicas ? `POL\xCDTICAS (troca/cancelamento/garantia):
${c.politicas}` : "",
        c.posvenda_msg ? `Mensagem padr\xE3o de p\xF3s-venda: ${c.posvenda_msg}` : "",
        c.pedir_avaliacao ? "Quando uma venda for conclu\xEDda, pe\xE7a uma avalia\xE7\xE3o de forma natural." : "",
        c.reativar_cliente ? "Pode reativar clientes inativos com mensagens leves e relevantes." : "",
        c.pode_fazer ? `O QUE VOC\xCA PODE FAZER:
${c.pode_fazer}` : "",
        c.nao_pode_fazer ? `O QUE VOC\xCA N\xC3O PODE FAZER:
${c.nao_pode_fazer}` : "",
        c.agendamento_ativo ? `AGENDAMENTO ATIVO: voc\xEA pode propor hor\xE1rios para ${c.servicos_agendaveis || "os servi\xE7os agend\xE1veis"}. Dura\xE7\xE3o padr\xE3o: ${c.duracao_padrao || "30 min"}. Janelas dispon\xEDveis: ${c.horarios_disponiveis || "(n\xE3o informado)"}. Anteced\xEAncia m\xEDnima: ${c.antecedencia_min || "2 horas"}. Sempre confirme nome e o melhor hor\xE1rio antes de fechar o agendamento.` : "",
        c.telefone_transferencia ? `Se o cliente pedir atendimento humano, reclamar de algo sens\xEDvel, ou precisar de algo fora do seu escopo, oriente a falar com ${c.telefone_transferencia} e diga que vai transferir.` : "Se o cliente pedir atendimento humano ou for algo sens\xEDvel, diga educadamente que vai chamar algu\xE9m do time.",
        opts?.resumoContato ? `Contexto do contato: ${opts.resumoContato}` : "",
        opts?.estagioAtual ? `Est\xE1gio atual no CRM: ${opts.estagioAtual}.` : "",
        `M\xC9TODO DE ATENDIMENTO (siga sempre):
1. Cumprimente com naturalidade s\xF3 na PRIMEIRA mensagem da conversa. Depois N\xC3O repita sauda\xE7\xE3o.
2. Antes de oferecer qualquer coisa, ENTENDA a necessidade do cliente. Fa\xE7a UMA pergunta por vez (nunca v\xE1rias juntas).
3. Qualifique aos poucos: nome (se n\xE3o souber), o que precisa, para quando, contexto/urg\xEAncia.
4. S\xF3 fale de produto/servi\xE7o/pre\xE7o/condi\xE7\xE3o quando o cliente perguntar OU quando voc\xEA j\xE1 souber o suficiente pra recomendar com sentido.
5. NUNCA invente pre\xE7o, prazo, pol\xEDtica, estoque, endere\xE7o ou qualquer info que n\xE3o est\xE1 no prompt. Se n\xE3o tiver a info: diga que vai confirmar e, se fizer sentido, transfira pro humano.
6. Conduza pro pr\xF3ximo passo concreto: agendar, enviar proposta, confirmar pedido, marcar visita, etc.
7. Respeite SEMPRE o que est\xE1 em "N\xC3O pode fazer".

ESTILO DE MENSAGEM (WhatsApp humano):
- Portugu\xEAs do Brasil, tom pr\xF3ximo, sem ser formal demais e sem ser infantil.
- Mensagens CURTAS, frases naturais, como gente digita no WhatsApp. Nada de text\xE3o.
- Sem markdown pesado, sem listas com bullets, sem emojis em excesso.
- N\xE3o repita o nome do cliente em toda mensagem. N\xE3o repita o que ele acabou de dizer.
- N\xE3o soe como rob\xF4 ("Como posso ajud\xE1-lo hoje?"). Soe como um atendente real e atencioso.`
      ];
      if (partes) {
        blocos.push(`FORMATO DA RESPOSTA (OBRIGAT\xD3RIO):
Responda em 1 a 3 mensagens curtas, separadas pelo marcador "${exports.PART_SEPARATOR}" (tr\xEAs pipes).
Cada parte \xE9 uma "bolha" curta, como se voc\xEA estivesse digitando uma de cada vez no WhatsApp.
Exemplo: "oi, tudo bem? ${exports.PART_SEPARATOR} aqui \xE9 a Ana da Padaria do Bairro ${exports.PART_SEPARATOR} me conta, \xE9 pra retirar ou entrega?"
Se uma frase s\xF3 j\xE1 resolve, use UMA parte e pronto (sem o marcador). Nunca mais de 3 partes.`);
      } else {
        blocos.push(`FORMATO DA RESPOSTA: uma mensagem s\xF3, curta e natural.`);
      }
      if (c.agendamento_ativo && opts?.googleConectado) {
        const nowIso = (/* @__PURE__ */ new Date()).toISOString();
        blocos.push(`AGENDAMENTO REAL (Google Agenda conectado):
Hoje \xE9 ${nowIso} (UTC, fuso America/Sao_Paulo). Quando o cliente CONFIRMAR um hor\xE1rio espec\xEDfico (dia + hora) para um servi\xE7o agend\xE1vel, na MESMA resposta, em uma nova linha, escreva exatamente:
[AGENDAR: AAAA-MM-DDTHH:MM | AAAA-MM-DDTHH:MM | t\xEDtulo curto]
A primeira data \xE9 o in\xEDcio, a segunda \xE9 o fim (use ${c.duracao_padrao || "30 min"} se o cliente n\xE3o disser). Use o fuso -03:00 nos hor\xE1rios (ex.: 2026-06-20T15:00:00-03:00). Esse marcador \xE9 interno e N\xC3O aparece pro cliente. S\xF3 emita o marcador quando o cliente confirmou claramente. Nunca invente hor\xE1rios que o cliente n\xE3o disse.`);
      }
      blocos.push(`AO FINAL DA RESPOSTA, em uma nova linha, escreva exatamente:
[ESTAGIO: ${stageNames}]
Escolha 1 entre as etapas reais do CRM da empresa listadas acima. ` + (stagesFinaisNomes.length ? `Use uma etapa final (${stagesFinaisNomes.join(" / ")}) APENAS se o cliente confirmou (ganho) ou recusou claramente (perda). ` : "") + `Esse marcador \xE9 interno, N\xC3O aparece pro cliente.`);
      return blocos.filter(Boolean).join("\n\n");
    }
    function parseAiOutput(raw, stages) {
      let text = raw || "";
      let stage = null;
      let agendar = null;
      const agMatch = text.match(/\[\s*AGENDAR\s*:\s*([^\]]+)\]/i);
      if (agMatch) {
        const parts2 = agMatch[1].split("|").map((s) => s.trim());
        if (parts2.length >= 2) {
          agendar = {
            inicio: parts2[0],
            fim: parts2[1],
            titulo: (parts2[2] || "Agendamento").slice(0, 120)
          };
        }
        text = text.replace(agMatch[0], "").trim();
      }
      const stageMatch = text.match(/\[\s*ESTAGIO\s*:\s*([^\]]+)\]/i);
      if (stageMatch) {
        const candidate = stageMatch[1].trim().toLowerCase();
        if (stages && stages.length) {
          const found = stages.find((s) => s.nome.toLowerCase() === candidate);
          if (found)
            stage = found.nome;
          else {
            const starts = stages.find((s) => candidate.startsWith(s.nome.toLowerCase()));
            if (starts)
              stage = starts.nome;
          }
        } else {
          stage = stageMatch[1].trim();
        }
        text = text.replace(stageMatch[0], "").trim();
      }
      const parts = text.split(exports.PART_SEPARATOR).map((p) => p.trim()).filter((p) => p.length > 0).slice(0, 3);
      return { parts: parts.length ? parts : [text.trim()].filter(Boolean), stage, agendar };
    }
    function classifyStagePromptInstruction() {
      return "Voc\xEA \xE9 um classificador. Dado o hist\xF3rico curto de mensagens entre um vendedor e um lead pelo WhatsApp, responda APENAS com UMA palavra correspondente ao nome de uma etapa do CRM.";
    }
  },
  "src/lib/billing.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.listRecentBillingEvents = exports.getBillingWebhookInfo = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function assertSuperAdmin(supabase, userId) {
      const { data, error } = await supabase.rpc("is_super_admin");
      if (error)
        throw new Error(error.message);
      if (!data)
        throw new Error("Acesso negado");
      void userId;
    }
    exports.getBillingWebhookInfo = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      await assertSuperAdmin(context.supabase, context.userId);
      return {
        kiwify: !!process.env.KIWIFY_WEBHOOK_TOKEN,
        cakto: !!process.env.CAKTO_WEBHOOK_TOKEN,
        perfectpay: !!process.env.PERFECTPAY_WEBHOOK_TOKEN
      };
    });
    exports.listRecentBillingEvents = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      await assertSuperAdmin(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data, error } = await supabaseAdmin.from("billing_event_log").select("id, provider, event_type, buyer_email, processed, error, matched_company_id, created_at").order("created_at", { ascending: false }).limit(20);
      if (error)
        throw new Error(error.message);
      return data ?? [];
    });
  },
  "src/lib/campaigns.functions": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.cancelCampaign = exports.pauseCampaign = exports.startCampaign = exports.deleteCampaign = exports.saveCampaign = exports.previewAudience = exports.listAvailableTags = exports.getCampaign = exports.listCampaigns = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function resolveCompanyId(supabase, userId) {
      const { data, error } = await supabase.from("company_user").select("company_id").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error)
        throw error;
      if (!data)
        throw new Error("Sem empresa.");
      return data.company_id;
    }
    exports.listCampaigns = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { data, error } = await supabase.from("campaign").select("*").eq("company_id", companyId).order("created_at", { ascending: false });
      if (error)
        throw new Error(error.message);
      return data ?? [];
    });
    exports.getCampaign = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { data: c } = await supabase.from("campaign").select("*").eq("id", data.id).eq("company_id", companyId).maybeSingle();
      if (!c)
        throw new Error("Campanha n\xE3o encontrada.");
      const { data: targets } = await supabase.from("campaign_target").select("*").eq("campaign_id", data.id).order("created_at", { ascending: true }).limit(500);
      return { campaign: c, targets: targets ?? [] };
    });
    exports.listAvailableTags = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { data } = await supabase.from("crm_cards").select("tags").eq("company_id", companyId);
      const set = /* @__PURE__ */ new Set();
      for (const row of data ?? []) {
        for (const t of row.tags ?? [])
          if (t)
            set.add(t);
      }
      return Array.from(set).sort();
    });
    exports.previewAudience = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      let q = supabase.from("crm_cards").select("numero, contato_nome, tags").eq("company_id", companyId);
      if (data.tags && data.tags.length)
        q = q.overlaps("tags", data.tags);
      const { data: rows, error } = await q;
      if (error)
        throw new Error(error.message);
      const map = /* @__PURE__ */ new Map();
      for (const r of rows ?? []) {
        const num = String(r.numero || "").replace(/\D/g, "");
        if (!num)
          continue;
        if (!map.has(num))
          map.set(num, { numero: num, nome: r.contato_nome ?? null });
      }
      return { total: map.size, sample: Array.from(map.values()).slice(0, 10) };
    });
    exports.saveCampaign = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const payload = {
        company_id: companyId,
        created_by: userId,
        nome: data.nome,
        mensagem: data.mensagem,
        agendado_para: data.agendado_para || null,
        filtro_tags: data.filtro_tags ?? [],
        intervalo_min_seg: Math.max(2, data.intervalo_min_seg ?? 5),
        intervalo_max_seg: Math.max(data.intervalo_min_seg ?? 5, data.intervalo_max_seg ?? 20),
        pausa_apos_envios: Math.max(10, data.pausa_apos_envios ?? 50),
        pausa_duracao_min: Math.max(1, data.pausa_duracao_min ?? 10)
      };
      if (data.id) {
        const { data: row2, error: error2 } = await supabase.from("campaign").update(payload).eq("id", data.id).eq("company_id", companyId).select("*").maybeSingle();
        if (error2)
          throw new Error(error2.message);
        return row2;
      }
      const { data: row, error } = await supabase.from("campaign").insert(payload).select("*").maybeSingle();
      if (error)
        throw new Error(error.message);
      return row;
    });
    exports.deleteCampaign = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { error } = await supabase.from("campaign").delete().eq("id", data.id).eq("company_id", companyId);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.startCampaign = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { data: c } = await supabase.from("campaign").select("*").eq("id", data.id).eq("company_id", companyId).maybeSingle();
      if (!c)
        throw new Error("Campanha n\xE3o encontrada.");
      if (c.status === "enviando" || c.status === "agendada")
        throw new Error("Campanha j\xE1 est\xE1 em execu\xE7\xE3o.");
      let q = supabase.from("crm_cards").select("numero, contato_nome, tags").eq("company_id", companyId);
      if ((c.filtro_tags ?? []).length)
        q = q.overlaps("tags", c.filtro_tags);
      const { data: rows } = await q;
      const map = /* @__PURE__ */ new Map();
      for (const r of rows ?? []) {
        const num = String(r.numero || "").replace(/\D/g, "");
        if (!num)
          continue;
        if (!map.has(num))
          map.set(num, r.contato_nome ?? null);
      }
      if (map.size === 0)
        throw new Error("Nenhum contato bate com os filtros.");
      await supabase.from("campaign_target").delete().eq("campaign_id", c.id);
      const inserts = Array.from(map.entries()).map(([numero, nome]) => ({
        campaign_id: c.id,
        company_id: companyId,
        contato_numero: numero,
        contato_nome: nome,
        status: "pendente"
      }));
      for (let i = 0; i < inserts.length; i += 500) {
        const { error: error2 } = await supabase.from("campaign_target").insert(inserts.slice(i, i + 500));
        if (error2)
          throw new Error(error2.message);
      }
      const proximo = c.agendado_para && new Date(c.agendado_para) > /* @__PURE__ */ new Date() ? c.agendado_para : (/* @__PURE__ */ new Date()).toISOString();
      const status = c.agendado_para && new Date(c.agendado_para) > /* @__PURE__ */ new Date() ? "agendada" : "enviando";
      const { error } = await supabase.from("campaign").update({
        status,
        total_destinatarios: inserts.length,
        total_enviados: 0,
        total_falhas: 0,
        iniciado_em: (/* @__PURE__ */ new Date()).toISOString(),
        proximo_envio_em: proximo,
        concluido_em: null
      }).eq("id", c.id);
      if (error)
        throw new Error(error.message);
      return { ok: true, total: inserts.length };
    });
    exports.pauseCampaign = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const status = data.pause ? "pausada" : "enviando";
      const update = { status };
      if (!data.pause)
        update.proximo_envio_em = (/* @__PURE__ */ new Date()).toISOString();
      const { error } = await supabase.from("campaign").update(update).eq("id", data.id).eq("company_id", companyId);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.cancelCampaign = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { error } = await supabase.from("campaign").update({ status: "cancelada", concluido_em: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.id).eq("company_id", companyId);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
  },
  "src/lib/checkout.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createCheckoutCompany = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    const tenant_1 = require2("src/lib/tenant");
    exports.createCheckoutCompany = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const nome = String(d.nome || "").trim();
      if (nome.length < 2)
        throw new Error("Informe o nome da sua empresa.");
      const plano_slug = d.plano_slug ? String(d.plano_slug).toLowerCase().trim() : null;
      return { nome, plano_slug };
    }).handler(async ({ context, data }) => {
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: existing, error: existingErr } = await supabaseAdmin.from("company_user").select("company_id").eq("user_id", context.userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (existingErr)
        throw existingErr;
      if (existing?.company_id)
        return { companyId: existing.company_id };
      const requestedPlan = data.plano_slug || "starter";
      const { data: plan, error: planErr } = await supabaseAdmin.from("plan").select("id, trial_days, slug").eq("slug", requestedPlan).eq("ativo", true).maybeSingle();
      if (planErr)
        throw planErr;
      if (!plan)
        throw new Error("Plano selecionado n\xE3o est\xE1 dispon\xEDvel.");
      const trialDays = Math.max(0, Number(plan.trial_days) || 0);
      const planSlug = plan.slug;
      const slug = `${(0, tenant_1.slugify)(data.nome)}-${Math.random().toString(36).slice(2, 6)}`;
      const trialAte = new Date(Date.now() + trialDays * 864e5).toISOString();
      const { data: company, error: companyErr } = await supabaseAdmin.from("company").insert({
        nome: data.nome,
        slug,
        primary_color: "#25D366",
        created_by: context.userId,
        status_cobranca: "trial",
        onboarding_completed: false,
        onboarding_step: 0,
        trial_ate: trialAte,
        selected_plan_slug: planSlug
      }).select("id").single();
      if (companyErr || !company)
        throw new Error(companyErr?.message || "Falha ao criar empresa");
      const { error: memberErr } = await supabaseAdmin.from("company_user").insert({
        user_id: context.userId,
        company_id: company.id,
        role: "owner",
        ativo: true
      });
      if (memberErr) {
        await supabaseAdmin.from("company").delete().eq("id", company.id);
        throw memberErr;
      }
      const { error: subscriptionErr } = await supabaseAdmin.from("subscription").insert({
        company_id: company.id,
        plan_id: plan.id,
        status: "trialing",
        trial_ends_at: trialAte,
        current_period_end: trialAte,
        metadata: { source: "self_service_trial" }
      });
      if (subscriptionErr) {
        await supabaseAdmin.from("company").delete().eq("id", company.id);
        throw subscriptionErr;
      }
      return { companyId: company.id };
    });
  },
  "src/lib/tenant": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.trialDaysLeft = trialDaysLeft;
    exports.slugify = slugify;
    function trialDaysLeft(trialAte) {
      const end = new Date(trialAte).getTime();
      const ms = end - Date.now();
      return Math.ceil(ms / (1e3 * 60 * 60 * 24));
    }
    function slugify(s) {
      return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 48) || "empresa";
    }
  },
  "src/lib/credits.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.adminGrantCredits = exports.getMyCredits = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    exports.getMyCredits = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { data: cu } = await context.supabase.from("company_user").select("company_id").eq("user_id", context.userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!cu)
        return { saldo: 0, origem: "trial", resetam_em: null, ledger: [] };
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const [comp, led] = await Promise.all([
        supabaseAdmin.from("company").select("creditos_saldo, creditos_origem, creditos_resetam_em").eq("id", cu.company_id).maybeSingle(),
        supabaseAdmin.from("credit_ledger").select("delta, saldo_apos, motivo, ref, created_at").eq("company_id", cu.company_id).order("created_at", { ascending: false }).limit(20)
      ]);
      return {
        saldo: comp.data?.creditos_saldo ?? 0,
        origem: comp.data?.creditos_origem ?? "trial",
        resetam_em: comp.data?.creditos_resetam_em ?? null,
        ledger: led.data ?? []
      };
    });
    exports.adminGrantCredits = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ data, context }) => {
      const { data: novo, error } = await context.supabase.rpc("grant_credits", {
        _company_id: data.companyId,
        _qtd: data.qtd,
        _motivo: data.motivo || "bonus_admin"
      });
      if (error)
        throw new Error(error.message);
      return { saldo: novo };
    });
  },
  "src/lib/csat.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCsatByToken = exports.submitCsat = exports.sendCsat = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function resolveCompanyId(supabase, userId) {
      const { data } = await supabase.from("company_user").select("company_id").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!data)
        throw new Error("Sem empresa.");
      return data.company_id;
    }
    function appOrigin() {
      return (process.env.PUBLIC_APP_URL || `https://${process.env.BLINK_PROJECT_ID}.blinkpowered.com`).replace(/\/$/, "");
    }
    exports.sendCsat = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const numero = String(data.numero).replace(/\D/g, "");
      if (!numero)
        throw new Error("N\xFAmero inv\xE1lido.");
      const token = crypto.randomUUID();
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { error } = await supabaseAdmin.from("csat_response").insert({
        company_id: companyId,
        numero,
        token,
        enviado_em: (/* @__PURE__ */ new Date()).toISOString(),
        contato_nome: data.contatoNome ?? null,
        enviado_por: userId
      });
      if (error)
        throw new Error(error.message ?? "Falha ao registrar CSAT.");
      const { data: inst } = await supabase.from("whatsapp_instances").select("instance_name,status").eq("company_id", companyId).maybeSingle();
      let sent = false;
      if (inst && inst.status === "connected") {
        const link = `${appOrigin()}/csat/${token}`;
        const texto = `Ol\xE1! Como foi nosso atendimento? Avalie em 1 minuto: ${link}`;
        try {
          const { evoSendText } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
          await evoSendText(inst.instance_name, numero, texto);
          sent = true;
          await supabase.from("mensagens").insert({
            company_id: companyId,
            user_id: userId,
            numero,
            contato_nome: data.contatoNome ?? null,
            direcao: "saida",
            autor: "sistema",
            texto
          });
        } catch (e) {
          console.warn("[csat send]", e);
        }
      }
      return { ok: true, token, sent };
    });
    exports.submitCsat = (0, react_start_1.createServerFn)({ method: "POST" }).inputValidator((d) => d).handler(async ({ data }) => {
      if (!data.token || data.score < 1 || data.score > 5)
        throw new Error("Dados inv\xE1lidos.");
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: row } = await supabaseAdmin.from("csat_response").select("id, respondido_em").eq("token", data.token).maybeSingle();
      if (!row)
        throw new Error("Pesquisa n\xE3o encontrada.");
      if (row.respondido_em)
        throw new Error("Pesquisa j\xE1 respondida.");
      const { error } = await supabaseAdmin.from("csat_response").update({
        score: data.score,
        comentario: data.comentario ?? null,
        respondido_em: (/* @__PURE__ */ new Date()).toISOString()
      }).eq("id", row.id);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.getCsatByToken = (0, react_start_1.createServerFn)({ method: "POST" }).inputValidator((d) => d).handler(async ({ data }) => {
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: row } = await supabaseAdmin.from("csat_response").select("token, respondido_em, company_id").eq("token", data.token).maybeSingle();
      if (!row)
        return { found: false };
      const { data: comp } = await supabaseAdmin.from("company").select("nome, primary_color").eq("id", row.company_id).maybeSingle();
      return { found: true, respondido: !!row.respondido_em, empresa: comp?.nome ?? "", primaryColor: comp?.primary_color ?? "#22C55E" };
    });
  },
  "src/lib/evolution.server": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.evoCreateInstance = evoCreateInstance;
    exports.evoConnect = evoConnect;
    exports.evoGetQr = evoGetQr;
    exports.evoState = evoState;
    exports.evoSetWebhook = evoSetWebhook;
    exports.evoSendText = evoSendText;
    exports.evoSendPresence = evoSendPresence;
    exports.evoLogout = evoLogout;
    exports.evoDelete = evoDelete;
    exports.evoFetchNumberFromInstance = evoFetchNumberFromInstance;
    const QRCode = __importStar(require2("qrcode"));
    const supportNumber = String(process.env.SUPPORT_WHATSAPP || "").replace(/\D/g, "");
    const SUPPORT_SUFFIX = supportNumber ? ` Se persistir, fale com o suporte: https://wa.me/${supportNumber}` : "";
    function env() {
      const url = process.env.EVOLUTION_API_URL;
      const key = process.env.EVOLUTION_API_KEY;
      if (!url || !key) {
        throw new Error(`Servidor do WhatsApp n\xE3o configurado. Configure EVOLUTION_API_URL e EVOLUTION_API_KEY nos segredos do backend.${SUPPORT_SUFFIX}`);
      }
      return { url: url.replace(/\/+$/, ""), key };
    }
    async function evo(path, init = {}) {
      const { url, key } = env();
      const headers = {
        apikey: key,
        "Content-Type": "application/json",
        ...init.headers
      };
      let res;
      try {
        res = await fetch(`${url}${path}`, {
          ...init,
          headers,
          body: init.json !== void 0 ? JSON.stringify(init.json) : init.body
        });
      } catch (e) {
        throw new Error(`Evolution API indispon\xEDvel: ${e?.message || "falha de rede"}.${SUPPORT_SUFFIX}`);
      }
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }
      if (!res.ok) {
        const msg = data?.message || data?.error || text || `HTTP ${res.status}`;
        throw new Error(`Evolution API: ${msg}.${SUPPORT_SUFFIX}`);
      }
      return data;
    }
    async function evoCreateInstance(instanceName, webhookUrl) {
      const body = {
        instanceName,
        integration: "WHATSAPP-BAILEYS",
        qrcode: true
      };
      if (webhookUrl) {
        body.webhook = {
          url: webhookUrl,
          byEvents: false,
          base64: false,
          events: ["MESSAGES_UPSERT"]
        };
      }
      return evo(`/instance/create`, { method: "POST", json: body });
    }
    async function evoConnect(instanceName) {
      return evo(`/instance/connect/${encodeURIComponent(instanceName)}`, { method: "GET" });
    }
    function asImageDataUrl(value, allowRawBase64 = false) {
      const text = typeof value === "string" ? value.trim() : "";
      if (!text)
        return null;
      if (text.startsWith("data:image/"))
        return text;
      const base64 = text.includes("base64,") ? text.split("base64,").pop()?.trim() : text;
      if (allowRawBase64 && base64 && base64.length > 120 && /^[A-Za-z0-9+/=\s]+$/.test(base64) && looksLikeImageBase64(base64)) {
        return `data:image/png;base64,${base64.replace(/\s/g, "")}`;
      }
      return null;
    }
    function looksLikeImageBase64(base64) {
      try {
        const bin = atob(base64.replace(/\s/g, "").slice(0, 64));
        return bin.charCodeAt(0) === 137 && bin.slice(1, 4) === "PNG" || bin.charCodeAt(0) === 255 && bin.charCodeAt(1) === 216 || bin.slice(0, 4) === "RIFF" && bin.slice(8, 12) === "WEBP";
      } catch {
        return false;
      }
    }
    function extractQrCode(payload) {
      const candidates = [
        payload?.code,
        payload?.qrcode?.code,
        payload?.qrCode,
        payload?.qrcode,
        payload?.qr
      ];
      for (const value of candidates) {
        if (typeof value === "string" && value.trim() && !asImageDataUrl(value, false))
          return value.trim();
      }
      return null;
    }
    async function evoGetQr(instanceName) {
      const payload = await evoConnect(instanceName);
      const image = asImageDataUrl(payload?.base64, true) || asImageDataUrl(payload?.qrcode?.base64, true) || asImageDataUrl(payload?.qr?.base64, true) || asImageDataUrl(payload?.qrcode, true) || asImageDataUrl(payload?.qr, true);
      const code = extractQrCode(payload);
      if (image)
        return { qrBase64: image, code, pairingCode: payload?.pairingCode ?? payload?.qrcode?.pairingCode ?? null };
      if (code) {
        const qrBase64 = await QRCode.toDataURL(code, { width: 320, margin: 2, errorCorrectionLevel: "M" });
        return { qrBase64, code, pairingCode: payload?.pairingCode ?? payload?.qrcode?.pairingCode ?? null };
      }
      return { qrBase64: null, code: null, pairingCode: payload?.pairingCode ?? payload?.qrcode?.pairingCode ?? null };
    }
    async function evoState(instanceName) {
      return evo(`/instance/connectionState/${encodeURIComponent(instanceName)}`, { method: "GET" });
    }
    async function evoSetWebhook(instanceName, webhookUrl) {
      return evo(`/webhook/set/${encodeURIComponent(instanceName)}`, {
        method: "POST",
        json: {
          webhook: {
            enabled: true,
            url: webhookUrl,
            byEvents: false,
            base64: false,
            events: ["MESSAGES_UPSERT"]
          }
        }
      });
    }
    async function evoSendText(instanceName, number, text) {
      return evo(`/message/sendText/${encodeURIComponent(instanceName)}`, {
        method: "POST",
        json: { number, text }
      });
    }
    async function evoSendPresence(instanceName, number, presence, delayMs = 1500) {
      try {
        await evo(`/chat/sendPresence/${encodeURIComponent(instanceName)}`, {
          method: "POST",
          json: { number, presence, delay: delayMs }
        });
      } catch {
      }
    }
    async function evoLogout(instanceName) {
      return evo(`/instance/logout/${encodeURIComponent(instanceName)}`, { method: "DELETE" });
    }
    async function evoDelete(instanceName) {
      return evo(`/instance/delete/${encodeURIComponent(instanceName)}`, { method: "DELETE" });
    }
    async function evoFetchNumberFromInstance(instanceName) {
      try {
        const data = await evo(`/instance/fetchInstances?instanceName=${encodeURIComponent(instanceName)}`, {
          method: "GET"
        });
        const inst = Array.isArray(data) ? data[0] : data?.[0] ?? data;
        return inst?.instance?.owner || inst?.owner || inst?.number || null;
      } catch {
        return null;
      }
    }
  },
  "src/lib/evolution.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.testAiReply = exports.setContactIaActive = exports.sendWhatsappText = exports.disconnectWhatsapp = exports.checkWhatsappStatus = exports.connectWhatsapp = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    const server_1 = require2("@tanstack/react-start/server");
    function deriveInstanceName(companyId) {
      return `atendezap_${companyId.replace(/-/g, "").slice(0, 16)}`;
    }
    function buildWebhookUrl(token) {
      try {
        const req = (0, server_1.getRequest)();
        const url = new URL(req.url);
        const tokenQuery = token ? `?t=${encodeURIComponent(token)}` : "";
        return `${url.protocol}//${url.host}/api/public/whatsapp-webhook${tokenQuery}`;
      } catch {
        return "";
      }
    }
    async function resolveCompanyId(supabase, userId) {
      const { data, error } = await supabase.from("company_user").select("company_id").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error)
        throw error;
      if (!data)
        throw new Error("Voc\xEA ainda n\xE3o possui uma empresa. Finalize o onboarding.");
      return data.company_id;
    }
    exports.connectWhatsapp = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { evoCreateInstance, evoGetQr, evoSetWebhook, evoState } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
      const { data: existing } = await supabase.from("whatsapp_instances").select("instance_name,status,numero,webhook_token").eq("company_id", companyId).maybeSingle();
      const instanceName = existing?.instance_name || deriveInstanceName(companyId);
      const webhookToken = existing?.webhook_token || crypto.randomUUID();
      const webhookUrl = buildWebhookUrl(webhookToken);
      if (existing?.instance_name) {
        try {
          const s = await evoState(existing.instance_name);
          const existingState = s?.instance?.state || s?.state;
          if (existingState === "open") {
            if (webhookUrl) {
              try {
                await evoSetWebhook(existing.instance_name, webhookUrl);
              } catch (e) {
                console.warn("[evolution.setWebhook]", e);
              }
            }
            if (existing.status !== "connected") {
              await supabase.from("whatsapp_instances").update({ status: "connected", webhook_token: webhookToken, webhook_configured_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("company_id", companyId);
            }
            return { instanceName: existing.instance_name, qrBase64: null, code: null, state: "open", webhookUrl };
          }
        } catch {
        }
      }
      await supabase.from("whatsapp_instances").upsert({ company_id: companyId, user_id: userId, instance_name: instanceName, status: "connecting", webhook_token: webhookToken }, { onConflict: "company_id" });
      try {
        await evoCreateInstance(instanceName, webhookUrl);
      } catch (e) {
        const msg = String(e?.message || "");
        if (!/exists|already/i.test(msg))
          console.warn("[evolution.create]", msg);
        if (!/exists|already/i.test(msg))
          throw e;
      }
      if (webhookUrl) {
        try {
          await evoSetWebhook(instanceName, webhookUrl);
        } catch (e) {
          console.warn("[evolution.setWebhook]", e);
        }
      }
      let qrBase64 = null;
      let code = null;
      let lastQrError = null;
      for (let i = 0; i < 6; i++) {
        try {
          const qr = await evoGetQr(instanceName);
          qrBase64 = qr.qrBase64;
          code = qr.code;
          if (qrBase64 || code)
            break;
        } catch (e) {
          lastQrError = e;
          console.warn("[evolution.connect]", e);
        }
        await new Promise((r) => setTimeout(r, 800));
      }
      if (!qrBase64 && !code && lastQrError) {
        throw lastQrError;
      }
      let state;
      try {
        const s = await evoState(instanceName);
        state = s?.instance?.state || s?.state;
      } catch {
      }
      return { instanceName, qrBase64, code, state, webhookUrl };
    });
    exports.checkWhatsappStatus = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { evoState, evoFetchNumberFromInstance, evoSetWebhook } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
      const { data: row } = await supabase.from("whatsapp_instances").select("instance_name,status,numero,webhook_token,webhook_configured_at").eq("company_id", companyId).maybeSingle();
      if (!row)
        return { status: "disconnected", state: null, numero: null, qrBase64: null, code: null };
      let state = null;
      let stateError = false;
      try {
        const s = await evoState(row.instance_name);
        state = s?.instance?.state || s?.state || null;
      } catch (e) {
        stateError = true;
        console.warn("[evolution.state]", e);
      }
      if (stateError) {
        return {
          status: row.status || "disconnected",
          state: null,
          numero: row.numero ?? null,
          qrBase64: null,
          code: null
        };
      }
      const newStatus = state === "open" ? "connected" : state === "connecting" ? "connecting" : "disconnected";
      let numero = row.numero ?? null;
      if (newStatus === "connected" && !numero) {
        try {
          numero = await evoFetchNumberFromInstance(row.instance_name);
        } catch {
        }
      }
      if (newStatus === "connected" && row.webhook_token && !row.webhook_configured_at) {
        const webhookUrl = buildWebhookUrl(row.webhook_token);
        if (webhookUrl) {
          try {
            await evoSetWebhook(row.instance_name, webhookUrl);
            await supabase.from("whatsapp_instances").update({ webhook_configured_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("company_id", companyId);
          } catch (e) {
            console.warn("[evolution.setWebhook]", e);
          }
        }
      }
      if (newStatus !== row.status || numero && numero !== row.numero) {
        await supabase.from("whatsapp_instances").update({ status: newStatus, ...numero ? { numero } : {} }).eq("company_id", companyId);
      }
      return { status: newStatus, state, numero, qrBase64: null, code: null };
    });
    exports.disconnectWhatsapp = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { evoLogout } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
      const { data: row } = await supabase.from("whatsapp_instances").select("instance_name").eq("company_id", companyId).maybeSingle();
      if (row) {
        try {
          await evoLogout(row.instance_name);
        } catch (e) {
          console.warn("[evolution.logout]", e);
        }
        await supabase.from("whatsapp_instances").update({ status: "disconnected" }).eq("company_id", companyId);
      }
      return { ok: true };
    });
    exports.sendWhatsappText = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { data: inst } = await supabase.from("whatsapp_instances").select("instance_name,status").eq("company_id", companyId).maybeSingle();
      if (!inst?.instance_name)
        throw new Error("WhatsApp n\xE3o conectado");
      const { data: recentInbound } = await supabase.from("mensagens").select("id").eq("company_id", companyId).eq("numero", data.numero).eq("direcao", "entrada").gte("created_at", new Date(Date.now() - 24 * 60 * 6e4).toISOString()).limit(1);
      if (!recentInbound?.length) {
        throw new Error("Por seguran\xE7a, s\xF3 \xE9 poss\xEDvel responder contatos que mandaram mensagem nas \xFAltimas 24h. Para iniciar conversa, use a API oficial com template aprovado.");
      }
      const { data: recentOutbound } = await supabase.from("mensagens").select("id").eq("company_id", companyId).eq("numero", data.numero).eq("direcao", "saida").gte("created_at", new Date(Date.now() - 10 * 6e4).toISOString()).limit(6);
      if ((recentOutbound?.length ?? 0) >= 6) {
        throw new Error("Envio pausado por alguns minutos para proteger a qualidade do n\xFAmero.");
      }
      const { assertWithinLimit } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
      await assertWithinLimit(companyId, "mensagens");
      const { evoSendText } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
      try {
        await evoSendText(inst.instance_name, data.numero, data.texto);
      } catch (e) {
        throw new Error(`Falha ao enviar: ${e?.message ?? e}`);
      }
      const { error } = await supabase.from("mensagens").insert({
        company_id: companyId,
        user_id: userId,
        numero: data.numero,
        contato_nome: data.contatoNome ?? null,
        direcao: "saida",
        autor: "humano",
        texto: data.texto
      });
      if (error)
        throw new Error(error.message);
      await supabase.from("contact_pause").upsert({ company_id: companyId, user_id: userId, numero: data.numero, pausado: true }, { onConflict: "company_id,numero" });
      return { ok: true };
    });
    exports.setContactIaActive = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { error } = await supabase.from("contact_pause").upsert({ company_id: companyId, user_id: userId, numero: data.numero, pausado: !data.ativa }, { onConflict: "company_id,numero" });
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.testAiReply = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const companyId = await resolveCompanyId(supabase, userId);
      const { lovableAiChat } = await Promise.resolve().then(() => __importStar(require2("src/lib/lovable-ai.server")));
      const { buildSystemPrompt, parseAiOutput } = await Promise.resolve().then(() => __importStar(require2("src/lib/ai-prompt")));
      const [{ data: cfg }, { data: stagesRows }, { data: prodRows }] = await Promise.all([
        supabase.from("agent_config").select("*").eq("company_id", companyId).maybeSingle(),
        supabase.from("crm_stage").select("nome, tipo, ordem").eq("company_id", companyId).order("ordem", { ascending: true }),
        supabase.from("produto").select("nome, preco, descricao, ordem").eq("company_id", companyId).eq("ativo", true).order("ordem", { ascending: true })
      ]);
      const stages = (stagesRows ?? []).map((s) => ({ nome: s.nome, tipo: s.tipo }));
      const produtos = (prodRows ?? []).map((p) => ({ nome: p.nome, preco: p.preco, descricao: p.descricao }));
      const system = buildSystemPrompt(cfg ?? {}, {
        responderEmPartes: cfg?.responder_em_partes ?? true,
        stages,
        produtos
      });
      const { getCompanyPlan } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
      const { allowsProvider, PLAN_LABEL } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-features")));
      const plan = await getCompanyPlan(companyId);
      let provider = cfg?.ai_provider || "gemini";
      let model = cfg?.ai_model || "google/gemini-2.5-flash";
      if (!allowsProvider(plan.slug, provider)) {
        throw new Error(`O provedor ${provider.toUpperCase()} n\xE3o est\xE1 incluso no plano ${PLAN_LABEL[plan.slug]}. Fa\xE7a upgrade para Pro para usar GPT/Claude.`);
      }
      const raw = await lovableAiChat([
        { role: "system", content: system },
        { role: "user", content: data.message }
      ], { provider, model });
      const { parts, stage } = parseAiOutput(raw, stages);
      return { reply: parts.join("\n\n"), parts, stage, system };
    });
  },
  "src/lib/plan-limits.server": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCompanyPlan = getCompanyPlan;
    exports.getCompanyUsage = getCompanyUsage;
    exports.getCompanyPlanUsage = getCompanyPlanUsage;
    exports.assertWithinLimit = assertWithinLimit;
    exports.isWithinLimit = isWithinLimit;
    const plan_features_1 = require2("src/lib/plan-features");
    function startOfMonthISO() {
      const d = /* @__PURE__ */ new Date();
      return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
    }
    async function getCompanyPlan(companyId) {
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: sub } = await supabaseAdmin.from("subscription").select("plan_id, status, plan:plan(slug, nome, limite_instancias, limite_mensagens, limite_usuarios, limite_contatos)").eq("company_id", companyId).in("status", ["active", "trialing", "past_due"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
      let row = sub?.plan ?? null;
      if (!row) {
        const { data: company } = await supabaseAdmin.from("company").select("selected_plan_slug, status_cobranca, trial_ate").eq("id", companyId).maybeSingle();
        const trialValid = company?.status_cobranca === "trial" && !!company?.trial_ate && new Date(company.trial_ate).getTime() > Date.now();
        if (trialValid && company?.selected_plan_slug) {
          const { data: selected } = await supabaseAdmin.from("plan").select("slug, nome, limite_instancias, limite_mensagens, limite_usuarios, limite_contatos").eq("slug", company.selected_plan_slug).eq("ativo", true).maybeSingle();
          row = selected;
        }
      }
      if (!row) {
        const { data: fallback } = await supabaseAdmin.from("plan").select("slug, nome, limite_instancias, limite_mensagens, limite_usuarios, limite_contatos").eq("slug", "starter").maybeSingle();
        row = fallback;
      }
      const slug = (0, plan_features_1.normalizePlanSlug)(row?.slug);
      return {
        slug,
        nome: row?.nome || plan_features_1.PLAN_LABEL[slug],
        limites: {
          instancias: Number(row?.limite_instancias ?? 1),
          usuarios: Number(row?.limite_usuarios ?? 1),
          contatos: Number(row?.limite_contatos ?? 1e3),
          mensagens: Number(row?.limite_mensagens ?? 1500)
        }
      };
    }
    async function getCompanyUsage(companyId) {
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const monthStart = startOfMonthISO();
      const [inst, users, contatos, msgs] = await Promise.all([
        supabaseAdmin.from("whatsapp_instances").select("instance_name", { count: "exact", head: true }).eq("company_id", companyId),
        supabaseAdmin.from("company_user").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("ativo", true),
        supabaseAdmin.from("crm_cards").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabaseAdmin.from("mensagens").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("direcao", "saida").gte("created_at", monthStart)
      ]);
      return {
        instancias: inst.count ?? 0,
        usuarios: users.count ?? 0,
        contatos: contatos.count ?? 0,
        mensagens: msgs.count ?? 0
      };
    }
    async function getCompanyPlanUsage(companyId) {
      const [plan, usage] = await Promise.all([getCompanyPlan(companyId), getCompanyUsage(companyId)]);
      return { plan, usage };
    }
    const LIMIT_MSG = {
      instancias: (p, n) => `Seu plano ${p} permite at\xE9 ${n} n\xFAmero${n === 1 ? "" : "s"} de WhatsApp. Fa\xE7a upgrade para conectar mais.`,
      usuarios: (p, n) => `Seu plano ${p} permite at\xE9 ${n} usu\xE1rio${n === 1 ? "" : "s"} na equipe. Fa\xE7a upgrade para adicionar mais.`,
      contatos: (p, n) => `Seu plano ${p} permite at\xE9 ${n.toLocaleString("pt-BR")} contatos. Fa\xE7a upgrade para cadastrar mais.`,
      mensagens: (p, n) => `Seu plano ${p} permite at\xE9 ${n.toLocaleString("pt-BR")} mensagens enviadas por m\xEAs. Fa\xE7a upgrade para continuar respondendo.`
    };
    async function assertWithinLimit(companyId, tipo, delta = 1) {
      const [plan, usage] = await Promise.all([getCompanyPlan(companyId), getCompanyUsage(companyId)]);
      const limite = plan.limites[tipo];
      const atual = usage[tipo];
      if (atual + delta > limite) {
        throw new Error(LIMIT_MSG[tipo](plan.nome, limite));
      }
    }
    async function isWithinLimit(companyId, tipo, delta = 1) {
      const [plan, usage] = await Promise.all([getCompanyPlan(companyId), getCompanyUsage(companyId)]);
      return usage[tipo] + delta <= plan.limites[tipo];
    }
  },
  "src/lib/plan-features": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PLAN_LABEL = exports.PLAN_FEATURES = void 0;
    exports.normalizePlanSlug = normalizePlanSlug;
    exports.featuresFor = featuresFor;
    exports.allowsProvider = allowsProvider;
    exports.PLAN_FEATURES = {
      starter: {
        providersIA: ["gemini"],
        googleCalendar: false,
        automacoes: false,
        apiWebhooks: false,
        relatoriosAvancados: false,
        suportePrioritario: false,
        financeiro: false
      },
      pro: {
        providersIA: ["gemini", "openai", "anthropic"],
        googleCalendar: true,
        automacoes: true,
        apiWebhooks: false,
        relatoriosAvancados: true,
        suportePrioritario: true,
        financeiro: true
      },
      business: {
        providersIA: ["gemini", "openai", "anthropic"],
        googleCalendar: true,
        automacoes: true,
        apiWebhooks: true,
        relatoriosAvancados: true,
        suportePrioritario: true,
        financeiro: true
      }
    };
    exports.PLAN_LABEL = {
      starter: "Starter",
      pro: "Pro",
      business: "Business"
    };
    function normalizePlanSlug(slug) {
      const s = String(slug || "").toLowerCase();
      if (s === "pro" || s === "business" || s === "starter")
        return s;
      return "starter";
    }
    function featuresFor(slug) {
      return exports.PLAN_FEATURES[normalizePlanSlug(slug)];
    }
    function allowsProvider(slug, provider) {
      const f = featuresFor(slug);
      return f.providersIA.includes(provider);
    }
  },
  "src/lib/financeiro.functions": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.finStatus = exports.deleteCategoria = exports.upsertCategoria = exports.deleteLancamento = exports.marcarPago = exports.upsertLancamento = exports.listCategorias = exports.listLancamentos = exports.finKpis = exports.enableFinanceiro = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function getCompanyAndPlan(supabase, userId) {
      const { data: cu } = await supabase.from("company_user").select("company_id, role, company:company(*)").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!cu)
        throw new Error("Sem empresa vinculada");
      const { data: sub } = await supabase.from("subscription").select("plan:plan(nome)").eq("company_id", cu.company_id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const planSlug = String(sub?.plan?.nome || "starter").toLowerCase();
      return { companyId: cu.company_id, role: cu.role, company: cu.company, planSlug };
    }
    function planAllowsFin(planSlug) {
      const s = planSlug.toLowerCase();
      return s === "pro" || s === "business";
    }
    async function assertCanWrite(supabase, userId) {
      const ctx = await getCompanyAndPlan(supabase, userId);
      if (!planAllowsFin(ctx.planSlug))
        throw new Error("Plano n\xE3o permite m\xF3dulo financeiro");
      if (!ctx.company?.financeiro_ativo)
        throw new Error("M\xF3dulo financeiro desativado");
      return ctx;
    }
    exports.enableFinanceiro = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => ({
      enable: !!d.enable,
      diasVencimentoPadrao: Math.max(0, Math.min(60, Math.floor(d.diasVencimentoPadrao ?? 7)))
    })).handler(async ({ context, data }) => {
      const ctx = await getCompanyAndPlan(context.supabase, context.userId);
      if (data.enable && !planAllowsFin(ctx.planSlug)) {
        throw new Error("Dispon\xEDvel nos planos Pro e Business");
      }
      if (!["owner", "admin"].includes(ctx.role))
        throw new Error("Apenas dono ou admin");
      const { error } = await context.supabase.rpc("fin_enable_for_company", {
        _company_id: ctx.companyId,
        _enable: data.enable
      });
      if (error)
        throw new Error(error.message);
      if (data.enable) {
        await context.supabase.from("company").update({ financeiro_dias_vencimento_padrao: data.diasVencimentoPadrao }).eq("id", ctx.companyId);
      }
      return { ok: true };
    });
    exports.finKpis = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      const sb = context.supabase;
      const now = /* @__PURE__ */ new Date();
      const inicioMes = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const fimMes = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      const hoje = now.toISOString().slice(0, 10);
      const baseSel = "tipo, valor_cents, status, vencimento, competencia, categoria:categoria_id(nome,cor)";
      const { data: all } = await sb.from("fin_lancamento").select(baseSel).eq("company_id", ctx.companyId).gte("competencia", new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().slice(0, 10));
      const rows = all ?? [];
      const receitaMes = rows.filter((r) => r.tipo === "receita" && r.status === "pago" && r.competencia >= inicioMes && r.competencia <= fimMes).reduce((s, r) => s + Number(r.valor_cents), 0);
      const despesaMes = rows.filter((r) => r.tipo === "despesa" && r.status === "pago" && r.competencia >= inicioMes && r.competencia <= fimMes).reduce((s, r) => s + Number(r.valor_cents), 0);
      const aReceber = rows.filter((r) => r.tipo === "receita" && (r.status === "pendente" || r.status === "atrasado")).reduce((s, r) => s + Number(r.valor_cents), 0);
      const aPagar = rows.filter((r) => r.tipo === "despesa" && (r.status === "pendente" || r.status === "atrasado")).reduce((s, r) => s + Number(r.valor_cents), 0);
      const atrasados = rows.filter((r) => (r.status === "pendente" || r.status === "atrasado") && r.vencimento < hoje).length;
      const series = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ini = d.toISOString().slice(0, 10);
        const fim = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().slice(0, 10);
        const r = rows.filter((x) => x.tipo === "receita" && x.status === "pago" && x.competencia >= ini && x.competencia <= fim).reduce((s, x) => s + Number(x.valor_cents), 0);
        const p = rows.filter((x) => x.tipo === "despesa" && x.status === "pago" && x.competencia >= ini && x.competencia <= fim).reduce((s, x) => s + Number(x.valor_cents), 0);
        series.push({ mes: d.toLocaleDateString("pt-BR", { month: "short" }), receita: r, despesa: p });
      }
      const catMap = {};
      for (const r of rows) {
        if (r.tipo !== "despesa")
          continue;
        const k = r.categoria?.nome ?? "Sem categoria";
        catMap[k] ??= { nome: k, cor: r.categoria?.cor ?? "#999", valor: 0 };
        catMap[k].valor += Number(r.valor_cents);
      }
      const topCategorias = Object.values(catMap).sort((a, b) => b.valor - a.valor).slice(0, 5);
      const d7 = new Date(now.getTime() + 7 * 864e5).toISOString().slice(0, 10);
      const { data: prox } = await sb.from("fin_lancamento").select("id, tipo, descricao, valor_cents, vencimento, status").eq("company_id", ctx.companyId).in("status", ["pendente", "atrasado"]).lte("vencimento", d7).order("vencimento", { ascending: true }).limit(10);
      return {
        receitaMes,
        despesaMes,
        saldoMes: receitaMes - despesaMes,
        aReceber,
        aPagar,
        atrasados,
        series,
        topCategorias,
        proximos: prox ?? []
      };
    });
    exports.listLancamentos = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      let q = context.supabase.from("fin_lancamento").select("*, categoria:categoria_id(id,nome,cor,tipo)").eq("company_id", ctx.companyId).order("vencimento", { ascending: false }).limit(500);
      if (data.tipo)
        q = q.eq("tipo", data.tipo);
      if (data.status && data.status !== "todos")
        q = q.eq("status", data.status);
      if (data.from)
        q = q.gte("vencimento", data.from);
      if (data.to)
        q = q.lte("vencimento", data.to);
      if (data.q)
        q = q.ilike("descricao", `%${data.q}%`);
      const { data: rows, error } = await q;
      if (error)
        throw new Error(error.message);
      return rows ?? [];
    });
    exports.listCategorias = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      const { data } = await context.supabase.from("fin_categoria").select("*").eq("company_id", ctx.companyId).order("tipo").order("nome");
      return data ?? [];
    });
    exports.upsertLancamento = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const valor = Math.round(Number(d.valor_reais ?? 0) * 100);
      if (!d.descricao || String(d.descricao).trim().length < 2)
        throw new Error("Descri\xE7\xE3o obrigat\xF3ria");
      if (!d.vencimento)
        throw new Error("Vencimento obrigat\xF3rio");
      if (!["receita", "despesa"].includes(d.tipo))
        throw new Error("Tipo inv\xE1lido");
      if (valor < 0)
        throw new Error("Valor inv\xE1lido");
      return {
        id: d.id ?? null,
        tipo: d.tipo,
        descricao: String(d.descricao).trim(),
        valor_cents: valor,
        categoria_id: d.categoria_id || null,
        forma_pagamento: d.forma_pagamento || null,
        status: d.status || "pendente",
        vencimento: d.vencimento,
        pago_em: d.pago_em || null,
        competencia: d.competencia || d.vencimento,
        observacao: d.observacao || null
      };
    }).handler(async ({ context, data }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      if (data.id) {
        const { id, ...rest2 } = data;
        const { error: error2 } = await context.supabase.from("fin_lancamento").update(rest2).eq("id", id).eq("company_id", ctx.companyId);
        if (error2)
          throw new Error(error2.message);
        return { ok: true, id };
      }
      const { id: _i, ...rest } = data;
      const { data: ins, error } = await context.supabase.from("fin_lancamento").insert({ ...rest, company_id: ctx.companyId, created_by: context.userId }).select("id").single();
      if (error)
        throw new Error(error.message);
      return { ok: true, id: ins.id };
    });
    exports.marcarPago = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      const patch = data.pago ? { status: "pago", pago_em: data.pagoEm || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) } : { status: "pendente", pago_em: null };
      const { error } = await context.supabase.from("fin_lancamento").update(patch).eq("id", data.id).eq("company_id", ctx.companyId);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.deleteLancamento = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      const { error } = await context.supabase.from("fin_lancamento").delete().eq("id", data.id).eq("company_id", ctx.companyId);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.upsertCategoria = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      if (!d.nome || d.nome.trim().length < 2)
        throw new Error("Nome inv\xE1lido");
      if (!["receita", "despesa"].includes(d.tipo))
        throw new Error("Tipo inv\xE1lido");
      return d;
    }).handler(async ({ context, data }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      if (data.id) {
        const { error: error2 } = await context.supabase.from("fin_categoria").update({ nome: data.nome.trim(), tipo: data.tipo, cor: data.cor ?? "#8AA89A", ativo: data.ativo ?? true }).eq("id", data.id).eq("company_id", ctx.companyId);
        if (error2)
          throw new Error(error2.message);
        return { ok: true };
      }
      const { error } = await context.supabase.from("fin_categoria").insert({ company_id: ctx.companyId, nome: data.nome.trim(), tipo: data.tipo, cor: data.cor ?? "#8AA89A" });
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.deleteCategoria = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const ctx = await assertCanWrite(context.supabase, context.userId);
      const { error } = await context.supabase.from("fin_categoria").delete().eq("id", data.id).eq("company_id", ctx.companyId);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.finStatus = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const ctx = await getCompanyAndPlan(context.supabase, context.userId);
      return {
        ativo: !!ctx.company?.financeiro_ativo,
        diasVencimento: Number(ctx.company?.financeiro_dias_vencimento_padrao ?? 7),
        planoPermite: planAllowsFin(ctx.planSlug),
        planSlug: ctx.planSlug,
        role: ctx.role
      };
    });
  },
  "src/lib/google.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createGoogleCalendarEvent = exports.disconnectGoogle = exports.startGoogleOAuth = void 0;
    const buffer_1 = require2("buffer");
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function buildOrigin() {
      const { getRequest } = await Promise.resolve().then(() => __importStar(require2("@tanstack/react-start/server")));
      const req = getRequest();
      const u = new URL(req.url);
      return `${u.protocol}//${u.host}`;
    }
    exports.startGoogleOAuth = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId || !process.env.GOOGLE_CLIENT_SECRET) {
        return { ok: false, error: "Google OAuth n\xE3o configurado. Pe\xE7a ao administrador para definir GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET." };
      }
      const { supabase, userId } = context;
      const { data: cu } = await supabase.from("company_user").select("company_id").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!cu)
        return { ok: false, error: "Sem empresa." };
      const { getCompanyPlan } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
      const { featuresFor, PLAN_LABEL } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-features")));
      const plan = await getCompanyPlan(cu.company_id);
      if (!featuresFor(plan.slug).googleCalendar) {
        return { ok: false, error: `Google Agenda n\xE3o est\xE1 incluso no plano ${PLAN_LABEL[plan.slug]}. Fa\xE7a upgrade para Pro.` };
      }
      const origin = await buildOrigin();
      const redirectUri = `${origin}/api/public/google-callback`;
      const payload = buffer_1.Buffer.from(JSON.stringify({ companyId: cu.company_id, t: Date.now() })).toString("base64").replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
      const { signState } = await Promise.resolve().then(() => __importStar(require2("src/lib/google.server")));
      const state = signState(payload);
      const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
      url.searchParams.set("client_id", clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("response_type", "code");
      url.searchParams.set("access_type", "offline");
      url.searchParams.set("prompt", "consent");
      url.searchParams.set("include_granted_scopes", "true");
      url.searchParams.set("scope", "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/userinfo.email");
      url.searchParams.set("state", state);
      return { ok: true, url: url.toString() };
    });
    exports.disconnectGoogle = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { supabase, userId } = context;
      const { data: cu } = await supabase.from("company_user").select("company_id,role").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!cu || !["owner", "admin"].includes(cu.role))
        return { ok: false };
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      await supabaseAdmin.from("google_integration").upsert({ company_id: cu.company_id, conectado: false, access_token: null, refresh_token: null, expiry: null, email: null, calendar_id: null }, { onConflict: "company_id" });
      return { ok: true };
    });
    exports.createGoogleCalendarEvent = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const { data: cu } = await supabase.from("company_user").select("company_id").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!cu)
        throw new Error("Sem empresa");
      const companyId = cu.company_id;
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: gi } = await supabaseAdmin.from("google_integration").select("*").eq("company_id", companyId).maybeSingle();
      if (!gi?.conectado)
        throw new Error("Google Agenda n\xE3o conectado");
      let accessToken = gi.access_token;
      if (gi.expiry && new Date(gi.expiry).getTime() < Date.now() + 6e4 && gi.refresh_token) {
        const tokRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: gi.refresh_token,
            grant_type: "refresh_token"
          })
        });
        const tok = await tokRes.json();
        if (tok.access_token) {
          accessToken = tok.access_token;
          await supabaseAdmin.from("google_integration").update({
            access_token: accessToken,
            expiry: new Date(Date.now() + (tok.expires_in ?? 3600) * 1e3).toISOString()
          }).eq("company_id", companyId);
        }
      }
      const calendarId = gi.calendar_id || "primary";
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: data.titulo,
          description: data.descricao || "",
          start: { dateTime: data.inicio },
          end: { dateTime: data.fim }
        })
      });
      if (!res.ok)
        throw new Error(`Google API: ${res.status}`);
      const ev = await res.json();
      await supabase.from("agendamento").insert({
        company_id: companyId,
        card_id: data.cardId ?? null,
        titulo: data.titulo,
        inicio: data.inicio,
        fim: data.fim,
        google_event_id: ev.id,
        status: "agendado"
      });
      return { ok: true, eventId: ev.id };
    });
  },
  "src/lib/google.server": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.signState = signState;
    exports.verifyState = verifyState;
    exports.createCalendarEventForCompany = createCalendarEventForCompany;
    const buffer_1 = require2("buffer");
    const worker_crypto_1 = require2("src/lib/worker-crypto");
    const STATE_TTL_MS = 10 * 60 * 1e3;
    function stateSecret() {
      const secret = process.env.GOOGLE_OAUTH_STATE_SECRET || process.env.BLINK_SECRET_KEY;
      if (!secret)
        throw new Error("GOOGLE_OAUTH_STATE_SECRET n\xE3o configurado");
      return secret;
    }
    function signState(payload) {
      const sig = (0, worker_crypto_1.createHmac)("sha256", stateSecret()).update(payload).digest("base64url");
      return `${payload}.${sig}`;
    }
    function verifyState(state) {
      const parts = state.split(".");
      if (parts.length !== 2)
        return null;
      const [payload, sig] = parts;
      let expected;
      try {
        expected = (0, worker_crypto_1.createHmac)("sha256", stateSecret()).update(payload).digest("base64url");
      } catch {
        return null;
      }
      const suppliedBuffer = buffer_1.Buffer.from(sig);
      const expectedBuffer = buffer_1.Buffer.from(expected);
      if (suppliedBuffer.length !== expectedBuffer.length || !(0, worker_crypto_1.timingSafeEqual)(suppliedBuffer, expectedBuffer))
        return null;
      try {
        const obj = JSON.parse(buffer_1.Buffer.from(payload.replaceAll("-", "+").replaceAll("_", "/"), "base64").toString("utf8"));
        if (!obj.companyId || !Number.isFinite(obj.t) || Math.abs(Date.now() - Number(obj.t)) > STATE_TTL_MS)
          return null;
        return { companyId: obj.companyId };
      } catch {
        return null;
      }
    }
    async function createCalendarEventForCompany(admin, companyId, data) {
      const { data: gi } = await admin.from("google_integration").select("*").eq("company_id", companyId).maybeSingle();
      if (!gi?.conectado)
        throw new Error("Google Agenda n\xE3o conectado");
      let accessToken = gi.access_token;
      if (gi.expiry && new Date(gi.expiry).getTime() < Date.now() + 6e4 && gi.refresh_token) {
        const tokRes = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID || "",
            client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
            refresh_token: gi.refresh_token,
            grant_type: "refresh_token"
          })
        });
        const tok = await tokRes.json();
        if (tok.access_token) {
          accessToken = tok.access_token;
          await admin.from("google_integration").update({
            access_token: accessToken,
            expiry: new Date(Date.now() + (tok.expires_in ?? 3600) * 1e3).toISOString()
          }).eq("company_id", companyId);
        }
      }
      const calendarId = gi.calendar_id || "primary";
      const res = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: data.titulo,
          description: data.descricao || "",
          start: { dateTime: data.inicio },
          end: { dateTime: data.fim }
        })
      });
      if (!res.ok)
        throw new Error(`Google API: ${res.status}`);
      const ev = await res.json();
      await admin.from("agendamento").insert({
        company_id: companyId,
        card_id: data.cardId ?? null,
        titulo: data.titulo,
        inicio: data.inicio,
        fim: data.fim,
        google_event_id: ev.id,
        status: "agendado"
      });
      return { eventId: ev.id };
    }
  },
  "src/lib/worker-crypto": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.createHash = createHash;
    exports.createHmac = createHmac;
    exports.timingSafeEqual = timingSafeEqual;
    const sha2_js_1 = require2("@noble/hashes/sha2.js");
    const hmac_js_1 = require2("@noble/hashes/hmac.js");
    const buffer_1 = require2("buffer");
    function digestor(key) {
      const chunks = [];
      return { update(value) {
        chunks.push(new TextEncoder().encode(value));
        return this;
      }, digest(format) {
        const input = buffer_1.Buffer.concat(chunks);
        const result = key === void 0 ? (0, sha2_js_1.sha256)(input) : (0, hmac_js_1.hmac)(sha2_js_1.sha256, new TextEncoder().encode(key), input);
        if (!["hex", "base64url"].includes(format))
          throw new Error("Formato inv\xE1lido");
        const encoded = buffer_1.Buffer.from(result).toString(format === "base64url" ? "base64" : "hex");
        return format === "base64url" ? encoded.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "") : encoded;
      } };
    }
    function createHash(algorithm) {
      if (algorithm !== "sha256")
        throw new Error("Algoritmo inv\xE1lido");
      return digestor();
    }
    function createHmac(algorithm, key) {
      if (algorithm !== "sha256")
        throw new Error("Algoritmo inv\xE1lido");
      return digestor(key);
    }
    function timingSafeEqual(a, b) {
      if (a.length !== b.length)
        throw new Error("Tamanhos diferentes");
      let difference = 0;
      for (let i = 0; i < a.length; i++)
        difference |= a[i] ^ b[i];
      return difference === 0;
    }
  },
  "src/lib/integrations.functions": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.revokeApiToken = exports.createApiToken = exports.listApiTokens = exports.listWebhookLogs = exports.deleteWebhook = exports.saveWebhook = exports.listWebhooks = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function resolveCompanyAdmin(supabase, userId) {
      const { data } = await supabase.from("company_user").select("company_id, role").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!data)
        throw new Error("Sem empresa.");
      if (!["owner", "admin"].includes(data.role))
        throw new Error("Apenas dono ou administrador pode gerenciar integra\xE7\xF5es.");
      return data.company_id;
    }
    exports.listWebhooks = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const cid = await resolveCompanyAdmin(context.supabase, context.userId);
      const { data } = await context.supabase.from("webhook_endpoint").select("*").eq("company_id", cid).order("created_at", { ascending: false });
      return data ?? [];
    });
    exports.saveWebhook = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const cid = await resolveCompanyAdmin(context.supabase, context.userId);
      if (!/^https?:\/\//.test(data.url))
        throw new Error("URL deve come\xE7ar com http(s)://");
      const payload = { company_id: cid, nome: data.nome, url: data.url, eventos: data.eventos, ativo: data.ativo };
      if (data.id) {
        const { error } = await context.supabase.from("webhook_endpoint").update(payload).eq("id", data.id).eq("company_id", cid);
        if (error)
          throw new Error(error.message);
      } else {
        const { error } = await context.supabase.from("webhook_endpoint").insert(payload);
        if (error)
          throw new Error(error.message);
      }
      return { ok: true };
    });
    exports.deleteWebhook = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const cid = await resolveCompanyAdmin(context.supabase, context.userId);
      const { error } = await context.supabase.from("webhook_endpoint").delete().eq("id", data.id).eq("company_id", cid);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.listWebhookLogs = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const cid = await resolveCompanyAdmin(context.supabase, context.userId);
      const { data } = await context.supabase.from("webhook_delivery_log").select("*").eq("company_id", cid).order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    });
    exports.listApiTokens = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const cid = await resolveCompanyAdmin(context.supabase, context.userId);
      const { data } = await context.supabase.from("api_token").select("*").eq("company_id", cid).order("created_at", { ascending: false });
      return data ?? [];
    });
    exports.createApiToken = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const cid = await resolveCompanyAdmin(context.supabase, context.userId);
      const { data: sub } = await context.supabase.from("subscription").select("plan:plan(slug)").eq("company_id", cid).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const slug = sub?.plan?.slug ?? "starter";
      if (slug !== "business")
        throw new Error("API p\xFAblica dispon\xEDvel apenas no plano Business.");
      const { data: row, error } = await context.supabase.from("api_token").insert({ company_id: cid, label: data.label, criado_por: context.userId }).select("*").maybeSingle();
      if (error || !row)
        throw new Error(error?.message ?? "Falha.");
      return row;
    });
    exports.revokeApiToken = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const cid = await resolveCompanyAdmin(context.supabase, context.userId);
      const { error } = await context.supabase.from("api_token").update({ revogado: true }).eq("id", data.id).eq("company_id", cid);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
  },
  "src/lib/master.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getCompanyDetails = exports.resetCompanyOwnerPassword = exports.setSuperAdminEmails = exports.getSuperAdminEmails = exports.listPlansBasic = exports.createCompanyWithOwner = exports.extendTrial = exports.suspendCompany = exports.listCompanies = exports.listMasterSubscriptions = exports.masterKpis = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    const tenant_1 = require2("src/lib/tenant");
    async function assertSuper(supabase, userId) {
      const { data, error } = await supabase.from("user_roles").select("role").eq("user_id", userId).eq("role", "super_admin").maybeSingle();
      if (error)
        throw error;
      if (!data)
        throw new Error("Acesso negado");
    }
    exports.masterKpis = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const [{ data: companies }, { count: msgCount }, { count: cardsCount }, { data: subscriptions }] = await Promise.all([
        supabaseAdmin.from("company").select("id, status_cobranca, trial_ate, created_at"),
        supabaseAdmin.from("mensagens").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("crm_cards").select("id", { count: "exact", head: true }),
        supabaseAdmin.from("subscription").select("status, plan:plan(preco_cents)")
      ]);
      const now = /* @__PURE__ */ new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      const all = companies ?? [];
      const subs = subscriptions ?? [];
      const stats = {
        total: all.length,
        ativas: all.filter((c) => c.status_cobranca === "ativo").length,
        trial: all.filter((c) => c.status_cobranca === "trial").length,
        suspensas: all.filter((c) => c.status_cobranca === "suspenso").length,
        novasMes: all.filter((c) => new Date(c.created_at).getTime() >= monthStart).length,
        mensagens: msgCount ?? 0,
        cards: cardsCount ?? 0,
        assinaturasAtivas: subs.filter((s) => s.status === "active").length,
        assinaturasTrial: subs.filter((s) => s.status === "trialing").length,
        mrr: subs.filter((s) => s.status === "active").reduce((sum, s) => sum + (s.plan?.preco_cents ?? 0), 0)
      };
      const series = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const next = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
        const count = all.filter((c) => {
          const t = new Date(c.created_at).getTime();
          return t < next.getTime();
        }).length;
        series.push({ mes: d.toLocaleDateString("pt-BR", { month: "short" }), total: count });
      }
      return { stats, series };
    });
    exports.listMasterSubscriptions = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data, error } = await supabaseAdmin.from("subscription").select("*, plan:plan(nome,preco_cents,moeda,intervalo), company:company(nome,status_cobranca,email_corporativo)").order("created_at", { ascending: false });
      if (error)
        throw error;
      return { rows: data ?? [] };
    });
    exports.listCompanies = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => ({
      search: (d.search ?? "").trim().toLowerCase(),
      page: Math.max(0, d.page ?? 0)
    })).handler(async ({ context, data }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const pageSize = 20;
      let q = supabaseAdmin.from("company").select("*", { count: "exact" }).order("created_at", { ascending: false }).range(data.page * pageSize, data.page * pageSize + pageSize - 1);
      if (data.search)
        q = q.ilike("nome", `%${data.search}%`);
      const { data: rows, count, error } = await q;
      if (error)
        throw error;
      const ids = (rows ?? []).map((c) => c.id);
      let ultByCompany = {};
      if (ids.length) {
        const { data: msgs } = await supabaseAdmin.from("mensagens").select("company_id, created_at").in("company_id", ids).order("created_at", { ascending: false }).limit(500);
        for (const m of msgs ?? []) {
          if (!ultByCompany[m.company_id])
            ultByCompany[m.company_id] = m.created_at;
        }
      }
      const list = (rows ?? []).map((c) => ({ ...c, ultima_atividade: ultByCompany[c.id] ?? null }));
      return { rows: list, total: count ?? 0, pageSize };
    });
    exports.suspendCompany = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { error } = await supabaseAdmin.from("company").update({ status_cobranca: data.suspend ? "suspenso" : "ativo" }).eq("id", data.companyId);
      if (error)
        throw error;
      return { ok: true };
    });
    exports.extendTrial = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => ({
      companyId: d.companyId,
      days: Math.max(1, Math.min(365, Math.floor(d.days)))
    })).handler(async ({ context, data }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: c } = await supabaseAdmin.from("company").select("trial_ate").eq("id", data.companyId).maybeSingle();
      const base = c?.trial_ate ? new Date(c.trial_ate) : /* @__PURE__ */ new Date();
      const next = new Date(Math.max(base.getTime(), Date.now()) + data.days * 864e5);
      const { error } = await supabaseAdmin.from("company").update({ trial_ate: next.toISOString(), status_cobranca: "trial" }).eq("id", data.companyId);
      if (error)
        throw error;
      return { trial_ate: next.toISOString() };
    });
    exports.createCompanyWithOwner = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const nome = String(d.nome || "").trim();
      const ownerEmail = String(d.ownerEmail || "").trim().toLowerCase();
      if (nome.length < 2)
        throw new Error("Nome inv\xE1lido");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail))
        throw new Error("Email inv\xE1lido");
      const password = d.password ? String(d.password) : null;
      if (password && password.length < 8)
        throw new Error("Senha m\xEDnima de 8 caracteres");
      return {
        nome,
        ownerEmail,
        planId: d.planId || null,
        trialDays: Math.max(0, Math.min(90, Math.floor(d.trialDays ?? 3))),
        password
      };
    }).handler(async ({ context, data }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      let ownerId = null;
      const { data: prof } = await supabaseAdmin.from("profiles").select("user_id").eq("email", data.ownerEmail).maybeSingle();
      if (prof)
        ownerId = prof.user_id;
      let tempPassword = null;
      if (!ownerId) {
        tempPassword = data.password ?? Math.random().toString(36).slice(2, 10) + "A1!";
        const { data: c, error } = await supabaseAdmin.auth.admin.createUser({
          email: data.ownerEmail,
          password: tempPassword,
          email_confirm: true
        });
        if (error || !c.user)
          throw new Error(error?.message || "Falha ao criar usu\xE1rio");
        ownerId = c.user.id;
        await supabaseAdmin.from("profiles").upsert({ user_id: ownerId, email: data.ownerEmail });
      } else if (data.password) {
        const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(ownerId, {
          password: data.password,
          email_confirm: true
        });
        if (upErr)
          throw upErr;
        tempPassword = data.password;
      }
      let baseSlug = (0, tenant_1.slugify)(data.nome);
      let slug = baseSlug;
      for (let i = 1; i < 20; i++) {
        const { data: ex } = await supabaseAdmin.from("company").select("id").eq("slug", slug).maybeSingle();
        if (!ex)
          break;
        slug = `${baseSlug}-${i}`;
      }
      const trialMs = data.trialDays * 864e5;
      const trialEnd = new Date(Date.now() + trialMs).toISOString();
      const { data: comp, error: cErr } = await supabaseAdmin.from("company").insert({
        nome: data.nome,
        slug,
        created_by: ownerId,
        status_cobranca: data.trialDays > 0 ? "trial" : "ativo",
        trial_ate: trialEnd
      }).select("id").single();
      if (cErr || !comp)
        throw new Error(cErr?.message || "Falha ao criar empresa");
      await supabaseAdmin.from("company_user").insert({
        company_id: comp.id,
        user_id: ownerId,
        role: "owner",
        ativo: true,
        forcar_troca_senha: !data.password && !!tempPassword
      });
      if (data.planId) {
        await supabaseAdmin.from("subscription").insert({
          company_id: comp.id,
          plan_id: data.planId,
          status: data.trialDays > 0 ? "trialing" : "active",
          trial_ends_at: trialEnd,
          current_period_end: trialEnd
        });
      }
      return { ok: true, companyId: comp.id, tempPassword };
    });
    exports.listPlansBasic = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data } = await supabaseAdmin.from("plan").select("id, nome, preco_cents, moeda, intervalo, trial_days").eq("ativo", true).order("preco_cents", { ascending: true });
      return { plans: data ?? [] };
    });
    exports.getSuperAdminEmails = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data } = await supabaseAdmin.from("app_config").select("super_admin_emails").eq("id", true).maybeSingle();
      return { emails: data?.super_admin_emails ?? [] };
    });
    exports.setSuperAdminEmails = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const clean = Array.from(new Set((d.emails ?? []).map((e) => String(e).trim().toLowerCase()).filter(Boolean)));
      for (const e of clean) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))
          throw new Error(`Email inv\xE1lido: ${e}`);
      }
      return { emails: clean };
    }).handler(async ({ context, data }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { error } = await supabaseAdmin.from("app_config").upsert({ id: true, super_admin_emails: data.emails });
      if (error)
        throw error;
      if (data.emails.length) {
        const { data: profs } = await supabaseAdmin.from("profiles").select("user_id, email").in("email", data.emails);
        for (const p of profs ?? []) {
          await supabaseAdmin.from("user_roles").upsert({ user_id: p.user_id, role: "super_admin" }, { onConflict: "user_id,role" });
        }
      }
      return { ok: true };
    });
    exports.resetCompanyOwnerPassword = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => ({
      companyId: String(d.companyId),
      newPassword: d.newPassword ? String(d.newPassword) : void 0
    })).handler(async ({ context, data }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: cu } = await supabaseAdmin.from("company_user").select("user_id, role").eq("company_id", data.companyId).eq("ativo", true).order("created_at", { ascending: true });
      const owner = (cu ?? []).find((r) => r.role === "owner") ?? (cu ?? [])[0];
      if (!owner)
        throw new Error("Empresa sem usu\xE1rio respons\xE1vel");
      const password = data.newPassword && data.newPassword.length >= 8 ? data.newPassword : Math.random().toString(36).slice(2, 10) + "A1!";
      const { error: uErr } = await supabaseAdmin.auth.admin.updateUserById(owner.user_id, {
        password,
        email_confirm: true
      });
      if (uErr)
        throw uErr;
      if (!data.newPassword) {
        await supabaseAdmin.from("company_user").update({ forcar_troca_senha: true }).eq("company_id", data.companyId).eq("user_id", owner.user_id);
      }
      const { data: prof } = await supabaseAdmin.from("profiles").select("email").eq("user_id", owner.user_id).maybeSingle();
      return { ok: true, tempPassword: data.newPassword ? null : password, ownerEmail: prof?.email ?? null };
    });
    exports.getCompanyDetails = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => ({ companyId: String(d.companyId) })).handler(async ({ context, data }) => {
      await assertSuper(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: company, error } = await supabaseAdmin.from("company").select("*").eq("id", data.companyId).maybeSingle();
      if (error)
        throw error;
      if (!company)
        throw new Error("Empresa n\xE3o encontrada");
      const { data: members } = await supabaseAdmin.from("company_user").select("user_id, role, ativo, created_at").eq("company_id", data.companyId).order("created_at", { ascending: true });
      const userIds = (members ?? []).map((m) => m.user_id);
      let profilesById = {};
      if (userIds.length) {
        const { data: profs } = await supabaseAdmin.from("profiles").select("user_id, email, nome, telefone").in("user_id", userIds);
        for (const p of profs ?? [])
          profilesById[p.user_id] = p;
      }
      const membersFull = (members ?? []).map((m) => ({
        ...m,
        profile: profilesById[m.user_id] ?? null
      }));
      const { data: subscription } = await supabaseAdmin.from("subscription").select("*, plan:plan(nome, preco_cents, moeda, intervalo)").eq("company_id", data.companyId).maybeSingle();
      const [{ count: msgCount }, { count: contactsCount }, { count: cardsCount }] = await Promise.all([
        supabaseAdmin.from("mensagens").select("id", { count: "exact", head: true }).eq("company_id", data.companyId),
        supabaseAdmin.from("crm_cards").select("id", { count: "exact", head: true }).eq("company_id", data.companyId),
        supabaseAdmin.from("crm_cards").select("id", { count: "exact", head: true }).eq("company_id", data.companyId)
      ]);
      return {
        company,
        members: membersFull,
        subscription,
        stats: {
          mensagens: msgCount ?? 0,
          contatos: contactsCount ?? 0,
          cards: cardsCount ?? 0
        }
      };
    });
  },
  "src/lib/plan.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.importContacts = exports.createContact = exports.getPlanUsage = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function resolveCompanyId(supabase, userId) {
      const { data, error } = await supabase.from("company_user").select("company_id").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error)
        throw error;
      if (!data)
        throw new Error("Sem empresa.");
      return data.company_id;
    }
    exports.getPlanUsage = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const companyId = await resolveCompanyId(context.supabase, context.userId);
      const { getCompanyPlanUsage } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
      return getCompanyPlanUsage(companyId);
    });
    exports.createContact = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const numero = String(d.numero || "").replace(/\D/g, "");
      if (numero.length < 8)
        throw new Error("N\xFAmero inv\xE1lido.");
      return { numero, nome: (d.nome ?? "").toString().trim() || null };
    }).handler(async ({ context, data }) => {
      const companyId = await resolveCompanyId(context.supabase, context.userId);
      const { assertWithinLimit } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
      const { data: existing } = await context.supabase.from("crm_cards").select("id").eq("company_id", companyId).eq("numero", data.numero).maybeSingle();
      if (!existing)
        await assertWithinLimit(companyId, "contatos");
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: firstStage } = await supabaseAdmin.from("crm_stage").select("id, nome").eq("company_id", companyId).order("ordem", { ascending: true }).limit(1).maybeSingle();
      const { error } = await supabaseAdmin.from("crm_cards").upsert({
        company_id: companyId,
        user_id: context.userId,
        numero: data.numero,
        nome: data.nome,
        status: firstStage?.nome ?? "Conversas",
        stage_id: firstStage?.id ?? null,
        ultima_em: (/* @__PURE__ */ new Date()).toISOString()
      }, { onConflict: "company_id,numero" });
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.importContacts = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const list = Array.isArray(d.contatos) ? d.contatos : [];
      const clean = list.map((c) => ({ numero: String(c.numero || "").replace(/\D/g, ""), nome: (c.nome ?? "")?.toString().trim() || null })).filter((c) => c.numero.length >= 8);
      return { contatos: clean };
    }).handler(async ({ context, data }) => {
      const companyId = await resolveCompanyId(context.supabase, context.userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { getCompanyPlanUsage } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
      const numeros = data.contatos.map((c) => c.numero);
      let existingNumeros = /* @__PURE__ */ new Set();
      if (numeros.length) {
        const { data: ex } = await supabaseAdmin.from("crm_cards").select("numero").eq("company_id", companyId).in("numero", numeros);
        existingNumeros = new Set((ex ?? []).map((r) => r.numero));
      }
      const novos = data.contatos.filter((c) => !existingNumeros.has(c.numero));
      if (novos.length > 0) {
        const { plan, usage } = await getCompanyPlanUsage(companyId);
        if (usage.contatos + novos.length > plan.limites.contatos) {
          const restante = Math.max(0, plan.limites.contatos - usage.contatos);
          throw new Error(`Importa\xE7\xE3o excede o limite do plano ${plan.nome} (${plan.limites.contatos.toLocaleString("pt-BR")} contatos). Voc\xEA ainda pode adicionar ${restante.toLocaleString("pt-BR")}.`);
        }
      }
      const { data: firstStage } = await supabaseAdmin.from("crm_stage").select("id, nome").eq("company_id", companyId).order("ordem", { ascending: true }).limit(1).maybeSingle();
      const payload = data.contatos.map((c) => ({
        company_id: companyId,
        user_id: context.userId,
        numero: c.numero,
        nome: c.nome,
        status: firstStage?.nome ?? "Conversas",
        stage_id: firstStage?.id ?? null,
        ultima_em: (/* @__PURE__ */ new Date()).toISOString()
      }));
      if (payload.length === 0)
        return { ok: true, inseridos: 0 };
      const { error } = await supabaseAdmin.from("crm_cards").upsert(payload, { onConflict: "company_id,numero" });
      if (error)
        throw new Error(error.message);
      return { ok: true, inseridos: novos.length };
    });
  },
  "src/lib/security.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.exportLgpd = exports.listAuditLog = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function resolveCompanyId(supabase, userId) {
      const { data } = await supabase.from("company_user").select("company_id, role").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!data)
        throw new Error("Sem empresa.");
      return data.company_id;
    }
    async function requireOwnerOrAdmin(supabase, userId) {
      const { data } = await supabase.from("company_user").select("company_id, role").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!data)
        throw new Error("Sem empresa.");
      if (!["owner", "admin"].includes(String(data.role)))
        throw new Error("Apenas owner/admin.");
      return data.company_id;
    }
    exports.listAuditLog = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const cid = await requireOwnerOrAdmin(context.supabase, context.userId);
      const { data } = await context.supabase.from("audit_log").select("*").eq("company_id", cid).order("created_at", { ascending: false }).limit(200);
      return data ?? [];
    });
    exports.exportLgpd = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const cid = await requireOwnerOrAdmin(context.supabase, context.userId);
      const s = context.supabase;
      const tables = [
        "company",
        "company_user",
        "profiles",
        "whatsapp_instances",
        "agent_config",
        "crm_stage",
        "crm_cards",
        "lead_nota",
        "lead_evento",
        "mensagens",
        "contact_pause",
        "agendamento",
        "produto",
        "message_template",
        "csat_response",
        "campaign",
        "campaign_target",
        "webhook_endpoint",
        "api_token",
        "audit_log"
      ];
      const out = {};
      for (const t of tables) {
        try {
          const tbl = s.from(t);
          const q = t === "company" ? tbl.select("*").eq("id", cid) : t === "profiles" ? tbl.select("*").eq("user_id", context.userId) : tbl.select("*").eq("company_id", cid);
          const { data } = await q;
          out[t] = data ?? [];
        } catch {
          out[t] = [];
        }
      }
      const { writeAudit } = await Promise.resolve().then(() => __importStar(require2("src/lib/audit.server")));
      await writeAudit({
        companyId: cid,
        userId: context.userId,
        actorEmail: context.claims?.email ?? null,
        acao: "lgpd.export",
        recurso: "company",
        detalhes: { tables: tables.length }
      });
      return {
        exported_at: (/* @__PURE__ */ new Date()).toISOString(),
        company_id: cid,
        data: out
      };
    });
  },
  "src/lib/audit.server": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.writeAudit = writeAudit;
    async function writeAudit(params) {
      try {
        const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
        await supabaseAdmin.from("audit_log").insert({
          company_id: params.companyId,
          user_id: params.userId ?? null,
          actor_email: params.actorEmail ?? null,
          acao: params.acao,
          recurso: params.recurso ?? null,
          detalhes: params.detalhes ?? {},
          ip: params.ip ?? null,
          user_agent: params.userAgent ?? null
        });
      } catch (e) {
        console.warn("[writeAudit]", e);
      }
    }
  },
  "src/lib/team.functions": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.setMemberRole = exports.setMemberActive = exports.inviteMember = exports.listTeam = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function getOwnedCompanyId(supabase, userId) {
      const { data, error } = await supabase.from("company_user").select("company_id, role").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (error)
        throw error;
      if (!data)
        throw new Error("Sem empresa.");
      return { companyId: data.company_id, role: data.role };
    }
    function assertAdmin(role) {
      if (role !== "owner" && role !== "admin") {
        throw new Error("Apenas owner/admin podem gerenciar a equipe.");
      }
    }
    exports.listTeam = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const { supabase, userId } = context;
      const { companyId } = await getOwnedCompanyId(supabase, userId);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data: members, error } = await supabaseAdmin.from("company_user").select("id, user_id, role, ativo, created_at").eq("company_id", companyId).order("created_at", { ascending: true });
      if (error)
        throw error;
      const ids = (members ?? []).map((m) => m.user_id);
      let profilesById = /* @__PURE__ */ new Map();
      if (ids.length) {
        const { data: profs } = await supabaseAdmin.from("profiles").select("user_id, email, nome").in("user_id", ids);
        (profs ?? []).forEach((p) => profilesById.set(p.user_id, { email: p.email, nome: p.nome }));
      }
      return {
        members: (members ?? []).map((m) => ({
          ...m,
          email: profilesById.get(m.user_id)?.email ?? null,
          nome: profilesById.get(m.user_id)?.nome ?? null
        }))
      };
    });
    exports.inviteMember = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const email = String(d.email || "").trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        throw new Error("Email inv\xE1lido");
      if (d.role !== "admin" && d.role !== "atendente")
        throw new Error("Role inv\xE1lida");
      return { email, role: d.role };
    }).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const { companyId, role } = await getOwnedCompanyId(supabase, userId);
      assertAdmin(role);
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      let targetUserId = null;
      const { data: prof } = await supabaseAdmin.from("profiles").select("user_id").eq("email", data.email).maybeSingle();
      if (prof)
        targetUserId = prof.user_id;
      if (targetUserId) {
        const { data: alreadyLinked } = await supabaseAdmin.from("company_user").select("id, ativo").eq("company_id", companyId).eq("user_id", targetUserId).maybeSingle();
        if (!alreadyLinked?.ativo) {
          const { assertWithinLimit } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
          await assertWithinLimit(companyId, "usuarios");
        }
      } else {
        const { assertWithinLimit } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
        await assertWithinLimit(companyId, "usuarios");
      }
      let tempPassword = null;
      if (!targetUserId) {
        tempPassword = Math.random().toString(36).slice(2, 10) + "A1!";
        const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
          email: data.email,
          password: tempPassword,
          email_confirm: true
        });
        if (cErr || !created.user)
          throw new Error(cErr?.message || "Falha ao criar usu\xE1rio");
        targetUserId = created.user.id;
        await supabaseAdmin.from("profiles").upsert({ user_id: targetUserId, email: data.email });
      }
      const { error: linkErr } = await supabaseAdmin.from("company_user").upsert({
        company_id: companyId,
        user_id: targetUserId,
        role: data.role,
        ativo: true,
        forcar_troca_senha: !!tempPassword
      }, { onConflict: "user_id,company_id" });
      if (linkErr)
        throw linkErr;
      return { ok: true, tempPassword };
    });
    exports.setMemberActive = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const { companyId, role } = await getOwnedCompanyId(supabase, userId);
      assertAdmin(role);
      if (data.ativo) {
        const { assertWithinLimit } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
        await assertWithinLimit(companyId, "usuarios");
      }
      const { error } = await supabase.from("company_user").update({ ativo: data.ativo }).eq("id", data.memberId);
      if (error)
        throw error;
      return { ok: true };
    });
    exports.setMemberRole = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => d).handler(async ({ context, data }) => {
      const { supabase, userId } = context;
      const { role } = await getOwnedCompanyId(supabase, userId);
      if (role !== "owner")
        throw new Error("Apenas o owner pode alterar pap\xE9is.");
      const { error } = await supabase.from("company_user").update({ role: data.role }).eq("id", data.memberId);
      if (error)
        throw error;
      return { ok: true };
    });
  },
  "src/lib/templates.functions": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getBusinessHours = exports.saveBusinessHours = exports.deleteTemplate = exports.saveTemplate = exports.listTemplates = void 0;
    const react_start_1 = require2("@tanstack/react-start");
    const auth_middleware_1 = require2("@/integrations/supabase/auth-middleware");
    async function currentCompanyId(supabase, userId) {
      const { data } = await supabase.from("company_user").select("company_id").eq("user_id", userId).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      if (!data?.company_id)
        throw new Error("Sem empresa ativa");
      return data.company_id;
    }
    exports.listTemplates = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const cid = await currentCompanyId(context.supabase, context.userId);
      const { data, error } = await context.supabase.from("message_template").select("id, atalho, texto, updated_at").eq("company_id", cid).order("atalho", { ascending: true });
      if (error)
        throw new Error(error.message);
      return data ?? [];
    });
    exports.saveTemplate = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const atalho = (d?.atalho || "").trim().replace(/^\/+/, "").slice(0, 40);
      const texto = (d?.texto || "").trim().slice(0, 2e3);
      if (!/^[a-z0-9_-]{2,40}$/i.test(atalho)) {
        throw new Error("Atalho: 2-40 caracteres, s\xF3 letras, n\xFAmeros, _ ou -");
      }
      if (texto.length < 1)
        throw new Error("Texto obrigat\xF3rio");
      return { id: d?.id, atalho: atalho.toLowerCase(), texto };
    }).handler(async ({ data, context }) => {
      const cid = await currentCompanyId(context.supabase, context.userId);
      if (data.id) {
        const { error: error2 } = await context.supabase.from("message_template").update({ atalho: data.atalho, texto: data.texto }).eq("id", data.id).eq("company_id", cid);
        if (error2)
          throw new Error(error2.message);
        return { ok: true };
      }
      const { error } = await context.supabase.from("message_template").insert({ company_id: cid, user_id: context.userId, atalho: data.atalho, texto: data.texto });
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.deleteTemplate = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      if (!d?.id)
        throw new Error("id obrigat\xF3rio");
      return { id: d.id };
    }).handler(async ({ data, context }) => {
      const cid = await currentCompanyId(context.supabase, context.userId);
      const { error } = await context.supabase.from("message_template").delete().eq("id", data.id).eq("company_id", cid);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.saveBusinessHours = (0, react_start_1.createServerFn)({ method: "POST" }).middleware([auth_middleware_1.requireSupabaseAuth]).inputValidator((d) => {
      const m = (d?.mensagem || "").trim().slice(0, 600);
      if (!m)
        throw new Error("Mensagem fora do hor\xE1rio obrigat\xF3ria");
      const h = d?.horarios;
      if (!h || typeof h !== "object")
        throw new Error("Hor\xE1rios inv\xE1lidos");
      return { horarios: h, mensagem: m };
    }).handler(async ({ data, context }) => {
      const cid = await currentCompanyId(context.supabase, context.userId);
      const { error } = await context.supabase.from("agent_config").update({ horarios_atendimento: data.horarios, mensagem_fora_horario: data.mensagem }).eq("company_id", cid);
      if (error)
        throw new Error(error.message);
      return { ok: true };
    });
    exports.getBusinessHours = (0, react_start_1.createServerFn)({ method: "GET" }).middleware([auth_middleware_1.requireSupabaseAuth]).handler(async ({ context }) => {
      const cid = await currentCompanyId(context.supabase, context.userId);
      const { data } = await context.supabase.from("agent_config").select("horarios_atendimento, mensagem_fora_horario").eq("company_id", cid).maybeSingle();
      return {
        horarios: data?.horarios_atendimento ?? null,
        mensagem: data?.mensagem_fora_horario ?? ""
      };
    });
  },
  "src/routes/api/public/google-callback": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Route = void 0;
    const react_router_1 = require2("@tanstack/react-router");
    const google_server_1 = require2("src/lib/google.server");
    exports.Route = (0, react_router_1.createFileRoute)("/api/public/google-callback")({
      server: {
        handlers: {
          GET: async ({ request }) => {
            const url = new URL(request.url);
            const code = url.searchParams.get("code");
            const state = url.searchParams.get("state");
            if (!code || !state)
              return new Response("missing params", { status: 400 });
            const v = (0, google_server_1.verifyState)(state);
            if (!v)
              return new Response("invalid state", { status: 400 });
            const clientId = process.env.GOOGLE_CLIENT_ID;
            const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
            if (!clientId || !clientSecret)
              return new Response("oauth not configured", { status: 500 });
            const redirectUri = `${url.protocol}//${url.host}/api/public/google-callback`;
            const tokRes = await fetch("https://oauth2.googleapis.com/token", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: "authorization_code"
              })
            });
            const tok = await tokRes.json();
            if (!tok.access_token) {
              return new Response(`token exchange failed: ${JSON.stringify(tok)}`, { status: 400 });
            }
            let email = null;
            try {
              const infoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: { Authorization: `Bearer ${tok.access_token}` }
              });
              const info = await infoRes.json();
              email = info?.email ?? null;
            } catch {
            }
            const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
            await supabaseAdmin.from("google_integration").upsert({
              company_id: v.companyId,
              email,
              access_token: tok.access_token,
              refresh_token: tok.refresh_token ?? null,
              expiry: new Date(Date.now() + (tok.expires_in ?? 3600) * 1e3).toISOString(),
              calendar_id: "primary",
              conectado: true
            }, { onConflict: "company_id" });
            return new Response(`<!doctype html><meta charset="utf-8"><title>Google conectado</title>
<body style="font-family:system-ui;background:#081410;color:#e5f3ea;display:grid;place-items:center;min-height:100vh;margin:0">
<div style="text-align:center;padding:24px">
<h1>\u2705 Google Agenda conectado${email ? ` (${email})` : ""}</h1>
<p>Pode fechar esta aba.</p>
<script>setTimeout(()=>{window.close();location.href=${JSON.stringify((process.env.PUBLIC_APP_URL || `https://${process.env.BLINK_PROJECT_ID}.blinkpowered.com`) + "/app/agente")}},1500)</script>
</div></body>`, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } });
          }
        }
      }
    });
  },
  "src/routes/api/public/whatsapp-webhook": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Route = void 0;
    const react_router_1 = require2("@tanstack/react-router");
    exports.Route = (0, react_router_1.createFileRoute)("/api/public/whatsapp-webhook")({
      server: {
        handlers: {
          POST: async ({ request }) => {
            try {
              const payload = await request.json().catch(() => ({}));
              const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
              const { evoSendText, evoSendPresence } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
              const { lovableAiChat } = await Promise.resolve().then(() => __importStar(require2("src/lib/lovable-ai.server")));
              const { buildSystemPrompt, parseAiOutput } = await Promise.resolve().then(() => __importStar(require2("src/lib/ai-prompt")));
              const event = payload?.event;
              const instanceName = payload?.instance || payload?.instanceName || payload?.data?.instance;
              if (!instanceName)
                return new Response("ok", { status: 200 });
              if (event && event !== "messages.upsert" && event !== "MESSAGES_UPSERT") {
                return new Response("ignored", { status: 200 });
              }
              const data = payload?.data ?? payload;
              const key = data?.key ?? {};
              const fromMe = !!key.fromMe;
              const whatsappMessageId = typeof key.id === "string" && key.id.trim() ? key.id.trim() : null;
              const remoteJid = key.remoteJid || "";
              if (!remoteJid)
                return new Response("no jid", { status: 200 });
              if (remoteJid.endsWith("@g.us"))
                return new Response("group", { status: 200 });
              if (fromMe)
                return new Response("fromMe", { status: 200 });
              const number = remoteJid.split("@")[0];
              const pushName = data?.pushName;
              const msg = data?.message ?? {};
              const mediaFallback = msg.audioMessage ? "[\xC1udio recebido \u2014 pe\xE7a ao contato para enviar a informa\xE7\xE3o por texto]" : msg.documentMessage ? `[Documento recebido${msg.documentMessage?.fileName ? `: ${msg.documentMessage.fileName}` : ""} \u2014 conte\xFAdo n\xE3o extra\xEDdo]` : msg.imageMessage ? "[Imagem recebida sem legenda \u2014 pe\xE7a uma breve descri\xE7\xE3o por texto]" : msg.videoMessage ? "[V\xEDdeo recebido sem legenda \u2014 pe\xE7a uma breve descri\xE7\xE3o por texto]" : msg.stickerMessage ? "[Figurinha recebida]" : "";
              const text = msg.conversation || msg.extendedTextMessage?.text || msg.imageMessage?.caption || msg.videoMessage?.caption || mediaFallback;
              if (!text || !text.trim())
                return new Response("no text", { status: 200 });
              const suppliedToken = new URL(request.url).searchParams.get("t") || request.headers.get("x-webhook-token") || "";
              const { data: inst } = await supabaseAdmin.from("whatsapp_instances").select("company_id, user_id, instance_name, webhook_token").eq("instance_name", instanceName).maybeSingle();
              if (!inst)
                return new Response("unknown instance", { status: 200 });
              if (!suppliedToken || suppliedToken !== inst.webhook_token) {
                return new Response("invalid webhook", { status: 401 });
              }
              const companyId = inst.company_id;
              const userId = inst.user_id;
              if (whatsappMessageId) {
                const { data: duplicate } = await supabaseAdmin.from("mensagens").select("id").eq("company_id", companyId).eq("whatsapp_message_id", whatsappMessageId).maybeSingle();
                if (duplicate)
                  return new Response("duplicate", { status: 200 });
              }
              const insertedAt = (/* @__PURE__ */ new Date()).toISOString();
              const { data: inserted } = await supabaseAdmin.from("mensagens").insert({
                company_id: companyId,
                user_id: userId,
                numero: number,
                contato_nome: pushName ?? null,
                direcao: "entrada",
                autor: "contato",
                texto: text,
                whatsapp_message_id: whatsappMessageId,
                created_at: insertedAt
              }).select("id, created_at").maybeSingle();
              const myCreatedAt = inserted?.created_at || insertedAt;
              try {
                const { emitWebhook } = await Promise.resolve().then(() => __importStar(require2("src/lib/webhooks.server")));
                void emitWebhook(companyId, "message.received", {
                  numero: number,
                  contato_nome: pushName ?? null,
                  texto: text,
                  message_id: inserted?.id
                });
              } catch {
              }
              try {
                const utmMatch = text.match(/\[utm:([^/\]]*)\/([^/\]]*)\/([^\]]*)\]/i);
                if (utmMatch) {
                  const [, s, m, c] = utmMatch;
                  await supabaseAdmin.from("crm_cards").update({
                    utm_source: s || null,
                    utm_medium: m || null,
                    utm_campaign: c || null
                  }).eq("company_id", companyId).eq("numero", number).is("utm_source", null);
                }
              } catch {
              }
              const { data: cfg } = await supabaseAdmin.from("agent_config").select("*").eq("company_id", companyId).maybeSingle();
              const palavraPausar = (cfg?.palavra_pausar || "/pausar").toLowerCase().trim();
              const palavraDespausar = (cfg?.palavra_despausar || "/despausar").toLowerCase().trim();
              const lower = text.toLowerCase().trim();
              const [{ data: stagesRows }, { data: produtosRows }] = await Promise.all([
                supabaseAdmin.from("crm_stage").select("id, nome, tipo, ordem").eq("company_id", companyId).order("ordem", { ascending: true }),
                supabaseAdmin.from("produto").select("nome, preco, descricao, ativo, ordem").eq("company_id", companyId).eq("ativo", true).order("ordem", { ascending: true })
              ]);
              const stages = stagesRows ?? [];
              const produtos = (produtosRows ?? []).map((p) => ({
                nome: p.nome,
                preco: p.preco,
                descricao: p.descricao
              }));
              if (isOptOutMessage(lower)) {
                await supabaseAdmin.from("contact_pause").upsert({ company_id: companyId, user_id: userId, numero: number, pausado: true }, { onConflict: "company_id,numero" });
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                return new Response("opt-out", { status: 200 });
              }
              if (lower === palavraPausar) {
                await supabaseAdmin.from("contact_pause").upsert({ company_id: companyId, user_id: userId, numero: number, pausado: true }, { onConflict: "company_id,numero" });
                return new Response("paused", { status: 200 });
              }
              if (lower === palavraDespausar) {
                await supabaseAdmin.from("contact_pause").upsert({ company_id: companyId, user_id: userId, numero: number, pausado: false }, { onConflict: "company_id,numero" });
                return new Response("resumed", { status: 200 });
              }
              const { data: pauseRow } = await supabaseAdmin.from("contact_pause").select("pausado").eq("company_id", companyId).eq("numero", number).maybeSingle();
              if (pauseRow?.pausado) {
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                return new Response("paused-contact", { status: 200 });
              }
              try {
                const { isWithinBusinessHours } = await Promise.resolve().then(() => __importStar(require2("src/lib/business-hours")));
                const horarios = cfg?.horarios_atendimento;
                if (horarios?.enabled && !isWithinBusinessHours(horarios)) {
                  const msgFora = cfg?.mensagem_fora_horario || "No momento estamos fora do hor\xE1rio de atendimento. Retornamos em breve.";
                  const { data: ultimaSaida } = await supabaseAdmin.from("mensagens").select("texto, created_at").eq("company_id", companyId).eq("numero", number).eq("direcao", "saida").order("created_at", { ascending: false }).limit(1).maybeSingle();
                  const ultimaFoiFora = ultimaSaida && ultimaSaida.texto === msgFora && Date.now() - new Date(ultimaSaida.created_at).getTime() < 6 * 60 * 6e4;
                  if (!ultimaFoiFora) {
                    try {
                      await evoSendText(instanceName, number, msgFora);
                      await supabaseAdmin.from("mensagens").insert({
                        company_id: companyId,
                        user_id: userId,
                        numero: number,
                        contato_nome: pushName ?? null,
                        direcao: "saida",
                        autor: "ia",
                        texto: msgFora
                      });
                    } catch (e) {
                      console.error("[off-hours send]", e?.message);
                    }
                  }
                  await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                  return new Response("off-hours", { status: 200 });
                }
              } catch (e) {
                console.error("[business-hours]", e?.message);
              }
              const bufferSec = Math.max(0, Math.min(20, Number(cfg?.segundos_buffer ?? 8)));
              if (bufferSec > 0) {
                await new Promise((r) => setTimeout(r, bufferSec * 1e3));
              }
              const { data: newer } = await supabaseAdmin.from("mensagens").select("id, created_at").eq("company_id", companyId).eq("numero", number).eq("direcao", "entrada").gt("created_at", myCreatedAt).limit(1);
              if (newer && newer.length > 0) {
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                return new Response("superseded", { status: 200 });
              }
              const { data: humanRecent } = await supabaseAdmin.from("mensagens").select("id, created_at, autor").eq("company_id", companyId).eq("numero", number).eq("direcao", "saida").eq("autor", "humano").gte("created_at", new Date(Date.now() - 9e4).toISOString()).limit(1);
              if (humanRecent && humanRecent.length > 0) {
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                return new Response("human-active", { status: 200 });
              }
              const { data: histDesc } = await supabaseAdmin.from("mensagens").select("autor,direcao,texto,created_at").eq("company_id", companyId).eq("numero", number).order("created_at", { ascending: false }).limit(25);
              const historico = (histDesc ?? []).slice().reverse();
              const { data: cardRow } = await supabaseAdmin.from("crm_cards").select("status, nome, stage_id").eq("company_id", companyId).eq("numero", number).maybeSingle();
              const estagioAtual = cardRow?.status || stages[0]?.nome || "Conversas";
              const resumoContato = `${cardRow?.nome || pushName || "Contato"} (${number}), ${historico.length} mensagens trocadas`;
              const { data: googleIntegration } = await supabaseAdmin.from("google_integration").select("conectado").eq("company_id", companyId).maybeSingle();
              const responderEmPartes = cfg?.responder_em_partes ?? true;
              const system = buildSystemPrompt(cfg ?? {}, {
                responderEmPartes,
                estagioAtual,
                resumoContato,
                produtos,
                stages: stages.map((s) => ({ nome: s.nome, tipo: s.tipo })),
                googleConectado: !!googleIntegration?.conectado
              });
              const messages = [
                { role: "system", content: system },
                ...historico.map((m) => ({
                  role: m.direcao === "entrada" ? "user" : "assistant",
                  content: m.texto
                }))
              ];
              if (!messages.length || messages[messages.length - 1].role !== "user") {
                messages.push({ role: "user", content: text });
              }
              const { getCompanyPlan } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-limits.server")));
              const { allowsProvider } = await Promise.resolve().then(() => __importStar(require2("src/lib/plan-features")));
              const throttleReason = await getAiThrottleReason(supabaseAdmin, companyId, number);
              if (throttleReason) {
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                console.warn("[whatsapp.safety] resposta pausada", throttleReason, companyId, number);
                return new Response(throttleReason, { status: 200 });
              }
              const plan = await getCompanyPlan(companyId);
              let providerChoice = cfg?.ai_provider || "gemini";
              let modelChoice = cfg?.ai_model || "google/gemini-2.5-flash";
              if (!allowsProvider(plan.slug, providerChoice)) {
                providerChoice = "gemini";
                modelChoice = "google/gemini-2.5-flash";
              }
              let rawReply = "";
              try {
                rawReply = await lovableAiChat(messages, {
                  provider: providerChoice,
                  model: modelChoice
                });
              } catch (e) {
                console.error("[ai]", e?.message);
              }
              if (!rawReply.trim()) {
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                return new Response("ai_unavailable", { status: 200 });
              }
              const { parts, stage, agendar } = parseAiOutput(rawReply, stages.map((s) => ({ nome: s.nome, tipo: s.tipo })));
              const finalParts = sanitizeAiParts(responderEmPartes ? parts : [parts.join(" ")]);
              if (finalParts.length === 0) {
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                return new Response("ai_empty", { status: 200 });
              }
              const { data: hasCredit } = await supabaseAdmin.rpc("consume_ai_credit", {
                _company_id: companyId,
                _ref: number
              });
              if (!hasCredit) {
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                console.warn("[credits] cr\xE9ditos esgotados \u2014 IA n\xE3o respondeu", companyId);
                return new Response("no_credits", { status: 200 });
              }
              let sentParts = 0;
              for (let i = 0; i < finalParts.length; i++) {
                const part = finalParts[i];
                if (!part)
                  continue;
                try {
                  const typingMs = Math.min(3e3, 1200 + Math.floor(part.length * 35));
                  await evoSendPresence(instanceName, number, "composing", typingMs);
                  await new Promise((r) => setTimeout(r, typingMs));
                  await evoSendText(instanceName, number, part);
                  await supabaseAdmin.from("mensagens").insert({
                    company_id: companyId,
                    user_id: userId,
                    numero: number,
                    contato_nome: pushName ?? null,
                    direcao: "saida",
                    autor: "ia",
                    texto: part
                  });
                  sentParts++;
                  if (i < finalParts.length - 1) {
                    await new Promise((r) => setTimeout(r, 700 + Math.floor(Math.random() * 800)));
                  }
                } catch (e) {
                  console.error("[send]", e?.message);
                }
              }
              if (sentParts === 0) {
                await supabaseAdmin.rpc("refund_ai_credit", {
                  _company_id: companyId,
                  _ref: number
                });
                await upsertCard(supabaseAdmin, companyId, userId, number, pushName, text, stages);
                return new Response("send_failed", { status: 200 });
              }
              if (agendar && googleIntegration?.conectado) {
                try {
                  const { createCalendarEventForCompany } = await Promise.resolve().then(() => __importStar(require2("src/lib/google.server")));
                  await createCalendarEventForCompany(supabaseAdmin, companyId, {
                    titulo: agendar.titulo,
                    inicio: agendar.inicio,
                    fim: agendar.fim,
                    descricao: `Agendado via WhatsApp \u2014 ${pushName || number}`
                  });
                } catch (e) {
                  console.error("[agendar]", e?.message);
                }
              }
              await upsertCard(supabaseAdmin, companyId, userId, number, pushName, finalParts[finalParts.length - 1] || text, stages, stage);
              return new Response("ok", { status: 200 });
            } catch (e) {
              console.error("[webhook]", e?.message, e?.stack);
              return new Response("error", { status: 200 });
            }
          },
          GET: async () => new Response("AtendeZap webhook online", { status: 200 })
        }
      }
    });
    const OPT_OUT_WORDS = ["parar", "pare", "cancelar", "sair", "remover", "descadastrar", "stop", "unsubscribe"];
    function isOptOutMessage(text) {
      const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toLowerCase();
      return OPT_OUT_WORDS.some((word) => normalized === word || normalized.includes(` ${word} `));
    }
    function sanitizeAiParts(parts) {
      return parts.map((part) => part.replace(/\s+/g, " ").trim()).filter(Boolean).map((part) => part.length > 700 ? `${part.slice(0, 697).trim()}...` : part).slice(0, 2);
    }
    async function getAiThrottleReason(admin, companyId, numero) {
      const now = Date.now();
      const [contactRecent, companyRecent] = await Promise.all([
        admin.from("mensagens").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("numero", numero).eq("direcao", "saida").eq("autor", "ia").gte("created_at", new Date(now - 10 * 6e4).toISOString()),
        admin.from("mensagens").select("id", { count: "exact", head: true }).eq("company_id", companyId).eq("direcao", "saida").eq("autor", "ia").gte("created_at", new Date(now - 6e4).toISOString())
      ]);
      if ((contactRecent.count ?? 0) >= 6)
        return "contact-rate-limit";
      if ((companyRecent.count ?? 0) >= 20)
        return "company-rate-limit";
      return null;
    }
    async function upsertCard(admin, companyId, userId, numero, nome, ultimaMensagem, stages, proposedStageName) {
      const { data: existing } = await admin.from("crm_cards").select("status, nome, stage_id").eq("company_id", companyId).eq("numero", numero).maybeSingle();
      const stageByName = new Map(stages.map((s) => [s.nome.toLowerCase(), s]));
      const stageById = new Map(stages.map((s) => [s.id, s]));
      const currentStage = existing?.stage_id ? stageById.get(existing.stage_id) : void 0;
      const currentTipo = currentStage?.tipo ?? (existing?.status ? stageByName.get(String(existing.status).toLowerCase())?.tipo : void 0);
      const isLocked = currentTipo === "ganho" || currentTipo === "perda";
      const proposed = proposedStageName ? stageByName.get(proposedStageName.toLowerCase()) : void 0;
      let finalStage = currentStage;
      if (proposed && !isLocked)
        finalStage = proposed;
      if (!finalStage)
        finalStage = stages[0];
      const payload = {
        company_id: companyId,
        user_id: userId,
        numero,
        nome: existing?.nome || nome || null,
        ultima_mensagem: ultimaMensagem.slice(0, 240),
        ultima_em: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (finalStage) {
        payload.stage_id = finalStage.id;
        payload.status = finalStage.nome;
      } else if (existing?.status) {
        payload.status = existing.status;
      } else {
        payload.status = "Conversas";
      }
      await admin.from("crm_cards").upsert(payload, { onConflict: "company_id,numero" });
    }
  },
  "src/lib/webhooks.server": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.emitWebhook = emitWebhook;
    const worker_crypto_1 = require2("src/lib/worker-crypto");
    async function emitWebhook(companyId, event, payload) {
      try {
        const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
        const { data: endpoints } = await supabaseAdmin.from("webhook_endpoint").select("id, url, secret, eventos, ativo").eq("company_id", companyId).eq("ativo", true);
        const list = (endpoints ?? []).filter((e) => !e.eventos?.length || e.eventos.includes(event));
        if (!list.length)
          return;
        const body = JSON.stringify({ event, company_id: companyId, data: payload, timestamp: (/* @__PURE__ */ new Date()).toISOString() });
        await Promise.all(list.map(async (ep) => {
          const sig = (0, worker_crypto_1.createHmac)("sha256", ep.secret).update(body).digest("hex");
          let status = null;
          let erro = null;
          try {
            const r = await fetch(ep.url, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-AtendeZap-Event": event,
                "X-AtendeZap-Signature": `sha256=${sig}`
              },
              body,
              signal: AbortSignal.timeout(1e4)
            });
            status = r.status;
            if (!r.ok)
              erro = `HTTP ${r.status}`;
          } catch (e) {
            erro = String(e?.message ?? e).slice(0, 500);
          }
          await supabaseAdmin.from("webhook_delivery_log").insert({
            company_id: companyId,
            endpoint_id: ep.id,
            evento: event,
            status_code: status,
            erro
          });
        }));
      } catch (e) {
        console.warn("[emitWebhook]", e);
      }
    }
  },
  "src/lib/business-hours": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.DIA_LABEL = void 0;
    exports.defaultHours = defaultHours;
    exports.isWithinBusinessHours = isWithinBusinessHours;
    function defaultHours() {
      return {
        enabled: false,
        timezone: "America/Sao_Paulo",
        dias: {
          "0": null,
          "1": { abre: "09:00", fecha: "18:00" },
          "2": { abre: "09:00", fecha: "18:00" },
          "3": { abre: "09:00", fecha: "18:00" },
          "4": { abre: "09:00", fecha: "18:00" },
          "5": { abre: "09:00", fecha: "18:00" },
          "6": null
        }
      };
    }
    function getZonedParts(date, tz) {
      const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false
      });
      const parts = fmt.formatToParts(date);
      const wd = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
      const hh = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
      const mm = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
      const map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      return { dow: map[wd] ?? 0, minutes: hh * 60 + mm };
    }
    function hhmmToMinutes(s) {
      const m = /^(\d{1,2}):(\d{2})$/.exec(s || "");
      if (!m)
        return null;
      const h = Number(m[1]);
      const mi = Number(m[2]);
      if (h < 0 || h > 23 || mi < 0 || mi > 59)
        return null;
      return h * 60 + mi;
    }
    function isWithinBusinessHours(h, now = /* @__PURE__ */ new Date()) {
      if (!h || !h.enabled)
        return true;
      const tz = h.timezone || "America/Sao_Paulo";
      let parts;
      try {
        parts = getZonedParts(now, tz);
      } catch {
        parts = getZonedParts(now, "America/Sao_Paulo");
      }
      const day = h.dias?.[String(parts.dow)] ?? null;
      if (!day)
        return false;
      const open = hhmmToMinutes(day.abre);
      const close = hhmmToMinutes(day.fecha);
      if (open == null || close == null)
        return false;
      if (close > open)
        return parts.minutes >= open && parts.minutes < close;
      return parts.minutes >= open || parts.minutes < close;
    }
    exports.DIA_LABEL = {
      "0": "Domingo",
      "1": "Segunda",
      "2": "Ter\xE7a",
      "3": "Quarta",
      "4": "Quinta",
      "5": "Sexta",
      "6": "S\xE1bado"
    };
  },
  "src/routes/api/public/billing/webhook": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Route = void 0;
    const react_router_1 = require2("@tanstack/react-router");
    const normalize_1 = require2("src/lib/billing/normalize");
    const worker_crypto_1 = require2("src/lib/worker-crypto");
    function tokenEnv(provider) {
      return provider === "kiwify" ? "KIWIFY_WEBHOOK_TOKEN" : provider === "cakto" ? "CAKTO_WEBHOOK_TOKEN" : "PERFECTPAY_WEBHOOK_TOKEN";
    }
    async function getAdmin() {
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      return supabaseAdmin;
    }
    async function findCompanyByEmail(supabase, email) {
      const { data: prof } = await supabase.from("profiles").select("user_id").ilike("email", email).maybeSingle();
      if (!prof?.user_id)
        return null;
      const { data: cu } = await supabase.from("company_user").select("company_id").eq("user_id", prof.user_id).eq("ativo", true).order("created_at", { ascending: true }).limit(1).maybeSingle();
      return cu?.company_id ?? null;
    }
    async function findPlanByRef(supabase, ref) {
      if (!ref)
        return null;
      const { data: bySlug } = await supabase.from("plan").select("id").eq("slug", ref).maybeSingle();
      if (bySlug?.id)
        return bySlug.id;
      const { data: byCheckout } = await supabase.from("plan").select("id").ilike("checkout_url", `%${ref}%`).maybeSingle();
      return byCheckout?.id ?? null;
    }
    async function applyEvent(evt, eventKey) {
      const supabase = await getAdmin();
      const logRow = {
        provider: evt.provider,
        event_type: evt.rawEventName || evt.eventType,
        external_id: evt.externalSubscriptionId,
        buyer_email: evt.buyerEmail,
        payload: evt,
        event_key: eventKey
      };
      const { data: log, error: logError } = await supabase.from("billing_event_log").insert(logRow).select("id").maybeSingle();
      if (logError?.code === "23505")
        return { duplicate: true };
      if (logError || !log)
        throw new Error(logError?.message || "Falha ao registrar evento de cobran\xE7a");
      const finishLog = (patch) => supabase.from("billing_event_log").update(patch).eq("id", log.id);
      if (!evt.buyerEmail) {
        await finishLog({ error: "sem email do comprador" });
        return { duplicate: false };
      }
      const companyId = await findCompanyByEmail(supabase, evt.buyerEmail);
      if (!companyId) {
        await finishLog({ error: "empresa n\xE3o encontrada para o email" });
        return { duplicate: false };
      }
      const planId = await findPlanByRef(supabase, evt.productRef);
      let subStatus = null;
      let companyStatus = null;
      switch (evt.eventType) {
        case "purchase_approved":
        case "subscription_renewed":
          subStatus = "active";
          companyStatus = "ativo";
          break;
        case "subscription_canceled":
          subStatus = "canceled";
          companyStatus = "suspenso";
          break;
        case "refunded":
        case "chargeback":
          subStatus = "canceled";
          companyStatus = "suspenso";
          break;
        case "payment_failed":
          subStatus = "past_due";
          companyStatus = "pendente";
          break;
        default:
          await finishLog({
            matched_company_id: companyId,
            processed: true,
            error: "evento ignorado"
          });
          return { duplicate: false };
      }
      const subPayload = {
        company_id: companyId,
        provider: evt.provider,
        external_subscription_id: evt.externalSubscriptionId,
        external_customer_id: evt.externalCustomerId,
        buyer_email: evt.buyerEmail,
        status: subStatus,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
      };
      if (planId)
        subPayload.plan_id = planId;
      if (evt.periodEnd)
        subPayload.current_period_end = evt.periodEnd;
      if (subStatus === "canceled")
        subPayload.canceled_at = (/* @__PURE__ */ new Date()).toISOString();
      await supabase.from("subscription").upsert(subPayload, { onConflict: "company_id" });
      if (companyStatus) {
        await supabase.from("company").update({ status_cobranca: companyStatus }).eq("id", companyId);
      }
      if (subStatus === "active" && planId) {
        const { data: planRow } = await supabase.from("plan").select("slug").eq("id", planId).maybeSingle();
        if (planRow?.slug) {
          await supabase.rpc("topup_plan_credits", { _company_id: companyId, _plan_slug: planRow.slug });
        }
      }
      await finishLog({
        matched_company_id: companyId,
        processed: true
      });
      return { duplicate: false };
    }
    exports.Route = (0, react_router_1.createFileRoute)("/api/public/billing/webhook")({
      server: {
        handlers: {
          POST: async ({ request }) => {
            const url = new URL(request.url);
            const provider = url.searchParams.get("provider") || "";
            if (!["kiwify", "cakto", "perfectpay"].includes(provider)) {
              return new Response("provider inv\xE1lido", { status: 400 });
            }
            let body = {};
            try {
              body = await request.json();
            } catch {
              try {
                const form = await request.formData();
                body = Object.fromEntries(form.entries());
              } catch {
                body = {};
              }
            }
            const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
            const token = request.headers.get("x-webhook-token") || bearer || (typeof body?.token === "string" ? body.token : "") || (typeof body?.webhook_token === "string" ? body.webhook_token : "");
            const expected = process.env[tokenEnv(provider)];
            if (!expected || token !== expected) {
              return new Response("token inv\xE1lido", { status: 401 });
            }
            try {
              const evt = (0, normalize_1.normalize)(provider, body);
              const eventKey = (0, worker_crypto_1.createHash)("sha256").update(`${provider}:${JSON.stringify(body)}`).digest("hex");
              const result = await applyEvent(evt, eventKey);
              return Response.json({ ok: true, duplicate: result.duplicate });
            } catch (e) {
              console.error("[billing.webhook]", provider, e);
              try {
                const admin = await getAdmin();
                await admin.from("billing_event_log").insert({
                  provider,
                  event_type: "error",
                  payload: body,
                  error: String(e?.message || e)
                });
              } catch (logError) {
                console.error("[billing.webhook.log]", logError);
              }
              return Response.json({ ok: false, error: String(e?.message || e) }, { status: 200 });
            }
          }
        }
      }
    });
  },
  "src/lib/billing/normalize": (module, exports, require2, process) => {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.normalizeKiwify = normalizeKiwify;
    exports.normalizeCakto = normalizeCakto;
    exports.normalizePerfectpay = normalizePerfectpay;
    exports.normalize = normalize;
    function lower(s) {
      return typeof s === "string" && s.trim() ? s.trim().toLowerCase() : null;
    }
    function pick(obj, ...paths) {
      for (const p of paths) {
        const v = p.split(".").reduce((acc, k) => acc == null ? acc : acc[k], obj);
        if (v !== void 0 && v !== null && v !== "")
          return v;
      }
      return null;
    }
    function mapKiwifyEvent(name) {
      const n = name.toLowerCase();
      if (n.includes("renewed") || n.includes("renovada"))
        return "subscription_renewed";
      if (n.includes("canceled") || n.includes("cancelada"))
        return "subscription_canceled";
      if (n.includes("refund"))
        return "refunded";
      if (n.includes("chargeback"))
        return "chargeback";
      if (n.includes("billet_overdue") || n.includes("payment_failed") || n.includes("rejected"))
        return "payment_failed";
      if (n.includes("approved") || n.includes("paid") || n.includes("aprovad"))
        return "purchase_approved";
      return "unknown";
    }
    function normalizeKiwify(body) {
      const eventName = pick(body, "webhook_event_type", "event") ?? "";
      return {
        provider: "kiwify",
        eventType: mapKiwifyEvent(eventName),
        rawEventName: eventName,
        buyerEmail: lower(pick(body, "Customer.email", "customer.email", "buyer.email")),
        externalSubscriptionId: pick(body, "Subscription.id", "subscription_id", "subscription.id", "order_id", "id") ?? null,
        externalCustomerId: pick(body, "Customer.id", "customer.id", "Customer.CPF") ?? null,
        productRef: pick(body, "Product.product_id", "product_id", "Product.id", "product.id") ?? null,
        amountCents: typeof body?.Commissions?.charge_amount === "number" ? body.Commissions.charge_amount : typeof body?.total_amount === "number" ? body.total_amount : null,
        periodEnd: pick(body, "Subscription.next_payment", "subscription.next_payment") ?? null
      };
    }
    function mapCaktoEvent(name) {
      const n = name.toUpperCase();
      if (n.includes("RENEW"))
        return "subscription_renewed";
      if (n.includes("CANCEL"))
        return "subscription_canceled";
      if (n.includes("REFUND"))
        return "refunded";
      if (n.includes("CHARGEBACK"))
        return "chargeback";
      if (n.includes("FAIL") || n.includes("REJECT"))
        return "payment_failed";
      if (n.includes("APPROVED") || n.includes("PAID"))
        return "purchase_approved";
      return "unknown";
    }
    function normalizeCakto(body) {
      const eventName = pick(body, "event", "event_type") ?? "";
      const data = body?.data ?? body;
      return {
        provider: "cakto",
        eventType: mapCaktoEvent(eventName),
        rawEventName: eventName,
        buyerEmail: lower(pick(data, "customer.email", "buyer.email", "customer_email")),
        externalSubscriptionId: pick(data, "subscription.id", "subscription_id", "transaction_id", "id") ?? null,
        externalCustomerId: pick(data, "customer.id", "customer_id") ?? null,
        productRef: pick(data, "product.id", "product_id", "offer_id") ?? null,
        amountCents: typeof data?.amount_cents === "number" ? data.amount_cents : typeof data?.amount === "number" ? Math.round(data.amount * 100) : null,
        periodEnd: pick(data, "subscription.next_charge_at", "next_charge_at") ?? null
      };
    }
    function mapPerfectpayEvent(status) {
      const n = (status || "").toLowerCase();
      if (n.includes("renew"))
        return "subscription_renewed";
      if (n.includes("cancel"))
        return "subscription_canceled";
      if (n.includes("refund") || n.includes("estorn"))
        return "refunded";
      if (n.includes("chargeback"))
        return "chargeback";
      if (n.includes("approved") || n.includes("paid") || n.includes("aprovad"))
        return "purchase_approved";
      if (n.includes("pending") || n.includes("aguardando"))
        return "unknown";
      return "unknown";
    }
    function normalizePerfectpay(body) {
      const status = pick(body, "sale_status_enum_key", "status", "transaction_status") ?? "";
      return {
        provider: "perfectpay",
        eventType: mapPerfectpayEvent(status),
        rawEventName: status,
        buyerEmail: lower(pick(body, "customer.email", "client.email", "email")),
        externalSubscriptionId: pick(body, "subscription.code", "code", "sale_id", "transaction_code") ?? null,
        externalCustomerId: pick(body, "customer.id", "customer_id") ?? null,
        productRef: pick(body, "product.code", "product_id", "code_product") ?? null,
        amountCents: typeof body?.sale_amount === "number" ? Math.round(body.sale_amount * 100) : null,
        periodEnd: pick(body, "subscription.next_charge", "date_next_charge") ?? null
      };
    }
    function normalize(provider, body) {
      switch (provider) {
        case "kiwify":
          return normalizeKiwify(body);
        case "cakto":
          return normalizeCakto(body);
        case "perfectpay":
          return normalizePerfectpay(body);
        default:
          throw new Error(`provedor desconhecido: ${provider}`);
      }
    }
  },
  "src/routes/api/public/hooks/process-campaigns": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Route = void 0;
    const react_router_1 = require2("@tanstack/react-router");
    exports.Route = (0, react_router_1.createFileRoute)("/api/public/hooks/process-campaigns")({
      server: {
        handlers: {
          POST: async ({ request }) => {
            try {
              const expectedSecret = process.env.CAMPAIGN_WORKER_SECRET;
              const bearer = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
              const suppliedSecret = request.headers.get("x-worker-secret") || bearer;
              if (!expectedSecret) {
                return new Response("worker n\xE3o configurado", { status: 503 });
              }
              if (!suppliedSecret || suppliedSecret !== expectedSecret) {
                return new Response("n\xE3o autorizado", { status: 401 });
              }
              const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
              const { evoSendText } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
              await supabaseAdmin.from("campaign").update({ status: "enviando" }).eq("status", "agendada").lte("proximo_envio_em", (/* @__PURE__ */ new Date()).toISOString());
              const { data: due } = await supabaseAdmin.from("campaign").select("*").eq("status", "enviando").lte("proximo_envio_em", (/* @__PURE__ */ new Date()).toISOString()).limit(10);
              const processed = [];
              for (const c of due ?? []) {
                const { data: inst } = await supabaseAdmin.from("whatsapp_instances").select("instance_name, status").eq("company_id", c.company_id).maybeSingle();
                if (!inst || inst.status !== "connected") {
                  processed.push({ id: c.id, skipped: "sem_whatsapp" });
                  continue;
                }
                const batchSize = 5;
                const processingToken = crypto.randomUUID();
                const { data: pending, error: claimError } = await supabaseAdmin.rpc("claim_campaign_targets", { _campaign_id: c.id, _limit: batchSize, _token: processingToken });
                if (claimError)
                  throw claimError;
                if (!pending || pending.length === 0) {
                  const { count: remaining } = await supabaseAdmin.from("campaign_target").select("id", { count: "exact", head: true }).eq("campaign_id", c.id).eq("status", "pendente");
                  if ((remaining ?? 0) > 0) {
                    processed.push({ id: c.id, skipped: "alvos_em_processamento" });
                    continue;
                  }
                  await supabaseAdmin.from("campaign").update({
                    status: "concluida",
                    concluido_em: (/* @__PURE__ */ new Date()).toISOString()
                  }).eq("id", c.id);
                  processed.push({ id: c.id, done: true });
                  continue;
                }
                let enviados = 0;
                let falhas = 0;
                for (const t of pending) {
                  try {
                    const texto = String(c.mensagem || "").replace(/\{\{nome\}\}/gi, t.contato_nome || "");
                    await evoSendText(inst.instance_name, t.contato_numero, texto);
                    await supabaseAdmin.from("campaign_target").update({
                      status: "enviado",
                      enviado_em: (/* @__PURE__ */ new Date()).toISOString(),
                      processing_token: null,
                      processing_started_at: null
                    }).eq("id", t.id).eq("processing_token", processingToken);
                    if (c.created_by) {
                      await supabaseAdmin.from("mensagens").insert({
                        company_id: c.company_id,
                        user_id: c.created_by,
                        numero: t.contato_numero,
                        contato_nome: t.contato_nome,
                        direcao: "saida",
                        autor: "sistema",
                        texto
                      });
                    }
                    enviados++;
                  } catch (e) {
                    await supabaseAdmin.from("campaign_target").update({
                      status: "falhou",
                      erro: String(e?.message ?? e).slice(0, 500),
                      processing_token: null,
                      processing_started_at: null
                    }).eq("id", t.id).eq("processing_token", processingToken);
                    falhas++;
                  }
                }
                const minS = Math.max(2, c.intervalo_min_seg ?? 5);
                const maxS = Math.max(minS, c.intervalo_max_seg ?? 20);
                let nextDelaySeg = Math.floor(minS + Math.random() * (maxS - minS + 1));
                const totalEnviados = (c.total_enviados ?? 0) + enviados;
                const pausaApos = c.pausa_apos_envios ?? 50;
                const pausaDurMin = c.pausa_duracao_min ?? 10;
                if (pausaApos > 0 && Math.floor(totalEnviados / pausaApos) > Math.floor((c.total_enviados ?? 0) / pausaApos)) {
                  nextDelaySeg = pausaDurMin * 60;
                }
                await supabaseAdmin.from("campaign").update({
                  total_enviados: totalEnviados,
                  total_falhas: (c.total_falhas ?? 0) + falhas,
                  proximo_envio_em: new Date(Date.now() + nextDelaySeg * 1e3).toISOString()
                }).eq("id", c.id);
                processed.push({ id: c.id, enviados, falhas });
              }
              return Response.json({ ok: true, processed });
            } catch (e) {
              console.error("[process-campaigns]", e);
              return new Response(JSON.stringify({ ok: false, error: String(e?.message ?? e) }), { status: 500 });
            }
          }
        }
      }
    });
  },
  "src/routes/api/public/v1/$": (module, exports, require2, process) => {
    "use strict";
    var __createBinding = Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault = Object.create ? (function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : function(o, v) {
      o["default"] = v;
    };
    var __importStar = /* @__PURE__ */ (function() {
      var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function(o2) {
          var ar = [];
          for (var k in o2) if (Object.prototype.hasOwnProperty.call(o2, k)) ar[ar.length] = k;
          return ar;
        };
        return ownKeys(o);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Route = void 0;
    const react_router_1 = require2("@tanstack/react-router");
    async function authToken(request) {
      const h = request.headers.get("authorization") || "";
      const m = h.match(/^Bearer\s+(azp_[a-z0-9]+)$/i);
      if (!m)
        return null;
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const { data } = await supabaseAdmin.from("api_token").select("id, company_id, criado_por, revogado").eq("token", m[1]).maybeSingle();
      if (!data || data.revogado)
        return null;
      await supabaseAdmin.from("api_token").update({ ultimo_uso_em: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.id);
      return { companyId: data.company_id, userId: data.criado_por };
    }
    async function handle(request) {
      const auth = await authToken(request);
      if (!auth)
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json" } });
      const { companyId, userId } = auth;
      const { supabaseAdmin } = await Promise.resolve().then(() => __importStar(require2("@/integrations/supabase/client.server")));
      const url = new URL(request.url);
      const resource = url.searchParams.get("resource") || "contacts";
      if (request.method === "GET") {
        if (resource === "contacts") {
          const { data } = await supabaseAdmin.from("crm_cards").select("id, numero, contato_nome, tags, stage_id, valor, utm_source, utm_medium, utm_campaign, created_at").eq("company_id", companyId).order("created_at", { ascending: false }).limit(200);
          return Response.json({ data: data ?? [] });
        }
        if (resource === "messages") {
          const numero = url.searchParams.get("numero") || "";
          let q = supabaseAdmin.from("mensagens").select("id, numero, direcao, autor, texto, created_at").eq("company_id", companyId).order("created_at", { ascending: false }).limit(100);
          if (numero)
            q = q.eq("numero", numero);
          const { data } = await q;
          return Response.json({ data: data ?? [] });
        }
        return new Response(JSON.stringify({ error: "Unknown resource" }), { status: 400 });
      }
      if (request.method === "POST") {
        const body = await request.json().catch(() => ({}));
        if (resource === "messages") {
          const numero = String(body.numero || "").replace(/\D/g, "");
          const texto = String(body.texto || "");
          if (!numero || !texto)
            return new Response(JSON.stringify({ error: "numero e texto obrigat\xF3rios" }), { status: 400 });
          const { data: inst } = await supabaseAdmin.from("whatsapp_instances").select("instance_name, status").eq("company_id", companyId).maybeSingle();
          if (!inst || inst.status !== "connected")
            return new Response(JSON.stringify({ error: "WhatsApp n\xE3o conectado" }), { status: 400 });
          if (!userId)
            return new Response(JSON.stringify({ error: "Token sem owner; recrie o token." }), { status: 400 });
          try {
            const { evoSendText } = await Promise.resolve().then(() => __importStar(require2("src/lib/evolution.server")));
            await evoSendText(inst.instance_name, numero, texto);
            await supabaseAdmin.from("mensagens").insert({
              company_id: companyId,
              user_id: userId,
              numero,
              direcao: "saida",
              autor: "api",
              texto
            });
            return Response.json({ ok: true });
          } catch (e) {
            return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500 });
          }
        }
        return new Response(JSON.stringify({ error: "Unknown resource" }), { status: 400 });
      }
      return new Response("Method Not Allowed", { status: 405 });
    }
    exports.Route = (0, react_router_1.createFileRoute)("/api/public/v1/$")({
      server: {
        handlers: {
          GET: ({ request }) => handle(request),
          POST: ({ request }) => handle(request)
        }
      }
    });
  }
};
function loadDomain(ctx) {
  const cache = {};
  const external = { "qrcode": external0, "buffer": external1, "@noble/hashes/sha2.js": external2, "@noble/hashes/hmac.js": external3 };
  function createServerFn() {
    let validate = (x) => x, needsAuth = false;
    const builder = { middleware() {
      needsAuth = true;
      return builder;
    }, inputValidator(fn) {
      validate = fn;
      return builder;
    }, handler(fn) {
      return async (args = {}) => {
        if (needsAuth && !ctx.identity.userId) throw new Error("Autentica\xE7\xE3o necess\xE1ria");
        return fn({ context: { supabase: ctx.scoped, userId: ctx.identity.userId, claims: ctx.identity }, data: validate(args.data), request: ctx.request });
      };
    } };
    return builder;
  }
  const special = { "@tanstack/react-router": { createFileRoute: () => (config) => config }, "@tanstack/react-start": { createServerFn }, "@tanstack/react-start/server": { getRequest: () => ctx.request }, "@/integrations/supabase/auth-middleware": { requireSupabaseAuth: {} }, "@/integrations/supabase/client.server": { supabaseAdmin: ctx.admin.forDomainOperations() }, "@/integrations/supabase/client": { supabase: ctx.scoped }, "@/blink/client": { blink: ctx.blink }, "node:process": { env: ctx.env } };
  function load(id) {
    if (special[id]) return special[id];
    if (external[id]) return external[id];
    if (cache[id]) return cache[id].exports;
    if (!factories[id]) throw new Error("M\xF3dulo indispon\xEDvel");
    const module = { exports: {} };
    cache[id] = module;
    factories[id](module, module.exports, load, { env: ctx.env });
    return module.exports;
  }
  return load;
}
export {
  loadDomain,
  publicRoutes,
  rpcAllowlist
};
