import Foundation
import SwiftUI
import PostgREST

@MainActor
class StoryViewModel: ObservableObject {
    @Published var stories: [Story] = []
    @Published var isLoading = false
    @Published var error: Error?
    
    private let supabase: SupabaseClient
    
    init(supabase: SupabaseClient) {
        self.supabase = supabase
    }
    
    func fetchStories() async {
        // If already loading, don't start another fetch
        guard !isLoading else { return }
        
        isLoading = true
        error = nil
        
        do {
            // Fetch stories with all data in a single query since relationships are JSONB columns
            let response: [Story] = try await supabase.database
                .from("stories")
                .select("""
                    id,
                    created_at,
                    user_id,
                    title,
                    content_jp,
                    content_en,
                    wanikani_level,
                    genki_chapter,
                    tadoku_level,
                    topic,
                    upvotes,
                    vocabulary,
                    grammar,
                    quizzes
                """)
                .order("created_at", ascending: false)
                .execute()
                .value
            
            // Check if task was cancelled
            try Task.checkCancellation()
            
            stories = response
        } catch is CancellationError {
            // Handle cancellation gracefully
            print("Story fetch was cancelled")
        } catch {
            print("Error fetching stories:", error)
            self.error = error
        }
        
        isLoading = false
    }
    
    func upvoteStory(_ story: Story) async {
        do {
            try await supabase.database
                .from("stories")
                .update(["upvotes": story.upvotes + 1])
                .eq("id", value: story.id)
                .execute()
            
            // Refresh stories after upvote
            await fetchStories()
        } catch {
            print("Error upvoting story:", error)
            self.error = error
        }
    }
} 