// // Google Workspace Integration Class
// class GoogleWorkspaceService {
//   constructor() {
//     this.isInitialized = false;
//     this.accessToken = null;
//     this.gapi = null;
//     this.debugMode = true;
//   }

//   log(message, type = 'info') {
//     if (this.debugMode) {
//       console.log(`[GoogleWorkspace ${type.toUpperCase()}]:`, message);
//     }
//   }

//   async initialize(clientId, apiKey) {
//     return new Promise((resolve, reject) => {
//       this.log('Starting Google API initialization...');
//       this.log(`Client ID: ${clientId.substring(0, 20)}...`);
//       this.log(`API Key: ${apiKey.substring(0, 10)}...`);
      
//       if (window.gapi) {
//         this.log('Google API script already loaded');
//         this.initializeGapi(clientId, apiKey, resolve, reject);
//       } else {
//         this.log('Waiting for Google API script to load...');
//         // Wait for the script to load
//         const checkGapi = () => {
//           if (window.gapi) {
//             this.log('Google API script loaded successfully');
//             this.initializeGapi(clientId, apiKey, resolve, reject);
//           } else {
//             setTimeout(checkGapi, 100);
//           }
//         };
//         checkGapi();
//       }
//     });
//   }

//   initializeGapi(clientId, apiKey, resolve, reject) {
//     this.log('Loading Google API client and auth2...');
//     window.gapi.load('client:auth2', async () => {
//       try {
//         this.log('Initializing Google API client...');
//         await window.gapi.client.init({
//           apiKey: apiKey,
//           clientId: clientId,
//           discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/admin/directory_v1/rest'],
//           scope: 'https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.group'
//         });
        
//         this.gapi = window.gapi;
//         this.isInitialized = true;
//         this.log('Google API initialized successfully');
        
//         // Check if user is already signed in
//         const authInstance = this.gapi.auth2.getAuthInstance();
//         if (authInstance.isSignedIn.get()) {
//           this.log('User is already signed in');
//           this.accessToken = authInstance.currentUser.get().getAuthResponse().access_token;
//         }
        
//         resolve(true);
//       } catch (error) {
//         this.log(`Initialization failed: ${error.message}`, 'error');
//         this.log('Full error details:', 'error');
//         console.error(error);
//         reject(error);
//       }
//     });
//   }

//   async signIn() {
//     if (!this.isInitialized) {
//       throw new Error('Google API not initialized. Please check your credentials and try again.');
//     }
    
//     try {
//       this.log('Attempting to sign in...');
//       const authInstance = this.gapi.auth2.getAuthInstance();
      
//       if (!authInstance) {
//         throw new Error('Auth instance not available. Check your Client ID configuration.');
//       }
      
//       this.log('Auth instance available, requesting sign in...');
//       const user = await authInstance.signIn({
//         prompt: 'consent'
//       });
      
//       if (!user) {
//         throw new Error('Sign in failed - no user returned');
//       }
      
//       const authResponse = user.getAuthResponse();
//       if (!authResponse || !authResponse.access_token) {
//         throw new Error('Sign in failed - no access token received');
//       }
      
//       this.accessToken = authResponse.access_token;
//       this.log('Sign in successful!');
//       this.log(`Access token received: ${this.accessToken.substring(0, 20)}...`);
      
//       // Verify we have the required scopes
//       const scopes = authResponse.scope;
//       this.log(`Granted scopes: ${scopes}`);
      
//       if (!scopes.includes('https://www.googleapis.com/auth/admin.directory.user')) {
//         throw new Error('Required Admin Directory scope not granted. Please ensure you have Google Workspace admin privileges.');
//       }
      
//       return user;
//     } catch (error) {
//       this.log(`Sign in failed: ${error.message}`, 'error');
      
//       // Provide more specific error messages
//       if (error.error === 'popup_closed_by_user') {
//         throw new Error('Sign in cancelled by user. Please try again.');
//       } else if (error.error === 'access_denied') {
//         throw new Error('Access denied. Please ensure you have Google Workspace admin privileges.');
//       } else if (error.error === 'invalid_client') {
//         throw new Error('Invalid Client ID. Please check your Google Cloud Console configuration.');
//       } else {
//         throw error;
//       }
//     }
//   }

//   async createUser(userData) {
//     if (!this.accessToken) throw new Error('Not authenticated');

//     const user = {
//       primaryEmail: userData.email,
//       name: {
//         givenName: userData.name.split(' ')[0],
//         familyName: userData.name.split(' ').slice(1).join(' ')
//       },
//       password: this.generatePassword(),
//       changePasswordAtNextLogin: true,
//       orgUnitPath: userData.department ? `/${userData.department}` : '/',
//       suspended: false
//     };

//     try {
//       const response = await this.gapi.client.directory.users.insert({
//         resource: user
//       });
//       return { success: true, data: response.result };
//     } catch (error) {
//       return { success: false, error: error.result?.error?.message || error.message };
//     }
//   }

//   async getUser(email) {
//     if (!this.accessToken) throw new Error('Not authenticated');

