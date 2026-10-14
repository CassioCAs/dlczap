// @bun
// shared/query.ts
class Query {
  execute;
  spec;
  constructor(table, execute) {
    this.execute = execute;
    this.spec = { table, action: "select", columns: "*", filters: [], orders: [] };
  }
  select(columns = "*", options = {}) {
    this.spec.columns = columns;
    this.spec.head = !!options.head;
    return this;
  }
  filter(key, op, value) {
    this.spec.filters.push({ key, op, value });
    return this;
  }
  eq(k, v) {
    return this.filter(k, "eq", v);
  }
  neq(k, v) {
    return this.filter(k, "neq", v);
  }
  is(k, v) {
    return this.filter(k, "is", v);
  }
  gt(k, v) {
    return this.filter(k, "gt", v);
  }
  gte(k, v) {
    return this.filter(k, "gte", v);
  }
  lt(k, v) {
    return this.filter(k, "lt", v);
  }
  lte(k, v) {
    return this.filter(k, "lte", v);
  }
  ilike(k, v) {
    return this.filter(k, "ilike", v);
  }
  in(k, v) {
    return this.filter(k, "in", v);
  }
  not(k, op, v) {
    if (op !== "is" || v !== null)
      throw new Error("Filtro n\xE3o suportado");
    return this.filter(k, "notnull", null);
  }
  order(key, opts = {}) {
    this.spec.orders.push({ key, ascending: opts.ascending !== false });
    return this;
  }
  limit(n) {
    this.spec.limit = n;
    return this;
  }
  range(a, b) {
    this.spec.offset = a;
    this.spec.limit = b - a + 1;
    return this;
  }
  insert(v) {
    this.spec.action = "insert";
    this.spec.payload = v;
    return this;
  }
  upsert(v, opts = {}) {
    this.spec.action = "upsert";
    this.spec.payload = v;
    this.spec.conflict = opts.onConflict;
    return this;
  }
  update(v) {
    this.spec.action = "update";
    this.spec.payload = v;
    return this;
  }
  delete() {
    this.spec.action = "delete";
    return this;
  }
  single() {
    this.spec.cardinality = "one";
    return this;
  }
  maybeSingle() {
    this.spec.cardinality = "maybe";
    return this;
  }
  then(ok, fail) {
    return this.execute(this.spec).then(ok, fail);
  }
}

