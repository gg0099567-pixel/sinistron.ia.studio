import express, { Request, Response } from 'express';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Google GenAI lazily
  let aiClient: GoogleGenAI | null = null;
  function getAIClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // Health check API
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      system: 'sinistron.ia',
      hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // AI Strategic Advisor & Diagnostics API
  app.post('/api/ai/advisor', async (req: Request, res: Response) => {
    try {
      const {
        action,
        prompt,
        salesSummary,
        inventorySummary,
        branchesSummary,
        sellersSummary,
      } = req.body;

      const ai = getAIClient();

      if (ai) {
        const systemPrompt = `Você é o "Sinistron.ia AI Advisor", um especialista sênior em inteligência de negócios, finanças, precificação, gestão comercial e controle de estoque de varejo físico e eletrônicos.
Seu objetivo é analisar dados reais da operação, calcular projeções, indicar gargalos e propor ações práticas de alta conversão.

Contexto da Operação:
- Vendas Totais: R$ ${salesSummary?.totalRevenue || 0} (${salesSummary?.totalCount || 0} vendas)
- Lucro Bruto Estimado: R$ ${salesSummary?.grossProfit || 0} (Margem: ${salesSummary?.marginPercent || 0}%)
- Ticket Médio: R$ ${salesSummary?.ticketAverage || 0}
- Estoque: ${inventorySummary?.totalProducts || 0} produtos cadastrados, R$ ${inventorySummary?.totalStockCost || 0} em custo, ${inventorySummary?.lowStockCount || 0} itens em alerta
- Filiais: ${JSON.stringify(branchesSummary || [])}
- Vendedores: ${JSON.stringify(sellersSummary || [])}

Responda em formato JSON quando solicitado ou em texto markdown profissional e assertivo em Português do Brasil.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt || `Faça uma análise executiva completa do negócio considerando o estágio atual e proponha 3 ações estratégicas imediatas.`,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });

        return res.json({
          success: true,
          content: response.text,
          provider: 'gemini-3.7-flash',
        });
      }

      // Fallback heuristic intelligence if GEMINI_API_KEY is not configured
      const revenue = salesSummary?.totalRevenue || 0;
      const totalCount = salesSummary?.totalCount || 0;
      const lowStockCount = inventorySummary?.lowStockCount || 0;
      const grossMargin = salesSummary?.marginPercent || 0;

      let analysisContent = '';
      if (action === 'diagnostic') {
        analysisContent = `### ⚡ Diagnóstico Executivo Inteligente (Sinistron.ia)

**Status Geral da Operação:** ${revenue > 0 ? '🟢 Operação Ativa em Andamento' : '🟡 Sistema Inicializado - Aguardando primeiras vendas'}

1. **Volume & Faturamento:**
   - Faturamento registrado: **R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** (${totalCount} vendas).
   - Margem Média: **${grossMargin.toFixed(1)}%**
   - ${revenue === 0 ? 'Dica: Utilize o catálogo rápido ou lance as primeiras vendas no PDV para calibrar os gráficos preditivos.' : 'Mantenha o acompanhamento diário do ticket médio.'}

2. **Gestão de Estoque & Ruptura:**
   - Produtos em nível crítico/baixo: **${lowStockCount} itens**.
   - ${lowStockCount > 0 ? '⚠️ **Ação Recomendada:** Realize pedidos de reposição para evitar perda de vendas nos itens com estoque abaixo do mínimo.' : '✅ Estoque balanceado sem itens zerados no momento.'}

3. **Plano de Ação Sugerido:**
   - **Ação 1:** Estabeleça metas progressivas por vendedor no ranking de equipe.
   - **Ação 2:** Configure as taxas reais de maquininha nas Configurações para apurar o lucro líquido exato.
   - **Ação 3:** Monitore o índice de conversão de orçamentos em vendas no menu Orçamentos.`;
      } else {
        analysisContent = `Olá! Sou o assistente de inteligência estratégica do **sinistron.ia**.\n\nCom base nos dados atuais da sua loja:\n- Faturamento Acumulado: **R$ ${revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**\n- Produtos em Catálogo: **${inventorySummary?.totalProducts || 0}**\n- Itens com Alerta de Estoque: **${lowStockCount}**\n\nEstou pronto para calcular projeções de vendas, analisar margens de markup ou simular metas de equipe!`;
      }

      return res.json({
        success: true,
        content: analysisContent,
        provider: 'sinistron-heuristic-engine',
      });
    } catch (error: any) {
      console.error('AI Advisor error:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Erro ao processar consulta de IA',
      });
    }
  });

  // AI Marketing & Social Media Campaign Generator
  app.post('/api/ai/marketing', async (req: Request, res: Response) => {
    try {
      const { campaignType, productName, price, discount, targetAudience, extraDetails } = req.body;
      const ai = getAIClient();

      if (ai) {
        const prompt = `Crie um pacote completo de copywriting de alta conversão para o varejo de eletrônicos/smartphones:
- Tipo de Campanha: ${campaignType || 'Promoção Relâmpago'}
- Produto/Oferta: ${productName || 'iPhone 15 Pro com Combo Proteção'}
- Preço/Condição: ${price || 'Sob Consulta'} (Desconto: ${discount || '15%'})
- Público-Alvo: ${targetAudience || 'Clientes locais no WhatsApp e Instagram'}
- Detalhes extras: ${extraDetails || 'Parcelamento em até 12x no cartão, aceitamos aparelho usado na troca'}

Forneça 3 peças completas prontas para envio:
1. 📲 **Mensagem para Disparo no WhatsApp** (com emojis, gatilhos de escassez e chamada para ação com link direto).
2. 📸 **Legenda para Post / Carrossel do Instagram** (com gancho magnético, benefícios claros e hashtags estratégicas).
3. ⚡ **Roteiro de 15 segundos para Stories / Reels / Vídeo Curto** (com Gancho visual, Proposta e CTA urgente).`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Você é um estrategista sênior de marketing digital e copywriting para grandes redes de varejo de eletrônicos e smartphones. Responda em Português do Brasil de forma persuasiva, moderna e pronta para colar.',
            temperature: 0.8,
          },
        });

        return res.json({
          success: true,
          content: response.text,
          provider: 'gemini-3.7-flash',
        });
      }

      // Heuristic Fallback
      const waMessage = `🔥 *OFERTA EXCLUSIVA SINISTRON.IA* 🔥\n\nFala família! Chegou a oportunidade que você esperava:\n\n📱 *${productName || 'Smartphones & Acessórios Premium'}*\n💥 De R$ ${price || '3.590,00'} por apenas *R$ ${discount ? 'condição especial' : price}*\n💳 Parcelamos em até 12x no cartão | 🔁 Aceitamos seu usado na troca (Trade-In)\n\n⚠️ Poucas unidades no estoque da matriz!\n👉 Responda essa mensagem agora para reservar o seu com brinde exclusivo!`;

      const igCaption = `🚀 O upgrade que você merece chegou na Sinistron!\n\n${productName || 'Smartphones com garantia e procedência'}\n\n✨ Garantia estendida\n⚡ Pronta entrega\n🛡️ Combo proteção incluso\n\nComente "EU QUERO" ou clique no link da bio para garantir antes que acabe o lote!\n\n#smartphones #tecnologia #promocao #iphone #sinistron`;

      return res.json({
        success: true,
        content: `### 📲 1. Mensagem para WhatsApp (Transmissão & Direct):\n\n\`\`\`\n${waMessage}\n\`\`\`\n\n### 📸 2. Legenda de Alta Conversão para Instagram:\n\n${igCaption}\n\n### ⚡ 3. Roteiro Rápido para Stories (15s):\n- **0-3s:** Mostre o aparelho na mão: *"Você ainda tá com o celular travando?"*\n- **3-10s:** Destaque a condição: *"Chegou lote novo com preço de Black Friday e aceitamos seu usado!"*\n- **10-15s:** CTA: *"Arrasta pra cima ou chama no WhatsApp antes que zere!"*`,
        provider: 'sinistron-heuristic-engine',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // AI Service Order Diagnostic & Technical Recommendation
  app.post('/api/ai/diagnostics-os', async (req: Request, res: Response) => {
    try {
      const { deviceModel, reportedDefect } = req.body;
      const ai = getAIClient();

      if (ai) {
        const prompt = `Como mestre técnico sênior em manutenção de smartphones e eletrônicos, analise o seguinte chamado:
- Modelo do Dispositivo: ${deviceModel}
- Defeito Relatado pelo Cliente: ${reportedDefect}

Forneça um laudo preliminar estruturado:
1. Provável Causa Raiz
2. Procedimentos de Teste e Bancada Recomendados
3. Peças / Componentes com maior probabilidade de substituição
4. Estimativa de tempo de bancada
5. Cuidados especiais (ex: reprogramação TrueTone, perda de vedação, backup de dados)`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: 'Você é um perito técnico em bancada de eletrônicos e smartphones. Responda em Português do Brasil de forma clara, técnica e preventiva.',
            temperature: 0.5,
          },
        });

        return res.json({
          success: true,
          content: response.text,
          provider: 'gemini-3.7-flash',
        });
      }

      return res.json({
        success: true,
        content: `### 🛠️ Laudo Técnico Sinistron.ia para ${deviceModel || 'Aparelho'}\n\n**Análise do Defeito:** "${reportedDefect || 'Aparelho sem ligar/danificado'}"\n\n1. **Inspeção Primária:** Realizar teste com amperímetro USB para verificar consumo em repouso e consumo de boot.\n2. **Componentes Suspeitos:** Verificar conector de carga, malha de alimentação primária (VCC_MAIN) e integridade da bateria.\n3. **Recomendações:** Alertar o cliente sobre realização prévia de backup e teste de biometria/FaceID antes e após abertura.`,
        provider: 'sinistron-heuristic-engine',
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // Export Data API / Backup Helper
  app.post('/api/export/csv', (req: Request, res: Response) => {
    try {
      const { filename, csvContent } = req.body;
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename || 'relatorio-sinistron.csv'}"`);
      res.send('\uFEFF' + csvContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[sinistron.ia] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[sinistron.ia] Failed to start server:', err);
  process.exit(1);
});
