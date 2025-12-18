//
//  SendView.swift
//  ElectroWallet
//
//  Send BTC
//

import SwiftUI

struct SendView: View {
    @EnvironmentObject var walletManager: WalletManager
    @State private var toAddress: String = ""
    @State private var amountBTC: String = ""
    @State private var statusMessage: String?
    @State private var isError = false
    @State private var isSending = false
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Recipient")) {
                    TextField("Testnet address", text: $toAddress)
                        .textInputAutocapitalization(.never)
                        .disableAutocorrection(true)
                }
                
                Section(header: Text("Amount (BTC)")) {
                    TextField("0.00010000", text: $amountBTC)
                        .keyboardType(.decimalPad)
                    
                    if let amount = Double(amountBTC) {
                        Text("\(Int64(amount * 100_000_000)) satoshis")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
                
                if let wallet = walletManager.currentWallet {
                    Section(header: Text("Available Balance")) {
                        Text("\(wallet.balanceInBTC, specifier: "%.8f") BTC")
                            .foregroundColor(.secondary)
                    }
                }
                
                if let status = statusMessage {
                    Section {
                        Text(status)
                            .foregroundColor(isError ? .red : .green)
                    }
                }
                
                Button {
                    Task { await send() }
                } label: {
                    Label("Send", systemImage: "paperplane.fill")
                        .frame(maxWidth: .infinity)
                }
                .disabled(isSending || !isValidInput)
            }
            .navigationTitle("Send")
        }
    }
    
    private var isValidInput: Bool {
        guard !toAddress.isEmpty, let amount = Double(amountBTC), amount > 0 else { return false }
        return true
    }
    
    private func send() async {
        guard let amount = Double(amountBTC), amount > 0 else {
            statusMessage = "Please enter a valid amount greater than 0"
            isError = true
            return
        }
        
        let satoshis = Int64(amount * 100_000_000)
        
        // Check if balance is sufficient
        if let wallet = walletManager.currentWallet {
            if satoshis > Int64(wallet.balanceInBTC * 100_000_000) {
                statusMessage = "Insufficient balance. You only have \(wallet.balanceInBTC, specifier: "%.8f") BTC available."
                isError = true
                return
            }
        }
        
        isSending = true
        statusMessage = "Sending transaction..."
        isError = false
        
        do {
            let txHash = try await walletManager.sendBitcoin(to: toAddress, amount: satoshis)
            statusMessage = "✓ Transaction sent successfully! Hash: \(txHash.prefix(16))..."
            isError = false
            toAddress = ""
            amountBTC = ""
        } catch {
            let errorMsg = error.localizedDescription
            if errorMsg.contains("invalid address") || errorMsg.contains("address") {
                statusMessage = "Invalid recipient address. Please check and try again."
            } else if errorMsg.contains("insufficient") || errorMsg.contains("balance") {
                statusMessage = "Insufficient balance to complete this transaction."
            } else if errorMsg.contains("network") || errorMsg.contains("connection") {
                statusMessage = "Network error. Please check your connection and try again."
            } else {
                statusMessage = "Error: \(errorMsg)"
            }
            isError = true
        }
        isSending = false
    }
}
