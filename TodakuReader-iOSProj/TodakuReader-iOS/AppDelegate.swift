import UIKit
import SwiftUI

class AppDelegate: NSObject, UIApplicationDelegate {
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil) -> Bool {
        print("📱 App launched")
        
        // Check if the app was launched from a URL
        if let url = launchOptions?[UIApplication.LaunchOptionsKey.url] as? URL {
            print("📱 App launched with URL: \(url)")
            handleIncomingURL(url)
        }
        
        return true
    }
    
    // Method to handle URL on older iOS versions and direct app launches
    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        print("📱 Legacy handler - App opened with URL: \(url)")
        return handleIncomingURL(url)
    }
    
    // Method to handle URL on iOS 13+ with SceneDelegate
    func application(_ application: UIApplication, 
                    continue userActivity: NSUserActivity, 
                    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Handle Universal Links
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL {
            print("📱 Continue user activity with URL: \(url)")
            return handleIncomingURL(url)
        }
        return false
    }
    
    // Centralized URL handling method
    private func handleIncomingURL(_ url: URL) -> Bool {
        print("📱 Processing URL: \(url)")
        
        // Check if this is a Supabase auth callback
        if url.absoluteString.contains("auth/callback") {
            print("📱 Detected auth callback URL")
            // Pass the URL to the AuthViewModel to handle the authentication
            AuthViewModel.shared.handleAuthRedirect(url: url)
            return true
        }
        
        return false
    }
    
    // Scene configuration for iOS 13+
    func application(_ application: UIApplication, configurationForConnecting connectingSceneSession: UISceneSession, options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        if let urlContexts = options.urlContexts.first {
            print("📱 Scene connecting with URL: \(urlContexts.url)")
            handleIncomingURL(urlContexts.url)
        }
        
        let sceneConfig = UISceneConfiguration(name: nil, sessionRole: connectingSceneSession.role)
        sceneConfig.delegateClass = SceneDelegate.self
        return sceneConfig
    }
    
    // Handle incoming activity for scene
    func application(_ application: UIApplication, didDiscardSceneSessions sceneSessions: Set<UISceneSession>) {
        // Called when the user discards a scene session
    }
}

// Scene delegate to handle scene-specific URL events
class SceneDelegate: NSObject, UIWindowSceneDelegate {
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        guard let url = URLContexts.first?.url else { return }
        print("📱 Scene delegate - App opened with URL: \(url)")
        
        // Handle the URL - reuse the same logic
        if url.absoluteString.contains("auth/callback") {
            print("📱 Scene delegate - Detected auth callback URL")
            AuthViewModel.shared.handleAuthRedirect(url: url)
        }
    }
    
    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        // Handle URL contexts when the scene connects
        if let urlContext = connectionOptions.urlContexts.first {
            print("📱 Scene will connect with URL: \(urlContext.url)")
            if urlContext.url.absoluteString.contains("auth/callback") {
                print("📱 Scene will connect - Detected auth callback URL")
                AuthViewModel.shared.handleAuthRedirect(url: urlContext.url)
            }
        }
    }
    
    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        // Handle Universal Links
        if userActivity.activityType == NSUserActivityTypeBrowsingWeb,
           let url = userActivity.webpageURL {
            print("📱 Scene delegate - Continue user activity with URL: \(url)")
            
            if url.absoluteString.contains("auth/callback") {
                print("📱 Scene delegate - Detected auth callback URL from user activity")
                AuthViewModel.shared.handleAuthRedirect(url: url)
            }
        }
    }
} 