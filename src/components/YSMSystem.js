// // File: src/components/YSMSystem.js

// import React, { useState, useEffect } from 'react';
// import { User, Settings, Database, Mail, CheckCircle, XCircle, Clock, Bell, Users, BarChart3, Shield, RefreshCw, LogOut, Plus, Eye, Key, AlertTriangle, Link } from 'lucide-react';
// import GoogleWorkspaceService from './GoogleWorkspaceService';

// // Mock Data Store (simulating MongoDB)

// // Utility function for safe error message extraction
// const getSafeErrorMessage = (error) => {
//   if (!error) return 'Unknown error occurred';
//   if (typeof error === 'string') return error;
//   if (error.message) return error.message;
//   if (error.toString && typeof error.toString === 'function') return error.toString();
//   return 'Unknown error occurred';
// };

// // Safe string includes check
// const safeIncludes = (str, searchString) => {
//   if (!str || typeof str !== 'string') return false;
//   return str.includes(searchString);
// };


// const mockDatabase = {
//   employees: [
//     {
//       id: 1,
//       name: 'John Smith',
//       email: 'john.smith@ysm.org',
//       department: 'IT',
//       position: 'Developer',
//       status: 'active',
//       onboardingDate: '2024-01-15',
//       platforms: {
//         googleWorkspace: 'provisioned',
//         salesforce: 'provisioned',
//         basecamp: 'provisioned',
//         activeDirectory: 'provisioned'
//       }
//     },
//     {
//       id: 2,
//       name: 'Sarah Johnson',
//       email: 'sarah.johnson@ysm.org',
//       department: 'HR',
//       position: 'Manager',
//       status: 'pending',
//       onboardingDate: '2024-06-18',
//       platforms: {
//         googleWorkspace: 'provisioned',
//         salesforce: 'pending',
//         basecamp: 'failed',
//         activeDirectory: 'provisioned'
//       }
//     }
//   ],
//   activities: [
//     {
//       id: 1,
//       type: 'onboarding',
//       employee: 'John Smith',
//       platform: 'Google Workspace',
//       status: 'success',
//       timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
//       details: 'Account created successfully'
//     },
//     {
//       id: 2,
//       type: 'onboarding',
//       employee: 'Sarah Johnson',
//       platform: 'Basecamp',
//       status: 'failed',
//       timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
//       details: 'Permission denied - admin access required'
//     }
//   ],
//   stats: {
//     totalEmployees: 47,
//     activeOnboarding: 3,
//     completedToday: 5,
//     failedOperations: 2
//   }
// };

// const YSMEmployeeAutomationSystem = () => {
//   const [currentView, setCurrentView] = useState('dashboard');
//   const [employees, setEmployees] = useState(mockDatabase.employees);
//   const [activities, setActivities] = useState(mockDatabase.activities);
//   const [stats, setStats] = useState(mockDatabase.stats);
//   const [showForm, setShowForm] = useState(false);
//   const [showGoogleSetup, setShowGoogleSetup] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [username, setUsername] = useState('');
//   const [googleService] = useState(new GoogleWorkspaceService());
//   const [googleCredentials, setGoogleCredentials] = useState({
//     clientId: '',
//     apiKey: '',
//     isConfigured: false,
//     isConnected: false
//   });

//   // Initialize Google API when credentials are set
//   useEffect(() => {
//     if (googleCredentials.clientId && googleCredentials.apiKey && !googleCredentials.isConfigured) {
//       initializeGoogleAPI();
//     }
//   }, [googleCredentials.clientId, googleCredentials.apiKey]);

//   const initializeGoogleAPI = async () => {
//     try {
//       addNotification('Initializing Google Workspace API...', 'info');
//       await googleService.initialize(googleCredentials.clientId, googleCredentials.apiKey);
//       setGoogleCredentials(prev => ({ ...prev, isConfigured: true }));
//       addNotification('Google Workspace API initialized successfully! You can now connect.', 'success');
//     } catch (error) {
//       console.error('Google API initialization error:', error);
//       let errorMessage = 'Failed to initialize Google API: ';
//       const errorMsg = getSafeErrorMessage(error);
//       if (safeIncludes(errorMsg, 'Invalid API key')) {
//         errorMessage += 'Invalid API Key. Please check your Google Cloud Console.';
        
//       } else if (error.message.includes('Invalid client')) {
//         errorMessage += 'Invalid Client ID. Please verify your OAuth 2.0 client configuration.';
//       } else if (error.message.includes('Origin not allowed')) {
//         errorMessage += 'Domain not authorized. Add your domain to authorized origins in Google Cloud Console.';
//       } else if (error.message.includes('API not enabled')) {
//         errorMessage += 'Admin SDK API not enabled. Please enable it in Google Cloud Console.';
//       } else {
//         errorMessage += error.message || 'Unknown error. Check browser console for details.';
//       }
      
//       addNotification(errorMessage, 'error');
//       setGoogleCredentials(prev => ({ ...prev, isConfigured: false }));
//     }
//   };

//   const connectGoogleWorkspace = async () => {
//     try {
//       addNotification('Connecting to Google Workspace...', 'info');
//       const user = await googleService.signIn();
//       setGoogleCredentials(prev => ({ ...prev, isConnected: true }));
      
//       const profile = user.getBasicProfile();
//       const email = profile.getEmail();
//       const domain = email.split('@')[1];
      
//       addNotification(`Connected to Google Workspace successfully as ${profile.getName()} (${email})`, 'success');
      
//       // Test API access by trying to list users
//       try {
//         const result = await googleService.listUsers();
//         if (result.success) {
//           addNotification(`✅ Admin access verified! Found ${result.data.length} users in ${domain}`, 'success');
//         } else {
//           addNotification(`⚠️ Connected but admin access may be limited: ${result.error}`, 'warning');
//         }
//       } catch (testError) {
//         addNotification(`⚠️ Connected but unable to test admin access: ${testError.message}`, 'warning');
//       }
      
//     } catch (error) {
//       console.error('Google Workspace connection error:', error);
//       let errorMessage = 'Failed to connect to Google Workspace: ';
      
//       if (error.message.includes('popup_closed_by_user')) {
//         errorMessage += 'Sign-in cancelled. Please try again.';
//       } else if (error.message.includes('access_denied')) {
//         errorMessage += 'Access denied. You need Google Workspace Super Admin privileges.';
//       } else if (error.message.includes('invalid_client')) {
//         errorMessage += 'Invalid credentials. Please check your Client ID configuration.';
//       } else if (error.message.includes('popup_blocked')) {
//         errorMessage += 'Popup blocked. Please allow popups for this site and try again.';
//       } else {
//         errorMessage += error.message || 'Unknown error. Check browser console for details.';
//       }
      
//       addNotification(errorMessage, 'error');
//       setGoogleCredentials(prev => ({ ...prev, isConnected: false }));
//     }
//   };

//   const disconnectGoogleWorkspace = () => {
//     googleService.signOut();
//     setGoogleCredentials(prev => ({ ...prev, isConnected: false }));
//     addNotification('Disconnected from Google Workspace', 'info');
//   };

