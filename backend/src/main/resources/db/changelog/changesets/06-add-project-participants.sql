-- liquibase formatted sql

-- changeset cursor:06-add-project-participants
ALTER TABLE projects ADD COLUMN is_public BOOLEAN DEFAULT false NOT NULL;

CREATE TABLE project_participants (
    project_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    PRIMARY KEY (project_id, user_id),
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
