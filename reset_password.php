<?php
require 'vendor/autoload.php'; // Load Composer's autoloader

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$host = 'localhost';
$user = 'root'; 
$password = ''; 
$database = 'teacher'; 

// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email = $_POST['email'];

    // Prepare the SQL statement to find the user
    $stmt = $conn->prepare("SELECT email FROM users WHERE email = ?");
    
    // Check if prepare() failed
    if ($stmt === false) {
        die("Prepare failed: " . $conn->error);
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // User found, send reset link
        $row = $result->fetch_assoc();
        $email = $row['email'];
        
        // Generate a unique token
        $token = bin2hex(random_bytes(50));
        
        // Store the token in the database
        $stmt = $conn->prepare("INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))");
        
        // Check if prepare() failed
        if ($stmt === false) {
            die("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("ss", $email, $token);
        $stmt->execute();

        // Send email using PHPMailer
        $mail = new PHPMailer(true);
        try {
            //Server settings
            $mail->isSMTP();                                            // Send using SMTP
            $mail->Host       = 'smtp.gmail.com';                   // Set the SMTP server to send through
            $mail->SMTPAuth   = true;                                   // Enable SMTP authentication
            $mail->Username   = 'universitymail1010@gmail.com';             // SMTP username
            $mail->Password   = 'vxjt nwln mrkz hssy';                // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;      // Enable TLS encryption
            $mail->Port       = 587;                                   // TCP port to connect to

            //Recipients
            $mail->setFrom('your_email@example.com', 'Your Name');
            $mail->addAddress($email);                                 // Add a recipient

            // Content
            $mail->isHTML(true);                                      // Set email format to HTML
            $mail->Subject = 'Password Reset';
            $resetLink = "http://localhost/my_project/update_password.php?token=" . $token;
            $mail->Body    = "Click here to reset your password: <a href='$resetLink'>$resetLink</a>";

            $mail->send();
            echo "<script>
                    alert('A password reset link has been sent to your email.');
                    window.location.href = 'login.html';
                  </script>";
        } catch (Exception $e) {
            echo "<script>
                    alert('Message could not be sent. Mailer Error: {$mail->ErrorInfo}');
                    window.location.href = 'reset_password.html';
                  </script>";
        }
    } else {
        // User not found
        echo "<script>
                alert('Email not found.');
                window.location.href = 'reset_password.html';
              </script>";
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
}
?>