package com.ai.interview.entity;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Data
@TableName("t_user_submit")

public class UserSubmit {

	@TableId(type = IdType.ASSIGN_ID)

	private Long id;

	private Long userId;

	private Long questionId;

	private Integer questionType;

	private String selectedOptionLabel;

	private String correctOptionLabel;

	private String answerText;

	private Integer isCorrect;

	private BigDecimal score;

	private Integer submitStatus;

	private String submitToken;

	private LocalDateTime createTime;

	private LocalDateTime updateTime;

	@TableLogic
	private Integer isDeleted;
}
