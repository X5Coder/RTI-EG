
// Application form variables
let currentStep = 1;
let documentType = 'ID';

// DOM Elements
const step1Element = document.getElementById('step1');
const step2Element = document.getElementById('step2');
const backGroupElement = document.getElementById('backGroup');
const frontLabelElement = document.getElementById('frontLabel');
const acceptTermsElement = document.getElementById('acceptTerms');
const docFrontElement = document.getElementById('docFront');
const docBackElement = document.getElementById('docBack');
const personalPhotoElement = document.getElementById('personalPhoto');

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

// ImgBB API Key
const IMGBB_API_KEY = "a358cd5264f543deb8d3aab71c576b47";

// Functions
function showError(message) {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.textContent = message;
        errorContainer.style.display = 'block';
        errorContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

function hideError() {
    const errorContainer = document.getElementById('errorContainer');
    if (errorContainer) {
        errorContainer.style.display = 'none';
    }
}

function setDocumentType(type) {
    documentType = type;
    const typeButtons = document.querySelectorAll('.type-btn');
    typeButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update front label
    if (frontLabelElement) {
        frontLabelElement.textContent = type === 'ID' ? 'وجه البطاقة' : 'وجه الشهادة';
    }
    
    // Show/hide back upload for ID
    if (backGroupElement) {
        if (type === 'ID') {
            backGroupElement.style.display = 'block';
        } else {
            backGroupElement.style.display = 'none';
        }
    }
}

function previewImage(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById(previewId);
            const placeholder = document.getElementById(input.id + 'Placeholder');
            if (preview) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            }
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        }
        reader.readAsDataURL(file);
    }
}

async function uploadToImgBB(base64Image) {
    try {
        const response = await fetch(base64Image);
        const blob = await response.blob();
        
        const formData = new FormData();
        formData.append("image", blob);
        
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
            method: "POST",
            body: formData,
        });
        
        const data = await res.json();
        if (data.success) {
            return data.data.url;
        } else {
            throw new Error("فشل رفع الصورة");
        }
    } catch (error) {
        console.error("ImgBB Error:", error);
        return base64Image; // Fallback to base64
    }
}

function cleanKey(val) {
    return val.replace(/[^0-9]/g, "");
}

async function checkExistingApplication(phone) {
    const key = cleanKey(phone);
    try {
        const snapshot = await database.ref(`applications/${key}`).once('value');
        return snapshot.exists();
    } catch (error) {
        console.error("Check existing error:", error);
        return false;
    }
}

async function saveApplication(data) {
    const key = cleanKey(data.phone);
    try {
        await database.ref('applications/' + key).set({
            ...data,
            request: false,
            dec: 'تم استلام بياناتك وسيتم التواصل معك في أقرب وقت ممكن لإتمام المقابلة.',
            timestamp: Date.now()
        });
        return true;
    } catch (error) {
        console.error("Save application error:", error);
        return false;
    }
}

function validateStep1() {
    hideError();
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const age = document.getElementById('age').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    
    // Validation
    if (!fullName || !age || !phone || !email || !address) {
        showError('يرجى تعبئة كافة الحقول المطلوبة.');
        return;
    }
    
    const phoneRegex = /^01[0-2,5][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
        showError('يرجى إدخال رقم هاتف مصري صحيح (01XXXXXXXXX)');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('يرجى إدخال بريد إلكتروني صالح.');
        return;
    }
    
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 10) {
        showError('عذراً، يجب أن يكون السن 10 سنوات على الأقل للعمل في RTI.');
        return;
    }
    
    // Show loading
    const step1Btn = document.getElementById('step1Btn');
    const step1Text = document.getElementById('step1Text');
    const step1Loading = document.getElementById('step1Loading');
    
    if (step1Btn && step1Text && step1Loading) {
        step1Btn.disabled = true;
        step1Text.style.display = 'none';
        step1Loading.style.display = 'inline';
    }
    
    // Check existing application
    checkExistingApplication(phone).then(exists => {
        if (exists) {
            showError('رقم الهاتف مسجل لدينا بالفعل. لا يمكن التسجيل بأكثر من حساب.');
            
            // Reset loading state
            if (step1Btn && step1Text && step1Loading) {
                step1Btn.disabled = false;
                step1Text.style.display = 'inline';
                step1Loading.style.display = 'none';
            }
            return;
        }
        
        // Move to step 2
        step1Element.classList.remove('active');
        step2Element.classList.add('active');
        currentStep = 2;
        
        // Reset loading state
        if (step1Btn && step1Text && step1Loading) {
            step1Btn.disabled = false;
            step1Text.style.display = 'inline';
            step1Loading.style.display = 'none';
        }
    }).catch(error => {
        showError('خطأ في الاتصال بالخادم.');
        
        // Reset loading state
        if (step1Btn && step1Text && step1Loading) {
            step1Btn.disabled = false;
            step1Text.style.display = 'inline';
            step1Loading.style.display = 'none';
        }
    });
}

