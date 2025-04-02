# Changes made to fix user preferences loading issues

## 1. Fixed UserPreferences Interface
- Updated the type definition for tadoku_level in UserPreferences interface to match the database schema
- Changed from string | null to number | null

## 2. Enhanced useUserPreferences Hook
- Added extensive logging to track the user preferences loading flow
- Properly initialized state to handle both client and server environments
- Fixed dependency array in useEffect to prevent infinite refresh loop
- Added cache clearing mechanism when updating preferences

## 3. Added Reset Profile Functionality
- Implemented a Reset Profile button on the Settings page
- Added confirmation dialog for the reset action
- Complete profile recreation with default values while preserving user name and avatar

## 4. Added Debug Tools
- Created /debug page with user-friendly troubleshooting information
- Implemented /api/debug/profile endpoint to expose session and profile data
- Added help section on homepage directing users to debug tools when needed

## 5. Improved Error Handling
- Enhanced validation of profile data with null checks
- More informative error messages throughout the preferences loading process
- Clearer visual feedback during loading states
