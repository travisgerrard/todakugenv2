import Foundation

struct UserPreferences: Codable, Equatable {
    var wanikaniLevel: Int
    var genkiChapter: Int
    var tadokuLevel: String
    var userId: String?
    
    // Default preferences for new users
    static let defaultPreferences = UserPreferences(
        wanikaniLevel: 1,
        genkiChapter: 1,
        tadokuLevel: "1",
        userId: nil
    )
    
    enum CodingKeys: String, CodingKey {
        case wanikaniLevel = "wanikani_level"
        case genkiChapter = "genki_chapter"
        case tadokuLevel = "tadoku_level"
        case userId = "id"
    }
    
    init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        
        wanikaniLevel = try container.decodeIfPresent(Int.self, forKey: .wanikaniLevel) ?? 1
        genkiChapter = try container.decodeIfPresent(Int.self, forKey: .genkiChapter) ?? 1
        
        // Handle nullable String for tadoku_level
        if let tadokuLevelValue = try container.decodeIfPresent(String.self, forKey: .tadokuLevel) {
            tadokuLevel = tadokuLevelValue
        } else {
            tadokuLevel = "1" // Default value if null
        }
        
        userId = try container.decodeIfPresent(String.self, forKey: .userId)
    }
    
    init(wanikaniLevel: Int, genkiChapter: Int, tadokuLevel: String, userId: String?) {
        self.wanikaniLevel = wanikaniLevel
        self.genkiChapter = genkiChapter
        self.tadokuLevel = tadokuLevel
        self.userId = userId
    }
} 