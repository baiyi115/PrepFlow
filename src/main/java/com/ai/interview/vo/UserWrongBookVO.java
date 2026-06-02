package com.ai.interview.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserWrongBookVO {

    private Long id;

    private Long questionId;

    private String title;

    private String category;

    private Integer difficulty;

    private Integer reviewStage;

    private LocalDateTime nextReviewTime;
}
