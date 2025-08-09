// 메인 애플리케이션 JavaScript
let selectedCurriculums = [];
let totalHours = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadCurriculumData();
    displayAllCurriculums();
    setupEventListeners();
    updateTotalTime();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 완성하기 버튼
    document.getElementById('completeBtn').addEventListener('click', handleComplete);
    
    // 드래그 앤 드롭 이벤트
    const selectedList = document.getElementById('selectedCurriculums');
    selectedList.addEventListener('dragover', handleDragOver);
    selectedList.addEventListener('drop', handleDrop);
}

// 전체 커리큘럼 목록 표시
function displayAllCurriculums() {
    const container = document.getElementById('allCurriculums');
    container.innerHTML = '';
    
    // 선택되지 않은 커리큘럼만 표시
    const availableCurriculums = curriculumData.filter(curriculum => 
        !selectedCurriculums.find(selected => selected.id === curriculum.id)
    );
    
    if (availableCurriculums.length === 0) {
        container.innerHTML = '<div class="empty-message"><p>모든 커리큘럼이 선택되었습니다.</p></div>';
        return;
    }
    
    availableCurriculums.forEach(curriculum => {
        const curriculumElement = createCurriculumElement(curriculum, false);
        container.appendChild(curriculumElement);
    });
}

// 선택된 커리큘럼 목록 표시
function displaySelectedCurriculums() {
    const container = document.getElementById('selectedCurriculums');
    container.innerHTML = '';
    
    if (selectedCurriculums.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <p>선택된 커리큘럼이 없습니다.</p>
                <p>왼쪽에서 커리큘럼을 클릭하여 추가하세요.</p>
            </div>
        `;
        return;
    }
    
    selectedCurriculums.forEach((curriculum, index) => {
        const curriculumElement = createCurriculumElement(curriculum, true, index);
        container.appendChild(curriculumElement);
    });
}

// 커리큘럼 요소 생성
function createCurriculumElement(curriculum, isSelected, index) {
    const div = document.createElement('div');
    div.className = 'curriculum-item';
    div.dataset.id = curriculum.id;
    
    if (isSelected) {
        div.draggable = true;
        div.dataset.index = index;
        div.addEventListener('dragstart', handleDragStart);
        div.addEventListener('dragend', handleDragEnd);
    }
    
    div.innerHTML = `
        <h3>${curriculum.title}</h3>
        <div class="duration">${curriculum.duration}분</div>
        <div class="description">${curriculum.description}</div>
        ${isSelected ? '<button class="remove-btn" onclick="removeCurriculum(' + curriculum.id + ')">&times;</button>' : ''}
    `;
    
    if (!isSelected) {
        div.addEventListener('click', () => addCurriculum(curriculum));
    }
    
    return div;
}

// 커리큘럼 추가
function addCurriculum(curriculum) {
    selectedCurriculums.push(curriculum);
    displayAllCurriculums();
    displaySelectedCurriculums();
    updateTotalTime();
    updateCompleteButton();
    showMessage(`"${curriculum.title}" 커리큘럼이 추가되었습니다.`, 'success');
}

// 커리큘럼 제거
function removeCurriculum(id) {
    const curriculum = selectedCurriculums.find(item => item.id === id);
    selectedCurriculums = selectedCurriculums.filter(item => item.id !== id);
    displayAllCurriculums();
    displaySelectedCurriculums();
    updateTotalTime();
    updateCompleteButton();
    if (curriculum) {
        showMessage(`"${curriculum.title}" 커리큘럼이 제거되었습니다.`, 'success');
    }
}

// 총 시간 업데이트
function updateTotalTime() {
    totalHours = selectedCurriculums.reduce((sum, curriculum) => sum + curriculum.duration, 0);
    const hours = Math.floor(totalHours / 60);
    const minutes = totalHours % 60;
    const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
    document.getElementById('totalTime').textContent = `(총 시간: ${timeText})`;
}

// 완성하기 버튼 상태 업데이트
function updateCompleteButton() {
    const completeBtn = document.getElementById('completeBtn');
    completeBtn.disabled = selectedCurriculums.length === 0;
}

// 드래그 시작
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.index);
    e.target.classList.add('dragging');
}

// 드래그 끝
function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

// 드래그 오버
function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

// 드롭 처리
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
    const dropTarget = e.target.closest('.curriculum-item');
    
    if (dropTarget && dropTarget.dataset.index) {
        const targetIndex = parseInt(dropTarget.dataset.index);
        
        if (draggedIndex !== targetIndex) {
            // 배열 순서 변경
            const draggedItem = selectedCurriculums[draggedIndex];
            selectedCurriculums.splice(draggedIndex, 1);
            selectedCurriculums.splice(targetIndex, 0, draggedItem);
            
            displaySelectedCurriculums();
            showMessage('순서가 변경되었습니다.', 'success');
        }
    }
}

// 완성하기 처리
async function handleComplete() {
    const companyName = document.getElementById('companyName').value.trim();
    const instructorName = document.getElementById('instructorName').value.trim();
    const courseName = document.getElementById('courseName').value.trim();
    
    if (!companyName || !instructorName || !courseName) {
        showMessage('고객사 정보를 모두 입력해주세요.', 'error');
        return;
    }
    
    if (selectedCurriculums.length === 0) {
        showMessage('선택된 커리큘럼이 없습니다.', 'error');
        return;
    }
    
    // 구글 스프레드시트 설정 확인
    if (!API_KEY || !CLIENT_ID || !SPREADSHEET_ID) {
        // 구글 시트 연동이 설정되지 않은 경우 로컬에 데이터 저장
        const data = {
            companyName,
            courseName,
            totalMinutes: totalHours,
            totalTime: (() => {
                const hours = Math.floor(totalHours / 60);
                const minutes = totalHours % 60;
                return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
            })(),
            date: new Date().toLocaleDateString('ko-KR'),
            instructor: instructorName,
            curriculums: selectedCurriculums,
            timestamp: new Date().toISOString()
        };
        
        // 로컬 스토리지에 저장
        let savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
        savedData.push(data);
        localStorage.setItem('savedCurriculums', JSON.stringify(savedData));
        
        console.log('로컬에 저장된 데이터:', data);
        showMessage('커리큘럼 구성이 완료되었습니다! 데이터가 로컬에 저장되었습니다.', 'success');
    } else {
        // 구글 스프레드시트에 전송
        try {
            document.getElementById('completeBtn').disabled = true;
            document.getElementById('completeBtn').textContent = '전송 중...';
            
            if (typeof handleAuthClick === 'function') {
                handleAuthClick();
            } else {
                throw new Error('구글 시트 API가 로드되지 않았습니다.');
            }
        } catch (error) {
            console.error('전송 오류:', error);
            showMessage('데이터 전송 중 오류가 발생했습니다.', 'error');
            document.getElementById('completeBtn').disabled = false;
            document.getElementById('completeBtn').textContent = '완성하기';
        }
        return; // 구글 시트 전송 시에는 여기서 리턴 (콜백에서 처리)
    }
    
    // 폼 초기화 (로컬 저장인 경우)
    setTimeout(() => {
        resetForm();
    }, 2000);
}

// 폼 초기화 함수
function resetForm() {
    document.getElementById('companyName').value = '';
    document.getElementById('instructorName').value = '';
    document.getElementById('courseName').value = '';
    selectedCurriculums = [];
    displayAllCurriculums();
    displaySelectedCurriculums();
    updateTotalTime();
    updateCompleteButton();
    document.getElementById('completeBtn').textContent = '완성하기';
}

// 메시지 표시
function showMessage(message, type = 'success') {
    const messageArea = document.getElementById('messageArea');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    
    messageArea.appendChild(messageDiv);
    
    // 3초 후 메시지 제거
    setTimeout(() => {
        if (messageDiv.parentNode) {
            messageDiv.parentNode.removeChild(messageDiv);
        }
    }, 3000);
}