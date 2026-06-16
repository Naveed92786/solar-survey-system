// Survey Form Application
const form = document.getElementById('surveyForm');
const formProgress = document.getElementById('formProgress');
const surveyId = document.getElementById('surveyId');
const surveyDate = document.getElementById('surveyDate');
const surveyDay = document.getElementById('surveyDay');
const darkModeToggle = document.getElementById('darkModeToggle');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateSurveyId();
    setCurrentDate();
    setupSignaturePads();
    loadDarkMode();
    setupEventListeners();
});

// Generate unique Survey ID
function generateSurveyId() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const id = `PES-${new Date().getFullYear()}-${random.toString().padStart(4, '0')}-${timestamp.toString().slice(-4)}`;
    surveyId.value = id;
}

// Set current date and day
function setCurrentDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    surveyDate.value = `${year}-${month}-${day}`;
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    surveyDay.value = days[today.getDay()];
}

// Setup Signature Pads
let customerSigPad, engineerSigPad;

function setupSignaturePads() {
    const customerCanvas = document.querySelector('#customerSignature canvas');
    const engineerCanvas = document.querySelector('#engineerSignature canvas');
    
    if (!customerCanvas) {
        const customerContainer = document.getElementById('customerSignature');
        const customerNewCanvas = document.createElement('canvas');
        customerNewCanvas.width = customerContainer.offsetWidth;
        customerNewCanvas.height = customerContainer.offsetHeight;
        customerContainer.appendChild(customerNewCanvas);
        customerSigPad = new SignaturePad(customerNewCanvas);
    } else {
        customerSigPad = new SignaturePad(customerCanvas);
    }
    
    if (!engineerCanvas) {
        const engineerContainer = document.getElementById('engineerSignature');
        const engineerNewCanvas = document.createElement('canvas');
        engineerNewCanvas.width = engineerContainer.offsetWidth;
        engineerNewCanvas.height = engineerContainer.offsetHeight;
        engineerContainer.appendChild(engineerNewCanvas);
        engineerSigPad = new SignaturePad(engineerNewCanvas);
    } else {
        engineerSigPad = new SignaturePad(engineerCanvas);
    }
    
    document.getElementById('clearCustomerSig').addEventListener('click', () => {
        customerSigPad.clear();
        document.getElementById('customerSignatureData').value = '';
    });
    
    document.getElementById('clearEngineerSig').addEventListener('click', () => {
        engineerSigPad.clear();
        document.getElementById('engineerSignatureData').value = '';
    });
}

// Setup Event Listeners
function setupEventListeners() {
    // Form progress tracking
    form.addEventListener('input', updateFormProgress);
    form.addEventListener('change', updateFormProgress);
    
    // Dark mode toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // GPS coordinates
    document.getElementById('getLocationBtn').addEventListener('click', getGPSCoordinates);
    
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Export PDF
    document.getElementById('exportPdfBtn').addEventListener('click', exportToPDF);
    
    // Print
    document.getElementById('printBtn').addEventListener('click', () => window.print());
    
    // WhatsApp
    document.getElementById('whatsappBtn').addEventListener('click', shareViaWhatsApp);
    
    // Preview Tab
    document.getElementById('generateQuotationBtn').addEventListener('click', generateQuotation);
    
    // Tab change event
    const previewTab = document.getElementById('preview-tab');
    previewTab.addEventListener('click', () => {
        showPreview();
    });
}

// Update form progress
function updateFormProgress() {
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let filled = 0;
    
    inputs.forEach(input => {
        if (input.value.trim() !== '') {
            filled++;
        }
    });
    
    const progress = Math.round((filled / inputs.length) * 100);
    formProgress.style.width = progress + '%';
    formProgress.textContent = progress + '%';
}

// Dark Mode
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

function loadDarkMode() {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
}

// GPS Coordinates
function getGPSCoordinates() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const gpsText = `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}`;
                document.getElementById('gpsCoordinates').textContent = gpsText;
                document.getElementById('gpsCoordinates').dataset.coords = JSON.stringify({ latitude, longitude });
                alert('GPS coordinates captured successfully!');
            },
            (error) => {
                alert('Unable to get GPS coordinates. Please enable location services.');
                console.error(error);
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
}

