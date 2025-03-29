//
//  TodakuReader_iOSApp.swift
//  TodakuReader-iOS
//
//  Created by Travis Gerrard on 3/26/25.
//

import SwiftUI
import UIKit
import Auth
import PostgREST
import Storage
import Functions
import Realtime
import GoogleSignIn

@main
struct TodakuReader_iOSApp: App {
    // Add the AppDelegate
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    
    let supabase: SupabaseClient
    @StateObject var authViewModel = AuthViewModel()
    
    init() {
        // Initialize Supabase client using Config values
        self.supabase = SupabaseClient.shared
    }
    
    var body: some Scene {
        WindowGroup {
            MainContentView()
                .environmentObject(authViewModel)
                .onOpenURL { url in
                    // Handle URLs at the SwiftUI level
                    print("📱 SwiftUI onOpenURL received URL: \(url)")
                    if url.absoluteString.contains("auth/callback") {
                        print("📱 SwiftUI detected auth callback URL")
                        AuthViewModel.shared.handleAuthRedirect(url: url)
                    }
                }
                .onAppear {
                    // Check authentication state when app appears
                    Task {
                        print("📱 App appeared, checking authentication state")
                        await AuthViewModel.shared.checkAuth()
                    }
                }
                .onReceive(NotificationCenter.default.publisher(for: UIApplication.didBecomeActiveNotification)) { _ in
                    // Check authentication state when app becomes active
                    Task {
                        print("📱 App became active, checking authentication state")
                        await AuthViewModel.shared.checkAuth()
                    }
                }
                .onReceive(NotificationCenter.default.publisher(for: Notification.Name("AuthStateChanged"))) { notification in
                    // React to auth state changes from multiple sources
                    print("📱 App received AuthStateChanged notification")
                    
                    // Check if notification has auth state information
                    if let userInfo = notification.userInfo,
                       let isAuthenticated = userInfo["isAuthenticated"] as? Bool,
                       let hasUser = userInfo["hasUser"] as? Bool {
                        print("📱 Auth notification data - isAuthenticated: \(isAuthenticated), hasUser: \(hasUser)")
                    }
                    
                    Task {
                        // Force UI update
                        await MainActor.run {
                            self.authViewModel.objectWillChange.send()
                        }
                    }
                }
        }
    }
}

// MainContentView to handle the authentication state
struct MainContentView: View {
    // Get the AuthViewModel from the environment
    @EnvironmentObject var authViewModel: AuthViewModel
    
    // Explicit state tracking of authentication state for the view
    @State private var viewIsAuthenticated: Bool = false
    @State private var hasCheckedInitialAuthState: Bool = false
    @State private var shouldShowLogin: Bool = true
    
    var body: some View {
        ZStack {
            // Content view - show based on view authentication state
            Group {
                if viewIsAuthenticated {
                    StoryListView()
                        .transition(.opacity)
                        .zIndex(shouldShowLogin ? 0 : 1) // Control stacking order
                } else {
                    LoginView()
                        .transition(.opacity)
                        .zIndex(shouldShowLogin ? 1 : 0) // Control stacking order
                }
            }
            .animation(.easeInOut(duration: 0.3), value: viewIsAuthenticated)
        }
        .onAppear {
            print("📱 MainContentView appeared")
            // Initialize our view state from the model
            updateViewState()
            
            // Always force a fresh auth check when the view appears
            Task {
                await authViewModel.checkAuth()
                // After checking auth, update our view state
                updateViewState()
            }
        }
        // Listen for changes to authViewModel
        .onChange(of: authViewModel.isAuthenticated) { newValue in
            print("🔄 AuthViewModel.isAuthenticated changed to: \(newValue)")
            updateViewState()
        }
        // Listen for the auth state changed notification
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("AuthStateChanged"))) { notification in
            print("📢 Received AuthStateChanged notification")
            if let userInfo = notification.userInfo,
               let isAuthenticated = userInfo["isAuthenticated"] as? Bool {
                print("📢 Notification data: isAuthenticated=\(isAuthenticated)")
                
                // If this is a force sync, update immediately
                if let forceSync = userInfo["forceSync"] as? Bool, forceSync {
                    print("📢 Forcing view state update from notification")
                    viewIsAuthenticated = isAuthenticated
                    shouldShowLogin = !isAuthenticated
                } else {
                    // Otherwise, just update our state normally
                    updateViewState()
                }
            }
        }
        // Listen specifically for the force sync notification
        .onReceive(NotificationCenter.default.publisher(for: Notification.Name("ForceAuthSync"))) { notification in
            print("📢 Received ForceAuthSync notification")
            if let userInfo = notification.userInfo,
               let isAuthenticated = userInfo["isAuthenticated"] as? Bool {
                print("📢 Force syncing view state: isAuthenticated=\(isAuthenticated)")
                viewIsAuthenticated = isAuthenticated
                shouldShowLogin = !isAuthenticated
            }
        }
    }
    
    // Centralized function to update the view state based on AuthViewModel
    private func updateViewState() {
        // Get current authentication state from the view model
        let isAuth = authViewModel.isAuthenticated
        let hasUser = authViewModel.user != nil
        
        // Log current state for debugging
        print("📊 Current state - authViewModel.isAuthenticated: \(isAuth), hasUser: \(hasUser)")
        print("📊 Current view state - viewIsAuthenticated: \(viewIsAuthenticated)")
        
        // Update our view state
        let newAuthState = isAuth || hasUser
        
        // Only update if there's a change to avoid unnecessary animations
        if viewIsAuthenticated != newAuthState {
            print("📊 Updating view authentication state to: \(newAuthState)")
            viewIsAuthenticated = newAuthState
            shouldShowLogin = !newAuthState
        }
        
        hasCheckedInitialAuthState = true
    }
}

// Supabase client singleton
extension SupabaseClient {
    static let shared = SupabaseClient(
        supabaseURL: URL(string: Config.supabaseURL)!,
        supabaseKey: Config.supabaseKey
    )
}
