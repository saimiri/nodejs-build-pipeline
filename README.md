# Node.js Based Build Pipeline

**Work in progress. The demo doesn't work yet.**

This is an example how plain Node.js scripts can be used to create easy to configure and easy to use build pipelines. It probably is not adequate for large projects and big teams, but for a single developer with smallish projects it works great.

This is not something you can just drop in your project and use, but you can use it as a basis for your own scripts.

## Highlights

  * No need to install Node packages inside the project folder -> keeps your house clean
  * Easy to create your own tasks and workers -> very versatile
  * Plain JavaScript -> simple syntax for configuration and setting up

## Usage

Install globally all the tools you need, ie. ``npm i -g hogan.js``. After that:

  * Define worker functions (see ``src/workers`` for examples)
  * Define settings for them (see ``src/cfg`` for examples)
  * Create new Pipeline
  * Register settings and workers for the pipeline
  * ``Pipeline.run();``

I use ``package.json`` to define build scripts for a project, which I can then run using the command ``npm run myscript``. See ``sample/package.json`` for an example.

``sample/build.js`` is an example script that would create a build pipeline for CSS files.

## Credits

After realizing that Grunt, Gulp and their ilk need to install everything inside the project folder (unless you are willing to mess with links), I decided I need another solution. I stumbled onto Keith Cirkel's article ["Why we should stop using Grunt & Gulp"](http://blog.keithcirkel.co.uk/why-we-should-stop-using-grunt/), and though his solution was not the right fit for me, it steered me into the right direction.

## Disclaimers

### Work in progress

This has been hacked together in a short time **for my own personal use**. Error handling is non-existent and all in all it requires that you understand how the different tools work. You may need to refine the code some to make it work for you.

Still, I use it for client projects and I have not lost any files ~~ever~~ in ``3`` days.

### It's not a real pipeline

If this was a real pipeline, files would be processed sequentially with each task running in parallel. Here the files are lumped together and moved from one task to another, each task processing all the files until passing them on to the next one.

I just like the word.