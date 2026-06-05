package com.ai.interview.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class WrongSubmitWithQuestionVO {
    private Long submitId;
    private Long questionId;
    private String selectedOptionLabel;
    private String correctOptionLabel;
    private String title;
    private String content;
    private String category;
    private Integer difficulty;
    private String analysis;
    private LocalDateTime createTime;
}
