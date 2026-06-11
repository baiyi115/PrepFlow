package com.ai.interview.service;

import cn.dev33.satoken.secure.BCrypt;
import cn.dev33.satoken.stp.SaTokenInfo;
import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.dto.LoginRequest;
import com.ai.interview.dto.RegisterRequest;
import com.ai.interview.dto.UpdateProfileRequest;
import com.ai.interview.entity.User;
import com.ai.interview.exception.BusinessException;
import com.ai.interview.mapper.UserMapper;
import com.ai.interview.vo.LoginVO;
import com.ai.interview.vo.UserVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

	@Resource
	private UserMapper userMapper;

	@Value("${file.upload-path}")
	private String uploadPath;

	private File getAvatarDir() {
		File baseDir = new File(uploadPath).getAbsoluteFile();
		if (!"uploads".equalsIgnoreCase(baseDir.getName())) {
			return new File(baseDir, "uploads").getAbsoluteFile();
		}
		return baseDir;
	}

	public LoginVO login(LoginRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
		if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名为空");
		}
		if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码为空");
		}

		String username = request.getUsername().trim();
		String password = request.getPassword().trim();

		QueryWrapper<User> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("username", username);
		User user = userMapper.selectOne(queryWrapper);

		if (user == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
		}

		if (!Integer.valueOf(BusinessConstant.USER_STATUS_NORMAL).equals(user.getStatus())) {
			throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "用户已被禁用");
		}

		if (!BCrypt.checkpw(password, user.getPasswordHash())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名或密码错误");
		}

		StpUtil.login(user.getId());
		SaTokenInfo tokenInfo = StpUtil.getTokenInfo();

		user.setLastLoginTime(LocalDateTime.now());
		userMapper.updateById(user);

		LoginVO loginVO = new LoginVO();
		loginVO.setUserId(user.getId());
		loginVO.setUsername(user.getUsername());
		loginVO.setNickname(user.getNickname());
		loginVO.setAvatarUrl(user.getAvatarUrl());
		loginVO.setUserRole(user.getUserRole());
		loginVO.setStatus(user.getStatus());
		loginVO.setTokenName(tokenInfo.getTokenName());
		loginVO.setTokenValue(tokenInfo.getTokenValue());

		return loginVO;
	}

	public UserVO getLoginUser() {
		Long userId = StpUtil.getLoginIdAsLong();
		User user = userMapper.selectById(userId);
		if (user == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
		}

		UserVO userVO = new UserVO();
		userVO.setUserId(user.getId());
		userVO.setUsername(user.getUsername());
		userVO.setNickname(user.getNickname());
		userVO.setAvatarUrl(user.getAvatarUrl());
		userVO.setUserRole(user.getUserRole());
		userVO.setStatus(user.getStatus());
		return userVO;
	}

	public void logout() {
		StpUtil.logout();
	}

	public void checkIsAdmin() {
		Long userId = StpUtil.getLoginIdAsLong();
		User user = userMapper.selectById(userId);
		if (user == null || !Integer.valueOf(BusinessConstant.USER_ROLE_ADMIN).equals(user.getUserRole())) {
			throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "无管理员权限");
		}
	}

	public Long register(RegisterRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
		if (request.getUsername() == null || request.getUsername().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名不能为空");
		}
		if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "密码不能为空");
		}
		if (request.getNickname() == null || request.getNickname().trim().isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "昵称不能为空");
		}

		QueryWrapper<User> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("username", request.getUsername().trim());
		User exitsUser = userMapper.selectOne(queryWrapper);
		if (exitsUser != null) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名已存在");
		}

		User newUser = new User();
		newUser.setUsername(request.getUsername().trim());
		String password = request.getPassword();
		String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
		newUser.setPasswordHash(hashedPassword);
		newUser.setNickname(request.getNickname().trim());
		newUser.setStatus(BusinessConstant.USER_STATUS_NORMAL);

		int result = userMapper.insert(newUser);
		if (result != 1) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "注册失败");
		}
		return newUser.getId();
	}

	public void updateProfile(UpdateProfileRequest request) {
		if (request == null) {
			throw new BusinessException(ErrorCode.NULL_ERROR, "请求为空");
		}
		Long userId = StpUtil.getLoginIdAsLong();
		User user = new User();
		user.setId(userId);
		if (request.getNickname() != null && !request.getNickname().trim().isEmpty()) {
			user.setNickname(request.getNickname().trim());
		}
		if (request.getAvatarUrl() != null && !request.getAvatarUrl().trim().isEmpty()) {
			user.setAvatarUrl(request.getAvatarUrl().trim());
		}
		userMapper.updateById(user);
	}

	public String uploadAvatar(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "上传文件为空");
		}
		String originalFilename = file.getOriginalFilename();
		if (originalFilename == null || !originalFilename.contains(".")) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "非法的文件名称");
		}
		String suffix = originalFilename.substring(originalFilename.lastIndexOf("."));
		
		if (!suffix.matches("(?i)\\.(jpg|jpeg|png|gif)")) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片格式不支持");
		}

		String newFileName = UUID.randomUUID().toString() + suffix;
		File destDir = getAvatarDir();
		if (!destDir.exists() && !destDir.mkdirs()) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "创建上传目录失败");
		}
		try {
			file.transferTo(new File(destDir, newFileName));
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件上传失败");
		}
		
		Long userId = StpUtil.getLoginIdAsLong();
		User user = new User();
		user.setId(userId);
		user.setAvatarUrl("/api/uploads/" + newFileName);
		userMapper.updateById(user);

		return "/api/uploads/" + newFileName;
	}
}
