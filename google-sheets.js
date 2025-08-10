// 구글 스프레드시트 API 연동
const DISCOVERY_DOC = 'https://sheets.googleapis.com/$discovery/rest?version=v4';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// API 키와 스프레드시트 ID (실제 사용 시 환경변수로 관리)
let API_KEY = '';
let CLIENT_ID = '';
let SPREADSHEET_ID = '';

let tokenClient;
let gapi_inited = false;
let gis_inited = false;

// GAPI 초기화
async function initializeGapi() {
    await gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapi_inited = true;
    maybeEnableButtons();
}

// GIS 초기화
function initializeGis() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // 나중에 정의
    });
    gis_inited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapi_inited && gis_inited) {
        // API 준비 완료
        console.log('Google Sheets API 준비 완료');
    }
}

// 구글 인증 처리
function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        await sendToGoogleSheets();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

// 스프레드시트에 데이터 전송 (새 구조)
async function sendToGoogleSheets() {
    const companyName = document.getElementById('companyName').value.trim();
    const instructorName = document.getElementById('instructorName').value.trim();
    const courseName = document.getElementById('courseName').value.trim();
    const days = document.getElementById('days') ? document.getElementById('days').value.trim() : '';
    
    if (!companyName || !instructorName || !courseName || selectedCurriculums.length === 0) {
        showMessage('필요한 정보가 모두 입력되지 않았습니다.', 'error');
        return false;
    }
    
    try {
        // 빈 시트 찾기 (새 시트에 작성)
        const sheetName = await findOrCreateSheet();
        
        // 헤더 및 기본 정보 생성
        const headerData = await createHeaderData(companyName, courseName, days);
        
        // 커리큘럼 데이터 생성
        const curriculumData = await createCurriculumData();
        
        // 모든 데이터를 하나의 배치 업데이트로 처리
        const requests = [];
        
        // 헤더 데이터 입력
        requests.push({
            range: `${sheetName}!A1:E3`,
            values: headerData
        });
        
        // 커리큘럼 데이터 입력
        requests.push({
            range: `${sheetName}!A4:D${3 + curriculumData.length}`,
            values: curriculumData
        });
        
        // 배치 업데이트 실행
        const result = await gapi.client.sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                valueInputOption: 'USER_ENTERED',
                data: requests
            }
        });
        
        // 셀 병합 및 스타일 적용
        await applyFormattingAndMerging(sheetName, curriculumData);
        
        console.log('데이터 전송 성공:', result);
        showMessage('데이터가 구글 스프레드시트에 성공적으로 저장되었습니다!', 'success');
        
        // 성공 시 폼 초기화
        setTimeout(() => {
            if (typeof resetForm === 'function') {
                resetForm();
            }
        }, 2000);
        
        return true;
        
    } catch (err) {
        console.error('스프레드시트 전송 오류:', err);
        showMessage('데이터 전송 중 오류가 발생했습니다: ' + err.message, 'error');
        return false;
    }
}

// 새 시트 찾기 또는 생성
async function findOrCreateSheet() {
    try {
        // 스프레드시트 정보 가져오기
        const response = await gapi.client.sheets.spreadsheets.get({
            spreadsheetId: SPREADSHEET_ID
        });
        
        const sheets = response.result.sheets;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const newSheetName = `교육과정_${timestamp}`;
        
        // 새 시트 생성
        await gapi.client.sheets.spreadsheets.batchUpdate({
            spreadsheetId: SPREADSHEET_ID,
            resource: {
                requests: [{
                    addSheet: {
                        properties: {
                            title: newSheetName
                        }
                    }
                }]
            }
        });
        
        return newSheetName;
        
    } catch (err) {
        console.error('시트 생성 오류:', err);
        return 'Sheet1'; // 기본 시트 사용
    }
}

// 헤더 데이터 생성
async function createHeaderData(companyName, courseName, days) {
    const totalTime = calculateTotalTime();
    const daysText = days ? ` - ${days}` : '';
    
    return [
        [
            `${companyName} 교육 커리큘럼 (${totalTime})${daysText}`,
            '',
            '',
            '음영 표기는 실습 진행 항목입니다',
            '본 커리큘럼은 일부 변동될 수 있습니다'
        ],
        ['', '', '', '', ''],
        ['번호', '강의 제목', '상세 내용', '시간', '']
    ];
}

