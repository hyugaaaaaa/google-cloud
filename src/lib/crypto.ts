import crypto from 'crypto';

// URLのID（UUIDなど）を秘匿するための暗号化ユーティリティ
// 実際の運用では環境変数（URL_ENCRYPTION_KEY）に32バイト以上のランダムな文字列を設定してください。

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM推奨のIV長
const AUTH_TAG_LENGTH = 16;

// 環境変数のチェック
const ENCRYPTION_KEY_RAW = process.env.URL_ENCRYPTION_KEY;

if (!ENCRYPTION_KEY_RAW && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: URL_ENCRYPTION_KEY is not set in production environment.');
}

// キーをSHA-256でハッシュ化し、常に32バイト（256ビット）の鍵を生成
const keySource = ENCRYPTION_KEY_RAW || 'qz_google_cloud_cdl_fallback_local_only';
const ENCRYPTION_KEY = crypto.createHash('sha256')
  .update(keySource)
  .digest();

/**
 * 文字列を暗号化し、URLセーフな形式で返します。
 */
export function encrypt(text: string): string {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag().toString('hex');
    
    // IV + AuthTag + 暗号文 を結合してBase64URL化
    const combined = Buffer.from(iv.toString('hex') + authTag + encrypted, 'hex');
    return combined.toString('base64url');
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

/**
 * 暗号化された文字列を復号します。
 * 復号に失敗した場合は null を返します。
 */
export function decrypt(encoded: string): string | null {
  try {
    const combined = Buffer.from(encoded, 'base64url');
    const hex = combined.toString('hex');
    
    // 最小の長さをチェック (IV + AuthTag = 12 + 16 = 28 bytes)
    if (combined.length < IV_LENGTH + AUTH_TAG_LENGTH) {
      return null;
    }
    
    // 各パーツの長さを計算 (hexベースなので2倍)
    const ivHex = hex.slice(0, IV_LENGTH * 2);
    const authTagHex = hex.slice(IV_LENGTH * 2, (IV_LENGTH + AUTH_TAG_LENGTH) * 2);
    const encryptedHex = hex.slice((IV_LENGTH + AUTH_TAG_LENGTH) * 2);
    
    const decipher = crypto.createDecipheriv(
      ALGORITHM, 
      ENCRYPTION_KEY, 
      Buffer.from(ivHex, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return null; // 復号失敗時はnullを返し、呼び出し側でハンドリングさせる
  }
}
