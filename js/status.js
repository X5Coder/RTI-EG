
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBzB4Hky2iO8FGe_sRz3EfjAfyy4ClgLGQ",
    authDomain: "marvel-75d8b.firebaseapp.com",
    databaseURL: "https://marvel-75d8b-default-rtdb.firebaseio.com",
    projectId: "marvel-75d8b",
    storageBucket: "marvel-75d8b.firebasestorage.app",
    messagingSenderId: "1098663412275",
    appId: "1:1098663412275:android:5cdc145765a20130189946"
};

// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

// Functions
function showError(message) {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        errorMessage.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideError() {
    const errorMessage = document.getElementById('errorMessage');
    if (errorMessage) {
        errorMessage.style.display = 'none';
    }
}

function showStatus() {
    const statusResult = document.getElementById('statusResult');
    if (statusResult) {
        statusResult.style.display = 'block';
        statusResult.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function hideStatus() {
    const statusResult = document.getElementById('statusResult');
    if (statusResult) {
        statusResult.style.display = 'none';
    }
}

function cleanKey(val) {
    return val.replace(/[^0-9]/g, "");
}

async function checkStatus() {
    const phoneInput = document.getElementById('phoneInput');
    if (!phoneInput || !phoneInput.value.trim()) {
        showError('يرجى إدخال رقم الهاتف');
        return;
    }
    
    const phone = phoneInput.value.trim();
    const phoneRegex = /^01[0-2,5][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        showError('يرجى إدخال رقم هاتف مصري صحيح (01XXXXXXXXX)');
        return;
    }
    
    // Show loading
    const checkBtn = document.getElementById('checkBtn');
    const checkText = document.getElementById('checkText');
    const checkLoading = document.getElementById('checkLoading');
    
    if (checkBtn && checkText && checkLoading) {
        checkBtn.disabled = true;
        checkText.style.display = 'none';
        checkLoading.style.display = 'inline';
    }
    
    hideError();
    hideStatus();
    
    try {
        const key = cleanKey(phone);
        const snapshot = await database.ref(`applications/${key}`).once('value');
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            displayStatus(data);
        } else {
            showError('عذراً، لم نجد طلباً مرتبطاً بهذا الرقم.');
        }
    } catch (error) {
        console.error("Status check error:", error);
        showError('خطأ في الاتصال.');
    } finally {
        // Reset loading state
        if (checkBtn && checkText && checkLoading) {
            checkBtn.disabled = false;
            checkText.style.display = 'inline';
            checkLoading.style.display = 'none';
        }
    }
}

function displayStatus(data) {
    // Update applicant info
    const applicantName = document.getElementById('applicantName');
    const applicantPhoto = document.getElementById('applicantPhoto');
    const statusMessage = document.getElementById('statusMessage');
    const applicationDate = document.getElementById('applicationDate');
    const statusBox = document.getElementById('statusBox');
    
    if (applicantName) {
        applicantName.textContent = data.fullName || 'غير معروف';
    }
    
    if (applicantPhoto && data.personalPhotoUrl) {
        applicantPhoto.style.backgroundImage = `url(${data.personalPhotoUrl})`;
    }
    
    if (statusMessage) {
        if (data.request && data.dec) {
            statusMessage.textContent = data.dec;
            statusBox.classList.add('approved');
        } else {
            statusMessage.textContent = 'طلبك قيد المراجعة الأمنية والتقنية. سيتم التواصل معك عبر الواتساب فور الانتهاء.';
            statusBox.classList.remove('approved');
        }
    }
    
    if (applicationDate && data.timestamp) {
        const date = new Date(data.timestamp);
        applicationDate.textContent = `تاريخ التقديم: ${date.toLocaleDateString('ar-EG')}`;
    }
    
    showStatus();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Add enter key support for phone input
    const phoneInput = document.getElementById('phoneInput');
    if (phoneInput) {
        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                checkStatus();
            }
        });
    }
});
