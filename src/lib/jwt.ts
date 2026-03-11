

import { SignJWT, jwtVerify, JWTPayload } from 'jose';
const getSecretKey = async (): Promise<Uint8Array> => {
  const secretString = import.meta.env.VITE_JWT_SECRET || 'vozes-da-mare-admin-secret-key-2026';
  const encoder = new TextEncoder();
  return encoder.encode(secretString);
};
const JWT_CONFIG = {
  issuer: 'vozes-da-mare',
  audience: 'admin-panel',
  expirationTime: '24h', 
};
export interface AdminTokenPayload extends JWTPayload {
  userId: string;
  username: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

export async function generateAdminToken(userId: string, username: string): Promise<string> {
  const secretKey = await getSecretKey();
  const token = await new SignJWT({
    userId,
    username,
    role: 'admin',
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setIssuer(JWT_CONFIG.issuer)
    .setAudience(JWT_CONFIG.audience)
    .setExpirationTime(JWT_CONFIG.expirationTime)
    .sign(secretKey);

  return token;
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const secretKey = await getSecretKey();
    const { payload } = await jwtVerify(token, secretKey, {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    });
    if (!payload.userId || !payload.username || payload.role !== 'admin') {
      return null;
    }

    return payload as AdminTokenPayload;
  } catch (error) {
    return null;
  }
}

export function decodeToken(token: string): AdminTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload as AdminTokenPayload;
  } catch {
    return null;
  }
}

export function isTokenExpiringSoon(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload || !payload.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60;
  return payload.exp - now < oneHour;
}

export function storeToken(token: string): void {
  localStorage.setItem('adminJWT', token);
}

export function getStoredToken(): string | null {
  return localStorage.getItem('adminJWT');
}

export function removeToken(): void {
  localStorage.removeItem('adminJWT');
}

export async function hasValidToken(): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;
  const payload = await verifyAdminToken(token);
  return payload !== null;
}