//   // Simulated Login
//   const handleLogin = (user, pass) => {
//     if (user === 'admin' && pass === 'ysm2024') {
//       setIsAuthenticated(true);
//       setUsername('YSM Admin');
//       addNotification('Login successful', 'success');
//     } else {
//       addNotification('Invalid credentials', 'error');
//     }
//   };

//   // Add notification
//   const addNotification = (message, type = 'info') => {
//     const notification = {
//       id: Date.now(),
//       message,
//       type,
//       timestamp: new Date().toISOString()
//     };
//     setNotifications(prev => [notification, ...prev.slice(0, 4)]);
//     setTimeout(() => {
//       setNotifications(prev => prev.filter(n => n.id !== notification.id));
//     }, 8000);
//   };

//   // Enhanced Google Workspace integration
//   const handleGoogleWorkspaceProvisioning = async (employeeData) => {
//     if (!googleCredentials.isConnected) {
//       addNotification('Google Workspace not connected. Using simulation mode.', 'warning');
//       return await simulatePlatformAPI('Google Workspace', 'onboarding', employeeData);
//     }

//     try {
//       addNotification(`Creating Google Workspace account for ${employeeData.name}`, 'info');
      
//       const result = await googleService.createUser(employeeData);
      
//       const activity = {
//         id: Date.now() + Math.random(),
//         type: 'onboarding',
//         employee: employeeData.name,
//         platform: 'Google Workspace',
//         status: result.success ? 'success' : 'failed',
//         timestamp: new Date().toISOString(),
//         details: result.success 
//           ? `Account created successfully: ${employeeData.email}` 
//           : `Failed: ${result.error}`
//       };
      
//       setActivities(prev => [activity, ...prev]);
      
//       if (result.success) {
//         addNotification(`Google Workspace account created for ${employeeData.name}`, 'success');
//       } else {
//         addNotification(`Google Workspace creation failed: ${result.error}`, 'error');
//       }
      
//       return result.success;
//     } catch (error) {
//       addNotification(`Google Workspace error: ${error.message}`, 'error');
//       return false;
//     }
//   };

//   // Simulate API calls to other platforms
//   const simulatePlatformAPI = async (platform, action, employeeData) => {
//     const delay = Math.random() * 2000 + 1000; // 1-3 seconds
//     const success = Math.random() > 0.2; // 80% success rate
    
//     await new Promise(resolve => setTimeout(resolve, delay));
    
//     const activity = {
//       id: Date.now() + Math.random(),
//       type: action,
//       employee: employeeData.name,
//       platform,
//       status: success ? 'success' : 'failed',
//       timestamp: new Date().toISOString(),
//       details: success ? `${action} completed successfully` : `${action} failed - retry required`
//     };
    
//     setActivities(prev => [activity, ...prev]);
//     return success;
//   };

//   // Handle employee onboarding with real Google Workspace integration
//   const handleOnboarding = async (employeeData) => {
//     const newEmployee = {
//       ...employeeData,
//       id: Date.now(),
//       status: 'pending',
//       onboardingDate: new Date().toISOString().split('T')[0],
//       platforms: {}
//     };

//     setEmployees(prev => [...prev, newEmployee]);
//     addNotification(`Onboarding started for ${employeeData.name}`, 'info');

//     // Process Google Workspace with real API if connected
//     const googleSuccess = await handleGoogleWorkspaceProvisioning(employeeData);
//     newEmployee.platforms.googleworkspace = googleSuccess ? 'provisioned' : 'failed';

//     // Process other platforms (simulated)
//     const otherPlatforms = ['Salesforce', 'Basecamp', 'Active Directory'];
//     for (const platform of otherPlatforms) {
//       const success = await simulatePlatformAPI(platform, 'onboarding', employeeData);
//       newEmployee.platforms[platform.toLowerCase().replace(/\s+/g, '')] = success ? 'provisioned' : 'failed';
//     }

//     // Update employee status
//     const allProvisioned = Object.values(newEmployee.platforms).every(status => status === 'provisioned');
//     newEmployee.status = allProvisioned ? 'active' : 'partial';

//     setEmployees(prev => prev.map(emp => emp.id === newEmployee.id ? newEmployee : emp));
    
//     // Update stats
//     setStats(prev => ({
//       ...prev,
//       totalEmployees: prev.totalEmployees + 1,
//       completedToday: prev.completedToday + (allProvisioned ? 1 : 0),
//       failedOperations: prev.failedOperations + (allProvisioned ? 0 : 1)
//     }));

//     addNotification(
//       `Onboarding ${allProvisioned ? 'completed' : 'partially completed'} for ${employeeData.name}`,
//       allProvisioned ? 'success' : 'warning'
//     );
//   };

//   // Retry failed provisions
//   const retryProvision = async (employeeId, platform) => {
//     const employee = employees.find(emp => emp.id === employeeId);
//     if (!employee) return;

//     addNotification(`Retrying ${platform} provision for ${employee.name}`, 'info');
    
//     let success;
//     if (platform.toLowerCase() === 'googleworkspace' || platform.toLowerCase() === 'google workspace') {
//       success = await handleGoogleWorkspaceProvisioning(employee);
//     } else {
//       success = await simulatePlatformAPI(platform, 'retry', employee);
//     }
    
//     setEmployees(prev => prev.map(emp => 
//       emp.id === employeeId 
//         ? { ...emp, platforms: { ...emp.platforms, [platform.toLowerCase().replace(/\s+/g, '')]: success ? 'provisioned' : 'failed' } }
//         : emp
//     ));
//   };

//   if (!isAuthenticated) {
//     return <LoginScreen onLogin={handleLogin} />;
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm border-b">
//         <div className="flex items-center justify-between px-6 py-4">
//           <div className="flex items-center space-x-4">
//             <div className="bg-blue-600 p-2 rounded-lg">
//               <Users className="h-6 w-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-bold text-gray-900">YSM Employee Automation</h1>
//               <p className="text-sm text-gray-500">
//                 Streamlined Onboarding & Offboarding
//                 {googleCredentials.isConnected && (
//                   <span className="ml-2 text-green-600">• Google Workspace Connected</span>
//                 )}
//               </p>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-4">
//             {!googleCredentials.isConfigured && (
//               <button
//                 onClick={() => setShowGoogleSetup(true)}
//                 className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center space-x-1 text-sm"
//               >
//                 <Key className="h-4 w-4" />
//                 <span>Setup Google</span>
//               </button>
//             )}
//             <NotificationPanel notifications={notifications} />
//             <div className="flex items-center space-x-2">
//               <span className="text-sm text-gray-700">Welcome, {username}</span>
//               <button
//                 onClick={() => setIsAuthenticated(false)}
//                 className="p-2 text-gray-500 hover:text-gray-700"
//               >
//                 <LogOut className="h-4 w-4" />
//               </button>
//             </div>
//           </div>
//         </div>
//       </header>

//       <div className="flex">
//         {/* Sidebar */}
//         <Sidebar currentView={currentView} onViewChange={setCurrentView} />