function backToStep1() {
    step2Element.classList.remove('active');
    step1Element.classList.add('active');
    currentStep = 1;
}

function showTerms() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        termsModal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function hideTerms() {
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        termsModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

async function submitApplication() {
    hideError();
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const age = document.getElementById('age').value;
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
    const address = document.getElementById('address').value.trim();
    const referralCode = document.getElementById('referralCode').value.trim();
    const source = document.getElementById('source').value;
    
    // Validate documents
    if (!docFrontElement.files[0]) {
        showError('يرجى رفع صورة المستند الأمامي.');
        return;
    }
    
    if (documentType === 'ID' && !docBackElement.files[0]) {
        showError('يرجى رفع صورة ظهر البطاقة.');
        return;
    }
    
    if (!personalPhotoElement.files[0]) {
        showError('يرجى رفع صورة شخصية.');
        return;
    }
    
    // Check terms acceptance
    if (!acceptTermsElement.checked) {
        showError('يجب الموافقة على شروط وقواعد RTI للاستمرار.');
        return;
    }
    
    // Show loading
    const submitBtn = document.getElementById('submitBtn');
    const submitText = document.getElementById('submitText');
    const submitLoading = document.getElementById('submitLoading');
    
    if (submitBtn && submitText && submitLoading) {
        submitBtn.disabled = true;
        submitText.style.display = 'none';
        submitLoading.style.display = 'inline';
    }
    
    try {
        // Upload images
        const frontPromise = uploadToImgBB(URL.createObjectURL(docFrontElement.files[0]));
        const backPromise = documentType === 'ID' ? uploadToImgBB(URL.createObjectURL(docBackElement.files[0])) : Promise.resolve('');
        const personalPromise = uploadToImgBB(URL.createObjectURL(personalPhotoElement.files[0]));
        
        const [frontUrl, backUrl, personalUrl] = await Promise.all([frontPromise, backPromise, personalPromise]);
        
        // Prepare application data
        const applicationData = {
            fullName,
            age,
            phone,
            email,
            address,
            referralCode,
            source,
            docType: documentType,
            docFrontUrl: frontUrl,
            docBackUrl: backUrl,
            personalPhotoUrl: personalUrl
        };
        
        // Save to Firebase
        const saved = await saveApplication(applicationData);
        
        if (saved) {
            // Show success modal
            const successModal = document.getElementById('successModal');
            if (successModal) {
                successModal.style.display = 'flex';
            }
        } else {
            showError('حدث خطأ أثناء حفظ البيانات. يرجى المحاولة لاحقاً.');
        }
    } catch (error) {
        console.error("Submit error:", error);
        showError('حدث خطأ تقني أثناء معالجة البيانات. يرجى المحاولة لاحقاً.');
    } finally {
        // Reset loading state
        if (submitBtn && submitText && submitLoading) {
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitLoading.style.display = 'none';
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Set document type to ID by default
    setDocumentType('ID');
    
    // Close modals on overlay click
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            hideTerms();
        }
    });
    
    // Close modals on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideTerms();
        }
    });
    
    // Prevent referral code from containing special characters
    const referralCodeInput = document.getElementById('referralCode');
    if (referralCodeInput) {
        referralCodeInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Z0-9-]/g, "");
        });
    }
});
