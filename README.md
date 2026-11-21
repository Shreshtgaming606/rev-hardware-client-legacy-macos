# REV Hardware Client 2 Legacy Mac (unofficial)

An independent launcher for running REV Hardware Client 2 on macOS 12 Monterey, 13 Ventura, and 14 Sonoma. When an FTC Control Hub is connected by USB, it opens the hub’s Robot Controller Console through ADB. This project is not made, supported, or endorsed by REV Robotics.

REV officially supports [macOS 15 Sequoia or newer](https://docs.revrobotics.com/rev-hardware-client-2). These older macOS versions are experimental. Test with noncritical hardware first, and keep a backup before firmware updates.

## Downloads

Choose the ZIP for your macOS version and processor. Apple Silicon and Intel are separate builds. All six builds use the same launcher code; Monterey uses an older Electron version that still runs on macOS 12.

[View the v0.1.2 pre-release and checksums](https://github.com/Shreshtgaming606/rev-hardware-client-legacy-macos/releases/tag/v0.1.2).

| macOS | Intel | Apple Silicon |
| --- | --- | --- |
| Sonoma 14 | [Download ZIP](https://github.com/Shreshtgaming606/rev-hardware-client-legacy-macos/releases/download/v0.1.2/REV-Hardware-Client-2-Legacy-Sonoma-Intel-v0.1.2.zip) | [Download ZIP](https://github.com/Shreshtgaming606/rev-hardware-client-legacy-macos/releases/download/v0.1.2/REV-Hardware-Client-2-Legacy-Sonoma-Apple-Silicon-v0.1.2.zip) |
| Ventura 13 | [Download ZIP](https://github.com/Shreshtgaming606/rev-hardware-client-legacy-macos/releases/download/v0.1.2/REV-Hardware-Client-2-Legacy-Ventura-Intel-v0.1.2.zip) | [Download ZIP](https://github.com/Shreshtgaming606/rev-hardware-client-legacy-macos/releases/download/v0.1.2/REV-Hardware-Client-2-Legacy-Ventura-Apple-Silicon-v0.1.2.zip) |
| Monterey 12 | [Download ZIP](https://github.com/Shreshtgaming606/rev-hardware-client-legacy-macos/releases/download/v0.1.2/REV-Hardware-Client-2-Legacy-Monterey-Intel-v0.1.2.zip) | [Download ZIP](https://github.com/Shreshtgaming606/rev-hardware-client-legacy-macos/releases/download/v0.1.2/REV-Hardware-Client-2-Legacy-Monterey-Apple-Silicon-v0.1.2.zip) |

Unzip the download and move **REV Hardware Client 2 Legacy Mac.app** to `/Applications`. On first run, the launcher downloads the unmodified REV Hardware Client 2 app directly from REV Robotics, checks its code signature, and uses its local backend and interface. It also installs Eclipse Temurin Java 25 in the user's Application Support folder if Java 25 is not already installed. The initial download is several hundred megabytes. An Internet connection is needed for the first run and for REV's update/download features.

The ZIPs contain this launcher, Electron, and REV's original app icon. REV's executable and backend are downloaded from REV Robotics on first run and remain in `~/Library/Application Support/REV Hardware Client 2 Legacy Mac/vendor`. Temurin files remain in the same Application Support folder. No device firmware is changed by installing or opening the launcher.

## Support status

On an Intel Mac running Sonoma, the packaged app opened the REV hardware screen on two consecutive launches without the duplicate-instance dialog. Closing the app stopped its Java service. The backend also started with both Oracle Java 25 and the downloaded Eclipse Temurin Java 25. Ventura, Monterey, and Apple Silicon builds have only been built and inspected; they require on-device testing before they can be called compatible. Device detection, ADB, firmware updates, and recovery mode have not been validated for these packages. This is an experimental community build and may have limitations that REV's supported app does not.

During the Sonoma check, Telemetry's AdvantageScope pane displayed “Resource not found.” That feature has not been validated in this launcher.

The launcher reuses a running REV service when its interface is available. If a removed app leaves an orphaned REV service, the launcher stops that stale process before starting its own service.

While the service starts, a loading screen shows the REV icon and the current setup step. At launch, the app checks for an FTC Control Hub on USB and opens its Robot Controller Console when found. Use **View → Open FTC Control Hub Console** to check again after connecting it, or **View → Open REV Hardware Client 2** to switch back.

These packages are ad hoc signed and are **not notarized by Apple**. They should not be represented as official or fully supported releases.

## Build

On a Mac with Xcode command line tools, run `npm run build -- sonoma-x64`, or use one of `sonoma-arm64`, `ventura-x64`, `ventura-arm64`, `monterey-x64`, `monterey-arm64`. The build script downloads Electron from the Electron project's official GitHub release and creates a ZIP in `dist/`. It does not include REV's binary files.

Only the launcher code in this repository is licensed under MIT. The [REV icon](assets/NOTICE.md) and REV Hardware Client 2 belong to REV Robotics. Eclipse Temurin and Electron carry their own licenses.

REV Hardware Client 2 does not list FTC Control Hubs among its supported devices. The Control Hub Console is the hub’s own web interface, available over the app’s local ADB USB tunnel. This launcher does not add FTC device support to REV Hardware Client 2 or perform firmware updates on the Control Hub.
