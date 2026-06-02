package com.ai.interview.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminUpdateQuestionRequest {

    private Long id;

    private String title;

    private String content;

    private String category;

    private Integer difficulty;

    private Integer questionType;

    private String correctOptionLabel;

    private String analysis;

    private Integer status;

    private List<AdminAddOptionRequest> options;
}
