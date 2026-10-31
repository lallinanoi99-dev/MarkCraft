// Copy of worker/src/blocklist.js — keep in sync.
export const BLOCKED_BRANDS = [
  "google", "alphabet", "youtube", "gmail", "android", "apple", "iphone", "ipad", "macbook", "microsoft", "windows", "xbox",
  "amazon", "aws", "kindle", "meta", "facebook", "instagram", "whatsapp", "threads", "twitter", "tiktok", "snapchat",
  "linkedin", "pinterest", "reddit", "discord", "telegram", "netflix", "spotify", "disney", "pixar", "marvel", "hbo",
  "nike", "adidas", "puma", "reebok", "underarmour", "gucci", "prada", "chanel", "louisvuitton", "hermes", "dior",
  "versace", "balenciaga", "rolex", "cartier", "tiffany", "zara", "hm", "uniqlo", "levis", "supreme", "coca-cola",
  "cocacola", "coke", "pepsi", "starbucks", "mcdonalds", "burgerking", "kfc", "subway", "dominos", "pizzahut",
  "redbull", "nestle", "heineken", "budweiser", "toyota", "honda", "bmw", "mercedes", "mercedesbenz", "audi",
  "volkswagen", "tesla", "ferrari", "porsche", "lamborghini", "ford", "nissan", "hyundai", "samsung", "sony",
  "nintendo", "playstation", "lg", "intel", "amd", "nvidia", "ibm", "oracle", "adobe", "salesforce", "shopify",
  "paypal", "visa", "mastercard", "americanexpress", "amex", "stripe", "coinbase", "binance", "bitcoin", "ethereum",
  "uber", "airbnb", "lyft", "ikea", "walmart", "target", "costco", "ebay", "alibaba", "openai", "chatgpt",
  "anthropic", "claude", "slack", "zoom", "dropbox", "figma", "canva", "notion", "github", "pokemon", "mickey",
  "hellokitty", "lego", "barbie", "mattel", "hasbro", "olympics", "fifa", "nba", "nfl", "metamask",
];

const norm = (s) => String(s || "").toLowerCase().normalize("NFKD").replace(/[^a-z0-9-]/g, "");

export function isBlockedBrand(name) {
  const n = norm(name);
  if (!n) return false;
  return BLOCKED_BRANDS.some((b) => n === b || n === b.replace(/-/g, "") || (b.length >= 5 && n.includes(b)));
}
