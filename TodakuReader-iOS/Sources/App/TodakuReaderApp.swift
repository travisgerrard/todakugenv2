import SwiftUI
import Supabase

@main
struct TodakuReaderApp: App {
    @StateObject private var supabaseClient = SupabaseClient.shared
    
    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(supabaseClient)
        }
    }
}

// Supabase client singleton
extension SupabaseClient {
    static let shared = SupabaseClient(
        supabaseURL: URL(string: Config.supabaseURL)!,
        supabaseKey: Config.supabaseKey
    )
} 