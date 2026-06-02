package com.ai.interview.vo;
 
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;
import lombok.Data;
import java.util.List;
 
@Data
public class QuestionDetailVO {
 
	@JsonSerialize(using = ToStringSerializer.class)
	private Long id;
 
	private String title;
 
	private String content;
 
	private String category;
 
	private Integer difficulty;
 
	private Integer questionType;
 
	private String analysis;
 
	private String correctOptionLabel;
 
	private List<QuestionOptionVO> options;
}