//         {/* Main Content */}
//         <main className="flex-1 p-6">
//           {currentView === 'dashboard' && (
//             <DashboardView 
//               stats={stats} 
//               activities={activities} 
//               onShowForm={() => setShowForm(true)}
//               googleCredentials={googleCredentials}
//             />
//           )}
//           {currentView === 'employees' && (
//             <EmployeesView 
//               employees={employees} 
//               onRetry={retryProvision}
//               onShowForm={() => setShowForm(true)}
//             />
//           )}
//           {currentView === 'activities' && <ActivitiesView activities={activities} />}
//           {currentView === 'settings' && (
//             <SettingsView 
//               googleCredentials={googleCredentials}
//               onConnectGoogle={connectGoogleWorkspace}
//               onDisconnectGoogle={disconnectGoogleWorkspace}
//               onShowSetup={() => setShowGoogleSetup(true)}
//               addNotification={addNotification}
//             />
//           )}
//         </main>
//       </div>

//       {/* Employee Form Modal */}
//       {showForm && (
//         <EmployeeForm 
//           onSubmit={handleOnboarding}
//           onClose={() => setShowForm(false)}
//         />
//       )}

//       {/* Google Setup Modal */}
//       {showGoogleSetup && (
//         <GoogleSetupModal
//           onSave={(credentials) => {
//             setGoogleCredentials(prev => ({ ...prev, ...credentials }));
//             setShowGoogleSetup(false);
//           }}
//           onClose={() => setShowGoogleSetup(false)}
//           currentCredentials={googleCredentials}
//         />
//       )}
//     </div>
//   );
// };

// // Login Screen Component
// const LoginScreen = ({ onLogin }) => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');

//   const handleSubmit = () => {
//     onLogin(username, password);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
//       <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
//         <div className="text-center mb-8">
//           <div className="bg-blue-600 p-3 rounded-full w-16 h-16 mx-auto mb-4">
//             <Shield className="h-10 w-10 text-white" />
//           </div>
//           <h2 className="text-2xl font-bold text-gray-900">YSM Admin Portal</h2>
//           <p className="text-gray-600">Employee Automation System</p>
//         </div>
        
//         <div className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
//             <input
//               type="text"
//               value={username}
//               onChange={(e) => setUsername(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="admin"
//             />
//           </div>
          
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//               placeholder="ysm2024"
//               onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
//             />
//           </div>
          
//           <button
//             onClick={handleSubmit}
//             className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
//           >
//             Sign In
//           </button>
//         </div>
        
//         <div className="mt-6 text-center text-sm text-gray-500">
//           Demo credentials: admin / ysm2024
//         </div>
//       </div>
//     </div>
//   );
// };

// // Sidebar Component
// const Sidebar = ({ currentView, onViewChange }) => {
//   const menuItems = [
//     { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
//     { id: 'employees', label: 'Employees', icon: Users },
//     { id: 'activities', label: 'Activity Log', icon: Database },
//     { id: 'settings', label: 'Settings', icon: Settings }
//   ];

//   return (
//     <aside className="w-64 bg-white shadow-sm border-r">
//       <nav className="p-4">
//         <ul className="space-y-2">
//           {menuItems.map(item => {
//             const Icon = item.icon;
//             return (
//               <li key={item.id}>
//                 <button
//                   onClick={() => onViewChange(item.id)}
//                   className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
//                     currentView === item.id
//                       ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
//                       : 'text-gray-700 hover:bg-gray-100'
//                   }`}
//                 >
//                   <Icon className="h-5 w-5" />
//                   <span>{item.label}</span>
//                 </button>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>
//     </aside>
//   );
// };

// // Google Setup Modal Component
// const GoogleSetupModal = ({ onSave, onClose, currentCredentials }) => {
//   const [credentials, setCredentials] = useState({
//     clientId: currentCredentials.clientId || '',
//     apiKey: currentCredentials.apiKey || ''
//   });
//   const [showInstructions, setShowInstructions] = useState(false);
//   const [showTroubleshooting, setShowTroubleshooting] = useState(false);
//   const [errors, setErrors] = useState({});

//   const validateCredentials = () => {
//     const newErrors = {};
    
//     if (!credentials.clientId) {
//       newErrors.clientId = 'Client ID is required';
//     } else if (!credentials.clientId.includes('.apps.googleusercontent.com')) {
//       newErrors.clientId = 'Client ID should end with .apps.googleusercontent.com';
//     }
    
//     if (!credentials.apiKey) {
//       newErrors.apiKey = 'API Key is required';
//     } else if (credentials.apiKey.length < 35) {
//       newErrors.apiKey = 'API Key seems too short (should be ~39 characters)';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSave = () => {
//     if (validateCredentials()) {
//       onSave(credentials);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-semibold text-gray-900">Google Workspace Setup</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl"
//           >
//             ×
//           </button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* Left Column - Setup */}
//           <div className="space-y-6">
//             <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//               <div className="flex items-start space-x-2">
//                 <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
//                 <div>
//                   <h4 className="font-medium text-blue-900">Security Notice</h4>
//                   <p className="text-sm text-blue-700 mt-1">
//                     For production use, these credentials should be stored securely on your server, not in the browser.
//                     This demo allows client-side configuration for testing purposes only.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Google Client ID
//               </label>
//               <input
//                 type="text"
//                 value={credentials.clientId}
//                 onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
//                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                   errors.clientId ? 'border-red-300' : 'border-gray-300'
//                 }`}
//                 placeholder="1234567890-abcdefghijklmnop.apps.googleusercontent.com"
//               />
//               {errors.clientId && (
//                 <p className="text-red-500 text-xs mt-1">{errors.clientId}</p>
//               )}
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Google API Key
//               </label>
//               <input
//                 type="password"
//                 value={credentials.apiKey}
//                 onChange={(e) => setCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
//                 className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
//                   errors.apiKey ? 'border-red-300' : 'border-gray-300'
//                 }`}
//                 placeholder="AIzaSyABC123DEF456GHI789JKL012MNO345PQR"
//               />
//               {errors.apiKey && (
//                 <p className="text-red-500 text-xs mt-1">{errors.apiKey}</p>
//               )}
//             </div>

//             <div className="flex space-x-4">
//               <button
//                 onClick={onClose}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSave}
//                 className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//               >
//                 Save & Initialize
//               </button>
//             </div>
//           </div>

//           {/* Right Column - Instructions & Troubleshooting */}
//           <div className="space-y-4">
//             <div>
//               <button
//                 onClick={() => setShowInstructions(!showInstructions)}
//                 className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
//               >
//                 <Link className="h-4 w-4" />
//                 <span>Setup Instructions</span>
//               </button>

