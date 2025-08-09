// 관리자 페이지 JavaScript
// DOMContentLoaded는 admin-auth.js에서 처리하므로 제거

// 필터링 상태
let currentFilter = 'all';
let searchQuery = '';

// 이벤트 리스너 설정
function setupEventListeners() {
    // 새 커리큘럼 추가 폼
    document.getElementById('addCurriculumForm').addEventListener('submit', handleAddCurriculum);
    
    // 커리큘럼 수정 폼
    document.getElementById('editCurriculumForm').addEventListener('submit', handleEditCurriculum);
    
    // 모달 닫기
    document.querySelector('.close').addEventListener('click', closeModal);
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('editModal');
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // 필터 버튼들
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    // 검색 기능
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.addEventListener('input', handleSearch);
    clearBtn.addEventListener('click', clearSearch);
}

// 커리큘럼 목록 표시 (필터링 및 검색 적용)
function displayCurriculumList() {
    const listContainer = document.getElementById('curriculumList');
    listContainer.innerHTML = '';
    
    updateFilterCounts();
    
    if (curriculumData.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">등록된 커리큘럼이 없습니다.</p>';
        return;
    }
    
    let hasVisibleContent = false;
    
    // 카테고리별로 커리큘럼을 그룹화하여 표시
    Object.keys(curriculumCategories).forEach(categoryKey => {
        const category = curriculumCategories[categoryKey];
        
        // 현재 필터와 검색 조건에 맞는 커리큘럼들 필터링
        let filteredCurriculums = category.curriculums;
        
        // 카테고리 필터 적용
        if (currentFilter !== 'all' && currentFilter !== categoryKey) {
            return; // 이 카테고리는 건너뜀
        }
        
        // 검색 필터 적용
        if (searchQuery) {
            filteredCurriculums = filteredCurriculums.filter(curriculum =>
                curriculum.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                curriculum.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }
        
        if (filteredCurriculums.length > 0) {
            hasVisibleContent = true;
            
            // 카테고리 헤더 생성 (전체 보기일 때만)
            if (currentFilter === 'all') {
                const categoryHeader = document.createElement('div');
                categoryHeader.className = 'category-header';
                categoryHeader.innerHTML = `<h3>${category.name} (${filteredCurriculums.length}개)</h3>`;
                listContainer.appendChild(categoryHeader);
            }
            
            // 해당 카테고리의 커리큘럼들 표시
            filteredCurriculums.forEach(curriculum => {
                const curriculumElement = createCurriculumElement(curriculum);
                listContainer.appendChild(curriculumElement);
            });
        }
    });
    
    // 검색 결과가 없을 때
    if (!hasVisibleContent) {
        if (searchQuery) {
            listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">검색 결과가 없습니다.</p>';
        } else {
            listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">선택한 카테고리에 커리큘럼이 없습니다.</p>';
        }
    }
}

// 커리큘럼 요소 생성
function createCurriculumElement(curriculum) {
    const div = document.createElement('div');
    div.className = 'curriculum-item-admin';
    div.innerHTML = `
        <div class="curriculum-details">
            <h3>${curriculum.title}</h3>
            <div class="duration">${curriculum.duration}분</div>
            <div class="description">${curriculum.description}</div>
        </div>
        <div class="curriculum-actions">
            <button class="edit-btn" onclick="openEditModal(${curriculum.id})">수정</button>
            <button class="delete-btn" onclick="deleteCurriculumItem(${curriculum.id})">삭제</button>
        </div>
    `;
    return div;
}

// 새 커리큘럼 추가 처리
function handleAddCurriculum(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const category = formData.get('category');
    const title = formData.get('title').trim();
    const description = formData.get('description').trim();
    const duration = formData.get('duration');
    
    if (!title || !description || !duration) {
        showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    // 시간 유효성 검사
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 600) {
        showMessage('소요 시간은 1분 이상 600분 이하로 입력해주세요.', 'error');
        return;
    }
    
    try {
        addCurriculum(category, title, description, duration);
        displayCurriculumList();
        event.target.reset();
        showMessage('커리큘럼이 성공적으로 추가되었습니다.', 'success');
    } catch (error) {
        showMessage('커리큘럼 추가 중 오류가 발생했습니다.', 'error');
        console.error('Error adding curriculum:', error);
    }
}

// 수정 모달 열기
function openEditModal(id) {
    const curriculum = curriculumData.find(item => item.id === id);
    if (!curriculum) {
        showMessage('커리큘럼을 찾을 수 없습니다.', 'error');
        return;
    }
    
    document.getElementById('editId').value = curriculum.id;
    document.getElementById('editTitle').value = curriculum.title;
    document.getElementById('editDescription').value = curriculum.description;
    document.getElementById('editDuration').value = curriculum.duration;
    
    document.getElementById('editModal').style.display = 'block';
}

// 커리큘럼 수정 처리
function handleEditCurriculum(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const id = formData.get('id');
    const title = formData.get('title').trim();
    const description = formData.get('description').trim();
    const duration = formData.get('duration');
    
    if (!title || !description || !duration) {
        showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    // 시간 유효성 검사
    const durationNum = parseInt(duration);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 600) {
        showMessage('소요 시간은 1분 이상 600분 이하로 입력해주세요.', 'error');
        return;
    }
    
    try {
        const updated = updateCurriculum(id, title, description, duration);
        if (updated) {
            displayCurriculumList();
            closeModal();
            showMessage('커리큘럼이 성공적으로 수정되었습니다.', 'success');
        } else {
            showMessage('커리큘럼 수정에 실패했습니다.', 'error');
        }
    } catch (error) {
        showMessage('커리큘럼 수정 중 오류가 발생했습니다.', 'error');
        console.error('Error updating curriculum:', error);
    }
}

// 커리큘럼 삭제
function deleteCurriculumItem(id) {
    const curriculum = curriculumData.find(item => item.id === id);
    if (!curriculum) {
        showMessage('커리큘럼을 찾을 수 없습니다.', 'error');
        return;
    }
    
    if (confirm(`"${curriculum.title}" 커리큘럼을 정말 삭제하시겠습니까?`)) {
        try {
            const deleted = deleteCurriculum(id);
            if (deleted) {
                displayCurriculumList();
                showMessage('커리큘럼이 성공적으로 삭제되었습니다.', 'success');
            } else {
                showMessage('커리큘럼 삭제에 실패했습니다.', 'error');
            }
        } catch (error) {
            showMessage('커리큘럼 삭제 중 오류가 발생했습니다.', 'error');
            console.error('Error deleting curriculum:', error);
        }
    }
}

// 모달 닫기
function closeModal() {
    document.getElementById('editModal').style.display = 'none';
}

// 필터 변경 처리
function handleFilterChange(event) {
    const category = event.target.dataset.category;
    currentFilter = category;
    
    // 모든 필터 버튼에서 active 클래스 제거
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 버튼에 active 클래스 추가
    event.target.classList.add('active');
    
    // 목록 다시 표시
    displayCurriculumList();
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
    
    // 목록 다시 표시
    displayCurriculumList();
}

// 검색 클리어
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    searchInput.value = '';
    searchQuery = '';
    clearBtn.classList.remove('show');
    
    // 목록 다시 표시
    displayCurriculumList();
}

// 필터 카운트 업데이트
function updateFilterCounts() {
    const totalCount = curriculumData.length;
    document.getElementById('countAll').textContent = totalCount;
    
    // 각 카테고리별 카운트
    Object.keys(curriculumCategories).forEach(categoryKey => {
        const category = curriculumCategories[categoryKey];
        const countElement = document.getElementById(`count${categoryKey === 'general_office' ? 'General' : 
                                                            categoryKey === 'marketing' ? 'Marketing' : 'Design'}`);
        if (countElement) {
            countElement.textContent = category.curriculums.length;
        }
    });
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