package com.ai.interview.dto;

import lombok.Data;
import java.util.List;

@Data
public class AdminAddQuestionRequest {

    private String title;

    private String content;

    private String category;

    private Integer difficulty;

    private Integer questionType;

    private String correctOptionLabel;

    private String analysis;

    private List<AdminAddOptionRequest> options;
}
