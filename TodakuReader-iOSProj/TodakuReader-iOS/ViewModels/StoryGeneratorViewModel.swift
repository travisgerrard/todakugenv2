import Foundation
import SwiftUI

@MainActor
class StoryGeneratorViewModel: ObservableObject {
    @Published var isGenerating = false
    @Published var error: Error?
    @Published var generatedStoryId: String?
    @Published var generationProgress: Double = 0
    @Published var statusMessage = "Ready to generate"
    
    // Available topics for story generation
    let availableTopics = [
        "Daily Life", "Travel", "Food", "School", "Work", 
        "Family", "Technology", "Nature", "Sports", "Hobbies",
        "Weather", "Music", "Seasons", "Shopping", "Health"
    ]
    
    // Current selection for story generation
    @Published var selectedWanikaniLevel: Int = 1
    @Published var selectedGenkiChapter: Int = 1
    @Published var selectedTadokuLevel: String = "1"
    @Published var selectedTopic: String = "Daily Life"
    
    private let supabase = SupabaseClient.shared
    
    // Load user's preferences to pre-populate the form
    func loadUserPreferences(from preferences: UserPreferences) {
        selectedWanikaniLevel = preferences.wanikaniLevel
        selectedGenkiChapter = preferences.genkiChapter
        selectedTadokuLevel = preferences.tadokuLevel
        // Default to the first topic in our available topics since preferredTopics was removed
        selectedTopic = availableTopics[0]
    }
    
    // Generate a new story with the selected parameters
    func generateStory(userId: String) async {
        isGenerating = true
        error = nil
        generatedStoryId = nil
        generationProgress = 0
        statusMessage = "Starting generation..."
        
        do {
            // TEMPORARY: Mock implementation to bypass API calls
            // This will allow the app to build and test the UI without actual API calls
            
            // Simulate a delay for the generation process
            try await Task.sleep(nanoseconds: 2_000_000_000) // 2 seconds
            
            // Create a mock request ID
            let mockRequestId = "mock-request-\(UUID().uuidString)"
            print("Mock request ID: \(mockRequestId)")
            
            // Start polling for story generation progress (simulated)
            generationProgress = 0.1
            statusMessage = "Request submitted - Starting generation..."
            
            // Poll for completion (simulated)
            await mockPollGenerationStatus(requestId: mockRequestId)
            
        } catch {
            print("Error generating story: \(error)")
            self.error = error
            statusMessage = "Error: \(error.localizedDescription)"
            isGenerating = false
        }
    }
    
    // TEMPORARY: Mock polling for story generation progress
    private func mockPollGenerationStatus(requestId: String) async {
        // Simulate progress updates
        for progress in stride(from: 0.1, through: 1.0, by: 0.1) {
            // Update progress
            await MainActor.run {
                generationProgress = progress
                statusMessage = "Generating: \(Int(progress * 100))% complete"
            }
            
            // Simulate delay between updates
            do {
                try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second
            } catch {
                print("Sleep interrupted")
            }
        }
        
        // Generate a mock story ID
        let mockStoryId = "mock-story-\(UUID().uuidString)"
        
        // Finish generation
        await MainActor.run {
            generatedStoryId = mockStoryId
            statusMessage = "Story generated successfully!"
            isGenerating = false
        }
    }
    
    // Keep the original function for reference (commented out)
    private func pollGenerationStatus(requestId: String) async {
        /* 
        let maxAttempts = 30 // 5 minutes maximum (10s intervals)
        var attempts = 0
        
        while attempts < maxAttempts {
            do {
                attempts += 1
                
                // Simplify the function call
                let requestMethod = "check-generation-status"
                
                // Use the simplest method signature available
                let response = try await supabase.functions.invoke(requestMethod)
                
                // For debugging
                print("Status response: \(String(data: response ?? Data(), encoding: .utf8) ?? "No data")")
                
                // Parse the response
                guard let data = response,
                      let jsonObj = try? JSONSerialization.jsonObject(with: data) as? [String: Any] else {
                    throw NSError(domain: "StoryGeneration", code: 101, 
                                 userInfo: [NSLocalizedDescriptionKey: "Invalid response format"])
                }
                
                if let statusStr = jsonObj["status"] as? String {
                    switch statusStr {
                    case "completed":
                        if let storyId = jsonObj["story_id"] as? String {
                            generatedStoryId = storyId
                            generationProgress = 1.0
                            statusMessage = "Story generated successfully!"
                            isGenerating = false
                            return
                        }
                    case "failed":
                        let errorMessage = jsonObj["error"] as? String ?? "Unknown error"
                        statusMessage = "Generation failed: \(errorMessage)"
                        error = NSError(domain: "StoryGeneration", 
                                       code: 1, 
                                       userInfo: [NSLocalizedDescriptionKey: errorMessage])
                        isGenerating = false
                        return
                    case "in_progress":
                        if let progress = jsonObj["progress"] as? Double {
                            generationProgress = progress
                            statusMessage = "Generating: \(Int(progress * 100))% complete"
                        }
                    default:
                        generationProgress = Double(attempts) / Double(maxAttempts) * 0.8
                        statusMessage = "Waiting for response... (\(statusStr))"
                    }
                }
                
                // Wait before checking again
                try await Task.sleep(nanoseconds: 10_000_000_000) // 10 seconds
                
            } catch {
                print("Error checking generation status: \(error)")
                // Continue polling despite error
                generationProgress = Double(attempts) / Double(maxAttempts) * 0.8
                statusMessage = "Checking status..."
                
                try? await Task.sleep(nanoseconds: 10_000_000_000) // 10 seconds
            }
        }
        
        // Max attempts reached
        statusMessage = "Timed out. The story may still be generating."
        error = NSError(domain: "StoryGeneration", 
                       code: 2, 
                       userInfo: [NSLocalizedDescriptionKey: "Generation timed out. The story may still be generating."])
        isGenerating = false
        */
    }
} 