//     try {
//       const response = await this.gapi.client.directory.users.get({
//         userKey: email
//       });
//       return { success: true, data: response.result };
//     } catch (error) {
//       return { success: false, error: error.result?.error?.message || error.message };
//     }
//   }

//   async listUsers() {
//     if (!this.accessToken) throw new Error('Not authenticated');

//     try {
//       const response = await this.gapi.client.directory.users.list({
//         domain: this.getDomain(),
//         maxResults: 100
//       });
//       return { success: true, data: response.result.users || [] };
//     } catch (error) {
//       return { success: false, error: error.result?.error?.message || error.message };
//     }
//   }

//   generatePassword() {
//     const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
//     let password = '';
//     for (let i = 0; i < 12; i++) {
//       password += chars.charAt(Math.floor(Math.random() * chars.length));
//     }
//     return password;
//   }

//   getDomain() {
//     if (this.gapi && this.gapi.auth2) {
//       const user = this.gapi.auth2.getAuthInstance().currentUser.get();
//       const email = user.getBasicProfile().getEmail();
//       return email.split('@')[1];
//     }
//     return null;
//   }

//   isSignedIn() {
//     return this.gapi && this.gapi.auth2 && this.gapi.auth2.getAuthInstance().isSignedIn.get();
//   }

//   signOut() {
//     if (this.gapi && this.gapi.auth2) {
//       this.gapi.auth2.getAuthInstance().signOut();
//       this.accessToken = null;
//     }
//   }
// }

// export default GoogleWorkspaceService;


// File: src/components/GoogleWorkspaceService.js

// Google Workspace Integration Class// File: src/components/GoogleWorkspaceService.js

// Google Workspace Integration Class
class GoogleWorkspaceService {
  constructor() {
    this.isInitialized = false;
    this.accessToken = null;
    this.gapi = null;
    this.debugMode = true;
  }

  log(message, type = 'info') {
    if (this.debugMode) {
      console.log(`[GoogleWorkspace ${type.toUpperCase()}]:`, message);
    }
  }

  // Safe error message extraction
  getSafeErrorMessage(error) {
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
  }

  async initialize(clientId, apiKey) {
    return new Promise((resolve, reject) => {
      this.log('Starting Google API initialization...');
      this.log(`Client ID: ${clientId ? clientId.substring(0, 20) + '...' : 'undefined'}`);
      this.log(`API Key: ${apiKey ? apiKey.substring(0, 10) + '...' : 'undefined'}`);
      
      // Validate inputs
      if (!clientId || !apiKey) {
        const error = new Error('Client ID and API Key are required');
        this.log('Missing credentials', 'error');
        reject(error);
        return;
      }
      
      if (window.gapi) {
        this.log('Google API script already loaded');
        this.initializeGapi(clientId, apiKey, resolve, reject);
      } else {
        this.log('Waiting for Google API script to load...');
        // Wait for the script to load
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds timeout
        
        const checkGapi = () => {
          attempts++;
          if (window.gapi) {
            this.log('Google API script loaded successfully');
            this.initializeGapi(clientId, apiKey, resolve, reject);
          } else if (attempts >= maxAttempts) {
            this.log('Timeout waiting for Google API script', 'error');
            reject(new Error('Google API script failed to load. Please check your internet connection.'));
          } else {
            setTimeout(checkGapi, 100);
          }
        };
        checkGapi();
      }
    });
  }

  initializeGapi(clientId, apiKey, resolve, reject) {
    this.log('Loading Google API client and auth2...');
    
    try {
      window.gapi.load('client:auth2', async () => {
        try {
          this.log('Initializing Google API client...');
          await window.gapi.client.init({
            apiKey: apiKey,
            clientId: clientId,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/admin/directory_v1/rest'],
            scope: 'https://www.googleapis.com/auth/admin.directory.user https://www.googleapis.com/auth/admin.directory.group'
          });
          
          this.gapi = window.gapi;
          this.isInitialized = true;
          this.log('Google API initialized successfully');
          
          // Check if user is already signed in
          const authInstance = this.gapi.auth2.getAuthInstance();
          if (authInstance && authInstance.isSignedIn.get()) {
            this.log('User is already signed in');
            const currentUser = authInstance.currentUser.get();
            if (currentUser) {
              const authResponse = currentUser.getAuthResponse();
              if (authResponse && authResponse.access_token) {
                this.accessToken = authResponse.access_token;
              }
            }
          }
          
          resolve(true);
        } catch (error) {
          const errorMsg = this.getSafeErrorMessage(error);
          this.log(`Initialization failed: ${errorMsg}`, 'error');
          this.log('Full error details:', 'error');
          console.error(error);
          reject(error);
        }
      });
    } catch (error) {
      const errorMsg = this.getSafeErrorMessage(error);
      this.log(`Failed to load Google API: ${errorMsg}`, 'error');
      reject(error);
    }
  }

