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

// 스프레드시트에 데이터 전송
async function sendToGoogleSheets() {
    const companyName = document.getElementById('companyName').value.trim();
    const instructorName = document.getElementById('instructorName').value.trim();
    const courseName = document.getElementById('courseName').value.trim();
    
    if (!companyName || !instructorName || !courseName || selectedCurriculums.length === 0) {
        showMessage('필요한 정보가 모두 입력되지 않았습니다.', 'error');
        return false;
    }
    
    try {
        // 현재 날짜
        const currentDate = new Date().toLocaleDateString('ko-KR');
        
        // 커리큘럼 상세 내용을 문자열로 변환
        const curriculumDetails = selectedCurriculums.map((curriculum, index) => 
            `${index + 1}. ${curriculum.title} (${curriculum.duration}분) - ${curriculum.description}`
        ).join('\\n');
        
        // 스프레드시트에 추가할 행 데이터
        const values = [
            [
                companyName,
                courseName,
                (() => {
                    const hours = Math.floor(totalHours / 60);
                    const minutes = totalHours % 60;
                    return hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
                })(),
                currentDate,
                instructorName,
                curriculumDetails
            ]
        ];
        
        const body = {
            values: values
        };
        
        // 스프레드시트에 데이터 추가
        const result = await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: 'Sheet1!A:F', // A열부터 F열까지
            valueInputOption: 'USER_ENTERED',
            resource: body,
        });
        
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