//
//  ContentView.swift
//  TodakuReader-iOS
//
//  Created by Travis Gerrard on 3/26/25.
//

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
