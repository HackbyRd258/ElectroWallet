//
//  TransactionHistoryView.swift
//  ElectroWallet
//
//  Shows recent transactions
//

import SwiftUI

struct TransactionHistoryView: View {
    @EnvironmentObject var walletManager: WalletManager
    
    var body: some View {
        Group {
            if walletManager.transactions.isEmpty {
                VStack(spacing: 16) {
                    Image(systemName: "clock.fill")
                        .font(.system(size: 60))
                        .foregroundColor(.secondary)
                    Text("No Transactions Yet")
                        .font(.headline)
                    Text("Your transaction history will appear here")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                        .multilineTextAlignment(.center)
                }
                .padding()
            } else {
                List {
                    ForEach(walletManager.transactions) { tx in
                        VStack(alignment: .leading, spacing: 8) {
                            HStack {
                                Image(systemName: tx.type == .sent ? "arrow.up.circle.fill" : "arrow.down.circle.fill")
                                    .foregroundColor(tx.type == .sent ? .red : .green)
                                
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(tx.type == .sent ? "Sent" : "Received")
                                        .font(.headline)
                                    
                                    Text(tx.id.prefix(16) + "...")
                                        .font(.caption)
                                        .foregroundColor(.secondary)
                                }
                                
                                Spacer()
                                
                                VStack(alignment: .trailing, spacing: 2) {
                                    Text("\(tx.type == .sent ? "-" : "+")\(tx.amountInBTC, specifier: "%.8f") BTC")
                                        .font(.body)
                                        .fontWeight(.semibold)
                                        .foregroundColor(tx.type == .sent ? .red : .green)
                                    
                                    Text("\(Int64(tx.amountInBTC * 100_000_000)) sats")
                                        .font(.caption2)
                                        .foregroundColor(.secondary)
                                }
                            }
                            
                            HStack {
                                Label(tx.status.rawValue.capitalized, systemImage: tx.status == .confirmed ? "checkmark.circle" : "clock")
                                    .font(.caption2)
                                    .foregroundColor(.secondary)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
        }
        .navigationTitle("History")
        .task {
            await walletManager.refreshWalletData()
        }
    }
}
