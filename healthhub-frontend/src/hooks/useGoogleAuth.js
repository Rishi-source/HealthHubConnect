export const useGoogleAuth = (navigate) => {
  const initiateGoogleLogin = async () => {
    try {
      console.log('Initiating Google login...');
      const response = await fetch('https://anochat.in/v1/auth/google/login');
      const result = await response.json();

      if (result.success && result.code === 200 && result.data.url) {
        console.log('Redirecting to:', result.data.url);
        window.location.href = result.data.url;
      } else {
        throw new Error('Invalid response from Google login endpoint');
      }
    } catch (error) {
      console.error('Error initiating Google login:', error);
      throw new Error('Failed to initiate Google login. Please try again.');
    }
  };

  return { initiateGoogleLogin };
};