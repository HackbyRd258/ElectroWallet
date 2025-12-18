//
//  SettingsView.swift
//  ElectroWallet
//
//  Basic settings
//

import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var walletManager: WalletManager
    @State private var showDeleteAlert = false
    @State private var infoMessage: String?
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Wallet Information")) {
                    if let wallet = walletManager.currentWallet {
                        HStack {
                            Text("Label")
                            Spacer()
                            Text(wallet.label)
                                .foregroundColor(.secondary)
                        }
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Address")
                            Text(wallet.address)
                                .font(.system(.caption, design: .monospaced))
                                .foregroundColor(.secondary)
                                .textSelection(.enabled)
                        }
                        
                        HStack {
                            Text("Balance")
                            Spacer()
                            VStack(alignment: .trailing, spacing: 2) {
                                Text("\(wallet.balanceInBTC, specifier: "%.8f") BTC")
                                    .foregroundColor(.secondary)
                                Text("\(Int64(wallet.balanceInBTC * 100_000_000)) sats")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                    } else {
                        Text("No wallet loaded")
                    }
                }
                
                Section(header: Text("About")) {
                    HStack {
                        Text("Network")
                        Spacer()
                        Text("Bitcoin Testnet")
                            .foregroundColor(.secondary)
                    }
                    
                    Link(destination: URL(string: "https://testnet-faucet.mempool.co/")!) {
                        HStack {
                            Label("Get Test Coins", systemImage: "link")
                            Spacer()
                            Image(systemName: "arrow.up.right")
                                .font(.caption)
                                .foregroundColor(.secondary)
                        }
                    }
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Important")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        Text("This is a testnet wallet. Never use it with real Bitcoin!")
                            .font(.caption)
                            .foregroundColor(.orange)
                    }
                }
                
                if let message = infoMessage {
                    Section {
                        Text(message)
                            .foregroundColor(.secondary)
                    }
                }
                
                Section(header: Text("Danger Zone")) {
                    Button(role: .destructive) {
                        showDeleteAlert = true
                    } label: {
                        Label("Delete Wallet", systemImage: "trash")
                    }
                }
            }
            .navigationTitle("Settings")
            .alert("Delete Wallet?", isPresented: $showDeleteAlert) {
                Button("Delete", role: .destructive) {
                    Task { await deleteWallet() }
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This will permanently remove your wallet from this device. Make sure you have backed up your recovery phrase!")
            }
        }
    }
    
    private func deleteWallet() async {
        do {
            try await walletManager.deleteWallet()
            infoMessage = "Wallet deleted"
        } catch {
            infoMessage = error.localizedDescription
        }
    }
}
