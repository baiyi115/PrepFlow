package com.ai.interview.dto;

import lombok.Data;

@Data
public class AdminAddOptionRequest {

    private String optionLabel;

    private String optionContent;

    private Integer sortOrder;
}
