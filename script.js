// Appointment form submission handler
function initAppointmentForm() {
    const form = document.querySelector('#appointment form') || document.querySelector('form');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form values
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
        
        // Get existing appointments or initialize empty array
        let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
        
        // Add new appointment
        appointments.push(appointment);
        
        // Save to localStorage
        localStorage.setItem('appointments', JSON.stringify(appointments));
        
        // Show success message
        alert('Appointment request submitted successfully! We will contact you soon.');
        
        // Reset form
        form.reset();
    });
}

// Load and display appointments in table
function loadAppointments() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    const tbody = document.getElementById('appointmentsBody');
    
    if (!tbody) return;
    
    const noAppointmentsDiv = document.getElementById('noAppointments');
    const tableWrapper = document.querySelector('.table-responsive') || document.querySelector('.table-wrapper');
    
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
        `;
        
        tbody.appendChild(row);
    });
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
    initAppointmentForm();
    loadAppointments();
});
