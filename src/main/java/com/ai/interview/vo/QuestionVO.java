package com.ai.interview.vo;
 
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
 
@Data
public class QuestionVO {
 
    @JsonSerialize(using = ToStringSerializer.class)
    private Long id;
 
    private String title;
 
    private String category;
 
    private Integer difficulty;
 
    private Integer questionType;
}
