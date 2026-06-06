-- SQL index optimization for Interview Platform.
-- This script is safe to run multiple times.
--
-- Existing indexes already cover these hot paths:
-- 1. t_user_wrong_book(user_id, status, next_review_time)
--    -> wrong-book list ordered by next review time.
-- 2. t_question_option(question_id, is_deleted, sort_order)
--    -> question detail option lookup ordered by sort_order.
-- 3. t_question(is_deleted, status, category, difficulty, create_time)
--    -> enabled question list and cache warm-up.
--
-- Missing hot path:
-- AISuggestionService -> UserSubmitMapper.selectWrongSubmitsWithQuestion()
-- WHERE s.user_id = ?
--   AND s.is_correct = 0
--   AND s.submit_status = 1
--   AND s.is_deleted = 0
-- ORDER BY s.create_time DESC
--
-- Field order explanation:
-- user_id: high-level user isolation and first equality condition.
-- is_correct, submit_status, is_deleted: equality filters before the time ordering.
-- create_time: supports ORDER BY create_time DESC by backward index scan.
-- question_id: join key to t_question, kept in the same index to reduce extra lookup cost.
SET @idx_submit_user_wrong_status_time_exists := (
    SELECT COUNT(*)
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 't_user_submit'
      AND index_name = 'idx_submit_user_wrong_status_time'
);

SET @idx_submit_user_wrong_status_time_sql := IF(
    @idx_submit_user_wrong_status_time_exists = 0,
    'ALTER TABLE t_user_submit ADD INDEX idx_submit_user_wrong_status_time (user_id, is_correct, submit_status, is_deleted, create_time, question_id)',
    'SELECT ''idx_submit_user_wrong_status_time already exists'' AS message'
);

PREPARE idx_submit_user_wrong_status_time_stmt FROM @idx_submit_user_wrong_status_time_sql;
EXECUTE idx_submit_user_wrong_status_time_stmt;
DEALLOCATE PREPARE idx_submit_user_wrong_status_time_stmt;
