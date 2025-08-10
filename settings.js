// 설정 페이지 JavaScript
// DOMContentLoaded는 admin-auth.js에서 처리하므로 제거 (관리자 인증 필요)

// 이벤트 리스너 설정
function setupEventListeners() {
    // 구글 스프레드시트 설정 폼
    document.getElementById('googleSheetsConfigForm').addEventListener('submit', handleSaveSettings);
    
    // 데이터 관리 버튼들
    document.getElementById('viewDataBtn').addEventListener('click', displaySavedData);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('exportSelectedBtn').addEventListener('click', exportSelectedData);
    document.getElementById('clearDataBtn').addEventListener('click', clearAllData);
    
    // 선택 관리 버튼들
    document.getElementById('selectAllBtn').addEventListener('click', selectAllData);
    document.getElementById('selectNoneBtn').addEventListener('click', selectNoneData);
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
    div.dataset.index = index;
    
    // 새로운 구조 또는 기존 구조 처리
    let curriculumList;
    let dataFormat = '구 형식';
    
    if (data.lectureBlocks && data.version === '2.0') {
        // 새로운 강의 블록 형식
        dataFormat = '강의 블록 형식';
        curriculumList = data.lectureBlocks.map((block, i) => {
            const detailsText = block.details.length > 1 
                ? `\n  └ ${block.details.join('\n  └ ')}` 
                : `\n  └ ${block.details[0]}`;
            return `${block.blockId}. ${block.title} (${block.durationText})${detailsText}`;
        }).join('\n');
    } else {
        // 기존 형식 (하위 호환성)
        const curriculums = data.curriculums || [];
        curriculumList = curriculums.map((curriculum, i) => 
            `${i + 1}. ${curriculum.title} (${curriculum.duration}분)`
        ).join('\n');
    }
    
    const totalTime = data.totalTime || (() => {
        const totalMinutes = data.totalMinutes || data.totalHours || 0;
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
    })();
    
    div.innerHTML = `
        <div class="saved-data-header">
            <div class="saved-data-select">
                <input type="checkbox" id="select-${index}" class="data-select-checkbox">
                <label for="select-${index}">
                    <h4>${data.companyName} - ${data.courseName} <span style="color: #17a2b8; font-size: 0.8rem;">[${dataFormat}]</span></h4>
                </label>
            </div>
            <div class="saved-data-actions">
                <button onclick="exportSingleData(${index})" class="export-single-btn">이 데이터만 내보내기</button>
                <button onclick="deleteSingleData(${index})" class="delete-single-btn">삭제</button>
            </div>
        </div>
        <div class="meta">
            <strong>담당자:</strong> ${data.instructor} | 
            <strong>총 시간:</strong> ${totalTime} | 
            <strong>날짜:</strong> ${data.date}
            ${data.migrated ? ' | <span style="color: #28a745; font-size: 0.8rem;">✓ 마이그레이션 완료</span>' : ''}
        </div>
        <div class="curriculums">
            <strong>커리큘럼 구성:</strong>
<pre style="white-space: pre-wrap; font-family: inherit; margin: 8px 0;">${curriculumList}</pre>
        </div>
    `;
    
    return div;
}

// 선택된 데이터만 내보내기
function exportSelectedData() {
    const selectedCheckboxes = document.querySelectorAll('.data-select-checkbox:checked');
    if (selectedCheckboxes.length === 0) {
        showMessage('내보낼 데이터를 선택해주세요.', 'error');
        return;
    }
    
    const savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
    const selectedIndices = Array.from(selectedCheckboxes).map(cb => parseInt(cb.id.replace('select-', '')));
    const selectedData = selectedIndices.map(index => savedData[index]).filter(Boolean);
    
    exportDataToCSV(selectedData, true);
}

// 단일 데이터 내보내기
function exportSingleData(index) {
    const savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
    if (!savedData[index]) {
        showMessage('선택한 데이터를 찾을 수 없습니다.', 'error');
        return;
    }
    
    exportDataToCSV([savedData[index]], false);
}

// 모든 데이터 내보내기 (기존 exportData 함수 수정)
function exportData() {
    const savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
    
    if (savedData.length === 0) {
        showMessage('내보낼 데이터가 없습니다.', 'error');
        return;
    }
    
    exportDataToCSV(savedData, true);
}

