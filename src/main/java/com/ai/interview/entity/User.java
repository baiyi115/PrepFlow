package com.ai.interview.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableLogic;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("t_user")
public class User {

	@TableId(type = IdType.ASSIGN_ID)
	private Long id;

	private String username;

	private String passwordHash;

	private String nickname;

	private String avatarUrl;

	private Integer userRole;

	private Integer status;

	private LocalDateTime lastLoginTime;

	private LocalDateTime createTime;

	private LocalDateTime updateTime;

	@TableLogic
	private Integer isDeleted;
}
