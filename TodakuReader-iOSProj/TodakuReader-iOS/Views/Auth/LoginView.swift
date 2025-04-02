import SwiftUI

struct LoginView: View {
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var refreshToggle = false // For forcing refresh
    @State private var forceLoading = false // Local loading state
    
    // Use a timer to auto-cancel loading if stuck for too long
    @State private var loadingStartTime: Date? = nil
    let timer = Timer.publish(every: 0.5, on: .main, in: .common).autoconnect()
    
    // Additional state for handling retries
    @State private var attemptCount = 0
    
    var body: some View {
        NavigationView {
            VStack(spacing: 20) {
                // App logo or icon
                Image(systemName: "books.vertical.fill")
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 100, height: 100)
                    .foregroundColor(.blue)
                    .padding()
                
                Text("Todaku Reader")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                
                VStack(spacing: 15) {
                    if showLoading {
                        ProgressView()
                            .scaleEffect(1.5)
                            .padding()
                        Text("Signing in...")
                            .font(.headline)
                            .foregroundColor(.secondary)
                            .padding(.bottom)
                        
                        // Cancel button in case loading gets stuck
                        Button("Cancel") {
                            print("📱 Login - Cancel button tapped")
                            cancelLogin()
                        }
                        .font(.caption)
                        .padding(.top)
                        
                        if refreshToggle {
                            // Hidden element that toggles with refreshToggle to force redraw
                            Color.clear.frame(width: 1, height: 1)
                        }
                    } else {
                        Button(action: {
                            startLogin()
                        }) {
                            HStack {
                                Image(systemName: "g.circle.fill")
                                    .foregroundColor(.red)
                                Text("Sign in with Google")
                                    .fontWeight(.semibold)
                            }
                            .frame(maxWidth: .infinity)
                            .padding()
                            .background(Color.white)
                            .cornerRadius(8)
                            .overlay(
                                RoundedRectangle(cornerRadius: 8)
                                    .stroke(Color.gray.opacity(0.5), lineWidth: 1)
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .padding(.horizontal, 30)
                
                if let error = authViewModel.error {
                    Text(error.localizedDescription)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding()
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    // Add retry button
                    Button("Try Again") {
                        clearError()
                    }
                    .font(.caption)
                    .foregroundColor(.blue)
                    .padding(.top, -5)
                }
                
                // Debug info in development mode
                #if DEBUG
                VStack(alignment: .leading, spacing: 5) {
                    Text("Debug Info:")
                        .font(.caption)
                        .fontWeight(.bold)
                    Text("isAuthenticated: \(authViewModel.isAuthenticated ? "Yes" : "No")")
                        .font(.caption)
                    Text("isLoading: \(authViewModel.isLoading ? "Yes" : "No")")
                        .font(.caption)
                    Text("forceLoading: \(forceLoading ? "Yes" : "No")")
                        .font(.caption)
                    Text("showLoading: \(showLoading ? "Yes" : "No")")
                        .font(.caption)
                    Text("attemptCount: \(attemptCount)")
                        .font(.caption)
                    Text("Has user: \(authViewModel.user != nil ? "Yes" : "No")")
                        .font(.caption)
                    if let email = authViewModel.user?.email {
                        Text("Email: \(email)")
                            .font(.caption)
                    }
                    if let loadTime = loadingStartTime {
                        Text("Loading for: \(Int(Date().timeIntervalSince(loadTime)))s")
                            .font(.caption)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding()
                .background(Color.gray.opacity(0.1))
                .cornerRadius(8)
                .padding(.horizontal)
                #endif
                
                Spacer()
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .onAppear {
                print("📊 LoginView appeared - Loading: \(authViewModel.isLoading), Auth: \(authViewModel.isAuthenticated), User: \(authViewModel.user != nil)")
                print("📱 LoginView appeared - User is not authenticated")
                print("📊 Login View - authViewModel.isAuthenticated: \(authViewModel.isAuthenticated), hasUser: \(authViewModel.user != nil)")
                
                // Reset loading state on appear, in case we got stuck
                if forceLoading || authViewModel.isLoading {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        if !authViewModel.isAuthenticated && (forceLoading || authViewModel.isLoading) {
                            print("📱 LoginView - Resetting stuck loading state on appear")
                            cancelLogin()
                        }
                    }
                }
            }
            // Add multiple triggers to refresh the view
            .onChange(of: authViewModel.isAuthenticated) { newValue in
                print("📱 LoginView detected auth change: \(newValue)")
                refreshToggle.toggle()
                
                if newValue {
                    // If authenticated, clear loading state
                    cancelLogin()
                }
            }
            .onChange(of: authViewModel.isLoading) { newValue in
                print("📱 LoginView detected loading change: \(newValue)")
                refreshToggle.toggle()
                
                if !newValue {
                    // When loading stops, update our force loading
                    if forceLoading {
                        forceLoading = false
                        loadingStartTime = nil
                    }
                }
            }
            .onReceive(timer) { _ in
                // Auto-clear force loading after 15 seconds to prevent indefinite spinner
                if let startTime = loadingStartTime, 
                   Date().timeIntervalSince(startTime) > 15 {
                    print("📱 Auto-cancelling login after 15 seconds timeout")
                    cancelLogin()
                    
                    // If this is our first timeout, try one more time automatically
                    if attemptCount == 1 {
                        print("📱 First login attempt timed out, retrying automatically")
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                            startLogin()
                        }
                    }
                }
            }
            .id("loginView-\(authViewModel.isAuthenticated)-\(authViewModel.isLoading)-\(forceLoading)-\(refreshToggle)-\(attemptCount)")
        }
    }
    
    // Computed property to determine if we should show loading
    private var showLoading: Bool {
        return authViewModel.isLoading || forceLoading
    }
    
    // Helper method to start the login process
    private func startLogin() {
        print("📱 Login - Sign in button tapped (attempt \(attemptCount + 1))")
        attemptCount += 1
        forceLoading = true
        loadingStartTime = Date()
        Task {
            await authViewModel.signInWithGoogle()
        }
    }
    
    // Helper method to cancel the login process
    private func cancelLogin() {
        forceLoading = false
        authViewModel.isLoading = false
        loadingStartTime = nil
        refreshToggle.toggle()
    }
    
    // Helper method to clear errors
    private func clearError() {
        authViewModel.error = nil
        refreshToggle.toggle()
    }
} 

