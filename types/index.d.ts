declare module 'near-seed-phrase' {
  export function generateSeedPhrase(): { seedPhrase: string, publicKey: string, secretKey: string }
  export function parseSeedPhrase(seedPhrase: string): { publicKey: string, secretKey: string }
}