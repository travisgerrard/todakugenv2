import Foundation

struct Story: Codable, Identifiable {
    let id: String
    let createdAt: Date
    let userId: String
    let title: String
    let contentJp: String
    let contentEn: String
    let wanikaniLevel: Int
    let genkiChapter: Int
    let tadokuLevel: Int
    let topic: String
    let upvotes: Int
    let vocabulary: [VocabularyItem]
    let grammar: [GrammarPoint]
    let quizzes: [Quiz]
    
    enum CodingKeys: String, CodingKey {
        case id
        case createdAt = "created_at"
        case userId = "user_id"
        case title
        case contentJp = "content_jp"
        case contentEn = "content_en"
        case wanikaniLevel = "wanikani_level"
        case genkiChapter = "genki_chapter"
        case tadokuLevel = "tadoku_level"
        case topic
        case upvotes
        case vocabulary
        case grammar
        case quizzes
    }
}

struct VocabularyItem: Codable, Identifiable {
    var id: String { word }
    let word: String
    let reading: String
    let meaning: String
    let example: String
    let exampleTranslation: String
    
    enum CodingKeys: String, CodingKey {
        case word
        case reading
        case meaning
        case example
        case exampleTranslation = "example_translation"
    }
}

struct GrammarPoint: Codable, Identifiable {
    var id: String { pattern }
    let pattern: String
    let explanation: String
    let example: String
    let exampleTranslation: String
    
    enum CodingKeys: String, CodingKey {
        case pattern
        case explanation
        case example
        case exampleTranslation = "example_translation"
    }
}

struct Quiz: Codable, Identifiable {
    var id: String { "\(type)-\(question)" }
    let type: QuizType
    let question: String
    let options: [String]
    let correctAnswer: Int
    let explanation: String
    let relatedItem: String?
    
    enum CodingKeys: String, CodingKey {
        case type
        case question
        case options
        case correctAnswer = "correct_answer"
        case explanation
        case relatedItem = "related_item"
    }
}

enum QuizType: String, Codable {
    case vocabulary
    case grammar
    case comprehension
} 