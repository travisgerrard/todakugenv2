import Foundation
import Supabase

actor SupabaseService {
    static let shared = SupabaseService()
    
    private let client: SupabaseClient
    
    private init() {
        Config.validate()
        
        self.client = SupabaseClient(
            supabaseURL: URL(string: Config.supabaseURL)!,
            supabaseKey: Config.supabaseKey
        )
    }
    
    func fetchStories() async throws -> [Story] {
        let query = client.database
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
            .order("created_at", ascending: false)
        
        let response: [SupabaseStory] = try await query.execute().value
        return response.map { $0.toDomainModel() }
    }
    
    func fetchStory(id: String) async throws -> Story {
        let query = client.database
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
        
        let response: SupabaseStory = try await query.execute().value
        return response.toDomainModel()
    }
    
    func upvoteStory(id: String) async throws {
        try await client.database
            .from("stories")
            .update(["upvotes": "upvotes + 1"])
            .eq("id", value: id)
            .execute()
    }
}

// Supabase response models
private struct SupabaseStory: Codable {
    let id: String
    let created_at: Date
    let user_id: String
    let title: String
    let content_jp: String
    let content_en: String
    let wanikani_level: Int
    let genki_chapter: Int
    let tadoku_level: Int
    let topic: String
    let upvotes: Int
    let vocabulary: [SupabaseVocabularyItem]
    let grammar: [SupabaseGrammarPoint]
    let quizzes: [SupabaseQuiz]
    
    func toDomainModel() -> Story {
        Story(
            id: id,
            createdAt: created_at,
            userId: user_id,
            title: title,
            contentJp: content_jp,
            contentEn: content_en,
            wanikaniLevel: wanikani_level,
            genkiChapter: genki_chapter,
            tadokuLevel: tadoku_level,
            topic: topic,
            upvotes: upvotes,
            vocabulary: vocabulary.map { $0.toDomainModel() },
            grammar: grammar.map { $0.toDomainModel() },
            quizzes: quizzes.map { $0.toDomainModel() }
        )
    }
}

private struct SupabaseVocabularyItem: Codable {
    let id: String
    let word: String
    let reading: String
    let meaning: String
    let example: String
    let example_translation: String
    
    func toDomainModel() -> VocabularyItem {
        VocabularyItem(
            id: id,
            word: word,
            reading: reading,
            meaning: meaning,
            example: example,
            example_translation: example_translation
        )
    }
}

private struct SupabaseGrammarPoint: Codable {
    let id: String
    let pattern: String
    let explanation: String
    let example: String
    let example_translation: String
    
    func toDomainModel() -> GrammarPoint {
        GrammarPoint(
            id: id,
            pattern: pattern,
            explanation: explanation,
            example: example,
            example_translation: example_translation
        )
    }
}

private struct SupabaseQuiz: Codable {
    let id: String
    let type: String
    let question: String
    let options: [String]
    let correct_answer: Int
    let explanation: String
    
    func toDomainModel() -> Quiz {
        Quiz(
            id: id,
            type: QuizType(rawValue: type) ?? .vocabulary,
            question: question,
            options: options,
            correctAnswer: correct_answer,
            explanation: explanation
        )
    }
} 