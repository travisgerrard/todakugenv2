import SwiftUI

struct StoryListView: View {
    @StateObject private var viewModel = StoryListViewModel()
    @State private var searchText = ""
    @State private var showFilters = false
    
    var body: some View {
        NavigationView {
            VStack {
                // Search and filter bar
                HStack {
                    TextField("Search stories", text: $searchText)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                    
                    Button(action: { showFilters.toggle() }) {
                        Image(systemName: "line.3.horizontal.decrease.circle")
                            .foregroundColor(.blue)
                    }
                }
                .padding()
                
                // Filter options
                if showFilters {
                    VStack(spacing: 16) {
                        // Level filters
                        HStack {
                            Text("WaniKani Level:")
                            Picker("WaniKani Level", selection: $viewModel.selectedWaniKaniLevel) {
                                Text("Any").tag(0)
                                ForEach(1...60, id: \.self) { level in
                                    Text("\(level)").tag(level)
                                }
                            }
                        }
                        
                        HStack {
                            Text("Genki Chapter:")
                            Picker("Genki Chapter", selection: $viewModel.selectedGenkiChapter) {
                                Text("Any").tag(0)
                                ForEach(1...23, id: \.self) { chapter in
                                    Text("\(chapter)").tag(chapter)
                                }
                            }
                        }
                        
                        HStack {
                            Text("Tadoku Level:")
                            Picker("Tadoku Level", selection: $viewModel.selectedTadokuLevel) {
                                Text("Any").tag(0)
                                ForEach(1...8, id: \.self) { level in
                                    Text("\(level)").tag(level)
                                }
                            }
                        }
                    }
                    .padding()
                    .background(Color(.systemGray6))
                }
                
                // Content
                Group {
                    if viewModel.isLoading {
                        ProgressView("Loading stories...")
                            .progressViewStyle(CircularProgressViewStyle())
                    } else if let error = viewModel.error {
                        VStack(spacing: 16) {
                            Text("Error loading stories")
                                .font(.headline)
                            Text(error.localizedDescription)
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                            Button("Try Again") {
                                Task {
                                    await viewModel.fetchStories()
                                }
                            }
                            .buttonStyle(.bordered)
                        }
                        .padding()
                    } else if viewModel.filteredStories(searchText: searchText).isEmpty {
                        VStack(spacing: 8) {
                            Image(systemName: "magnifyingglass")
                                .font(.largeTitle)
                                .foregroundColor(.secondary)
                            Text("No stories found")
                                .font(.headline)
                            Text("Try adjusting your filters or search terms")
                                .font(.subheadline)
                                .foregroundColor(.secondary)
                        }
                        .padding()
                    } else {
                        List {
                            ForEach(viewModel.filteredStories(searchText: searchText)) { story in
                                NavigationLink(destination: StoryReaderView(story: story)) {
                                    StoryListItem(story: story)
                                }
                            }
                        }
                        .listStyle(PlainListStyle())
                        .refreshable {
                            await viewModel.fetchStories()
                        }
                    }
                }
            }
            .navigationTitle("Stories")
            .task {
                await viewModel.fetchStories()
            }
        }
    }
}

struct StoryListItem: View {
    let story: Story
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(story.title)
                .font(.headline)
            
            HStack(spacing: 12) {
                LevelBadge(label: "WK", level: story.wanikaniLevel)
                LevelBadge(label: "GK", level: story.genkiChapter)
                LevelBadge(label: "TD", level: story.tadokuLevel)
                
                Spacer()
                
                HStack {
                    Image(systemName: "arrow.up")
                    Text("\(story.upvotes)")
                }
                .foregroundColor(.secondary)
            }
            
            Text(story.topic)
                .font(.subheadline)
                .foregroundColor(.secondary)
        }
        .padding(.vertical, 4)
    }
}

struct LevelBadge: View {
    let label: String
    let level: Int
    
    var body: some View {
        HStack(spacing: 4) {
            Text(label)
                .font(.caption2)
                .fontWeight(.bold)
            Text("\(level)")
                .font(.caption)
        }
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(Color.blue.opacity(0.1))
        .foregroundColor(.blue)
        .cornerRadius(8)
    }
}

class StoryListViewModel: ObservableObject {
    @Published var stories: [Story] = []
    @Published var selectedWaniKaniLevel = 0
    @Published var selectedGenkiChapter = 0
    @Published var selectedTadokuLevel = 0
    @Published var isLoading = false
    @Published var error: Error?
    
    @MainActor
    func fetchStories() async {
        isLoading = true
        error = nil
        
        do {
            stories = try await SupabaseService.shared.fetchStories()
        } catch {
            self.error = error
        }
        
        isLoading = false
    }
    
    func filteredStories(searchText: String) -> [Story] {
        var filtered = stories
        
        // Apply level filters
        if selectedWaniKaniLevel > 0 {
            filtered = filtered.filter { $0.wanikaniLevel == selectedWaniKaniLevel }
        }
        if selectedGenkiChapter > 0 {
            filtered = filtered.filter { $0.genkiChapter == selectedGenkiChapter }
        }
        if selectedTadokuLevel > 0 {
            filtered = filtered.filter { $0.tadokuLevel == selectedTadokuLevel }
        }
        
        // Apply search text filter
        if !searchText.isEmpty {
            filtered = filtered.filter { story in
                story.title.localizedCaseInsensitiveContains(searchText) ||
                story.topic.localizedCaseInsensitiveContains(searchText)
            }
        }
        
        return filtered
    }
}

#Preview {
    StoryListView()
} 