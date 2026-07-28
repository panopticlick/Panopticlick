-- Migration 003: scope opt-outs to the fingerprint, not the IP
-- Run with: wrangler d1 execute panopticlick --remote --file=./src/db/migrations/003_optout_by_fingerprint.sql
--
-- Migration 002 put a UNIQUE index on opt_outs(ip_hash). Behind CGNAT a single
-- ip_hash covers thousands of unrelated visitors, so that index both deduped
-- strangers' opt-outs against each other and made ip_hash look like the key the
-- system enforces. What /v1/scan/collect actually checks before persisting is
-- fingerprint_hash, so that is what needs the index.
--
-- SQLite has no DROP CONSTRAINT; indexes are dropped and recreated instead.

DROP INDEX IF EXISTS idx_optout_ip;

-- Non-unique on purpose: creating a UNIQUE index would fail outright if the
-- table already held two rows for the same fingerprint. The route does an
-- existence check before inserting.
CREATE INDEX IF NOT EXISTS idx_optout_fp ON opt_outs(fingerprint_hash);

-- Kept for GDPR contact lookups by email.
CREATE INDEX IF NOT EXISTS idx_optout_email ON opt_outs(email);
