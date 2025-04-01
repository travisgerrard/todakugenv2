import SwiftUI

struct StoryDetailView: View {
    // Support both direct story object and story ID
    var story: Story?
    var storyId: String?
    
    @StateObject private var viewModel = StoryViewModel(supabase: SupabaseClient.shared)
    @State private var loadedStory: Story?
    @State private var isLoading = false
    @State private var error: Error?
    @State private var showTranslation = false
    @State private var selectedQuizIndex = 0
    @State private var selectedAnswers: [Int?] = []
    @State private var activeTab = StoryTab.content
    
    enum StoryTab {
        case content
        case vocabulary
        case grammar
        case quiz
    }
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if isLoading {
                    loadingView
                } else if let displayStory = story ?? loadedStory {
                    storyHeaderView(displayStory)
                    
                    // Tab selector
                    tabSelectorView
                    
                    // Content based on active tab
                    contentForActiveTab(displayStory)
                } else if let error = error {
                    errorView(error: error)
                } else {
                    emptyStateView(title: "Story Not Found", message: "The story you requested could not be found.")
                }
            }
            .padding()
        }
        .navigationBarTitle("Story", displayMode: .inline)
        .onAppear {
            // If we have a storyId but no story, load it
            if story == nil, let id = storyId {
                loadStoryById()
            }
        }
    }
    
    // MARK: - Main Content Views
    
    @ViewBuilder
    private func contentForActiveTab(_ displayStory: Story) -> some View {
        switch activeTab {
        case .content:
            storyContentView(displayStory)
        case .vocabulary:
            vocabularyTabContent(displayStory)
        case .grammar:
            grammarTabContent(displayStory)
        case .quiz:
            quizTabContent(displayStory)
        }
    }
    
    @ViewBuilder
    private func vocabularyTabContent(_ story: Story) -> some View {
        if !story.vocabulary.isEmpty {
            VocabularySection(items: story.vocabulary)
        } else {
            emptyStateView(title: "No Vocabulary", message: "This story doesn't have vocabulary items.")
        }
    }
    
    @ViewBuilder
    private func grammarTabContent(_ story: Story) -> some View {
        if !story.grammar.isEmpty {
            GrammarSection(items: story.grammar)
        } else {
            emptyStateView(title: "No Grammar", message: "This story doesn't have grammar points.")
        }
    }
    
    @ViewBuilder
    private func quizTabContent(_ story: Story) -> some View {
        if !story.quizzes.isEmpty {
            QuizSection(
                quizzes: story.quizzes,
                selectedQuizIndex: $selectedQuizIndex,
                selectedAnswers: $selectedAnswers
            )
            .onAppear {
                // Initialize answers array if needed
                if selectedAnswers.count != story.quizzes.count {
                    selectedAnswers = Array(repeating: nil, count: story.quizzes.count)
                }
            }
        } else {
            emptyStateView(title: "No Quizzes", message: "This story doesn't have any quizzes.")
        }
    }
    
    // MARK: - Component Views
    
    private var loadingView: some View {
        VStack {
            ProgressView("Loading story...")
                .padding()
            Text("This may take a moment...")
                .font(.caption)
                .foregroundColor(.secondary)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
        .padding(.vertical, 100)
    }
    
    private func storyHeaderView(_ story: Story) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            // Story title
            Text(story.title)
                .font(.largeTitle)
                .fontWeight(.bold)
            
            // Story metadata
            HStack {
                if let wanikaniLevel = story.wanikaniLevel {
                    Label("\(wanikaniLevel)", systemImage: "brain")
                        .foregroundColor(.purple)
                        .padding(.trailing, 8)
                }
                
                if let genkiChapter = story.genkiChapter {
                    Label("\(genkiChapter)", systemImage: "book")
                        .foregroundColor(.blue)
                        .padding(.trailing, 8)
                }
                
                if let tadokuLevel = story.tadokuLevel {
                    Label("\(tadokuLevel)", systemImage: "textformat")
                        .foregroundColor(.green)
                        .padding(.trailing, 8)
                }
                
                if let topic = story.topic {
                    Label(topic, systemImage: "tag")
                        .foregroundColor(.orange)
                }
            }
            .font(.caption)
            .padding(.bottom, 4)
        }
    }
    
    private var tabSelectorView: some View {
        HStack {
            ForEach([StoryTab.content, StoryTab.vocabulary, StoryTab.grammar, StoryTab.quiz], id: \.self) { tab in
                Button(action: { activeTab = tab }) {
                    VStack(spacing: 8) {
                        Image(systemName: iconForTab(tab))
                            .font(.system(size: 16, weight: .medium))
                        Text(titleForTab(tab))
                            .font(.caption)
                    }
                    .frame(maxWidth: .infinity)
                    .foregroundColor(activeTab == tab ? .accentColor : .secondary)
                }
                .buttonStyle(PlainButtonStyle())
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 8)
        .background(Color(.systemGray6).opacity(0.5))
        .cornerRadius(10)
    }
    
    private func storyContentView(_ story: Story) -> some View {
        VStack(alignment: .leading, spacing: 16) {
            // Japanese content
            VStack(alignment: .leading, spacing: 8) {
                Text("Japanese")
                    .font(.headline)
                    .foregroundColor(.secondary)
                
                Text(story.contentJp)
                    .font(.body)
                    .lineSpacing(5)
            }
            .padding()
            .background(Color(.systemBackground))
            .cornerRadius(12)
            .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
            
            // Translation toggle button
            Button(action: { showTranslation.toggle() }) {
                HStack {
                    Text(showTranslation ? "Hide Translation" : "Show Translation")
                    Image(systemName: showTranslation ? "eye.slash" : "eye")
                }
                .font(.subheadline)
                .padding(.vertical, 8)
                .padding(.horizontal, 16)
                .background(Color.accentColor.opacity(0.1))
                .foregroundColor(.accentColor)
                .cornerRadius(20)
            }
            .padding(.vertical, 8)
            
            // English content (conditional)
            if showTranslation {
                VStack(alignment: .leading, spacing: 8) {
                    Text("English Translation")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text(story.contentEn)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .lineSpacing(5)
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(color: Color.black.opacity(0.05), radius: 5, x: 0, y: 2)
                .transition(.opacity)
            }
        }
    }
    
    private func errorView(error: Error) -> some View {
        VStack(spacing: 16) {
            Image(systemName: "exclamationmark.triangle")
                .font(.largeTitle)
                .foregroundColor(.orange)
            
            Text("Error loading story")
                .font(.headline)
            
            Text(error.localizedDescription)
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Button("Try Again") {
                loadStoryById()
            }
            .padding()
            .background(Color.accentColor)
            .foregroundColor(.white)
            .cornerRadius(8)
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .center)
        .padding(.vertical, 50)
    }
    
    private func emptyStateView(title: String, message: String) -> some View {
        VStack(spacing: 20) {
            Image(systemName: "doc.text.magnifyingglass")
                .font(.system(size: 50))
                .foregroundColor(.secondary)
            
            Text(title)
                .font(.headline)
            
            Text(message)
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 50)
    }
    
    // MARK: - Helper Functions
    
    private func titleForTab(_ tab: StoryTab) -> String {
        switch tab {
        case .content:
            return "Story"
        case .vocabulary:
            return "Vocabulary"
        case .grammar:
            return "Grammar"
        case .quiz:
            return "Quiz"
        }
    }
    
    private func iconForTab(_ tab: StoryTab) -> String {
        switch tab {
        case .content:
            return "book"
        case .vocabulary:
            return "character.book.closed"
        case .grammar:
            return "list.bullet"
        case .quiz:
            return "questionmark.circle"
        }
    }
    
    private func loadStoryById() {
        isLoading = true
        error = nil
        
        print("📱 Loading story with ID: \(storyId ?? "nil")")
        
        // First try to load from cached stories
        if let id = storyId,
           let cachedStory = viewModel.stories.first(where: { $0.id == id }) {
            print("📱 Found story in cache")
            self.loadedStory = cachedStory
            self.isLoading = false
            
            // Update from Supabase in the background
            Task {
                do {
                    let updatedStory: Story = try await SupabaseClient.shared.database
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
                        .eq("id", value: id)
                        .single()
                        .execute()
                        .value
                    
                    print("📱 Updated story data from Supabase:")
                    print("📱 - Title: \(updatedStory.title)")
                    print("📱 - Vocabulary count: \(updatedStory.vocabulary.count)")
                    print("📱 - Grammar count: \(updatedStory.grammar.count)")
                    print("📱 - Quizzes count: \(updatedStory.quizzes.count)")
                    
                    // Only update if the story has changed
                    if updatedStory.createdAt != cachedStory.createdAt {
                        print("📱 Story has been updated, refreshing view")
                        await MainActor.run {
                            self.loadedStory = updatedStory
                        }
                    }
                } catch {
                    print("❌ Error updating story from Supabase: \(error)")
                }
            }
        } else {
            // If not in cache, load from Supabase
            Task {
                do {
                    let story: Story = try await SupabaseClient.shared.database
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
                        .eq("id", value: storyId)
                        .single()
                        .execute()
                        .value
                    
                    print("📱 Loaded story data from Supabase:")
                    print("📱 - Title: \(story.title)")
                    print("📱 - Vocabulary count: \(story.vocabulary.count)")
                    print("📱 - Grammar count: \(story.grammar.count)")
                    print("📱 - Quizzes count: \(story.quizzes.count)")
                    
                    await MainActor.run {
                        self.loadedStory = story
                        self.isLoading = false
                    }
                } catch {
                    print("❌ Error loading story from Supabase: \(error)")
                    await MainActor.run {
                        self.error = error
                        self.isLoading = false
                    }
                }
            }
        }
    }
}

// MARK: - Supporting Views

struct VocabularySection: View {
    let items: [VocabularyItem]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Vocabulary")
                .font(.title2)
                .fontWeight(.bold)
                .padding(.bottom, 4)
            
            ForEach(items) { item in
                VStack(alignment: .leading, spacing: 8) {
                    // Word and reading
                    HStack(alignment: .firstTextBaseline, spacing: 8) {
                        Text(item.word)
                            .font(.system(size: 20, weight: .semibold))
                        Text(item.reading)
                            .font(.system(size: 16))
                            .foregroundColor(.secondary)
                    }
                    
                    // Meaning
                    Text(item.meaning)
                        .font(.system(size: 16))
                        .foregroundColor(.secondary)
                    
                    if !item.example.isEmpty {
                        Divider()
                            .padding(.vertical, 4)
                        
                        // Example
                        VStack(alignment: .leading, spacing: 4) {
                            Text(item.example)
                                .font(.system(size: 15))
                            Text(item.exampleTranslation)
                                .font(.system(size: 14))
                                .foregroundColor(.secondary)
                                .italic()
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(
                    RoundedRectangle(cornerRadius: 12)
                        .fill(Color(.systemGray6))
                )
            }
        }
        .padding(16)
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
}

struct GrammarSection: View {
    let items: [GrammarPoint]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Grammar")
                .font(.title2)
                .fontWeight(.bold)
            
            ForEach(items) { item in
                VStack(alignment: .leading, spacing: 8) {
                    Text(item.pattern)
                        .font(.headline)
                    Text(item.explanation)
                        .font(.body)
                    Text(item.example)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    Text(item.exampleTranslation)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                .padding()
                .background(Color(.systemGray6))
                .cornerRadius(8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

struct QuizSection: View {
    let quizzes: [Quiz]
    @Binding var selectedQuizIndex: Int
    @Binding var selectedAnswers: [Int?]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Quiz")
                    .font(.title2)
                    .fontWeight(.bold)
                Spacer()
                Text("\(selectedQuizIndex + 1) of \(quizzes.count)")
                    .foregroundColor(.secondary)
            }
            
            // Ensure selectedQuizIndex is within bounds
            let safeIndex = min(max(selectedQuizIndex, 0), quizzes.count - 1)
            
            TabView(selection: $selectedQuizIndex) {
                ForEach(quizzes.indices, id: \.self) { index in
                    QuizQuestionView(
                        quiz: quizzes[index],
                        selectedAnswer: Binding(
                            get: { selectedAnswers.indices.contains(index) ? selectedAnswers[index] : nil },
                            set: { selectedAnswers[index] = $0 }
                        )
                    )
                    .tag(index)
                    .padding(.bottom, 24) // Add padding at the bottom
                }
            }
            .frame(minHeight: 500) // Increase minimum height
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never)) // Add compatible tab view style
            
            // Navigation and progress
            HStack(spacing: 16) {
                // Previous button
                Button(action: {
                    withAnimation(.easeInOut) {
                        selectedQuizIndex = max(0, selectedQuizIndex - 1)
                    }
                }) {
                    Image(systemName: "chevron.left")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                        .background(Color(.systemGray6))
                        .clipShape(Circle())
                }
                .disabled(selectedQuizIndex == 0)
                .opacity(selectedQuizIndex == 0 ? 0.5 : 1)
                
                // Progress indicators
                HStack(spacing: 6) {
                    ForEach(quizzes.indices, id: \.self) { index in
                        Circle()
                            .fill(index == safeIndex ? Color.blue : Color.gray.opacity(0.3))
                            .frame(width: 8, height: 8)
                    }
                }
                .frame(maxWidth: .infinity)
                
                // Next button
                Button(action: {
                    withAnimation(.easeInOut) {
                        selectedQuizIndex = min(quizzes.count - 1, selectedQuizIndex + 1)
                    }
                }) {
                    Image(systemName: "chevron.right")
                        .font(.system(size: 20, weight: .medium))
                        .foregroundColor(.primary)
                        .frame(width: 44, height: 44)
                        .background(Color(.systemGray6))
                        .clipShape(Circle())
                }
                .disabled(selectedQuizIndex == quizzes.count - 1)
                .opacity(selectedQuizIndex == quizzes.count - 1 ? 0.5 : 1)
            }
            .padding(.horizontal)
        }
        .padding()
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: Color.black.opacity(0.05), radius: 8, x: 0, y: 2)
    }
}

struct QuizQuestionView: View {
    let quiz: Quiz
    @Binding var selectedAnswer: Int?
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Question
                Text(quiz.question)
                    .font(.title3)
                    .fontWeight(.semibold)
                    .padding(.bottom, 8)
                    .textSelection(.enabled)
                
                // Options
                ForEach(quiz.options.indices, id: \.self) { index in
                    Button(action: { selectedAnswer = index }) {
                        HStack {
                            Text(quiz.options[index])
                                .font(.body)
                                .foregroundColor(.primary)
                                .multilineTextAlignment(.leading)
                                .textSelection(.enabled)
                            Spacer()
                            if let selected = selectedAnswer {
                                if selected == index {
                                    Image(systemName: selected == quiz.correctAnswer ? "checkmark.circle.fill" : "x.circle.fill")
                                        .foregroundColor(selected == quiz.correctAnswer ? .green : .red)
                                }
                            }
                        }
                        .padding()
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(Color(.systemGray6))
                                .overlay(
                                    RoundedRectangle(cornerRadius: 12)
                                        .stroke(
                                            selectedAnswer == index ? 
                                            (index == quiz.correctAnswer ? Color.green : Color.red) :
                                            Color.clear,
                                            lineWidth: 2
                                        )
                                )
                        )
                    }
                    .buttonStyle(.plain)
                    .disabled(selectedAnswer != nil)
                }
                
                // Explanation (shows after answering)
                if let selected = selectedAnswer {
                    VStack(alignment: .leading, spacing: 8) {
                        HStack {
                            Image(systemName: selected == quiz.correctAnswer ? "checkmark.circle.fill" : "x.circle.fill")
                                .foregroundColor(selected == quiz.correctAnswer ? .green : .red)
                            Text(selected == quiz.correctAnswer ? "Correct!" : "Incorrect")
                                .font(.headline)
                                .foregroundColor(selected == quiz.correctAnswer ? .green : .red)
                        }
                        
                        Text(quiz.explanation)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding(.top, 4)
                            .fixedSize(horizontal: false, vertical: true)
                            .textSelection(.enabled)
                    }
                    .padding()
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(Color(.systemGray6))
                    )
                    .transition(.opacity)
                }
            }
            .padding()
        }
    }
} 