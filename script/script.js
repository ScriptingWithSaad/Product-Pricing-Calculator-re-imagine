// Theme handling with smooth transitions
const themeToggle = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggle.querySelector('i');

// Set initial theme to dark
if (!localStorage.getItem('theme')) {
    localStorage.setItem('theme', 'dark');
    body.classList.remove('light-theme');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

// Load saved theme
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-theme');
    icon.classList.remove('fa-sun');
    icon.classList.add('fa-moon');
}

// Theme toggle with animation
themeToggle.addEventListener('click', () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = body.classList.contains('light-theme') ? '#1e1e2e' : '#ffffff';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.3s ease';
    overlay.style.pointerEvents = 'none';
    overlay.style.zIndex = '9999';
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '0.2';
        
        setTimeout(() => {
            body.classList.toggle('light-theme');
            if (body.classList.contains('light-theme')) {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
                localStorage.setItem('theme', 'light');
            } else {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
                localStorage.setItem('theme', 'dark');
            }

            overlay.style.opacity = '0';
            setTimeout(() => overlay.remove(), 300);
        }, 200);
    });
});

// Input fields
const inputs = {
    quantity: document.getElementById('quantity'),
    sourcingPrice: document.getElementById('sourcingPrice'),
    carriage: document.getElementById('carriage'),
    packaging: document.getElementById('packaging'),
    shipping: document.getElementById('shipping'),
    returns: document.getElementById('returns'),
    sellingPrice: document.getElementById('sellingPrice')
};

// Result fields
const results = {
    totalCost: document.getElementById('totalCost'),
    grossProfit: document.getElementById('grossProfit'),
    grossMargin: document.getElementById('grossMargin'),
    breakeven: document.getElementById('breakeven')
};

// Calculate and update results with animations
function calculateResults() {
    const values = {};
    for (const [key, input] of Object.entries(inputs)) {
        values[key] = parseFloat(input.value) || 0;
    }

    // Calculate totals
    const totalCost = (values.sourcingPrice + values.carriage + values.packaging + 
                      values.shipping + values.returns) * values.quantity;
    const grossProfit = (values.sellingPrice * values.quantity) - totalCost;
    const grossMargin = values.sellingPrice ? ((grossProfit / (values.sellingPrice * values.quantity)) * 100) : 0;
    const breakevenPrice = values.quantity ? (totalCost / values.quantity) : 0;

    // Update results with animation
    animateValue(results.totalCost, parseFloat(results.totalCost.textContent), totalCost, 500);
    animateValue(results.grossProfit, parseFloat(results.grossProfit.textContent), grossProfit, 500);
    animateValue(results.grossMargin, parseFloat(results.grossMargin.textContent), grossMargin, 500, true);
    animateValue(results.breakeven, parseFloat(results.breakeven.textContent), breakevenPrice, 500);

    // Update colors based on values
    updateResultColors();
}

// Animate value changes
function animateValue(element, start, end, duration, isPercentage = false) {
    const startVal = isNaN(start) ? 0 : start;
    const change = end - startVal;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutQuad = progress => 1 - (1 - progress) * (1 - progress);
        const currentValue = startVal + (change * easeOutQuad(progress));

        element.textContent = isPercentage ? 
            currentValue.toFixed(2) + '%' : 
            currentValue.toFixed(2);

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// Update result colors with transition
function updateResultColors() {
    const grossProfit = parseFloat(results.grossProfit.textContent);
    const grossMargin = parseFloat(results.grossMargin.textContent);

    results.grossProfit.style.transition = 'color 0.3s ease';
    results.grossMargin.style.transition = 'color 0.3s ease';

    results.grossProfit.style.color = grossProfit >= 0 ? '#10b981' : '#ef4444';
    results.grossMargin.style.color = grossMargin >= 0 ? '#10b981' : '#ef4444';
}

// Add input event listeners
Object.values(inputs).forEach(input => {
    input.addEventListener('input', calculateResults);
});

// Initialize history features
const historyList = document.getElementById('historyList');
const saveHistoryBtn = document.getElementById('saveHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
let calculationHistory = JSON.parse(localStorage.getItem('calculationHistory')) || [];

// Function to delete individual history item
function deleteHistoryItem(index) {
    calculationHistory.splice(index, 1);
    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
    updateHistoryDisplay();
    showNotification('Item deleted successfully', 'success');
}

// Function to update history display
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    calculationHistory.forEach((calc, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <div class="history-timestamp">${calc.timestamp}</div>
                <button class="delete-btn" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 0.5rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <div class="history-details">
                <div>Quantity: ${calc.quantity}</div>
                <div>Sourcing Price: Rs${calc.sourcingPrice}</div>
                <div>Total Cost: Rs${calc.totalCost}</div>
                <div>Selling Price: Rs${calc.sellingPrice}</div>
                <div>Gross Profit: Rs${calc.grossProfit}</div>
                <div>Gross Margin: ${calc.grossMargin}</div>
            </div>
        `;

        // Add click event listener to delete button
        const deleteBtn = historyItem.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => deleteHistoryItem(index));

        historyList.appendChild(historyItem);
    });
}

// Save calculation to history with animation
function saveToHistory() {
    const currentCalculation = {
        timestamp: new Date().toLocaleString(),
        quantity: inputs.quantity.value || '0',
        sourcingPrice: inputs.sourcingPrice.value || '0',
        carriage: inputs.carriage.value || '0',
        packaging: inputs.packaging.value || '0',
        shipping: inputs.shipping.value || '0',
        returns: inputs.returns.value || '0',
        sellingPrice: inputs.sellingPrice.value || '0',
        totalCost: results.totalCost.textContent,
        grossProfit: results.grossProfit.textContent,
        grossMargin: results.grossMargin.textContent,
        breakeven: results.breakeven.textContent
    };

    calculationHistory.unshift(currentCalculation);
    if (calculationHistory.length > 10) {
        calculationHistory.pop();
    }

    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
    updateHistoryDisplay();
    showNotification('Calculation saved successfully', 'success');
}

// Enhanced notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: type === 'success' ? '#10b981' : '#ef4444',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: '9999',
        animation: 'slideInRight 0.3s ease-out'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Event listeners
saveHistoryBtn.addEventListener('click', saveToHistory);
clearHistoryBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all history?')) {
        calculationHistory = [];
        localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
        updateHistoryDisplay();
        showNotification('History cleared successfully', 'success');
    }
});

// Initialize
updateHistoryDisplay();
calculateResults();