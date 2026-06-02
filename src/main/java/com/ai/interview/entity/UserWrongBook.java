package com.ai.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_user_wrong_book")
public class UserWrongBook {

	@TableId(type = IdType.ASSIGN_ID)
	private Long id;

	private Long userId;

	private Long questionId;

	private Integer reviewStage;

	private LocalDateTime nextReviewTime;

	private Integer status;

	private LocalDateTime createTime;

	private LocalDateTime updateTime;

	@TableLogic
	private Integer isDeleted;
}