// Show Preview
function showPreview() {
    const previewContent = document.getElementById('previewContent');
    
    const surveyData = {
        surveyId: document.getElementById('surveyId').value,
        customerName: document.getElementById('customerName').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        city: document.getElementById('city').value,
        totalRoofArea: document.getElementById('totalRoofArea').value,
        availableSolarArea: document.getElementById('availableSolarArea').value,
        systemType: document.getElementById('systemType').value,
        systemSize: document.getElementById('systemSize').value,
        connectedLoad: document.getElementById('connectedLoad').value,
        provider: document.getElementById('provider').value,
        monthlyBill: document.getElementById('monthlyBill').value,
        propertyType: document.getElementById('propertyType').value,
        roofDirection: document.getElementById('roofDirection').value
    };
    
    let html = `
        <div class="preview-box">
            <h5 class="mb-3"><i class="fas fa-info-circle"></i> Survey Summary</h5>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>Survey ID:</strong> <span class="text-primary">${surveyData.surveyId}</span></p>
                    <p><strong>Customer:</strong> ${surveyData.customerName || 'N/A'}</p>
                    <p><strong>Mobile:</strong> ${surveyData.mobileNumber || 'N/A'}</p>
                    <p><strong>City:</strong> ${surveyData.city || 'N/A'}</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Property Type:</strong> ${surveyData.propertyType || 'N/A'}</p>
                    <p><strong>Total Roof Area:</strong> ${surveyData.totalRoofArea || 'N/A'} sq.ft</p>
                    <p><strong>Available Solar Area:</strong> ${surveyData.availableSolarArea || 'N/A'} sq.ft</p>
                    <p><strong>Roof Direction:</strong> ${surveyData.roofDirection || 'N/A'}</p>
                </div>
            </div>
        </div>
        
        <div class="preview-box">
            <h5 class="mb-3"><i class="fas fa-sun"></i> Solar System Recommendation</h5>
            <div class="row">
                <div class="col-md-6">
                    <p><strong>System Type:</strong> <span class="badge bg-info">${surveyData.systemType || 'N/A'}</span></p>
                    <p><strong>Recommended Size:</strong> <span class="display-value">${surveyData.systemSize || 'N/A'} kW</span></p>
                    <p><strong>Connected Load:</strong> ${surveyData.connectedLoad || 'N/A'} kW</p>
                </div>
                <div class="col-md-6">
                    <p><strong>Electricity Provider:</strong> ${surveyData.provider || 'N/A'}</p>
                    <p><strong>Average Monthly Bill:</strong> Rs ${surveyData.monthlyBill || 'N/A'}</p>
                    <p><strong>Estimated Monthly Savings:</strong> <span class="text-success fw-bold">Pending Quotation</span></p>
                </div>
            </div>
        </div>
        
        <div class="alert alert-warning mt-4" role="alert">
            <i class="fas fa-exclamation-triangle"></i> <strong>Ready for Quotation:</strong> Click the button below to get a detailed quotation from MQ Global including pricing, installation timeline, and warranty information.
        </div>
    `;
    
    previewContent.innerHTML = html;
}

// Generate Quotation on MQ Global
function generateQuotation() {
    if (!form.checkValidity()) {
        alert('Please fill in all required fields before generating quotation.');
        return;
    }
    
    const surveyData = {
        surveyId: document.getElementById('surveyId').value,
        customerName: document.getElementById('customerName').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        email: document.getElementById('emailAddress').value,
        city: document.getElementById('city').value,
        systemType: document.getElementById('systemType').value,
        systemSize: document.getElementById('systemSize').value,
        connectedLoad: document.getElementById('connectedLoad').value,
        roofArea: document.getElementById('availableSolarArea').value,
        monthlyBill: document.getElementById('monthlyBill').value
    };
    
    // Encode survey data
    const encodedData = btoa(JSON.stringify(surveyData));
    
    // Open MQ Global quotation link with survey data
    const mqGlobalUrl = `https://quotation.mqglobal.co/?survey=${encodedData}&source=pes&surveyId=${surveyData.surveyId}`;
    window.open(mqGlobalUrl, '_blank');
}

