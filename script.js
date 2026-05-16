// Mobile menu toggle
function initMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    
    if (!menuToggle || !navLinks) return;
    
    function openMenu() {
        menuToggle.classList.add('active');
        menuToggle.setAttribute('aria-expanded', 'true');
        navLinks.classList.add('active');
        navLinks.setAttribute('aria-hidden', 'false');
        if (overlay) {
            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';
    }
    
    function closeMenu() {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinks.classList.remove('active');
        navLinks.setAttribute('aria-hidden', 'true');
        if (overlay) {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
    }
    
    menuToggle.addEventListener('click', function() {
        if (menuToggle.classList.contains('active')) {
            closeMenu();
        } else {
            openMenu();
        }
    });
    
    if (overlay) {
        overlay.addEventListener('click', closeMenu);
    }
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}

// Global close menu for smooth scroll
function closeMobileMenu() {
    const menuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const overlay = document.querySelector('.nav-overlay');
    
    if (menuToggle) {
        menuToggle.classList.remove('active');
        menuToggle.setAttribute('aria-expanded', 'false');
    }
    if (navLinks) {
        navLinks.classList.remove('active');
        navLinks.setAttribute('aria-hidden', 'true');
    }
    if (overlay) {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
}

// Smooth scroll for anchor links
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (!targetId || targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            
            const menuToggle = document.querySelector('.mobile-menu-toggle');
            const isMenuOpen = menuToggle && menuToggle.classList.contains('active');
            
            if (isMenuOpen) {
                closeMobileMenu();
                setTimeout(() => {
                    scrollToTarget(targetElement);
                }, 350);
            } else {
                scrollToTarget(targetElement);
            }
        });
    });
}

function scrollToTarget(element) {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    const navbarHeight = navbar.offsetHeight;
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - navbarHeight - 20;
    
    window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
    });
}

// Appointment form submission
function initAppointmentForm() {
    const form = document.querySelector('#appointment form') || document.querySelector('form');
    if (!form) return;
    
    // Check if we're editing an appointment
    const isEditing = form.dataset.editing === 'true';
    const editIndex = parseInt(form.dataset.editIndex) || -1;
    
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const doctor = form.querySelector('select').value;
            const date = form.querySelector('input[type="date"]').value;
            const time = form.querySelectorAll('select')[1].value;
            const name = form.querySelector('input[type="text"]').value;
            const ageInput = form.querySelector('input[type="number"]');
            const age = ageInput.value;
            const gender = form.querySelectorAll('select')[2].value;
            const email = form.querySelector('input[type="email"]').value;
            const phone = form.querySelector('input[type="tel"]').value;
            
            // Validate age
            if (age === '') {
                alert('Please enter your age');
                ageInput.focus();
                return;
            }
            
            const ageNum = parseInt(age);
            if (isNaN(ageNum) || ageNum < 0 || ageNum > 120) {
                alert('Please enter a valid age between 0 and 120');
                ageInput.focus();
                return;
            }
            
            // Check if already 2 appointments exist for the same doctor, date, and time
            let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
            const existingAppointments = appointments.filter(app => 
                app.doctor === doctor && 
                app.date === date && 
                app.time === time
            );
            
            if (!isEditing && existingAppointments.length >= 2) {
                alert('Sorry, this time slot is already fully booked. Please select another time.');
                return;
            }
            
            const appointment = {
                doctor: doctor,
                date: date,
                time: time,
                name: name,
                age: age,
                gender: gender,
                email: email,
                phone: phone,
                submittedAt: new Date().toISOString(),
                status: isEditing ? (JSON.parse(localStorage.getItem('appointments')) || [])[editIndex]?.status || 'pending' : 'pending'
            };
            
            if (isEditing && editIndex >= 0) {
                // Update existing appointment
                appointments[editIndex] = appointment;
                form.dataset.editing = 'false';
                delete form.dataset.editIndex;
                alert('Appointment updated successfully!');
            } else {
                // Add new appointment
                appointments.push(appointment);
                alert('Appointment request submitted successfully! We will contact you soon.');
            }
            
            localStorage.setItem('appointments', JSON.stringify(appointments));
            form.reset();
            loadAppointments();
        });
}

