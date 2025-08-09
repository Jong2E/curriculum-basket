// 관리자 페이지 JavaScript
// DOMContentLoaded는 admin-auth.js에서 처리하므로 제거

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
}

// 커리큘럼 목록 표시
function displayCurriculumList() {
    const listContainer = document.getElementById('curriculumList');
    listContainer.innerHTML = '';
    
    if (curriculumData.length === 0) {
        listContainer.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 40px;">등록된 커리큘럼이 없습니다.</p>';
        return;
    }
    
    curriculumData.forEach(curriculum => {
        const curriculumElement = createCurriculumElement(curriculum);
        listContainer.appendChild(curriculumElement);
    });
}

// 커리큘럼 요소 생성
function createCurriculumElement(curriculum) {
    const div = document.createElement('div');
    div.className = 'curriculum-item-admin';
    div.innerHTML = `
        <div class="curriculum-details">
            <h3>${curriculum.title}</h3>
            <div class="duration">${(() => {
                const hours = Math.floor(curriculum.duration / 60);
                const minutes = curriculum.duration % 60;
                return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
            })()}</div>
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
    const title = formData.get('title').trim();
    const description = formData.get('description').trim();
    const duration = formData.get('duration');
    
    if (!title || !description || !duration) {
        showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    try {
        addCurriculum(title, description, duration);
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