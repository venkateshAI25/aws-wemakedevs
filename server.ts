import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { runStrandsConversationAgent, ConversationInput } from "./server/strandsAgent";
import { INITIAL_DATA } from "./src/data/initialData";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Parse JSON payloads
  app.use(express.json());

  // Health and System Diagnostics
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "SyncChat Backend with AWS Strands Agents",
      uptime: process.uptime(),
    });
  });

  // AWS Strands Agent Configuration & Diagnostic Endpoint
  app.get("/api/strands/health", (_req, res) => {
    const hasAwsCreds = Boolean(
      process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    );
    res.json({
      agentFramework: "@strands-agents/sdk",
      agentName: "SyncChat-Strands-Agent",
      modelProvider: "Amazon Bedrock",
      configuredModelId: process.env.AWS_BEDROCK_MODEL_ID || "anthropic.claude-3-haiku-20240307-v1:0",
      region: process.env.AWS_REGION || "us-east-1",
      credentialsConfigured: hasAwsCreds,
      flow: ["Observe", "Retrieve", "Reason", "Act", "Verify", "Respond"],
    });
  });

  // Handler for Strands Agent conversation analysis
  const handleConversationAnalysis = async (req: express.Request, res: express.Response) => {
    try {
      const { conversation_slug, conversation } = req.body || {};

      let targetConv: ConversationInput = conversation;

      if (!targetConv && conversation_slug) {
        // Look up in INITIAL_DATA
        const details = (INITIAL_DATA as any).conversationsDetails?.[conversation_slug];
        const summary = (INITIAL_DATA as any).conversations?.find(
          (c: any) => c.slug === conversation_slug
        );

        if (details) {
          targetConv = details;
        } else if (summary) {
          targetConv = {
            ...summary,
            messages: [
              {
                sender: summary.last_sender || "Colleague",
                text: summary.last_message || "",
                time: summary.time || "Recently",
              },
            ],
          };
        }
      }

      if (!targetConv) {
        targetConv = {
          title: "Team Sync",
          platform: "slack",
          messages: [
            {
              sender: "Team",
              text: "General discussion on active projects and priorities",
              time: "Today",
            },
          ],
        };
      }

      const result = await runStrandsConversationAgent(targetConv);
      res.json(result);
    } catch (error: any) {
      console.error("Strands Agent execution error:", error);
      res.status(500).json({
        error: "Failed to execute Strands Agent",
        detail: error?.message || String(error),
      });
    }
  };

  // Dedicated Strands Agent endpoints
  app.post("/api/strands/analyze", handleConversationAnalysis);
  app.post("/api/ai/summary", handleConversationAnalysis);

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SyncChat Server running on http://0.0.0.0:${PORT} with AWS Strands Agents`);
  });
}

startServer();
