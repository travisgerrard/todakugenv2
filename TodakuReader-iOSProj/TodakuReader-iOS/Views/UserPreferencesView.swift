import SwiftUI

struct UserPreferencesView: View {
    @StateObject private var viewModel: UserPreferencesViewModel
    @EnvironmentObject var authViewModel: AuthViewModel
    @Environment(\.dismiss) var dismiss
    
    // Common UI elements
    let minLevel = 1
    let maxWanikaniLevel = 60
    let maxGenkiChapter = 23
    let maxTadokuLevel = 10
    
    // Track current view state
    @State private var viewState: ViewState = .initial
    
    enum ViewState {
        case initial
        case loading
        case loaded
        case error
        case success
    }
    
    init() {
        let supabase = SupabaseClient.shared
        _viewModel = StateObject(wrappedValue: UserPreferencesViewModel(supabase: supabase))
    }
    
    var body: some View {
        NavigationView {
            contentView
                .navigationTitle("User Preferences")
                .toolbar {
                    ToolbarItem(placement: .navigationBarTrailing) {
                        Button("Close") { dismiss() }
                    }
                }
                .onAppear {
                    loadData()
                }
        }
    }
    
    // Extract out each view to minimize complexity
    private var contentView: some View {
        Group {
            if viewModel.isLoading {
                loadingView
            } else {
                mainContentView
            }
        }
    }
    
    private var loadingView: some View {
        ProgressView()
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Color.black.opacity(0.2))
    }
    
    private var mainContentView: some View {
        ScrollView {
            VStack(spacing: 20) {
                userEmailView
                levelsView
                saveButtonView
                messagesView
                Spacer(minLength: 20)
            }
            .padding()
        }
    }
    
    private var userEmailView: some View {
        VStack(alignment: .center, spacing: 10) {
            if let userEmail = authViewModel.user?.email {
                Text("Logged in as:")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                Text(userEmail)
                    .font(.headline)
                    .foregroundColor(.primary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private var levelsView: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Learning Levels")
                .font(.headline)
                .padding(.bottom, 4)
            
            waniKaniLevelView
            genkiChapterView
            tadokuLevelView
        }
        .padding()
        .background(Color(.systemBackground))
        .cornerRadius(10)
        .shadow(color: Color.black.opacity(0.1), radius: 5, x: 0, y: 2)
    }
    
    private var waniKaniLevelView: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("WaniKani Level:")
                Spacer()
                Text("\(viewModel.preferences.wanikaniLevel)")
                    .foregroundColor(.secondary)
            }
            
            Slider(
                value: wkBinding,
                in: Double(minLevel)...Double(maxWanikaniLevel),
                step: 1
            )
            .accentColor(.purple)
        }
    }
    
    private var wkBinding: Binding<Double> {
        Binding<Double>(
            get: { Double(viewModel.preferences.wanikaniLevel) },
            set: { viewModel.updateWanikaniLevel(Int($0)) }
        )
    }
    
    private var genkiChapterView: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Genki Chapter:")
                Spacer()
                Text("\(viewModel.preferences.genkiChapter)")
                    .foregroundColor(.secondary)
            }
            
            Slider(
                value: genkiBinding,
                in: Double(minLevel)...Double(maxGenkiChapter),
                step: 1
            )
            .accentColor(.blue)
        }
    }
    
    private var genkiBinding: Binding<Double> {
        Binding<Double>(
            get: { Double(viewModel.preferences.genkiChapter) },
            set: { viewModel.updateGenkiChapter(Int($0)) }
        )
    }
    
    private var tadokuLevelView: some View {
        VStack(alignment: .leading) {
            HStack {
                Text("Tadoku Level:")
                Spacer()
                Text("\(viewModel.preferences.tadokuLevel)")
                    .foregroundColor(.secondary)
            }
            
            Slider(
                value: tadokuBinding,
                in: Double(minLevel)...Double(maxTadokuLevel),
                step: 1
            )
            .accentColor(.green)
        }
    }
    
    private var tadokuBinding: Binding<Double> {
        Binding<Double>(
            get: { 
                // Convert String to Double
                Double(viewModel.preferences.tadokuLevel) ?? Double(minLevel)
            },
            set: { 
                // Convert Double to String
                viewModel.updateTadokuLevel(String(Int($0)))
            }
        )
    }
    
    private var saveButtonView: some View {
        Button(action: savePreferences) {
            if viewModel.isSaving {
                HStack {
                    Spacer()
                    ProgressView()
                    Spacer()
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor.opacity(0.2))
                .cornerRadius(10)
            } else {
                HStack {
                    Spacer()
                    Text("Save Preferences")
                        .fontWeight(.semibold)
                        .foregroundColor(.white)
                    Spacer()
                }
                .frame(maxWidth: .infinity)
                .padding()
                .background(Color.accentColor)
                .cornerRadius(10)
            }
        }
        .disabled(viewModel.isSaving || authViewModel.user?.id == nil)
    }
    
    private var messagesView: some View {
        VStack(spacing: 10) {
            if let error = viewModel.error {
                errorView(message: error.localizedDescription)
            }
            
            if viewModel.saveSuccess {
                successView
            }
        }
    }
    
    private func errorView(message: String) -> some View {
        HStack {
            Image(systemName: "exclamationmark.triangle")
                .foregroundColor(.red)
            Text(message)
                .foregroundColor(.red)
                .font(.footnote)
        }
        .padding()
        .background(Color.red.opacity(0.1))
        .cornerRadius(10)
    }
    
    private var successView: some View {
        HStack {
            Image(systemName: "checkmark.circle")
                .foregroundColor(.green)
            Text("Your preferences have been saved.")
                .foregroundColor(.green)
                .font(.footnote)
        }
        .padding()
        .background(Color.green.opacity(0.1))
        .cornerRadius(10)
    }
    
    // Load data logic
    private func loadData() {
        guard let userId = authViewModel.user?.id else { 
            print("⚠️ Cannot load preferences: No user ID available")
            return 
        }
        
        // Get the raw string ID instead of converting UUID to String
        // The web app likely uses the ID directly from Supabase auth
        let userIdString = userId.description
        print("🔍 Loading preferences for user: \(userIdString), email: \(authViewModel.user?.email ?? "unknown")")
        
        Task {
            // Show loading state
            await MainActor.run {
                viewModel.isLoading = true
            }
            
            // Load preferences
            await viewModel.loadPreferences(for: userIdString)
            
            // Force UI refresh after loading - no need for objectWillChange in a View
            await MainActor.run {
                print("🔄 Refreshing UI after loading preferences: WK=\(viewModel.preferences.wanikaniLevel), Genki=\(viewModel.preferences.genkiChapter), Tadoku=\(viewModel.preferences.tadokuLevel)")
                // The UI will automatically update when the viewModel's published properties change
                // No need for manual refresh
            }
        }
    }
    
    // Save preferences logic
    private func savePreferences() {
        guard let userId = authViewModel.user?.id else { return }
        
        // Get the raw ID to match the web app
        let userIdString = userId.description
        
        print("💾 Saving preferences for user: \(userIdString)")
        Task {
            await viewModel.savePreferences(userId: userIdString)
            if viewModel.saveSuccess {
                dismiss()
            }
        }
    }
} 