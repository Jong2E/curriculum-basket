// 메인 애플리케이션 JavaScript
let selectedCurriculums = [];
let totalHours = 0;
let currentCategory = 'all';
let searchQuery = '';

document.addEventListener('DOMContentLoaded', function() {
    loadCurriculumData();
    setupEventListeners();
    updateTotalTime();
    
    // 기존 데이터 마이그레이션 실행
    const migrationCount = migrateOldData();
    if (migrationCount > 0) {
        console.log('데이터 마이그레이션 완료:', migrationCount);
    }
    
    // 필터 버튼 동적 생성
    generateFilterButtons();
    // 초기 상태에서 전체 커리큘럼을 표시
    displayFilteredCurriculums();
});

// 이벤트 리스너 설정
function setupEventListeners() {
    // 완성하기 버튼
    document.getElementById('completeBtn').addEventListener('click', handleComplete);
    
    // 드래그 앤 드롭 이벤트
    const selectedList = document.getElementById('selectedCurriculums');
    selectedList.addEventListener('dragover', handleDragOver);
    selectedList.addEventListener('drop', handleDrop);
    
    // 필터 버튼들
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    // 검색 기능
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', handleSearch);
    clearBtn.addEventListener('click', clearSearch);
    
    // 고객사 정보 입력 필드에서 오류 스타일 제거
    const inputFields = ['companyName', 'instructorName', 'courseName'];
    inputFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('input', function() {
            this.classList.remove('error');
        });
    });
}

// 필터 버튼들 동적 생성
function generateFilterButtons() {
    const filterButtons = document.querySelector('.filter-buttons');
    if (!filterButtons) return;
    
    // 기존 버튼들 제거
    filterButtons.innerHTML = '';
    
    // 전체 보기 버튼
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.category = 'all';
    allBtn.innerHTML = `
        <span class="btn-content">
            <span class="btn-icon">🌟</span>
            전체 보기
        </span>
        <span class="count" id="countAll">0</span>
    `;
    filterButtons.appendChild(allBtn);
    
    // 카테고리별 버튼들 생성
    if (curriculumCategories && Object.keys(curriculumCategories).length > 0) {
        Object.keys(curriculumCategories).forEach(categoryKey => {
            const category = curriculumCategories[categoryKey];
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.category = categoryKey;
            
            // 카운트 ID 생성 (기존 형식과 호환성 유지)
            let countId;
            if (categoryKey === 'general_office') {
                countId = 'countGeneral';
            } else if (categoryKey === 'marketing') {
                countId = 'countMarketing';
            } else if (categoryKey === 'design') {
                countId = 'countDesign';
            } else {
                // 새로운 카테고리의 경우 동적 ID 생성
                countId = `count${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())}`;
            }
            
            btn.innerHTML = `
                <span class="btn-content">
                    <span class="btn-icon">${category.icon || '🌟'}</span>
                    ${category.name}
                </span>
                <span class="count" id="${countId}">0</span>
            `;
            filterButtons.appendChild(btn);
        });
    }
    
    // 이벤트 리스너 다시 추가
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    updateFilterCounts();
}

// 필터 변경 처리
function handleFilterChange(event) {
    const category = event.target.dataset.category;
    currentCategory = category;
    
    // 모든 필터 버튼에서 active 클래스 제거
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 버튼에 active 클래스 추가
    event.target.classList.add('active');
    
    // 필터링된 커리큘럼 표시
    displayFilteredCurriculums();
}

// 검색 처리
function handleSearch(event) {
    searchQuery = event.target.value.trim();
    const clearBtn = document.getElementById('clearSearch');
    
    // 검색어가 있으면 클리어 버튼 표시
    if (searchQuery) {
        clearBtn.classList.add('show');
    } else {
        clearBtn.classList.remove('show');
    }
    
    // 필터링된 커리큘럼 표시
    displayFilteredCurriculums();
}

// 검색 클리어
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.value = '';
    searchQuery = '';
    clearBtn.classList.remove('show');
    
    // 필터링된 커리큘럼 표시
    displayFilteredCurriculums();
}

