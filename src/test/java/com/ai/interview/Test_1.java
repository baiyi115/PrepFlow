package com.ai.interview;
import com.ai.interview.mapper.QuestionMapper;
import com.ai.interview.mapper.QuestionOptionMapper;
import com.ai.interview.mapper.UserSubmitMapper;
import jakarta.annotation.Resource;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
@SpringBootTest
class MapperConnectionTest {
	@Resource
	private QuestionMapper questionMapper;
	@Resource
	private QuestionOptionMapper questionOptionMapper;
	@Resource
	private UserSubmitMapper userSubmitMapper;
	@Test
	void testMapperSelectCount() {
		Long questionCount = questionMapper.selectCount(null);
		Long optionCount = questionOptionMapper.selectCount(null);
		Long submitCount = userSubmitMapper.selectCount(null);
		System.out.println("questionCount = " + questionCount);
		System.out.println("optionCount = " + optionCount);
		System.out.println("submitCount = " + submitCount);
	}
}