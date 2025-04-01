import SwiftUI
import Combine
import Foundation

@MainActor
class StoryGeneratorViewModel: ObservableObject {
    // MARK: - Properties
    private let supabase: SupabaseClient
    
    // Published properties for UI updates
    @Published var isGenerating = false
    @Published var generationProgress: Double = 0
    @Published var statusMessage = ""
    @Published var error: Error?
    @Published var generatedStoryId: String?
    
    // Story generation parameters
    @Published var selectedWanikaniLevel: Int = 13
    @Published var selectedGenkiChapter: Int = 6
    @Published var selectedTadokuLevel: String = "2"
    @Published var selectedTopic: String = "Nature"
    
    // Available topics for stories
    let availableTopics = [
        "Nature", "Travel", "Food", "School", "Family", 
        "Work", "Hobbies", "Technology", "Culture", "History"
    ]
    
    // MARK: - Initialization
    init(supabase: SupabaseClient = SupabaseClient.shared) {
        self.supabase = supabase
    }
    
    // MARK: - Public Methods
    func generateStory(userId: String) async {
        guard !isGenerating else { return }
        
        // Reset state
        isGenerating = true
        generationProgress = 0
        statusMessage = "Starting generation..."
        error = nil
        generatedStoryId = nil
        
        do {
            let storyId = try await generateAndSaveStory(userId: userId)
            self.generationProgress = 1.0
            self.statusMessage = "Story generated successfully!"
            self.generatedStoryId = storyId
            self.isGenerating = false
        } catch {
            print("Error generating story: \(error)")
            self.error = error
            self.statusMessage = "Error: \(error.localizedDescription)"
            self.isGenerating = false
        }
    }
    
    func loadUserPreferences(from preferences: UserPreferences) {
        self.selectedWanikaniLevel = preferences.wanikaniLevel
        self.selectedGenkiChapter = preferences.genkiChapter
        self.selectedTadokuLevel = preferences.tadokuLevel
    }
    
    func cancelGeneration() {
        statusMessage = "Generation cancelled"
        isGenerating = false
    }
    
    // MARK: - Private Methods
    private func generateAndSaveStory(userId: String) async throws -> String {
        // 1. Update progress
        self.generationProgress = 0.1
        self.statusMessage = "Preparing story parameters..."
        
        // 2. Prepare request parameters
        let requestBody = createRequestBody(userId: userId)
        let jsonData = try JSONSerialization.data(withJSONObject: requestBody)
        
        // 3. Update progress
        self.generationProgress = 0.5
        self.statusMessage = "Calling OpenAI (this may take a minute)..."
        
        // 4. Call the Edge Function
        return try await withCheckedThrowingContinuation { continuation in
            Task {
                do {
                    try await supabase.functions.invoke("create-story", options: .init(body: jsonData)) { data, response in
                        handleResponse(data: data, response: response, continuation: continuation)
                    }
                } catch {
                    print("❌ Error invoking function: \(error)")
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    private func createRequestBody(userId: String) -> [String: Any] {
        [
            "userId": userId,
            "wanikaniLevel": selectedWanikaniLevel,
            "genkiChapter": selectedGenkiChapter, 
            "tadokuLevel": Int(selectedTadokuLevel) ?? 1,
            "topic": selectedTopic
        ]
    }
    
    private func handleResponse(data: Data, response: HTTPURLResponse, continuation: CheckedContinuation<String, Error>) {
        let responseString = String(data: data, encoding: .utf8) ?? "Could not decode response"
        print("📝 Edge Function response data: \(responseString)")
        
        // Check HTTP status
        if response.statusCode >= 400 {
            handleErrorResponse(data: data, statusCode: response.statusCode, continuation: continuation)
            return
        }
        
        // Process successful response
        do {
            if let jsonObj = try JSONSerialization.jsonObject(with: data, options: []) as? [String: Any] {
                print("📝 Parsed JSON response: \(jsonObj)")
                handleJsonResponse(jsonObj: jsonObj, continuation: continuation)
            } else {
                print("❌ Could not parse response as JSON")
                handleInvalidResponse(responseString: responseString, continuation: continuation)
            }
        } catch {
            print("❌ JSON parsing error: \(error)")
            continuation.resume(throwing: error)
        }
    }
    
    private func handleErrorResponse(data: Data, statusCode: Int, continuation: CheckedContinuation<String, Error>) {
        let errorMessage: String
        if let jsonObj = try? JSONSerialization.jsonObject(with: data, options: []) as? [String: Any],
           let errorDetail = jsonObj["error"] as? String {
            errorMessage = "Server error: \(errorDetail)"
        } else {
            errorMessage = "Server error: \(String(data: data, encoding: .utf8) ?? "Unknown error")"
        }
        
        print("❌ Edge Function HTTP error: \(statusCode), \(errorMessage)")
        continuation.resume(throwing: NSError(
            domain: "StoryGeneration",
            code: statusCode,
            userInfo: [NSLocalizedDescriptionKey: errorMessage]
        ))
    }
    
    private func handleJsonResponse(jsonObj: [String: Any], continuation: CheckedContinuation<String, Error>) {
        print("📝 Handling JSON response with keys: \(jsonObj.keys)")
        if let success = jsonObj["success"] as? Bool, success,
           let id = jsonObj["storyId"] as? String {
            print("✅ Story created successfully with ID: \(id)")
            continuation.resume(returning: id)
        } else if let error = jsonObj["error"] as? String {
            print("❌ Edge Function error in response: \(error)")
            continuation.resume(throwing: NSError(
                domain: "StoryGeneration",
                code: 400,
                userInfo: [NSLocalizedDescriptionKey: error]
            ))
        } else {
            print("❌ Invalid response format: \(jsonObj)")
            handleInvalidResponse(responseString: "Invalid response format: \(jsonObj)", continuation: continuation)
        }
    }
    
    private func handleInvalidResponse(responseString: String, continuation: CheckedContinuation<String, Error>) {
        print("❌ Could not parse JSON response: \(responseString)")
        continuation.resume(throwing: NSError(
            domain: "StoryGeneration",
            code: 500,
            userInfo: [NSLocalizedDescriptionKey: "Could not parse server response"]
        ))
    }
}