//               {showInstructions && (
//                 <div className="mt-4 bg-gray-50 rounded-lg p-4 text-sm">
//                   <h4 className="font-medium text-gray-900 mb-2">Step-by-Step Setup:</h4>
//                   <ol className="list-decimal list-inside space-y-2 text-gray-700">
//                     <li>Go to <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
//                     <li>Create a new project or select existing</li>
//                     <li>Enable these APIs:
//                       <ul className="list-disc list-inside ml-4 mt-1">
//                         <li>Admin SDK API</li>
//                         <li>Google Workspace Admin SDK</li>
//                       </ul>
//                     </li>
//                     <li>Create Credentials:
//                       <ul className="list-disc list-inside ml-4 mt-1">
//                         <li>API Key (restrict to Admin SDK)</li>
//                         <li>OAuth 2.0 Client ID (Web application)</li>
//                       </ul>
//                     </li>
//                     <li>Configure OAuth Client:
//                       <ul className="list-disc list-inside ml-4 mt-1">
//                         <li>Add http://localhost:3000 to authorized origins</li>
//                         <li>Add redirect URIs if needed</li>
//                       </ul>
//                     </li>
//                   </ol>
//                 </div>
//               )}
//             </div>

//             <div>
//               <button
//                 onClick={() => setShowTroubleshooting(!showTroubleshooting)}
//                 className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium"
//               >
//                 <AlertTriangle className="h-4 w-4" />
//                 <span>Troubleshooting Common Issues</span>
//               </button>

//               {showTroubleshooting && (
//                 <div className="mt-4 bg-red-50 rounded-lg p-4 text-sm">
//                   <h4 className="font-medium text-red-900 mb-2">Common Connection Issues:</h4>
//                   <div className="space-y-3 text-red-800">
//                     <div>
//                       <strong>1. "Access denied" Error:</strong>
//                       <ul className="list-disc list-inside ml-4 text-xs mt-1">
//                         <li>You need Google Workspace <strong>Super Admin</strong> privileges</li>
//                         <li>Regular Gmail accounts won't work</li>
//                         <li>Must be signed in with admin account</li>
//                       </ul>
//                     </div>
//                     <div>
//                       <strong>2. "Invalid Client" Error:</strong>
//                       <ul className="list-disc list-inside ml-4 text-xs mt-1">
//                         <li>Client ID format should end with .apps.googleusercontent.com</li>
//                         <li>Check for extra spaces or characters</li>
//                         <li>Verify OAuth client is for "Web application"</li>
//                       </ul>
//                     </div>
//                     <div>
//                       <strong>3. "API Key Invalid" Error:</strong>
//                       <ul className="list-disc list-inside ml-4 text-xs mt-1">
//                         <li>Ensure Admin SDK API is enabled</li>
//                         <li>API key should be ~39 characters long</li>
//                         <li>Restrict API key to Admin SDK only</li>
//                       </ul>
//                     </div>
//                     <div>
//                       <strong>4. "CORS" or "Origin" Errors:</strong>
//                       <ul className="list-disc list-inside ml-4 text-xs mt-1">
//                         <li>Add http://localhost:3000 to authorized origins</li>
//                         <li>Include both http:// and https:// if testing locally</li>
//                         <li>Clear browser cache after changes</li>
//                       </ul>
//                     </div>
//                     <div>
//                       <strong>5. "Popup Blocked" Error:</strong>
//                       <ul className="list-disc list-inside ml-4 text-xs mt-1">
//                         <li>Allow popups for this site</li>
//                         <li>Try using incognito/private mode</li>
//                         <li>Disable ad blockers temporarily</li>
//                       </ul>
//                     </div>
//                   </div>
//                   <div className="mt-3 p-2 bg-yellow-100 rounded border-l-4 border-yellow-400">
//                     <p className="text-yellow-800 text-xs">
//                       <strong>💡 Quick Test:</strong> Open browser console (F12) after clicking "Save" to see detailed error messages.
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//               <h4 className="font-medium text-green-900 mb-2">✅ Prerequisites Checklist:</h4>
//               <ul className="text-green-800 text-sm space-y-1">
//                 <li>□ Google Workspace account (not Gmail)</li>
//                 <li>□ Super Admin privileges</li>
//                 <li>□ Google Cloud project created</li>
//                 <li>□ Admin SDK API enabled</li>
//                 <li>□ OAuth client configured</li>
//                 <li>□ http://localhost:3000 in authorized origins</li>
//                 <li>□ Popups allowed in browser</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Remaining components continue here... 
// // (NotificationPanel, DashboardView, StatsCard, SystemArchitecture, etc.)
// // For brevity, I'll include the main ones. The full file would continue with all components.

// // Notification Panel Component
// const NotificationPanel = ({ notifications }) => {
//   const [showNotifications, setShowNotifications] = useState(false);

//   return (
//     <div className="relative">
//       <button
//         onClick={() => setShowNotifications(!showNotifications)}
//         className="relative p-2 text-gray-500 hover:text-gray-700"
//       >
//         <Bell className="h-5 w-5" />
//         {notifications.length > 0 && (
//           <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
//             {notifications.length}
//           </span>
//         )}
//       </button>

//       {showNotifications && (
//         <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
//           <div className="p-4 border-b">
//             <h3 className="font-semibold text-gray-900">Notifications</h3>
//           </div>
//           <div className="max-h-64 overflow-y-auto">
//             {notifications.length === 0 ? (
//               <p className="p-4 text-gray-500 text-center">No notifications</p>
//             ) : (
//               notifications.map(notification => (
//                 <div key={notification.id} className="p-3 border-b last:border-b-0">
//                   <div className={`flex items-start space-x-2 ${
//                     notification.type === 'success' ? 'text-green-700' :
//                     notification.type === 'error' ? 'text-red-700' :
//                     notification.type === 'warning' ? 'text-yellow-700' : 'text-blue-700'
//                   }`}>
//                     <div className="flex-1">
//                       <p className="text-sm">{notification.message}</p>
//                       <p className="text-xs text-gray-500 mt-1">
//                         {new Date(notification.timestamp).toLocaleTimeString()}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// // Dashboard View Component
// const DashboardView = ({ stats, activities, onShowForm, googleCredentials }) => {
//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
//         <button
//           onClick={onShowForm}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
//         >
//           <Plus className="h-4 w-4" />
//           <span>New Employee</span>
//         </button>
//       </div>

//       {/* Google Workspace Status */}
//       {googleCredentials.isConfigured && (
//         <div className={`p-4 rounded-lg border ${
//           googleCredentials.isConnected 
//             ? 'bg-green-50 border-green-200' 
//             : 'bg-yellow-50 border-yellow-200'
//         }`}>
//           <div className="flex items-center space-x-2">
//             <div className={`w-3 h-3 rounded-full ${
//               googleCredentials.isConnected ? 'bg-green-500' : 'bg-yellow-500'
//             }`}></div>
//             <span className="font-medium">
//               Google Workspace: {googleCredentials.isConnected ? 'Connected' : 'Ready to Connect'}
//             </span>
//           </div>
//         </div>
//       )}

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
//         <StatsCard
//           title="Total Employees"
//           value={stats.totalEmployees}
//           icon={Users}
//           color="blue"
//         />
//         <StatsCard
//           title="Active Onboarding"
//           value={stats.activeOnboarding}
//           icon={Clock}
//           color="yellow"
//         />
//         <StatsCard
//           title="Completed Today"
//           value={stats.completedToday}
//           icon={CheckCircle}
//           color="green"
//         />
//         <StatsCard
//           title="Failed Operations"
//           value={stats.failedOperations}
//           icon={XCircle}
//           color="red"
//         />
//       </div>

