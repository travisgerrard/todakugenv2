import SwiftUI
import Supabase

@main
struct TodakuReaderApp: App {
    init() {
        Config.validate()
    }
    
    var body: some Scene {
        WindowGroup {
            ContentView()
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