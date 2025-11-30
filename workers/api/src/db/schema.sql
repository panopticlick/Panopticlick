-- Panopticlick D1 Database Schema
-- Run with: wrangler d1 execute panopticlick --file=./src/db/schema.sql

-- Sessions table
-- Stores individual scan sessions
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  fingerprint_hash TEXT NOT NULL,
  hardware_hash TEXT NOT NULL,
  software_hash TEXT NOT NULL,
  entropy_bits REAL NOT NULL,
  ip_hash TEXT NOT NULL,
  country TEXT,
  asn TEXT,
  is_proxy INTEGER DEFAULT 0,
  is_vpn INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  consent_given INTEGER DEFAULT 0
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_sessions_fingerprint ON sessions(fingerprint_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON sessions(ip_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_sessions_country ON sessions(country);
CREATE INDEX IF NOT EXISTS idx_sessions_entropy ON sessions(entropy_bits);

-- Fingerprints table
-- Aggregated fingerprint statistics
CREATE TABLE IF NOT EXISTS fingerprints (
  hash TEXT PRIMARY KEY,
  hardware_hash TEXT NOT NULL,
  software_hash TEXT NOT NULL,
  entropy_bits REAL NOT NULL,
  first_seen TEXT DEFAULT (datetime('now')),
  last_seen TEXT DEFAULT (datetime('now')),
  times_seen INTEGER DEFAULT 1
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_fingerprints_entropy ON fingerprints(entropy_bits);
CREATE INDEX IF NOT EXISTS idx_fingerprints_seen ON fingerprints(times_seen);
CREATE INDEX IF NOT EXISTS idx_fingerprints_last_seen ON fingerprints(last_seen);

-- HSTS Supercookie table
-- Stores HSTS state for supercookie demonstration
CREATE TABLE IF NOT EXISTS hsts_cookies (
  id TEXT PRIMARY KEY,
  bits TEXT NOT NULL,  -- Encoded bit pattern
  created_at TEXT DEFAULT (datetime('now')),
  verified_at TEXT,
  times_verified INTEGER DEFAULT 0
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_hsts_created ON hsts_cookies(created_at);

-- Bait test results
-- Records which tracking resources were blocked
CREATE TABLE IF NOT EXISTS bait_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  category TEXT NOT NULL,
  resource_name TEXT NOT NULL,
  blocked INTEGER NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_bait_session ON bait_results(session_id);

-- Daily stats rollup
-- Aggregated daily statistics for performance
CREATE TABLE IF NOT EXISTS daily_stats (
  date TEXT PRIMARY KEY,
  total_scans INTEGER DEFAULT 0,
  unique_fingerprints INTEGER DEFAULT 0,
  avg_entropy REAL DEFAULT 0,
  min_entropy REAL DEFAULT 0,
  max_entropy REAL DEFAULT 0,
  countries_json TEXT,  -- JSON object of country counts
  browsers_json TEXT,   -- JSON object of browser counts
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Cleanup old data (run periodically)
-- DELETE FROM sessions WHERE created_at < datetime('now', '-30 days');
-- DELETE FROM fingerprints WHERE last_seen < datetime('now', '-90 days');
-- DELETE FROM hsts_cookies WHERE created_at < datetime('now', '-7 days');