// 필터링된 커리큘럼 표시
function displayFilteredCurriculums() {
    const container = document.getElementById('allCurriculums');
    const titleElement = document.getElementById('selectedCategoryTitle');
    
    container.innerHTML = '';
    updateFilterCounts();
    
    // 커리큘럼 데이터가 아직 로드되지 않았다면 대기
    if (!curriculumCategories || Object.keys(curriculumCategories).length === 0) {
        container.innerHTML = '<div class="empty-message"><p>커리큘럼을 불러오는 중...</p></div>';
        return;
    }
    
    let hasVisibleContent = false;
    let totalFilteredCount = 0;
    
    // 카테고리별로 커리큘럼을 그룹화하여 표시
    Object.keys(curriculumCategories).forEach(categoryKey => {
        const category = curriculumCategories[categoryKey];
        
        // 현재 필터와 검색 조건에 맞는 커리큘럼들 필터링
        let filteredCurriculums = category.curriculums || [];
        
        // 카테고리 필터 적용
        if (currentCategory !== 'all' && currentCategory !== categoryKey) {
            return; // 이 카테고리는 건너뜀
        }
        
        // 선택되지 않은 커리큘럼만 필터링
        filteredCurriculums = filteredCurriculums.filter(curriculum => 
            !selectedCurriculums.find(selected => selected.id === curriculum.id)
        );
        
        // 검색 필터 적용
        if (searchQuery) {
            filteredCurriculums = filteredCurriculums.filter(curriculum =>
                curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                curriculum.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        totalFilteredCount += filteredCurriculums.length;
        
        if (filteredCurriculums.length > 0) {
            hasVisibleContent = true;
            
            // 카테고리 헤더 생성 (전체 보기일 때만)
            if (currentCategory === 'all') {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.innerHTML = `<h3>${category.name} (${filteredCurriculums.length}개)</h3>`;
                container.appendChild(categoryHeader);
            }
            
            // 해당 카테고리의 커리큘럼들 표시
            filteredCurriculums.forEach(curriculum => {
                const curriculumElement = createCurriculumElement(curriculum, false);
                container.appendChild(curriculumElement);
            });
        }
    });
    
    // 제목 업데이트
    if (currentCategory === 'all') {
        titleElement.textContent = searchQuery ? 
            `검색 결과 (${totalFilteredCount}개)` : 
            `전체 커리큘럼 (${totalFilteredCount}개)`;
    } else {
        const categoryName = curriculumCategories[currentCategory]?.name || '카테고리';
        titleElement.textContent = searchQuery ? 
            `${categoryName} 검색 결과 (${totalFilteredCount}개)` :
            `${categoryName} (${totalFilteredCount}개)`;
    }
    
    // 검색 결과가 없을 때
    if (!hasVisibleContent) {
        if (searchQuery) {
            container.innerHTML = '<div class="empty-message"><p>검색 결과가 없습니다.</p><p>다른 키워드로 검색해보세요.</p></div>';
        } else {
            container.innerHTML = '<div class="empty-message"><p>선택할 수 있는 커리큘럼이 없습니다.</p><p>이미 모든 커리큘럼이 장바구니에 추가되었습니다.</p></div>';
        }
    }
}

// 필터 카운트 업데이트
function updateFilterCounts() {
    // 커리큘럼 데이터가 아직 로드되지 않았다면 0으로 설정
    if (!curriculumData || curriculumData.length === 0) {
        const allCountElement = document.getElementById('countAll');
        if (allCountElement) allCountElement.textContent = '0';
        
        // 모든 카테고리 카운트를 0으로 설정
        if (curriculumCategories) {
            Object.keys(curriculumCategories).forEach(categoryKey => {
                const countElement = getCategoryCountElement(categoryKey);
                if (countElement) countElement.textContent = '0';
            });
        }
        return;
    }
    
    // 전체 사용 가능한 커리큘럼 수
    const totalAvailable = curriculumData.filter(curriculum => 
        !selectedCurriculums.find(selected => selected.id === curriculum.id)
    ).length;
    const allCountElement = document.getElementById('countAll');
    if (allCountElement) allCountElement.textContent = totalAvailable;
    
    // 각 카테고리별 사용 가능한 커리큘럼 수
    if (curriculumCategories && Object.keys(curriculumCategories).length > 0) {
        Object.keys(curriculumCategories).forEach(categoryKey => {
            const category = curriculumCategories[categoryKey];
            const availableCount = (category.curriculums || []).filter(curriculum =>
                !selectedCurriculums.find(selected => selected.id === curriculum.id)
            ).length;
            
            const countElement = getCategoryCountElement(categoryKey);
            if (countElement) {
                countElement.textContent = availableCount;
            }
        });
    }
}

// 카테고리 카운트 엘리먼트 가져오기
function getCategoryCountElement(categoryKey) {
    let countId;
    if (categoryKey === 'general_office') {
        countId = 'countGeneral';
    } else if (categoryKey === 'marketing') {
        countId = 'countMarketing';
    } else if (categoryKey === 'design') {
        countId = 'countDesign';
    } else {
        // 새로운 카테고리의 경우 동적 ID 생성
        countId = `count${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())}`;
    }
    return document.getElementById(countId);
}

// 전체 커리큘럼 목록 표시 (기존 호환성을 위해 유지)
function displayAllCurriculums() {
    displayFilteredCurriculums();
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
    displayFilteredCurriculums();
    displaySelectedCurriculums();
    updateTotalTime();
    updateCompleteButton();
    updateFilterCounts();
    showMessage(`"${curriculum.title}" 커리큘럼이 추가되었습니다.`, 'success');
}

// 커리큘럼 제거
function removeCurriculum(id) {
    const curriculum = selectedCurriculums.find(item => item.id === id);
    selectedCurriculums = selectedCurriculums.filter(item => item.id !== id);
    displayFilteredCurriculums();
    displaySelectedCurriculums();
    updateTotalTime();
    updateCompleteButton();
    updateFilterCounts();
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
    
    // 입력 필드 검증 및 하이라이트
    const missingFields = [];
    const companyNameInput = document.getElementById('companyName');
    const instructorNameInput = document.getElementById('instructorName');
    const courseNameInput = document.getElementById('courseName');
    
    // 모든 필드의 오류 스타일 초기화
    companyNameInput.classList.remove('error');
    instructorNameInput.classList.remove('error');
    courseNameInput.classList.remove('error');
    
    if (!companyName) {
        missingFields.push('고객사명');
        companyNameInput.classList.add('error');
    }
    if (!instructorName) {
        missingFields.push('담당자');
        instructorNameInput.classList.add('error');
    }
    if (!courseName) {
        missingFields.push('교육명');
        courseNameInput.classList.add('error');
    }
    
    if (missingFields.length > 0) {
        showMessage(`다음 정보를 입력해주세요: ${missingFields.join(', ')}`, 'error');
        return;
    }
    
    if (selectedCurriculums.length === 0) {
        showMessage('선택된 커리큘럼이 없습니다.', 'error');
        return;
    }
    
    // 장바구니 확정 확인 대화상자
    const totalTime = selectedCurriculums.reduce((sum, curriculum) => sum + curriculum.duration, 0);
    const hours = Math.floor(totalTime / 60);
    const minutes = totalTime % 60;
    const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
    
    const confirmMessage = `장바구니를 확정하시겠습니까?

📋 고객사: ${companyName}
👤 담당자: ${instructorName}
🎯 교육명: ${courseName}
📚 선택된 커리큘럼: ${selectedCurriculums.length}개
⏰ 총 교육 시간: ${timeText}

확정하시면 데이터가 저장됩니다.`;
    
    if (!confirm(confirmMessage)) {
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
        
        // 새로운 데이터 구조로 변환하여 저장
        const curriculumBlocks = convertToLectureBlocks(selectedCurriculums);
        const newFormatData = {
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
            lectureBlocks: curriculumBlocks, // 새로운 구조
            timestamp: new Date().toISOString(),
            version: '2.0' // 새로운 데이터 형식 버전
        };
        
        // 로컬 스토리지에 저장
        let savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
        savedData.push(newFormatData);
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

// 커리큘럼을 강의 블록으로 변환
function convertToLectureBlocks(curriculums) {
    return curriculums.map((curriculum, index) => {
        // description을 문장 단위로 분할하여 상세 내용 배열 생성
        let details = [];
        
        // 마침표, 느낌표, 물음표 등으로 문장 분할
        const sentences = curriculum.description
            .split(/[.!?]/)
            .map(s => s.trim())
            .filter(s => s.length > 0);
        
        if (sentences.length > 1) {
            details = sentences.map(sentence => sentence + '.');
        } else {
            // 문장이 하나이거나 분할되지 않는 경우, 쉼표나 줄바꿈으로 분할 시도
            const parts = curriculum.description
                .split(/[,\n]/)
                .map(s => s.trim())
                .filter(s => s.length > 0);
            
            if (parts.length > 1) {
                details = parts;
            } else {
                // 분할할 수 없는 경우 전체를 하나의 항목으로
                details = [curriculum.description];
            }
        }
        
        return {
            blockId: index + 1,
            title: curriculum.title,
            duration: curriculum.duration,
            durationText: (() => {
                const hours = Math.floor(curriculum.duration / 60);
                const minutes = curriculum.duration % 60;
                if (hours > 0 && minutes > 0) {
                    return `${hours}h ${minutes}m`;
                } else if (hours > 0) {
                    return `${hours}h`;
                } else {
                    return `${minutes}m`;
                }
            })(),
            details: details,
            originalCurriculum: curriculum // 원본 데이터 보존
        };
    });
}

// 기존 데이터 마이그레이션
function migrateOldData() {
    const savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
    let migrationCount = 0;
    
    const migratedData = savedData.map(data => {
        // 이미 새로운 형식인지 확인
        if (data.version === '2.0' || data.lectureBlocks) {
            return data;
        }
        
        // 구 형식 데이터를 새 형식으로 변환
        migrationCount++;
        const curriculumBlocks = convertToLectureBlocks(data.curriculums || []);
        
        return {
            ...data,
            lectureBlocks: curriculumBlocks,
            version: '2.0',
            migrated: true,
            migrationDate: new Date().toISOString()
        };
    });
    
    if (migrationCount > 0) {
        localStorage.setItem('savedCurriculums', JSON.stringify(migratedData));
        console.log(`${migrationCount}개의 데이터가 새 형식으로 마이그레이션되었습니다.`);
    }
    
    return migrationCount;
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