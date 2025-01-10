function handleGoogleLogin() {
    fetch('http://localhost:8081/v1/auth/google/login')
        .then(response => response.json())
        .then(data => {
            if (data.url) {
                window.location.href = data.url;
            }
        })
        .catch(error => console.error('Error:', error));
}

// Handle OAuth callback
function handleCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const refreshToken = urlParams.get('refresh_token');
    const isNewUser = urlParams.get('is_new_user');
    const error = urlParams.get('error');

    if (error) {
        console.error('OAuth Error:', error);
        return;
    }

    if (accessToken && refreshToken) {
        // Store tokens
        localStorage.setItem('access_token', accessToken);
        localStorage.setItem('refresh_token', refreshToken);

        // Redirect based on user status
        if (isNewUser === 'true') {
            window.location.href = 'http://localhost:3000/profile';
        } else {
            window.location.href = 'http://localhost:3000/dashboard';
        }
    }
}

// Check if we're on the callback page
if (window.location.pathname.includes('callback')) {
    handleCallback();
}