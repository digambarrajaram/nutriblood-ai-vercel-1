let analysisResult = null;

document.getElementById('analyzeForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bloodReport = document.getElementById('bloodReport').value.trim();
    const dietPref = document.querySelector('select[name="diet_preference"]').value;

    if (!bloodReport || !dietPref) {
        alert('Please fill in all fields');
        return;
    }

    const formData = new FormData();
    formData.append('blood_report', bloodReport);
    formData.append('diet_preference', dietPref);

    try {
        const response = await fetch('/analyze', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.status === 'success') {
            analysisResult = data;
            displayResults(data);
        } else {
            alert('Error: ' + data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

function displayResults(data) {
    document.getElementById('resultsSection').style.display = 'block';
    
    // Count values by status
    const high = data.extracted_values.filter(v => v.status.toUpperCase() === 'HIGH').length;
    const low = data.extracted_values.filter(v => v.status.toUpperCase() === 'LOW').length;
    const normal = data.extracted_values.filter(v => v.status.toUpperCase() === 'NORMAL').length;

    document.getElementById('highCount').textContent = high;
    document.getElementById('lowCount').textContent = low;
    document.getElementById('normalCount').textContent = normal;

    // Blood values list
    const bloodList = document.getElementById('bloodValuesList');
    bloodList.innerHTML = data.extracted_values.map(item => {
        const status = item.status.toUpperCase();
        const badgeClass = `badge-${status.toLowerCase()}`;
        const cardClass = `blood-card ${status.toLowerCase()}`;
        
        return `
            <div class="${cardClass}">
                <div>
                    <strong>${item.test}</strong><br>
                    <small style="color: #aaa;">Value: ${item.value}</small>
                </div>
                <span class="blood-card-badge ${badgeClass}">${status}</span>
            </div>
        `;
    }).join('');

    // Summary
    document.getElementById('summaryBox').textContent = data.summary;

    // Food cards
    const avoidList = data.foods_to_avoid.map(f => `<li>${f}</li>`).join('');
    const eatList = data.foods_to_eat.map(f => `<li>${f}</li>`).join('');

    document.getElementById('foodCardAvoid').innerHTML = `
        <h4>🚫 Foods to Avoid</h4>
        <ul>${avoidList}</ul>
    `;

    document.getElementById('foodCardEat').innerHTML = `
        <h4>✅ Foods to Eat More Of</h4>
        <ul>${eatList}</ul>
    `;

    // Report
    const report = `SUMMARY:
${data.summary}

FOODS TO AVOID:
${data.foods_to_avoid.join(', ')}

FOODS TO EAT:
${data.foods_to_eat.join(', ')}`;

    document.getElementById('reportPreview').value = report;

    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

function downloadReport() {
    const text = document.getElementById('reportPreview').value;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'nutriblood_report.txt';
    a.click();
    window.URL.revokeObjectURL(url);
}
