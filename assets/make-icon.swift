import AppKit
let size = 1024
let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: size, pixelsHigh: size, bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true, isPlanar: false, colorSpaceName: .deviceRGB, bytesPerRow: 0, bitsPerPixel: 0)!
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
let frame = NSRect(x: 12, y: 12, width: 1000, height: 1000)
let rounded = NSBezierPath(roundedRect: frame, xRadius: 220, yRadius: 220)
NSGradient(starting: NSColor(calibratedRed: 1, green: 0.48, blue: 0.09, alpha: 1), ending: NSColor(calibratedRed: 0.76, green: 0.20, blue: 0.04, alpha: 1))!.draw(in: rounded, angle: 90)
let number = NSAttributedString(string: "2", attributes: [.font: NSFont.systemFont(ofSize: 620, weight: .heavy), .foregroundColor: NSColor.white])
let nSize = number.size()
number.draw(at: NSPoint(x: (1024-nSize.width)/2, y: 260))
let label = NSAttributedString(string: "LEGACY MAC", attributes: [.font: NSFont.systemFont(ofSize: 80, weight: .bold), .foregroundColor: NSColor.white])
let lSize = label.size()
label.draw(at: NSPoint(x: (1024-lSize.width)/2, y: 205))
NSGraphicsContext.restoreGraphicsState()
let png = rep.representation(using: .png, properties: [:])!
try png.write(to: URL(fileURLWithPath: CommandLine.arguments[1]))
