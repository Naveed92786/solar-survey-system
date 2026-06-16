// Dashboard Application with Quotations Support
let allSurveys = [];
let filteredSurveys = [];
let currentSurveyId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSurveys();
    setupEventListeners();
});

function loadSurveys() {
    // Load from local storage
    const surveys = JSON.parse(localStorage.getItem('surveys')) || [];
    const quotations = JSON.parse(localStorage.getItem('quotations')) || {};
    
    // Add quotation status to surveys
    allSurveys = surveys.map(survey => ({
        ...survey,
        hasQuotation: quotations[survey.surveyId] ? true : false,
        quotationData: quotations[survey.surveyId] || null
    }));
    
    filteredSurveys = [...allSurveys];
    
    updateStatistics();
    renderSurveyTable();
    populateFilters();
}

function setupEventListeners() {
    document.getElementById('searchInput').addEventListener('input', filterSurveys);
    document.getElementById('filterSystemType').addEventListener('change', filterSurveys);
    document.getElementById('filterCity').addEventListener('change', filterSurveys);
    document.getElementById('filterQuotation').addEventListener('change', filterSurveys);
    document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
    document.getElementById('refreshBtn').addEventListener('click', loadSurveys);
}

function updateStatistics() {
    const totalSurveys = allSurveys.length;
    const onGridCount = allSurveys.filter(s => s.systemType === 'On-Grid').length;
    const quotationsSaved = allSurveys.filter(s => s.hasQuotation).length;
    const totalSystemSize = allSurveys.reduce((sum, s) => sum + (parseFloat(s.systemSize) || 0), 0);
    
    document.getElementById('totalSurveys').textContent = totalSurveys;
    document.getElementById('onGridCount').textContent = onGridCount;
    document.getElementById('quotationsSaved').textContent = quotationsSaved;
    document.getElementById('totalSystemSize').textContent = totalSystemSize.toFixed(2);
}

