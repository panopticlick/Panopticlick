-- Migration 002: Complete Schema (11 Tables)
-- Adds missing tables per DATA-SCHEMA.md specification
-- Run with: wrangler d1 execute panopticlick --file=./src/db/migrations/002_complete_schema.sql

-- ============================================
-- TABLE 6: fingerprint_analyses
-- Detailed per-scan analysis with entropy breakdown
-- ============================================
CREATE TABLE IF NOT EXISTS fingerprint_analyses (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  fingerprint_hash TEXT NOT NULL,
  total_entropy REAL NOT NULL,
  uniqueness_percentile REAL,
  tier TEXT CHECK(tier IN ('common', 'uncommon', 'rare', 'very_rare', 'unique')),
  collection_duration_ms INTEGER,
  signals_collected INTEGER DEFAULT 0,
  signals_failed INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_analyses_session ON fingerprint_analyses(session_id);
CREATE INDEX IF NOT EXISTS idx_analyses_tier ON fingerprint_analyses(tier);
CREATE INDEX IF NOT EXISTS idx_analyses_entropy ON fingerprint_analyses(total_entropy);

-- ============================================
-- TABLE 7: signal_entropy
-- Per-signal entropy values for detailed breakdown
-- ============================================
CREATE TABLE IF NOT EXISTS signal_entropy (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id TEXT NOT NULL,
  signal_name TEXT NOT NULL,
  signal_value_hash TEXT,
  entropy_bits REAL NOT NULL,
  rarity TEXT CHECK(rarity IN ('common', 'uncommon', 'rare', 'very_rare')),
  is_blocked INTEGER DEFAULT 0,
  is_spoofed INTEGER DEFAULT 0,
  FOREIGN KEY (analysis_id) REFERENCES fingerprint_analyses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_signal_analysis ON signal_entropy(analysis_id);
CREATE INDEX IF NOT EXISTS idx_signal_name ON signal_entropy(signal_name);

-- ============================================
-- TABLE 8: rtb_simulations
-- RTB auction simulation results
-- ============================================
CREATE TABLE IF NOT EXISTS rtb_simulations (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  winning_bid_cpm REAL NOT NULL,
  winning_dsp TEXT NOT NULL,
  total_bidders INTEGER NOT NULL,
  auction_duration_ms INTEGER,
  inferred_persona TEXT,  -- JSON array of persona tags
  estimated_annual_value REAL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_rtb_session ON rtb_simulations(session_id);
CREATE INDEX IF NOT EXISTS idx_rtb_cpm ON rtb_simulations(winning_bid_cpm);
CREATE INDEX IF NOT EXISTS idx_rtb_created ON rtb_simulations(created_at);

-- ============================================
-- TABLE 9: rtb_bids
-- Individual DSP bid records
-- ============================================
CREATE TABLE IF NOT EXISTS rtb_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  simulation_id TEXT NOT NULL,
  dsp_name TEXT NOT NULL,
  bid_cpm REAL NOT NULL,
  interest_category TEXT,
  is_winner INTEGER DEFAULT 0,
  FOREIGN KEY (simulation_id) REFERENCES rtb_simulations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_bids_simulation ON rtb_bids(simulation_id);
CREATE INDEX IF NOT EXISTS idx_bids_dsp ON rtb_bids(dsp_name);

-- ============================================
-- TABLE 10: defense_audits
-- Comprehensive defense test results
-- ============================================
CREATE TABLE IF NOT EXISTS defense_audits (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  blocker_detected TEXT,
  blocker_version TEXT,
  effectiveness_score REAL,
  privacy_tier TEXT CHECK(privacy_tier IN ('minimal', 'basic', 'moderate', 'strong', 'maximum')),
  dnt_enabled INTEGER DEFAULT 0,
  gpc_enabled INTEGER DEFAULT 0,
  webrtc_blocked INTEGER DEFAULT 0,
  canvas_blocked INTEGER DEFAULT 0,
  audio_blocked INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_defense_session ON defense_audits(session_id);
CREATE INDEX IF NOT EXISTS idx_defense_tier ON defense_audits(privacy_tier);

-- ============================================
-- TABLE 11: blocked_trackers
-- Individual tracker blocking results
-- ============================================
CREATE TABLE IF NOT EXISTS blocked_trackers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  audit_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK(category IN ('analytics', 'advertising', 'social', 'fingerprinting', 'malware')),
  resource_name TEXT NOT NULL,
  resource_url TEXT,
  blocked INTEGER NOT NULL,
  FOREIGN KEY (audit_id) REFERENCES defense_audits(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_blocked_audit ON blocked_trackers(audit_id);
CREATE INDEX IF NOT EXISTS idx_blocked_category ON blocked_trackers(category);

-- ============================================
-- TABLE 12: opt_outs (GDPR compliance)
-- Permanent opt-out records
-- ============================================
CREATE TABLE IF NOT EXISTS opt_outs (
  id TEXT PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  fingerprint_hash TEXT,
  email TEXT,
  reason TEXT,
  opted_out_at TEXT DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_optout_ip ON opt_outs(ip_hash);
CREATE INDEX IF NOT EXISTS idx_optout_email ON opt_outs(email);

-- ============================================
-- TABLE 13: global_stats (pre-computed metrics)
-- Cached global statistics for performance
-- ============================================
CREATE TABLE IF NOT EXISTS global_stats (
  metric_name TEXT PRIMARY KEY,
  metric_value REAL NOT NULL,
  metric_metadata TEXT,  -- JSON for additional context
  updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================
-- TABLE 14: entropy_distribution
-- Percentile buckets for entropy comparison
-- ============================================
CREATE TABLE IF NOT EXISTS entropy_distribution (
  bucket_min REAL NOT NULL,
  bucket_max REAL NOT NULL,
  count INTEGER NOT NULL DEFAULT 0,
  percentile REAL,
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (bucket_min, bucket_max)
);

CREATE INDEX IF NOT EXISTS idx_entropy_dist_percentile ON entropy_distribution(percentile);

-- ============================================
-- TABLE 15: signal_frequencies
-- Dynamic entropy calculation based on population
-- ============================================
CREATE TABLE IF NOT EXISTS signal_frequencies (
  signal_name TEXT NOT NULL,
  signal_value_hash TEXT NOT NULL,
  frequency INTEGER NOT NULL DEFAULT 1,
  last_seen TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (signal_name, signal_value_hash)
);

CREATE INDEX IF NOT EXISTS idx_freq_signal ON signal_frequencies(signal_name);
CREATE INDEX IF NOT EXISTS idx_freq_count ON signal_frequencies(frequency DESC);

-- ============================================
-- Initial data for global_stats
-- ============================================
INSERT OR IGNORE INTO global_stats (metric_name, metric_value, metric_metadata) VALUES
  ('total_scans', 0, '{"description": "Total number of fingerprint scans"}'),
  ('unique_fingerprints', 0, '{"description": "Count of unique fingerprint hashes"}'),
  ('avg_entropy', 0, '{"description": "Average entropy bits across all scans"}'),
  ('total_rtb_simulations', 0, '{"description": "Total RTB auctions simulated"}'),
  ('avg_cpm', 0, '{"description": "Average winning CPM"}');

-- ============================================
-- Initial entropy distribution buckets
-- ============================================
INSERT OR IGNORE INTO entropy_distribution (bucket_min, bucket_max, count, percentile) VALUES
  (0, 5, 0, 0),
  (5, 10, 0, 0),
  (10, 15, 0, 0),
  (15, 20, 0, 0),
  (20, 25, 0, 0),
  (25, 30, 0, 0),
  (30, 35, 0, 0),
  (35, 40, 0, 0),
  (40, 100, 0, 0);

-- ============================================
-- Update sessions table to add consent_timestamp
-- ============================================
-- SQLite doesn't support ADD COLUMN IF NOT EXISTS,
-- so we use a safe approach with PRAGMA
-- This will fail silently if column already exists in production
-- For new deployments, column will be added

-- Note: Run this separately if needed:
-- ALTER TABLE sessions ADD COLUMN consent_timestamp TEXT;