//       {/* Recent Activities */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="p-6 border-b">
//           <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
//         </div>
//         <div className="p-6">
//           <div className="space-y-4">
//             {activities.slice(0, 5).map(activity => (
//               <ActivityItem key={activity.id} activity={activity} />
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* System Architecture Visual */}
//       <div className="bg-white rounded-lg shadow">
//         <div className="p-6 border-b">
//           <h3 className="text-lg font-semibold text-gray-900">System Architecture</h3>
//         </div>
//         <div className="p-6">
//           <SystemArchitecture googleConnected={googleCredentials.isConnected} />
//         </div>
//       </div>
//     </div>
//   );
// };

// // Additional components would continue here...
// // (StatsCard, SystemArchitecture, ActivityItem, EmployeesView, etc.)
// // Add these components to the end of your YSMSystem.js file, before the export statement

// // Stats Card Component
// const StatsCard = ({ title, value, icon: Icon, color }) => {
//   const colorClasses = {
//     blue: 'bg-blue-500',
//     yellow: 'bg-yellow-500',
//     green: 'bg-green-500',
//     red: 'bg-red-500'
//   };

//   return (
//     <div className="bg-white p-6 rounded-lg shadow">
//       <div className="flex items-center">
//         <div className={`${colorClasses[color]} p-2 rounded-lg`}>
//           <Icon className="h-6 w-6 text-white" />
//         </div>
//         <div className="ml-4">
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className="text-2xl font-bold text-gray-900">{value}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// // System Architecture Visual
// const SystemArchitecture = ({ googleConnected }) => {
//   return (
//     <div className="flex flex-col items-center space-y-4">
//       <div className="bg-blue-100 px-4 py-2 rounded-lg">📝 Google Form</div>
//       <div className="text-blue-500">↓</div>
//       <div className="bg-green-100 px-4 py-2 rounded-lg">⚡ Google Apps Script</div>
//       <div className="text-blue-500">↓</div>
//       <div className="bg-purple-100 px-4 py-2 rounded-lg">🐍 Flask Backend</div>
//       <div className="text-blue-500">↓</div>
//       <div className="bg-gray-100 px-4 py-2 rounded-lg">🗄️ MongoDB</div>
//       <div className="text-blue-500">↓</div>
//       <div className="flex flex-wrap justify-center gap-2">
//         <div className={`px-3 py-1 rounded text-sm ${
//           googleConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
//         }`}>
//           Google Workspace {googleConnected ? '✓' : '✗'}
//         </div>
//         <div className="bg-blue-100 px-3 py-1 rounded text-sm">Salesforce (Simulated)</div>
//         <div className="bg-yellow-100 px-3 py-1 rounded text-sm">Basecamp (Simulated)</div>
//         <div className="bg-purple-100 px-3 py-1 rounded text-sm">Active Directory (Simulated)</div>
//       </div>
//       <div className="text-blue-500">↓</div>
//       <div className="bg-green-100 px-4 py-2 rounded-lg">⚛️ React Admin Panel</div>
//     </div>
//   );
// };

// // Activity Item Component
// const ActivityItem = ({ activity }) => {
//   const getStatusIcon = (status) => {
//     switch (status) {
//       case 'success':
//         return <CheckCircle className="h-5 w-5 text-green-500" />;
//       case 'failed':
//         return <XCircle className="h-5 w-5 text-red-500" />;
//       default:
//         return <Clock className="h-5 w-5 text-yellow-500" />;
//     }
//   };

//   return (
//     <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
//       {getStatusIcon(activity.status)}
//       <div className="flex-1">
//         <p className="font-medium text-gray-900">
//           {activity.type} - {activity.employee}
//         </p>
//         <p className="text-sm text-gray-600">{activity.platform}</p>
//         <p className="text-xs text-gray-500">{activity.details}</p>
//       </div>
//       <div className="text-xs text-gray-500">
//         {new Date(activity.timestamp).toLocaleTimeString()}
//       </div>
//     </div>
//   );
// };

// // Employees View Component
// const EmployeesView = ({ employees, onRetry, onShowForm }) => {
//   return (
//     <div className="space-y-6">
//       <div className="flex justify-between items-center">
//         <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
//         <button
//           onClick={onShowForm}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
//         >
//           <Plus className="h-4 w-4" />
//           <span>Add Employee</span>
//         </button>
//       </div>

//       <div className="bg-white rounded-lg shadow overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="min-w-full divide-y divide-gray-200">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Employee
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Department
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Status
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Platforms
//                 </th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
//                   Actions
//                 </th>
//               </tr>
//             </thead>
//             <tbody className="bg-white divide-y divide-gray-200">
//               {employees.map(employee => (
//                 <EmployeeRow key={employee.id} employee={employee} onRetry={onRetry} />
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Employee Row Component
// const EmployeeRow = ({ employee, onRetry }) => {
//   const getStatusBadge = (status) => {
//     const classes = {
//       active: 'bg-green-100 text-green-800',
//       pending: 'bg-yellow-100 text-yellow-800',
//       partial: 'bg-orange-100 text-orange-800',
//       inactive: 'bg-gray-100 text-gray-800'
//     };

//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full ${classes[status] || classes.inactive}`}>
//         {status}
//       </span>
//     );
//   };

//   const getPlatformStatus = (status) => {
//     const icons = {
//       provisioned: <CheckCircle className="h-4 w-4 text-green-500" />,
//       failed: <XCircle className="h-4 w-4 text-red-500" />,
//       pending: <Clock className="h-4 w-4 text-yellow-500" />
//     };

//     return icons[status] || <Clock className="h-4 w-4 text-gray-500" />;
//   };

//   return (
//     <tr>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div>
//           <div className="text-sm font-medium text-gray-900">{employee.name}</div>
//           <div className="text-sm text-gray-500">{employee.email}</div>
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="text-sm text-gray-900">{employee.department}</div>
//         <div className="text-sm text-gray-500">{employee.position}</div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         {getStatusBadge(employee.status)}
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap">
//         <div className="flex flex-wrap gap-2">
//           {Object.entries(employee.platforms).map(([platform, status]) => (
//             <div key={platform} className="flex items-center space-x-1">
//               {getPlatformStatus(status)}
//               <span className="text-xs text-gray-500 capitalize">
//                 {platform.replace(/([A-Z])/g, ' $1').trim()}
//               </span>
//             </div>
//           ))}
//         </div>
//       </td>
//       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//         <div className="flex space-x-2">
//           {Object.entries(employee.platforms)
//             .filter(([, status]) => status === 'failed')
//             .map(([platform]) => (
//               <button
//                 key={platform}
//                 onClick={() => onRetry(employee.id, platform)}
//                 className="text-blue-600 hover:text-blue-900 flex items-center space-x-1 text-xs"
//               >
//                 <RefreshCw className="h-3 w-3" />
//                 <span>Retry</span>
//               </button>
//             ))}
//           <button className="text-gray-600 hover:text-gray-900">
//             <Eye className="h-4 w-4" />
//           </button>
//         </div>
//       </td>
//     </tr>
//   );
// };

