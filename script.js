// Retrieve the username from localStorage
const username = localStorage.getItem('username');
// Display the username in the navbar
document.getElementById('usernameDisplay').textContent = username ? username : 'Guest';

document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('attendanceDate').addEventListener('change', handleDateChange, false);

let attendanceData = [];
let attendanceDates = [];
let selectedDate = '';

function handleFile(event) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

        console.log(jsonData); // Log the data to the console for debugging

        if (jsonData.length > 1) {
            jsonData.slice(1).forEach(row => {
                const uid = row[0]; // First column for UID
                const name = row[1]; // Second column for Name
                const presentClasses = row[2] || 0; // Third column for Present Classes
                const totalClasses = row[3] || 0; // Fourth column for Total Classes
                const attendancePercentage = row[4] || 0; // Fifth column for Attendance Percentage

                attendanceData.push({
                    uid,
                    name,
                    presentClasses,
                    totalClasses,
                    attendancePercentage,
                    attendance: {} // Initialize attendance as an object
                });
            });
        }

        renderTable();
    };

    reader.readAsArrayBuffer(file);
}

function handleDateChange(event) {
    selectedDate = event.target.value; // Get the selected date
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    attendanceData.forEach((student, index) => {
        const row = document.createElement('tr');
        const presentButtonClass = student.attendance[selectedDate] === 'Present' ? 'button-present' : '';
        const absentButtonClass = student.attendance[selectedDate] === 'Absent' ? 'button-absent' : '';

        row.innerHTML = `
            <td>${index + 1}</td> <!-- Serial Number -->
            <td>${student.uid}</td>
            <td>${student.name}</td>
            <td>${student.presentClasses}</td>
            <td>${student.totalClasses}</td>
            <td>${student.attendancePercentage}%</td>
            <td>
                <button class="${presentButtonClass}" onclick="markAttendance(${index}, 'Present')">Present</button>
                <button class="${absentButtonClass}" onclick="markAttendance(${index}, 'Absent')">Absent</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

function markAttendance(index, status) {
    if (!selectedDate) {
        alert("Please select a date for attendance.");
        return;
    }

    // Add the selected date to the attendanceDates array if it's not already there
    if (!attendanceDates.includes(selectedDate)) {
        attendanceDates.push(selectedDate); // This ensures new dates are added
    }

    const currentAttendance = attendanceData[index].attendance[selectedDate];

    // Update attendance based on the current status
    if (status === 'Present') {
        if (currentAttendance === 'Present') {
            alert("Already marked as Present for this date.");
            return;
        } else if (currentAttendance === 'Absent') {
            attendanceData[index].presentClasses += 1; // Increase present count
        } else {
            attendanceData[index].totalClasses += 1; // Increase total classes
            attendanceData[index].presentClasses += 1; // Increase present count
        }
        attendanceData[index].attendance[selectedDate] = 'Present'; // Add new date entry
    } else if (status === 'Absent') {
        if (currentAttendance === 'Absent') {
            alert("Already marked as Absent for this date.");
            return;
        } else if (currentAttendance === 'Present') {
            attendanceData[index].presentClasses -= 1; // Decrease present count
        } else {
            attendanceData[index].totalClasses += 1; // Increase total classes
        }
        attendanceData[index].attendance[selectedDate] = 'Absent'; // Add new date entry
    }

    // Calculate attendance percentage
    if (attendanceData[index].totalClasses > 0) {
        attendanceData[index].attendancePercentage = (
            (attendanceData[index].presentClasses / attendanceData[index].totalClasses) * 100
        ).toFixed(2);
    } else {
        attendanceData[index].attendancePercentage = 0; // Handle case where totalClasses is 0
    }

    renderTable(); // Re-render the table to show updated data
}

function exportToExcel() {
    const wsData = attendanceData.map(student => {
        const attendanceRecord = {
            UID: student.uid,
            Name: student.name,
            PresentClasses: student.presentClasses,
            TotalClasses: student.totalClasses,
            AttendancePercentage: student.attendancePercentage,
        };

        // Add attendance status for each unique date
        attendanceDates.forEach(date => {
            attendanceRecord[date] = student.attendance[date] || ''; // Add attendance status or empty if not marked
        });

        return attendanceRecord;
    });

    // Create headers based on attendanceDates
    const headers = ['UID', 'Name', 'PresentClasses', 'TotalClasses', 'AttendancePercentage', ...attendanceDates];

    // Convert data to worksheet
    const ws = XLSX.utils.json_to_sheet(wsData, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    // Save the file
    XLSX.writeFile(wb, 'attendance_data.xlsx');
}

// Show add student popup
function showAddStudentPopup() {
    const existingPopup = document.getElementById('addStudentPopup');
    if (existingPopup && existingPopup.parentNode) {
        existingPopup.parentNode.removeChild(existingPopup);
    }

    const popup = document.createElement('div');
    popup.id = 'addStudentPopup';
    popup.className = 'popup';
    popup.innerHTML = `
        <h2>Add New Student</h2>
        <input type="text" id="newStudentUID" placeholder="Enter UID" required />
        <input type="text" id="newStudentName" placeholder="Enter Name" required />
        <input type="number" id="newPresentClasses" placeholder="Present Classes" value="0" required />
        <input type="number" id="newTotalClasses" placeholder="Total Classes" value="0" required />
        <button id="addStudentButton">Add Student</button>
        <button id="closeAddPopup">Close</button>
    `;
    document.getElementById('inputContainer').appendChild(popup);

    document.getElementById('addStudentButton').addEventListener('click', addNewStudent);
    document.getElementById('closeAddPopup').addEventListener('click', () => {
        const popup = document.getElementById('addStudentPopup');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    });
}

// Function to add a new student
function addNewStudent() {
    const uid = document.getElementById('newStudentUID').value;
    const name = document.getElementById('newStudentName').value;
    const presentClasses = parseInt(document.getElementById('newPresentClasses').value) || 0;
    const totalClasses = parseInt(document.getElementById('newTotalClasses').value) || 0;

    if (!uid || !name) {
        alert("UID and Name are required.");
        return;
    }

    attendanceData.push({
        uid,
        name,
        presentClasses,
        totalClasses,
        attendancePercentage: totalClasses > 0 ? ((presentClasses / totalClasses) * 100).toFixed(2) : 0,
        attendance: {}
    });

    alert("New student added successfully!");

    const popup = document.getElementById('addStudentPopup');
    if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup);
    }

    renderTable();
}
//
//
//
//
//

// Add event listeners for dropdown items
document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function() {
        const value = this.getAttribute('data-value');
        if (value === 'addStudent') {
            showAddStudentPopup();
        } else if (value === 'editName') {
            showEditPopup();
        } else if (value === 'deleteStudent') {
            showDeleteStudentPopup();
        } else if (value === 'showStudentDetail') {
            showStudentDetailPopup();
        } else if (value === 'downloadPDF') {
            showExportPDFPopup();
        } else if (value === 'generateAnalyticsReport') {
            generateAnalyticsReport();
        }
    });
});
// Show edit name popup
function showEditPopup() {
    const existingPopup = document.getElementById('editStudentPopup');
    if (existingPopup && existingPopup.parentNode) {
        existingPopup.parentNode.removeChild(existingPopup);
    }

    const popup = document.createElement('div');
    popup.id = 'editStudentPopup';
    popup.className = 'popup';
    popup.innerHTML = `
        <h2>Edit Student Name</h2>
        <input type="text" id="editStudentUID" placeholder="Enter UID" required />
        <input type="text" id="editStudentName" placeholder="Enter New Name" required />
        <button id="editStudentButton">Edit Name</button>
        <button id="closeEditPopup">Close</button>
    `;
    document.getElementById('inputContainer').appendChild(popup);

    document.getElementById('editStudentButton').addEventListener('click', editStudentName);
    document.getElementById('closeEditPopup').addEventListener('click', () => {
        const popup = document.getElementById('editStudentPopup');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    });
}

// Function to edit the student's name
function editStudentName() {
    const uid = document.getElementById('editStudentUID').value;
    const newName = document.getElementById('editStudentName').value;

    if (!uid || !newName) {
        alert("UID and New Name are required.");
        return;
    }

    const student = attendanceData.find(student => student.uid === uid);
    if (student) {
        student.name = newName;
        alert("Student name updated successfully!");
    } else {
        alert("Student with this UID not found.");
    }

    const popup = document.getElementById('editStudentPopup');
    if (popup && popup.parentNode) {
        popup.parentNode.removeChild(popup);
    }

    renderTable();
}

// Show delete student popup
function showDeleteStudentPopup() {
    const existingPopup = document.getElementById('deleteStudentPopup');
    if (existingPopup && existingPopup.parentNode) {
        existingPopup.parentNode.removeChild(existingPopup);
    }

    const popup = document.createElement('div');
    popup.id = 'deleteStudentPopup';
    popup.className = 'popup';
    popup.innerHTML = `
        <h2>Delete Student</h2>
        <input type="text" id="deleteStudentUID" placeholder="Enter UID" required />
        <button id="deleteStudentButton">Delete Student</button>
        <button id="closeDeletePopup">Close</button>
    `;
    document.getElementById('inputContainer').appendChild(popup);

    document.getElementById('deleteStudentButton').addEventListener('click', deleteStudent);
    document.getElementById('closeDeletePopup').addEventListener('click', () => {
        const popup = document.getElementById('deleteStudentPopup');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    });
}

// Function to delete the student
function deleteStudent() {
    const uid = document.getElementById('deleteStudentUID').value;

    if (!uid) {
        alert("UID is required.");
        return;
    }

    const studentIndex = attendanceData.findIndex(student => student.uid === uid);
    if (studentIndex !== -1) {
        attendanceData.splice(studentIndex, 1);
        alert("Student deleted successfully!");

        const popup = document.getElementById('deleteStudentPopup');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }

        renderTable();
    } else {
        alert("Student with this UID not found.");
    }
}

// Show student detail popup
function showStudentDetailPopup() {
    const uid = prompt("Enter Student UID:");

    if (!uid) {
        alert("UID is required.");
        return;
    }

    const student = attendanceData.find(student => student.uid === uid);
    if (!student) {
        alert("Student with this UID not found.");
        return;
    }

    const existingPopup = document.getElementById('studentDetailPopup');
    if (existingPopup && existingPopup.parentNode) {
        existingPopup.parentNode.removeChild(existingPopup);
    }

    const popup = document.createElement('div');
    popup.id = 'studentDetailPopup';
    popup.className = 'popup';
    popup.innerHTML = `
        <h2>Student Details</h2>
        <p><strong>UID:</strong> ${student.uid}</p>
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>Present Classes:</strong> ${student.presentClasses}</p>
        <p><strong>Total Classes:</strong> ${student.totalClasses}</p>
        <p><strong>Attendance Percentage:</strong> ${student.attendancePercentage}%</p>
        <button id="closeStudentDetailPopup">Close</button>
    `;
    document.getElementById('inputContainer').appendChild(popup);

    document.getElementById('closeStudentDetailPopup').addEventListener('click', () => {
        const popup = document.getElementById('studentDetailPopup');
        if (popup && popup.parentNode) {
            popup.parentNode.removeChild(popup);
        }
    });
}

// Generate analytics report
function generateAnalyticsReport() {
    if (!selectedDate) {
        alert("Please select a date for the analytics report.");
        return;
    }

    const totalStudents = attendanceData.length;
    let totalPresentClasses = 0;
    let totalAbsentClasses = 0;

    attendanceData.forEach(student => {
        if (student.attendance[selectedDate] === 'Present') {
            totalPresentClasses++;
        } else if (student.attendance[selectedDate] === 'Absent') {
            totalAbsentClasses++;
        }
    });

    // Create analytics report
    const report = document.createElement('div');
    report.id = 'analyticsReport';
    report.className = 'popup';
    report.innerHTML = `
        <h2>Analytics Report for ${selectedDate}</h2>
        <p><strong>Total Students:</strong> ${totalStudents}</p>
        <p><strong>Total Present:</strong> ${totalPresentClasses}</p>
        <p><strong>Total Absent:</strong> ${totalAbsentClasses}</p>
        <button id="closeAnalyticsReport">Close</button>
    `;

    document.getElementById('inputContainer').appendChild(report);

    document.getElementById('closeAnalyticsReport').addEventListener('click', () => {
        const report = document.getElementById('analyticsReport');
        if (report && report.parentNode) {
            report.parentNode.removeChild(report);
        }
    });
}

// Show export data to PDF popup
function showExportPDFPopup() {
    const { jsPDF } = window.jspdf;

    // Create a new jsPDF instance
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text('Attendance Marking System', 14, 22);

    // Define the columns and rows
    const columns = [
        { header: 'S.No', dataKey: 'sNo' },
        { header: 'UID', dataKey: 'uid' },
        { header: 'NAME', dataKey: 'name' },
        { header: 'Present Classes', dataKey: 'presentClasses' },
        { header: 'Total Classes', dataKey: 'totalClasses' },
        { header: 'Attendance Percentage', dataKey: 'attendancePercentage' },
        { header: "Today's Attendance", dataKey: 'todaysAttendance' }
    ];

    const rows = attendanceData.map((student, index) => ({
        sNo: index + 1,
        uid: student.uid,
        name: student.name,
        presentClasses: student.presentClasses,
        totalClasses: student.totalClasses,
        attendancePercentage: student.attendancePercentage,
        todaysAttendance: student.attendance[selectedDate] || 'N/A'
    }));

    // Add the table to the PDF
    doc.autoTable({
        head: [columns.map(col => col.header)],
        body: rows.map(row => columns.map(col => row[col.dataKey])),
        startY: 30
    });

    // Save the PDF
    doc.save('Attendance_Marking_System.pdf');
}

