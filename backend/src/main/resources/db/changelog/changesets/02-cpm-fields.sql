-- liquibase formatted sql

-- changeset pmsystem:2
ALTER TABLE tasks ADD COLUMN early_start DECIMAL(10, 2);
ALTER TABLE tasks ADD COLUMN early_finish DECIMAL(10, 2);
ALTER TABLE tasks ADD COLUMN late_start DECIMAL(10, 2);
ALTER TABLE tasks ADD COLUMN late_finish DECIMAL(10, 2);
ALTER TABLE tasks ADD COLUMN slack DECIMAL(10, 2);
ALTER TABLE tasks ADD COLUMN is_critical BOOLEAN DEFAULT FALSE;
