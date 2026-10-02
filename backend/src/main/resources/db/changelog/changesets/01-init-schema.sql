-- liquibase formatted sql

-- changeset pmsystem:1
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    assignee_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    duration_estimate_hours DECIMAL(10, 2),
    actual_start_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE task_dependencies (
    predecessor_task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    successor_task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    dependency_type VARCHAR(50) NOT NULL, -- e.g., FINISH_TO_START, START_TO_START
    lag_time_hours DECIMAL(10, 2) DEFAULT 0,
    PRIMARY KEY (predecessor_task_id, successor_task_id)
);

CREATE TABLE risks (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
    risk_score INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    identified_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE risk_mitigations (
    id BIGSERIAL PRIMARY KEY,
    risk_id BIGINT NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    strategy_description TEXT NOT NULL,
    assigned_to BIGINT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL,
    planned_cost DECIMAL(15, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE resources (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- e.g., MATERIAL, EQUIPMENT, SOFTWARE
    unit_cost DECIMAL(15, 2),
    available_quantity DECIMAL(15, 2)
);

CREATE TABLE task_resources (
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    resource_id BIGINT NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
    quantity_allocated DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (task_id, resource_id)
);

CREATE TABLE time_logs (
    id BIGSERIAL PRIMARY KEY,
    task_id BIGINT NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    hours_logged DECIMAL(10, 2) NOT NULL,
    log_date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
