import SwiftUI

struct GrammarSectionView: View {
    let grammar: [GrammarPoint]
    @State private var expandedItems = Set<String>()
    
    var body: some View {
        List(grammar) { point in
            VStack(alignment: .leading, spacing: 12) {
                // Pattern
                Text(point.pattern)
                    .font(.headline)
                
                // Explanation
                Text(point.explanation)
                    .font(.body)
                
                // Example section
                Button(action: { toggleExpanded(point.id) }) {
                    HStack {
                        Text("Example")
                            .font(.subheadline)
                        Spacer()
                        Image(systemName: isExpanded(point.id) ? "chevron.up" : "chevron.down")
                    }
                    .padding(.vertical, 4)
                }
                
                if isExpanded(point.id) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(point.example)
                            .font(.body)
                        Text(point.example_translation)
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
    GrammarSectionView(grammar: [
        GrammarPoint(
            id: "1",
            pattern: "〜てください",
            explanation: "Used to make polite requests",
            example: "ここに名前を書いてください。",
            example_translation: "Please write your name here."
        ),
        GrammarPoint(
            id: "2",
            pattern: "〜ないでください",
            explanation: "Used to make polite negative requests (please don't...)",
            example: "ここで写真を撮らないでください。",
            example_translation: "Please don't take pictures here."
        )
    ])
} 