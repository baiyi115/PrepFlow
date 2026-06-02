package com.ai.interview.service;

import com.ai.interview.dto.AdminUpdateUserStatusRequest;
import com.ai.interview.entity.User;
import com.ai.interview.mapper.UserMapper;
import com.ai.interview.vo.UserVO;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.exception.BusinessException;

import java.util.ArrayList;
import java.util.List;

@Service
public class AdminUserService {

	@Resource
	private UserService userService;

	@Resource
	private UserMapper userMapper;

	/**
	 * 查询所有注册用户列表
	 */
	public List<UserVO> listUsers() {
		userService.checkIsAdmin();
		List<User> users = userMapper.selectList(null);
		List<UserVO> userVOList = new ArrayList<>();
		for (User user : users) {
			UserVO vo = new UserVO();
			vo.setUserId(user.getId());
			vo.setUsername(user.getUsername());
			vo.setNickname(user.getNickname());
			vo.setAvatarUrl(user.getAvatarUrl());
			vo.setUserRole(user.getUserRole());
			vo.setStatus(user.getStatus());
			userVOList.add(vo);
		}
		return userVOList;
	}

	/**
	 * 管理员修改用户状态（封禁/解禁，含防止自封禁安全机制）
	 */
	@Transactional(rollbackFor = Exception.class)
	public void updateUserStatus(AdminUpdateUserStatusRequest request) {
		// TODO: 1. 权限拦截：调用 userService.checkIsAdmin() 阻断非管理员
		userService.checkIsAdmin();
		if(request==null||request.getUserId()==null||request.getStatus()==null){
			throw new BusinessException(ErrorCode.PARAMS_ERROR,"请求参数不能为空");
		}
		int status = request.getStatus();
		if(status!=BusinessConstant.USER_STATUS_NORMAL&& status!=BusinessConstant.USER_STATUS_BANNED){
			throw new BusinessException(ErrorCode.PARAMS_ERROR,"状态值不合法");
		}

		Long loginAdminId = StpUtil.getLoginIdAsLong();
		if (loginAdminId.equals(request.getUserId())) {
			throw new BusinessException(ErrorCode.PARAMS_ERROR, "管理员无法修改自己的账号状态，防止自我锁死！");
		}
 
		User user = userMapper.selectById(request.getUserId());
		if (user == null) {
			throw new BusinessException(ErrorCode.NOT_FOUND_ERROR, "用户不存在");
		}
		User updateUser = new User();
		updateUser.setId(request.getUserId());
		updateUser.setStatus(status);
		userMapper.updateById(updateUser);
 
		if (BusinessConstant.USER_STATUS_BANNED == status) {
			StpUtil.kickout(request.getUserId());
		}
	}
}
