package com.ai.interview.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

	@NotBlank(message = "用户名不能为空")
	@Size(min = 3, max = 20, message = "用户名长度需在 3-20 个字符之间")
	private String username;

	@NotBlank(message = "密码不能为空")
	@Size(min = 6, max = 32, message = "密码长度需在 6-32 个字符之间")
	private String password;

	@NotBlank(message = "昵称不能为空")
	@Size(max = 20, message = "昵称长度不能超过 20 个字符")
	private String nickname;
}
