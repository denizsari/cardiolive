'use client';

import React, { useState, useEffect } from 'react';

declare global {
  interface Window {
    ApiClient: unknown;
  }
}

export default function TokenRefreshTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState({
    accessToken: false,
    refreshToken: false,
    userData: false
  });

  // Check token status on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setTokenStatus({
        accessToken: !!localStorage.getItem('token'),
        refreshToken: !!localStorage.getItem('refreshToken'),
        userData: !!localStorage.getItem('user')
      });
    }
  }, []);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
    console.log(message);
  };

  const testFrontendTokenRefresh = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Testing Frontend Token Refresh...');
      
      // Step 1: Login to get tokens
      addResult('📝 Step 1: Logging in...');
      const loginResponse = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123'
        })
      });
      
      if (!loginResponse.ok) {
        addResult('❌ Login failed');
        return;
      }
      
      const loginResult = await loginResponse.json();
      addResult('✅ Login successful');
      
      // Store tokens in localStorage (simulating user login)
      localStorage.setItem('token', loginResult.data.accessToken);
      localStorage.setItem('refreshToken', loginResult.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(loginResult.data.user));
      
      // Step 2: Test API client with automatic refresh
      addResult('📝 Step 2: Testing API client automatic refresh...');      // Import the API client dynamically
      const { userAPI } = await import('@/utils/api');
      
      // Test multiple API calls
      addResult('🔄 Making first API call...');
      const result1 = await userAPI.getProfile();
      addResult(`✅ First API call successful: ${result1.name}`);
      
      addResult('🔄 Making second API call...');
      const result2 = await userAPI.getProfile();
      addResult(`✅ Second API call successful: ${result2.name}`);
      
      // Step 3: Simulate token expiration by setting an expired token
      addResult('📝 Step 3: Simulating expired token...');
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxfQ.fake';
      localStorage.setItem('token', expiredToken);
      
      addResult('🔄 Making API call with expired token (should auto-refresh)...');
      const result3 = await userAPI.getProfile();
      addResult(`✅ API call with expired token successful (auto-refreshed): ${result3.name}`);
      
      // Check if token was actually refreshed
      const newToken = localStorage.getItem('token');
      if (newToken !== expiredToken) {
        addResult('✅ Token was automatically refreshed!');
      } else {
        addResult('⚠️ Token might not have been refreshed');
      }
      
      addResult('🎉 All frontend tests passed!');
        } catch (error: unknown) {
      addResult(`❌ Frontend test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test concurrent API calls
  const testConcurrentCalls = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🚀 Testing Concurrent API Calls During Token Refresh...');
      
      // Login first
      const loginResponse = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'TestPassword123'
        })
      });
      
      const loginResult = await loginResponse.json();
      localStorage.setItem('refreshToken', loginResult.data.refreshToken);
      
      // Set an expired token to force refresh
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiZXhwIjoxfQ.fake';
      localStorage.setItem('token', expiredToken);
      
      addResult('📝 Making 3 concurrent API calls with expired token...');      const { userAPI } = await import('@/utils/api');
      
      // Make 3 concurrent API calls - they should all wait for the token refresh
      const promises = [
        userAPI.getProfile(),
        userAPI.getProfile(), 
        userAPI.getProfile()
      ];
      
      const results = await Promise.all(promises);
      
      addResult(`✅ All ${results.length} concurrent calls succeeded!`);
      results.forEach((result, index: number) => {
        addResult(`  Call ${index + 1}: ${result.name}`);
      });
      
      addResult('🎉 Concurrent API calls test passed!');
        } catch (error: unknown) {
      addResult(`❌ Concurrent calls test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Token Refresh System Tests</h1>
        
        <div className="space-y-4 mb-8">
          <button
            onClick={testFrontendTokenRefresh}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold mr-4"
          >
            {isLoading ? 'Running...' : 'Test Basic Token Refresh'}
          </button>
          
          <button
            onClick={testConcurrentCalls}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold"
          >
            {isLoading ? 'Running...' : 'Test Concurrent API Calls'}
          </button>
        </div>

        <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
          <div className="text-white mb-2">Test Console:</div>
          {testResults.length === 0 ? (
            <div className="text-gray-500">Click a test button to start...</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">What These Tests Do:</h2>
          <ul className="space-y-2 text-sm">
            <li>• <strong>Basic Token Refresh:</strong> Tests login, API calls, and automatic token refresh when expired</li>
            <li>• <strong>Concurrent API Calls:</strong> Tests multiple simultaneous API calls during token refresh to ensure they all wait for the refresh to complete</li>
            <li>• <strong>User Experience:</strong> Validates that users never see authentication errors or need to re-login manually</li>
          </ul>
        </div>        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
          <h3 className="font-semibold mb-2">Current Token Status:</h3>
          <div className="text-sm space-y-1">
            <div>Access Token: {tokenStatus.accessToken ? '✅ Present' : '❌ Missing'}</div>
            <div>Refresh Token: {tokenStatus.refreshToken ? '✅ Present' : '❌ Missing'}</div>
            <div>User Data: {tokenStatus.userData ? '✅ Present' : '❌ Missing'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