// Load appointments table and update statistics
function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const tbody = document.getElementById('appointmentsBody');
    if (!tbody) return;
    
    const noAppointmentsDiv = document.getElementById('noAppointments');
    const tableCard = document.querySelector('.table-card');
    
    // Update statistics
    updateStatistics(appointments);
    
    if (appointments.length === 0) {
        if (tableCard) tableCard.style.display = 'none';
        if (noAppointmentsDiv) noAppointmentsDiv.style.display = 'block';
        return;
    }
    
    if (tableCard) tableCard.style.display = 'block';
    if (noAppointmentsDiv) noAppointmentsDiv.style.display = 'none';
    
    tbody.innerHTML = '';
    
    appointments.forEach((appointment, index) => {
        const submittedDate = new Date(appointment.submittedAt);
        const formattedDate = submittedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusText = appointment.status === 'completed' ? 'Completed' : 'Pending';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${appointment.doctor}</td>
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${appointment.name}</td>
            <td class="hide-sm">${appointment.age}</td>
            <td class="hide-sm">${appointment.gender}</td>
            <td class="hide-md" title="${appointment.email}">${appointment.email}</td>
            <td class="hide-md">${appointment.phone}</td>
            <td><span class="status-badge ${appointment.status}">${statusText}</span></td>
            <td class="hide-sm">${formattedDate}</td>
            <td>
                <button onclick="toggleStatus(${index})" class="action-btn action-toggle" title="${statusText}">
                    <i class="fas ${appointment.status === 'completed' ? 'fa-check-circle' : 'fa-clock'}"></i>
                </button>
                <button onclick="deleteAppointment(${index})" class="action-btn action-delete" title="Delete" style="margin-left: 4px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Delete appointment
function deleteAppointment(index) {
    if (confirm('Are you sure you want to delete this appointment?')) {
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments.splice(index, 1);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        loadAppointments();
    }
}



// Toggle appointment status
function toggleStatus(index) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments[index].status = appointments[index].status === 'completed' ? 'pending' : 'completed';
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments();
}

// Update appointment status via dropdown
function changeStatus(index, newStatus) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments[index].status = newStatus;
    localStorage.setItem('appointments', JSON.stringify(appointments));
    loadAppointments();
}

// Clear all appointments
function clearAllAppointments() {
    if (confirm('Are you sure you want to delete all appointments? This cannot be undone.')) {
        localStorage.removeItem('appointments');
        loadAppointments();
    }
}

// Logout function
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userEmail');
    window.location.href = 'login.html';
}

// Update statistics display
function updateStatistics(appointments) {
    const total = appointments.length;
    const pending = appointments.filter(a => a.status === 'pending').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    
    // Calculate today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayAppointments = appointments.filter(a => a.date === today).length;
    
    // Update DOM elements
    document.getElementById('totalAppointments').textContent = total;
    document.getElementById('pendingAppointments').textContent = pending;
    document.getElementById('completedAppointments').textContent = completed;
    document.getElementById('todayAppointments').textContent = todayAppointments;
}

// Apply filters to appointments
function applyFilters() {
    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const statusFilter = document.getElementById('statusFilter')?.value || 'all';
    const dateFilter = document.getElementById('dateFilter')?.value || '';
    
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    const filteredAppointments = appointments.filter(appointment => {
        // Search filter
        const matchesSearch = !searchTerm ||
            appointment.name.toLowerCase().includes(searchTerm) ||
            appointment.doctor.toLowerCase().includes(searchTerm) ||
            appointment.email.toLowerCase().includes(searchTerm) ||
            appointment.phone.includes(searchTerm);
        
        // Status filter
        const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
        
        // Date filter
        const matchesDate = !dateFilter || appointment.date === dateFilter;
        
        return matchesSearch && matchesStatus && matchesDate;
    });
    
    renderAppointmentsTable(filteredAppointments);
    updateStatistics(filteredAppointments);
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('dateFilter').value = '';
    loadAppointments(); // Reload all appointments
}

// Render appointments table with given data
function renderAppointmentsTable(appointments) {
    const tbody = document.getElementById('appointmentsBody');
    if (!tbody) return;
    
    const noAppointmentsDiv = document.getElementById('noAppointments');
    const tableCard = document.querySelector('.table-card');
    const originalAppointments = JSON.parse(localStorage.getItem('appointments')) || [];
    
    if (appointments.length === 0) {
        if (tableCard) tableCard.style.display = 'none';
        if (noAppointmentsDiv) noAppointmentsDiv.style.display = 'block';
        return;
    }
    
    if (tableCard) tableCard.style.display = 'block';
    if (noAppointmentsDiv) noAppointmentsDiv.style.display = 'none';
    
    tbody.innerHTML = '';
    
    appointments.forEach((appointment, index) => {
        const submittedDate = new Date(appointment.submittedAt);
        const formattedDate = submittedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const statusText = appointment.status === 'completed' ? 'Completed' : 'Pending';
        const originalIndex = originalAppointments.indexOf(appointment);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${appointment.doctor}</td>
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${appointment.name}</td>
            <td class="hide-sm">${appointment.age}</td>
            <td class="hide-sm">${appointment.gender}</td>
            <td class="hide-md" title="${appointment.email}">${appointment.email}</td>
            <td class="hide-md">${appointment.phone}</td>
            <td><span class="status-badge ${appointment.status}">${statusText}</span></td>
            <td class="hide-sm">${formattedDate}</td>
            <td>
                <button onclick="toggleStatus(${originalIndex})" class="action-btn action-toggle" title="${statusText}">
                    <i class="fas ${appointment.status === 'completed' ? 'fa-check-circle' : 'fa-clock'}"></i>
                </button>
                <button onclick="deleteAppointment(${originalIndex})" class="action-btn action-delete" title="Delete" style="margin-left: 4px;">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Initialize all
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initAppointmentForm();
    loadAppointments();
    
    // Add event listeners for search and filters
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
});

// Make functions globally available
window.deleteAppointment = deleteAppointment;
window.changeStatus = changeStatus;
window.clearAllAppointments = clearAllAppointments;
window.logout = logout;
window.applyFilters = applyFilters;
window.resetFilters = resetFilters;