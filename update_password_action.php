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
    $token = $_POST['token'];
    $new_password = $_POST['new_password'];

    // Validate the token
    $stmt = $conn->prepare("SELECT email FROM password_resets WHERE token = ?");
    $stmt->bind_param("s", $token);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // Token is valid, get the username
        $row = $result->fetch_assoc();
        $username = $row['username'];

        // Update the user's password in the database
        $stmt = $conn->prepare("UPDATE users SET password = ? WHERE email = ?");
        $stmt->bind_param("ss", $new_password, $username);
        $stmt->execute();

        // Optionally, delete the token after use
        $stmt = $conn->prepare("DELETE FROM password_resets WHERE token = ?");
        $stmt->bind_param("s", $token);
        $stmt->execute();

        echo "<script>
                alert('Password updated successfully.');
                window.location.href = 'login.html';
              </script>";
    } else {
        // Invalid token
        echo "<script>
                alert('Invalid token.');
                window.location.href = 'reset_password.html';
              </script>";
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>