// Handle Form Submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!form.checkValidity()) {
        e.stopPropagation();
        form.classList.add('was-validated');
        alert('Please fill in all required fields.');
        return;
    }
    
    // Capture signatures
    const customerSigData = customerSigPad.toDataURL();
    const engineerSigData = engineerSigPad.toDataURL();
    
    if (customerSigPad.isEmpty() || engineerSigPad.isEmpty()) {
        alert('Both customer and engineer signatures are required!');
        return;
    }
    
    // Collect form data
    const surveyData = {
        surveyId: document.getElementById('surveyId').value,
        surveyDate: document.getElementById('surveyDate').value,
        surveyDay: document.getElementById('surveyDay').value,
        surveyorName: document.getElementById('surveyorName').value,
        customerName: document.getElementById('customerName').value,
        mobileNumber: document.getElementById('mobileNumber').value,
        whatsappNumber: document.getElementById('whatsappNumber').value,
        cnicNumber: document.getElementById('cnicNumber').value,
        emailAddress: document.getElementById('emailAddress').value,
        completeAddress: document.getElementById('completeAddress').value,
        city: document.getElementById('city').value,
        propertyType: document.getElementById('propertyType').value,
        numberOfFloors: document.getElementById('numberOfFloors').value,
        roofType: document.getElementById('roofType').value,
        appliances: getSelectedAppliances(),
        connectedLoad: document.getElementById('connectedLoad').value,
        provider: document.getElementById('provider').value,
        meterNumber: document.getElementById('meterNumber').value,
        connectionType: document.getElementById('connectionType').value,
        sanctionedLoad: document.getElementById('sanctionedLoad').value,
        monthlyBill: document.getElementById('monthlyBill').value,
        totalRoofArea: document.getElementById('totalRoofArea').value,
        availableSolarArea: document.getElementById('availableSolarArea').value,
        roofDirection: document.getElementById('roofDirection').value,
        shadingLevel: document.getElementById('shadingLevel').value,
        shadeSource: document.getElementById('shadeSource').value,
        mdbCondition: document.getElementById('mdbCondition').value,
        earthingAvailable: document.getElementById('earthingAvailable').value,
        wiringCondition: document.getElementById('wiringCondition').value,
        systemType: document.getElementById('systemType').value,
        netMeteringRequired: document.getElementById('netMeteringRequired').value,
        systemSize: document.getElementById('systemSize').value,
        engineerRemarks: document.getElementById('engineerRemarks').value,
        gpsCoordinates: document.getElementById('gpsCoordinates').dataset.coords || '',
        customerSignature: customerSigData,
        engineerSignature: engineerSigData,
        timestamp: new Date().toISOString()
    };
    
    try {
        // Save to Firebase
        await saveSurveyToFirebase(surveyData);
        
        alert('Survey saved successfully! Survey ID: ' + surveyData.surveyId);
        
        // Reset form
        form.reset();
        form.classList.remove('was-validated');
        customerSigPad.clear();
        engineerSigPad.clear();
        generateSurveyId();
        setCurrentDate();
        updateFormProgress();
        
    } catch (error) {
        console.error('Error saving survey:', error);
        alert('Error saving survey. Please try again.');
    }
}

function getSelectedAppliances() {
    const appliances = [];
    const checkboxes = form.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
        appliances.push(checkbox.value);
    });
    return appliances;
}

// Firebase Integration (placeholder - configure with your Firebase credentials)
async function saveSurveyToFirebase(surveyData) {
    // This would integrate with your Firebase configuration
    console.log('Saving to Firebase:', surveyData);
    
    // Local storage fallback
    let surveys = JSON.parse(localStorage.getItem('surveys')) || [];
    surveys.push(surveyData);
    localStorage.setItem('surveys', JSON.stringify(surveys));
    
    return Promise.resolve();
}

// Export to PDF
function exportToPDF() {
    if (!form.checkValidity()) {
        alert('Please fill in all required fields before exporting.');
        return;
    }
    
    const element = document.querySelector('.container-fluid');
    const opt = {
        margin: 10,
        filename: `Survey_${document.getElementById('surveyId').value}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };
    
    html2pdf().set(opt).from(element).save();
}

// Share via WhatsApp
function shareViaWhatsApp() {
    const surveyId = document.getElementById('surveyId').value;
    const customerName = document.getElementById('customerName').value;
    const mobileNumber = document.getElementById('mobileNumber').value;
    
    if (!mobileNumber) {
        alert('Please enter a mobile number first.');
        return;
    }
    
    const message = encodeURIComponent(
        `Hello! Your solar survey has been completed.\n\n` +
        `Survey ID: ${surveyId}\n` +
        `Customer: ${customerName}\n` +
        `Date: ${new Date().toLocaleDateString()}\n\n` +
        `Perfect Energy Solutions (PES)\n` +
        `Phone: +92 339 0081716`
    );
    
    const whatsappNumber = mobileNumber.replace(/[^\d]/g, '');
    const url = `https://wa.me/${whatsappNumber}?text=${message}`;
    window.open(url, '_blank');
}

// Print functionality
function printSurvey() {
    window.print();
}

// Export to Excel (simple CSV)
function exportToExcel() {
    const surveys = JSON.parse(localStorage.getItem('surveys')) || [];
    if (surveys.length === 0) {
        alert('No surveys to export.');
        return;
    }
    
    let csv = 'Survey ID,Customer Name,Mobile,CNIC,City,System Size,Date\n';
    surveys.forEach(survey => {
        csv += `${survey.surveyId},${survey.customerName},${survey.mobileNumber},${survey.cnicNumber},${survey.city},${survey.systemSize},${survey.surveyDate}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'surveys.csv';
    a.click();
}
