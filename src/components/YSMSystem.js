

import React, { useState, useEffect } from 'react';
import { User, Settings, Database, Mail, CheckCircle, XCircle, Clock, Bell, Users, BarChart3, Shield, RefreshCw, LogOut, Plus, Eye, Key, AlertTriangle, Link, Upload, FileSpreadsheet, Download } from 'lucide-react';

// Utility functions for safe error handling
const getSafeErrorMessage = (error) => {
  if (!error) return 'Unknown error occurred';
  if (typeof error === 'string') return error;
  if (error.message && typeof error.message === 'string') return error.message;
  
  // Handle Google API specific errors
  if (error.result && error.result.error) {
    if (error.result.error.message) return error.result.error.message;
    if (error.result.error.code) return `API Error ${error.result.error.code}`;
  }
  
  // Handle gapi errors
  if (error.error && typeof error.error === 'string') return error.error;
  if (error.details && typeof error.details === 'string') return error.details;
  
  // Try to extract meaningful info from the error object
  if (typeof error === 'object') {
    try {
      // Check common error properties
      if (error.name) return `${error.name}: ${error.message || 'Unknown error'}`;
      if (error.type) return `${error.type}: ${error.message || 'Unknown error'}`;
      if (error.code) return `Error code: ${error.code}`;
      
      // Try JSON.stringify as last resort, but safely
      const stringified = JSON.stringify(error);
      if (stringified && stringified !== '{}' && stringified !== '[object Object]') {
        return stringified.length > 200 ? stringified.substring(0, 200) + '...' : stringified;
      }
    } catch (e) {
      // JSON.stringify failed, continue to fallback
    }
  }
  
  // Final fallback
  if (error.toString && typeof error.toString === 'function') {
    const str = error.toString();
    if (str && str !== '[object Object]') return str;
  }
  
  return 'Unknown error occurred (object could not be converted to string)';
};

