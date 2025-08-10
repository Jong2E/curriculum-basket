// 관리자 페이지 JavaScript
// DOMContentLoaded는 admin-auth.js에서 처리하므로 제거

// 필터링 상태
let currentFilter = 'all';
let searchQuery = '';

// 이벤트 리스너 설정
function setupEventListeners() {
    // 새 커리큘럼 추가 폼
    document.getElementById('addCurriculumForm').addEventListener('submit', handleAddCurriculum);
    
    // 새 카테고리 추가 폼
    document.getElementById('addCategoryForm').addEventListener('submit', handleAddCategory);
    
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
    
    // 검색 기능
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    
    if (searchInput) searchInput.addEventListener('input', handleSearch);
    if (clearBtn) clearBtn.addEventListener('click', clearSearch);
    
    // 초기화
    generateAdminFilterButtons();
    displayCategoryList();
    displayCurriculumList(); // 커리큘럼 목록도 초기 표시
    updateCurriculumCategorySelect();
}

// 커리큘럼 목록 표시 (필터링 및 검색 적용)
function displayCurriculumList() {
    const listContainer = document.getElementById('curriculumList');
    if (!listContainer) {
        console.error('curriculumList 컨테이너를 찾을 수 없습니다.');
        return;
    }
    
    listContainer.innerHTML = '';
    
    // 커리큘럼 데이터가 아직 로드되지 않았다면 대기
    if (!curriculumCategories || Object.keys(curriculumCategories).length === 0) {
        console.error('curriculumCategories가 정의되지 않았거나 비어있습니다:', curriculumCategories);
        listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">커리큘럼을 불러오는 중...</p>';
        return;
    }
    
    updateFilterCounts();
    
    // 전체 커리큘럼 개수 확인
    let totalCurriculums = 0;
    Object.keys(curriculumCategories).forEach(categoryKey => {
        const category = curriculumCategories[categoryKey];
        totalCurriculums += (category.curriculums || []).length;
    });
    
    if (totalCurriculums === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">등록된 커리큘럼이 없습니다.</p>';
        return;
    }
    
    let hasVisibleContent = false;
    
    // 카테고리별로 커리큘럼을 그룹화하여 표시
    Object.keys(curriculumCategories).forEach(categoryKey => {
        const category = curriculumCategories[categoryKey];
        
        // 현재 필터와 검색 조건에 맞는 커리큘럼들 필터링
        let filteredCurriculums = category.curriculums || [];
        
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
    // 클릭된 요소가 버튼 내부 요소일 수 있으므로 가장 가까운 .filter-btn을 찾기
    const button = event.target.closest('.filter-btn');
    if (!button) return;
    
    const category = button.dataset.category;
    if (!category) return;
    
    currentFilter = category;
    
    // 모든 필터 버튼에서 active 클래스 제거
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 선택된 버튼에 active 클래스 추가
    button.classList.add('active');
    
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
    // 커리큘럼 데이터가 아직 로드되지 않았다면 0으로 설정
    if (!curriculumCategories || Object.keys(curriculumCategories).length === 0) {
        const allCountElement = document.getElementById('countAll');
        if (allCountElement) allCountElement.textContent = '0';
        return;
    }
    
    // 전체 커리큘럼 수 계산
    let totalCount = 0;
    
    Object.keys(curriculumCategories).forEach(categoryKey => {
        const category = curriculumCategories[categoryKey];
        const categoryCount = (category.curriculums || []).length;
        totalCount += categoryCount;
        
        // 각 카테고리별 카운트 업데이트
        const countElement = getAdminCategoryCountElement(categoryKey);
        if (countElement) {
            countElement.textContent = categoryCount;
        }
    });
    
    const allCountElement = document.getElementById('countAll');
    if (allCountElement) {
        allCountElement.textContent = totalCount;
    }
}

// 관리자 페이지용 카테고리 카운트 엘리먼트 가져오기
function getAdminCategoryCountElement(categoryKey) {
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

// 관리자 페이지 필터 버튼 생성
function generateAdminFilterButtons() {
    const filterButtons = document.querySelector('.filter-buttons');
    if (!filterButtons) return;
    
    // 기존 버튼들 제거
    filterButtons.innerHTML = '';
    
    // 전체 보기 버튼
    const allBtn = document.createElement('button');
    allBtn.className = 'filter-btn active';
    allBtn.dataset.category = 'all';
    allBtn.innerHTML = '전체 보기 <span class="count" id="countAll">0</span>';
    filterButtons.appendChild(allBtn);
    
    // 카테고리별 버튼들 생성
    if (curriculumCategories && Object.keys(curriculumCategories).length > 0) {
        Object.keys(curriculumCategories).forEach(categoryKey => {
            const category = curriculumCategories[categoryKey];
            const btn = document.createElement('button');
            btn.className = 'filter-btn';
            btn.dataset.category = categoryKey;
            
            // 카운트 ID 생성
            let countId;
            if (categoryKey === 'general_office') {
                countId = 'countGeneral';
            } else if (categoryKey === 'marketing') {
                countId = 'countMarketing';
            } else if (categoryKey === 'design') {
                countId = 'countDesign';
            } else {
                countId = `count${categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).replace(/_([a-z])/g, (match, letter) => letter.toUpperCase())}`;
            }
            
            btn.innerHTML = `${category.name} <span class="count" id="${countId}">0</span>`;
            filterButtons.appendChild(btn);
        });
    }
    
    // 이벤트 리스너 다시 추가
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', handleFilterChange);
    });
    
    updateFilterCounts();
}

// 카테고리 추가 처리
function handleAddCategory(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const categoryKey = formData.get('categoryKey').trim().toLowerCase();
    const categoryName = formData.get('categoryName').trim();
    const categoryDescription = formData.get('categoryDescription').trim();
    const categoryIcon = formData.get('categoryIcon');
    
    if (!categoryKey || !categoryName || !categoryDescription || !categoryIcon) {
        showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    try {
        addCategory(categoryKey, categoryName, categoryDescription, categoryIcon);
        generateAdminFilterButtons(); // 필터 버튼 재생성
        displayCategoryList();
        updateCurriculumCategorySelect();
        event.target.reset();
        showMessage('카테고리가 성공적으로 추가되었습니다.', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
        console.error('Error adding category:', error);
    }
}

// 카테고리 목록 표시
function displayCategoryList() {
    const listContainer = document.getElementById('categoryList');
    listContainer.innerHTML = '';
    
    const categories = getCategoryListForAdmin();
    
    if (categories.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">등록된 카테고리가 없습니다.</p>';
        return;
    }
    
    categories.forEach(category => {
        const categoryElement = createCategoryElement(category);
        listContainer.appendChild(categoryElement);
    });
}

// 카테고리 요소 생성
function createCategoryElement(category) {
    const div = document.createElement('div');
    div.className = 'category-item';
    div.innerHTML = `
        <div class="category-details">
            <div class="category-icon">${category.icon}</div>
            <div class="category-info">
                <h4>${category.name}</h4>
                <div class="category-key">${category.key}</div>
                <p class="category-desc">${category.description}</p>
            </div>
        </div>
        <div class="category-stats">
            <span class="curriculum-count">${category.count}</span>
            <div class="count-label">커리큘럼</div>
        </div>
        <div class="category-actions">
            <button class="edit-category-btn" onclick="editCategory('${category.key}')">수정</button>
            ${!category.isProtected ? 
                `<button class="delete-category-btn" onclick="deleteCategoryItem('${category.key}')">삭제</button>` : 
                '<span style="color: #6c757d; font-size: 0.8rem;">보호된 카테고리</span>'
            }
        </div>
    `;
    return div;
}

// 커리큘럼 카테고리 선택 옵션 업데이트
function updateCurriculumCategorySelect() {
    const categorySelect = document.getElementById('category');
    categorySelect.innerHTML = '';
    
    const categories = getCategoryListForAdmin();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.key;
        option.textContent = `${category.icon} ${category.name}`;
        categorySelect.appendChild(option);
    });
}

// 카테고리 수정 (간단한 구현)
function editCategory(categoryKey) {
    const category = curriculumCategories[categoryKey];
    if (!category) {
        showMessage('카테고리를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const newName = prompt('카테고리 이름을 입력하세요:', category.name);
    if (!newName || newName.trim() === '') return;
    
    const newDescription = prompt('카테고리 설명을 입력하세요:', category.description);
    if (!newDescription || newDescription.trim() === '') return;
    
    const newIcon = prompt('카테고리 아이콘을 입력하세요:', category.icon);
    if (!newIcon || newIcon.trim() === '') return;
    
    try {
        updateCategory(categoryKey, newName.trim(), newDescription.trim(), newIcon.trim());
        generateAdminFilterButtons(); // 필터 버튼 재생성
        displayCategoryList();
        updateCurriculumCategorySelect();
        showMessage('카테고리가 성공적으로 수정되었습니다.', 'success');
    } catch (error) {
        showMessage(error.message, 'error');
        console.error('Error updating category:', error);
    }
}

// 카테고리 삭제
function deleteCategoryItem(categoryKey) {
    const category = curriculumCategories[categoryKey];
    if (!category) {
        showMessage('카테고리를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const curriculumCount = category.curriculums.length;
    let confirmMessage = `"${category.name}" 카테고리를 정말 삭제하시겠습니까?`;
    
    if (curriculumCount > 0) {
        confirmMessage += `\n\n이 카테고리에는 ${curriculumCount}개의 커리큘럼이 있습니다.\n삭제 시 해당 커리큘럼들은 '일반 사무 업무' 카테고리로 이동됩니다.`;
    }
    
    if (confirm(confirmMessage)) {
        try {
            const result = deleteCategory(categoryKey);
            generateAdminFilterButtons(); // 필터 버튼 재생성
            displayCategoryList();
            updateCurriculumCategorySelect();
            displayCurriculumList();
            
            if (result.movedCurriculums > 0) {
                showMessage(`카테고리가 삭제되었습니다. ${result.movedCurriculums}개의 커리큘럼이 '일반 사무 업무'로 이동되었습니다.`, 'success');
            } else {
                showMessage('카테고리가 성공적으로 삭제되었습니다.', 'success');
            }
        } catch (error) {
            showMessage(error.message, 'error');
            console.error('Error deleting category:', error);
        }
    }
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