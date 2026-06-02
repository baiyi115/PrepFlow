package com.ai.interview.mapper;

import com.ai.interview.entity.UserSubmit;
import com.ai.interview.vo.CalendarItemVO;
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
}
