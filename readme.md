# Nstrumenta project example for code, data and sandbox use, including active commit webhook to GitHub.

## Set up the project and link to the code repository
1. Fork this repository so you can make edits
2. Create a new project on https://nstrumenta.com
3. Add the repository you created to your project
![image](https://user-images.githubusercontent.com/41758588/123736482-0bb30200-d856-11eb-8f1c-634953fbffa4.png)

4. Add the nstrumenta app to your repository in the github web interface:
https://github.com/apps/nstrumenta-github

![image](https://user-images.githubusercontent.com/41758588/137569132-f530c38b-902b-4d53-ba46-e8547c0386df.png)

![image](https://user-images.githubusercontent.com/41758588/137569141-5ec69276-5c7c-4375-896f-6d98af2b3ccf.png)

## Record Data
1. Open the Record page in your nstrumenta project
![image](https://user-images.githubusercontent.com/41758588/123739589-bb3ea300-d85b-11eb-8eac-8ed537c47ef4.png)
2. Configure inputs to record, for this example, open nstrumenta from a mobile phone and select the Device Motion input to record the inertial sensors on your device.
3. Click 'Start Recording', wave the device around to make an interesting log, and then click Stop Recording to finish the log

## View Data
1. Your recording will be listed in the Data page in your nstrumenta project
2. Clicking on the name will open a time series plot
![image](https://user-images.githubusercontent.com/41758588/123737404-c263b200-d857-11eb-978c-5ab62d52ffbc.png)

## Add a Sandbox
1. Clone your project locally and open in VS Code
2. Install the nstrumenta-vscode plugin
 ![image](https://user-images.githubusercontent.com/41758588/137570326-5cf6868b-feda-4e60-ae3b-539f712c78c8.png)

3. While you have the VS Code window open, also open your nstrumenta project
4. Initialize the connection tp VS Code by clicking on the VS Code logo in the top right and selecting 'init'  ![image](https://user-images.githubusercontent.com/41758588/137570387-e266d339-607e-4547-a69b-cdc4286e9b3e.png)
5. If connected the VS Code will change to a color from grey (you can test the connection with 'ping' from the same window) ![image](https://user-images.githubusercontent.com/41758588/137570488-3f801f41-3606-446f-a65c-433d1b4ca137.png)
6.  Open the Command Pallete (Ctrl/Cmd)+Shift+P
7.  Enter the command nstrumenta: update  ![image](https://user-images.githubusercontent.com/41758588/137570398-a1aa82c9-1b6e-4429-b5fd-7cc7d3e91a5f.png)

## Making a commit in your repository will also trigger an update from GitHub
1. Edit a file, for example add a line to the Readme.md and commit
