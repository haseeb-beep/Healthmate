/* --- DATABASE SIMULATION --- */
const db = {
    get: (key) => JSON.parse(localStorage.getItem(key)) || [],
    set: (key, val) => localStorage.setItem(key, JSON.stringify(val)),
    init: () => {
        if (!localStorage.getItem('hm_users')) {
            // Seed Data if empty
            const users = [
                { id: 'u1', name: 'Admin User', email: 'admin', pass: '123', role: 'admin', spec: 'System' },
                { id: 'u2', name: 'Dr. Sarah Smith', email: 'doctor', pass: '123', role: 'doctor', spec: 'Cardiology' },
                { id: 'u3', name: 'John Doe', email: 'patient', pass: '123', role: 'patient', history: 'No major allergies.' }
            ];
            const appts = [
                { id: 'a1', patId: 'u3', docId: 'u2', patName: 'John Doe', date: '2023-11-25', status: 'Pending', diagnosis: null }
            ];
            db.set('hm_users', users);
            db.set('hm_appts', appts);
        }
    }
};

// Initialize DB on load
db.init();

// State
let currentUser = JSON.parse(localStorage.getItem('hm_currentUser'));
let currentPatientId = null;

/* --- AUTHENTICATION --- */

const bookApptForm = document.getElementById('bookApptForm');
const addDocForm = document.getElementById('addDocForm');

function showAuth(type) {
    try {
        // 1. Navigate to Auth Page
        showPage('auth-page'); 

        const isLogin = type === 'login';
        
        // Find required elements
        const authForm = document.getElementById('authForm');
        const authTitle = document.getElementById('authTitle');
        const authSubmitBtn = document.getElementById('authSubmitBtn');
        const signupFields = document.getElementById('signupFields');
        const authToggle = document.getElementById('authToggle');

        if (!authForm || !authTitle || !authSubmitBtn || !signupFields || !authToggle) {
            console.error("Critical Auth UI elements are missing from the DOM.");
            return; 
        }

        // 2. Update UI text and visibility
        authTitle.innerText = isLogin ? 'Welcome Back' : 'Join HealthMate';
        authSubmitBtn.innerText = isLogin ? 'Login' : 'Sign Up';
        signupFields.classList.toggle('d-none', isLogin);
        authToggle.innerText = isLogin ? 'New here? Create an account' : 'Already have an account? Login';
        
        // 3. Set Toggle link handler (Added preventDefault fix)
        authToggle.onclick = (e) => {
            e.preventDefault(); 
            showAuth(isLogin ? 'signup' : 'login');
        };
        
        // 4. Set Form submission handler
        authForm.onsubmit = (e) => {
            e.preventDefault();
            isLogin ? handleLogin() : handleSignup();
        };

    } catch (error) {
        console.error("Error navigating to Auth page:", error);
        alert("An application error occurred during navigation. Check console for details.");
    }
}

function handleLogin() {
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    const users = db.get('hm_users');
    const user = users.find(u => u.email === email && u.pass === pass);

    if (user) {
        localStorage.setItem('hm_currentUser', JSON.stringify(user));
        currentUser = user;
        routeUser();
    } else {
        alert('Invalid credentials! (Try: admin/123, doctor/123, patient/123)');
    }
}

function handleSignup() {
    const name = document.getElementById('authName').value;
    const email = document.getElementById('authEmail').value;
    const pass = document.getElementById('authPass').value;
    const role = document.getElementById('authRole').value;
    
    // Basic validation
    if (!name || !email || !pass) return alert('Please fill all required fields.');

    const users = db.get('hm_users');
    if (users.find(u => u.email === email)) return alert('User exists!');
    
    const newUser = { id: 'u' + Date.now(), name, email, pass, role, history: role === 'patient' ? 'New Patient' : null };
    users.push(newUser);
    db.set('hm_users', users);
    alert('Account created! Please login.');
    showAuth('login');
}

function logout() {
    localStorage.removeItem('hm_currentUser');
    currentUser = null;
    showPage('landing-page');
    updateNav();
}

/* --- NAVIGATION & ROUTING --- */
function routeUser() {
    updateNav();
    if (!currentUser) return showPage('landing-page');
    
    if (currentUser.role === 'patient') loadPatientDash();
    else if (currentUser.role === 'doctor') loadDoctorDash();
    else if (currentUser.role === 'admin') loadAdminDash();
}

function showPage(pageId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('d-none'));
    const pageElement = document.getElementById(pageId);
    if (pageElement) {
        pageElement.classList.remove('d-none');
        window.scrollTo(0,0);
    }
}

function updateNav() {
    document.querySelectorAll('.auth-hidden').forEach(el => el.classList.toggle('d-none', !!currentUser));
    document.querySelectorAll('.auth-visible').forEach(el => el.classList.toggle('d-none', !currentUser));
    if (currentUser) document.getElementById('navUserDisplay').innerText = `Hi, ${currentUser.name.split(' ')[0]}`;
}

