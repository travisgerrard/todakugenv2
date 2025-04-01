import Foundation

struct Story: Identifiable, Codable {
    let id: String
    let createdAt: Date
    let userId: String?
    let title: String
    let contentJp: String
    let contentEn: String
    let wanikaniLevel: Int?
    let genkiChapter: Int?
    let tadokuLevel: Int?
    let topic: String?
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
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        id = try container.decode(String.self, forKey: .id)
        createdAt = try container.decode(Date.self, forKey: .createdAt)
        userId = try container.decodeIfPresent(String.self, forKey: .userId)
        title = try container.decode(String.self, forKey: .title)
        contentJp = try container.decode(String.self, forKey: .contentJp)
        contentEn = try container.decode(String.self, forKey: .contentEn)
        wanikaniLevel = try container.decodeIfPresent(Int.self, forKey: .wanikaniLevel)
        genkiChapter = try container.decodeIfPresent(Int.self, forKey: .genkiChapter)
        tadokuLevel = try container.decodeIfPresent(Int.self, forKey: .tadokuLevel)
        topic = try container.decodeIfPresent(String.self, forKey: .topic)
        upvotes = try container.decode(Int.self, forKey: .upvotes)
        
        // Handle JSONB fields that might come as strings
        if let vocabularyString = try? container.decode(String.self, forKey: .vocabulary),
           let vocabularyData = vocabularyString.data(using: .utf8),
           let vocabularyArray = try? JSONDecoder().decode([VocabularyItem].self, from: vocabularyData) {
            vocabulary = vocabularyArray
        } else {
            vocabulary = (try? container.decode([VocabularyItem].self, forKey: .vocabulary)) ?? []
        }
        
        if let grammarString = try? container.decode(String.self, forKey: .grammar),
           let grammarData = grammarString.data(using: .utf8),
           let grammarArray = try? JSONDecoder().decode([GrammarPoint].self, from: grammarData) {
            grammar = grammarArray
        } else {
            grammar = (try? container.decode([GrammarPoint].self, forKey: .grammar)) ?? []
        }
        
        if let quizzesString = try? container.decode(String.self, forKey: .quizzes),
           let quizzesData = quizzesString.data(using: .utf8),
           let quizzesArray = try? JSONDecoder().decode([Quiz].self, from: quizzesData) {
            quizzes = quizzesArray
        } else {
            quizzes = (try? container.decode([Quiz].self, forKey: .quizzes)) ?? []
        }
    }
    
    init(id: String, createdAt: Date, userId: String?, title: String, contentJp: String, contentEn: String,
         wanikaniLevel: Int?, genkiChapter: Int?, tadokuLevel: Int?, topic: String?, upvotes: Int,
         vocabulary: [VocabularyItem], grammar: [GrammarPoint], quizzes: [Quiz]) {
        self.id = id
        self.createdAt = createdAt
        self.userId = userId
        self.title = title
        self.contentJp = contentJp
        self.contentEn = contentEn
        self.wanikaniLevel = wanikaniLevel
        self.genkiChapter = genkiChapter
        self.tadokuLevel = tadokuLevel
        self.topic = topic
        self.upvotes = upvotes
        self.vocabulary = vocabulary
        self.grammar = grammar
        self.quizzes = quizzes
    }
}

struct VocabularyItem: Identifiable, Codable {
    var id: String { word }  // Using word as the ID since it's unique in the context
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
        case exampleTranslation
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        word = try container.decode(String.self, forKey: .word)
        reading = try container.decode(String.self, forKey: .reading)
        meaning = try container.decode(String.self, forKey: .meaning)
        example = try container.decode(String.self, forKey: .example)
        
        // Try both camelCase and snake_case for exampleTranslation
        if let translation = try? container.decode(String.self, forKey: .exampleTranslation) {
            exampleTranslation = translation
        } else {
            let snakeCaseContainer = try decoder.container(keyedBy: SnakeCaseCodingKeys.self)
            exampleTranslation = try snakeCaseContainer.decode(String.self, forKey: .exampleTranslation)
        }
    }
    
    private enum SnakeCaseCodingKeys: String, CodingKey {
        case exampleTranslation = "example_translation"
    }
}

struct GrammarPoint: Identifiable, Codable {
    var id: String { pattern }  // Using pattern as the ID since it's unique in the context
    let pattern: String
    let explanation: String
    let example: String
    let exampleTranslation: String
    
    enum CodingKeys: String, CodingKey {
        case pattern
        case explanation
        case example
        case exampleTranslation
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        pattern = try container.decode(String.self, forKey: .pattern)
        explanation = try container.decode(String.self, forKey: .explanation)
        example = try container.decode(String.self, forKey: .example)
        
        // Try both camelCase and snake_case for exampleTranslation
        if let translation = try? container.decode(String.self, forKey: .exampleTranslation) {
            exampleTranslation = translation
        } else {
            let snakeCaseContainer = try decoder.container(keyedBy: SnakeCaseCodingKeys.self)
            exampleTranslation = try snakeCaseContainer.decode(String.self, forKey: .exampleTranslation)
        }
    }
    
    private enum SnakeCaseCodingKeys: String, CodingKey {
        case exampleTranslation = "example_translation"
    }
}

struct Quiz: Identifiable, Codable {
    var id: String { question }  // Using question as the ID since it should be unique
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
        case correctAnswer
        case explanation
        case relatedItem
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        type = try container.decode(QuizType.self, forKey: .type)
        question = try container.decode(String.self, forKey: .question)
        options = try container.decode([String].self, forKey: .options)
        explanation = try container.decode(String.self, forKey: .explanation)
        relatedItem = try container.decodeIfPresent(String.self, forKey: .relatedItem)
        
        // Try both camelCase and snake_case for correctAnswer
        if let answer = try? container.decode(Int.self, forKey: .correctAnswer) {
            correctAnswer = answer
        } else {
            let snakeCaseContainer = try decoder.container(keyedBy: SnakeCaseCodingKeys.self)
            correctAnswer = try snakeCaseContainer.decode(Int.self, forKey: .correctAnswer)
        }
    }
    
    private enum SnakeCaseCodingKeys: String, CodingKey {
        case correctAnswer = "correct_answer"
        case relatedItem = "related_item"
    }
}

enum QuizType: String, Codable {
    case vocabulary
    case grammar
    case comprehension
} 