// Bulk Upload Modal Component
const BulkUploadModal = ({ onUpload, onClose, onDownloadTemplate, progress, onProgressClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (file) => {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ];
    
    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Please select a valid Excel (.xlsx, .xls) or CSV file');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      onUpload(selectedFile);
      setSelectedFile(null);
    }
  };

  // Show progress modal if upload is in progress
  if (progress) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Bulk Upload Progress
            </h3>
            {progress.stage === 'completed' && (
              <button
                onClick={onProgressClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            )}
          </div>

          <div className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  {progress.stage === 'parsing' ? 'Parsing Excel file...' :
                   progress.stage === 'processing' ? 'Creating users...' :
                   progress.stage === 'completed' ? 'Upload completed!' : 'Processing...'}
                </span>
                <span>{progress.current}/{progress.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    progress.stage === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            {/* Results Table */}
            {progress.results && progress.results.length > 0 && (
              <div className="max-h-96 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Row</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {progress.results.map((result, index) => (
                      <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                        <td className="px-4 py-2 text-sm text-gray-900">{result.rowNumber}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{result.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{result.email}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {result.status || (result.success ? 'Success' : 'Failed')}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {result.message}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {progress.stage === 'completed' && (
              <div className="flex justify-end">
                <button
                  onClick={onProgressClose}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Bulk Upload Employees</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Excel/CSV Upload Instructions</h4>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Upload an Excel (.xlsx, .xls) or CSV file</li>
                  <li>• Required columns: <strong>Name</strong> and <strong>Email</strong></li>
                  <li>• Optional columns: Department, Position, Start Date</li>
                  <li>• First row should contain column headers</li>
                  <li>• Maximum 100 employees per upload</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Download Template Button */}
          <div className="flex justify-center">
            <button
              onClick={onDownloadTemplate}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : selectedFile 
                ? 'border-green-500 bg-green-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-2">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-green-700 font-medium">{selectedFile.name}</p>
                <p className="text-sm text-green-600">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Ready to upload
                </p>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Choose different file
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-gray-700 font-medium">
                    Drag and drop your Excel file here, or
                  </p>
                  <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
                    browse to choose a file
                    <input
                      type="file"
                      className="hidden"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileInput}
                    />
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Supports Excel (.xlsx, .xls) and CSV files
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload & Create Users
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const safeIncludes = (str, searchString) => {
  if (!str || typeof str !== 'string') return false;
  return str.includes(searchString);
};

// Google API Script Loader
const loadGoogleAPIScript = () => {
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (window.gapi) {
      resolve(window.gapi);
      return;
    }

    // Check if script is already being loaded
    if (document.querySelector('script[src*="apis.google.com/js/api.js"]')) {
      // Wait for it to load
      const checkLoaded = () => {
        if (window.gapi) {
          resolve(window.gapi);
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    // Load the script
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      // Wait a bit for gapi to initialize
      setTimeout(() => {
        if (window.gapi) {
          resolve(window.gapi);
        } else {
          reject(new Error('Google API script loaded but gapi object not available'));
        }
      }, 100);
    };
    
    script.onerror = () => {
      reject(new Error('Failed to load Google API script. Check your internet connection.'));
    };

    document.head.appendChild(script);
  });
};

// Mock GoogleWorkspaceService for demo purposes
class MockGoogleWorkspaceService {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.debugMode = true;
  }

  log(message, type = 'info') {
    if (this.debugMode) {
      console.log(`[GoogleWorkspace ${type.toUpperCase()}]:`, message);
    }
  }

  async initialize(clientId, apiKey) {
    try {
      this.log('Loading Google API script...');
      await loadGoogleAPIScript();
      this.log('Google API script loaded successfully');
      
      // Simulate initialization
      await new Promise(resolve => setTimeout(resolve, 1000));
      this.isInitialized = true;
      this.log('Google API initialized successfully (demo mode)');
      return true;
    } catch (error) {
      this.log(`Initialization failed: ${getSafeErrorMessage(error)}`, 'error');
      throw error;
    }
  }

  async signIn() {
    if (!this.isInitialized) {
      throw new Error('Google API not initialized');
    }
    
    // Simulate sign in
    await new Promise(resolve => setTimeout(resolve, 1500));
    this.accessToken = 'demo_token_' + Math.random().toString(36).substr(2, 9);
    
    return {
      getBasicProfile: () => ({
        getName: () => 'Demo Admin',
        getEmail: () => 'admin@example.com'
      }),
      getAuthResponse: () => ({
        access_token: this.accessToken,
        scope: 'https://www.googleapis.com/auth/admin.directory.user'
      })
    };
  }

  async createUser(userData) {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.3; // 70% success rate
    
    return {
      success,
      data: success ? { primaryEmail: userData.email, id: 'demo_user_id' } : null,
      error: success ? null : 'Demo: Simulated API error'
    };
  }

  async listUsers() {
    if (!this.accessToken) throw new Error('Not authenticated');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      success: true,
      data: [
        { primaryEmail: 'user1@example.com', name: { fullName: 'User One' } },
        { primaryEmail: 'user2@example.com', name: { fullName: 'User Two' } }
      ]
    };
  }

  signOut() {
    this.accessToken = null;
    this.log('Signed out successfully');
  }

  isSignedIn() {
    return !!this.accessToken;
  }
}

// Mock Data Store (simulating MongoDB)
const mockDatabase = {
  employees: [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@ysm.org',
      department: 'IT',
      position: 'Developer',
      status: 'active',
      onboardingDate: '2024-01-15',
      platforms: {
        googleWorkspace: 'provisioned',
        salesforce: 'provisioned',
        basecamp: 'provisioned',
        activeDirectory: 'provisioned'
      }
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@ysm.org',
      department: 'HR',
      position: 'Manager',
      status: 'pending',
      onboardingDate: '2024-06-18',
      platforms: {
        googleWorkspace: 'provisioned',
        salesforce: 'pending',
        basecamp: 'failed',
        activeDirectory: 'provisioned'
      }
    }
  ],
  activities: [
    {
      id: 1,
      type: 'onboarding',
      employee: 'John Smith',
      platform: 'Google Workspace',
      status: 'success',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      details: 'Account created successfully'
    },
    {
      id: 2,
      type: 'onboarding',
      employee: 'Sarah Johnson',
      platform: 'Basecamp',
      status: 'failed',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      details: 'Permission denied - admin access required'
    }
  ],
  stats: {
    totalEmployees: 47,
    activeOnboarding: 3,
    completedToday: 5,
    failedOperations: 2
  }
};

const YSMEmployeeAutomationSystem = () => {
  const [currentView, setCurrentView] = useState('dashboard');
  const [employees, setEmployees] = useState(mockDatabase.employees);
  const [activities, setActivities] = useState(mockDatabase.activities);
  const [stats, setStats] = useState(mockDatabase.stats);
  const [showForm, setShowForm] = useState(false);
  const [showGoogleSetup, setShowGoogleSetup] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [bulkUploadProgress, setBulkUploadProgress] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [googleService] = useState(new MockGoogleWorkspaceService());
  const [googleCredentials, setGoogleCredentials] = useState({
    clientId: '',
    apiKey: '',
    isConfigured: false,
    isConnected: false
  });
  const [isLoading, setIsLoading] = useState(false);

  // Add notification function
  const addNotification = (message, type = 'info') => {
    const notification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toISOString()
    };
    setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }, 8000);
  };

  // Initialize Google API when credentials are set
  useEffect(() => {
    if (googleCredentials.clientId && googleCredentials.apiKey && !googleCredentials.isConfigured) {
      const timer = setTimeout(() => {
        initializeGoogleAPI();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [googleCredentials.clientId, googleCredentials.apiKey]);

  const initializeGoogleAPI = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      addNotification('Initializing Google Workspace API...', 'info');
      
      // Validate credentials before proceeding
      if (!googleCredentials.clientId || !googleCredentials.apiKey) {
        throw new Error('Please provide both Client ID and API Key');
      }
      
      await googleService.initialize(googleCredentials.clientId, googleCredentials.apiKey);
      setGoogleCredentials(prev => ({ ...prev, isConfigured: true }));
      addNotification('Google Workspace API initialized successfully! You can now connect.', 'success');
      
    } catch (error) {
      console.error('Google API initialization error:', error);
      
      const errorMsg = getSafeErrorMessage(error);
      let userMessage = 'Failed to initialize Google API: ';
      
      if (safeIncludes(errorMsg, 'Invalid API key') || safeIncludes(errorMsg, 'API key')) {
        userMessage += 'Invalid API Key. Please check your Google Cloud Console.';
      } else if (safeIncludes(errorMsg, 'Invalid client') || safeIncludes(errorMsg, 'client')) {
        userMessage += 'Invalid Client ID. Please verify your OAuth 2.0 client configuration.';
      } else if (safeIncludes(errorMsg, 'script loaded but gapi')) {
        userMessage += 'Google API script loaded but initialization failed. Please try again.';
      } else if (safeIncludes(errorMsg, 'Failed to load Google API script')) {
        userMessage += 'Could not load Google API. Please check your internet connection and try again.';
      } else {
        userMessage += `${errorMsg}. Check browser console for more details.`;
      }
      
      addNotification(userMessage, 'error');
      setGoogleCredentials(prev => ({ ...prev, isConfigured: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const connectGoogleWorkspace = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      addNotification('Connecting to Google Workspace...', 'info');
      
      if (!googleCredentials.isConfigured) {
        throw new Error('Google API not configured. Please setup your credentials first.');
      }
      
      const user = await googleService.signIn();
      setGoogleCredentials(prev => ({ ...prev, isConnected: true }));
      
      const profile = user.getBasicProfile();
      const email = profile.getEmail();
      const domain = email.split('@')[1];
      
      addNotification(`Connected to Google Workspace successfully as ${profile.getName()} (${email})`, 'success');
      
      // Test API access
      try {
        const result = await googleService.listUsers();
        if (result.success) {
          addNotification(`✅ Admin access verified! Found ${result.data.length} users in ${domain}`, 'success');
        } else {
          addNotification(`⚠️ Connected but admin access may be limited: ${result.error || 'Unknown error'}`, 'warning');
        }
      } catch (testError) {
        const testErrorMsg = getSafeErrorMessage(testError);
        addNotification(`⚠️ Connected but unable to test admin access: ${testErrorMsg}`, 'warning');
      }
      
    } catch (error) {
      console.error('Google Workspace connection error:', error);
      
      const errorMsg = getSafeErrorMessage(error);
      let userMessage = 'Failed to connect to Google Workspace: ';
      
      if (safeIncludes(errorMsg, 'not configured')) {
        userMessage += 'Please setup your Google credentials first using the "Setup Google" button.';
      } else {
        userMessage += errorMsg;
      }
      
      addNotification(userMessage, 'error');
      setGoogleCredentials(prev => ({ ...prev, isConnected: false }));
    } finally {
      setIsLoading(false);
    }
  };

  const disconnectGoogleWorkspace = () => {
    try {
      googleService.signOut();
      setGoogleCredentials(prev => ({ ...prev, isConnected: false }));
      addNotification('Disconnected from Google Workspace', 'info');
    } catch (error) {
      const errorMsg = getSafeErrorMessage(error);
      addNotification(`Error during disconnect: ${errorMsg}`, 'warning');
      setGoogleCredentials(prev => ({ ...prev, isConnected: false }));
    }
  };

  // Simulated Login
  const handleLogin = (user, pass) => {
    if (user === 'admin' && pass === 'ysm2024') {
      setIsAuthenticated(true);
      setUsername('YSM Admin');
      addNotification('Login successful', 'success');
    } else {
      addNotification('Invalid credentials', 'error');
    }
  };

  // Enhanced Google Workspace integration
  const handleGoogleWorkspaceProvisioning = async (employeeData) => {
    if (!googleCredentials.isConnected) {
      addNotification('Google Workspace not connected. Using simulation mode.', 'warning');
      return await simulatePlatformAPI('Google Workspace', 'onboarding', employeeData);
    }

    try {
      addNotification(`Creating Google Workspace account for ${employeeData.name}`, 'info');
      
      const result = await googleService.createUser(employeeData);
      
      const activity = {
        id: Date.now() + Math.random(),
        type: 'onboarding',
        employee: employeeData.name,
        platform: 'Google Workspace',
        status: result.success ? 'success' : 'failed',
        timestamp: new Date().toISOString(),
        details: result.success 
          ? `Account created successfully: ${employeeData.email}` 
          : `Failed: ${result.error || 'Unknown error'}`
      };
      
      setActivities(prev => [activity, ...prev]);
      
      if (result.success) {
        addNotification(`Google Workspace account created for ${employeeData.name}`, 'success');
      } else {
        addNotification(`Google Workspace creation failed: ${result.error || 'Unknown error'}`, 'error');
      }
      
      return result.success;
    } catch (error) {
      const errorMsg = getSafeErrorMessage(error);
      addNotification(`Google Workspace error: ${errorMsg}`, 'error');
      return false;
    }
  };

  // Simulate API calls to other platforms
  const simulatePlatformAPI = async (platform, action, employeeData) => {
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    const success = Math.random() > 0.2; // 80% success rate
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    const activity = {
      id: Date.now() + Math.random(),
      type: action,
      employee: employeeData.name,
      platform,
      status: success ? 'success' : 'failed',
      timestamp: new Date().toISOString(),
      details: success ? `${action} completed successfully` : `${action} failed - retry required`
    };
    
    setActivities(prev => [activity, ...prev]);
    return success;
  };

  // Handle bulk upload from Excel
  const handleBulkUpload = async (file) => {
    try {
      addNotification('Processing Excel file...', 'info');
      setBulkUploadProgress({ stage: 'parsing', current: 0, total: 0, results: [] });

      // Read the Excel file
      const arrayBuffer = await file.arrayBuffer();
      
      // Parse Excel using SheetJS (dynamically import to avoid issues)
      const XLSX = await import('https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs');
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get first worksheet
      const wsname = workbook.SheetNames[0];
      const ws = workbook.Sheets[wsname];
      
      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      
      if (data.length < 2) {
        throw new Error('Excel file must contain at least a header row and one data row');
      }

      // Parse headers and data
      const headers = data[0].map(h => h?.toString().toLowerCase().trim());
      const rows = data.slice(1).filter(row => row.some(cell => cell)); // Filter empty rows
      
      // Map headers to expected fields
      const headerMap = {
        'name': ['name', 'full name', 'fullname', 'employee name'],
        'email': ['email', 'email address', 'work email', 'company email'],
        'department': ['department', 'dept', 'division', 'team'],
        'position': ['position', 'title', 'job title', 'role', 'designation'],
        'startdate': ['start date', 'startdate', 'joining date', 'hire date']
      };

      const getHeaderIndex = (field) => {
        const possibleHeaders = headerMap[field] || [];
        return headers.findIndex(h => possibleHeaders.includes(h));
      };

      const nameIndex = getHeaderIndex('name');
      const emailIndex = getHeaderIndex('email');
      const departmentIndex = getHeaderIndex('department');
      const positionIndex = getHeaderIndex('position');
      const startDateIndex = getHeaderIndex('startdate');

      if (nameIndex === -1 || emailIndex === -1) {
        throw new Error('Excel file must contain at least "Name" and "Email" columns');
      }

      // Process users
      const users = rows.map((row, index) => ({
        rowNumber: index + 2, // Excel row number (accounting for header)
        name: row[nameIndex]?.toString().trim() || '',
        email: row[emailIndex]?.toString().trim() || '',
        department: departmentIndex !== -1 ? (row[departmentIndex]?.toString().trim() || 'General') : 'General',
        position: positionIndex !== -1 ? (row[positionIndex]?.toString().trim() || 'Employee') : 'Employee',
        startDate: startDateIndex !== -1 ? row[startDateIndex] : new Date().toISOString().split('T')[0]
      })).filter(user => user.name && user.email);

      if (users.length === 0) {
        throw new Error('No valid users found in Excel file');
      }

      addNotification(`Found ${users.length} users in Excel file. Starting bulk creation...`, 'success');
      setBulkUploadProgress({ 
        stage: 'processing', 
        current: 0, 
        total: users.length, 
        results: [],
        users: users
      });

      // Process users in batches to avoid overwhelming the API
      const batchSize = 3;
      const results = [];
      
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const batchPromises = batch.map(async (userData) => {
          try {
            // Add employee to local state first
            const newEmployee = {
              ...userData,
              id: Date.now() + Math.random(),
              status: 'pending',
              onboardingDate: userData.startDate,
              platforms: {}
            };

            // Process Google Workspace
            const googleSuccess = await handleGoogleWorkspaceProvisioning(userData);
            newEmployee.platforms.googleworkspace = googleSuccess ? 'provisioned' : 'failed';

            // Process other platforms (simulated)
            const otherPlatforms = ['Salesforce', 'Basecamp', 'Active Directory'];
            for (const platform of otherPlatforms) {
              const success = await simulatePlatformAPI(platform, 'onboarding', userData);
              newEmployee.platforms[platform.toLowerCase().replace(/\s+/g, '')] = success ? 'provisioned' : 'failed';
            }

            // Update employee status
            const allProvisioned = Object.values(newEmployee.platforms).every(status => status === 'provisioned');
            newEmployee.status = allProvisioned ? 'active' : 'partial';

            // Add to employees list
            setEmployees(prev => [...prev, newEmployee]);

            return {
              ...userData,
              success: true,
              status: newEmployee.status,
              platforms: newEmployee.platforms,
              message: allProvisioned ? 'All platforms provisioned successfully' : 'Some platforms failed'
            };
          } catch (error) {
            return {
              ...userData,
              success: false,
              status: 'failed',
              message: getSafeErrorMessage(error)
            };
          }
        });

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Update progress
        setBulkUploadProgress(prev => ({
          ...prev,
          current: results.length,
          results: results
        }));

        // Add small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Update stats
      const successful = results.filter(r => r.success).length;
      const failed = results.length - successful;
      
      setStats(prev => ({
        ...prev,
        totalEmployees: prev.totalEmployees + successful,
        completedToday: prev.completedToday + successful,
        failedOperations: prev.failedOperations + failed
      }));

      setBulkUploadProgress(prev => ({ ...prev, stage: 'completed' }));
      addNotification(`Bulk upload completed: ${successful} successful, ${failed} failed`, 
        failed === 0 ? 'success' : 'warning');

    } catch (error) {
      const errorMsg = getSafeErrorMessage(error);
      addNotification(`Bulk upload failed: ${errorMsg}`, 'error');
      setBulkUploadProgress(null);
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const template = [
      ['Name', 'Email', 'Department', 'Position', 'Start Date'],
      ['John Smith', 'john.smith@company.com', 'IT', 'Developer', '2024-01-15'],
      ['Jane Doe', 'jane.doe@company.com', 'HR', 'Manager', '2024-01-20'],
      ['Mike Brown', 'mike.brown@company.com', 'Finance', 'Analyst', '2024-01-25']
    ];

    // Create CSV content (simpler than Excel for download)
    const csvContent = template.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employee_template.csv';
    link.click();
    
    addNotification('Template downloaded! You can also use Excel format with the same columns.', 'success');
  };
  const handleOnboarding = async (employeeData) => {
    const newEmployee = {
      ...employeeData,
      id: Date.now(),
      status: 'pending',
      onboardingDate: new Date().toISOString().split('T')[0],
      platforms: {}
    };

    setEmployees(prev => [...prev, newEmployee]);
    addNotification(`Onboarding started for ${employeeData.name}`, 'info');

    // Process Google Workspace
    const googleSuccess = await handleGoogleWorkspaceProvisioning(employeeData);
    newEmployee.platforms.googleworkspace = googleSuccess ? 'provisioned' : 'failed';

    // Process other platforms (simulated)
    const otherPlatforms = ['Salesforce', 'Basecamp', 'Active Directory'];
    for (const platform of otherPlatforms) {
      const success = await simulatePlatformAPI(platform, 'onboarding', employeeData);
      newEmployee.platforms[platform.toLowerCase().replace(/\s+/g, '')] = success ? 'provisioned' : 'failed';
    }

    // Update employee status
    const allProvisioned = Object.values(newEmployee.platforms).every(status => status === 'provisioned');
    newEmployee.status = allProvisioned ? 'active' : 'partial';

    setEmployees(prev => prev.map(emp => emp.id === newEmployee.id ? newEmployee : emp));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalEmployees: prev.totalEmployees + 1,
      completedToday: prev.completedToday + (allProvisioned ? 1 : 0),
      failedOperations: prev.failedOperations + (allProvisioned ? 0 : 1)
    }));

    addNotification(
      `Onboarding ${allProvisioned ? 'completed' : 'partially completed'} for ${employeeData.name}`,
      allProvisioned ? 'success' : 'warning'
    );
  };

  // Retry failed provisions
  const retryProvision = async (employeeId, platform) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    addNotification(`Retrying ${platform} provision for ${employee.name}`, 'info');
    
    let success;
    if (platform.toLowerCase() === 'googleworkspace' || platform.toLowerCase() === 'google workspace') {
      success = await handleGoogleWorkspaceProvisioning(employee);
    } else {
      success = await simulatePlatformAPI(platform, 'retry', employee);
    }
    
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId 
        ? { ...emp, platforms: { ...emp.platforms, [platform.toLowerCase().replace(/\s+/g, '')]: success ? 'provisioned' : 'failed' } }
        : emp
    ));
  };

  if (!isAuthenticated) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-gray-900">Processing...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">YSM Employee Automation</h1>
              <p className="text-sm text-gray-500">
                Streamlined Onboarding & Offboarding
                {googleCredentials.isConnected && (
                  <span className="ml-2 text-green-600">• Google Workspace Connected</span>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {!googleCredentials.isConfigured && (
              <button
                onClick={() => setShowGoogleSetup(true)}
                disabled={isLoading}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1 text-sm"
              >
                <Key className="h-4 w-4" />
                <span>Setup Google</span>
              </button>
            )}
            <NotificationPanel notifications={notifications} />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">Welcome, {username}</span>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="p-2 text-gray-500 hover:text-gray-700"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {currentView === 'dashboard' && (
            <DashboardView 
              stats={stats} 
              activities={activities} 
              onShowForm={() => setShowForm(true)}
              onShowBulkUpload={() => setShowBulkUpload(true)}
              googleCredentials={googleCredentials}
            />
          )}
          {currentView === 'employees' && (
            <EmployeesView 
              employees={employees} 
              onRetry={retryProvision}
              onShowForm={() => setShowForm(true)}
              onShowBulkUpload={() => setShowBulkUpload(true)}
            />
          )}
          {currentView === 'activities' && <ActivitiesView activities={activities} />}
          {currentView === 'settings' && (
            <SettingsView 
              googleCredentials={googleCredentials}
              onConnectGoogle={connectGoogleWorkspace}
              onDisconnectGoogle={disconnectGoogleWorkspace}
              onShowSetup={() => setShowGoogleSetup(true)}
              addNotification={addNotification}
              isLoading={isLoading}
            />
          )}
        </main>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <EmployeeForm 
          onSubmit={handleOnboarding}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Google Setup Modal */}
      {showGoogleSetup && (
        <GoogleSetupModal
          onSave={(credentials) => {
            setGoogleCredentials(prev => ({ ...prev, ...credentials }));
            setShowGoogleSetup(false);
          }}
          onClose={() => setShowGoogleSetup(false)}
          currentCredentials={googleCredentials}
        />
      )}

      {/* Bulk Upload Modal */}
      {showBulkUpload && (
        <BulkUploadModal
          onUpload={handleBulkUpload}
          onClose={() => setShowBulkUpload(false)}
          onDownloadTemplate={downloadTemplate}
          progress={bulkUploadProgress}
          onProgressClose={() => setBulkUploadProgress(null)}
        />
      )}
    </div>
  );
};

