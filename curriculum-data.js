// 카테고리별 커리큘럼 데이터 관리
let curriculumCategories = {
    "general_office": {
        name: "일반 사무 업무",
        description: "AI를 활용한 일반적인 사무 업무 자동화 및 효율성 향상",
        curriculums: [
            {
                id: 1,
                title: "비즈니스 이메일 작성",
                description: "AI를 활용한 전문적이고 효과적인 비즈니스 이메일 작성 기법을 학습합니다.",
                duration: 120
            },
            {
                id: 2,
                title: "보고서 및 사업계획서 작성",
                description: "구조화된 보고서와 사업계획서를 AI 도구를 활용하여 효율적으로 작성하는 방법을 익힙니다.",
                duration: 180
            },
            {
                id: 3,
                title: "STT 활용 회의록 작성",
                description: "음성-텍스트 변환 기술을 활용하여 회의 내용을 자동으로 기록하고 정리하는 방법을 학습합니다.",
                duration: 90
            },
            {
                id: 4,
                title: "문서 요약 및 질의응답",
                description: "AI를 활용하여 긴 문서를 요약하고 핵심 내용에 대한 질의응답을 수행하는 기법을 배웁니다.",
                duration: 120
            },
            {
                id: 5,
                title: "데이터 분석 및 시각화",
                description: "데이터 분석 결과를 효과적으로 시각화하고 보고서를 생성하는 방법을 학습합니다.",
                duration: 240
            },
            {
                id: 6,
                title: "엑셀 함수 활용",
                description: "IF, SUMIF, VLOOKUP 등 엑셀 고급 함수를 AI와 함께 활용하는 방법을 익힙니다.",
                duration: 180
            },
            {
                id: 7,
                title: "엑셀 VBA 코드 작성",
                description: "데이터 자동 취합, PDF 변환, 팝업 알림 등 업무 자동화를 위한 VBA 코드 작성법을 배웁니다.",
                duration: 300
            },
            {
                id: 8,
                title: "AI 기반 웹 검색 활용",
                description: "효율적인 자료 조사를 위한 AI 기반 웹 검색 기법과 정보 수집 방법을 학습합니다.",
                duration: 120
            },
            {
                id: 9,
                title: "파이썬 웹크롤링",
                description: "파이썬을 활용한 뉴스 및 데이터 자동 수집 시스템 구축 방법을 실습합니다.",
                duration: 360
            },
            {
                id: 10,
                title: "유튜브 영상 요약 활용",
                description: "릴리스 AI 등을 활용하여 유튜브 영상 내용을 자동으로 요약하고 정리하는 방법을 배웁니다.",
                duration: 90
            },
            {
                id: 11,
                title: "일정 관리 자동화",
                description: "타임테이블 등 일정 관리를 자동화하여 업무 효율성을 향상시키는 방법을 학습합니다.",
                duration: 120
            },
            {
                id: 12,
                title: "커스텀 GPT 제작",
                description: "업무에 특화된 커스텀 GPT를 제작하고 활용하는 방법을 익힙니다.",
                duration: 180
            },
            {
                id: 13,
                title: "MS 365 Copilot 활용",
                description: "Teams, Word, Outlook 등에서 MS 365 Copilot을 활용한 업무 효율성 향상 방법을 학습합니다.",
                duration: 240
            },
            {
                id: 14,
                title: "프롬프트 엔지니어링",
                description: "효과적인 AI 활용을 위한 프롬프트 작성 기법과 엔지니어링 방법론을 배웁니다.",
                duration: 180
            },
            {
                id: 15,
                title: "다양한 생성 AI 활용",
                description: "Claude, Gemini 등 다양한 생성 AI 모델의 특징과 활용 방법을 학습합니다.",
                duration: 150
            },
            {
                id: 16,
                title: "AI 윤리 및 저작권",
                description: "생성 AI 사용 시 고려해야 할 윤리적 가이드라인과 저작권 이슈를 이해합니다.",
                duration: 90
            }
        ]
    },
    "marketing": {
        name: "마케팅 업무",
        description: "AI를 활용한 마케팅 전략 수립 및 콘텐츠 제작",
        curriculums: [
            {
                id: 17,
                title: "AI 기반 시장조사",
                description: "AI 기반 웹 검색을 활용하여 효과적인 시장조사를 수행하는 방법을 학습합니다.",
                duration: 180
            },
            {
                id: 18,
                title: "고객 피드백 분석",
                description: "고객 리뷰와 설문 피드백을 AI로 분석하여 개선안을 도출하는 방법을 배웁니다.",
                duration: 150
            },
            {
                id: 19,
                title: "소셜 데이터 분석",
                description: "유튜브 댓글 등 소셜 미디어 데이터를 수집하고 분석하는 기법을 학습합니다.",
                duration: 180
            },
            {
                id: 20,
                title: "트렌드 분석",
                description: "최신 뉴스를 기반으로 한 트렌드 분석과 마케팅 인사이트 도출 방법을 익힙니다.",
                duration: 150
            },
            {
                id: 21,
                title: "광고 카피라이팅",
                description: "AI를 활용한 효과적인 광고 및 홍보용 카피라이팅 문구 제작 기법을 배웁니다.",
                duration: 180
            },
            {
                id: 22,
                title: "SNS 콘텐츠 기획",
                description: "소셜 미디어 플랫폼별 특성에 맞는 콘텐츠 기획 및 생성 방법을 학습합니다.",
                duration: 240
            },
            {
                id: 23,
                title: "상품 상세페이지 기획",
                description: "고객의 구매 욕구를 자극하는 효과적인 상품 상세페이지 기획 방법을 익힙니다.",
                duration: 210
            },
            {
                id: 24,
                title: "홍보 자료 생성",
                description: "다양한 홍보 안내문과 마케팅 자료를 AI를 활용하여 제작하는 방법을 배웁니다.",
                duration: 150
            },
            {
                id: 25,
                title: "광고 리포트 분석",
                description: "광고 성과 리포트를 분석하고 고효율 키워드를 추출하는 방법을 학습합니다.",
                duration: 180
            },
            {
                id: 26,
                title: "프로모션 기획",
                description: "데이터 기반으로 신규 프로모션을 기획하고 실행하는 전략을 배웁니다.",
                duration: 240
            },
            {
                id: 27,
                title: "광고 영상 컨셉 기획",
                description: "AI를 활용하여 효과적인 광고 영상 제작 컨셉을 도출하는 방법을 학습합니다.",
                duration: 180
            }
        ]
    },
    "design": {
        name: "디자인 업무",
        description: "AI를 활용한 창의적 디자인 및 시각 자료 제작",
        curriculums: [
            {
                id: 28,
                title: "미드저니 활용 이미지 생성",
                description: "미드저니 AI를 활용하여 창의적이고 전문적인 이미지를 생성하는 방법을 학습합니다.",
                duration: 240
            },
            {
                id: 29,
                title: "DALL-E 이미지 생성",
                description: "DALL-E를 활용한 다양한 스타일의 이미지 생성 기법과 활용 방안을 배웁니다.",
                duration: 180
            },
            {
                id: 30,
                title: "레오나르도 AI 활용",
                description: "레오나르도 AI의 고급 기능을 활용한 전문적인 이미지 제작 방법을 익힙니다.",
                duration: 210
            },
            {
                id: 31,
                title: "상세페이지 디자인",
                description: "AI 도구를 활용하여 매력적인 상품 상세페이지를 디자인하는 방법을 학습합니다.",
                duration: 300
            },
            {
                id: 32,
                title: "카드뉴스 제작",
                description: "SNS용 카드뉴스와 인포그래픽을 AI로 효율적으로 제작하는 기법을 배웁니다.",
                duration: 240
            },
            {
                id: 33,
                title: "홍보 포스터 제작",
                description: "AI를 활용한 시선을 끄는 홍보 포스터 및 광고 소재 제작 방법을 학습합니다.",
                duration: 180
            },
            {
                id: 34,
                title: "Gamma 발표자료 제작",
                description: "Gamma AI를 활용하여 전문적인 발표자료를 자동으로 생성하는 방법을 익힙니다.",
                duration: 150
            },
            {
                id: 35,
                title: "PowerPoint Copilot 활용",
                description: "PowerPoint Copilot을 활용한 프레젠테이션 제작 자동화 기법을 배웁니다.",
                duration: 120
            },
            {
                id: 36,
                title: "룩북 제작",
                description: "제품 및 서비스의 매력적인 룩북(Lookbook)을 AI로 제작하는 방법을 학습합니다.",
                duration: 270
            }
        ]
    }
};

