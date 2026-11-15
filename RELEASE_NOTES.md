# REV Hardware Client 2 Legacy Mac v0.1.1

This update restores the original orange REV icon in all six macOS downloads, adds a loading screen with live setup status, and handles an orphaned REV service left behind by a removed app that previously caused a "Multiple RHC instances detected" dialog on Sonoma.

Unofficial, experimental launcher for macOS Monterey 12, Ventura 13, and Sonoma 14. Choose the ZIP matching your macOS version and processor, unzip it, and move the app to `/Applications`.

The launcher downloads REV Hardware Client 2 1.4.6 from REV Robotics on first run and verifies REV's code signature. It downloads and checks Eclipse Temurin Java 25 when needed. These release assets contain REV's app icon, but not REV's executable or backend.

Testing: on an Intel Mac running Sonoma, the packaged app opened the REV hardware screen on two consecutive launches without the duplicate-instance dialog. Closing the app stopped its Java service. The backend also started with Oracle Java 25 and the downloaded Eclipse Temurin Java 25. Monterey, Ventura, and Apple Silicon packages have been built and inspected, but have not been run on those systems. Device detection, ADB, firmware updates, and recovery mode are unverified.

Known issue: Telemetry's AdvantageScope pane displayed “Resource not found” during the Sonoma check.

The launcher is ad hoc signed and is not notarized by Apple. This project is not made, supported, or endorsed by REV Robotics. [REV's supported Mac release requires macOS 15 or newer](https://docs.revrobotics.com/rev-hardware-client-2).
