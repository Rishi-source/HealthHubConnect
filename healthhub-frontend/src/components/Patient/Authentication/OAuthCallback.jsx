import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const OAuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState('');

    useEffect(() => {
        const handleCallback = async () => {
            const searchParams = new URLSearchParams(location.search);
            const code = searchParams.get('code');
            const state = searchParams.get('state');

            if (!code || !state) {
                setError('Authentication failed: Missing parameters');
                setTimeout(() => navigate('/auth'), 3000);
                return;
            }

            try {
                const response = await fetch(`https://anochat.in/v1/auth/google/callback?code=${code}&state=${state}`, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to authenticate with Google');
                }

                const data = await response.json();

                if (!data.success) {
                    throw new Error(data.message || 'Authentication failed');
                }

                localStorage.setItem('access_token', data.data.tokens.access_token);
                localStorage.setItem('refresh_token', data.data.tokens.refresh_token);
                localStorage.setItem('user', JSON.stringify(data.data.user));

                if (data.data.user.isNewUser) {
                    navigate('/profile');
                } else {
                    navigate('/dashboard');
                }

            } catch (error) {
                console.error('OAuth callback error:', error);
                setError(error.message || 'Authentication failed');
                setTimeout(() => navigate('/auth'), 3000);
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-teal-50 to-white">
            <div className="text-center space-y-4">
                {error ? (
                    <>
                        <div className="text-red-500 text-xl font-medium mb-4">{error}</div>
                        <div className="text-gray-500">Redirecting you back to login...</div>
                    </>
                ) : (
                    <>
                        <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        <h2 className="text-2xl font-medium text-gray-700">
                            Completing authentication...
                        </h2>
                        <p className="text-gray-500">
                            Please wait while we secure your session
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};

export default OAuthCallback;