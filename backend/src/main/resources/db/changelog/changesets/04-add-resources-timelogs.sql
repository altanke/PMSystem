-- liquibase formatted sql

-- changeset pmsystem:4
DROP TABLE IF EXISTS task_resources;
DROP TABLE IF EXISTS resources;
DROP TABLE IF EXISTS time_logs;

CREATE TABLE resources (
    id             BIGSERIAL PRIMARY KEY,
    project_id     BIGINT          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name           VARCHAR(255)    NOT NULL,
    type           VARCHAR(50)     NOT NULL,
    cost_per_unit  DECIMAL(15, 2)
);

CREATE TABLE task_resources (
    id                 BIGSERIAL PRIMARY KEY,
    task_id            BIGINT  NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    resource_id        BIGINT  NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
    allocated_quantity DOUBLE PRECISION NOT NULL
);

CREATE TABLE time_logs (
    id           BIGSERIAL PRIMARY KEY,
    task_id      BIGINT           NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id      BIGINT           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    hours_spent  DOUBLE PRECISION NOT NULL,
    log_date     DATE             NOT NULL,
    description  TEXT
);
