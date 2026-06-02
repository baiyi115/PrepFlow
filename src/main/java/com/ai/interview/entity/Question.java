package com.ai.interview.entity;
import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.time.LocalDateTime;
@Data
@TableName("t_question")
public class Question {

	@TableId(type=IdType.ASSIGN_ID)

	private Long id;

	private String title;

	private String content;

	private String category;

	private Integer difficulty;

	private Integer questionType;

	private String correctOptionLabel;

	private String analysis;

	private Integer status;

	private LocalDateTime createTime;

	private LocalDateTime updateTime;

	@TableLogic
	private Integer isDeleted;
}
