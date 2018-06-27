# Setup

Video in action: https://youtu.be/z2gAW0zF6Ow

Uses Johnny-five to control an LED strip with an arduino. 

You can use interchange to flash node-pixel firmata to your arduino and then run `npm run start`
The script assumes the arduino is on COM3, change it for the correct serial port if it is at a different location (eg: `/dev/ttyACM0`)

The script assumes 44 3-pin LEDs controlled by pin 6 of the arduino. This was the strip I got and trimmed to size: https://www.amazon.com/gp/product/B00VQ0D2TY


```
npm install -g nodebots-interchange
interchange install git+https://github.com/ajfisher/node-pixel -a uno --firmata
```

Tested working on Windows and Linux, needs some OS specific tweaks for multi-monitor setups.

The script is limsited to around 8hz, any higher and it gets a bit flakey. It could improved by using johnny five with an I2C backpack, to allow more LEDs and a higher update rate (left as an exercise for the reader)