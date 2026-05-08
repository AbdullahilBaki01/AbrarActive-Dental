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
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const appointment = {
            doctor: form.querySelector('select').value,
            date: form.querySelector('input[type="date"]').value,
            time: form.querySelectorAll('select')[1].value,
            name: form.querySelector('input[type="text"]').value,
            age: form.querySelector('input[type="number"]').value,
            gender: form.querySelectorAll('select')[2].value,
            email: form.querySelector('input[type="email"]').value,
            phone: form.querySelector('input[type="tel"]').value,
            notes: form.querySelector('textarea').value,
            submittedAt: new Date().toISOString()
        };
        
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        appointments.push(appointment);
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        alert('Appointment request submitted successfully! We will contact you soon.');
        form.reset();
    });
}

// Load appointments table
function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const tbody = document.getElementById('appointmentsBody');
    if (!tbody) return;
    
    const noAppointmentsDiv = document.getElementById('noAppointments');
    const tableWrapper = document.querySelector('.table-responsive');
    
    if (appointments.length === 0) {
        if (tableWrapper) tableWrapper.style.display = 'none';
        if (noAppointmentsDiv) noAppointmentsDiv.style.display = 'block';
        return;
    }
    
    if (tableWrapper) tableWrapper.style.display = 'block';
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
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${appointment.doctor}</td>
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${appointment.name}</td>
            <td>${appointment.age}</td>
            <td>${appointment.gender}</td>
            <td>${appointment.email}</td>
            <td>${appointment.phone}</td>
            <td class="notes-cell" title="${appointment.notes || ''}">${appointment.notes || '-'}</td>
            <td class="submitted-cell">${formattedDate}</td>
            <td><button onclick="deleteAppointment(${index})" style="background: #c00; color: white; border: none; padding: 6px 12px; border-radius: 15px; cursor: pointer; font-size: 12px;"><i class="fas fa-trash"></i> Delete</button></td>
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

// Clear all appointments
function clearAllAppointments() {
    if (confirm('Are you sure you want to delete all appointments? This cannot be undone.')) {
        localStorage.removeItem('appointments');
        loadAppointments();
    }
}

// Initialize all
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initSmoothScroll();
    initAppointmentForm();
    loadAppointments();
});

// Make functions globally available
window.deleteAppointment = deleteAppointment;
window.clearAllAppointments = clearAllAppointments;
