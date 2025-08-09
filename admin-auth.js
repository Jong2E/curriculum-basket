// 관리자 페이지 인증 시스템
const ADMIN_PASSWORD = '0813';
const AUTH_EXPIRY_HOURS = 24; // 24시간 후 재인증 필요

// 페이지 로드 시 인증 확인
document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        showAuthModal();
    } else {
        initializeAdminPage();
    }
});

// 인증 상태 확인
function isAuthenticated() {
    const authData = localStorage.getItem('adminAuth');
    if (!authData) return false;
    
    try {
        const { timestamp, authenticated } = JSON.parse(authData);
        const now = new Date().getTime();
        const expiry = timestamp + (AUTH_EXPIRY_HOURS * 60 * 60 * 1000);
        
        return authenticated && now < expiry;
    } catch (error) {
        return false;
    }
}

// 인증 모달 표시
function showAuthModal() {
    // 기존 콘텐츠 숨기기
    document.body.style.overflow = 'hidden';
    
    const authModal = document.createElement('div');
    authModal.id = 'authModal';
    authModal.className = 'auth-modal';
    authModal.innerHTML = `
        <div class="auth-modal-content">
            <div class="auth-header">
                <h2>관리자 인증</h2>
                <p>관리자 페이지에 접근하려면 비밀번호를 입력하세요</p>
            </div>
            <form id="authForm" class="auth-form">
                <div class="form-group">
                    <label for="authPassword">비밀번호:</label>
                    <input type="password" id="authPassword" required autocomplete="off">
                </div>
                <button type="submit" class="auth-btn">인증</button>
                <div class="auth-error" id="authError" style="display: none;"></div>
            </form>
            <div class="auth-footer">
                <a href="index.html" class="back-link">메인 페이지로 돌아가기</a>
            </div>
        </div>
    `;
    
    document.body.appendChild(authModal);
    
    // 폼 이벤트 리스너 추가
    document.getElementById('authForm').addEventListener('submit', handleAuth);
    document.getElementById('authPassword').focus();
}

// 인증 처리
function handleAuth(event) {
    event.preventDefault();
    
    const password = document.getElementById('authPassword').value;
    const errorDiv = document.getElementById('authError');
    
    if (password === ADMIN_PASSWORD) {
        // 인증 성공
        const authData = {
            authenticated: true,
            timestamp: new Date().getTime()
        };
        
        localStorage.setItem('adminAuth', JSON.stringify(authData));
        
        // 모달 제거 및 페이지 초기화
        document.getElementById('authModal').remove();
        document.body.style.overflow = '';
        initializeAdminPage();
        
        showMessage('인증에 성공했습니다!', 'success');
    } else {
        // 인증 실패
        errorDiv.textContent = '비밀번호가 올바르지 않습니다.';
        errorDiv.style.display = 'block';
        document.getElementById('authPassword').value = '';
        document.getElementById('authPassword').focus();
        
        // 3초 후 오류 메시지 숨기기
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 3000);
    }
}

// 관리자 페이지 초기화 (기존 코드)
function initializeAdminPage() {
    if (typeof loadCurriculumData === 'function') {
        loadCurriculumData();
    }
    if (typeof displayCurriculumList === 'function') {
        displayCurriculumList();
    }
    if (typeof setupEventListeners === 'function') {
        setupEventListeners();
    }
    if (typeof loadCurrentSettings === 'function') {
        loadCurrentSettings();
    }
}

// 로그아웃 함수
function logoutAdmin() {
    localStorage.removeItem('adminAuth');
    window.location.reload();
}

// 세션 만료 체크 (주기적으로 확인)
setInterval(() => {
    if (!isAuthenticated() && !document.getElementById('authModal')) {
        showAuthModal();
    }
}, 60000); // 1분마다 체크