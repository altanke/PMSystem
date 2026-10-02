-- liquibase formatted sql

-- changeset pmsystem:3
DROP TABLE IF EXISTS risk_mitigations;
DROP TABLE IF EXISTS risks;

CREATE TABLE risks (
    id          BIGSERIAL PRIMARY KEY,
    project_id  BIGINT        NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title       VARCHAR(255)  NOT NULL,
    description TEXT,
    level       VARCHAR(50)   NOT NULL,
    status      VARCHAR(50)   NOT NULL,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);
