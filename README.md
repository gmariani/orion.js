# Orion.js

Orion.js is a branch of [Orion.as](https://github.com/gmariani/orion.as). I refactored the original ActionScript code into JavaScript (circa 2011). At the time there was a huge performance gap between Flash and JavaScript and I had a few benchmarks and demos to showcase the difference. Please check the other repository for more details, I just have links to the JavaScript benchmarks on this repository and the tables for convenience.

## Flash / HTML (Canvas) Benchmark

Here are the specs for my work computer as a reference (2009):

```
MS Windows XP Professional 32-bit SP3
Intel Core 2 Duo E6550  @ 2.33GHz
2.0GB Dual-Channel DDR2 @ 332MHz
256MB ATI Radeon HD 2400 Pro (Dell)
78GB Western Digital WDC WD800ADFS-75SLR2 (IDE)
```

Here are the specs for my work computer as a reference (2017):

```
MS Windows 10 Professional 64-bit
Intel Core i7-4790K @ 4.00GHz
32.0GB DDR3 @ 332MHz
2GB NVidia GeForce GTX 960
250GB Samsung 840 EVO (SATAIII)
```

| Browser                   | Year | Particles (P) | Particles Added Per Render (PPR) |
| ------------------------- | ---- | ------------- | -------------------------------- |
| Firefox 3.6.4             | 2009 | 14,000        | 600                              |
| Chrome 6.0.427.0          | 2009 | 50,000        | 2,100                            |
| Opera 10.60 Beta          | 2009 | 50,000        | 2,100                            |
| Chrome 56.0.2924.87       | 2017 | 685,000       | 26,200                           |
| Flash 10.0.45.2           | 2009 | 260,000       | 11,000                           |
| Flash 10.0.45.2 Debugger  | 2009 | 150,000       | 6,400                            |
| Flash 10.1.53.64          | 2009 | 270,000       | 11,500                           |
| Flash 10.1.53.64 Debugger | 2009 | 225,000       | 9,500                            |
| Flash 24.0.0.194          | 2017 | 1,025,000     | 42,100                           |

_\* All results tested with a minimum FPS of 29_

[HTML (Canvas) Particle Speed Test](/src/index.html)

## Flash / HTML (DOM) Benchmark

| Browser | Year | Particles (P) | Particles Added Per Render (PPR) |
|---------------------------|------|---------------|----------------------------------|
| Firefox 3.6.4 | 2009 | 400 | 20 |
| Chrome 6.0.437.1 | 2009 | 800 | 30 |
| Opera 10.60 Beta | 2009 | 800 | 30 |
| Chrome 56.0.2924.87 | 2017 | 2,240 | 80 |
| Flash 10.0.45.2 | 2009 | 6,000 | 220 |
| Flash 10.0.45.2 Debugger | 2009 | 5,000 | 180 |
| Flash 10.1.53.64 | 2009 | 7,500 | 270 |
| Flash 10.1.53.64 Debugger | 2009 | 6,500 | 230 |

_\* All results tested with a minimum FPS of 29_

[HTML (DOM) Particle Speed Test](/src/htmlTest.html)
