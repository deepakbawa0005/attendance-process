<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "attendance_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get data from POST request
$uid = $_POST['uid'];
$name = $_POST['name'];
$presentClasses = $_POST['present_classes'];
$totalClasses = $_POST['total_classes'];
$attendancePercentage = $_POST['attendance_percentage'];
$date = $_POST['date'];
$status = $_POST['status'];

// Insert data into table
$sql = "INSERT INTO attendance_records (uid, name, present_classes, total_classes, attendance_percentage, date, status)
        VALUES ('$uid', '$name', $presentClasses, $totalClasses, $attendancePercentage, '$date', '$status')";

if ($conn->query($sql) === TRUE) {
    echo "New record created successfully";
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>
