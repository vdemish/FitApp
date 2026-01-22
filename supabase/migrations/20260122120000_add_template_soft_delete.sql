alter table workout_templates
add column if not exists is_deleted boolean not null default false;

create index if not exists workout_templates_is_deleted_idx
on workout_templates (is_deleted);
