# King of Glory (The Gates of Hades)

A song and code-rendered lyric film of Christ's descent into Hades on Holy Saturday: the sealed tomb above, the light that comes down into the place of the dead, the gates of brass broken, Satan bound, and Adam, Eve and the righteous led out. The picture follows the Orthodox icon of the Resurrection, the Anastasis.

Built with the Ark engine: https://github.com/omiron33/ark-video-studio

[Listen at TechnoChristianity](https://technochristianity.com/music) · [More films on YouTube](https://www.youtube.com/@technochristianity)

The film runs **7:16** at **1920 × 1080 / 60 fps** in 73 scenes, every frame drawn in code on the GPU with 64 jittered sub-frames per frame: the gates of Hades seen from inside, the sealed tomb on the night of the Sabbath, the light coming down through the tiers of the dead, Satan and the seated colossus of Hades, the saints, the gates bowing and bursting inward under the King of Glory, Satan bound, Adam and Eve raised by the wrist, and the procession out of death into the Paschal dawn. Nothing in the picture is a photograph, a downloaded model or a generated image. The words are part of each world: cast in the brass of the gates, cut into stone, poured full of light in the floor of Hades. No person has a face: Christ is light, the mandorla and vestments, and people are silhouettes.

## Quick start

Install Node.js 22 or later, Google Chrome and FFmpeg (`ffmpeg` and `ffprobe` on your PATH), then:

```sh
npm ci
npm run validate
npm run still -- --scene s01-sabbath --time 12 --samples 2
```

The still appears in `out/portable/stills/`. No recording is needed for stills or scene clips. Set the `CHROME` environment variable if Chrome is installed outside the platform's usual location.

For the film, place the original 48 kHz stereo recording at `media/song.wav` and run:

```sh
npm run render -- --draft
npm run render
```

See [Rendering](docs/RENDERING.md) for the recording's checksum, caching and quality settings.

## What is here

- `film.json`: scene order and timings, cut on measured beats.
- `scenes/`: one picture module per scene, with its words drawn in the scene.
- `lib/`: the film's worlds (the gates and hall of Hades, the tomb, the abyss of tiers, the thief's passage, the dawn garden), the shared look, the lens, figures and the glory.
- `data/`: aligned sung words and lines, and measured musical timing.
- `renderer/`: deterministic browser rendering and local FFmpeg encoding.
- `tools/`: rendering, validation, timing and storyboard utilities.
- `intake/sung-lyrics.txt`: the sung lyric text.

[Storyboard](docs/STORYBOARD.md) · [Rendering](docs/RENDERING.md)

## License

Source code is released under the [MIT License](LICENSE). Fonts retain their SIL Open Font License notices. The song recording and the finished film are separate media releases; the source-code license does not grant any rights to the recording, its lyrics as a recorded work, or the rendered film.
