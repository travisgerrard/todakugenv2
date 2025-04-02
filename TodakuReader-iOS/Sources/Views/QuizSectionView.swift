import SwiftUI

struct QuizSectionView: View {
    let quizzes: [Quiz]
    @State private var selectedAnswers: [String: Int] = [:]
    @State private var showAnswers = false
    @State private var selectedQuizType: QuizType = .vocabulary
    
    private var quizzesByType: [QuizType: [Quiz]] {
        Dictionary(grouping: quizzes) { $0.type }
    }
    
    var body: some View {
        VStack(spacing: 16) {
            // Quiz type picker
            Picker("Quiz Type", selection: $selectedQuizType) {
                Text("Vocabulary").tag(QuizType.vocabulary)
                Text("Grammar").tag(QuizType.grammar)
                Text("Comprehension").tag(QuizType.comprehension)
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            
            if let currentQuizzes = quizzesByType[selectedQuizType] {
                ScrollView {
                    VStack(spacing: 24) {
                        ForEach(currentQuizzes) { quiz in
                            QuizCard(
                                quiz: quiz,
                                selectedAnswer: selectedAnswers[quiz.id],
                                showAnswer: showAnswers,
                                onSelectAnswer: { answer in
                                    selectedAnswers[quiz.id] = answer
                                }
                            )
                        }
                    }
                    .padding()
                }
                
                // Check answers button
                Button(action: { showAnswers.toggle() }) {
                    Text(showAnswers ? "Hide Answers" : "Check Answers")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.blue)
                        .foregroundColor(.white)
                        .cornerRadius(10)
                }
                .padding(.horizontal)
                .padding(.bottom)
            } else {
                Text("No quizzes available for this type")
                    .foregroundColor(.secondary)
                    .padding()
            }
        }
    }
}

struct QuizCard: View {
    let quiz: Quiz
    let selectedAnswer: Int?
    let showAnswer: Bool
    let onSelectAnswer: (Int) -> Void
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Question
            Text(quiz.question)
                .font(.headline)
                .padding(.bottom, 4)
            
            // Options
            ForEach(Array(quiz.options.enumerated()), id: \.offset) { index, option in
                Button(action: { onSelectAnswer(index) }) {
                    HStack {
                        Text(option)
                            .foregroundColor(.primary)
                        Spacer()
                        if selectedAnswer == index {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(showAnswer ? (index == quiz.correctAnswer ? .green : .red) : .blue)
                        }
                    }
                }
                .padding()
                .background(
                    RoundedRectangle(cornerRadius: 8)
                        .fill(selectedAnswer == index ? Color(.systemGray6) : Color(.systemBackground))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
            }
            
            // Explanation (shown when answer is checked)
            if showAnswer {
                Text(quiz.explanation)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .padding(.top, 8)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(12)
        .shadow(radius: 2)
    }
}

#Preview {
    QuizSectionView(quizzes: [
        Quiz(
            id: "1",
            type: .vocabulary,
            question: "What does '食べる' mean?",
            options: ["to eat", "to drink", "to sleep", "to walk"],
            correctAnswer: 0,
            explanation: "'食べる' (たべる) means 'to eat' in Japanese."
        ),
        Quiz(
            id: "2",
            type: .grammar,
            question: "When do you use 'てください'?",
            options: [
                "To make a polite request",
                "To express past tense",
                "To show ability",
                "To express desire"
            ],
            correctAnswer: 0,
            explanation: "'てください' is used to make polite requests in Japanese."
        )
    ])
} 