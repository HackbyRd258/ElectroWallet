//
//  ReceiveView.swift
//  ElectroWallet
//
//  Display receive address
//

import SwiftUI
import CoreImage.CIFilterBuiltins

struct ReceiveView: View {
    @EnvironmentObject var walletManager: WalletManager
    @State private var showCopiedAlert = false
    
    var body: some View {
        VStack(spacing: 24) {
            Text("Scan or share this address to receive Bitcoin testnet coins")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            if let address = walletManager.currentWallet?.address {
                // QR Code
                if let qrImage = generateQRCode(from: address) {
                    Image(uiImage: qrImage)
                        .interpolation(.none)
                        .resizable()
                        .scaledToFit()
                        .frame(width: 200, height: 200)
                        .padding()
                        .background(.white, in: RoundedRectangle(cornerRadius: 12))
                }
                
                // Address Text
                VStack(spacing: 12) {
                    Text("Your Address")
                        .font(.headline)
                    
                    Text(address)
                        .font(.system(.body, design: .monospaced))
                        .multilineTextAlignment(.center)
                        .textSelection(.enabled)
                        .padding()
                        .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 12))
                    
                    Button {
                        copyToClipboard(address)
                    } label: {
                        Label("Copy Address", systemImage: "doc.on.doc")
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                }
            } else {
                Text("No wallet loaded")
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
        .padding()
        .navigationTitle("Receive")
        .alert("Address Copied!", isPresented: $showCopiedAlert) {
            Button("OK", role: .cancel) { }
        } message: {
            Text("Your wallet address has been copied to the clipboard.")
        }
    }
    
    private func generateQRCode(from string: String) -> UIImage? {
        let context = CIContext()
        let filter = CIFilter.qrCodeGenerator()
        filter.message = Data(string.utf8)
        filter.correctionLevel = "M"
        
        guard let outputImage = filter.outputImage else { return nil }
        
        // Scale up the QR code
        let transform = CGAffineTransform(scaleX: 10, y: 10)
        let scaledImage = outputImage.transformed(by: transform)
        
        guard let cgImage = context.createCGImage(scaledImage, from: scaledImage.extent) else {
            return nil
        }
        
        return UIImage(cgImage: cgImage)
    }
    
    private func copyToClipboard(_ text: String) {
        UIPasteboard.general.string = text
        showCopiedAlert = true
    }
}
