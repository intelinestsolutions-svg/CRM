import { webcrypto } from "node:crypto";

const crypto = globalThis.crypto ?? webcrypto;
const ITERATIONS = 210_000;
const encoder = new TextEncoder();
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return Buffer.from(binary, "binary").toString("base64url");
}

function generatePassword() {
  return Array.from(crypto.getRandomValues(new Uint8Array(24)), (byte) => alphabet[byte % alphabet.length]).join("");
}

async function readPassword() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const password = Buffer.concat(chunks).toString("utf8").trim();
  if (!password) throw new Error("No password supplied on stdin.");
  return password;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return `pbkdf2.${ITERATIONS}.${bytesToBase64Url(salt)}.${bytesToBase64Url(new Uint8Array(bits))}`;
}

const password = process.argv.includes("--generate") ? generatePassword() : await readPassword();
const passwordHash = await hashPassword(password);
const sessionSecret = bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32)));

console.log("Admin password (shown once):");
console.log(password);
console.log("");
console.log("Add these to hPanel → Environment Variables (do not commit):");
console.log("ADMIN_EMAIL='admin@prostudio.my'");
console.log(`ADMIN_PASSWORD_HASH='${passwordHash}'`);
console.log(`ADMIN_SESSION_SECRET='${sessionSecret}'`);