// 실제 CSV 생성 및 다운로드 함수
function exportDataToCSV(dataArray, isMultiple) {
    try {
        let csv = '';
        
        // 각 저장된 데이터별로 커리큘럼 표 생성
        dataArray.forEach((data, index) => {
            if (index > 0) csv += '\n\n\n'; // 데이터 간 구분 (실제 줄바꿈)
            
            const totalTime = data.totalTime || (() => {
                const totalMinutes = data.totalMinutes || data.totalHours || 0;
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
            })();
            
            const daysText = data.days ? ` - ${data.days}` : '';
            
            // A1~E1: 제목 행 - 올바른 병합 형태
            csv += `"${data.companyName} 교육 커리큘럼 (${totalTime})${daysText}","","","음영 표기는 실습 진행 항목입니다","본 커리큘럼은 일부 변동될 수 있습니다"\n`;
            
            // 2행: 빈 행
            csv += `"","","","",""\n`;
            
            // 3행: 테이블 헤더 (A3~D3)
            csv += `"번호","강의 제목","상세 내용","시간",""\n`;
            
            // 새로운 구조 사용 (lectureBlocks가 있는 경우) 또는 기존 구조 변환
            let lectureBlocks;
            if (data.lectureBlocks && data.version === '2.0') {
                lectureBlocks = data.lectureBlocks;
            } else {
                // 구 형식 데이터를 즉석에서 변환
                lectureBlocks = convertToLectureBlocks(data.curriculums || []);
            }
            
            // CSV에서 쌍따옴표 이스케이프 처리 함수
            const escapeCsv = (str) => String(str || '').replace(/"/g, '""');
            
            // 강의 블록별로 데이터 처리
            lectureBlocks.forEach((block) => {
                const details = block.details || [block.originalCurriculum?.description || ''];
                
                // 각 상세 내용 줄별로 처리
                details.forEach((detail, detailIndex) => {
                    if (detailIndex === 0) {
                        // 첫 번째 줄: 번호, 제목, 상세내용, 시간 모두 표시
                        csv += `"${block.blockId}","${escapeCsv(block.title)}","${escapeCsv(detail)}","${block.durationText}",""\n`;
                    } else {
                        // 나머지 줄: 상세내용만 표시 (셀 병합 효과)
                        csv += `"","","${escapeCsv(detail)}","",""\n`;
                    }
                });
            });
            
            // 하단 정보 (빈 줄 후)
            csv += `"","","","",""\n`; // 빈 줄
            csv += `"교육일자: ${data.date}","","","",""\n`;
            csv += `"담당자: ${data.instructor}","","","",""\n`;
        });
        
        // UTF-8 BOM 추가 (한글 깨짐 방지)
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csv;
        
        // 파일명 생성
        const fileName = isMultiple 
            ? `커리큘럼표_${dataArray.length}개_${new Date().toISOString().split('T')[0]}.csv`
            : `커리큘럼표_${dataArray[0].companyName}_${new Date().toISOString().split('T')[0]}.csv`;
        
        // 파일 다운로드
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        const message = isMultiple 
            ? `${dataArray.length}개의 커리큘럼표 CSV 파일이 생성되었습니다.`
            : '커리큘럼표 CSV 파일이 생성되었습니다.';
        showMessage(message, 'success');
    } catch (error) {
        console.error('데이터 내보내기 오류:', error);
        showMessage('데이터 내보내기 중 오류가 발생했습니다.', 'error');
    }
}

// 설정 페이지에서도 사용할 수 있도록 변환 함수 복사
function convertToLectureBlocks(curriculums) {
    if (!curriculums || !Array.isArray(curriculums)) {
        return [];
    }
    
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

// 단일 데이터 삭제
function deleteSingleData(index) {
    const savedData = JSON.parse(localStorage.getItem('savedCurriculums') || '[]');
    if (!savedData[index]) {
        showMessage('선택한 데이터를 찾을 수 없습니다.', 'error');
        return;
    }
    
    const dataInfo = `${savedData[index].companyName} - ${savedData[index].courseName}`;
    if (confirm(`'${dataInfo}' 데이터를 삭제하시겠습니까?`)) {
        try {
            savedData.splice(index, 1);
            localStorage.setItem('savedCurriculums', JSON.stringify(savedData));
            showMessage('데이터가 삭제되었습니다.', 'success');
            
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

// 전체 선택
function selectAllData() {
    document.querySelectorAll('.data-select-checkbox').forEach(checkbox => {
        checkbox.checked = true;
    });
}

// 선택 해제
function selectNoneData() {
    document.querySelectorAll('.data-select-checkbox').forEach(checkbox => {
        checkbox.checked = false;
    });
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