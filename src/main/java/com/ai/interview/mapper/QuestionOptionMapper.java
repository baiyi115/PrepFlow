package com.ai.interview.mapper;

import com.ai.interview.entity.QuestionOption;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Param;

public interface QuestionOptionMapper extends BaseMapper<QuestionOption>{

    @Delete("DELETE FROM t_question_option WHERE question_id = #{questionId}")
    int deletePhysicallyByQuestionId(@Param("questionId") Long questionId);
}
