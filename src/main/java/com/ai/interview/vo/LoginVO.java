package com.ai.interview.vo;
 
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
 
@Data
public class LoginVO {
 
	@JsonSerialize(using = ToStringSerializer.class)
	private Long userId;
 
	private String username;
 
	private String nickname;
 
	private String avatarUrl;
 
	private Integer userRole;
 
	private Integer status;
 
	private String tokenName;
 
	private String tokenValue;
}
