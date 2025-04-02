// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "TodakuReader",
    platforms: [
        .iOS(.v16)
    ],
    products: [
        .library(
            name: "TodakuReader",
            targets: ["TodakuReader"]),
    ],
    dependencies: [
        .package(url: "https://github.com/supabase-community/supabase-swift.git", from: "0.3.0"),
        .package(url: "https://github.com/dylanshine/openai-kit.git", from: "1.0.0")
    ],
    targets: [
        .target(
            name: "TodakuReader",
            dependencies: [
                .product(name: "Supabase", package: "supabase-swift"),
                .product(name: "OpenAIKit", package: "openai-kit")
            ],
            path: "Sources"
        ),
        .testTarget(
            name: "TodakuReaderTests",
            dependencies: ["TodakuReader"],
            path: "Tests"
        ),
    ]
) 