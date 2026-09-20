# SyncChat AI

SyncChat AI is a multi-platform unified inbox and communication hub designed to aggregate messages from Slack, Discord, WhatsApp, Microsoft Teams, and email into one smart workspace, supercharged with autonomous agentic intelligence.

## AWS Build It Technology

SyncChat uses **AWS Strands Agents SDK** and **Amazon Bedrock** for its agentic conversation-analysis workflow.

### Workflow
Conversation → Strands Agent (Observe → Retrieve → Reason → Act → Verify → Respond) → analysis → summary / action items / suggested reply → SyncChat UI.

## Environment Variables

Copy `.env.example` to `.env` and configure your credentials:
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_BEDROCK_MODEL_ID`

## Running the App

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Start production server:
   ```bash
   npm start
   ```
