import Foundation
import SwiftUI
import Auth

@MainActor
class AuthViewModel: ObservableObject {
    // Make the instance shared so AppDelegate can access it
    static let shared = AuthViewModel()
    
    private let supabase: SupabaseClient
    
    @Published var isAuthenticated = false
    @Published var isLoading = false
    @Published var error: Error?
    @Published var user: User?
    
    // Track if we're currently handling a URL to prevent duplicate processing
    private var isHandlingRedirect = false
    
    // Add timestamp tracking for URL processing
    private var processedURLsTimestamps: [String: Date] = [:]
    
    init(supabase: SupabaseClient = SupabaseClient.shared) {
        self.supabase = supabase
        
        // Reset URL processing state on app startup
        processedURLsTimestamps.removeAll()
        isHandlingRedirect = false
        
        print("📱 AuthViewModel initialized, clearing URL tracking")
        
        // Check if user is already authenticated
        Task {
            await checkAuth()
        }
    }
    
    func checkAuth() async {
        do {
            print("🔍 Checking auth state...")
            
            // Attempt to get the current session
            if let session = try? await supabase.auth.session {
                print("✅ Got session from Supabase, user: \(session.user.email ?? "unknown")")
                
                // Update all state properties atomically on main thread
                await MainActor.run {
                    user = session.user
                    isAuthenticated = true
                    isLoading = false
                }
                print("✅ User authenticated: \(user?.email ?? "No email")")
                
                // Force UI update
                self.objectWillChange.send()
                notifyUI()
            } else {
                print("❌ No session from Supabase")
                
                // Try to refresh the session if possible
                do {
                    print("🔄 Attempting to refresh session...")
                    let _ = try? await supabase.auth.refreshSession()
                    
                    // Check if refresh succeeded
                    if let refreshedSession = try? await supabase.auth.session {
                        print("✅ Session refreshed successfully")
                        
                        await MainActor.run {
                            user = refreshedSession.user
                            isAuthenticated = true
                            isLoading = false
                        }
                        
                        // Force UI update
                        self.objectWillChange.send()
                        notifyUI()
                        return
                    }
                } catch {
                    print("❌ Failed to refresh session: \(error)")
                }
                
                // No session and refresh failed, update state to not authenticated
                await MainActor.run {
                    user = nil
                    isAuthenticated = false
                    isLoading = false
                }
                print("❌ No existing session found")
                
                // Force UI update
                self.objectWillChange.send()
                notifyUI()
            }
        } catch {
            print("❌ Error checking auth: \(error)")
            
            // Error checking auth, assume not authenticated
            await MainActor.run {
                user = nil
                isAuthenticated = false
                isLoading = false
                self.error = error
            }
            
            // Force UI update
            self.objectWillChange.send()
            notifyUI()
        }
    }
    
    // New method using browser-based OAuth
    func signInWithGoogle() async {
        await MainActor.run {
            // Clear any stale state before starting new auth flow
            if isAuthenticated || user != nil {
                print("⚠️ Detected stale auth state before login, resetting...")
                isAuthenticated = false
                user = nil
            }
            
            // Clear any previous errors
            error = nil
            
            // Set loading state
            isLoading = true
            
            // Force UI update
            objectWillChange.send()
        }
        
        do {
            // Use the constant from GoogleSignInConfig and convert to URL
            let redirectURLString = GoogleSignInConfig.callbackURL
            let redirectURL = URL(string: redirectURLString)
            
            print("🔄 Starting Google OAuth with redirect: \(redirectURLString)")
            
            // Get the OAuth URL from Supabase
            let authURL = try await supabase.auth.getOAuthSignInURL(
                provider: .google,
                redirectTo: redirectURL
            )
            
            // Open in browser - authURL is already a URL
            await UIApplication.shared.open(authURL)
            print("📱 Opening OAuth URL: \(authURL)")
            
        } catch {
            print("Failed to start Google OAuth: \(error)")
            
            await MainActor.run {
                self.error = error
                isLoading = false
                objectWillChange.send()
            }
        }
    }
    
