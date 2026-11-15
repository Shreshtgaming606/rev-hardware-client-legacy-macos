# REV Hardware Client 2 Legacy Mac (unofficial)

An independent launcher for running REV Hardware Client 2 on macOS 12 Monterey, 13 Ventura, and 14 Sonoma. This project is not made, supported, or endorsed by REV Robotics.

REV officially supports [macOS 15 Sequoia or newer](https://docs.revrobotics.com/rev-hardware-client-2). These older macOS versions are experimental. Test with noncritical hardware first, and keep a backup before firmware updates.

## Downloads

Choose the ZIP for your macOS version and processor. Apple Silicon and Intel are separate builds. All six builds use the same launcher code; Monterey uses an older Electron version that still runs on macOS 12.

| macOS | Intel | Apple Silicon |
| --- | --- | --- |
| Sonoma 14 | `REV-Hardware-Client-2-Legacy-Sonoma-Intel-v0.1.0.zip` | `REV-Hardware-Client-2-Legacy-Sonoma-Apple-Silicon-v0.1.0.zip` |
| Ventura 13 | `REV-Hardware-Client-2-Legacy-Ventura-Intel-v0.1.0.zip` | `REV-Hardware-Client-2-Legacy-Ventura-Apple-Silicon-v0.1.0.zip` |
| Monterey 12 | `REV-Hardware-Client-2-Legacy-Monterey-Intel-v0.1.0.zip` | `REV-Hardware-Client-2-Legacy-Monterey-Apple-Silicon-v0.1.0.zip` |

Unzip the download and move **REV Hardware Client 2 Legacy Mac.app** to `/Applications`. On first run, the launcher downloads the unmodified REV Hardware Client 2 app directly from REV Robotics, checks its code signature, and uses its local backend and interface. It also installs Eclipse Temurin Java 25 in the user's Application Support folder if Java 25 is not already installed. The initial download is several hundred megabytes. An Internet connection is needed for the first run and for REV's update/download features.

The launcher does **not** host or redistribute REV's application files. The files it obtains from REV remain in `~/Library/Application Support/REV Hardware Client 2 Legacy Mac/vendor`. Temurin files remain in the same Application Support folder. No device firmware is changed by installing or opening the launcher.

## Support status

The Sonoma Intel build is the only platform available for local testing so far. Ventura, Monterey, and Apple Silicon builds require on-device testing before they can be called compatible. In particular, device detection and recovery mode have not been validated on those systems. This is an experimental community build and may have limitations that REV's supported app does not.

These packages are ad hoc signed and are **not notarized by Apple**. They should not be represented as official or fully supported releases.

## Build

On a Mac with Xcode command line tools, run `npm run build -- sonoma-x64`, or use one of `sonoma-arm64`, `ventura-x64`, `ventura-arm64`, `monterey-x64`, `monterey-arm64`. The build script downloads Electron from the Electron project's official GitHub release and creates a ZIP in `dist/`. It does not include REV's binary files.

Only the launcher code in this repository is licensed under MIT. REV Hardware Client 2 belongs to REV Robotics. Eclipse Temurin and Electron carry their own licenses.