// 커리큘럼 데이터 생성
async function createCurriculumData() {
    const data = [];
    
    selectedCurriculums.forEach((curriculum, index) => {
        // details 배열이 있으면 사용하고, 없으면 description을 배열로 변환
        let details = [];
        if (curriculum.details && Array.isArray(curriculum.details)) {
            details = curriculum.details;
        } else if (curriculum.description) {
            // description이 문자열이면 줄바꿈으로 분리하여 배열로 만들기
            details = curriculum.description.split('\n').filter(line => line.trim());
            // 만약 분리된 항목이 1개뿐이면 그대로 사용
            if (details.length === 1) {
                details = [curriculum.description];
            }
        } else {
            details = ['상세 내용 없음'];
        }
        
        // 첫 번째 행: 상세 내용 시작
        details.forEach((detail, detailIndex) => {
            if (detailIndex === 0) {
                // 첫 번째 상세 내용 행
                data.push([
                    index + 1, // 번호
                    curriculum.title, // 강의 제목
                    detail.trim(), // 상세 내용
                    `${curriculum.duration}분` // 시간
                ]);
            } else {
                // 추가 상세 내용 행 (번호, 제목, 시간은 비어둠 - 나중에 병합)
                data.push([
                    '', // 번호 (병합될 예정)
                    '', // 강의 제목 (병합될 예정)
                    detail.trim(), // 상세 내용
                    '' // 시간 (병합될 예정)
                ]);
            }
        });
    });
    
    return data;
}

// 셀 병합 및 스타일 적용
async function applyFormattingAndMerging(sheetName, curriculumData) {
    try {
        const requests = [];
        let currentRow = 4; // A4부터 시작 (0-based index로는 3)
        
        selectedCurriculums.forEach((curriculum, index) => {
            // details 배열 생성 (위의 createCurriculumData와 동일한 로직)
            let details = [];
            if (curriculum.details && Array.isArray(curriculum.details)) {
                details = curriculum.details;
            } else if (curriculum.description) {
                details = curriculum.description.split('\n').filter(line => line.trim());
                if (details.length === 1) {
                    details = [curriculum.description];
                }
            } else {
                details = ['상세 내용 없음'];
            }
            
            const detailsCount = details.length;
            
            if (detailsCount > 1) {
                // A열 병합 (번호)
                requests.push({
                    mergeCells: {
                        range: {
                            sheetId: 0, // 기본 시트 ID
                            startRowIndex: currentRow - 1,
                            endRowIndex: currentRow - 1 + detailsCount,
                            startColumnIndex: 0,
                            endColumnIndex: 1
                        },
                        mergeType: 'MERGE_ALL'
                    }
                });
                
                // B열 병합 (강의 제목)
                requests.push({
                    mergeCells: {
                        range: {
                            sheetId: 0,
                            startRowIndex: currentRow - 1,
                            endRowIndex: currentRow - 1 + detailsCount,
                            startColumnIndex: 1,
                            endColumnIndex: 2
                        },
                        mergeType: 'MERGE_ALL'
                    }
                });
                
                // D열 병합 (시간)
                requests.push({
                    mergeCells: {
                        range: {
                            sheetId: 0,
                            startRowIndex: currentRow - 1,
                            endRowIndex: currentRow - 1 + detailsCount,
                            startColumnIndex: 3,
                            endColumnIndex: 4
                        },
                        mergeType: 'MERGE_ALL'
                    }
                });
            }
            
            currentRow += detailsCount;
        });
        
        // 병합 요청 실행
        if (requests.length > 0) {
            await gapi.client.sheets.spreadsheets.batchUpdate({
                spreadsheetId: SPREADSHEET_ID,
                resource: {
                    requests: requests
                }
            });
        }
        
    } catch (err) {
        console.error('포맷팅 적용 오류:', err);
    }
}

// 총 시간 계산 함수
function calculateTotalTime() {
    const totalMinutes = selectedCurriculums.reduce((total, curriculum) => {
        return total + (curriculum.duration || 0);
    }, 0);
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours > 0) {
        return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
    } else {
        return `${minutes}분`;
    }
}

// 로그아웃 처리
function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
        showMessage('로그아웃되었습니다.', 'success');
    }
}

// API 설정 함수 (관리자가 사용)
function setGoogleSheetsConfig(apiKey, clientId, spreadsheetId) {
    API_KEY = apiKey;
    CLIENT_ID = clientId;
    SPREADSHEET_ID = spreadsheetId;
    
    // 로컬 스토리지에 저장 (보안상 권장하지 않음, 실제로는 서버에서 관리해야 함)
    localStorage.setItem('googleSheetsConfig', JSON.stringify({
        apiKey, clientId, spreadsheetId
    }));
}

// 저장된 설정 로드
function loadGoogleSheetsConfig() {
    const saved = localStorage.getItem('googleSheetsConfig');
    if (saved) {
        const config = JSON.parse(saved);
        API_KEY = config.apiKey;
        CLIENT_ID = config.clientId;
        SPREADSHEET_ID = config.spreadsheetId;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadGoogleSheetsConfig();
    
    // 설정이 있는 경우에만 초기화
    if (API_KEY && CLIENT_ID) {
        initializeGapi();
        initializeGis();
    }
});