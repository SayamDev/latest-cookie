import type { Daily } from "./daily.ts";

// A transparent title-based filter, not an editorial review of the article.
export function newsTopic(title: string): string {
  if (/\b(security|hack\w*|breach\w*|malware|ransomware|vulnerabilit\w*|privacy|password\w*)\b/i.test(title)) return "Security";
  if (/\b(open[- ]source|github|linux)\b/i.test(title)) return "Open Source";
  if (/\b(ai|llm\w*|gpt\w*|claude|gemini|openai|anthropic|deepseek|machine learning|artificial intelligence)\b/i.test(title)) return "AI & ML";
  if (/\b(javascript|typescript|css|html|react|frontend|web development|browser\w*)\b/i.test(title)) return "Web Development";
  if (/\b(developer\w*|coding|programming|ide|sdk|api|devtools)\b/i.test(title)) return "Developer Tools";
  if (/\b(chip\w*|gpu\w*|cpu\w*|laptop\w*|phone\w*|iphone\w*|tablet\w*|hardware|nvidia|processor\w*|device\w*|macbook\w*)\b/i.test(title)) return "Hardware";
  return "General tech";
}
export function filterNews(news: Daily["news"], query: string, topic: string) {
  const q = query.trim().toLowerCase();
  return news.filter(item => (topic === "All" || newsTopic(item.title) === topic)
    && `${item.title} ${item.source} ${newsTopic(item.title)}`.toLowerCase().includes(q))
    .sort((a,b) => b.published.localeCompare(a.published));
}