// // Activities View Component
// const ActivitiesView = ({ activities }) => {
//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-900">Activity Log</h2>

//       <div className="bg-white rounded-lg shadow">
//         <div className="p-6">
//           <div className="space-y-4">
//             {activities.map(activity => (
//               <ActivityItem key={activity.id} activity={activity} />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Settings View Component
// const SettingsView = ({ googleCredentials, onConnectGoogle, onDisconnectGoogle, onShowSetup, addNotification }) => {
//   const [settings, setSettings] = useState({
//     autoRetry: true,
//     emailNotifications: true,
//     summaryEmail: 'admin@ysm.org'
//   });

//   return (
//     <div className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Integrations</h3>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//               <div className="flex items-center space-x-3">
//                 <div className={`w-3 h-3 rounded-full ${
//                   googleCredentials.isConnected ? 'bg-green-500' : 
//                   googleCredentials.isConfigured ? 'bg-yellow-500' : 'bg-red-500'
//                 }`}></div>
//                 <span className="font-medium text-gray-900">Google Workspace</span>
//               </div>
//               <div className="flex items-center space-x-2">
//                 <span className={`text-sm ${
//                   googleCredentials.isConnected ? 'text-green-600' : 
//                   googleCredentials.isConfigured ? 'text-yellow-600' : 'text-red-600'
//                 }`}>
//                   {googleCredentials.isConnected ? 'connected' : 
//                    googleCredentials.isConfigured ? 'ready' : 'not configured'}
//                 </span>
//                 {!googleCredentials.isConfigured ? (
//                   <button
//                     onClick={onShowSetup}
//                     className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
//                   >
//                     Setup
//                   </button>
//                 ) : !googleCredentials.isConnected ? (
//                   <div className="flex space-x-1">
//                     <button
//                       onClick={onConnectGoogle}
//                       className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
//                     >
//                       Connect
//                     </button>
//                     <button
//                       onClick={() => {
//                         // Test connection without full sign-in
//                         const testConnection = async () => {
//                           try {
//                             if (window.gapi && window.gapi.auth2) {
//                               const authInstance = window.gapi.auth2.getAuthInstance();
//                               if (authInstance) {
//                                 addNotification('✅ Google API is properly configured and ready to connect', 'success');
//                               } else {
//                                 addNotification('⚠️ Google API initialized but auth instance not available', 'warning');
//                               }
//                             } else {
//                               addNotification('❌ Google API not properly loaded. Check your setup.', 'error');
//                             }
//                           } catch (error) {
//                             addNotification(`❌ Connection test failed: ${error.message}`, 'error');
//                           }
//                         };
//                         testConnection();
//                       }}
//                       className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
//                     >
//                       Test
//                     </button>
//                   </div>
//                 ) : (
//                   <button
//                     onClick={onDisconnectGoogle}
//                     className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
//                   >
//                     Disconnect
//                   </button>
//                 )}
//               </div>
//             </div>
//             <PlatformSetting name="Salesforce" status="simulated" />
//             <PlatformSetting name="Basecamp" status="simulated" />
//             <PlatformSetting name="Active Directory" status="simulated" />
//           </div>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <label className="text-sm font-medium text-gray-700">
//                 Auto-retry Failed Operations
//               </label>
//               <button
//                 onClick={() => setSettings(prev => ({ ...prev, autoRetry: !prev.autoRetry }))}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                   settings.autoRetry ? 'bg-blue-600' : 'bg-gray-200'
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                     settings.autoRetry ? 'translate-x-6' : 'translate-x-1'
//                   }`}
//                 />
//               </button>
//             </div>
//             <div className="flex items-center justify-between">
//               <label className="text-sm font-medium text-gray-700">
//                 Email Notifications
//               </label>
//               <button
//                 onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
//                 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
//                   settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
//                 }`}
//               >
//                 <span
//                   className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
//                     settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
//                   }`}
//                 />
//               </button>
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Daily Summary Email
//               </label>
//               <input
//                 type="email"
//                 value={settings.summaryEmail}
//                 onChange={(e) => setSettings(prev => ({ ...prev, summaryEmail: e.target.value }))}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Platform Setting Component
// const PlatformSetting = ({ name, status }) => {
//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'connected': return { bg: 'bg-green-500', text: 'text-green-600' };
//       case 'simulated': return { bg: 'bg-blue-500', text: 'text-blue-600' };
//       case 'disconnected': return { bg: 'bg-red-500', text: 'text-red-600' };
//       default: return { bg: 'bg-gray-500', text: 'text-gray-600' };
//     }
//   };

//   const colors = getStatusColor(status);

//   return (
//     <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
//       <div className="flex items-center space-x-3">
//         <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
//         <span className="font-medium text-gray-900">{name}</span>
//       </div>
//       <span className={`text-sm ${colors.text}`}>
//         {status}
//       </span>
//     </div>
//   );
// };

// // Employee Form Component
// const EmployeeForm = ({ onSubmit, onClose }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     department: '',
//     position: '',
//     startDate: new Date().toISOString().split('T')[0]
//   });

//   const handleSubmit = () => {
//     if (formData.name && formData.email && formData.department && formData.position) {
//       onSubmit(formData);
//       onClose();
//     }
//   };

//   const handleChange = (field, value) => {
//     setFormData({
//       ...formData,
//       [field]: value
//     });
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
//         <div className="flex justify-between items-center mb-6">
//           <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 text-2xl"
//           >
//             ×
//           </button>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Full Name
//             </label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => handleChange('name', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter full name"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Email Address
//             </label>
//             <input
//               type="email"
//               value={formData.email}
//               onChange={(e) => handleChange('email', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter email address"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Department
//             </label>
//             <select
//               value={formData.department}
//               onChange={(e) => handleChange('department', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="">Select Department</option>
//               <option value="IT">IT</option>
//               <option value="HR">Human Resources</option>
//               <option value="Finance">Finance</option>
//               <option value="Operations">Operations</option>
//               <option value="Programs">Programs</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Position
//             </label>
//             <input
//               type="text"
//               value={formData.position}
//               onChange={(e) => handleChange('position', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//               placeholder="Enter position"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Start Date
//             </label>
//             <input
//               type="date"
//               value={formData.startDate}
//               onChange={(e) => handleChange('startDate', e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div className="flex space-x-4 pt-4">
//             <button
//               onClick={onClose}
//               className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmit}
//               className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//             >
//               Add Employee
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
// export default YSMEmployeeAutomationSystem;

// File: src/components/YSMSystem.js
// File: src/components/YSMSystem.js

import React, { useState, useEffect } from 'react';
import { User, Settings, Database, Mail, CheckCircle, XCircle, Clock, Bell, Users, BarChart3, Shield, RefreshCw, LogOut, Plus, Eye, Key, AlertTriangle, Link } from 'lucide-react';
import GoogleWorkspaceService from './GoogleWorkspaceService';

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

