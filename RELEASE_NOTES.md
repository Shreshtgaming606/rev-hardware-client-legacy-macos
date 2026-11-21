# REV Hardware Client 2 Legacy Mac v0.1.2

This release recognizes an FTC Control Hub connected by USB and opens the hub’s Robot Controller Console inside the Mac app. The View menu lets you check for the hub again or switch to REV Hardware Client 2.

REV Hardware Client 2 does not list FTC Control Hubs as supported hardware. This launcher uses the official ADB tool from REV’s downloaded app to forward the Control Hub’s web console to the local Mac. It does not alter the Control Hub’s firmware or data.

The Control Hub’s USB connection and web console were verified on an Intel Mac running Sonoma before the hub was disconnected. The new launcher’s ADB detection was tested with the observed device listing and its no-hub path was tested locally. The packaged app and other macOS builds have not been tested with a connected Control Hub.

All six packages retain the original REV icon and loading screen. They are ad hoc signed and not notarized by Apple. This unofficial project is not made, supported, or endorsed by REV Robotics.
