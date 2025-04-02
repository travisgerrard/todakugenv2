import Foundation
import Auth
import PostgREST
import Storage
import Functions
import Realtime

class UserDefaultsStorage: AuthLocalStorage {
    func store(key: String, value: Data) throws {
        UserDefaults.standard.set(value, forKey: key)
    }
    
    func retrieve(key: String) throws -> Data? {
        return UserDefaults.standard.data(forKey: key)
    }
    
    func remove(key: String) throws {
        UserDefaults.standard.removeObject(forKey: key)
    }
    
    func set(_ value: String, forKey key: String) -> Bool {
        UserDefaults.standard.set(value, forKey: key)
        return true
    }
    
    func get(key: String) -> String? {
        return UserDefaults.standard.string(forKey: key)
    }
    
    func remove(key: String) -> Bool {
        UserDefaults.standard.removeObject(forKey: key)
        return true
    }
}

class SupabaseClient {
    let auth: GoTrueClient
    let database: PostgrestClient
    let storage: SupabaseStorageClient
    let functions: FunctionsClient
    let realtime: RealtimeClient
    
    init(supabaseURL: URL, supabaseKey: String) {
        // Auth client
        let authURL = supabaseURL.appendingPathComponent("auth/v1")
        let authHeaders: [String: String] = [
            "apikey": supabaseKey,
            "Authorization": "Bearer \(supabaseKey)"
        ]
        self.auth = GoTrueClient(url: authURL, headers: authHeaders, localStorage: UserDefaultsStorage())
        
        // Database client
        let dbURL = supabaseURL.appendingPathComponent("rest/v1")
        self.database = PostgrestClient(url: dbURL, headers: authHeaders)
        
        // Storage client
        let storageConfig = StorageClientConfiguration(
            url: supabaseURL.appendingPathComponent("storage/v1"),
            headers: authHeaders
        )
        self.storage = SupabaseStorageClient(configuration: storageConfig)
        
        // Functions client
        let functionsURL = supabaseURL.appendingPathComponent("functions/v1")
        self.functions = FunctionsClient(url: functionsURL, headers: authHeaders)
        
        // Realtime client
        let realtimeURL = supabaseURL.appendingPathComponent("realtime/v1")
        self.realtime = RealtimeClient(realtimeURL.absoluteString)
    }
} 
