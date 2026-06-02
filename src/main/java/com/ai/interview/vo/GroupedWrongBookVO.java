package com.ai.interview.vo;

import lombok.Data;
import java.util.List;

@Data
public class GroupedWrongBookVO {

    private String category;

    private Integer totalCount;

    private Integer dueCount;

    private List<UserWrongBookVO> list;
}
