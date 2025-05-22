import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();    

const key = Buffer.from(process.env.ENCRYPTION_KEY || '', 'utf-8');
const iv = Buffer.from(process.env.ENCRYPTION_IV || '', 'utf-8');

export function encrypt(text: string): string {
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  export function decrypt(encrypted: string): string {
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  };
  