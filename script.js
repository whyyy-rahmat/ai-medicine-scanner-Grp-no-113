// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const medicineImage = document.getElementById('medicineImage');
const scanBtn = document.getElementById('scanBtn');
const resultSection = document.getElementById('resultSection');
const loader = document.getElementById('loader');
const resultContainer = document.getElementById('resultContainer');
const medicinePhoto = document.getElementById('medicinePhoto');
const medicineName = document.getElementById('medicineName');
const medicineGeneric = document.getElementById('medicineGeneric').querySelector('span');
const medicineDosage = document.getElementById('medicineDosage').querySelector('span');
const medicineManufacturer = document.getElementById('medicineManufacturer').querySelector('span');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

// API Endpoint (replace with your actual backend API)
const API_URL = 'https://api.example.com/medicine-scan';

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initializeEvents();
});

// Set up event listeners
function initializeEvents() {
    // Handle file upload area click
    uploadArea.addEventListener('click', () => {
        medicineImage.click();
    });

    // Handle file selection
    medicineImage.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                uploadArea.innerHTML = `
                    <img src="${event.target.result}" alt="Selected Medicine" style="max-width: 100%; max-height: 200px;">
                    <p>Image selected. Click "Scan Medicine" to analyze.</p>
                `;
            };
            
            reader.readAsDataURL(e.target.files[0]);
        }
    });

    // Handle scan button click
    scanBtn.addEventListener('click', handleScan);

    // Handle tab clicks
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            changeTab(tabId);
        });
    });
}

// Handle the scanning process
function handleScan() {
    if (!medicineImage.files || !medicineImage.files[0]) {
        showAlert('Please select an image of your medicine first!');
        return;
    }

    // Show scanner frame animation
    showScannerAnimation()
        .then(() => {
            // Show the result section with loader
            resultSection.style.display = 'block';
            resultContainer.style.display = 'none';
            loader.style.display = 'block';
            
            // Scroll to the result section
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
            // Call the API (with mock data for demo)
            setTimeout(processScanResults, 2000);  // Simulating API call
        });
}

// Show scanner animation
function showScannerAnimation() {
    return new Promise((resolve) => {
        const scannerFrame = document.querySelector('.scanner-frame');
        scannerFrame.style.display = 'block';
        
        // Animate scanning effect
        setTimeout(() => {
            scannerFrame.style.display = 'none';
            resolve();
        }, 1500);
    });
}

// Process scan results (this would normally come from the API)
function processScanResults() {
    // In a real application, this data would come from your backend API
    // This is mock data for demonstration purposes
    const mockData = {
        success: true,
        medicine: {
            name: 'Paracetamol 500mg',
            generic_name: 'Acetaminophen',
            dosage: '500mg Tablets',
            manufacturer: 'ABC Pharmaceuticals',
            image_url: 'https://example.com/medicine-image.jpg',
            details: {
                uses: 'Paracetamol is used to treat many conditions such as headache, muscle aches, arthritis, backache, toothaches, colds, and fevers. It relieves pain and reduces fever.',
                side_effects: 'Side effects may include nausea, stomach pain, loss of appetite, headache, yellowing of the skin or eyes (jaundice), and unusual tiredness. Serious allergic reactions are rare but possible.',
                dosage: 'For adults and children 12 years and older: 1-2 tablets every 4-6 hours as needed for pain or fever. Do not take more than 8 tablets in 24 hours, unless directed by a doctor.',
                warnings: 'Do not take with other products containing paracetamol. May cause liver damage if taken in large doses or with alcohol. Consult a doctor if symptoms persist for more than 3 days or if fever lasts more than 3 days.'
            }
        }
    };

    // Update the UI with the medicine information
    displayResults(mockData);
}

// Display the scan results in the UI
function displayResults(data) {
    if (!data.success) {
        showAlert('Could not identify the medicine. Please try again with a clearer image.');
        resultSection.style.display = 'none';
        return;
    }

    const medicine = data.medicine;
    
    // Update medicine basic info
    medicineName.textContent = medicine.name;
    medicineGeneric.textContent = medicine.generic_name;
    medicineDosage.textContent = medicine.dosage;
    medicineManufacturer.textContent = medicine.manufacturer;
    
    // Update medicine image if available
    if (medicine.image_url) {
        medicinePhoto.src = medicine.image_url;
    } else {
        // If no image from API, use the uploaded image
        medicinePhoto.src = URL.createObjectURL(medicineImage.files[0]);
    }
    
    // Update tab content
    document.getElementById('uses').innerHTML = `<p>${medicine.details.uses}</p>`;
    document.getElementById('sideEffects').innerHTML = `<p>${medicine.details.side_effects}</p>`;
    document.getElementById('dosage').innerHTML = `<p>${medicine.details.dosage}</p>`;
    document.getElementById('warnings').innerHTML = `<p>${medicine.details.warnings}</p>`;
    
    // Hide loader and show results
    loader.style.display = 'none';
    resultContainer.style.display = 'block';
}

// Change active tab
function changeTab(tabId) {
    // Update active tab button
    tabButtons.forEach(button => {
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    });
    
    // Update active tab content
    tabPanes.forEach(pane => {
        if (pane.id === tabId) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

// Show an alert message
function showAlert(message) {
    alert(message);
}

// In a real application, this would be the actual API call
async function callMedicineScanAPI(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            body: formData
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error calling API:', error);
        return { success: false, error: 'Network error' };
    }
} 