// 기존 데이터와의 호환성을 위한 전체 커리큘럼 배열
let curriculumData = [];

// 카테고리별 데이터 초기화
function initializeCurriculumData() {
    // 전체 커리큘럼을 평면 배열로 변환 (기존 코드 호환성)
    curriculumData = [];
    Object.keys(curriculumCategories).forEach(categoryKey => {
        curriculumData = curriculumData.concat(curriculumCategories[categoryKey].curriculums);
    });
}

// 카테고리 목록 가져오기
function getCategoryList() {
    return Object.keys(curriculumCategories).map(key => ({
        key: key,
        name: curriculumCategories[key].name,
        description: curriculumCategories[key].description,
        count: curriculumCategories[key].curriculums.length
    }));
}

// 특정 카테고리의 커리큘럼 가져오기
function getCurriculumsByCategory(categoryKey) {
    return curriculumCategories[categoryKey] ? curriculumCategories[categoryKey].curriculums : [];
}

// 전체 커리큘럼 가져오기 (기존 호환성)
function getAllCurriculums() {
    return curriculumData;
}

// 로컬 스토리지에서 데이터 로드
function loadCurriculumData() {
    const saved = localStorage.getItem('curriculumCategories');
    if (saved) {
        try {
            curriculumCategories = JSON.parse(saved);
        } catch (error) {
            console.warn('저장된 커리큘럼 데이터 로드 실패, 기본 데이터 사용');
        }
    }
    initializeCurriculumData();
    return curriculumData;
}

