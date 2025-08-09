// 커리큘럼 데이터 관리
let curriculumData = [
    {
        id: 1,
        title: "JavaScript 기초",
        description: "변수, 함수, 조건문, 반복문 등 JavaScript의 기본 문법을 학습합니다. 프로그래밍을 처음 시작하는 분들에게 적합한 과정입니다.",
        duration: 4
    },
    {
        id: 2,
        title: "HTML/CSS 입문",
        description: "웹페이지의 구조를 만드는 HTML과 스타일링을 담당하는 CSS의 기본 개념과 활용법을 익힙니다.",
        duration: 3
    },
    {
        id: 3,
        title: "React 기초",
        description: "컴포넌트 기반 개발, JSX 문법, State와 Props를 활용한 동적 웹 애플리케이션 개발 방법을 학습합니다.",
        duration: 6
    },
    {
        id: 4,
        title: "Node.js 서버 개발",
        description: "Express 프레임워크를 활용한 REST API 개발과 데이터베이스 연동 방법을 실습합니다.",
        duration: 5
    },
    {
        id: 5,
        title: "데이터베이스 설계",
        description: "관계형 데이터베이스의 설계 원칙과 SQL 쿼리 작성법, 최적화 기법을 배웁니다.",
        duration: 4
    }
];

// 로컬 스토리지에서 데이터 로드
function loadCurriculumData() {
    const saved = localStorage.getItem('curriculumData');
    if (saved) {
        curriculumData = JSON.parse(saved);
    }
    return curriculumData;
}

// 로컬 스토리지에 데이터 저장
function saveCurriculumData() {
    localStorage.setItem('curriculumData', JSON.stringify(curriculumData));
}

// 새 ID 생성
function generateNewId() {
    return curriculumData.length > 0 ? Math.max(...curriculumData.map(item => item.id)) + 1 : 1;
}

// 커리큘럼 추가
function addCurriculum(title, description, duration) {
    const newCurriculum = {
        id: generateNewId(),
        title: title,
        description: description,
        duration: parseInt(duration)
    };
    curriculumData.push(newCurriculum);
    saveCurriculumData();
    return newCurriculum;
}

// 커리큘럼 수정
function updateCurriculum(id, title, description, duration) {
    const index = curriculumData.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
        curriculumData[index] = {
            id: parseInt(id),
            title: title,
            description: description,
            duration: parseInt(duration)
        };
        saveCurriculumData();
        return curriculumData[index];
    }
    return null;
}

// 커리큘럼 삭제
function deleteCurriculum(id) {
    const index = curriculumData.findIndex(item => item.id === parseInt(id));
    if (index !== -1) {
        const deleted = curriculumData.splice(index, 1)[0];
        saveCurriculumData();
        return deleted;
    }
    return null;
}

// 페이지 로드 시 데이터 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadCurriculumData();
});