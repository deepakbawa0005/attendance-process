<?php
// Check if the token is set in the URL
if (!isset($_GET['token'])) {
    die("Invalid token.");
}

$token = $_GET['token'];
?>

<!DOCTYPE html>
<html lang="en">
<head>
<style>
/* General body styles */
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 20px;
}

/* Centering the form */
h2 {
    text-align: center;
    color: #333;
}

/* Form container styles */
form {
    background-color: #fff;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
}

/* Input field styles */
input[type="password"],
input[type="submit"] {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

/* Submit button styles */
input[type="submit"] {
    background-color: #5cb85c;
    color: white;
    border: none;
    cursor: pointer;
}

input[type="submit"]:hover {
    background-color: #4cae4c;
}

/* Label styles */
label {
    display: block;
    margin-bottom: 5px;
    color: #555;
}
</style>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Update Password</title>
</head>
<body>
    <h2>Update Password</h2>
    <form action="update_password_action.php" method="POST">
        <input type="hidden" name="token" value="<?php echo htmlspecialchars($token); ?>">
        <label for="new_password">New Password:</label>
        <input type="password" id="new_password" name="new_password" required>
        <input type="submit" value="Update Password">
    </form>
</body>
</html>