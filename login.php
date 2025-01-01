<?php
$host = 'localhost';
$user = 'root'; 
$password = ''; 
$database = 'teacher'; 

$conn = new mysqli($host, $user, $password, $database);


if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Prepare and bind
    $stmt = $conn->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
    $stmt->bind_param("ss", $username, $password);

    // Execute the statement
    $stmt->execute();
    $result = $stmt->get_result();

    // Check if a user exists
    if ($result->num_rows > 0) {
        // User found, redirect to the HTML file
        echo "<script>
                alert('Login successful');
                window.location.href = 'http://localhost/my_project/files/attendance.html';
              </script>";
    } else {
        // Invalid username or password
        echo "<script>
                alert('Invalid username or password.');
                window.location.href = 'login.html'; // Redirect back to login
              </script>";
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>