  async signIn() {
    if (!this.isInitialized) {
      throw new Error('Google API not initialized. Please check your credentials and try again.');
    }
    
    try {
      this.log('Attempting to sign in...');
      const authInstance = this.gapi.auth2.getAuthInstance();
      
      if (!authInstance) {
        throw new Error('Auth instance not available. Check your Client ID configuration.');
      }
      
      this.log('Auth instance available, requesting sign in...');
      const user = await authInstance.signIn({
        prompt: 'consent'
      });
      
      if (!user) {
        throw new Error('Sign in failed - no user returned');
      }
      
      const authResponse = user.getAuthResponse();
      if (!authResponse || !authResponse.access_token) {
        throw new Error('Sign in failed - no access token received');
      }
      
      this.accessToken = authResponse.access_token;
      this.log('Sign in successful!');
      this.log(`Access token received: ${this.accessToken.substring(0, 20)}...`);
      
      // Verify we have the required scopes
      const scopes = authResponse.scope || '';
      this.log(`Granted scopes: ${scopes}`);
      
      if (!scopes.includes('https://www.googleapis.com/auth/admin.directory.user')) {
        throw new Error('Required Admin Directory scope not granted. Please ensure you have Google Workspace admin privileges.');
      }
      
      return user;
    } catch (error) {
      const errorMsg = this.getSafeErrorMessage(error);
      this.log(`Sign in failed: ${errorMsg}`, 'error');
      
      // Provide more specific error messages
      if (error?.error === 'popup_closed_by_user') {
        throw new Error('Sign in cancelled by user. Please try again.');
      } else if (error?.error === 'access_denied') {
        throw new Error('Access denied. Please ensure you have Google Workspace admin privileges.');
      } else if (error?.error === 'invalid_client') {
        throw new Error('Invalid Client ID. Please check your Google Cloud Console configuration.');
      } else {
        throw error;
      }
    }
  }

  async createUser(userData) {
    if (!this.accessToken) throw new Error('Not authenticated');

    const user = {
      primaryEmail: userData.email,
      name: {
        givenName: userData.name.split(' ')[0] || 'User',
        familyName: userData.name.split(' ').slice(1).join(' ') || 'Name'
      },
      password: this.generatePassword(),
      changePasswordAtNextLogin: true,
      orgUnitPath: userData.department ? `/${userData.department}` : '/',
      suspended: false
    };

    try {
      this.log(`Creating user: ${userData.email}`);
      const response = await this.gapi.client.directory.users.insert({
        resource: user
      });
      this.log('User created successfully');
      return { success: true, data: response.result };
    } catch (error) {
      const errorMsg = this.getSafeErrorMessage(error);
      this.log(`User creation failed: ${errorMsg}`, 'error');
      return { 
        success: false, 
        error: error?.result?.error?.message || errorMsg
      };
    }
  }

  async getUser(email) {
    if (!this.accessToken) throw new Error('Not authenticated');

    try {
      const response = await this.gapi.client.directory.users.get({
        userKey: email
      });
      return { success: true, data: response.result };
    } catch (error) {
      const errorMsg = this.getSafeErrorMessage(error);
      return { 
        success: false, 
        error: error?.result?.error?.message || errorMsg
      };
    }
  }

  async listUsers() {
    if (!this.accessToken) throw new Error('Not authenticated');

    try {
      const domain = this.getDomain();
      if (!domain) {
        throw new Error('Unable to determine domain from authenticated user');
      }

      const response = await this.gapi.client.directory.users.list({
        domain: domain,
        maxResults: 100
      });
      return { success: true, data: response.result.users || [] };
    } catch (error) {
      const errorMsg = this.getSafeErrorMessage(error);
      return { 
        success: false, 
        error: error?.result?.error?.message || errorMsg
      };
    }
  }

  generatePassword() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  getDomain() {
    try {
      if (this.gapi && this.gapi.auth2) {
        const authInstance = this.gapi.auth2.getAuthInstance();
        if (authInstance) {
          const user = authInstance.currentUser.get();
          if (user) {
            const profile = user.getBasicProfile();
            if (profile) {
              const email = profile.getEmail();
              if (email && email.includes('@')) {
                return email.split('@')[1];
              }
            }
          }
        }
      }
    } catch (error) {
      this.log(`Error getting domain: ${this.getSafeErrorMessage(error)}`, 'error');
    }
    return null;
  }

  isSignedIn() {
    try {
      return this.gapi && 
             this.gapi.auth2 && 
             this.gapi.auth2.getAuthInstance() && 
             this.gapi.auth2.getAuthInstance().isSignedIn.get();
    } catch (error) {
      this.log(`Error checking sign-in status: ${this.getSafeErrorMessage(error)}`, 'error');
      return false;
    }
  }

  signOut() {
    try {
      if (this.gapi && this.gapi.auth2) {
        const authInstance = this.gapi.auth2.getAuthInstance();
        if (authInstance) {
          authInstance.signOut();
        }
      }
      this.accessToken = null;
      this.log('Signed out successfully');
    } catch (error) {
      this.log(`Error during sign out: ${this.getSafeErrorMessage(error)}`, 'error');
      this.accessToken = null; // Clear token anyway
    }
  }
}

export default GoogleWorkspaceService;