/* --- PATIENT LOGIC --- */
function loadPatientDash() {
    showPage('patient-dashboard');
    const appts = db.get('hm_appts').filter(a => a.patId === currentUser.id);
    
    // Stats
    const upcomingAppts = appts.filter(a => new Date(a.date) >= new Date()).sort((a,b) => new Date(a.date) - new Date(b.date));
    const nextAppt = upcomingAppts[0];
    document.getElementById('patNextAppt').innerText = nextAppt ? `${nextAppt.date} with ${db.get('hm_users').find(u => u.id === nextAppt.docId)?.name || 'Unknown'}` : 'No upcoming visits';
    
    // Table
    const tbody = document.getElementById('patApptTable');
    tbody.innerHTML = appts.length ? appts.map(a => {
        const docName = db.get('hm_users').find(u => u.id === a.docId)?.name || 'Unknown';
        return `<tr><td>${a.date}</td><td>${docName}</td><td><span class="badge ${a.status==='Completed'?'bg-success':'bg-warning'} rounded-pill">${a.status}</span></td></tr>`;
    }).join('') : '<tr><td colspan="3" class="text-center text-muted p-4">No appointments found.</td></tr>';

    // Records
    const completed = appts.filter(a => a.status === 'Completed' && a.diagnosis);
    if(completed.length > 0) {
        const latest = completed[completed.length-1];
        document.getElementById('patBP').innerText = latest.diagnosis.bp || '--/--';
        document.getElementById('patHistoryText').innerText = latest.diagnosis.notes;
    } else {
        document.getElementById('patBP').innerText = '--/--';
        document.getElementById('patHistoryText').innerText = currentUser.history || 'No records found.';
    }
    
    document.getElementById('patPrescList').innerHTML = completed.map(a => `
        <div class="list-group-item border-0 border-bottom">
            <div class="d-flex justify-content-between">
                <h6 class="mb-1 text-teal fw-bold">Diagnosis: ${a.diagnosis.notes.substring(0, 30)}...</h6>
                <small class="text-muted">${a.date}</small>
            </div>
            <p class="mb-1 small text-dark"><i class="bi bi-prescription2 me-1"></i> ${a.diagnosis.presc}</p>
        </div>
    `).join('') || '<div class="p-3 text-muted text-center">No prescriptions yet.</div>';

    // Populate Booking Modal
    const docs = db.get('hm_users').filter(u => u.role === 'doctor');
    document.getElementById('bookDocSelect').innerHTML = docs.map(d => `<option value="${d.id}">${d.name} - ${d.spec}</option>`).join('');
}

// Book Appt Handler
if (bookApptForm) {
    bookApptForm.onsubmit = (e) => {
        e.preventDefault();
        const docId = document.getElementById('bookDocSelect').value;
        const date = document.getElementById('bookDate').value;
        
        if (!docId || !date) return alert('Please select a doctor and date.');

        const appts = db.get('hm_appts');
        
        appts.push({
            id: 'a' + Date.now(), patId: currentUser.id, docId, patName: currentUser.name, date, status: 'Pending', diagnosis: null
        });
        db.set('hm_appts', appts);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('bookApptModal'));
        if (modal) modal.hide();
        
        loadPatientDash();
        alert('Appointment Booked Successfully!');
    };
}


/* --- DOCTOR LOGIC --- */
window.selectPatient = (apptId, patId, patName) => {
    document.getElementById('docSelectPrompt').style.display = 'none';
    const view = document.getElementById('docPatientView');
    view.style.display = 'block';
    view.classList.add('animate-fade');
    
    currentPatientId = patId; 
    document.getElementById('docPatName').innerText = patName;
    document.getElementById('diagnosisForm').setAttribute('data-appt-id', apptId);
    
    // Clear form fields
    document.getElementById('diagnosisForm').reset();
    
    // Load Patient History
    const allAppts = db.get('hm_appts').filter(a => a.patId === patId && a.status === 'Completed');
    document.getElementById('docPatHistoryList').innerHTML = allAppts.map(a => 
        `<li class="list-group-item bg-transparent"><b>${a.date}:</b> ${a.diagnosis.notes} (Rx: ${a.diagnosis.presc})</li>`
    ).join('') || '<li class="list-group-item bg-transparent text-muted">No previous history.</li>';
}


function loadDoctorDash() {
    showPage('doctor-dashboard');
    const appts = db.get('hm_appts').filter(a => a.docId === currentUser.id && a.status !== 'Completed');
    
    const list = document.getElementById('docApptList');
    list.innerHTML = appts.length ? appts.map(a => `
        <button class="list-group-item list-group-item-action py-3" onclick="selectPatient('${a.id}', '${a.patId}', '${a.patName}')">
            <div class="d-flex w-100 justify-content-between align-items-center">
                <h6 class="mb-0 fw-bold">${a.patName}</h6>
                <small class="badge bg-light text-dark border">${a.date}</small>
            </div>
            <small class="text-teal mt-1 d-block">Click to diagnose</small>
        </button>
    `).join('') : '<div class="p-4 text-muted text-center">No pending appointments today.</div>';

    // Ensure prompt is visible if no patient is selected
    if (!currentPatientId) {
        document.getElementById('docPatientView').style.display = 'none';
        document.getElementById('docSelectPrompt').style.display = 'block';
    }
}