// 로컬 스토리지에 데이터 저장
function saveCurriculumData() {
    localStorage.setItem('curriculumCategories', JSON.stringify(curriculumCategories));
    initializeCurriculumData();
}

// 새 ID 생성
function generateNewId() {
    let maxId = 0;
    Object.keys(curriculumCategories).forEach(categoryKey => {
        curriculumCategories[categoryKey].curriculums.forEach(curriculum => {
            if (curriculum.id > maxId) {
                maxId = curriculum.id;
            }
        });
    });
    return maxId + 1;
}

// 커리큘럼 추가 (카테고리별)
function addCurriculum(categoryKey, title, description, duration) {
    if (!curriculumCategories[categoryKey]) {
        return null;
    }
    
    const newCurriculum = {
        id: generateNewId(),
        title: title,
        description: description,
        duration: parseInt(duration)
    };
    
    curriculumCategories[categoryKey].curriculums.push(newCurriculum);
    saveCurriculumData();
    return newCurriculum;
}

// 커리큘럼 수정
function updateCurriculum(id, title, description, duration) {
    for (let categoryKey of Object.keys(curriculumCategories)) {
        const index = curriculumCategories[categoryKey].curriculums.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            curriculumCategories[categoryKey].curriculums[index] = {
                id: parseInt(id),
                title: title,
                description: description,
                duration: parseInt(duration)
            };
            saveCurriculumData();
            return curriculumCategories[categoryKey].curriculums[index];
        }
    }
    return null;
}

// 커리큘럼 삭제
function deleteCurriculum(id) {
    for (let categoryKey of Object.keys(curriculumCategories)) {
        const index = curriculumCategories[categoryKey].curriculums.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            const deleted = curriculumCategories[categoryKey].curriculums.splice(index, 1)[0];
            saveCurriculumData();
            return deleted;
        }
    }
    return null;
}

// 페이지 로드 시 데이터 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadCurriculumData();
});