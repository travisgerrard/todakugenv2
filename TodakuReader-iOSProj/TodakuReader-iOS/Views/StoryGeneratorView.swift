import SwiftUI

struct StoryGeneratorView: View {
    @StateObject private var viewModel = StoryGeneratorViewModel()
    @StateObject private var prefViewModel = UserPreferencesViewModel()
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    @State private var navigateToStory = false
    @State private var generatedStoryId: String? = nil
    
    // Common UI elements
    let minLevel = 1
    let maxWanikaniLevel = 60
    let maxGenkiChapter = 23
    let maxTadokuLevel = 10
    
    var body: some View {
        NavigationView {
            contentView
                .navigationTitle("Story Generator")
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Close") { dismiss() }
                    }
                }
                .onAppear {
                    loadUserPreferences()
                }
                .background(
                    // Navigation link to the generated story
                    NavigationLink(
                        destination: generatedStoryId.map { id in
                            StoryDetailView(storyId: id)
                        },
                        isActive: $navigateToStory,
                        label: { EmptyView() }
                    )
                    .hidden()
                )
        }
    }
    
    private var contentView: some View {
        Form {
            instructionsSection
            learningLevelsSection
            topicSelectionSection
            if viewModel.isGenerating { generationStatusSection }
            generateButtonSection
            if viewModel.error != nil { errorSection }
        }
    }
    
    private var instructionsSection: some View {
        Section {
            VStack(alignment: .leading, spacing: 8) {
                Text("Generate a New Story")
                    .font(.headline)
                
                Text("This will create a personalized Japanese story based on your learning level and preferences. The generation process usually takes 2-3 minutes.")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding(.vertical, 4)
        }
    }
    
    private var learningLevelsSection: some View {
        Section(header: Text("Learning Levels")) {
            waniKaniLevelView
            genkiChapterView
            tadokuLevelView
        }
    }
    
    private var waniKaniLevelView: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("WaniKani Level:")
                Spacer()
                Text("\(viewModel.selectedWanikaniLevel)")
                    .foregroundColor(.secondary)
            }
            Slider(
                value: wkBinding,
                in: Double(minLevel)...Double(maxWanikaniLevel),
                step: 1
            )
            .accentColor(.purple)
        }
    }
    
    private var wkBinding: Binding<Double> {
        Binding<Double>(
            get: { Double(viewModel.selectedWanikaniLevel) },
            set: { viewModel.selectedWanikaniLevel = Int($0) }
        )
    }
    
    private var genkiChapterView: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Genki Chapter:")
                Spacer()
                Text("\(viewModel.selectedGenkiChapter)")
                    .foregroundColor(.secondary)
            }
            Slider(
                value: genkiBinding,
                in: Double(minLevel)...Double(maxGenkiChapter),
                step: 1
            )
            .accentColor(.blue)
        }
    }
    
    private var genkiBinding: Binding<Double> {
        Binding<Double>(
            get: { Double(viewModel.selectedGenkiChapter) },
            set: { viewModel.selectedGenkiChapter = Int($0) }
        )
    }
    
    private var tadokuLevelView: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Tadoku Level:")
                Spacer()
                Text("\(viewModel.selectedTadokuLevel)")
                    .foregroundColor(.secondary)
            }
            Slider(
                value: tadokuBinding,
                in: Double(minLevel)...Double(maxTadokuLevel),
                step: 1
            )
            .accentColor(.green)
        }
    }
    
    private var tadokuBinding: Binding<Double> {
        Binding<Double>(
            get: { 
                // Convert String to Double
                Double(viewModel.selectedTadokuLevel) ?? Double(minLevel)
            },
            set: { 
                // Convert Double to String
                viewModel.selectedTadokuLevel = String(Int($0)) 
            }
        )
    }
    
    private var topicSelectionSection: some View {
        Section(header: Text("Story Topic")) {
            Picker("Topic", selection: $viewModel.selectedTopic) {
                ForEach(viewModel.availableTopics, id: \.self) { topic in
                    Text(topic).tag(topic)
                }
            }
            .pickerStyle(.menu)
        }
    }
    
    private var generationStatusSection: some View {
        Section {
            VStack(alignment: .leading, spacing: 10) {
                Text(viewModel.statusMessage)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                ProgressView(value: viewModel.generationProgress, total: 1.0)
                    .progressViewStyle(LinearProgressViewStyle())
                    .animation(.linear, value: viewModel.generationProgress)
                    .padding(.vertical, 4)
                
                Text("\(Int(viewModel.generationProgress * 100))%")
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .frame(maxWidth: .infinity, alignment: .trailing)
            }
        }
    }
    
    private var generateButtonSection: some View {
        Section {
            Button(action: generateStory) {
                if viewModel.isGenerating {
                    HStack {
                        Spacer()
                        ProgressView()
                            .padding(.trailing, 8)
                        Text("Generating...")
                        Spacer()
                    }
                } else {
                    HStack {
                        Spacer()
                        Image(systemName: "wand.and.stars")
                            .padding(.trailing, 8)
                        Text("Generate Story")
                            .fontWeight(.semibold)
                        Spacer()
                    }
                }
            }
            .disabled(viewModel.isGenerating)
            .listRowBackground(Color.accentColor.opacity(0.2))
        }
        .padding(.vertical, 4)
    }
    
    private var errorSection: some View {
        Section {
            if let error = viewModel.error {
                Text(error.localizedDescription)
                    .foregroundColor(.red)
                    .font(.footnote)
            }
        }
    }
    
    // Action methods extracted for clarity
    private func loadUserPreferences() {
        guard let userId = authViewModel.user?.id else { return }
        // Convert UUID to String
        let userIdString = userId.uuidString
        Task {
            await prefViewModel.loadPreferences(for: userIdString)
            viewModel.loadUserPreferences(from: prefViewModel.preferences)
        }
    }
    
    private func generateStory() {
        guard let userId = authViewModel.user?.id else { return }
        // Convert UUID to String
        let userIdString = userId.uuidString
        Task {
            await viewModel.generateStory(userId: userIdString)
            if let storyId = viewModel.generatedStoryId {
                generatedStoryId = storyId
                navigateToStory = true
            }
        }
    }
} 