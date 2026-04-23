// content.js - Injected into government portals

let govEaseEnabled = true;

// Listen for custom event from background script
window.addEventListener('govEaseFillForm', () => {
  fillAllForms();
});

// Auto-fill when page loads
window.addEventListener('load', () => {
  setTimeout(() => {
    if (govEaseEnabled) {
      checkAndFill();
    }
  }, 1500);
});

// Add floating action button
function addFloatingButton() {
  if (document.querySelector('.govease-fab')) return;
  
  const fab = document.createElement('button');
  fab.className = 'govease-fab';
  fab.innerHTML = '🤖';
  fab.title = 'GovEase AI - Auto-fill form';
  fab.onclick = () => fillAllForms();
  document.body.appendChild(fab);
}

function checkAndFill() {
  chrome.storage.local.get(['userData', 'settings'], (result) => {
    if (result.userData && result.settings?.autoFillEnabled) {
      fillFormsWithData(result.userData);
    }
  });
}

function fillAllForms() {
  chrome.storage.local.get(['userData'], (result) => {
    if (result.userData) {
      fillFormsWithData(result.userData);
    } else {
      showNotification('No data found. Upload your IC in the extension first!', 'warning');
    }
  });
}

function fillFormsWithData(userData) {
  const fieldMappings = {
    // Malay labels
    'nama penuh': userData.name,
    'nama': userData.name,
    'full name': userData.name,
    'name': userData.name,
    
    'no. kp': userData.ic_number,
    'no kp': userData.ic_number,
    'no kad pengenalan': userData.ic_number,
    'ic number': userData.ic_number,
    'mykad': userData.ic_number,
    'identification number': userData.ic_number,
    
    'alamat': userData.address,
    'address': userData.address,
    'jalan': userData.address,
    
    'tarikh lahir': userData.dob,
    'date of birth': userData.dob,
    'dob': userData.dob,
    'birth date': userData.dob,
    
    'no telefon': userData.phone,
    'phone number': userData.phone,
    'mobile': userData.phone,
    
    'email': userData.email,
    'e-mel': userData.email
  };
  
  let filledCount = 0;
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="password"]), textarea, select');
  
  inputs.forEach(input => {
    if (input.disabled || input.readOnly) return;
    
    const label = findLabelForInput(input);
    const lowerLabel = (label || input.placeholder || input.name || input.id || '').toLowerCase();
    
    for (const [key, value] of Object.entries(fieldMappings)) {
      if (lowerLabel.includes(key) && value && value !== 'null') {
        input.value = value;
        input.classList.add('govease-filled');
        filledCount++;
        
        // Trigger change event so form recognizes the fill
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        break;
      }
    }
  });
  
  addFloatingButton();
  
  if (filledCount > 0) {
    showNotification(`✅ GovEase AI filled ${filledCount} fields for you! Please review before submitting.`);
    scrollToFirstField();
  } else {
    showNotification('⚠️ No matching fields found on this form. Try a different page.', 'warning');
  }
  
  console.log(`[GovEase] Filled ${filledCount} fields`);
}

function findLabelForInput(input) {
  if (input.labels && input.labels.length > 0) {
    return input.labels[0].innerText;
  }
  
  const id = input.id;
  if (id) {
    let label = document.querySelector(`label[for="${id}"]`);
    if (label) return label.innerText;
    
    // Check for wrapped label
    label = document.querySelector(`label:has(#${id})`);
    if (label) return label.innerText;
  }
  
  // Check previous sibling
  let prev = input.previousElementSibling;
  if (prev && prev.tagName === 'LABEL') return prev.innerText;
  
  // Check parent
  let parent = input.parentElement;
  if (parent && parent.tagName === 'LABEL') return parent.innerText;
  
  // Check grandparent
  if (parent && parent.parentElement && parent.parentElement.tagName === 'LABEL') {
    return parent.parentElement.innerText;
  }
  
  return '';
}

function scrollToFirstField() {
  const firstFilled = document.querySelector('.govease-filled');
  if (firstFilled) {
    firstFilled.scrollIntoView({ behavior: 'smooth', block: 'center' });
    firstFilled.style.backgroundColor = '#c8e6c9';
    setTimeout(() => {
      firstFilled.style.backgroundColor = '#e8f5e9';
    }, 1000);
  }
}

function showNotification(message, type = 'success') {
  const existing = document.querySelector('.govease-notification');
  if (existing) existing.remove();
  
  const notif = document.createElement('div');
  notif.className = 'govease-notification';
  notif.innerHTML = message;
  notif.style.background = type === 'warning' 
    ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' 
    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  
  document.body.appendChild(notif);
  
  setTimeout(() => {
    notif.style.opacity = '0';
    setTimeout(() => notif.remove(), 300);
  }, 4000);
}

// Listen for dynamic form changes (SPA support)
const observer = new MutationObserver(() => {
  checkAndFill();
});
observer.observe(document.body, { childList: true, subtree: true });