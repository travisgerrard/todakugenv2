import SwiftUI

struct StoryDetailView: View {
    // Support both direct story object and story ID
    var story: Story?
    var storyId: String?
    
    @StateObject private var viewModel = StoryViewModel(supabase: SupabaseClient.shared)
    @State private var loadedStory: Story?
    @State private var isLoading = false
    @State private var error: Error?
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                if isLoading {
                    VStack {
                        ProgressView("Loading story...")
                            .padding()
                        Text("This may take a moment...")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
                    .padding(.vertical, 100)
                } else if let displayStory = story ?? loadedStory {
                    // Story title
                    Text(displayStory.title)
                        .font(.largeTitle)
                        .fontWeight(.bold)
                    
                    // Story metadata
                    HStack {
                        if let wanikaniLevel = displayStory.wanikaniLevel {
                            Label("\(wanikaniLevel)", systemImage: "brain")
                                .foregroundColor(.purple)
                                .padding(.trailing, 8)
                        }
                        
                        if let genkiChapter = displayStory.genkiChapter {
                            Label("\(genkiChapter)", systemImage: "book")
                                .foregroundColor(.blue)
                                .padding(.trailing, 8)
                        }
                        
                        if let tadokuLevel = displayStory.tadokuLevel {
                            Label("\(tadokuLevel)", systemImage: "textformat")
                                .foregroundColor(.green)
                                .padding(.trailing, 8)
                        }
                        
                        if let topic = displayStory.topic {
                            Label(topic, systemImage: "tag")
                                .foregroundColor(.orange)
                        }
                    }
                    .font(.caption)
                    .padding(.bottom, 4)
                    
                    // Japanese content
                    Text("Japanese")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text(displayStory.contentJp)
                        .font(.body)
                        .lineSpacing(5)
                    
                    Divider()
                    
                    // English content
                    Text("English Translation")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    Text(displayStory.contentEn)
                        .font(.body)
                        .foregroundColor(.secondary)
                        .lineSpacing(5)
                } else if let error = error {
                    // Error view
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
                } else {
                    // No story found
                    ContentUnavailableView(
                        "Story Not Found",
                        systemImage: "doc.text.magnifyingglass",
                        description: Text("The story you requested could not be found.")
                    )
                    .padding(.vertical, 50)
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
    
    private func loadStoryById() {
        guard let id = storyId else { return }
        
        isLoading = true
        error = nil
        
        Task {
            do {
                await viewModel.fetchStories()
                
                // Find the specific story by ID
                if let story = viewModel.stories.first(where: { $0.id == id }) {
                    await MainActor.run {
                        self.loadedStory = story
                        self.isLoading = false
                    }
                } else {
                    await MainActor.run {
                        self.isLoading = false
                    }
                }
            } catch {
                await MainActor.run {
                    self.error = error
                    self.isLoading = false
                }
            }
        }
    }
}

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
            .tabViewStyle(.page(indexDisplayMode: .never))  // Hide the default page dots
            .frame(minHeight: 500) // Increase minimum height
            .onChange(of: selectedQuizIndex) { newValue in
                // Keep the index within bounds
                if newValue < 0 {
                    selectedQuizIndex = 0
                } else if newValue >= quizzes.count {
                    selectedQuizIndex = quizzes.count - 1
                }
            }
            
            // Navigation and progress
            HStack(spacing: 16) {
                // Previous button
                Button(action: {
                    withAnimation {
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
                    withAnimation {
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
        .animation(.easeOut, value: selectedAnswer)
    }
} 