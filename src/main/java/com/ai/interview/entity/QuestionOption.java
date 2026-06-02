package com.ai.interview.entity;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableLogic;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@TableName("t_question_option")
public class QuestionOption {

	@TableId(type = IdType.ASSIGN_ID)
	private Long id;

	private Long questionId;

	private String optionLabel;

	private String optionContent;

	private Integer sortOrder;

	private LocalDateTime createTime;

	private LocalDateTime updateTime;

	@TableLogic
	private Integer isDeleted;
}
