# yamaha-sound-program-by-source

Instead of having to manually change the sound program when you're switching from e.g. TV to Spotify and vice verse, let the computer do it for you.

When the input source of your Yamaha receiver changes, the sound program and clear voice settings are automatically changed.

## Usage

Specify the following env variables before running `index.js`

    YAMAHA_IP # The ip address to your receiver
    LOCAL_IP # Your local ip address to use, 0.0.0.0 could work in some setups
    PORT # Port listening for events from the receiver, defaults to 41100

Example

    YAMAHA_IP=192.168.1.216 LOCAL_IP=192.168.1.187 node .

## Misc

Currently the following mappings from source to sound program are hard coded

    tv => tv_program with clear_voice enabled
    bd_dvd => tv_program with clear_voice enabled
    spotify => music with clear_voice disabled
    airplay => music with clear_voice disabled

# References

http://habitech.s3.amazonaws.com/PDFs/YAM/MusicCast/Yamaha%20MusicCast%20HTTP%20simplified%20API%20for%20ControlSystems.pdf

https://www.pdf-archive.com/2017/04/21/yxc-api-spec-advanced/yxc-api-spec-advanced.pdf