function renderSurveyTable() {
    const tbody = document.getElementById('surveysTableBody');
    tbody.innerHTML = '';
    
    if (filteredSurveys.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" class="text-center text-muted">No surveys found</td></tr>';
        return;
    }
    
    filteredSurveys.forEach(survey => {
        const row = document.createElement('tr');
        const quotationStatus = survey.hasQuotation 
            ? '<span class="quotation-status quotation-yes"><i class="fas fa-check-circle"></i> Saved</span>'
            : '<span class="quotation-status quotation-no"><i class="fas fa-times-circle"></i> Not Saved</span>';
        
        row.innerHTML = `
            <td><strong>${survey.surveyId}</strong></td>
            <td>${survey.customerName}</td>
            <td>${survey.mobileNumber}</td>
            <td>${survey.cnicNumber}</td>
            <td>${survey.city}</td>
            <td><span class="badge bg-info">${survey.systemType}</span></td>
            <td>${survey.systemSize}</td>
            <td>${new Date(survey.surveyDate).toLocaleDateString()}</td>
            <td>${quotationStatus}</td>
            <td>
                <button class="btn btn-sm btn-info" onclick="viewSurvey('${survey.surveyId}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-sm btn-primary" onclick="editSurvey('${survey.surveyId}')" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteSurvey('${survey.surveyId}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewSurvey(surveyId) {
    const survey = allSurveys.find(s => s.surveyId === surveyId);
    if (!survey) return;
    
    currentSurveyId = surveyId;
    
    const quotationSection = survey.hasQuotation ? `
        <div class="alert alert-success mt-3">
            <i class="fas fa-check-circle"></i> <strong>Quotation Saved!</strong> This survey has an associated quotation.
        </div>
    ` : '';
    
    const detailsHtml = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold">Survey Information</h6>
                <p><strong>Survey ID:</strong> ${survey.surveyId}</p>
                <p><strong>Date:</strong> ${survey.surveyDate}</p>
                <p><strong>Surveyor:</strong> ${survey.surveyorName}</p>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold">Customer Information</h6>
                <p><strong>Name:</strong> ${survey.customerName}</p>
                <p><strong>Mobile:</strong> ${survey.mobileNumber}</p>
                <p><strong>CNIC:</strong> ${survey.cnicNumber}</p>
                <p><strong>Email:</strong> ${survey.emailAddress || 'N/A'}</p>
            </div>
        </div>
        <hr>
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold">Solar Assessment</h6>
                <p><strong>System Type:</strong> ${survey.systemType}</p>
                <p><strong>System Size:</strong> ${survey.systemSize} kW</p>
                <p><strong>Available Area:</strong> ${survey.availableSolarArea} sq.ft</p>
                <p><strong>Roof Direction:</strong> ${survey.roofDirection}</p>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold">Electrical Information</h6>
                <p><strong>Provider:</strong> ${survey.provider}</p>
                <p><strong>Meter Number:</strong> ${survey.meterNumber}</p>
                <p><strong>Connection Type:</strong> ${survey.connectionType}</p>
                <p><strong>Connected Load:</strong> ${survey.connectedLoad} kW</p>
            </div>
        </div>
        <hr>
        <div>
            <h6 class="fw-bold">Remarks</h6>
            <p>${survey.engineerRemarks}</p>
        </div>
        ${quotationSection}
    `;
    
    document.getElementById('surveyDetailsContent').innerHTML = detailsHtml;
    
    // Setup modal buttons
    const quotationBtn = document.getElementById('quotationBtn');
    if (survey.hasQuotation) {
        quotationBtn.textContent = 'View Quotation';
        quotationBtn.className = 'btn btn-success';
    } else {
        quotationBtn.textContent = 'Generate Quotation';
        quotationBtn.className = 'btn btn-info';
    }
    quotationBtn.onclick = () => generateQuotation(surveyId);
    
    document.getElementById('editSurveyBtn').onclick = () => editSurvey(surveyId);
    document.getElementById('deleteSurveyBtn').onclick = () => deleteSurvey(surveyId);
    
    const modal = new bootstrap.Modal(document.getElementById('surveyDetailModal'));
    modal.show();
}

function generateQuotation(surveyId) {
    const survey = allSurveys.find(s => s.surveyId === surveyId);
    if (!survey) return;
    
    // Save quotation status
    const quotations = JSON.parse(localStorage.getItem('quotations')) || {};
    quotations[surveyId] = {
        timestamp: new Date().toISOString(),
        surveyData: survey,
        status: 'saved'
    };
    localStorage.setItem('quotations', JSON.stringify(quotations));
    
    // Reload and update
    loadSurveys();
    
    alert(`Quotation saved for Survey ID: ${surveyId}`);
    
    // Close modal
    bootstrap.Modal.getInstance(document.getElementById('surveyDetailModal')).hide();
}

function editSurvey(surveyId) {
    const survey = allSurveys.find(s => s.surveyId === surveyId);
    if (!survey) return;
    
    sessionStorage.setItem('editSurvey', JSON.stringify(survey));
    window.location.href = 'index.html?edit=' + surveyId;
}

function deleteSurvey(surveyId) {
    if (!confirm('Are you sure you want to delete this survey?')) return;
    
    allSurveys = allSurveys.filter(s => s.surveyId !== surveyId);
    localStorage.setItem('surveys', JSON.stringify(allSurveys));
    
    // Also delete associated quotation
    const quotations = JSON.parse(localStorage.getItem('quotations')) || {};
    delete quotations[surveyId];
    localStorage.setItem('quotations', JSON.stringify(quotations));
    
    loadSurveys();
    alert('Survey deleted successfully!');
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('surveyDetailModal'));
    if (modal) modal.hide();
}

function filterSurveys() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const systemType = document.getElementById('filterSystemType').value;
    const city = document.getElementById('filterCity').value;
    const quotation = document.getElementById('filterQuotation').value;
    
    filteredSurveys = allSurveys.filter(survey => {
        const matchesSearch = 
            survey.surveyId.toLowerCase().includes(searchTerm) ||
            survey.customerName.toLowerCase().includes(searchTerm) ||
            survey.cnicNumber.includes(searchTerm) ||
            survey.mobileNumber.includes(searchTerm);
        
        const matchesSystemType = !systemType || survey.systemType === systemType;
        const matchesCity = !city || survey.city === city;
        const matchesQuotation = !quotation || 
            (quotation === 'yes' ? survey.hasQuotation : !survey.hasQuotation);
        
        return matchesSearch && matchesSystemType && matchesCity && matchesQuotation;
    });
    
    renderSurveyTable();
}

function populateFilters() {
    const cities = [...new Set(allSurveys.map(s => s.city).filter(Boolean))];
    const citySelect = document.getElementById('filterCity');
    
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

function exportToExcel() {
    if (allSurveys.length === 0) {
        alert('No surveys to export.');
        return;
    }
    
    const quotations = JSON.parse(localStorage.getItem('quotations')) || {};
    
    let csv = 'Survey ID,Customer Name,Mobile,CNIC,City,Property Type,System Type,System Size (kW),Roof Area,Connected Load,Provider,Date,Quotation Status\n';
    
    allSurveys.forEach(survey => {
        const quotationStatus = quotations[survey.surveyId] ? 'Saved' : 'Not Saved';
        csv += `"${survey.surveyId}","${survey.customerName}","${survey.mobileNumber}","${survey.cnicNumber}","${survey.city}","${survey.propertyType}","${survey.systemType}","${survey.systemSize}","${survey.availableSolarArea}","${survey.connectedLoad}","${survey.provider}","${survey.surveyDate}","${quotationStatus}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `surveys_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