// Login Screen Component
const LoginScreen = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = () => {
    onLogin(username, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">YSM Admin Portal</h2>
          <p className="text-gray-600">Employee Automation System</p>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ysm2024"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          
          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Demo credentials: admin / ysm2024
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ currentView, onViewChange }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'activities', label: 'Activity Log', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-white shadow-sm border-r">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    currentView === item.id
                      ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

// Google Setup Modal Component
const GoogleSetupModal = ({ onSave, onClose, currentCredentials }) => {
  const [credentials, setCredentials] = useState({
    clientId: currentCredentials.clientId || '',
    apiKey: currentCredentials.apiKey || ''
  });
  const [showInstructions, setShowInstructions] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [errors, setErrors] = useState({});

  const validateCredentials = () => {
    const newErrors = {};
    
    if (!credentials.clientId) {
      newErrors.clientId = 'Client ID is required';
    } else if (!credentials.clientId.includes('.apps.googleusercontent.com')) {
      newErrors.clientId = 'Client ID should end with .apps.googleusercontent.com';
    }
    
    if (!credentials.apiKey) {
      newErrors.apiKey = 'API Key is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateCredentials()) {
      onSave(credentials);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Google Workspace Setup</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Setup */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Demo Mode</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    This is running in demo mode with a mock Google Workspace service.
                    In production, you would use the real GoogleWorkspaceService.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Client ID
              </label>
              <input
                type="text"
                value={credentials.clientId}
                onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.clientId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="1234567890-abcdefghijklmnop.apps.googleusercontent.com"
              />
              {errors.clientId && (
                <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google API Key
              </label>
              <input
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                  errors.apiKey ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="AIzaSyABC123DEF456GHI789JKL012MNO345PQR"
              />
              {errors.apiKey && (
                <p className="text-red-500 text-xs mt-1">{errors.apiKey}</p>
              )}
            </div>

            <div className="flex space-x-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save & Initialize
              </button>
            </div>
          </div>

          {/* Right Column - Instructions */}
          <div className="space-y-4">
            <div>
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
              >
                <Link className="h-4 w-4" />
                <span>Setup Instructions</span>
              </button>

              {showInstructions && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm">
                  <h4 className="font-medium text-gray-900 mb-2">Step-by-Step Setup:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700">
                    <li>Go to Google Cloud Console</li>
                    <li>Create a new project or select existing</li>
                    <li>Enable Admin SDK API</li>
                    <li>Create OAuth 2.0 Client ID (Web application)</li>
                    <li>Create API Key (restrict to Admin SDK)</li>
                    <li>Add your domain to authorized origins</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Demo Features:</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>• Mock Google API integration</li>
                <li>• Simulated user creation</li>
                <li>• Error handling demonstration</li>
                <li>• Connection status simulation</li>
                <li>• Real-time notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Panel Component
const NotificationPanel = ({ notifications }) => {
  const [showNotifications, setShowNotifications] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-500 hover:text-gray-700"
      >
        <Bell className="h-5 w-5" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {notifications.length}
          </span>
        )}
      </button>

      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-center">No notifications</p>
            ) : (
              notifications.map(notification => (
                <div key={notification.id} className="p-3 border-b last:border-b-0">
                  <div className={`flex items-start space-x-2 ${
                    notification.type === 'success' ? 'text-green-700' :
                    notification.type === 'error' ? 'text-red-700' :
                    notification.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
                  }`}>
                    <div className="flex-1">
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(notification.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard View Component
const DashboardView = ({ stats, activities, onShowForm, onShowBulkUpload, googleCredentials }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="flex space-x-3">
          <button
            onClick={onShowBulkUpload}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={onShowForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>New Employee</span>
          </button>
        </div>
      </div>

      {/* Google Workspace Status */}
      <div className={`p-4 rounded-lg border ${
        googleCredentials.isConnected 
          ? 'bg-green-50 border-green-200' 
          : googleCredentials.isConfigured
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            googleCredentials.isConnected ? 'bg-green-500' : 
            googleCredentials.isConfigured ? 'bg-yellow-500' : 'bg-blue-500'
          }`}></div>
          <span className="font-medium">
            Google Workspace: {
              googleCredentials.isConnected ? 'Connected (Demo Mode)' : 
              googleCredentials.isConfigured ? 'Ready to Connect' : 'Setup Required'
            }
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard title="Total Employees" value={stats.totalEmployees} icon={Users} color="blue" />
        <StatsCard title="Active Onboarding" value={stats.activeOnboarding} icon={Clock} color="yellow" />
        <StatsCard title="Completed Today" value={stats.completedToday} icon={CheckCircle} color="green" />
        <StatsCard title="Failed Operations" value={stats.failedOperations} icon={XCircle} color="red" />
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {activities.slice(0, 5).map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    green: 'bg-green-500',
    red: 'bg-red-500'
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`${colorClasses[color]} p-2 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ activity }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
      {getStatusIcon(activity.status)}
      <div className="flex-1">
        <p className="font-medium text-gray-900">
          {activity.type} - {activity.employee}
        </p>
        <p className="text-sm text-gray-600">{activity.platform}</p>
        <p className="text-xs text-gray-500">{activity.details}</p>
      </div>
      <div className="text-xs text-gray-500">
        {new Date(activity.timestamp).toLocaleTimeString()}
      </div>
    </div>
  );
};

// Employees View Component
const EmployeesView = ({ employees, onRetry, onShowForm, onShowBulkUpload }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
        <div className="flex space-x-3">
          <button
            onClick={onShowBulkUpload}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <Upload className="h-4 w-4" />
            <span>Bulk Upload</span>
          </button>
          <button
            onClick={onShowForm}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platforms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map(employee => (
                <EmployeeRow key={employee.id} employee={employee} onRetry={onRetry} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Employee Row Component
const EmployeeRow = ({ employee, onRetry }) => {
  const getStatusBadge = (status) => {
    const classes = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      partial: 'bg-orange-100 text-orange-800',
      inactive: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[status] || classes.inactive}`}>
        {status}
      </span>
    );
  };

  const getPlatformStatus = (status) => {
    const icons = {
      provisioned: <CheckCircle className="h-4 w-4 text-green-500" />,
      failed: <XCircle className="h-4 w-4 text-red-500" />,
      pending: <Clock className="h-4 w-4 text-yellow-500" />
    };

    return icons[status] || <Clock className="h-4 w-4 text-gray-500" />;
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div>
          <div className="text-sm font-medium text-gray-900">{employee.name}</div>
          <div className="text-sm text-gray-500">{employee.email}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{employee.department}</div>
        <div className="text-sm text-gray-500">{employee.position}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {getStatusBadge(employee.status)}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-wrap gap-2">
          {Object.entries(employee.platforms).map(([platform, status]) => (
            <div key={platform} className="flex items-center space-x-1">
              {getPlatformStatus(status)}
              <span className="text-xs text-gray-500 capitalize">
                {platform.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </div>
          ))}
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex space-x-2">
          {Object.entries(employee.platforms)
            .filter(([, status]) => status === 'failed')
            .map(([platform]) => (
              <button
                key={platform}
                onClick={() => onRetry(employee.id, platform)}
                className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Retry</span>
              </button>
            ))}
          <button className="text-gray-600 hover:text-gray-900">
            <Eye className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

// Activities View Component
const ActivitiesView = ({ activities }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="space-y-4">
            {activities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Settings View Component
const SettingsView = ({ googleCredentials, onConnectGoogle, onDisconnectGoogle, onShowSetup, addNotification, isLoading }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Integrations</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                googleCredentials.isConnected ? 'bg-green-500' : 
                googleCredentials.isConfigured ? 'bg-yellow-500' : 'bg-red-500'
              }`}></div>
              <span className="font-medium text-gray-900">Google Workspace (Demo)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${
                googleCredentials.isConnected ? 'text-green-600' : 
                googleCredentials.isConfigured ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {googleCredentials.isConnected ? 'connected' : 
                 googleCredentials.isConfigured ? 'ready' : 'not configured'}
              </span>
              {!googleCredentials.isConfigured ? (
                <button
                  onClick={onShowSetup}
                  disabled={isLoading}
                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Setup
                </button>
              ) : !googleCredentials.isConnected ? (
                <button
                  onClick={onConnectGoogle}
                  disabled={isLoading}
                  className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                >
                  Connect
                </button>
              ) : (
                <button
                  onClick={onDisconnectGoogle}
                  disabled={isLoading}
                  className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Disconnect
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Employee Form Component
const EmployeeForm = ({ onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    position: '',
    startDate: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = () => {
    if (formData.name && formData.email && formData.department && formData.position) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={formData.department}
              onChange={(e) => handleChange('department', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Department</option>
              <option value="IT">IT</option>
              <option value="HR">Human Resources</option>
              <option value="Finance">Finance</option>
              <option value="Operations">Operations</option>
              <option value="Programs">Programs</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter position"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleChange('startDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Employee
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YSMEmployeeAutomationSystem;