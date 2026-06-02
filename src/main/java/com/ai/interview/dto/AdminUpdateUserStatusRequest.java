package com.ai.interview.dto;

import lombok.Data;

@Data
public class AdminUpdateUserStatusRequest {

    private Long userId;

    private Integer status;
}
