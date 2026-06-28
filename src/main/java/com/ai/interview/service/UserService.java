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

	public LoginVO login(LoginRequest request) {
		UserValidator.validateLogin(request);
		User user = findByUsername(request.getUsername().trim());
		checkLoginUser(user, request.getPassword().trim());

		StpUtil.login(user.getId());
		SaTokenInfo tokenInfo = StpUtil.getTokenInfo();
		updateLastLoginTime(user);

		return UserAssembler.toLoginVO(user, tokenInfo.getTokenName(), tokenInfo.getTokenValue());
	}

	public UserVO getLoginUser() {
		return UserAssembler.toUserVO(requireUser(StpUtil.getLoginIdAsLong()));
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
		UserValidator.validateRegister(request);
		if (findByUsername(request.getUsername().trim()) != null) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名已存在");
		}

		String passwordHash = BCrypt.hashpw(request.getPassword(), BCrypt.gensalt());
		User newUser = UserAssembler.toNewUser(request, passwordHash);
		if (userMapper.insert(newUser) != 1) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "注册失败");
		}
		return newUser.getId();
	}

	public void updateProfile(UpdateProfileRequest request) {
		UserValidator.validateUpdateProfile(request);
		userMapper.updateById(UserAssembler.toProfileUpdate(StpUtil.getLoginIdAsLong(), request));
	}

	public String uploadAvatar(MultipartFile file) {
		String avatarUrl = saveAvatar(file);
		userMapper.updateById(UserAssembler.toAvatarUpdate(StpUtil.getLoginIdAsLong(), avatarUrl));
		return avatarUrl;
	}

	private User findByUsername(String username) {
		QueryWrapper<User> queryWrapper = new QueryWrapper<>();
		queryWrapper.eq("username", username);
		return userMapper.selectOne(queryWrapper);
	}

	private User requireUser(Long userId) {
		User user = userMapper.selectById(userId);
		if (user == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
		}
		return user;
	}

	private void checkLoginUser(User user, String password) {
		if (user == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
		}
		if (!Integer.valueOf(BusinessConstant.USER_STATUS_NORMAL).equals(user.getStatus())) {
			throw new BusinessException(ErrorCode.FORBIDDEN_ERROR, "用户已被禁用");
		}
		if (!BCrypt.checkpw(password, user.getPasswordHash())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "用户名或密码错误");
		}
	}

	private void updateLastLoginTime(User user) {
		user.setLastLoginTime(LocalDateTime.now());
		userMapper.updateById(user);
	}

	private String saveAvatar(MultipartFile file) {
		validateAvatarFile(file);
		String newFileName = UUID.randomUUID() + suffixOf(file.getOriginalFilename());
		File destDir = getAvatarDir();
		if (!destDir.exists() && !destDir.mkdirs()) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "创建上传目录失败");
		}
		try {
			file.transferTo(new File(destDir, newFileName));
		} catch (Exception e) {
			throw new BusinessException(ErrorCode.SYSTEM_ERROR, "文件上传失败");
		}
		return "/api/uploads/" + newFileName;
	}

	private void validateAvatarFile(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "上传文件为空");
		}
		String originalFilename = file.getOriginalFilename();
		if (originalFilename == null || !originalFilename.contains(".")) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "非法的文件名称");
		}
		if (!suffixOf(originalFilename).matches("(?i)\\.(jpg|jpeg|png|gif)")) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "图片格式不支持");
		}
	}

	private File getAvatarDir() {
		File baseDir = new File(uploadPath).getAbsoluteFile();
		if ("uploads".equalsIgnoreCase(baseDir.getName())) {
			return baseDir;
		}
		return new File(baseDir, "uploads").getAbsoluteFile();
	}

	private String suffixOf(String fileName) {
		return fileName.substring(fileName.lastIndexOf("."));
	}
}
