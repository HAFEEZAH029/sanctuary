
export async function generateKeyPair() {
  return window.crypto.subtle.generateKey(
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

export async function exportPublicKey(publicKey: CryptoKey) {
  const spki = await window.crypto.subtle.exportKey("spki", publicKey);
  return btoa(String.fromCharCode(...new Uint8Array(spki)));
}

export async function encryptMessage() {
  // coming soon
}

export async function decryptMessage() {
  // coming soon
}