const safeIncludes = (str, searchString) => {
  if (!str || typeof str !== 'string') return false;
  return str.includes(searchString);
};

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
  const [notifications, setNotifications] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [googleService] = useState(new GoogleWorkspaceService());
  const [googleCredentials, setGoogleCredentials] = useState({
    clientId: '',
    apiKey: '',
    isConfigured: false,
    isConnected: false
  });

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
      // Add a small delay to ensure the component is fully mounted
      const timer = setTimeout(() => {
        initializeGoogleAPI();
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [googleCredentials.clientId, googleCredentials.apiKey]);

  const initializeGoogleAPI = async () => {
    try {
      addNotification('Initializing Google Workspace API...', 'info');
      console.log('🔧 Debug: Starting Google API initialization');
      console.log('🔧 Debug: Client ID:', googleCredentials.clientId ? `${googleCredentials.clientId.substring(0, 30)}...` : 'MISSING');
      console.log('🔧 Debug: API Key:', googleCredentials.apiKey ? `${googleCredentials.apiKey.substring(0, 15)}...` : 'MISSING');
      
      // Validate credentials before proceeding
      if (!googleCredentials.clientId || !googleCredentials.apiKey) {
        throw new Error('Please provide both Client ID and API Key');
      }
      
      // Check if Google API script is loaded
      if (!window.gapi) {
        throw new Error('Google API script not loaded. Please check your internet connection and refresh the page.');
      }
      
      console.log('🔧 Debug: Google API script detected, initializing...');
      
      await googleService.initialize(googleCredentials.clientId, googleCredentials.apiKey);
      setGoogleCredentials(prev => ({ ...prev, isConfigured: true }));
      addNotification('Google Workspace API initialized successfully! You can now connect.', 'success');
      console.log('✅ Debug: Google API initialization completed successfully');
      
    } catch (error) {
      console.error('❌ Google API initialization error:', error);
      console.log('🔧 Debug: Error type:', typeof error);
      console.log('🔧 Debug: Error constructor:', error.constructor?.name);
      
      // Log the full error object for debugging
      try {
        console.log('🔧 Debug: Full error object:', JSON.stringify(error, null, 2));
      } catch (e) {
        console.log('🔧 Debug: Could not stringify error object');
      }
      
      const errorMsg = getSafeErrorMessage(error);
      console.log('🔧 Debug: Processed error message:', errorMsg);
      
      let userMessage = 'Failed to initialize Google API: ';
      
      if (safeIncludes(errorMsg, 'Invalid API key') || safeIncludes(errorMsg, 'API key')) {
        userMessage += 'Invalid API Key. Please check your Google Cloud Console.';
      } else if (safeIncludes(errorMsg, 'Invalid client') || safeIncludes(errorMsg, 'client')) {
        userMessage += 'Invalid Client ID. Please verify your OAuth 2.0 client configuration.';
      } else if (safeIncludes(errorMsg, 'Origin not allowed') || safeIncludes(errorMsg, 'origin')) {
        userMessage += 'Domain not authorized. Add http://localhost:3000 to authorized origins in Google Cloud Console.';
      } else if (safeIncludes(errorMsg, 'API not enabled')) {
        userMessage += 'Admin SDK API not enabled. Please enable it in Google Cloud Console.';
      } else if (safeIncludes(errorMsg, 'Client ID and API Key are required')) {
        userMessage += 'Please provide both Client ID and API Key in the setup form.';
      } else if (safeIncludes(errorMsg, 'failed to load') || safeIncludes(errorMsg, 'script not loaded')) {
        userMessage += 'Could not load Google API. Please check your internet connection and try again.';
      } else if (errorMsg.includes('gapi.load')) {
        userMessage += 'Google API loading failed. Please refresh the page and try again.';
      } else {
        userMessage += `${errorMsg}. Check browser console for more details.`;
      }
      
      addNotification(userMessage, 'error');
      setGoogleCredentials(prev => ({ ...prev, isConfigured: false }));
    }
  };

  const connectGoogleWorkspace = async () => {
    try {
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
      
      // Test API access by trying to list users
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
      
      if (safeIncludes(errorMsg, 'popup_closed_by_user') || safeIncludes(errorMsg, 'cancelled')) {
        userMessage += 'Sign-in cancelled. Please try again.';
      } else if (safeIncludes(errorMsg, 'access_denied')) {
        userMessage += 'Access denied. You need Google Workspace Super Admin privileges.';
      } else if (safeIncludes(errorMsg, 'invalid_client')) {
        userMessage += 'Invalid credentials. Please check your Client ID configuration.';
      } else if (safeIncludes(errorMsg, 'popup_blocked')) {
        userMessage += 'Popup blocked. Please allow popups for this site and try again.';
      } else if (safeIncludes(errorMsg, 'not configured')) {
        userMessage += 'Please setup your Google credentials first using the "Setup Google" button.';
      } else {
        userMessage += errorMsg;
      }
      
      addNotification(userMessage, 'error');
      setGoogleCredentials(prev => ({ ...prev, isConnected: false }));
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
      // Still set as disconnected
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

  // Handle employee onboarding with real Google Workspace integration
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

    // Process Google Workspace with real API if connected
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
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center space-x-1 text-sm"
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
              googleCredentials={googleCredentials}
            />
          )}
          {currentView === 'employees' && (
            <EmployeesView 
              employees={employees} 
              onRetry={retryProvision}
              onShowForm={() => setShowForm(true)}
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
    } else if (credentials.apiKey.length < 35) {
      newErrors.apiKey = 'API Key seems too short (should be ~39 characters)';
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
                  <h4 className="font-medium text-blue-900">Security Notice</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    For production use, these credentials should be stored securely on your server, not in the browser.
                    This demo allows client-side configuration for testing purposes only.
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

          {/* Right Column - Instructions & Troubleshooting */}
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
                    <li>Go to <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Cloud Console</a></li>
                    <li>Create a new project or select existing</li>
                    <li>Enable these APIs:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Admin SDK API</li>
                        <li>Google Workspace Admin SDK</li>
                      </ul>
                    </li>
                    <li>Create Credentials:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>API Key (restrict to Admin SDK)</li>
                        <li>OAuth 2.0 Client ID (Web application)</li>
                      </ul>
                    </li>
                    <li>Configure OAuth Client:
                      <ul className="list-disc list-inside ml-4 mt-1">
                        <li>Add http://localhost:3000 to authorized origins</li>
                        <li>Add redirect URIs if needed</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800 font-medium"
              >
                <AlertTriangle className="h-4 w-4" />
                <span>Troubleshooting Common Issues</span>
              </button>

              {showTroubleshooting && (
                <div className="mt-4 bg-red-50 rounded-lg p-4 text-sm">
                  <h4 className="font-medium text-red-900 mb-2">Common Connection Issues:</h4>
                  <div className="space-y-3 text-red-800">
                    <div>
                      <strong>1. Runtime Error (includes undefined):</strong>
                      <ul className="list-disc list-inside ml-4 text-xs mt-1">
                        <li>Fixed in this updated version</li>
                        <li>Refresh the page after updating files</li>
                      </ul>
                    </div>
                    <div>
                      <strong>2. "Access denied" Error:</strong>
                      <ul className="list-disc list-inside ml-4 text-xs mt-1">
                        <li>You need Google Workspace <strong>Super Admin</strong> privileges</li>
                        <li>Regular Gmail accounts won't work</li>
                      </ul>
                    </div>
                    <div>
                      <strong>3. "Invalid Client" Error:</strong>
                      <ul className="list-disc list-inside ml-4 text-xs mt-1">
                        <li>Client ID format should end with .apps.googleusercontent.com</li>
                        <li>Verify OAuth client is for "Web application"</li>
                      </ul>
                    </div>
                    <div>
                      <strong>4. "CORS" or "Origin" Errors:</strong>
                      <ul className="list-disc list-inside ml-4 text-xs mt-1">
                        <li>Add http://localhost:3000 to authorized origins</li>
                        <li>Clear browser cache after changes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">✅ Prerequisites Checklist:</h4>
              <ul className="text-green-800 text-sm space-y-1">
                <li>□ Google Workspace account (not Gmail)</li>
                <li>□ Super Admin privileges</li>
                <li>□ Google Cloud project created</li>
                <li>□ Admin SDK API enabled</li>
                <li>□ OAuth client configured</li>
                <li>□ http://localhost:3000 in authorized origins</li>
                <li>□ Popups allowed in browser</li>
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
const DashboardView = ({ stats, activities, onShowForm, googleCredentials }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <button
          onClick={onShowForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>New Employee</span>
        </button>
      </div>

      {/* Google Workspace Status */}
      {googleCredentials.isConfigured && (
        <div className={`p-4 rounded-lg border ${
          googleCredentials.isConnected 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              googleCredentials.isConnected ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="font-medium">
              Google Workspace: {googleCredentials.isConnected ? 'Connected' : 'Ready to Connect'}
            </span>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Onboarding"
          value={stats.activeOnboarding}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Completed Today"
          value={stats.completedToday}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          title="Failed Operations"
          value={stats.failedOperations}
          icon={XCircle}
          color="red"
        />
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

      {/* System Architecture Visual */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">System Architecture</h3>
        </div>
        <div className="p-6">
          <SystemArchitecture googleConnected={googleCredentials.isConnected} />
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

// System Architecture Visual
const SystemArchitecture = ({ googleConnected }) => {
  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="bg-blue-100 px-4 py-2 rounded-lg">📝 Google Form</div>
      <div className="text-blue-500">↓</div>
      <div className="bg-green-100 px-4 py-2 rounded-lg">⚡ Google Apps Script</div>
      <div className="text-blue-500">↓</div>
      <div className="bg-purple-100 px-4 py-2 rounded-lg">🐍 Flask Backend</div>
      <div className="text-blue-500">↓</div>
      <div className="bg-gray-100 px-4 py-2 rounded-lg">🗄️ MongoDB</div>
      <div className="text-blue-500">↓</div>
      <div className="flex flex-wrap justify-center gap-2">
        <div className={`px-3 py-1 rounded text-sm ${
          googleConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          Google Workspace {googleConnected ? '✓' : '✗'}
        </div>
        <div className="bg-blue-100 px-3 py-1 rounded text-sm">Salesforce (Simulated)</div>
        <div className="bg-yellow-100 px-3 py-1 rounded text-sm">Basecamp (Simulated)</div>
        <div className="bg-purple-100 px-3 py-1 rounded text-sm">Active Directory (Simulated)</div>
      </div>
      <div className="text-blue-500">↓</div>
      <div className="bg-green-100 px-4 py-2 rounded-lg">⚛️ React Admin Panel</div>
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
const EmployeesView = ({ employees, onRetry, onShowForm }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
        <button
          onClick={onShowForm}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Employee</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Platforms
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
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
const SettingsView = ({ googleCredentials, onConnectGoogle, onDisconnectGoogle, onShowSetup, addNotification }) => {
  const [settings, setSettings] = useState({
    autoRetry: true,
    emailNotifications: true,
    summaryEmail: 'admin@ysm.org'
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Integrations</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  googleCredentials.isConnected ? 'bg-green-500' : 
                  googleCredentials.isConfigured ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium text-gray-900">Google Workspace</span>
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
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Setup
                  </button>
                ) : !googleCredentials.isConnected ? (
                  <div className="flex space-x-1">
                    <button
                      onClick={onConnectGoogle}
                      className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                    >
                      Connect
                    </button>
                    <button
                      onClick={() => {
                        // Test connection without full sign-in
                        const testConnection = async () => {
                          try {
                            if (window.gapi && window.gapi.auth2) {
                              const authInstance = window.gapi.auth2.getAuthInstance();
                              if (authInstance) {
                                addNotification('✅ Google API is properly configured and ready to connect', 'success');
                              } else {
                                addNotification('⚠️ Google API initialized but auth instance not available', 'warning');
                              }
                            } else {
                              addNotification('❌ Google API not properly loaded. Check your setup.', 'error');
                            }
                          } catch (error) {
                            const errorMsg = getSafeErrorMessage(error);
                            addNotification(`❌ Connection test failed: ${errorMsg}`, 'error');
                          }
                        };
                        testConnection();
                      }}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      Test
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={onDisconnectGoogle}
                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  >
                    Disconnect
                  </button>
                )}
              </div>
            </div>
            <PlatformSetting name="Salesforce" status="simulated" />
            <PlatformSetting name="Basecamp" status="simulated" />
            <PlatformSetting name="Active Directory" status="simulated" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Configuration</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto-retry Failed Operations
              </label>
              <button
                onClick={() => setSettings(prev => ({ ...prev, autoRetry: !prev.autoRetry }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRetry ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRetry ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Email Notifications
              </label>
              <button
                onClick={() => setSettings(prev => ({ ...prev, emailNotifications: !prev.emailNotifications }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily Summary Email
              </label>
              <input
                type="email"
                value={settings.summaryEmail}
                onChange={(e) => setSettings(prev => ({ ...prev, summaryEmail: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Platform Setting Component
const PlatformSetting = ({ name, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return { bg: 'bg-green-500', text: 'text-green-600' };
      case 'simulated': return { bg: 'bg-blue-500', text: 'text-blue-600' };
      case 'disconnected': return { bg: 'bg-red-500', text: 'text-red-600' };
      default: return { bg: 'bg-gray-500', text: 'text-gray-600' };
    }
  };

  const colors = getStatusColor(status);

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${colors.bg}`}></div>
        <span className="font-medium text-gray-900">{name}</span>
      </div>
      <span className={`text-sm ${colors.text}`}>
        {status}
      </span>
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
    setFormData({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New Employee</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Position
            </label>
            <input
              type="text"
              value={formData.position}
              onChange={(e) => handleChange('position', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Enter position"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
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