    // This will be called by AppDelegate when auth redirect is received
    func handleAuthRedirect(url: URL) {
        // Avoid processing the same URL multiple times
        let urlString = url.absoluteString
        
        // Use main thread for all UI updates
        Task { @MainActor in
            // NEVER skip processing auth callback URLs - this was causing login failures
            // Instead, check if we've processed this specific URL before
            
            // Always clear old processed URLs (older than 5 minutes)
            let now = Date()
            processedURLsTimestamps = processedURLsTimestamps.filter { _, timestamp in
                now.timeIntervalSince(timestamp) < 300 // 5 minutes
            }
            
            // Check if we already processed this URL or are currently handling a redirect
            if processedURLsTimestamps[urlString] != nil {
                print("📣 URL already processed, skipping: \(url)")
                // Make sure loading is false to avoid stuck spinner
                if isLoading {
                    isLoading = false
                    objectWillChange.send()
                }
                return
            }
            
            if isHandlingRedirect {
                print("📣 Already handling a redirect, will queue this one: \(url)")
                // Queue this URL to process after current one finishes
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.0) {
                    self.handleAuthRedirect(url: url)
                }
                return
            }
            
            isHandlingRedirect = true
            processedURLsTimestamps[urlString] = now
            
            print("📣 handleAuthRedirect called with URL: \(url)")
            print("📣 Current thread: \(Thread.current.isMainThread ? "Main thread" : "Background thread")")
            print("📣 Current isAuthenticated state: \(isAuthenticated)")
            print("📣 Current isLoading state: \(isLoading)")
            print("📣 URL components: \(URLComponents(url: url, resolvingAgainstBaseURL: true)?.queryItems?.map { "\($0.name)=\($0.value ?? "")" } ?? [])")
            
            // First things first - set loading to true
            isLoading = true
            objectWillChange.send()
            
            do {
                print("📱 Handling auth redirect: \(url)")
                
                // Extract the session from the URL
                print("📱 Attempting to extract session from URL...")
                let result = try await supabase.auth.session(from: url)
                print("📱 Session extracted successfully")
                
                // Update auth state properties in the correct order
                print("📱 Setting auth state with user: \(result.user.email ?? "No email")")
                
                // Transactional update - all properties updated at once
                self.user = result.user
                self.isAuthenticated = true
                self.isLoading = false
                self.error = nil
                
                print("✅ Successfully authenticated user with email: \(result.user.email ?? "Unknown")")
                print("📣 Updated states - isAuthenticated: \(isAuthenticated), hasUser: \(user != nil), isLoading: \(isLoading)")
                
                // Force UI update immediately and repeatedly to make sure state propagates
                self.objectWillChange.send()
                
                // Force state synchronization
                forceStateSynchronization()
                
                // Delayed notification to ensure view had time to process state changes
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.notifyUI()
                    self.forceStateSynchronization()
                    
                    // Double check after a short delay to ensure state persisted
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        if !self.isAuthenticated || self.user == nil {
                            print("⚠️ Auth state reverted - forcing restoration")
                            self.user = result.user
                            self.isAuthenticated = true
                            self.objectWillChange.send()
                            self.notifyUI()
                            self.forceStateSynchronization()
                        }
                    }
                }
                
            } catch {
                print("❌ Error handling auth redirect: \(error)")
                
                self.error = error
                self.isLoading = false
                
                // Force UI update
                objectWillChange.send()
                
                // Check if we're actually authenticated despite the error
                Task {
                    await checkAuth()
                }
            }
            
            // Reset handling state
            isHandlingRedirect = false
        }
    }
    
    // Force state synchronization across the app
    private func forceStateSynchronization() {
        print("📣 Forcing state synchronization throughout the app")
        // Send multiple objectWillChange notifications to ensure state propagates
        objectWillChange.send()
        
        // Post notification with rich data to sync views
        NotificationCenter.default.post(
            name: Notification.Name("AuthStateChanged"),
            object: self,
            userInfo: [
                "isAuthenticated": isAuthenticated,
                "hasUser": user != nil,
                "forceSync": true
            ]
        )
        
        // Post another notification specifically for state sync
        NotificationCenter.default.post(
            name: Notification.Name("ForceAuthSync"),
            object: self,
            userInfo: [
                "isAuthenticated": isAuthenticated,
                "hasUser": user != nil
            ]
        )
        
        // Schedule multiple delayed updates to ensure state propagation
        for delay in [0.1, 0.3, 0.6, 1.0] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) { [weak self] in
                guard let self = self else { return }
                self.objectWillChange.send()
                
                // Only post notification if still authenticated
                if self.isAuthenticated && self.user != nil {
                    NotificationCenter.default.post(
                        name: Notification.Name("AuthStateChanged"),
                        object: self,
                        userInfo: [
                            "isAuthenticated": self.isAuthenticated,
                            "hasUser": self.user != nil,
                            "forceSync": true
                        ]
                    )
                }
            }
        }
    }
    
    // Function to explicitly notify UI of state changes
    private func notifyUI() {
        print("📣 Explicitly notifying UI of state changes - isAuthenticated: \(isAuthenticated), hasUser: \(user != nil)")
        objectWillChange.send()
        
        // Post notification with rich data
        NotificationCenter.default.post(
            name: Notification.Name("AuthStateChanged"),
            object: self,
            userInfo: [
                "isAuthenticated": isAuthenticated,
                "hasUser": user != nil
            ]
        )
        
        // Schedule delayed notification for extra reliability
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) { [weak self] in
            guard let self = self else { return }
            self.objectWillChange.send()
            print("📣 Sent delayed objectWillChange notification - isAuthenticated: \(self.isAuthenticated), hasUser: \(self.user != nil)")
        }
    }
    
    func signOut() async {
        await MainActor.run {
            isLoading = true
            error = nil
        }
        
        do {
            // Sign out from Supabase
            try await supabase.auth.signOut()
            
            // Update state on main thread
            await MainActor.run {
                // Important: update user FIRST, then isAuthenticated
                user = nil
                isAuthenticated = false
                isLoading = false
                
                // Force UI update
                objectWillChange.send()
                notifyUI()
                
                print("✅ Successfully logged out")
            }
        } catch {
            print("❌ Sign out error:", error)
            
            await MainActor.run {
                self.error = error
                isLoading = false
                
                // Force UI update
                objectWillChange.send()
            }
        }
    }
    
    // Helper function to get the top-most view controller
    private func getTopViewController() async -> UIViewController? {
        guard let windowScene = await UIApplication.shared.connectedScenes.first as? UIWindowScene,
              let rootViewController = windowScene.windows.first?.rootViewController else {
            return nil
        }
        
        var topController = rootViewController
        
        while let presentedController = topController.presentedViewController {
            topController = presentedController
        }
        
        return topController
    }
} 