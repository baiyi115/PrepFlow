package com.ai.interview.strategy;

import com.ai.interview.entity.Question;
import com.ai.interview.entity.UserSubmit;

public interface ScoringStrategy {

    /**
     * 根据题目和用户提交的内容计算得分
     *
     * @param question   数据库题目信息（含正确答案、分值快照）
     * @param userSubmit 用户当前的提交实体（含用户所选选项）
     * @return 判分并填充了 isCorrect 和 score 的 UserSubmit 实体
     */
    UserSubmit doScore(Question question, UserSubmit userSubmit);

    /**
     * @return 题目类型常量（如 1 代表单选题）
     */
    int getQuestionType();
}
