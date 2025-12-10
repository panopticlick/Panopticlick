/**
 * Hash Utilities Tests
 */

import { describe, it, expect } from 'vitest';
import {
  sha256,
  sha256Binary,
  simpleHash,
  combineHashes,
  generateSessionId,
  generateUUID,
} from '../src/hash';

describe('sha256', () => {
  it('should generate 64 character hex hash', async () => {
    const hash = await sha256('test');
    expect(hash.length).toBe(64);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('should generate consistent hash for same input', async () => {
    const hash1 = await sha256('hello world');
    const hash2 = await sha256('hello world');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hash for different input', async () => {
    const hash1 = await sha256('hello');
    const hash2 = await sha256('world');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', async () => {
    const hash = await sha256('');
    expect(hash.length).toBe(64);
    // SHA-256 of empty string is known
    expect(hash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
  });

  it('should handle unicode characters', async () => {
    const hash = await sha256('Hello 世界 🌍');
    expect(hash.length).toBe(64);
  });

  it('should handle long strings', async () => {
    const longString = 'a'.repeat(10000);
    const hash = await sha256(longString);
    expect(hash.length).toBe(64);
  });
});

describe('sha256Binary', () => {
  it('should hash ArrayBuffer', async () => {
    const encoder = new TextEncoder();
    const buffer = encoder.encode('test').buffer;
    const hash = await sha256Binary(buffer);
    expect(hash.length).toBe(64);
  });

  it('should hash Uint8Array', async () => {
    const array = new Uint8Array([116, 101, 115, 116]); // 'test'
    const hash = await sha256Binary(array);
    expect(hash.length).toBe(64);
  });

  it('should produce same hash as string version for same content', async () => {
    const stringHash = await sha256('test');
    const binaryHash = await sha256Binary(new TextEncoder().encode('test'));
    expect(stringHash).toBe(binaryHash);
  });

  it('should handle empty buffer', async () => {
    const hash = await sha256Binary(new Uint8Array(0));
    expect(hash.length).toBe(64);
  });
});

describe('simpleHash', () => {
  it('should generate 8 character hex hash', () => {
    const hash = simpleHash('test');
    expect(hash.length).toBe(8);
    expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
  });

  it('should generate consistent hash for same input', () => {
    const hash1 = simpleHash('hello world');
    const hash2 = simpleHash('hello world');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hash for different input', () => {
    const hash1 = simpleHash('hello');
    const hash2 = simpleHash('world');
    expect(hash1).not.toBe(hash2);
  });

  it('should handle empty string', () => {
    const hash = simpleHash('');
    expect(hash.length).toBe(8);
  });

  it('should be fast (synchronous)', () => {
    const start = performance.now();
    for (let i = 0; i < 10000; i++) {
      simpleHash(`test${i}`);
    }
    const elapsed = performance.now() - start;
    // Should complete 10000 hashes in under 100ms
    expect(elapsed).toBeLessThan(100);
  });
});

describe('combineHashes', () => {
  it('should combine multiple strings into hash', async () => {
    const hash = await combineHashes('a', 'b', 'c');
    expect(hash.length).toBe(64);
  });

  it('should generate consistent hash for same inputs', async () => {
    const hash1 = await combineHashes('foo', 'bar');
    const hash2 = await combineHashes('foo', 'bar');
    expect(hash1).toBe(hash2);
  });

  it('should generate different hash for different order', async () => {
    const hash1 = await combineHashes('foo', 'bar');
    const hash2 = await combineHashes('bar', 'foo');
    expect(hash1).not.toBe(hash2);
  });

  it('should filter out null values', async () => {
    const hash1 = await combineHashes('foo', null, 'bar');
    const hash2 = await combineHashes('foo', 'bar');
    expect(hash1).toBe(hash2);
  });

  it('should filter out undefined values', async () => {
    const hash1 = await combineHashes('foo', undefined, 'bar');
    const hash2 = await combineHashes('foo', 'bar');
    expect(hash1).toBe(hash2);
  });

  it('should filter out empty strings', async () => {
    const hash1 = await combineHashes('foo', '', 'bar');
    const hash2 = await combineHashes('foo', 'bar');
    expect(hash1).toBe(hash2);
  });

  it('should handle single value', async () => {
    const hash = await combineHashes('single');
    expect(hash.length).toBe(64);
  });

  it('should handle no values', async () => {
    const hash = await combineHashes();
    expect(hash.length).toBe(64);
  });
});

describe('generateSessionId', () => {
  it('should generate 32 character hex string', () => {
    const id = generateSessionId();
    expect(id.length).toBe(32);
    expect(/^[0-9a-f]+$/.test(id)).toBe(true);
  });

  it('should generate unique IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateSessionId());
    }
    expect(ids.size).toBe(100);
  });

  it('should not contain invalid characters', () => {
    for (let i = 0; i < 10; i++) {
      const id = generateSessionId();
      expect(/^[0-9a-f]+$/.test(id)).toBe(true);
    }
  });
});

describe('generateUUID', () => {
  it('should generate valid UUID v4 format', () => {
    const uuid = generateUUID();
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
    expect(uuidRegex.test(uuid)).toBe(true);
  });

  it('should generate unique UUIDs', () => {
    const uuids = new Set();
    for (let i = 0; i < 100; i++) {
      uuids.add(generateUUID());
    }
    expect(uuids.size).toBe(100);
  });

  it('should have version 4 indicator', () => {
    const uuid = generateUUID();
    expect(uuid.charAt(14)).toBe('4');
  });

  it('should have valid variant indicator', () => {
    const uuid = generateUUID();
    const variantChar = uuid.charAt(19);
    expect(['8', '9', 'a', 'b']).toContain(variantChar);
  });

  it('should be 36 characters long', () => {
    const uuid = generateUUID();
    expect(uuid.length).toBe(36);
  });
});
