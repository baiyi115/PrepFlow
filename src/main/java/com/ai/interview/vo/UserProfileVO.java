package com.ai.interview.vo;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class UserProfileVO {
    private UserVO userProfile;
    private Integer totalCount;
    private Integer correctCount;
    private Integer wrongCount;
    private BigDecimal correctRate;
    private Integer activeWrongCount;
    private List<UserSubmitVO> recentSubmits;
    private List<CategoryStatVO> categoryStats;
    private List<WeaknessAnalysisVO> weaknesses;
}
