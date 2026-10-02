-- liquibase formatted sql

-- changeset pmsystem:5
ALTER TABLE tasks
    ADD COLUMN IF NOT EXISTS early_start_dt  TIMESTAMP,
    ADD COLUMN IF NOT EXISTS early_finish_dt TIMESTAMP,
    ADD COLUMN IF NOT EXISTS late_start_dt   TIMESTAMP,
    ADD COLUMN IF NOT EXISTS late_finish_dt  TIMESTAMP;
