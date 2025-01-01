<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name = $_POST['name'];
    $email = $_POST['email'];
    $username = $_POST['username'];
    $password = $_POST['password'];

    // Database connection
    $servername = "localhost";
    $username_db = "root";
    $password_db = ""; 
    $dbname = "teacher";

    // Create connection
    $conn = new mysqli($servername, $username_db, $password_db, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Prepare and bind
    $stmt = $conn->prepare("INSERT INTO users (name, email, username, password) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $name, $email, $username, $password); // Store the plain password

    // Execute the statement
    if ($stmt->execute()) {
        // Output JavaScript to show a pop-up message and redirect
        echo "<script>
        alert('Registration successful!');
        window.location.href = 'http://localhost/my_project/files/login.html'; // Redirect to login page
        </script>";
    } else {
        // Escape the error message to prevent JavaScript syntax errors
        $error_message = addslashes($stmt->error);
        echo "<script>alert('Error: $error_message');</script>";
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo "Invalid request method.";
}
?>