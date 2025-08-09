// 설정 페이지 JavaScript
// DOMContentLoaded는 admin-auth.js에서 처리하므로 제거 (관리자 인증 필요)

// 이벤트 리스너 설정
function setupEventListeners() {
    // 구글 스프레드시트 설정 폼
    document.getElementById('googleSheetsConfigForm').addEventListener('submit', handleSaveSettings);
    
    // 데이터 관리 버튼들
    document.getElementById('viewDataBtn').addEventListener('click', displaySavedData);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
}

// 현재 설정 로드
function loadCurrentSettings() {
    const saved = localStorage.getItem('googleSheetsConfig');
    if (saved) {
        const config = JSON.parse(saved);
        document.getElementById('apiKey').value = config.apiKey || '';
        document.getElementById('clientId').value = config.clientId || '';
        document.getElementById('spreadsheetId').value = config.spreadsheetId || '';
    }
}

// 설정 저장 처리
function handleSaveSettings(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const apiKey = formData.get('apiKey').trim();
    const clientId = formData.get('clientId').trim();
    const spreadsheetId = formData.get('spreadsheetId').trim();
    
    if (!apiKey || !clientId || !spreadsheetId) {
        showMessage('모든 필드를 입력해주세요.', 'error');
        return;
    }
    
    // 스프레드시트 ID 유효성 검사 (간단한 형태 확인)
    const spreadsheetIdPattern = /^[a-zA-Z0-9-_]{44}$/;
    if (!spreadsheetIdPattern.test(spreadsheetId)) {
        showMessage('스프레드시트 ID 형식이 올바르지 않습니다.', 'error');
        return;
    }
    
    try {
        // 설정 저장
        const config = { apiKey, clientId, spreadsheetId };
        localStorage.setItem('googleSheetsConfig', JSON.stringify(config));
        
        // 전역 변수 업데이트 (google-sheets.js의 변수들)
        if (typeof setGoogleSheetsConfig === 'function') {
            setGoogleSheetsConfig(apiKey, clientId, spreadsheetId);
        }
        
        showMessage('구글 스프레드시트 설정이 저장되었습니다.', 'success');
    } catch (error) {
        console.error('설정 저장 오류:', error);
        showMessage('설정 저장 중 오류가 발생했습니다.', 'error');
    }
}

// 저장된 데이터 표시
function displaySavedData() {
    const savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
    const display = document.getElementById('savedDataDisplay');
    const list = document.getElementById('savedDataList');
    
    if (savedData.length === 0) {
        list.innerHTML = '<p style="text-align: center; color: #7f8c8d; padding: 20px;">저장된 데이터가 없습니다.</p>';
    } else {
        list.innerHTML = '';
        savedData.forEach((data, index) => {
            const item = createSavedDataElement(data, index);
            list.appendChild(item);
        });
    }
    
    display.style.display = 'block';
    document.getElementById('viewDataBtn').textContent = '데이터 숨기기';
    document.getElementById('viewDataBtn').onclick = hideSavedData;
}

// 저장된 데이터 숨기기
function hideSavedData() {
    document.getElementById('savedDataDisplay').style.display = 'none';
    document.getElementById('viewDataBtn').textContent = '저장된 데이터 보기';
    document.getElementById('viewDataBtn').onclick = displaySavedData;
}

// 저장된 데이터 요소 생성
function createSavedDataElement(data, index) {
    const div = document.createElement('div');
    div.className = 'saved-data-item';
    
    const curriculumList = data.curriculums.map((curriculum, i) => {
        const hours = Math.floor(curriculum.duration / 60);
        const minutes = curriculum.duration % 60;
        const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
        return `${i + 1}. ${curriculum.title} (${timeText})`;
    }).join('\\n');
    
    div.innerHTML = `
        <h4>${data.companyName} - ${data.courseName}</h4>
        <div class="meta">
            <strong>담당자:</strong> ${data.instructor} | 
            <strong>총 시간:</strong> ${data.totalTime || (() => {
                const totalMinutes = data.totalMinutes || data.totalHours || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
            })()} | 
            <strong>날짜:</strong> ${data.date}
        </div>
        <div class="curriculums">
            <strong>커리큘럼:</strong>
${curriculumList}
        </div>
    `;
    
    return div;
}

// 데이터 내보내기 (CSV 형식)
function exportData() {
    const savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
    
    if (savedData.length === 0) {
        showMessage('내보낼 데이터가 없습니다.', 'error');
        return;
    }
    
    try {
        // CSV 헤더
        let csv = '고객사명,교육명,총 시간,날짜,담당자,커리큘럼 상세\\n';
        
        // 데이터 행들
        savedData.forEach(data => {
            const curriculumDetails = data.curriculums.map(curriculum => {
                const hours = Math.floor(curriculum.duration / 60);
                const minutes = curriculum.duration % 60;
                const timeText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
                return `${curriculum.title} (${timeText}) - ${curriculum.description}`;
            }).join(' | ');
            
            const totalTime = data.totalTime || (() => {
                const totalMinutes = data.totalMinutes || data.totalHours || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
            })();
            
            csv += `"${data.companyName}","${data.courseName}","${totalTime}","${data.date}","${data.instructor}","${curriculumDetails}"\\n`;
        });
        
        // 파일 다운로드
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `curriculum_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showMessage('데이터가 CSV 파일로 내보내기되었습니다.', 'success');
    } catch (error) {
        console.error('데이터 내보내기 오류:', error);
        showMessage('데이터 내보내기 중 오류가 발생했습니다.', 'error');
    }
}

// 모든 데이터 삭제
function clearAllData() {
    if (confirm('정말로 모든 저장된 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
        try {
            localStorage.removeItem('savedCurriculums');
            showMessage('모든 데이터가 삭제되었습니다.', 'success');
            
            // 데이터 표시가 열려있다면 업데이트
            if (document.getElementById('savedDataDisplay').style.display !== 'none') {
                displaySavedData();
            }
        } catch (error) {
            console.error('데이터 삭제 오류:', error);
            showMessage('데이터 삭제 중 오류가 발생했습니다.', 'error');
        }
    }
}

// 메시지 표시 (다른 파일과 동일한 함수)
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