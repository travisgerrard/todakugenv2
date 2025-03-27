import SwiftUI

struct StoryDetailView: View {
    let story: Story
    @State private var showTranslation = false
    @State private var selectedQuizIndex = 0
    @State private var selectedAnswers: [Int?]
    
    init(story: Story) {
        self.story = story
        // Initialize selectedAnswers here instead of onAppear
        _selectedAnswers = State(initialValue: Array(repeating: nil, count: story.quizzes.count))
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 20) {
                // Story content section
                VStack(alignment: .leading, spacing: 16) {
                    Text(story.title)
                        .font(.title)
                        .fontWeight(.bold)
                        .textSelection(.enabled)
                    
                    Text(story.contentJp)
                        .font(.body)
                        .textSelection(.enabled)
                    
                    if showTranslation {
                        Text(story.contentEn)
                            .font(.body)
                            .foregroundColor(.secondary)
                            .padding(.top, 8)
                            .textSelection(.enabled)
                    }
                    
                    Button(action: { showTranslation.toggle() }) {
                        Label(showTranslation ? "Hide Translation" : "Show Translation",
                              systemImage: showTranslation ? "eye.slash" : "eye")
                    }
                }
                .padding()
                .background(Color(.systemBackground))
                .cornerRadius(12)
                .shadow(radius: 2)
                
                // Vocabulary section
                if !story.vocabulary.isEmpty {
                    VocabularySection(items: story.vocabulary)
                }
                
                // Grammar section
                if !story.grammar.isEmpty {
                    GrammarSection(items: story.grammar)
                }
                
                // Quiz section
                if !story.quizzes.isEmpty {
                    QuizSection(quizzes: story.quizzes,
                              selectedQuizIndex: $selectedQuizIndex,
                              selectedAnswers: $selectedAnswers)
                }
            }
            .padding()
        }
        .navigationBarTitleDisplayMode(.inline)
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