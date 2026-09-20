import { MessageCircle, Mail, Slack, Send, Users } from "lucide-react";

export const PLATFORM_META = {
  whatsapp: { name: "WhatsApp", color: "#25D366", icon: MessageCircle },
  gmail: { name: "Gmail", color: "#EA4335", icon: Mail },
  slack: { name: "Slack", color: "#E01E5A", icon: Slack },
  telegram: { name: "Telegram", color: "#229ED9", icon: Send },
  teams: { name: "Microsoft Teams", color: "#6264A7", icon: Users },
};

export const PLATFORM_ORDER = ["whatsapp", "gmail", "slack", "telegram", "teams"];

export function platform(id) {
  return PLATFORM_META[id] || { name: id, color: "#6366F1", icon: MessageCircle };
}
