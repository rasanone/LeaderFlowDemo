-- One row per form submission. Every answer lives in `data` (JSON), so changing a
-- question never needs a database change. See review/plan/07-forms-to-monday-plan.md.
CREATE TABLE submissions (
  id             TEXT PRIMARY KEY,                 -- random UUID
  form           TEXT NOT NULL CHECK (form IN ('contact', 'flowcilitator', 'application')),
  received_at    TEXT NOT NULL,                    -- ISO 8601, UTC
  email          TEXT NOT NULL,
  name           TEXT NOT NULL,
  data           TEXT NOT NULL CHECK (json_valid(data)),
  resume_key     TEXT,                             -- R2 object key (applications only)
  duplicate_of   TEXT REFERENCES submissions (id), -- same email already applied this cycle
  exported_at    TEXT,                             -- NULL = not yet in a CSV download
  monday_item_id TEXT,                             -- Phase 2
  synced_at      TEXT,                             -- Phase 2
  sync_error     TEXT                              -- Phase 2
);

CREATE INDEX idx_submissions_form_received ON submissions (form, received_at);
CREATE INDEX idx_submissions_form_email    ON submissions (form, email);
CREATE INDEX idx_submissions_new           ON submissions (form, exported_at);
