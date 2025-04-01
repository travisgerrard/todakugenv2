import SwiftUI

struct StoryListView: View {
    @StateObject private var viewModel = StoryViewModel(supabase: SupabaseClient.shared)
    @EnvironmentObject var authViewModel: AuthViewModel
    @State private var showingUserPreferences = false
    @State private var showingStoryGenerator = false
    
    var body: some View {
        NavigationView {
            Group {
                if viewModel.isLoading && viewModel.stories.isEmpty {
                    ProgressView()
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List(viewModel.stories) { story in
                        NavigationLink(destination: StoryDetailView(storyId: story.id)) {
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
                                .overlay(
                                    VStack {
                                        Spacer()
                                        Button(action: { showingStoryGenerator = true }) {
                                            Label("Generate Your First Story", systemImage: "plus.circle.fill")
                                                .font(.headline)
                                                .padding()
                                                .background(Color.accentColor)
                                                .foregroundColor(.white)
                                                .cornerRadius(10)
                                        }
                                        .padding(.bottom, 50)
                                    }
                                )
                            }
                        }
                    }
                }
            }
            .navigationTitle("Stories")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Menu {
                        Button(action: { showingUserPreferences = true }) {
                            Label("User Preferences", systemImage: "person.crop.circle.badge.checkmark")
                        }
                        
                        Button(action: { showingStoryGenerator = true }) {
                            Label("Generate Story", systemImage: "wand.and.stars")
                        }
                        
                        Button(action: {
                            Task {
                                await authViewModel.signOut()
                            }
                        }) {
                            Label("Sign Out", systemImage: "rectangle.portrait.and.arrow.right")
                        }
                    } label: {
                        Image(systemName: "ellipsis.circle")
                    }
                }
                
                ToolbarItem(placement: .navigationBarLeading) {
                    Button(action: { showingStoryGenerator = true }) {
                        Image(systemName: "plus")
                    }
                }
            }
        }
        .task {
            if viewModel.stories.isEmpty {
                await viewModel.fetchStories()
            }
        }
        .onAppear {
            print("📱 StoryListView appeared - User is authenticated")
        }
        .sheet(isPresented: $showingUserPreferences) {
            UserPreferencesView()
                .environmentObject(authViewModel)
        }
        .sheet(isPresented: $showingStoryGenerator) {
            StoryGeneratorView(
                viewModel: StoryGeneratorViewModel(supabase: SupabaseClient.shared),
                preferencesViewModel: UserPreferencesViewModel(supabase: SupabaseClient.shared)
            )
            .environmentObject(authViewModel)
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