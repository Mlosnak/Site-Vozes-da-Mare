const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li',
  'blockquote', 'pre', 'code',
  'a', 'img',
  'div', 'span',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
  'hr'
];
const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  'a': ['href', 'target', 'rel', 'title'],
  'img': ['src', 'alt', 'title', 'width', 'height'],
  'div': ['class', 'style'],
  'span': ['class', 'style'],
  'p': ['class', 'style'],
  'blockquote': ['class', 'style'],
  '*': ['class'] 
};
const DANGEROUS_PATTERNS = [
  /javascript:/gi,
  /vbscript:/gi,
  /data:/gi,
  /on\w+\s*=/gi, 
  /<script[\s\S]*?<\/script>/gi,
  /<style[\s\S]*?<\/style>/gi,
  /<iframe[\s\S]*?<\/iframe>/gi,
  /<object[\s\S]*?<\/object>/gi,
  /<embed[\s\S]*?<\/embed>/gi,
  /<form[\s\S]*?<\/form>/gi,
  /expression\s*\(/gi,
  /url\s*\(\s*['"]?\s*javascript/gi,
];

export function sanitizeHtml(html: string): string {
  if (!html) return '';
  let sanitized = html;
  for (const pattern of DANGEROUS_PATTERNS) {
    sanitized = sanitized.replace(pattern, '');
  }
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tagName) => {
    const tag = tagName.toLowerCase();
    if (ALLOWED_TAGS.includes(tag)) {
      return cleanAttributes(match, tag);
    }
    return '';
  });
  return sanitized;
}

function cleanAttributes(tagHtml: string, tagName: string): string {
  if (tagHtml.startsWith('</')) return tagHtml;
  const allowedAttrs = [
    ...(ALLOWED_ATTRIBUTES[tagName] || []),
    ...(ALLOWED_ATTRIBUTES['*'] || [])
  ];
  const attrRegex = /(\w+)\s*=\s*["']([^"']*)["']/g;
  const cleanedAttrs: string[] = [];
  let match;
  while ((match = attrRegex.exec(tagHtml)) !== null) {
    const [, attrName, attrValue] = match;
    const lowerAttrName = attrName.toLowerCase();
    if (allowedAttrs.includes(lowerAttrName)) {
      let safeValue = attrValue;
      for (const pattern of DANGEROUS_PATTERNS) {
        safeValue = safeValue.replace(pattern, '');
      }
      if (lowerAttrName === 'href') {
        if (!/^(https?:\/\/|mailto:|\/|#)/.test(safeValue)) {
          continue; 
        }
      }
      cleanedAttrs.push(`${lowerAttrName}="${safeValue}"`);
    }
  }
  if (cleanedAttrs.length > 0) {
    return `<${tagName} ${cleanedAttrs.join(' ')}>`;
  }
  return `<${tagName}>`;
}

export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

export function sanitizeInput(input: string, maxLength = 1000): string {
  if (!input) return '';
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  sanitized = sanitized.slice(0, maxLength);
  sanitized = sanitized.trim();
  return sanitized;
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export async function generateSecureSessionId(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export const SECURITY_CONFIG = {
  SESSION_EXPIRY_HOURS: 24,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  MIN_TOKEN_LENGTH: 8,
};

export function isSessionExpired(sessionTimestamp: number): boolean {
  const now = Date.now();
  const expiryMs = SECURITY_CONFIG.SESSION_EXPIRY_HOURS * 60 * 60 * 1000;
  return now - sessionTimestamp > expiryMs;
}