// server/native/schema.ts
var schema = {
  company: {
    id: "TEXT",
    nome: "TEXT",
    slug: "TEXT",
    primary_color: "TEXT",
    logo_url: "TEXT",
    telefone: "TEXT",
    status_cobranca: "TEXT",
    trial_ate: "TEXT",
    created_by: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT",
    tipo_pessoa: "TEXT",
    cnpj_cpf: "TEXT",
    razao_social: "TEXT",
    nome_fantasia: "TEXT",
    inscricao_estadual: "TEXT",
    segmento: "TEXT",
    porte: "TEXT",
    site: "TEXT",
    email_corporativo: "TEXT",
    cep: "TEXT",
    rua: "TEXT",
    numero: "TEXT",
    complemento: "TEXT",
    bairro: "TEXT",
    cidade: "TEXT",
    estado: "TEXT",
    pais: "TEXT",
    onboarding_completed: "BOOLEAN",
    onboarding_step: "INTEGER",
    selected_plan_slug: "TEXT",
    financeiro_ativo: "BOOLEAN",
    financeiro_dias_vencimento_padrao: "INTEGER",
    creditos_saldo: "INTEGER",
    creditos_resetam_em: "TEXT",
    creditos_origem: "TEXT"
  },
  company_user: {
    id: "TEXT",
    user_id: "TEXT",
    company_id: "TEXT",
    role: "TEXT",
    ativo: "BOOLEAN",
    forcar_troca_senha: "BOOLEAN",
    convite_token: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  user_roles: {
    id: "TEXT",
    user_id: "TEXT",
    role: "TEXT",
    created_at: "TEXT"
  },
  app_config: {
    id: "TEXT",
    super_admin_emails: "TEXT",
    updated_at: "TEXT"
  },
  profiles: {
    user_id: "TEXT",
    email: "TEXT",
    nome: "TEXT",
    nome_completo: "TEXT",
    cpf: "TEXT",
    cargo: "TEXT",
    telefone: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  agent_config: {
    id: "TEXT",
    user_id: "TEXT",
    company_id: "TEXT",
    nome_agente: "TEXT",
    nome_empresa: "TEXT",
    papel_objetivo: "TEXT",
    estilo_comunicacao: "TEXT",
    sobre_empresa: "TEXT",
    produtos_servicos: "TEXT",
    pode_fazer: "TEXT",
    nao_pode_fazer: "TEXT",
    telefone_transferencia: "TEXT",
    palavra_pausar: "TEXT",
    palavra_despausar: "TEXT",
    segmento: "TEXT",
    descricao_negocio: "TEXT",
    diferenciais: "TEXT",
    publico_alvo: "TEXT",
    regiao_horario: "TEXT",
    ofertas: "TEXT",
    cupom: "TEXT",
    como_vender: "TEXT",
    objecoes: "TEXT",
    formas_pagamento: "TEXT",
    ticket_medio: "TEXT",
    faq: "TEXT",
    politicas: "TEXT",
    posvenda_msg: "TEXT",
    pedir_avaliacao: "BOOLEAN",
    reativar_cliente: "BOOLEAN",
    tom: "TEXT",
    horarios_atendimento: "TEXT",
    mensagem_fora_horario: "TEXT",
    responder_em_partes: "BOOLEAN",
    segundos_buffer: "INTEGER",
    personalidade: "TEXT",
    foco_atendimento: "TEXT",
    emoji_intensidade: "TEXT",
    usar_girias: "BOOLEAN",
    chamar_por_nome: "BOOLEAN",
    perguntar_uma_por_vez: "BOOLEAN",
    pode_brincar: "BOOLEAN",
    assinar_mensagens: "BOOLEAN",
    proatividade: "INTEGER",
    velocidade_resposta: "TEXT",
    evitar_palavras: "TEXT",
    idioma: "TEXT",
    ai_provider: "TEXT",
    ai_model: "TEXT",
    openai_api_key: "TEXT",
    anthropic_api_key: "TEXT",
    updated_at: "TEXT"
  },
  whatsapp_instances: {
    id: "TEXT",
    user_id: "TEXT",
    company_id: "TEXT",
    instance_name: "TEXT",
    numero: "TEXT",
    status: "TEXT",
    webhook_token: "TEXT",
    webhook_configured_at: "TEXT",
    updated_at: "TEXT"
  },
  mensagens: {
    id: "TEXT",
    user_id: "TEXT",
    company_id: "TEXT",
    numero: "TEXT",
    contato_nome: "TEXT",
    direcao: "TEXT",
    autor: "TEXT",
    texto: "TEXT",
    whatsapp_message_id: "TEXT",
    created_at: "TEXT"
  },
  crm_cards: {
    id: "TEXT",
    user_id: "TEXT",
    company_id: "TEXT",
    numero: "TEXT",
    nome: "TEXT",
    status: "TEXT",
    ultima_mensagem: "TEXT",
    ultima_em: "TEXT",
    observacao: "TEXT",
    updated_at: "TEXT",
    created_at: "TEXT",
    stage_id: "TEXT",
    valor: "REAL",
    origem: "TEXT",
    owner_id: "TEXT",
    tags: "TEXT",
    proxima_acao: "TEXT",
    follow_up: "TEXT",
    utm_source: "TEXT",
    utm_medium: "TEXT",
    utm_campaign: "TEXT"
  },
  contact_pause: {
    id: "TEXT",
    user_id: "TEXT",
    company_id: "TEXT",
    numero: "TEXT",
    pausado: "BOOLEAN",
    updated_at: "TEXT"
  },
  crm_stage: {
    id: "TEXT",
    company_id: "TEXT",
    nome: "TEXT",
    ordem: "INTEGER",
    cor: "TEXT",
    tipo: "TEXT",
    created_at: "TEXT"
  },
  produto: {
    id: "TEXT",
    company_id: "TEXT",
    nome: "TEXT",
    preco: "REAL",
    descricao: "TEXT",
    ativo: "BOOLEAN",
    ordem: "INTEGER",
    created_at: "TEXT"
  },
  lead_nota: {
    id: "TEXT",
    company_id: "TEXT",
    card_id: "TEXT",
    autor_id: "TEXT",
    texto: "TEXT",
    created_at: "TEXT"
  },
  lead_evento: {
    id: "TEXT",
    company_id: "TEXT",
    card_id: "TEXT",
    tipo: "TEXT",
    descricao: "TEXT",
    created_at: "TEXT"
  },
  agendamento: {
    id: "TEXT",
    company_id: "TEXT",
    card_id: "TEXT",
    titulo: "TEXT",
    inicio: "TEXT",
    fim: "TEXT",
    google_event_id: "TEXT",
    status: "TEXT",
    created_at: "TEXT"
  },
  google_integration: {
    company_id: "TEXT",
    email: "TEXT",
    access_token: "TEXT",
    refresh_token: "TEXT",
    expiry: "TEXT",
    calendar_id: "TEXT",
    conectado: "BOOLEAN",
    updated_at: "TEXT"
  },
  plan: {
    id: "TEXT",
    slug: "TEXT",
    nome: "TEXT",
    descricao: "TEXT",
    preco_cents: "INTEGER",
    moeda: "TEXT",
    intervalo: "TEXT",
    trial_days: "INTEGER",
    limite_mensagens: "INTEGER",
    limite_instancias: "INTEGER",
    limite_usuarios: "INTEGER",
    limite_contatos: "INTEGER",
    features: "TEXT",
    destaque: "BOOLEAN",
    ativo: "BOOLEAN",
    ordem: "INTEGER",
    paddle_product_id: "TEXT",
    paddle_price_id: "TEXT",
    stripe_product_id: "TEXT",
    stripe_price_id: "TEXT",
    checkout_url: "TEXT",
    creditos_mensais: "INTEGER",
    creditos_trial: "INTEGER",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  subscription: {
    id: "TEXT",
    company_id: "TEXT",
    plan_id: "TEXT",
    status: "TEXT",
    provider: "TEXT",
    external_subscription_id: "TEXT",
    external_customer_id: "TEXT",
    buyer_email: "TEXT",
    current_period_start: "TEXT",
    current_period_end: "TEXT",
    trial_start: "TEXT",
    trial_end: "TEXT",
    canceled_at: "TEXT",
    cancel_at_period_end: "BOOLEAN",
    next_billing_amount_cents: "INTEGER",
    metadata: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  company_billing: {
    id: "TEXT",
    company_id: "TEXT",
    tipo_pessoa: "TEXT",
    cnpj_cpf: "TEXT",
    razao_social: "TEXT",
    nome_responsavel: "TEXT",
    email_cobranca: "TEXT",
    telefone: "TEXT",
    inscricao_estadual: "TEXT",
    cep: "TEXT",
    rua: "TEXT",
    numero: "TEXT",
    complemento: "TEXT",
    cidade: "TEXT",
    estado: "TEXT",
    pais: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  campaign: {
    id: "TEXT",
    company_id: "TEXT",
    created_by: "TEXT",
    nome: "TEXT",
    mensagem: "TEXT",
    media_url: "TEXT",
    status: "TEXT",
    agendado_para: "TEXT",
    filtro_tags: "TEXT",
    intervalo_min: "INTEGER",
    intervalo_max: "INTEGER",
    pausa_apos: "INTEGER",
    pausa_minutos: "INTEGER",
    total_destinatarios: "INTEGER",
    enviados: "INTEGER",
    falhas: "INTEGER",
    proximo_envio_em: "TEXT",
    iniciado_em: "TEXT",
    concluido_em: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  campaign_target: {
    id: "TEXT",
    campaign_id: "TEXT",
    company_id: "TEXT",
    contato_numero: "TEXT",
    contato_nome: "TEXT",
    status: "TEXT",
    enviado_em: "TEXT",
    erro: "TEXT",
    processing_token: "TEXT",
    processing_started_at: "TEXT",
    created_at: "TEXT"
  },
  message_template: {
    id: "TEXT",
    company_id: "TEXT",
    user_id: "TEXT",
    atalho: "TEXT",
    texto: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  csat_response: {
    id: "TEXT",
    company_id: "TEXT",
    numero: "TEXT",
    contato_nome: "TEXT",
    token: "TEXT",
    score: "INTEGER",
    comentario: "TEXT",
    enviado_por: "TEXT",
    enviado_em: "TEXT",
    respondido_em: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  audit_log: {
    id: "TEXT",
    company_id: "TEXT",
    user_id: "TEXT",
    actor_email: "TEXT",
    acao: "TEXT",
    recurso: "TEXT",
    detalhes: "TEXT",
    ip: "TEXT",
    user_agent: "TEXT",
    created_at: "TEXT"
  },
  webhook_endpoint: {
    id: "TEXT",
    company_id: "TEXT",
    nome: "TEXT",
    url: "TEXT",
    secret: "TEXT",
    eventos: "TEXT",
    ativo: "BOOLEAN",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  api_token: {
    id: "TEXT",
    company_id: "TEXT",
    label: "TEXT",
    token: "TEXT",
    criado_por: "TEXT",
    ultimo_uso_em: "TEXT",
    revogado: "BOOLEAN",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  webhook_delivery_log: {
    id: "TEXT",
    company_id: "TEXT",
    endpoint_id: "TEXT",
    evento: "TEXT",
    status_code: "INTEGER",
    erro: "TEXT",
    created_at: "TEXT"
  },
  billing_event_log: {
    id: "TEXT",
    provider: "TEXT",
    event_type: "TEXT",
    external_id: "TEXT",
    buyer_email: "TEXT",
    matched_company_id: "TEXT",
    processed: "BOOLEAN",
    error: "TEXT",
    payload: "TEXT",
    event_key: "TEXT",
    created_at: "TEXT"
  },
  fin_categoria: {
    id: "TEXT",
    company_id: "TEXT",
    nome: "TEXT",
    tipo: "TEXT",
    cor: "TEXT",
    ativo: "BOOLEAN",
    created_at: "TEXT"
  },
  fin_lancamento: {
    id: "TEXT",
    company_id: "TEXT",
    categoria_id: "TEXT",
    card_id: "TEXT",
    tipo: "TEXT",
    descricao: "TEXT",
    valor: "REAL",
    vencimento: "TEXT",
    pagamento_em: "TEXT",
    status: "TEXT",
    competencia: "TEXT",
    observacao: "TEXT",
    created_at: "TEXT",
    updated_at: "TEXT"
  },
  credit_ledger: {
    id: "TEXT",
    company_id: "TEXT",
    delta: "INTEGER",
    saldo_apos: "INTEGER",
    motivo: "TEXT",
    ref: "TEXT",
    created_by: "TEXT",
    created_at: "TEXT"
  }
};

// server/native/database.ts
var jsonFields = new Set(["tags", "features", "metadata", "detalhes", "eventos", "filtro_tags", "horarios_atendimento", "super_admin_emails", "payload"]);
var privilegedWrites = new Set(["company_user", "user_roles", "plan", "app_config", "subscription", "template_owner", "credit_ledger", "billing_event_log", "audit_log", "api_token", "google_integration", "webhook_endpoint", "webhook_delivery_log"]);
var secretFields = new Set(["openai_api_key", "anthropic_api_key", "access_token", "refresh_token", "webhook_token", "convite_token", "token", "secret", "password_hash", "processing_token", "paddle_product_id", "paddle_price_id", "stripe_product_id", "stripe_price_id", "checkout_url", "super_admin_emails"]);
var writeTables = new Set(["company", "profiles", "agent_config", "whatsapp_instances", "mensagens", "crm_cards", "contact_pause", "crm_stage", "produto", "lead_nota", "lead_evento", "agendamento", "company_billing", "campaign", "campaign_target", "message_template", "csat_response", "fin_categoria", "fin_lancamento"]);
var safeConflicts = { agent_config: ["company_id"], whatsapp_instances: ["company_id"], mensagens: ["company_id,whatsapp_message_id"], crm_cards: ["company_id,numero"], contact_pause: ["company_id,numero"], company_billing: ["company_id"], fin_lancamento: ["company_id,card_id"] };
var readableTables = new Set(["company", "company_user", "profiles", "agent_config", "whatsapp_instances", "mensagens", "crm_cards", "contact_pause", "crm_stage", "produto", "lead_nota", "lead_evento", "agendamento", "google_integration", "plan", "subscription", "company_billing", "campaign", "campaign_target", "message_template", "csat_response", "audit_log", "webhook_endpoint", "webhook_delivery_log", "fin_categoria", "fin_lancamento", "credit_ledger", "user_roles"]);
var attendantWrites = new Set(["crm_cards", "lead_nota", "lead_evento", "contact_pause", "message_template", "agendamento"]);
var quote = (s) => '"' + s + '"';
var value = (v) => typeof v === "boolean" ? Number(v) : v !== null && typeof v === "object" ? JSON.stringify(v) : v ?? null;
function column(table, key) {
  if (!schema[table]?.[key])
    throw new Error("Coluna inv\xE1lida: " + key);
  return quote(key);
}
function parts(input) {
  let depth = 0, start = 0;
  const out = [];
  for (let i = 0;i < input.length; i++) {
    if (input[i] === "(")
      depth++;
    if (input[i] === ")")
      depth--;
    if (depth < 0)
      throw new Error("Sele\xE7\xE3o inv\xE1lida");
    if (input[i] === "," && depth === 0) {
      out.push(input.slice(start, i).trim());
      start = i + 1;
    }
  }
  if (depth !== 0)
    throw new Error("Sele\xE7\xE3o inv\xE1lida");
  out.push(input.slice(start).trim());
  return out;
}
function decode(table, row) {
  return Object.fromEntries(Object.entries(row).map(([k, v]) => {
    if (schema[table]?.[k] === "BOOLEAN")
      return [k, v === true || v === 1 || v === "1" || v === "true"];
    if (v !== null && v !== "" && ["INTEGER", "REAL", "NUMERIC"].includes(schema[table]?.[k]) && Number.isFinite(Number(v)))
      return [k, Number(v)];
    if (jsonFields.has(k) && typeof v === "string") {
      try {
        return [k, JSON.parse(v)];
      } catch {}
    }
    return [k, v];
  }));
}

class Database {
  sql;
  identity;
  internal;
  trusted;
  domainOperations;
  auth;
  rpc;
  constructor(sql, identity, internal = false, trusted = false, domainOperations = false) {
    this.sql = sql;
    this.identity = identity;
    this.internal = internal;
    this.trusted = trusted;
    this.domainOperations = domainOperations;
  }
  from(table) {
    return new Query(table, (s) => this.execute(s));
  }
  forDomainOperations() {
    return new Database(this.sql, this.identity, true, this.trusted, true);
  }
  async scope(table, write) {
    if (!schema[table] || !readableTables.has(table))
      throw new Error("Tabela indispon\xEDvel");
    if (!this.internal && write && (privilegedWrites.has(table) || !writeTables.has(table)))
      throw new Error("Use a opera\xE7\xE3o autorizada para esta altera\xE7\xE3o");
    const u = this.identity;
    if (this.internal || u.master)
      return { clause: "1=1", args: [] };
    if (table === "plan" && !write)
      return { clause: "1=1", args: [] };
    if (!u.userId)
      throw new Error("Autentica\xE7\xE3o necess\xE1ria");
    if (table === "users" || table === "template_owner" || table === "api_token")
      throw new Error("Acesso restrito");
    if (table === "profiles")
      return { clause: "user_id = ?", args: [u.userId] };
    if (table === "user_roles")
      return { clause: "user_id = ?", args: [u.userId] };
    if (!u.companyId)
      throw new Error("Empresa n\xE3o encontrada");
    if (write && !["owner", "admin"].includes(u.role || "") && !attendantWrites.has(table))
      throw new Error("Permiss\xE3o insuficiente");
    if (["api_token", "webhook_endpoint", "webhook_delivery_log", "google_integration"].includes(table) && !["owner", "admin"].includes(u.role || ""))
      throw new Error("Acesso restrito");
    return { clause: (table === "company" ? "id" : "company_id") + " = ?", args: [u.companyId] };
  }
  async project(table, rows, selection, depth = 0) {
    if (depth > 2)
      throw new Error("Relacionamento muito profundo");
    const fields = parts(selection), all = fields.includes("*");
    const result = [];
    for (const raw of rows) {
      const row = decode(table, raw), out = {};
      if (all) {
        for (const [k, v] of Object.entries(row))
          if (!secretFields.has(k))
            out[k] = v;
      }
      for (const field of fields) {
        if (field === "*")
          continue;
        const match = /^(\w+)(?::(\w+))?\((.*)\)$/.exec(field);
        if (match) {
          const alias = match[1], target = alias === "profiles" ? "profiles" : match[2] || alias;
          if (!["company", "plan", "profiles", "crm_stage", "fin_categoria"].includes(target))
            throw new Error("Relacionamento inv\xE1lido");
          const fk = target === "profiles" ? "user_id" : target === "crm_stage" ? "stage_id" : target === "fin_categoria" ? "categoria_id" : target + "_id", pk = target === "profiles" ? "user_id" : "id";
          if (raw[fk] == null) {
            out[alias] = null;
            continue;
          }
          const related = (await this.sql.sql("SELECT * FROM " + quote(target) + " WHERE " + quote(pk) + " = ? LIMIT 1", [raw[fk]])).rows;
          if (target === "profiles" && !this.internal) {
            out[alias] = related[0] ? Object.fromEntries(["user_id", "nome", "email"].filter((k) => match[3] === "*" || parts(match[3]).includes(k)).map((k) => [k, related[0][k]])) : null;
          } else
            out[alias] = (await this.project(target, related, match[3], depth + 1))[0] ?? null;
        } else {
          column(table, field);
          if (secretFields.has(field) && !this.domainOperations)
            throw new Error("Campo protegido");
          out[field] = row[field];
        }
      }
      result.push(out);
    }
    return result;
  }
  async execute(input) {
    try {
      const s = structuredClone(input), table = s.table, write = s.action !== "select";
      if (!["select", "insert", "upsert", "update", "delete"].includes(s.action))
        throw new Error("Opera\xE7\xE3o inv\xE1lida");
      if (table === "users" || table === "template_owner")
        throw new Error("Tabela indispon\xEDvel");
      if (s.action !== "select" && !this.domainOperations && (privilegedWrites.has(table) || !writeTables.has(table)))
        throw new Error("Use a opera\xE7\xE3o autorizada para esta altera\xE7\xE3o");
      if (s.action === "select" && !readableTables.has(table))
        throw new Error("Tabela indispon\xEDvel");
      if (s.action === "select" && !this.domainOperations)
        for (const field of parts(s.columns || "*")) {
          if (/^\w+$/.test(field) && secretFields.has(field))
            throw new Error("Campo protegido");
        }
      const scope = await this.scope(table, write), args = [...scope.args], conditions = [scope.clause];
      if (!Array.isArray(s.filters) || s.filters.length > 30)
        throw new Error("Filtros inv\xE1lidos");
      for (const f of s.filters) {
        const key = column(table, f.key);
        if (f.op === "in") {
          if (!Array.isArray(f.value) || f.value.length > 1000)
            throw new Error("Filtro inv\xE1lido");
          conditions.push(f.value.length ? key + " IN (" + f.value.map(() => "?").join(",") + ")" : "0=1");
          args.push(...f.value.map(value));
          continue;
        }
        if (f.op === "notnull") {
          conditions.push(key + " IS NOT NULL");
          continue;
        }
        const op = { eq: "=", neq: "!=", gt: ">", gte: ">=", lt: "<", lte: "<=", is: "IS", ilike: "LIKE" };
        if (!op[f.op])
          throw new Error("Operador inv\xE1lido");
        conditions.push(key + " " + op[f.op] + " ?" + (f.op === "ilike" ? " COLLATE NOCASE" : ""));
        args.push(value(f.value));
      }
      const where = conditions.join(" AND "), limit = Math.min(5000, Math.max(0, Number(s.limit ?? 1000))), offset = Math.max(0, Number(s.offset ?? 0));
      if (!Number.isInteger(limit) || !Number.isInteger(offset))
        throw new Error("Pagina\xE7\xE3o inv\xE1lida");
      const order = s.orders?.length ? " ORDER BY " + s.orders.map((o) => column(table, o.key) + (o.ascending ? " ASC" : " DESC")).join(",") : "";
      let rows = [], count = 0;
      if (!write) {
        count = Number((await this.sql.sql("SELECT COUNT(*) AS total FROM " + quote(table) + " WHERE " + where, args)).rows[0]?.total || 0);
        if (!s.head)
          rows = (await this.sql.sql("SELECT * FROM " + quote(table) + " WHERE " + where + order + " LIMIT ? OFFSET ?", [...args, limit, offset])).rows;
      } else {
        if (!["insert", "upsert"].includes(s.action) && s.filters.length === 0)
          throw new Error("Altera\xE7\xE3o exige filtro expl\xEDcito");
        if (["update", "delete"].includes(s.action)) {
          const idFilter = s.filters.find((f) => f.key === "id" || table === "company" && f.key === "id");
          if (idFilter) {
            const own = await this.sql.sql("SELECT id FROM " + quote(table) + " WHERE id = ? AND " + scope.clause, [value(idFilter.value), ...scope.args]);
            if (!own.rows.length)
              throw new Error("Registro n\xE3o pertence \xE0 empresa");
          }
        }
        if (s.action === "delete") {
          rows = (await this.sql.sql("DELETE FROM " + quote(table) + " WHERE " + where + " RETURNING *", args)).rows;
        } else {
          const payloads = Array.isArray(s.payload) ? s.payload : [s.payload];
          if (payloads.length > 1000)
            throw new Error("Lote muito grande");
          for (const raw of payloads) {
            if (!raw || typeof raw !== "object")
              throw new Error("Dados inv\xE1lidos");
            const row = { ...raw };
            if ("trial_ends_at" in row && table === "subscription") {
              row.trial_end = row.trial_ends_at;
              delete row.trial_ends_at;
            }
            if (!this.internal && !this.identity.master) {
              for (const k of Object.keys(row))
                if (secretFields.has(k) || ["created_by", "creditos_saldo", "creditos_origem", "creditos_resetam_em", "status_cobranca", "trial_ate", "selected_plan_slug"].includes(k))
                  throw new Error("Campo protegido: " + k);
              if (table === "profiles") {
                if (row.user_id && row.user_id !== this.identity.userId)
                  throw new Error("Usu\xE1rio inv\xE1lido");
                row.user_id = this.identity.userId;
              } else if (table !== "company") {
                if (row.company_id && row.company_id !== this.identity.companyId)
                  throw new Error("Empresa inv\xE1lida");
                row.company_id = this.identity.companyId;
              }
              if (row.user_id && row.user_id !== this.identity.userId)
                throw new Error("Usu\xE1rio inv\xE1lido");
              if (s.action === "update")
                delete row.id;
              for (const [fk, target] of [["stage_id", "crm_stage"], ["card_id", "crm_cards"], ["categoria_id", "fin_categoria"]])
                if (row[fk]) {
                  const r = await this.sql.sql("SELECT id FROM " + target + " WHERE id = ? AND company_id = ?", [row[fk], this.identity.companyId]);
                  if (!r.rows.length)
                    throw new Error("Refer\xEAncia de outra empresa");
                }
              if (s.action === "insert" && row.id) {
                const existing = await this.sql.sql("SELECT id FROM " + quote(table) + " WHERE id = ?", [row.id]);
                if (existing.rows.length)
                  throw new Error("Registro j\xE1 existe");
              }
            }
            if (s.action !== "update" && schema[table].id && !row.id)
              row.id = crypto.randomUUID();
            if (s.action === "update" && schema[table].updated_at)
              row.updated_at = new Date().toISOString();
            const keys = Object.keys(row);
            keys.forEach((k) => column(table, k));
            if (!keys.length)
              throw new Error("Dados vazios");
            let statement, params;
            if (s.action === "update") {
              statement = "UPDATE " + quote(table) + " SET " + keys.map((k) => quote(k) + " = ?").join(",") + " WHERE " + where + " RETURNING *";
              params = [...keys.map((k) => value(row[k])), ...args];
            } else {
              statement = "INSERT INTO " + quote(table) + " (" + keys.map(quote).join(",") + ") VALUES (" + keys.map(() => "?").join(",") + ")";
              params = keys.map((k) => value(row[k]));
              if (s.action === "upsert") {
                const conflict = (s.conflict || (schema[table].id ? "id" : table === "profiles" ? "user_id" : "company_id")).split(",").map((k) => k.trim());
                conflict.forEach((k) => column(table, k));
                const updates = keys.filter((k) => !conflict.includes(k) && k !== "id");
                if (!this.internal && !this.identity.master) {
                  const key = conflict.join(",");
                  if (!safeConflicts[table]?.includes(key))
                    throw new Error("Chave de conflito n\xE3o autorizada");
                  if (conflict.includes("company_id") && row.company_id !== this.identity.companyId)
                    throw new Error("Empresa inv\xE1lida");
                  const target = conflict.map((k) => quote(k) + " = ?").join(" AND ");
                  const foreign = await this.sql.sql("SELECT id FROM " + quote(table) + " WHERE " + target + " AND NOT (" + scope.clause + ") LIMIT 1", [...conflict.map((k) => value(row[k])), ...scope.args]);
                  if (foreign.rows.length)
                    throw new Error("Registro de outra empresa");
                }
                if (!this.internal && !this.identity.master && table !== "profiles" && !conflict.includes("company_id"))
                  throw new Error("Upsert exige chave da empresa");
                statement += " ON CONFLICT (" + conflict.map(quote).join(",") + ") " + (updates.length ? "DO UPDATE SET " + updates.map((k) => quote(k) + "=excluded." + quote(k)).join(",") : "DO NOTHING");
              }
              statement += " RETURNING *";
            }
            rows.push(...(await this.sql.sql(statement, params)).rows);
          }
        }
        count = rows.length;
      }
      const projected = await this.project(table, rows, s.columns || "*");
      if (s.cardinality === "one" && projected.length !== 1)
        throw new Error("Esperado exatamente um registro");
      if (s.cardinality === "maybe" && projected.length > 1)
        throw new Error("Mais de um registro encontrado");
      return { data: s.head ? null : s.cardinality ? projected[0] ?? null : projected, error: null, count };
    } catch (error) {
      return { data: null, error: { message: error.message || String(error) }, count: 0 };
    }
  }
}
export {
  Database
};
