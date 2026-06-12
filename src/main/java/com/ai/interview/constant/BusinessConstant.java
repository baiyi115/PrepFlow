package com.ai.interview.constant;

public class BusinessConstant {

	private BusinessConstant() {
	}

	public static final int QUESTION_STATUS_ENABLED = 1;

	public static final int QUESTION_TYPE_SINGLE_CHOICE = 1;

	public static final int SUBMIT_STATUS_FINISHED = 1;

	public static final int ANSWER_CORRECT = 1;

	public static final int ANSWER_WRONG = 0;

	public static final int USER_STATUS_NORMAL = 0;

	public static final int USER_STATUS_BANNED = 1;

	public static final int USER_ROLE_USER = 0;

	public static final int USER_ROLE_ADMIN = 1;

	// 限流业务场景标识
	public static final String RATE_LIMIT_SUBMIT = "submit";

	// AI 接口限流业务场景标识
	public static final String RATE_LIMIT_AI = "ai";
}
