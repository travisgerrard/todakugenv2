//
//  TodakuReader_iOSApp.swift
//  TodakuReader-iOS
//
//  Created by Travis Gerrard on 3/26/25.
//

import SwiftUI
import Auth
import PostgREST
import Storage
import Functions
import Realtime

@main
struct TodakuReader_iOSApp: App {
    let supabase: SupabaseClient
    
    init() {
        // Initialize Supabase client using Config values
        self.supabase = SupabaseClient.shared
    }
    
    var body: some Scene {
        WindowGroup {
            StoryListView(supabase: supabase)
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
