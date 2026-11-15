# REV Hardware Client 2 Legacy Mac v0.1.0

Unofficial, experimental launcher for macOS Monterey 12, Ventura 13, and Sonoma 14. Choose the ZIP matching your macOS version and processor, unzip it, and move the app to `/Applications`.

The launcher downloads REV Hardware Client 2 1.4.6 from REV Robotics on first run and verifies REV's code signature. It downloads and checks Eclipse Temurin Java 25 when needed. These release assets do not include REV's application files.

Testing: on an Intel Mac running Sonoma, the backend started with Oracle Java 25 and the downloaded Eclipse Temurin Java 25, and its local web interface rendered. The packaged Electron window and hardware functions are not fully tested. Monterey, Ventura, and Apple Silicon packages have been built and inspected, but have not been run on those systems. Device detection, ADB, firmware updates, and recovery mode are unverified.

The launcher is ad hoc signed and is not notarized by Apple. This project is not made, supported, or endorsed by REV Robotics. [REV's supported Mac release requires macOS 15 or newer](https://docs.revrobotics.com/rev-hardware-client-2).
