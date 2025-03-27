import SwiftUI

struct VocabularySectionView: View {
    let vocabulary: [VocabularyItem]
    @State private var expandedItems = Set<String>()
    
    var body: some View {
        List(vocabulary) { item in
            VStack(alignment: .leading, spacing: 12) {
                // Word and reading
                HStack {
                    Text(item.word)
                        .font(.headline)
                    Text(item.reading)
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                // Meaning
                Text(item.meaning)
                    .font(.body)
                
                // Example section
                Button(action: { toggleExpanded(item.id) }) {
                    HStack {
                        Text("Example")
                            .font(.subheadline)
                        Spacer()
                        Image(systemName: isExpanded(item.id) ? "chevron.up" : "chevron.down")
                    }
                    .padding(.vertical, 4)
                }
                
                if isExpanded(item.id) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(item.example)
                            .font(.body)
                        Text(item.example_translation)
                            .font(.body)
                            .foregroundColor(.secondary)
                    }
                    .padding(.leading)
                }
            }
            .padding(.vertical, 8)
        }
    }
    
    private func toggleExpanded(_ id: String) {
        if expandedItems.contains(id) {
            expandedItems.remove(id)
        } else {
            expandedItems.insert(id)
        }
    }
    
    private func isExpanded(_ id: String) -> Bool {
        expandedItems.contains(id)
    }
}

#Preview {
    VocabularySectionView(vocabulary: [
        VocabularyItem(
            id: "1",
            word: "食べる",
            reading: "たべる",
            meaning: "to eat",
            example: "私は寿司を食べます。",
            example_translation: "I eat sushi."
        ),
        VocabularyItem(
            id: "2",
            word: "飲む",
            reading: "のむ",
            meaning: "to drink",
            example: "水を飲みます。",
            example_translation: "I drink water."
        )
    ])
} 