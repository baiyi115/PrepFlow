package com.ai.interview.vo;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserWrongBookVO {

    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;

    @JsonSerialize(using = ToStringSerializer.class)
    private Long questionId;

    private String title;

    private String category;

    private Integer difficulty;

    private Integer reviewStage;

    private LocalDateTime nextReviewTime;
}
