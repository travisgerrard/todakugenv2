import SwiftUI

struct StoryReaderView: View {
    let story: Story
    @State private var showTranslation = false
    @State private var selectedTab = 0
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                // Story content
                VStack(alignment: .leading, spacing: 16) {
                    Text("Japanese Text")
                        .font(.headline)
                    Text(story.contentJp)
                        .font(.body)
                }
                
                // Translation section
                VStack(alignment: .leading, spacing: 16) {
                    Button(action: { showTranslation.toggle() }) {
                        HStack {
                            Text("English Translation")
                            Spacer()
                            Image(systemName: showTranslation ? "chevron.up" : "chevron.down")
                        }
                        .padding()
                        .background(Color(.systemBackground))
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                        )
                    }
                    
                    if showTranslation {
                        Text(story.contentEn)
                            .font(.body)
                            .padding()
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                    }
                }
                
                // Sections
                TabView(selection: $selectedTab) {
                    VocabularySectionView(vocabulary: story.vocabulary)
                        .tabItem {
                            Label("Vocabulary", systemImage: "textbook")
                        }
                        .tag(0)
                    
                    GrammarSectionView(grammar: story.grammar)
                        .tabItem {
                            Label("Grammar", systemImage: "text.book.closed")
                        }
                        .tag(1)
                    
                    QuizSectionView(quizzes: story.quizzes)
                        .tabItem {
                            Label("Quizzes", systemImage: "checkmark.circle")
                        }
                        .tag(2)
                }
                .frame(minHeight: 400)
            }
            .padding()
        }
        .navigationTitle(story.title)
    }
}

#Preview {
    StoryReaderView(story: Story(
        id: "1",
        createdAt: Date(),
        userId: "1",
        title: "Sample Story",
        contentJp: "日本語のテキスト",
        contentEn: "Japanese text",
        wanikaniLevel: 1,
        genkiChapter: 1,
        tadokuLevel: 1,
        topic: "Daily Life",
        upvotes: 0,
        vocabulary: [],
        grammar: [],
        quizzes: []
    ))
} 