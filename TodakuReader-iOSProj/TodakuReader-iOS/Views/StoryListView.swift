import SwiftUI

struct StoryListView: View {
    @StateObject private var viewModel: StoryViewModel
    
    init(supabase: SupabaseClient) {
        _viewModel = StateObject(wrappedValue: StoryViewModel(supabase: supabase))
    }
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading && viewModel.stories.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(viewModel.stories) { story in
                        NavigationLink(destination: StoryDetailView(story: story)) {
                            StoryRowView(story: story)
                        }
                    }
                    .listStyle(.insetGrouped)
                    .refreshable {
                        do {
                            try await Task.sleep(nanoseconds: 500_000_000) // 0.5 second minimum refresh time
                            await viewModel.fetchStories()
                        } catch {
                            // Handle task cancellation gracefully
                            print("Refresh cancelled")
                        }
                    }
                    .overlay {
                        if viewModel.stories.isEmpty {
                            if let error = viewModel.error {
                                ErrorView(error: error) {
                                    Task {
                                        await viewModel.fetchStories()
                                    }
                                }
                            } else {
                                ContentUnavailableView(
                                    "No Stories",
                                    systemImage: "book.closed",
                                    description: Text("Stories will appear here once they're available.")
                                )
                            }
                        }
                    }
                }
            }
            .navigationTitle("Stories")
        }
        .task {
            if viewModel.stories.isEmpty {
                await viewModel.fetchStories()
            }
        }
    }
}

struct StoryRowView: View {
    let story: Story
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(story.title)
                .font(.headline)
            
            HStack {
                if let wanikaniLevel = story.wanikaniLevel {
                    Label("\(wanikaniLevel)", systemImage: "brain")
                        .foregroundColor(.purple)
                }
                
                if let genkiChapter = story.genkiChapter {
                    Label("\(genkiChapter)", systemImage: "book")
                        .foregroundColor(.blue)
                }
                
                if let tadokuLevel = story.tadokuLevel {
                    Label("\(tadokuLevel)", systemImage: "textformat")
                        .foregroundColor(.green)
                }
                
                Spacer()
                
                Label("\(story.upvotes)", systemImage: "hand.thumbsup")
                    .foregroundColor(.orange)
            }
            .font(.caption)
            
            Text(story.contentJp.prefix(100) + "...")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .lineLimit(2)
        }
        .padding(.vertical, 4)
    }
}

struct ErrorView: View {
    let error: Error
    let retryAction: () -> Void
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Error loading stories")
                .font(.headline)
            
            Text(error.localizedDescription)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button(action: retryAction) {
                Text("Try Again")
                    .fontWeight(.semibold)
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue)
                    .cornerRadius(10)
            }
            .padding(.horizontal)
        }
        .padding()
    }
} 