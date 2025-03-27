import SwiftUI

struct ContentView: View {
    var body: some View {
        NavigationView {
            VStack {
                Text("TodakuReader")
                    .font(.title)
                Text("Connected to Supabase")
                    .foregroundColor(.green)
            }
            .navigationTitle("Home")
        }
    }
}

#Preview {
    ContentView()
} 