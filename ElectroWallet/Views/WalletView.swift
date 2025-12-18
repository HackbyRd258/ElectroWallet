//
//  WalletView.swift
//  ElectroWallet
//
//  Displays balance and address
//

import SwiftUI

struct WalletView: View {
    @EnvironmentObject var walletManager: WalletManager
    @State private var showCopiedAlert = false
    
    var body: some View {
        VStack(spacing: 24) {
            if let wallet = walletManager.currentWallet {
                VStack(spacing: 16) {
                    Text("Your Balance")
                        .font(.headline)
                        .foregroundColor(.secondary)
                    
                    VStack(spacing: 4) {
                        Text("\(wallet.balanceInBTC, specifier: "%.8f") BTC")
                            .font(.system(.title, design: .rounded))
                            .fontWeight(.bold)
                        
                        Text("\(Int64(wallet.balanceInBTC * 100_000_000)) satoshis")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    .padding()
                    .frame(maxWidth: .infinity)
                    .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 16))
                    
                    VStack(spacing: 8) {
                        Text("Wallet Address")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        HStack {
                            Text(wallet.address)
                                .font(.system(.caption, design: .monospaced))
                                .lineLimit(1)
                                .truncationMode(.middle)
                            
                            Button {
                                copyToClipboard(wallet.address)
                            } label: {
                                Image(systemName: "doc.on.doc")
                                    .font(.caption)
                            }
                        }
                    }
                }
                
                VStack(spacing: 10) {
                    Button {
                        Task { await walletManager.refreshWalletData() }
                    } label: {
                        Label("Refresh", systemImage: "arrow.clockwise")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)

                    Button {
                        Task { await walletManager.addFunds(amountSats: 100_000) }
                    } label: {
                        Label("Add 0.001 BTC", systemImage: "cart")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                }
                .padding(.horizontal)
            } else {
                Text("No wallet loaded")
            }
            Spacer()
        }
        .padding()
        .navigationTitle("Wallet")
        .alert("Address Copied!", isPresented: $showCopiedAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Your wallet address has been copied to the clipboard.")
        }
        .task {
            await walletManager.refreshWalletData()
        }
    }
    
    private func copyToClipboard(_ text: String) {
        UIPasteboard.general.string = text
        showCopiedAlert = true
    }
}
