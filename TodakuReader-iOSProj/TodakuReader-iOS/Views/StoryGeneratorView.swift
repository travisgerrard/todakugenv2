import SwiftUI
import Foundation

struct StoryGeneratorView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject var authViewModel: AuthViewModel
    @ObservedObject var viewModel: StoryGeneratorViewModel
    @ObservedObject var preferencesViewModel: UserPreferencesViewModel
    @State private var isShowingStory = false
    
    init(viewModel: StoryGeneratorViewModel, preferencesViewModel: UserPreferencesViewModel) {
        self.viewModel = viewModel
        self.preferencesViewModel = preferencesViewModel
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                content
                
                if isShowingStory, let storyId = viewModel.generatedStoryId {
                    NavigationLink(
                        destination: StoryDetailView(storyId: storyId),
                        isActive: $isShowingStory
                    ) {
                        EmptyView()
                    }
                }
            }
            .navigationTitle("Story Generator")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
            .onChange(of: viewModel.generatedStoryId) { newValue in
                if newValue != nil {
                    // Wait a moment before navigating to make sure the story is saved
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.5) {
                        isShowingStory = true
                    }
                }
            }
            .onAppear {
                // Load user preferences when the view appears and update the generator VM afterwards
                if !preferencesViewModel.isLoading {
                    if let userId = authViewModel.user?.id.uuidString {
                        // Check if preferences for this user are already loaded
                        if preferencesViewModel.preferences.userId != userId {
                            Task {
                                // Load preferences asynchronously
                                await preferencesViewModel.loadPreferences(for: userId)
                                // Update the generator VM *after* loading is complete
                                viewModel.loadUserPreferences(from: preferencesViewModel.preferences)
                            }
                        } else {
                            // Preferences for the current user are already loaded, just update the generator VM
                            viewModel.loadUserPreferences(from: preferencesViewModel.preferences)
                        }
                    } else {
                        // No user logged in, load default preferences into the generator VM
                        viewModel.loadUserPreferences(from: .defaultPreferences)
                        // Optionally clear any previously loaded non-default preferences in preferencesViewModel
                        // preferencesViewModel.resetToDefaults() // Example if you have such a method
                    }
                } else {
                     // Still loading, perhaps wait or rely on onChange below if needed
                     // For now, we assume loading finishes quickly or is handled by initial state.
                     // If preferencesViewModel publishes changes, an onChange could also trigger the update.
                     viewModel.loadUserPreferences(from: preferencesViewModel.preferences) // Load current state anyway
                }
            }
            // Optional: Add onChange if preferences can change while the view is visible
            // .onChange(of: preferencesViewModel.preferences) { newPreferences in
            //     viewModel.loadUserPreferences(from: newPreferences)
            // }
        }
    }
    
    private var content: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Header Section
                VStack(alignment: .leading, spacing: 8) {
                    Text("Generate a Japanese Story")
                        .font(.title)
                        .fontWeight(.bold)
                    
                    Text("Create a custom story based on your learning level and interests.")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding(.bottom, 10)
                
                // Learning Level Section
                learningLevelSection
                
                // Topic Section
                topicSection
                
                // Generation Button
                generateButtonSection
                
                // Status Section (shows when generating)
                if viewModel.isGenerating {
                    statusSection
                }
                
                Spacer()
            }
            .padding()
        }
    }
    
    private var learningLevelSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Learning Level")
                .font(.headline)
                .fontWeight(.bold)
            
            // WaniKani Level Slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("WaniKani Level:")
                    Spacer()
                    Text("\(viewModel.selectedWanikaniLevel)")
                        .fontWeight(.medium)
                }
                .font(.subheadline)
                
                Slider(value: Binding(
                    get: { Double(viewModel.selectedWanikaniLevel) },
                    set: { viewModel.selectedWanikaniLevel = Int($0) }
                ), in: 1...60, step: 1)
                .accentColor(.blue)
            }
            
            // Genki Chapter Slider
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Genki Chapter:")
                    Spacer()
                    Text("\(viewModel.selectedGenkiChapter)")
                        .fontWeight(.medium)
                }
                .font(.subheadline)
                
                Slider(value: Binding(
                    get: { Double(viewModel.selectedGenkiChapter) },
                    set: { viewModel.selectedGenkiChapter = Int($0) }
                ), in: 1...23, step: 1)
                .accentColor(.green)
            }
            
            // Tadoku Level Picker
            VStack(alignment: .leading, spacing: 8) {
                Text("Tadoku Level:")
                    .font(.subheadline)
                
                Picker("Tadoku Level", selection: $viewModel.selectedTadokuLevel) {
                    Text("Level 1 (Beginner)").tag("1")
                    Text("Level 2").tag("2")
                    Text("Level 3").tag("3")
                    Text("Level 4").tag("4")
                    Text("Level 5 (Advanced)").tag("5")
                }
                .pickerStyle(SegmentedPickerStyle())
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
    
    private var topicSection: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Story Topic")
                .font(.headline)
                .fontWeight(.bold)
            
            Picker("Select a topic", selection: $viewModel.selectedTopic) {
                ForEach(viewModel.availableTopics, id: \.self) { topic in
                    Text(topic).tag(topic)
                }
            }
            .pickerStyle(WheelPickerStyle())
            .frame(height: 100)
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
    
    private var generateButtonSection: some View {
        VStack {
            Button(action: {
                print("📱 Generate button tapped")
                print("📱 Auth state - isAuthenticated: \(authViewModel.isAuthenticated), hasUser: \(authViewModel.user != nil)")
                if let userId = authViewModel.user?.id.uuidString {
                    print("📱 User ID: \(userId)")
                    Task {
                        await viewModel.generateStory(userId: userId)
                    }
                } else {
                    print("❌ No user ID available")
                }
            }) {
                HStack {
                    Image(systemName: "wand.and.stars")
                    Text(viewModel.isGenerating ? "Generating..." : "Generate Story")
                }
                .frame(minWidth: 0, maxWidth: .infinity)
                .padding()
                .background(viewModel.isGenerating ? Color.gray : Color.blue)
                .foregroundColor(.white)
                .cornerRadius(10)
                .font(.headline)
            }
            .disabled(viewModel.isGenerating || authViewModel.user == nil)
            
            if let error = viewModel.error {
                Text("Error: \(error.localizedDescription)")
                    .font(.caption)
                    .foregroundColor(.red)
                    .padding(.top, 8)
            }
        }
    }
    
    private var statusSection: some View {
        VStack(spacing: 12) {
            ProgressView(value: viewModel.generationProgress)
                .progressViewStyle(LinearProgressViewStyle())
                .frame(height: 8)
            
            HStack {
                Text(viewModel.statusMessage)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button(action: {
                    viewModel.cancelGeneration()
                }) {
                    Text("Cancel")
                        .font(.subheadline)
                        .foregroundColor(.red)
                }
            }
        }
        .padding()
        .background(Color(.systemGray6))
        .cornerRadius(10)
    }
}

struct StoryGeneratorView_Previews: PreviewProvider {
    static var previews: some View {
        let supabase = SupabaseClient.shared
        
        StoryGeneratorView(
            viewModel: StoryGeneratorViewModel(supabase: supabase),
            preferencesViewModel: UserPreferencesViewModel(supabase: supabase)
        )
        .environmentObject(AuthViewModel(supabase: supabase))
    }
} 