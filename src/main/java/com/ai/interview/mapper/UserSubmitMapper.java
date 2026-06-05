package com.ai.interview.mapper;

import com.ai.interview.entity.UserSubmit;
import com.ai.interview.vo.CalendarItemVO;
import com.ai.interview.vo.WrongSubmitWithQuestionVO;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

public interface UserSubmitMapper extends BaseMapper<UserSubmit> {

	@Select("SELECT DATE(create_time) AS date, COUNT(*) AS count " +
			"FROM t_user_submit " +
			"WHERE user_id = #{userId} " +
			"  AND create_time >= DATE_SUB(CURDATE(), INTERVAL #{days} DAY) " +
			"  AND is_deleted = 0 " +
			"GROUP BY DATE(create_time) " +
			"ORDER BY date ASC")
	List<CalendarItemVO> selectCalendarData(@Param("userId") Long userId, @Param("days") int days);

	@Select("SELECT s.id AS submitId, s.question_id AS questionId, " +
			"s.selected_option_label AS selectedOptionLabel, " +
			"s.correct_option_label AS correctOptionLabel, " +
			"q.title, q.content, q.category, q.difficulty, q.analysis, s.create_time AS createTime " +
			"FROM t_user_submit s " +
			"JOIN t_question q ON s.question_id = q.id " +
			"WHERE s.user_id = #{userId} " +
			"  AND s.is_correct = 0 " +
			"  AND s.submit_status = 1 " +
			"  AND q.category = #{category} " +
			"  AND s.is_deleted = 0 " +
			"ORDER BY s.create_time DESC")
	List<WrongSubmitWithQuestionVO> selectWrongSubmitsWithQuestion(@Param("userId") Long userId, @Param("category") String category);
}
