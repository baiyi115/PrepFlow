package com.ai.interview.service;

import com.ai.interview.dto.AdminUpdateUserStatusRequest;
import com.ai.interview.entity.User;
import com.ai.interview.mapper.UserMapper;
import com.ai.interview.vo.UserVO;
import jakarta.annotation.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import cn.dev33.satoken.stp.StpUtil;
import com.ai.interview.common.ErrorCode;
import com.ai.interview.constant.BusinessConstant;
import com.ai.interview.exception.BusinessException;

import java.util.List;

@Service
public class AdminUserService {

	@Resource
	private UserService userService;

	@Resource
	private UserMapper userMapper;

	public List<UserVO> listUsers() {
		userService.checkIsAdmin();
		List<User> users = userMapper.selectList(null);
		return users.stream().map(UserAssembler::toUserVO).toList();
	}

	/**
	 * 拒绝管理员封禁自己，避免误操作导致后台不可用。
	 */
	@Transactional(rollbackFor = Exception.class)
	public void updateUserStatus(AdminUpdateUserStatusRequest request) {
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
