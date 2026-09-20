import { INITIAL_DATA } from "@/data/initialData";

const STORAGE_KEY = "sc_app_state_v1";

interface AppState {
  user: any;
  platforms: any[];
  conversations: any[];
  spaces: any[];
  reports: any[];
  notifications: any[];
  conversationsDetails: Record<string, any>;
}

function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        user: parsed.user || INITIAL_DATA.user,
        platforms: parsed.platforms || INITIAL_DATA.platforms,
        conversations: parsed.conversations || INITIAL_DATA.conversations,
        spaces: parsed.spaces || INITIAL_DATA.spaces,
        reports: parsed.reports || INITIAL_DATA.reports,
        notifications: parsed.notifications || INITIAL_DATA.notifications,
        conversationsDetails: parsed.conversationsDetails || INITIAL_DATA.conversationsDetails,
      };
    }
  } catch (e) {
    console.error("Failed to load local state:", e);
  }
  return JSON.parse(JSON.stringify(INITIAL_DATA));
}

function saveState(state: AppState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save local state:", e);
  }
}

let currentState: AppState = loadState();

export const API = "/api";

export const api = {
  interceptors: {
    request: {
      use: () => {},
    },
  },

  async get(url: string, config?: { params?: Record<string, any> }): Promise<{ data: any }> {
    await new Promise((r) => setTimeout(r, 60)); // subtle realistic async feel
    currentState = loadState();
    const cleanUrl = url.split("?")[0].replace(/^\/api/, "").replace(/\/$/, "");
    const params = config?.params || {};

    // /auth/me
    if (cleanUrl === "/auth/me") {
      const token = localStorage.getItem("sc_token");
      if (!token) {
        throw { response: { status: 401, data: { detail: "Unauthorized" } } };
      }
      return { data: { user: currentState.user } };
    }

    // /platforms
    if (cleanUrl === "/platforms") {
      return { data: currentState.platforms };
    }

    // /conversations
    if (cleanUrl === "/conversations") {
      let list = [...currentState.conversations];
      if (params.space) {
        list = list.filter((c) => c.space === params.space);
      }
      if (params.platform && params.platform !== "all") {
        list = list.filter((c) => c.platform === params.platform);
      }
      if (params.q) {
        const query = String(params.q).toLowerCase();
        list = list.filter(
          (c) =>
            c.title.toLowerCase().includes(query) ||
            c.last_message.toLowerCase().includes(query) ||
            c.participants.some((p: any) => p.name.toLowerCase().includes(query))
        );
      }
      return { data: list };
    }

    // /conversations/:slug
    if (cleanUrl.startsWith("/conversations/")) {
      const slug = cleanUrl.replace("/conversations/", "");
      const conv = currentState.conversationsDetails[slug];
      if (!conv) {
        // Fallback if detail not found
        const summary = currentState.conversations.find((c) => c.slug === slug);
        if (summary) {
          return {
            data: {
              ...summary,
              messages: [
                {
                  sender: summary.participants[0]?.name || "Colleague",
                  text: summary.last_message,
                  time: summary.time,
                  direction: "in",
                  status: "read",
                },
              ],
            },
          };
        }
        throw { response: { status: 404, data: { detail: "Conversation not found" } } };
      }
      return { data: conv };
    }

    // /spaces
    if (cleanUrl === "/spaces") {
      return { data: currentState.spaces };
    }

    // /reports
    if (cleanUrl === "/reports") {
      return { data: currentState.reports };
    }

    // /notifications
    if (cleanUrl === "/notifications") {
      return { data: currentState.notifications };
    }

    // /search
    if (cleanUrl === "/search") {
      const q = String(params.q || "").toLowerCase().trim();
      if (!q) {
        return { data: { conversations: [], messages: [] } };
      }

      const matchingConvs = currentState.conversations.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.last_message.toLowerCase().includes(q) ||
          c.participants.some((p: any) => p.name.toLowerCase().includes(q))
      );

      const matchingMsgs: any[] = [];
      Object.entries(currentState.conversationsDetails).forEach(([slug, detail]) => {
        detail.messages.forEach((m: any) => {
          if (m.text.toLowerCase().includes(q) || m.sender.toLowerCase().includes(q)) {
            matchingMsgs.push({
              slug,
              platform: detail.platform,
              conversation: detail.title,
              sender: m.sender,
              time: m.time,
              text: m.text,
            });
          }
        });
      });

      return {
        data: {
          conversations: matchingConvs,
          messages: matchingMsgs.slice(0, 20),
        },
      };
    }

    return { data: null };
  },

  async post(url: string, body: any = {}, config?: any): Promise<{ data: any }> {
    await new Promise((r) => setTimeout(r, 90));
    currentState = loadState();
    const cleanUrl = url.split("?")[0].replace(/^\/api/, "").replace(/\/$/, "");

    // /auth/login
    if (cleanUrl === "/auth/login") {
      const { email, password } = body;
      if (!email || !password) {
        throw { response: { status: 400, data: { detail: "Email and password required" } } };
      }
      const token = "mock-jwt-" + Math.random().toString(36).substring(2);
      localStorage.setItem("sc_token", token);
      const user = {
        ...currentState.user,
        email: email,
        name: email.includes("demo") ? "Venkatesh S" : email.split("@")[0],
      };
      currentState.user = user;
      saveState(currentState);
      return { data: { access_token: token, user } };
    }

    // /auth/register
    if (cleanUrl === "/auth/register") {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        throw { response: { status: 400, data: { detail: "All fields are required" } } };
      }
      const token = "mock-jwt-" + Math.random().toString(36).substring(2);
      localStorage.setItem("sc_token", token);
      const user = {
        ...currentState.user,
        name,
        email,
      };
      currentState.user = user;
      saveState(currentState);
      return { data: { access_token: token, user } };
    }

    // /platforms/connect
    if (cleanUrl === "/platforms/connect") {
      const { platform_id } = body;
      currentState.platforms = currentState.platforms.map((p) =>
        p.id === platform_id ? { ...p, connected: true } : p
      );
      if (!currentState.user.connected_platforms.includes(platform_id)) {
        currentState.user.connected_platforms.push(platform_id);
      }
      // Add notification
      currentState.notifications.unshift({
        type: "app",
        title: "New app connected",
        body: `${platform_id.charAt(0).toUpperCase() + platform_id.slice(1)} was connected to SyncChat.`,
        time: "Just now",
        read: false,
      });
      saveState(currentState);
      return { data: { ok: true } };
    }

    // /platforms/disconnect
    if (cleanUrl === "/platforms/disconnect") {
      const { platform_id } = body;
      currentState.platforms = currentState.platforms.map((p) =>
        p.id === platform_id ? { ...p, connected: false } : p
      );
      currentState.user.connected_platforms = currentState.user.connected_platforms.filter(
        (id: string) => id !== platform_id
      );
      saveState(currentState);
      return { data: { ok: true } };
    }

    // /conversations/:slug/messages
    if (cleanUrl.includes("/conversations/") && cleanUrl.endsWith("/messages")) {
      const parts = cleanUrl.split("/");
      const slug = parts[parts.indexOf("conversations") + 1];
      const { text } = body;

      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

      const newMsg = {
        sender: "You",
        text,
        time: timeStr,
        direction: "out",
        status: "delivered",
      };

      if (currentState.conversationsDetails[slug]) {
        currentState.conversationsDetails[slug].messages.push(newMsg);
      }

      currentState.conversations = currentState.conversations.map((c) => {
        if (c.slug === slug) {
          return {
            ...c,
            last_message: text,
            last_sender: "You",
            time: timeStr,
            unread: 0,
          };
        }
        return c;
      });

      saveState(currentState);
      return { data: { message: newMsg } };
    }

    // /spaces
    if (cleanUrl === "/spaces") {
      const { name, description } = body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Math.random().toString(36).substring(2, 6);
      const colors = ["#6366F1", "#8B5CF6", "#3B82F6", "#10B981", "#EC4899", "#F59E0B"];
      const color = colors[currentState.spaces.length % colors.length];

      const newSpace = {
        slug,
        name,
        description: description || "",
        color,
        conversation_count: 0,
        platforms: ["slack", "teams"],
        unread: 0,
      };

      currentState.spaces.push(newSpace);
      saveState(currentState);
      return { data: newSpace };
    }

    // /reports
    if (cleanUrl === "/reports") {
      const { title, type, conversation_slugs = [] } = body;
      const slugs = conversation_slugs.length > 0 ? conversation_slugs : currentState.conversations.map((c) => c.slug);
      const selectedConvs = currentState.conversations.filter((c) => slugs.includes(c.slug));
      const platformsUsed = Array.from(new Set(selectedConvs.map((c) => c.platform)));

      const today = new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const newReport = {
        id: Math.random().toString(36).substring(2) + Date.now().toString(36),
        user_id: "user-" + Date.now(),
        title: title || type || "Conversation Summary",
        type: type || "Conversation Summary",
        date: today,
        platforms: platformsUsed.length ? platformsUsed : ["gmail", "slack", "teams", "whatsapp"],
        conversations_analyzed: selectedConvs.map((c) => c.title),
        summary: `This ${type || "report"} analyzes ${selectedConvs.length} conversation(s) across ${platformsUsed.join(", ") || "multiple channels"}. The team is aligned on active deliverables, coordinating QA routines, and tracking key action items and stakeholder feedback.`,
        key_discussions: selectedConvs.map((c) => `${c.title} (${c.platform})`),
        decisions: [
          "Proceed with QA on v2.4 immediately",
          "Adopt updated UI tokens and palette",
          "Finalize next sprint deliverables and scope",
        ],
        action_items: [
          "Complete platform regression suite by EOD",
          "Prepare revised delivery timeline",
          "Review customer feedback notes and update roadmap",
        ],
        people: Array.from(
          new Set(selectedConvs.flatMap((c) => c.participants.map((p: any) => p.name)))
        ).filter((n) => n !== "You"),
        pending_tasks: [
          "Complete mobile responsiveness pass",
          "Deliver revised client timeline",
          "Finalize launch assets by the end of sprint",
        ],
        recommendations: [
          "Prioritize the P1 mobile inbox layout fix",
          "Schedule quick sync after QA sign-off",
          "Send progress digest to stakeholders",
        ],
        created_at: new Date().toISOString(),
      };

      currentState.reports.unshift(newReport);
      currentState.notifications.unshift({
        type: "report",
        title: "AI report completed",
        body: `${newReport.title} is ready to download.`,
        time: "Just now",
        read: false,
      });

      saveState(currentState);
      return { data: newReport };
    }

    // /ai/summary
    if (cleanUrl === "/ai/summary") {
      const { conversation_slug } = body;
      const conv = currentState.conversationsDetails[conversation_slug] ||
        currentState.conversations.find((c) => c.slug === conversation_slug);

      const title = conv?.title || "Conversation";
      const platformName = conv?.platform || "slack";
      const lastMsg = conv?.messages?.[conv.messages.length - 1] || { sender: "Colleague", text: conv?.last_message || "", time: "Today" };
      const peopleList = conv?.participants?.map((p: any) => p.name).filter((n: string) => n !== "You") || ["Team Member"];

      const summaryData = {
        summary: `This ${platformName} conversation "${title}" focuses on: "${lastMsg.text}". The participants coordinated on active deliverables, reviewed priorities, and clarified ownership for upcoming sprints.`,
        keyPoints: [
          "Team coordinated on core deliverables",
          "Reviewed sprint progress and potential blockers",
          "Responsibilities and next steps were clarified",
        ],
        decisions: [
          "Agreed to proceed with the proposed plan and timeline",
          "Maintain current sprint commitments without scope creep",
        ],
        actionItems: [
          "Follow up on the items raised in the thread",
          "Provide status update at the next daily standup",
        ],
        people: peopleList.length ? peopleList : ["Team"],
        nextSteps: [
          "Continue the conversation and track progress in the workspace",
          "Verify test scenarios before deployment",
        ],
        source: {
          platform: platformName,
          conversation: title,
          sender: lastMsg.sender || "You",
          time: lastMsg.time || "Recently",
        },
      };

      return { data: summaryData };
    }

    // /ai/ask
    if (cleanUrl === "/ai/ask") {
      const { question = "", conversation_slug } = body;
      const q = question.toLowerCase();

      let matchedSources: any[] = [];
      let answer = "";

      if (conversation_slug && currentState.conversationsDetails[conversation_slug]) {
        const conv = currentState.conversationsDetails[conversation_slug];
        matchedSources = conv.messages.slice(-2).map((m: any) => ({
          platform: conv.platform,
          conversation: conv.title,
          slug: conversation_slug,
          sender: m.sender,
          time: m.time,
          text: m.text,
        }));
      } else {
        // Find best matching conversation
        const hit = currentState.conversations.find(
          (c) =>
            c.title.toLowerCase().includes("bug") ||
            c.title.toLowerCase().includes("standup") ||
            c.last_message.toLowerCase().includes("p1")
        ) || currentState.conversations[0];

        if (hit) {
          matchedSources.push({
            platform: hit.platform,
            conversation: hit.title,
            slug: hit.slug,
            sender: hit.last_sender,
            time: hit.time,
            text: hit.last_message,
          });
        }
      }

      if (q.includes("decision") || q.includes("decide")) {
        answer = "Based on recent conversations, the team decided to proceed with QA on the v2.4 release immediately, adopt the indigo/violet theme palette for the redesign, and log the mobile inbox overflow as a P1 issue for this sprint.";
      } else if (q.includes("responsible") || q.includes("owner") || q.includes("who")) {
        answer = "Priya Nair is running the web regression suite, Arjun Mehta is handling mobile testing by EOD, and Venkatesh is updating the design tokens and revising the client timeline by Wednesday.";
      } else if (q.includes("bug") || q.includes("issue") || q.includes("pending")) {
        answer = "There is a high-priority P1 bug reported by Priya regarding a layout overflow on mobile screens at 390px width. Mobile testing is ongoing with Arjun until EOD.";
      } else if (q.includes("client") || q.includes("feedback")) {
        answer = "Client feedback from Alex Rivera has been very positive on the initial prototype. A revised project timeline with a fixed-price milestone option is being prepared for delivery by Wednesday.";
      } else if (q.includes("deadline") || q.includes("date") || q.includes("when")) {
        answer = "Key deadlines: Arjun completes mobile testing by EOD today, revised timeline due to client by Wednesday, and v2.4 QA sign-off scheduled for later this week.";
      } else {
        answer = `Based on your recent activity across ${currentState.user.connected_platforms.join(", ")}, the team is focused on shipping v2.4, concluding mobile regression testing, and wrapping up design token updates.`;
      }

      return {
        data: {
          answer,
          sources: matchedSources,
        },
      };
    }

    return { data: { ok: true } };
  },
};

export function apiErr(detail: any): string {
  if (detail == null) return "Something went wrong. Please try again.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}