// NEW FUNCTION: Filters the doctor appointment list by patient name
window.filterDoctorAppointments = () => {
    const filterText = document.getElementById('docApptSearch').value.toLowerCase();
    const apptList = document.getElementById('docApptList');
    const appointments = apptList.getElementsByTagName('button');

    for (let i = 0; i < appointments.length; i++) {
        const button = appointments[i];
        // The patient name is in an h6 element inside the button
        const patientName = button.querySelector('h6').innerText.toLowerCase();
        
        if (patientName.includes(filterText)) {
            button.style.display = ""; // Show the appointment
        } else {
            button.style.display = "none"; // Hide the appointment
        }
    }
}

window.saveDiagnosis = () => {
    const apptId = document.getElementById('diagnosisForm').getAttribute('data-appt-id');
    const diagNotes = document.getElementById('diagNotes').value;

    if (!diagNotes) return alert('Diagnosis Notes are required.');

    const appts = db.get('hm_appts');
    const idx = appts.findIndex(a => a.id === apptId);
    
    if (idx > -1) {
        appts[idx].status = 'Completed';
        appts[idx].diagnosis = {
            bp: document.getElementById('diagBP').value || 'N/A',
            weight: document.getElementById('diagWeight').value || 'N/A',
            notes: diagNotes,
            presc: document.getElementById('diagPresc').value || 'None',
            timestamp: new Date().toLocaleString()
        };
        db.set('hm_appts', appts);
        alert('Consultation Complete. Record Saved.');
        document.getElementById('diagnosisForm').reset();
        document.getElementById('docPatientView').style.display = 'none';
        document.getElementById('docSelectPrompt').style.display = 'block';
        loadDoctorDash();
    } else {
        alert('Error: Could not find appointment to update.');
    }
}

/* --- ADMIN LOGIC --- */
function loadAdminDash() {
    showPage('admin-dashboard');
    const users = db.get('hm_users');
    const appts = db.get('hm_appts');
    
    // Stats
    document.getElementById('statPat').innerText = users.filter(u => u.role === 'patient').length;
    document.getElementById('statDoc').innerText = users.filter(u => u.role === 'doctor').length;
    document.getElementById('statAppt').innerText = appts.length;
    
    // Doc Table
    const tbody = document.getElementById('adminDocTable');
    tbody.innerHTML = users.filter(u => u.role === 'doctor').map(d => `
        <tr>
            <td class="fw-bold">${d.name}</td>
            <td>${d.spec}</td>
            <td><span class="badge bg-success rounded-pill">Active</span></td>
            <td><button class="btn btn-sm btn-outline-danger" onclick="deleteUser('${d.id}')"><i class="bi bi-trash"></i></button></td>
        </tr>
    `).join('');
    
    // Reset filter display on load
    document.getElementById('adminDocSearch').value = '';
    filterAdminDoctors();
}

// NEW FUNCTION: Filters the doctor registry table
window.filterAdminDoctors = () => {
    const filterText = document.getElementById('adminDocSearch').value.toLowerCase();
    const table = document.getElementById('adminDocTable'); // The table body
    const rows = table.getElementsByTagName('tr');

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        // Get the Name (td[0]) and Specialty (td[1]) columns
        const nameCell = row.cells[0].innerText.toLowerCase();
        const specCell = row.cells[1].innerText.toLowerCase();
        
        if (nameCell.includes(filterText) || specCell.includes(filterText)) {
            row.style.display = ""; // Show the row
        } else {
            row.style.display = "none"; // Hide the row
        }
    }
}


// Add Doctor
if (addDocForm) {
    addDocForm.onsubmit = (e) => {
        e.preventDefault();
        const users = db.get('hm_users');
        
        const newDocUser = document.getElementById('newDocUser').value;

        if (users.find(u => u.email === newDocUser)) return alert('Username/Email already exists.');

        users.push({
            id: 'u' + Date.now(),
            name: document.getElementById('newDocName').value,
            spec: document.getElementById('newDocSpec').value,
            email: newDocUser,
            pass: document.getElementById('newDocPass').value,
            role: 'doctor'
        });
        db.set('hm_users', users);
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('addDocModal'));
        if (modal) modal.hide();
        
        addDocForm.reset();
        loadAdminDash();
    };
}


window.deleteUser = (id) => {
    // Prevent deleting the main seeded accounts
    if (id === 'u1' || id === 'u2') {
        return alert('Cannot delete core seeded admin or doctor account in prototype.');
    }
    
    if(confirm('Are you sure you want to remove this doctor?')) {
        const users = db.get('hm_users').filter(u => u.id !== id);
        db.set('hm_users', users);
        loadAdminDash();
    }
};

// Initial Router Call - IMPORTANT FIX: Use DOMContentLoaded for proper script execution
document.addEventListener('DOMContentLoaded', routeUser);