import crypto from 'crypto';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
  throw new Error(
    'SESSION_SECRET environment variable is not set. ' +
    'Add SESSION_SECRET to your .env file before starting the server.'
  );
}

const ENCRYPTION_KEY = crypto.scryptSync(SESSION_SECRET, 'salt', 32);
const IV_LENGTH = 12;

// Password Hashing
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password, storedHash) {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verifyHash = crypto.scryptSync(password, salt, 64).toString('hex');
    return hash === verifyHash;
  } catch (e) {
    return false;
  }
}

// Session Encryption (AES-256-GCM)
export function encryptSession(data) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${encrypted}:${tag}`;
}

export function decryptSession(sessionStr) {
  try {
    const [ivHex, encrypted, tagHex] = sessionStr.split(':');
    if (!ivHex || !encrypted || !tagHex) return null;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(tag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return JSON.parse(decrypted);
  } catch (err) {
    console.error("Failed to decrypt session cookie:", err.message);
    return null;
  }
}

// Next.js API Helper to get session user
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    if (!sessionCookie) return null;

    const sessionData = decryptSession(sessionCookie);
    if (!sessionData || !sessionData.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: sessionData.userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      }
    });
    return user;
  } catch (error) {
    console.error("Error retrieving session user:", error);
    return null;
  }
}
