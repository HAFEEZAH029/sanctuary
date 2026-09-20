
export async function generateRSAKeyPair() {
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function generateAESKey() {
  return crypto.subtle.generateKey(
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export async function encryptAESKey(
  aesKey: CryptoKey,
  publicKey: CryptoKey
) {
  const rawKey = await crypto.subtle.exportKey("raw", aesKey);

  const encrypted = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    rawKey
  );

  return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
}

export async function decryptAESKey(
  encryptedKeyBase64: string,
  privateKey: CryptoKey
) {
  const binary = Uint8Array.from(atob(encryptedKeyBase64), c =>
    c.charCodeAt(0)
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    binary
  );

  return crypto.subtle.importKey(
    "raw",
    decrypted,
    { name: "AES-GCM" },
    true,
    ["decrypt"]
  );
}

export function generateSalt() {
  return crypto.getRandomValues(new Uint8Array(16));
}

{/**export async function deriveKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-KW",
      length: 256,
    },
    true, // ✅ MUST be true for wrapKey
    ["wrapKey", "unwrapKey"]
  );
} **/}

export async function deriveEncryptionKey(password: string, salt: Uint8Array) {
  const enc = new TextEncoder();

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: new Uint8Array(salt),
      iterations: 100000,
      hash: "SHA-256",
    },
    baseKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    false,
    ["encrypt", "decrypt"]
  );
}

{/**export async function wrapPrivateKey(
  privateKey: CryptoKey,
  wrappingKey: CryptoKey
) {
  // 1. Export PKCS8
  const exported = await crypto.subtle.exportKey("pkcs8", privateKey);

  let data = new Uint8Array(exported);

  // 2. Pad to multiple of 8 bytes (AES-KW requirement)
  const padLength = (8 - (data.length % 8)) % 8;

  if (padLength > 0) {
    const padded = new Uint8Array(data.length + padLength);
    padded.set(data);
    data = padded;
  }

  // 3. Wrap using AES-KW (NO importKey nonsense)
  const wrapped = await crypto.subtle.encrypt(
    {
      name: "AES-KW"
    },
    wrappingKey,
    data
  );

  return btoa(String.fromCharCode(...new Uint8Array(wrapped)));
} **/}

export async function wrapPrivateKey(
  privateKey: CryptoKey,
  encryptionKey: CryptoKey
) {
  const exported = await crypto.subtle.exportKey("pkcs8", privateKey);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    {
      name: "AES-GCM",
      iv,
    },
    encryptionKey,
    exported
  );

  const combined = new Uint8Array(iv.length + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), iv.length);

  return btoa(String.fromCharCode(...combined));
}

{/**export async function unwrapPrivateKey(
  wrappedKeyBase64: string,
  wrappingKey: CryptoKey
) {
  const wrappedKey = Uint8Array.from(atob(wrappedKeyBase64), c =>
    c.charCodeAt(0)
  );

  return crypto.subtle.unwrapKey(
    "pkcs8",
    wrappedKey,
    wrappingKey,
    "AES-KW",
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
} **/}

export async function unwrapPrivateKey(
  wrappedKeyBase64: string,
  encryptionKey: CryptoKey
) {
  const data = Uint8Array.from(atob(wrappedKeyBase64), c =>
    c.charCodeAt(0)
  );

  const iv = data.slice(0, 12);
  const ciphertext = data.slice(12);

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    encryptionKey,
    ciphertext
  );

  return crypto.subtle.importKey(
    "pkcs8",
    decrypted,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["decrypt"]
  );
}

export function fromBase64(base64: string) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

export async function importPublicKey(base64: string) {
  const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

  return crypto.subtle.importKey(
    "spki",
    binary,
    {
      name: "RSA-OAEP",
      hash: "SHA-256",
    },
    true,
    ["encrypt"]
  );
}

export async function exportPublicKey(publicKey: CryptoKey) {
  const spki = await crypto.subtle.exportKey("spki", publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(spki)));
}

export function toBase64(buffer: Uint8Array) {
  return btoa(String.fromCharCode(...buffer));
}

export async function encryptMessage(text: string, aesKey: CryptoKey) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc.encode(text)
  );

  return {
    ciphertext: btoa(String.fromCharCode(...new Uint8Array(ciphertext))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

export async function decryptMessage(
  ciphertextBase64: string,
  ivBase64: string,
  aesKey: CryptoKey
) {
  const ciphertext = Uint8Array.from(atob(ciphertextBase64), c =>
    c.charCodeAt(0)
  );

  const iv = Uint8Array.from(atob(ivBase64), c =>
    c.charCodeAt(0)
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv,
    },
    aesKey,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}